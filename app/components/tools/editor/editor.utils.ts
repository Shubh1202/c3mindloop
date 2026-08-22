import { StandardFonts } from 'pdf-lib';
import type { FontFamily, PdfFile, RotationDeg, PageMeta } from './editor.types';

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export async function getPageCount(file: File): Promise<number | null> {
  try {
    const { PDFDocument } = await import('pdf-lib');
    const buf = await file.arrayBuffer();
    const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
    return pdf.getPageCount();
  } catch {
    return null;
  }
}

export async function makePdfFile(file: File): Promise<PdfFile> {
  return {
    id: uid(),
    file,
    name: file.name,
    sizeBytes: file.size,
    pageCount: await getPageCount(file),
  };
}

/** Build default PageMeta array for a freshly loaded PDF.
 *  rotation starts at 0 — it stores only the USER's additional rotation delta.
 *  The page's native /Rotate is handled automatically in renderPageToCanvas via page.rotate. */
export async function buildPageMetas(file: File, pageCount: number): Promise<PageMeta[]> {
  return Array.from({ length: pageCount }, (_, i) => ({
    originalIndex: i,
    rotation: 0 as RotationDeg,
    deleted: false,
  }));
}

/** hex → { r, g, b } each in 0–1 range for pdf-lib */
export function hexToRgb01(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
  };
}

export const FONT_MAP: Record<FontFamily, (typeof StandardFonts)[keyof typeof StandardFonts]> = {
  sans: StandardFonts.Helvetica,
  serif: StandardFonts.TimesRoman,
  mono: StandardFonts.Courier,
};

/**
 * Returns the correct pdf-lib StandardFont for a given family + bold/italic combination.
 * Underline is not a font variant- it is drawn separately as a line.
 */
export function resolvePdfFont(
  family: FontFamily,
  bold: boolean,
  italic: boolean,
): (typeof StandardFonts)[keyof typeof StandardFonts] {
  if (family === 'sans') {
    if (bold && italic) return StandardFonts.HelveticaBoldOblique;
    if (bold)           return StandardFonts.HelveticaBold;
    if (italic)         return StandardFonts.HelveticaOblique;
    return StandardFonts.Helvetica;
  }
  if (family === 'serif') {
    if (bold && italic) return StandardFonts.TimesRomanBoldItalic;
    if (bold)           return StandardFonts.TimesRomanBold;
    if (italic)         return StandardFonts.TimesRomanItalic;
    return StandardFonts.TimesRoman;
  }
  // mono- Courier
  if (bold && italic) return StandardFonts.CourierBoldOblique;
  if (bold)           return StandardFonts.CourierBold;
  if (italic)         return StandardFonts.CourierOblique;
  return StandardFonts.Courier;
}

export const FONT_CSS: Record<FontFamily, string> = {
  sans: 'Helvetica, Arial, sans-serif',
  serif: 'Times New Roman, serif',
  mono: 'Courier New, monospace',
};

export function downloadBlob(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Render a single PDF page to a canvas element via pdfjs-dist */
export async function renderPageToCanvas(
  source: File | Uint8Array,
  pageIndex: number,  // 0-based
  canvas: HTMLCanvasElement,
  zoom: number,
  fitWidth = 480,
  userRotation = 0,   // user-applied rotation, added on top of PDF's native /Rotate
): Promise<{ w: number; h: number }> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  let fileUrl: string | null = null;
  let loadingTask;

  if (source instanceof Uint8Array) {
    loadingTask = pdfjsLib.getDocument({ data: source.slice() });
  } else {
    fileUrl = URL.createObjectURL(source);
    loadingTask = pdfjsLib.getDocument({ url: fileUrl });
  }

  try {
    const pdfDoc = await loadingTask.promise;
    const safeNum = Math.min(Math.max(1, pageIndex + 1), pdfDoc.numPages);
    const page = await pdfDoc.getPage(safeNum);

    // Always combine the page's native /Rotate with the user-applied rotation delta.
    // PageMeta.rotation stores ONLY the user's additional rotation (starts at 0).
    // page.rotate is the PDF's native rotation. Adding them gives the correct total.
    const totalRotation = ((page.rotate ?? 0) + userRotation) % 360;
    console.debug(`[renderPageToCanvas] page ${pageIndex}: page.rotate=${page.rotate}, userRotation=${userRotation}, totalRotation=${totalRotation}`);

    const baseViewport = page.getViewport({ scale: 1.0, rotation: totalRotation });
    const fitScale = fitWidth / baseViewport.width;
    const viewport = page.getViewport({ scale: fitScale * zoom, rotation: totalRotation });

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    // pdfjs-dist v6 preferred API: pass `canvas` directly.
    // If using `canvasContext`, canvas must be null — passing both the element
    // and the context simultaneously causes incorrect / mirrored rendering.
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvas, viewport }).promise;

    return { w: canvas.width, h: canvas.height };
  } finally {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
  }
}

/** Render a page to an off-screen canvas and return a thumbnail data-URL */
export async function renderPageThumbnail(
  file: File,
  pageIndex: number,
  thumbWidth = 80,
  userRotation = 0,
): Promise<string | null> {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    const fileUrl = URL.createObjectURL(file);
    try {
      const pdfDoc = await pdfjsLib.getDocument({ url: fileUrl }).promise;
      const safeNum = Math.min(Math.max(1, pageIndex + 1), pdfDoc.numPages);
      const page = await pdfDoc.getPage(safeNum);
      // Combine PDF native /Rotate with user delta (same logic as renderPageToCanvas)
      const rotation = ((page.rotate ?? 0) + userRotation) % 360;
      const base = page.getViewport({ scale: 1.0, rotation });
      const scale = thumbWidth / base.width;
      const vp = page.getViewport({ scale, rotation });

      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(vp.width);
      canvas.height = Math.floor(vp.height);
      // pdfjs-dist v6 preferred API: pass `canvas` directly (no canvasContext).
      const ctx2d = canvas.getContext('2d')!;
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, viewport: vp }).promise;
      return canvas.toDataURL('image/jpeg', 0.7);
    } finally {
      URL.revokeObjectURL(fileUrl);
    }
  } catch {
    return null;
  }
}
