import { PDFDocument, rgb, degrees } from 'pdf-lib';
import type { PDFPage } from 'pdf-lib';
import type { Overlay, PageMeta, FormField, CutoutOverlay } from './editor.types';
import { hexToRgb01, FONT_MAP, resolvePdfFont, downloadBlob } from './editor.utils';

// ── Helpers ───────────────────────────────────────────────────────────────────

function applyCoverRect(page: PDFPage, overlay: CutoutOverlay): void {
  // v1: draws a solid white rectangle over the source region.
  page.drawRectangle({
    x:      overlay.srcPdfX,
    y:      overlay.srcPdfY,
    width:  overlay.srcPdfW,
    height: overlay.srcPdfH,
    color:  rgb(1, 1, 1),
    opacity: 1,
  });
}

/**
 * Applies all overlays + page mutations to the source PDF and returns the
 * resulting bytes.  Does NOT trigger a download- caller decides what to do.
 */
export async function buildEditedPdf(
  sourceFile: File,
  overlays: Overlay[],
  pageMetas: PageMeta[],
  formFields: FormField[],
): Promise<Uint8Array> {
  const buf = await sourceFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  // ── 1. Apply AcroForm field values ────────────────────────────────────────
  const form = pdfDoc.getForm();
  for (const field of formFields) {
    try {
      if (field.type === 'text') {
        form.getTextField(field.name).setText(field.value);
      } else if (field.type === 'checkbox') {
        const cb = form.getCheckBox(field.name);
        field.value === 'true' ? cb.check() : cb.uncheck();
      } else if (field.type === 'dropdown') {
        form.getDropdown(field.name).select(field.value);
      }
    } catch {
      // field may not exist in this PDF- skip silently
    }
  }

  // ── 2. Apply overlays page-by-page ────────────────────────────────────────
  for (const overlay of overlays) {
    const pageIdx = overlay.pageIndex;
    if (pageIdx < 0 || pageIdx >= pages.length) continue;
    const page = pages[pageIdx];
    const { width: pw, height: ph } = page.getSize();

    if (overlay.kind === 'text') {
      const font = await pdfDoc.embedFont(
        resolvePdfFont(overlay.fontFamily, !!overlay.bold, !!overlay.italic)
      );
      const { r, g, b } = hexToRgb01(overlay.color);
      // overlay.x/y are top-left fractions; pdf-lib Y is bottom-up from page bottom
      const pdfX = overlay.x * pw;
      const pdfY = (1 - overlay.y) * ph - overlay.fontSize;
      page.drawText(overlay.text, {
        x: pdfX,
        y: pdfY,
        size: overlay.fontSize,
        font,
        color: rgb(r, g, b),
        opacity: overlay.opacity,
      });

      // Underline: draw a line below the text baseline
      if (overlay.underline && overlay.text) {
        const textWidth = font.widthOfTextAtSize(overlay.text, overlay.fontSize);
        const underlineY = pdfY - overlay.fontSize * 0.12;
        page.drawLine({
          start: { x: pdfX, y: underlineY },
          end:   { x: pdfX + textWidth, y: underlineY },
          thickness: Math.max(0.5, overlay.fontSize * 0.06),
          color: rgb(r, g, b),
          opacity: overlay.opacity,
        });
      }
    }

    if (overlay.kind === 'whiteout') {
      const rx = overlay.x * pw;
      const ry = (1 - overlay.y - overlay.height) * ph;
      const rw = overlay.width * pw;
      const rh = overlay.height * ph;
      // Draw white rectangle to cover original content
      page.drawRectangle({ x: rx, y: ry, width: rw, height: rh, color: rgb(1, 1, 1), opacity: 1 });

      // Optionally draw replacement text on top
      if (overlay.replacementText) {
        const ff = overlay.replacementFontFamily ?? 'sans';
        const fs = overlay.replacementFontSize ?? 12;
        const col = overlay.replacementColor ?? '#000000';
        const font = await pdfDoc.embedFont(FONT_MAP[ff]);
        const { r, g, b } = hexToRgb01(col);
        page.drawText(overlay.replacementText, {
          x: rx + 2,
          y: ry + rh / 2 - fs * 0.35,
          size: fs,
          font,
          color: rgb(r, g, b),
        });
      }
    }

    if (overlay.kind === 'image' || overlay.kind === 'signature') {
      const dataUrl = overlay.dataUrl;
      const base64 = dataUrl.split(',')[1];
      const imgBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const isJpeg = dataUrl.startsWith('data:image/jpeg');
      const embedded = isJpeg
        ? await pdfDoc.embedJpg(imgBytes)
        : await pdfDoc.embedPng(imgBytes);

      const ix = overlay.x * pw;
      const iw = overlay.width * pw;
      const ih = overlay.height * ph;
      const iy = (1 - overlay.y - overlay.height) * ph;

      page.drawImage(embedded, {
        x: ix,
        y: iy,
        width: iw,
        height: ih,
        opacity: overlay.opacity,
      });
    }

    if (overlay.kind === 'cutout') {
      try {
        const srcPage  = pages[overlay.srcPageIndex];
        const destPage = pages[overlay.pageIndex];
        if (!srcPage || !destPage) continue;

        const { width: dw, height: dh } = destPage.getSize();

        const boundingBox = {
          left:   overlay.srcPdfX,
          bottom: overlay.srcPdfY,
          right:  overlay.srcPdfX + overlay.srcPdfW,
          top:    overlay.srcPdfY + overlay.srcPdfH,
        };

        // embedPage copies the page content stream into a Form XObject — no rasterization
        const xobj = await pdfDoc.embedPage(srcPage, boundingBox);

        // Destination rect: canvas-fraction → PDF-points, Y axis flipped
        const dx  =  overlay.x * dw;
        const dy  = (1 - overlay.y - overlay.height) * dh;
        const dw2 =  overlay.width  * dw;
        const dh2 =  overlay.height * dh;

        // Cover the source region BEFORE stamping the destination
        applyCoverRect(destPage, overlay);

        // drawPage writes a cm (transformation matrix) operator — no rasterization
        destPage.drawPage(xobj, { x: dx, y: dy, width: dw2, height: dh2, opacity: overlay.opacity });
      } catch (err: any) {
        throw new Error(
          `Cut & Move export failed: the source region could not be embedded as vector content. ` +
          `Try redrawing the selection. (${err?.message ?? 'unknown error'})`,
        );
      }
      continue;
    }
  }

  // ── 3. Apply page-level mutations (rotation, deletion, reorder) ───────────
  const activeMetas = pageMetas.filter(m => !m.deleted);

  // Build a new document with pages in the desired order + rotations
  const outDoc = await PDFDocument.create();

  // Copy AcroForm if present (best-effort)
  try {
    const acroForm = (pdfDoc.catalog as any).lookup(
      (pdfDoc.catalog as any).get('AcroForm'),
    );
    if (acroForm) {
      // pdf-lib doesn't expose a direct copyForm API; we rely on copyPages
      // which carries field widgets along with the page.
    }
  } catch { /* ignore */ }

  const copiedPages = await outDoc.copyPages(
    pdfDoc,
    activeMetas.map(m => m.originalIndex),
  );

  copiedPages.forEach((p, i) => {
    outDoc.addPage(p);
    const userRot = activeMetas[i].rotation;
    const nativeRot = p.getRotation().angle;
    const totalRot = (nativeRot + userRot) % 360;
    p.setRotation(degrees(totalRot));
  });

  return outDoc.save({ useObjectStreams: true });
}

/** Convenience: build + trigger browser download */
export async function exportEditedPdf(
  sourceFile: File,
  overlays: Overlay[],
  pageMetas: PageMeta[],
  formFields: FormField[],
): Promise<Uint8Array> {
  const bytes = await buildEditedPdf(sourceFile, overlays, pageMetas, formFields);
  downloadBlob(bytes, `edited-${sourceFile.name}`);
  return bytes;
}

/** Detect AcroForm fields in a PDF */
export async function detectFormFields(file: File) {
  const { PDFDocument: PD } = await import('pdf-lib');
  const buf = await file.arrayBuffer();
  const pdfDoc = await PD.load(buf, { ignoreEncryption: true });
  const form = pdfDoc.getForm();
  const fields = form.getFields();

  return fields.map(f => {
    const name = f.getName();
    const constructor = f.constructor.name;
    let type: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'unknown' = 'unknown';
    let value = '';
    let options: string[] | undefined;

    try {
      if (constructor === 'PDFTextField') {
        type = 'text';
        value = (f as any).getText() ?? '';
      } else if (constructor === 'PDFCheckBox') {
        type = 'checkbox';
        value = String((f as any).isChecked());
      } else if (constructor === 'PDFRadioGroup') {
        type = 'radio';
        value = (f as any).getSelected() ?? '';
        options = (f as any).getOptions() ?? [];
      } else if (constructor === 'PDFDropdown') {
        type = 'dropdown';
        value = (f as any).getSelected()?.[0] ?? '';
        options = (f as any).getOptions() ?? [];
      }
    } catch { /* ignore */ }

    return { name, type, value, options };
  });
}
