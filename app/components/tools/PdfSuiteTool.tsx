'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  FileText, Upload, Trash2, ArrowUp, ArrowDown, Download,
  Merge, Scissors, Minimize2 as CompressIcon, ShieldCheck,
  AlertCircle, CheckCircle2, Loader2, Info, X, GripVertical, Eye,
  Maximize2, Minimize2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
  Pencil, Type, Palette, Undo2, Move,
} from 'lucide-react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// ── Types ────────────────────────────────────────────────────────────────────

interface PdfFile {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  pageCount: number | null;
}

type ActiveTab = 'merge' | 'compress' | 'split' | 'edit';
type CompressionPreset = 'basic' | 'strong';

// ── Edit PDF Types ───────────────────────────────────────────────────────────

interface TextOverlay {
  id: string;
  text: string;
  x: number;           // fraction 0-1 of page width
  y: number;           // fraction 0-1 of page height
  fontSize: number;
  fontFamily: 'sans' | 'serif' | 'mono';
  color: string;       // hex
  opacity: number;     // 0-1
  pageIndex: number;   // 0-based
}

const FONT_FAMILIES = [
  { id: 'sans' as const, label: 'Sans-serif', css: 'Helvetica, Arial, sans-serif' },
  { id: 'serif' as const, label: 'Serif', css: 'Times New Roman, serif' },
  { id: 'mono' as const, label: 'Monospace', css: 'Courier New, monospace' },
];

const COLOR_PALETTE = [
  '#000000', '#FFFFFF', '#EF4444', '#F97316', '#EAB308',
  '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280',
];

const FONT_MAP: Record<string, typeof StandardFonts[keyof typeof StandardFonts]> = {
  sans: StandardFonts.Helvetica,
  serif: StandardFonts.TimesRoman,
  mono: StandardFonts.Courier,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

async function getPageCount(file: File): Promise<number | null> {
  try {
    const buf = await file.arrayBuffer();
    const pdf = await PDFDocument.load(buf, { ignoreEncryption: true });
    return pdf.getPageCount();
  } catch {
    return null;
  }
}

function parsePageRanges(rangeStr: string, totalPages: number): number[] | null {
  const pages = new Set<number>();
  const parts = rangeStr.split(',').map(s => s.trim()).filter(Boolean);
  for (const part of parts) {
    if (part.includes('-')) {
      const [a, b] = part.split('-').map(Number);
      if (isNaN(a) || isNaN(b) || a < 1 || b > totalPages || a > b) return null;
      for (let i = a; i <= b; i++) pages.add(i);
    } else {
      const n = Number(part);
      if (isNaN(n) || n < 1 || n > totalPages) return null;
      pages.add(n);
    }
  }
  return pages.size > 0 ? Array.from(pages).sort((a, b) => a - b) : null;
}

function downloadBlob(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as any], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Basic compression: remove metadata, flatten, re-save ──────────────────────

async function compressBasic(file: File): Promise<Uint8Array> {
  const buf = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(buf, { ignoreEncryption: true });

  srcPdf.setTitle('');
  srcPdf.setAuthor('');
  srcPdf.setSubject('');
  srcPdf.setKeywords([]);
  srcPdf.setProducer('');
  srcPdf.setCreator('');

  return srcPdf.save({ useObjectStreams: true, addDefaultPage: false });
}

// ── Strong compression: rasterize pages at reduced scale via Canvas ───────────

async function compressStrong(
  file: File,
  onProgress: (pct: number) => void
): Promise<Uint8Array> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const fileUrl = URL.createObjectURL(file);
  const loadingTask = pdfjsLib.getDocument({ url: fileUrl });
  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  const outPdf = await PDFDocument.create();

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    onProgress(Math.round(((pageNum - 1) / totalPages) * 100));

    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.2 });

    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext('2d')!;

    await page.render({
      canvasContext: ctx,
      canvas: canvas,
      viewport
    }).promise;

    const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.72);
    const jpegBase64 = jpegDataUrl.split(',')[1];
    const jpegBytes = Uint8Array.from(atob(jpegBase64), c => c.charCodeAt(0));

    const jpegImage = await outPdf.embedJpg(jpegBytes);
    const embeddedPage = outPdf.addPage([viewport.width, viewport.height]);
    embeddedPage.drawImage(jpegImage, {
      x: 0, y: 0,
      width: viewport.width,
      height: viewport.height,
    });
  }

  URL.revokeObjectURL(fileUrl);
  onProgress(100);
  return outPdf.save({ useObjectStreams: true });
}

// ── Merge engine ──────────────────────────────────────────────────────────────

async function mergePdfs(files: PdfFile[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  for (const f of files) {
    const buf = await f.file.arrayBuffer();
    const src = await PDFDocument.load(buf, { ignoreEncryption: true });
    const pageIndices = src.getPageIndices();
    const copied = await merged.copyPages(src, pageIndices);
    copied.forEach(p => merged.addPage(p));
  }
  return merged.save({ useObjectStreams: true });
}

// ── Split engine ──────────────────────────────────────────────────────────────

async function splitPdf(file: File, pages: number[]): Promise<Uint8Array> {
  const buf = await file.arrayBuffer();
  const src = await PDFDocument.load(buf, { ignoreEncryption: true });
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, pages.map(p => p - 1));
  copied.forEach(p => out.addPage(p));
  return out.save({ useObjectStreams: true });
}

// ── DropZone ──────────────────────────────────────────────────────────────────

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  label?: string;
}

const DropZone: React.FC<DropZoneProps> = ({ onFiles, multiple = false, label }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    if (files.length) onFiles(files);
  }, [onFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type === 'application/pdf');
    if (files.length) onFiles(files);
    if (inputRef.current) inputRef.current.value = '';
  }, [onFiles]);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-2.5 px-4 py-8 rounded-lg border-2 border-dashed cursor-pointer transition-all select-none min-h-[140px]
        ${dragging
          ? 'border-[#1D9BF0] bg-[#1D9BF0]/5'
          : 'border-neutral-850 hover:border-neutral-750 bg-neutral-900/10 hover:bg-neutral-900/30'
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />
      <Upload className={`w-5 h-5 transition-colors ${dragging ? 'text-[#1D9BF0]' : 'text-neutral-500'}`} />
      <div className="text-center">
        <p className="text-xs font-semibold text-neutral-300">
          {label || (multiple ? 'Drop PDFs or click to browse' : 'Drop a PDF or click to browse')}
        </p>
      </div>
    </div>
  );
};

// ── Component: PDF Thumbnail with Resilient Timeout Fallback ──────────────────

interface PdfThumbnailProps {
  file: File;
}

const PdfThumbnail: React.FC<PdfThumbnailProps> = ({ file }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    // 2-second strict fallback limit
    timeoutId = setTimeout(() => {
      if (active && loading) {
        setLoading(false);
        setError(true);
      }
    }, 2000);

    const renderThumb = async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        const fileUrl = URL.createObjectURL(file);
        const loadingTask = pdfjsLib.getDocument({ url: fileUrl });
        const pdfDoc = await loadingTask.promise;
        const page = await pdfDoc.getPage(1);

        if (!active) {
          URL.revokeObjectURL(fileUrl);
          return;
        }

        const canvas = canvasRef.current;
        if (canvas) {
          const baseViewport = page.getViewport({ scale: 1.0 });
          const scale = Math.min(80 / baseViewport.width, 100 / baseViewport.height);
          const viewport = page.getViewport({ scale });

          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext('2d')!;

          await page.render({
            canvasContext: ctx,
            canvas: canvas,
            viewport,
          }).promise;
          if (active) {
            setLoading(false);
            clearTimeout(timeoutId);
          }
        }
        URL.revokeObjectURL(fileUrl);
      } catch {
        if (active) {
          setLoading(false);
          setError(true);
          clearTimeout(timeoutId);
        }
      }
    };

    renderThumb();
    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [file, loading]);

  if (error) {
    return (
      <div className="relative w-[80px] h-[100px] bg-neutral-900 border border-neutral-800 rounded flex flex-col items-center justify-center gap-1 shrink-0 shadow-sm">
        <FileText className="w-5 h-5 text-neutral-600" />
        <span className="text-[8px] font-mono text-neutral-500 uppercase">PDF</span>
      </div>
    );
  }

  return (
    <div className="relative w-[80px] h-[100px] bg-neutral-950 border border-neutral-800 rounded flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-neutral-600" />
      ) : (
        <canvas ref={canvasRef} className="object-contain w-full h-full" />
      )}
    </div>
  );
};

// ── Component: Right Panel Interactive Preview ───────────────────────────────

interface InteractivePreviewProps {
  /** A single source File (compress/split tabs) or a pre-merged Uint8Array (merge tab). */
  pdfSource: File | Uint8Array | null;
  /** Known total page count — allows the toolbar counter to reflect combined pages instantly. */
  pageCount?: number;
  onDownload?: () => void;
}

const InteractivePreview: React.FC<InteractivePreviewProps> = ({ pdfSource, pageCount: externalPageCount, onDownload }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [renderedPageCount, setRenderedPageCount] = useState<number>(1);

  // Reset page when document identity changes
  useEffect(() => {
    setCurrentPage(1);
    setZoom(1.0);
  }, [pdfSource]);

  useEffect(() => {
    if (!pdfSource) return;
    let active = true;
    setLoading(true);
    setError(false);

    const renderPage = async () => {
      // Build the pdfjs loading task from either a raw buffer or a File object
      let fileUrl: string | null = null;
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        let loadingTask;
        if (pdfSource instanceof Uint8Array) {
          // Slice a copy before passing to pdfjs — the worker transfers (detaches) the
          // underlying ArrayBuffer via postMessage, which would corrupt the React state
          // reference on subsequent renders, page turns, and downloads.
          loadingTask = pdfjsLib.getDocument({ data: pdfSource.slice() });
        } else {
          fileUrl = URL.createObjectURL(pdfSource);
          loadingTask = pdfjsLib.getDocument({ url: fileUrl });
        }

        const pdfDoc = await loadingTask.promise;
        if (active) setRenderedPageCount(pdfDoc.numPages);

        // Safety bound check across async state batching
        const safePageNum = Math.min(Math.max(1, currentPage), pdfDoc.numPages || 1);
        const page = await pdfDoc.getPage(safePageNum);

        if (!active) return;

        const canvas = canvasRef.current;
        if (canvas) {
          const baseViewport = page.getViewport({ scale: 1.0 });
          const fitScale = 480 / baseViewport.width;
          const viewport = page.getViewport({ scale: fitScale * zoom });

          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext('2d')!;

          await page.render({
            canvasContext: ctx,
            canvas,
            viewport,
          }).promise;
        }
      } catch (err) {
        console.error(err);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
        if (fileUrl) URL.revokeObjectURL(fileUrl);
      }
    };

    renderPage();
    return () => {
      active = false;
    };
  }, [pdfSource, currentPage, zoom]);

  if (!pdfSource) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-500 border border-neutral-800 rounded bg-neutral-900/10 min-h-[400px]">
        <FileText className="w-8 h-8 text-neutral-700 mb-2" />
        <p className="text-xs font-mono">No document selected for preview</p>
        <p className="text-[10px] font-sans text-neutral-600 mt-1">Upload a PDF and select it to inspect pages here</p>
      </div>
    );
  }

  // Prefer the externally known page count (e.g. sum of merged docs); fallback to what pdfjs reported after render
  const pageCount = externalPageCount ?? renderedPageCount;

  return (
    <div className="flex-1 flex flex-col border border-neutral-800 rounded bg-neutral-950 min-h-[400px] overflow-hidden">
      
      {/* Top Preview Control Bar */}
      <div className="px-3 py-2 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-neutral-300">
            Page {currentPage} of {pageCount}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
            disabled={currentPage === pageCount || loading}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(z => Math.max(0.6, z - 0.2))}
            disabled={loading}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-neutral-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(z => Math.min(2.0, z + 0.2))}
            disabled={loading}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {onDownload && (
            <>
              <span className="w-px h-4 bg-neutral-800 mx-1" />
              <button
                onClick={onDownload}
                title="Download PDF"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800 hover:bg-[#1D9BF0] text-neutral-300 hover:text-white transition-colors cursor-pointer text-[10px] font-mono font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Preview Workspace Body */}
      <div className="flex-1 p-4 overflow-auto flex items-center justify-center relative min-h-[360px] bg-neutral-900/20">
        {loading && (
          <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[1px] flex items-center justify-center z-10">
            <Loader2 className="w-6 h-6 animate-spin text-[#1D9BF0]" />
          </div>
        )}

        {error ? (
          <div className="text-center text-red-400 font-mono text-xs">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
            <p>Failed to render page preview</p>
          </div>
        ) : (
          <canvas ref={canvasRef} className="shadow-lg border border-neutral-850 max-w-full bg-white" />
        )}
      </div>

    </div>
  );
};

// ── Main Component (2-Column Grid Editor View) ───────────────────────────────

export const PdfSuiteTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('merge');
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Selected file for interactive preview (compress/split tabs)
  const [selectedFile, setSelectedFile] = useState<PdfFile | null>(null);

  // ── Merge state ──
  const [mergeFiles, setMergeFiles] = useState<PdfFile[]>([]);
  const [mergeWorking, setMergeWorking] = useState(false);
  const [mergeError, setMergeError] = useState<string | null>(null);
  const [mergeSuccess, setMergeSuccess] = useState<string | null>(null);
  /** In-memory merged PDF bytes — auto-updated as the queue changes. Used for live preview. */
  const [mergePreviewBuffer, setMergePreviewBuffer] = useState<Uint8Array | null>(null);
  const [mergePreviewBuilding, setMergePreviewBuilding] = useState(false);

  // ── Compress state ──
  const [compressFile, setCompressFile] = useState<PdfFile | null>(null);
  const [compressPreset, setCompressPreset] = useState<CompressionPreset>('basic');
  const [compressWorking, setCompressWorking] = useState(false);
  const [compressProgress, setCompressProgress] = useState(0);
  const [compressResult, setCompressResult] = useState<{ originalBytes: number; compressedBytes: number } | null>(null);
  const [compressError, setCompressError] = useState<string | null>(null);

  // ── Split state ──
  const [splitFile, setSplitFile] = useState<PdfFile | null>(null);
  const [splitRange, setSplitRange] = useState('');
  const [splitWorking, setSplitWorking] = useState(false);
  const [splitError, setSplitError] = useState<string | null>(null);
  const [splitSuccess, setSplitSuccess] = useState<string | null>(null);

  // ── Edit state ──
  const [editFile, setEditFile] = useState<PdfFile | null>(null);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [editPage, setEditPage] = useState(0); // 0-based
  const [editZoom, setEditZoom] = useState(1.0);
  const [editWorking, setEditWorking] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<TextOverlay[][]>([]);
  const editCanvasRef = useRef<HTMLCanvasElement>(null);
  const editContainerRef = useRef<HTMLDivElement>(null);
  const [editPageDims, setEditPageDims] = useState<{ w: number; h: number } | null>(null);
  const [editingOverlayId, setEditingOverlayId] = useState<string | null>(null);

  const selectedOverlay = textOverlays.find(o => o.id === selectedOverlayId) ?? null;

  // ── Intermediate buffer states for transfer to edit ──
  const [lastMergedBytes, setLastMergedBytes] = useState<Uint8Array | null>(null);
  const [lastCompressedBytes, setLastCompressedBytes] = useState<Uint8Array | null>(null);
  const [lastSplitBytes, setLastSplitBytes] = useState<Uint8Array | null>(null);

  const transferToEdit = async (bytes: Uint8Array, defaultFilename: string) => {
    const file = new File([bytes as any], defaultFilename, { type: 'application/pdf' });
    const entry: PdfFile = {
      id: uid(),
      file,
      name: defaultFilename,
      sizeBytes: file.size,
      pageCount: await getPageCount(file),
    };
    setEditFile(entry);
    setSelectedFile(entry);
    setEditPage(0);
    setTextOverlays([]);
    setUndoStack([]);
    setSelectedOverlayId(null);
    setEditError(null);
    setEditSuccess(null);
    setActiveTab('edit');
  };

  // ── Live merge preview: auto-regenerate in-memory merged buffer on queue changes ──
  useEffect(() => {
    if (mergeFiles.length < 2) {
      setMergePreviewBuffer(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setMergePreviewBuilding(true);
      try {
        const bytes = await mergePdfs(mergeFiles);
        if (!cancelled) setMergePreviewBuffer(bytes);
      } catch {
        if (!cancelled) setMergePreviewBuffer(null);
      } finally {
        if (!cancelled) setMergePreviewBuilding(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [mergeFiles]);

  // Sync selected file to tab shifts (compress / split only)
  useEffect(() => {
    if (activeTab === 'compress') {
      setSelectedFile(compressFile);
    } else if (activeTab === 'split') {
      setSelectedFile(splitFile);
    } else if (activeTab === 'edit') {
      setSelectedFile(editFile);
    }
  }, [activeTab, compressFile, splitFile, editFile]);

  // Full Screen toggle side effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) setIsFullScreen(false);
    };
    const navbar = document.querySelector('header') as HTMLElement | null;
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
      if (navbar) navbar.style.display = 'none';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      if (navbar) navbar.style.display = '';
    }
    return () => {
      document.body.style.overflow = '';
      if (navbar) navbar.style.display = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullScreen]);

  // ── Add files helpers ──
  const addMergeFiles = useCallback(async (files: File[]) => {
    const newEntries: PdfFile[] = await Promise.all(
      files.map(async (f) => ({
        id: uid(),
        file: f,
        name: f.name,
        sizeBytes: f.size,
        pageCount: await getPageCount(f),
      }))
    );
    setMergeFiles(prev => {
      const updated = [...prev, ...newEntries];
      if (!selectedFile && updated.length) setSelectedFile(updated[0]);
      return updated;
    });
    setMergeError(null);
    setMergeSuccess(null);
    setLastMergedBytes(null);
  }, [selectedFile]);

  const addCompressFile = useCallback(async ([f]: File[]) => {
    const entry: PdfFile = {
      id: uid(), file: f, name: f.name, sizeBytes: f.size,
      pageCount: await getPageCount(f),
    };
    setCompressFile(entry);
    setSelectedFile(entry);
    setCompressResult(null);
    setCompressError(null);
    setLastCompressedBytes(null);
  }, []);

  const addSplitFile = useCallback(async ([f]: File[]) => {
    const entry: PdfFile = {
      id: uid(), file: f, name: f.name, sizeBytes: f.size,
      pageCount: await getPageCount(f),
    };
    setSplitFile(entry);
    setSelectedFile(entry);
    setSplitError(null);
    setSplitSuccess(null);
    setSplitRange('');
    setLastSplitBytes(null);
  }, []);

  const addEditFile = useCallback(async ([f]: File[]) => {
    const entry: PdfFile = {
      id: uid(), file: f, name: f.name, sizeBytes: f.size,
      pageCount: await getPageCount(f),
    };
    setEditFile(entry);
    setSelectedFile(entry);
    setEditPage(0);
    setTextOverlays([]);
    setUndoStack([]);
    setSelectedOverlayId(null);
    setEditError(null);
    setEditSuccess(null);
  }, []);

  // ── Edit helper operations ──
  const pushUndo = (currentOverlays: TextOverlay[]) => {
    setUndoStack(prev => [...prev, currentOverlays]);
  };

  const addTextOverlay = () => {
    if (!editFile) return;
    pushUndo(textOverlays);
    const newOverlay: TextOverlay = {
      id: uid(),
      text: 'Double click to edit',
      x: 0.3,
      y: 0.4,
      fontSize: 16,
      fontFamily: 'sans',
      color: '#EFF6FF', // Slate 50-like default text color
      opacity: 1.0,
      pageIndex: editPage,
    };
    setTextOverlays(prev => [...prev, newOverlay]);
    setSelectedOverlayId(newOverlay.id);
  };

  const updateTextOverlay = (id: string, updates: Partial<TextOverlay>) => {
    pushUndo(textOverlays);
    setTextOverlays(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
  };

  const deleteTextOverlay = (id: string) => {
    pushUndo(textOverlays);
    setTextOverlays(prev => prev.filter(o => o.id !== id));
    if (selectedOverlayId === id) setSelectedOverlayId(null);
  };

  const undoEdit = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setTextOverlays(previous);
    setSelectedOverlayId(null);
  };

  const handleSaveEdit = async () => {
    if (!editFile) return;
    setEditWorking(true);
    setEditError(null);
    setEditSuccess(null);
    try {
      const arrayBuffer = await editFile.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const pages = pdfDoc.getPages();

      // Embed text overlays page-by-page
      for (const overlay of textOverlays) {
        if (overlay.pageIndex < 0 || overlay.pageIndex >= pages.length) continue;
        const page = pages[overlay.pageIndex];
        const { width, height } = page.getSize();
        
        // Convert fraction relative coordinates to PDF user space coordinates
        const pdfX = overlay.x * width;
        // In PDF user space, (0,0) is bottom-left, but visual canvas is top-left
        const pdfY = (1 - overlay.y) * height - (overlay.fontSize * 0.8);

        // Load standard font
        const fontName = FONT_MAP[overlay.fontFamily] || StandardFonts.Helvetica;
        const font = await pdfDoc.embedFont(fontName);

        // Parse hex color to RGB (0-1)
        const hex = overlay.color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;

        page.drawText(overlay.text, {
          x: pdfX,
          y: pdfY,
          size: overlay.fontSize,
          font,
          color: rgb(r, g, b),
          opacity: overlay.opacity,
        });
      }

      const pdfBytes = await pdfDoc.save();
      downloadBlob(pdfBytes, `edited-${editFile.name}`);
      setEditSuccess('PDF successfully annotated and downloaded.');
    } catch (err: any) {
      console.error(err);
      setEditError(`Failed to save edits: ${err.message || 'Unknown error'}`);
    } finally {
      setEditWorking(false);
    }
  };

  // Render the current edit page onto the canvas in Edit PDF mode
  useEffect(() => {
    if (activeTab !== 'edit' || !editFile) return;
    let active = true;

    const renderEditPage = async () => {
      const fileUrl = URL.createObjectURL(editFile.file);
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        const loadingTask = pdfjsLib.getDocument({ url: fileUrl });
        const pdfDoc = await loadingTask.promise;
        
        const safePageNum = Math.min(Math.max(1, editPage + 1), pdfDoc.numPages || 1);
        const page = await pdfDoc.getPage(safePageNum);

        if (!active) {
          URL.revokeObjectURL(fileUrl);
          return;
        }

        const canvas = editCanvasRef.current;
        if (canvas) {
          const baseViewport = page.getViewport({ scale: 1.0 });
          // Align size with the general layout fit scaling
          const fitScale = 480 / baseViewport.width;
          const viewport = page.getViewport({ scale: fitScale * editZoom });

          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          setEditPageDims({ w: canvas.width, h: canvas.height });

          const ctx = canvas.getContext('2d')!;
          await page.render({
            canvasContext: ctx,
            canvas,
            viewport,
          }).promise;
        }
      } catch (err) {
        console.error(err);
      } finally {
        URL.revokeObjectURL(fileUrl);
      }
    };

    renderEditPage();
    return () => {
      active = false;
    };
  }, [activeTab, editFile, editPage, editZoom]);

  // ── Merge reorder ──
  const dragIndexRef = useRef<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setMergePreviewBuffer(null); // invalidate stale preview immediately
    setMergeFiles(prev => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };
  const moveDown = (idx: number) => {
    setMergePreviewBuffer(null); // invalidate stale preview immediately
    setMergeFiles(prev => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };
  const removeFile = (id: string) => {
    setMergeFiles(prev => {
      const next = prev.filter(f => f.id !== id);
      if (selectedFile?.id === id) {
        setSelectedFile(next[0] || null);
      }
      return next;
    });
  };

  // Native drag-and-drop handlers for the merge queue
  const handleDragStart = (idx: number) => {
    dragIndexRef.current = idx;
  };
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetIndex(idx);
  };
  const handleDrop = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    setDropTargetIndex(null);
    dragIndexRef.current = null;
    if (from === null || from === dropIdx) return;
    setMergePreviewBuffer(null); // invalidate stale preview immediately
    setMergeFiles(prev => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      // Adjust dropIdx if dragging downward (splice shifted indices)
      const insertAt = from < dropIdx ? dropIdx - 1 : dropIdx;
      next.splice(insertAt, 0, item);
      return next;
    });
  };
  const handleDragEnd = () => {
    dragIndexRef.current = null;
    setDropTargetIndex(null);
  };

  // ── Actions ──

  const handleMerge = useCallback(async () => {
    if (mergeFiles.length < 2) { setMergeError('Add at least 2 PDF files to merge.'); return; }
    setMergeWorking(true);
    setMergeError(null);
    setMergeSuccess(null);
    setLastMergedBytes(null);
    try {
      const bytes = mergePreviewBuffer ?? await mergePdfs(mergeFiles);
      downloadBlob(bytes, 'merged-output.pdf');
      setMergePreviewBuffer(bytes);
      setMergeSuccess(`Merged ${mergeFiles.length} files → ${formatBytes(bytes.byteLength)}`);
      setLastMergedBytes(bytes);
    } catch (err: any) {
      setMergeError(`Merge failed: ${err.message || 'Unknown error'}`);
    } finally {
      setMergeWorking(false);
    }
  }, [mergeFiles, mergePreviewBuffer]);

  const handleCompress = useCallback(async () => {
    if (!compressFile) { setCompressError('Upload a PDF first.'); return; }
    setCompressWorking(true);
    setCompressProgress(0);
    setCompressResult(null);
    setCompressError(null);
    setLastCompressedBytes(null);
    try {
      let bytes: Uint8Array;
      if (compressPreset === 'basic') {
        bytes = await compressBasic(compressFile.file);
      } else {
        bytes = await compressStrong(compressFile.file, setCompressProgress);
      }
      downloadBlob(bytes, `compressed-${compressFile.name}`);
      setCompressResult({ originalBytes: compressFile.sizeBytes, compressedBytes: bytes.byteLength });
      setLastCompressedBytes(bytes);
    } catch (err: any) {
      setCompressError(`Compression failed: ${err.message || 'Unknown error'}`);
    } finally {
      setCompressWorking(false);
      setCompressProgress(0);
    }
  }, [compressFile, compressPreset]);

  const handleSplit = useCallback(async () => {
    if (!splitFile) { setSplitError('Upload a PDF first.'); return; }
    if (!splitFile.pageCount) { setSplitError('Could not read page count from this PDF.'); return; }
    const pages = parsePageRanges(splitRange, splitFile.pageCount);
    if (!pages) { setSplitError(`Invalid range. Use format: 1-3, 5, 7-10 (max page: ${splitFile.pageCount})`); return; }
    setSplitWorking(true);
    setSplitError(null);
    setSplitSuccess(null);
    setLastSplitBytes(null);
    try {
      const bytes = await splitPdf(splitFile.file, pages);
      const rangeSafe = splitRange.replace(/[^0-9,-]/g, '').slice(0, 20);
      downloadBlob(bytes, `split-pages-${rangeSafe}.pdf`);
      setSplitSuccess(`Extracted ${pages.length} page(s) → ${formatBytes(bytes.byteLength)}`);
      setLastSplitBytes(bytes);
    } catch (err: any) {
      setSplitError(`Split failed: ${err.message || 'Unknown error'}`);
    } finally {
      setSplitWorking(false);
    }
  }, [splitFile, splitRange]);

  const savingPct = compressResult
    ? Math.round((1 - compressResult.compressedBytes / compressResult.originalBytes) * 100)
    : 0;

  return (
    <div className={`bg-neutral-950 border border-neutral-800 font-sans text-neutral-100 flex flex-col ${isFullScreen ? 'fixed inset-0 z-[9999] overflow-hidden' : 'w-full rounded-lg shadow-2xl'}`}>

      {/* Top Header & Tab Control Bar */}
      <div className={`px-3 py-2.5 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono ${isFullScreen ? 'sticky top-0 z-[10000]' : ''}`}>
        
        {/* Left Side Tab Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('merge')}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 cursor-pointer font-semibold ${
              activeTab === 'merge' ? 'bg-[#1D9BF0] text-white shadow-sm' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
            }`}
          >
            {/* <Merge className="w-3.5 h-3.5" /> */}
            <span>Merge PDFs</span>
          </button>

          <button
            onClick={() => setActiveTab('compress')}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 cursor-pointer font-semibold ${
              activeTab === 'compress' ? 'bg-[#1D9BF0] text-white shadow-sm' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
            }`}
          >
            {/* <CompressIcon className="w-3.5 h-3.5" /> */}
            <span>Compress PDF</span>
          </button>

          <button
            onClick={() => setActiveTab('split')}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 cursor-pointer font-semibold ${
              activeTab === 'split' ? 'bg-[#1D9BF0] text-white shadow-sm' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
            }`}
          >
            {/* <Scissors className="w-3.5 h-3.5" /> */}
            <span>Split</span>
          </button>
        </div>

        {/* Right Side Utility Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'merge' && mergeFiles.length > 0 && (
            <button
              onClick={() => { setMergeFiles([]); setMergeError(null); setMergeSuccess(null); setSelectedFile(null); }}
              className="px-2.5 py-1.5 rounded bg-neutral-800/80 hover:bg-red-950 hover:text-red-300 text-neutral-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}

          {activeTab === 'compress' && compressFile && (
            <button
              onClick={() => { setCompressFile(null); setCompressResult(null); setCompressError(null); setSelectedFile(null); }}
              className="px-2.5 py-1.5 rounded bg-neutral-800/80 hover:bg-red-950 hover:text-red-300 text-neutral-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear File</span>
            </button>
          )}

          {activeTab === 'split' && splitFile && (
            <button
              onClick={() => { setSplitFile(null); setSplitError(null); setSplitSuccess(null); setSplitRange(''); setSelectedFile(null); }}
              className="px-2.5 py-1.5 rounded bg-neutral-800/80 hover:bg-red-950 hover:text-red-300 text-neutral-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear File</span>
            </button>
          )}

          {activeTab === 'edit' && editFile && (
            <button
              onClick={() => { setEditFile(null); setTextOverlays([]); setUndoStack([]); setSelectedOverlayId(null); setEditError(null); setEditSuccess(null); setSelectedFile(null); }}
              className="px-2.5 py-1.5 rounded bg-neutral-800/80 hover:bg-red-950 hover:text-red-300 text-neutral-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear File</span>
            </button>
          )}

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>

      {/* Main Dual-Pane Split Workspace Area */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800 ${isFullScreen ? 'flex-1 overflow-hidden' : 'min-h-[480px]'}`}>

        {/* Left Column Pane — Control & Input queue */}
        <div className={`${activeTab === 'edit' ? 'lg:col-span-3' : 'lg:col-span-5'} p-4 sm:p-5 flex flex-col space-y-4 ${isFullScreen ? 'overflow-y-auto' : ''}`}>
          
          {/* TAB 1: Merge PDFs Queue */}
          {activeTab === 'merge' && (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <DropZone multiple onFiles={addMergeFiles} label="Drop multiple PDF files here to merge" />

                {mergeFiles.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 uppercase tracking-wider pb-1 border-b border-neutral-900">
                      <span>Documents queue ({mergeFiles.length})</span>
                    </div>
                    <div className="space-y-0 max-h-[220px] overflow-y-auto pr-1">
                      {mergeFiles.map((f, idx) => (
                        <div key={f.id}>
                          {/* Drop indicator line above this item */}
                          {dropTargetIndex === idx && dragIndexRef.current !== null && dragIndexRef.current !== idx && (
                            <div className="h-0.5 bg-[#1D9BF0] rounded mx-1 mb-1 animate-pulse" />
                          )}
                          <div
                            draggable
                            onDragStart={() => handleDragStart(idx)}
                            onDragOver={e => handleDragOver(e, idx)}
                            onDrop={e => handleDrop(e, idx)}
                            onDragEnd={handleDragEnd}
                            onClick={() => setSelectedFile(f)}
                            className={`flex items-center gap-2.5 p-2 rounded border transition-all cursor-pointer ${
                              dropTargetIndex === idx && dragIndexRef.current !== null && dragIndexRef.current !== idx
                                ? 'border-[#1D9BF0]/60 bg-[#1D9BF0]/5'
                                : selectedFile?.id === f.id
                                  ? 'border-[#1D9BF0] bg-[#1D9BF0]/5'
                                  : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/30'
                            } mb-1.5`}
                          >
                            <GripVertical
                              className="w-3.5 h-3.5 text-neutral-500 shrink-0 cursor-grab active:cursor-grabbing"
                            />
                            <PdfThumbnail file={f.file} />

                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-mono font-bold text-neutral-200 truncate">{f.name}</p>
                              <p className="text-[10px] font-mono text-neutral-500 mt-0.5">
                                <span className="text-neutral-600 font-bold">#{idx + 1}</span>
                                {' · '}{formatBytes(f.sizeBytes)}
                                {f.pageCount !== null && ` · ${f.pageCount} pgs`}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => moveUp(idx)}
                                disabled={idx === 0}
                                title="Move up"
                                className="p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => moveDown(idx)}
                                disabled={idx === mergeFiles.length - 1}
                                title="Move down"
                                className="p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => removeFile(f.id)}
                                title="Remove"
                                className="p-1 rounded hover:bg-red-950/40 text-neutral-500 hover:text-red-400 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          {/* Drop indicator after last item */}
                          {idx === mergeFiles.length - 1 && dropTargetIndex !== null && dropTargetIndex > idx && dragIndexRef.current !== null && (
                            <div className="h-0.5 bg-[#1D9BF0] rounded mx-1 mt-1 animate-pulse" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {mergeError && (
                <div className="flex items-start gap-2 p-3 rounded bg-red-950/40 border border-red-900/60 text-xs text-red-300 font-mono">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{mergeError}</span>
                </div>
              )}
              {mergeSuccess && (
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-3 rounded bg-emerald-950/40 border border-emerald-900/50 text-xs text-emerald-300 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span className="flex-1">{mergeSuccess}</span>
                  </div>
                </div>
              )}

              {mergeFiles.length >= 2 && (
                <div className="pt-2 border-t border-neutral-900">
                  <button
                    onClick={handleMerge}
                    disabled={mergeWorking}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white text-xs font-mono font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {mergeWorking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : ''}
                    <span>{mergeWorking ? 'Merging…' : 'Merge & Download PDF'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Compress PDF Controls */}
          {activeTab === 'compress' && (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {!compressFile ? (
                  <DropZone onFiles={addCompressFile} label="Drop a PDF file here to compress" />
                ) : (
                  <div className={`flex items-start gap-3 p-2.5 rounded border ${selectedFile ? 'border-[#1D9BF0] bg-[#1D9BF0]/5' : 'border-neutral-850'}`}>
                    <PdfThumbnail file={compressFile.file} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono font-bold text-neutral-200 truncate">{compressFile.name}</p>
                      <p className="text-[10px] font-mono text-neutral-500 mt-1">
                        {formatBytes(compressFile.sizeBytes)}
                        {compressFile.pageCount !== null && ` · ${compressFile.pageCount} pages`}
                      </p>
                    </div>
                    <button
                      onClick={() => { setCompressFile(null); setCompressResult(null); setCompressError(null); setSelectedFile(null); }}
                      className="p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {compressFile && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Compression presets</p>
                      <div className="flex flex-col gap-2">
                        {([
                          {
                            id: 'basic' as const,
                            label: 'Basic Compression',
                            detail: 'Strips metadata and flattens streams. Fast, lossless optimization.',
                          },
                          {
                            id: 'strong' as const,
                            label: 'Strong Compression (Lossy)',
                            detail: 'Rasterizes page views to JPEG images at 72% quality. Maximum file size reduction.',
                          },
                        ] as const).map(({ id, label, detail }) => (
                          <button
                            key={id}
                            onClick={() => setCompressPreset(id)}
                            className={`text-left p-3 rounded border transition-all cursor-pointer ${
                              compressPreset === id
                                ? 'border-[#1D9BF0] bg-[#1D9BF0]/10'
                                : 'border-neutral-800 bg-neutral-900/30 hover:border-neutral-750'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-2 h-2 rounded-full border shrink-0 ${compressPreset === id ? 'border-[#1D9BF0] bg-[#1D9BF0]' : 'border-neutral-600'}`} />
                              <span className="text-xs font-mono font-bold text-neutral-200">{label}</span>
                            </div>
                            <p className="text-[10px] font-sans text-neutral-500 leading-relaxed pl-4">{detail}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {compressWorking && compressPreset === 'strong' && (
                      <div className="space-y-2 p-3 rounded border border-neutral-850 bg-neutral-900/30">
                        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                          <span>Rendering page views...</span>
                          <span>{compressProgress}%</span>
                        </div>
                        <div className="w-full bg-neutral-850 rounded-full h-1 overflow-hidden">
                          <div
                            className="h-1 bg-[#1D9BF0] rounded-full transition-all duration-300"
                            style={{ width: `${Math.max(4, compressProgress)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {compressResult && (
                      <div className="rounded border border-neutral-850 overflow-hidden bg-neutral-900/20">
                        <div className="px-3 py-1.5 bg-neutral-900 border-b border-neutral-850 text-[10px] font-mono text-neutral-450 uppercase tracking-wider">
                          Efficiency Statistics
                        </div>
                        <div className="p-3 grid grid-cols-3 gap-3 text-center divide-x divide-neutral-850 text-[11px]">
                          <div>
                            <p className="text-[9px] font-mono text-neutral-500">Original</p>
                            <p className="font-mono font-bold text-neutral-300 mt-0.5">{formatBytes(compressResult.originalBytes)}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-mono text-neutral-500">Optimized</p>
                            <p className="font-mono font-bold text-emerald-400 mt-0.5">{formatBytes(compressResult.compressedBytes)}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-mono text-neutral-500">Saved</p>
                            <p className={`font-mono font-bold mt-0.5 ${savingPct > 0 ? 'text-emerald-400' : 'text-neutral-500'}`}>
                              {savingPct > 0 ? `↓ ${savingPct}%` : '0%'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {compressError && (
                <div className="flex items-start gap-2 p-3 rounded bg-red-950/40 border border-red-900/60 text-xs text-red-300 font-mono">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{compressError}</span>
                </div>
              )}

              {compressFile && (
                <div className="pt-2 border-t border-neutral-900 flex flex-col gap-2">
                  <button
                    onClick={handleCompress}
                    disabled={compressWorking}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white text-xs font-mono font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {compressWorking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{compressWorking ? 'Compressing…' : 'Compress & Download PDF'}</span>
                  </button>
                  {compressResult && (
                    <>
                      <button
                        onClick={handleCompress}
                        disabled={compressWorking}
                        className="w-full flex items-center justify-center gap-2 px-4 py-1.5 rounded border border-neutral-750 hover:border-neutral-700 bg-neutral-900 hover:bg-neutral-850 text-neutral-300 text-[11px] font-mono transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Download className="w-3 h-3" />
                        <span>Re-download Optimized PDF</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Split PDF Controls */}
          {activeTab === 'split' && (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {!splitFile ? (
                  <DropZone onFiles={addSplitFile} label="Drop a PDF file here to extract pages" />
                ) : (
                  <div className={`flex items-start gap-3 p-2.5 rounded border ${selectedFile ? 'border-[#1D9BF0] bg-[#1D9BF0]/5' : 'border-neutral-850'}`}>
                    <PdfThumbnail file={splitFile.file} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono font-bold text-neutral-200 truncate">{splitFile.name}</p>
                      <p className="text-[10px] font-mono text-neutral-500 mt-1">
                        {formatBytes(splitFile.sizeBytes)}
                        {splitFile.pageCount !== null && ` · ${splitFile.pageCount} pages`}
                      </p>
                    </div>
                    <button
                      onClick={() => { setSplitFile(null); setSplitError(null); setSplitSuccess(null); setSplitRange(''); setSelectedFile(null); }}
                      className="p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {splitFile && (
                  <div className="space-y-3 p-3.5 bg-neutral-900/20 border border-neutral-850 rounded-lg">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
                        Page Range
                      </label>
                      <input
                        type="text"
                        value={splitRange}
                        onChange={e => { setSplitRange(e.target.value); setSplitError(null); setSplitSuccess(null); }}
                        placeholder="e.g. 1-3, 5, 7-10"
                        className="w-full px-3 py-2 rounded bg-neutral-950 border border-neutral-850 focus:border-[#1D9BF0] focus:outline-none text-xs font-mono text-neutral-100 placeholder-neutral-600 transition-colors"
                      />
                      <p className="text-[10px] font-sans text-neutral-500">
                        Supports commas &amp; ranges. Max page: <strong className="text-neutral-400">{splitFile.pageCount}</strong>.
                      </p>
                    </div>

                    {splitFile.pageCount && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[
                          { label: 'First half', range: `1-${Math.floor(splitFile.pageCount / 2)}` },
                          { label: 'Second half', range: `${Math.floor(splitFile.pageCount / 2) + 1}-${splitFile.pageCount}` },
                          { label: 'Page 1', range: '1' },
                          { label: 'All pages', range: `1-${splitFile.pageCount}` },
                        ].map(({ label, range }) => (
                          <button
                            key={label}
                            onClick={() => { setSplitRange(range); setSplitError(null); }}
                            className="px-2 py-0.5 text-[9px] font-mono rounded bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-[#1D9BF0] hover:border-[#1D9BF0]/30 transition-colors cursor-pointer"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {splitError && (
                <div className="flex items-start gap-2 p-3 rounded bg-red-950/40 border border-red-900/60 text-xs text-red-300 font-mono">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{splitError}</span>
                </div>
              )}
              {splitSuccess && (
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-3 rounded bg-emerald-950/40 border border-emerald-900/50 text-xs text-emerald-300 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span className="flex-1">{splitSuccess}</span>
                  </div>
                </div>
              )}

              {splitFile && splitRange.trim() && (
                <div className="pt-2 border-t border-neutral-900">
                  <button
                    onClick={handleSplit}
                    disabled={splitWorking}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white text-xs font-mono font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {splitWorking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{splitWorking ? 'Extracting…' : '📥 Extract & Download Pages'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Edit PDF Controls */}
          {activeTab === 'edit' && (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {!editFile ? (
                  <DropZone onFiles={addEditFile} label="Drop a PDF file here to annotate/edit" />
                ) : (
                  <div className={`flex items-start gap-3 p-2.5 rounded border ${selectedFile ? 'border-[#1D9BF0] bg-[#1D9BF0]/5' : 'border-neutral-850'}`}>
                    <PdfThumbnail file={editFile.file} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono font-bold text-neutral-200 truncate">{editFile.name}</p>
                      <p className="text-[10px] font-mono text-neutral-500 mt-1">
                        {formatBytes(editFile.sizeBytes)}
                        {editFile.pageCount !== null && ` · ${editFile.pageCount} pages`}
                      </p>
                    </div>
                    <button
                      onClick={() => { setEditFile(null); setTextOverlays([]); setUndoStack([]); setSelectedOverlayId(null); setEditError(null); setEditSuccess(null); setSelectedFile(null); }}
                      className="p-1 rounded hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {editFile && (
                  <div className="space-y-4">
                    <div className="p-3 bg-neutral-900/30 border border-neutral-850 rounded-lg space-y-2">
                      <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Canvas Workspace</p>
                      <p className="text-[11px] font-sans text-neutral-400 leading-relaxed">
                        Adjust text elements directly on-canvas. Use top toolbar shortcuts to insert components.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={addTextOverlay}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-mono text-neutral-200 hover:text-white transition-colors cursor-pointer"
                      >
                        <Type className="w-3.5 h-3.5 text-[#1D9BF0]" />
                        <span>Add Text Field</span>
                      </button>
                      <button
                        onClick={undoEdit}
                        disabled={undoStack.length === 0}
                        title="Undo"
                        className="px-3 py-2 rounded bg-neutral-900 border border-neutral-800 hover:border-neutral-700 disabled:opacity-40 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {editError && (
                <div className="flex items-start gap-2 p-3 rounded bg-red-950/40 border border-red-900/60 text-xs text-red-300 font-mono">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{editError}</span>
                </div>
              )}
              {editSuccess && (
                <div className="flex items-start gap-2 p-3 rounded bg-emerald-950/40 border border-emerald-900/50 text-xs text-emerald-300 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{editSuccess}</span>
                </div>
              )}

              {editFile && (
                <div className="pt-2 border-t border-neutral-900">
                  <button
                    onClick={handleSaveEdit}
                    disabled={editWorking}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white text-xs font-mono font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {editWorking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{editWorking ? 'Exporting…' : '💾 Save & Export PDF'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column Pane — High-Resolution Document Interactive Preview Canvas */}
        <div className={`${activeTab === 'edit' ? 'lg:col-span-9' : 'lg:col-span-7'} p-4 sm:p-5 flex flex-col justify-between ${isFullScreen ? 'overflow-y-auto' : ''}`}>
          {activeTab === 'edit' ? (
            editFile ? (
              <div className="flex-1 flex flex-col border border-neutral-800 rounded bg-neutral-950 min-h-[400px] overflow-hidden">
                {/* Top Edit Control Bar */}
                <div className="px-3 py-2 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between gap-4 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditPage(p => Math.max(0, p - 1))}
                      disabled={editPage === 0}
                      className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-neutral-300">
                      Page {editPage + 1} of {editFile.pageCount || 1}
                    </span>
                    <button
                      onClick={() => setEditPage(p => Math.min((editFile.pageCount || 1) - 1, p + 1))}
                      disabled={editPage === (editFile.pageCount || 1) - 1}
                      className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditZoom(z => Math.max(0.6, z - 0.2))}
                      className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-neutral-400 w-10 text-center">{Math.round(editZoom * 100)}%</span>
                    <button
                      onClick={() => setEditZoom(z => Math.min(2.0, z + 0.2))}
                      className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 cursor-pointer"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>

                    <span className="w-px h-4 bg-neutral-800 mx-1" />
                    <button
                      onClick={handleSaveEdit}
                      disabled={editWorking}
                      title="Save & Export PDF"
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white transition-colors cursor-pointer text-[10px] font-mono font-semibold disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                {/* Secondary Figma/Canva style Annotation Toolbar */}
                <div className="px-3 py-1.5 bg-neutral-950 border-b border-neutral-800 flex flex-wrap items-center justify-center gap-2 text-xs font-mono select-none">
                  <button
                    onClick={addTextOverlay}
                    className="px-2.5 py-1 rounded bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white flex items-center gap-1.5 cursor-pointer font-semibold shadow-sm text-[11px]"
                  >
                    <span>🔤 Add Text</span>
                  </button>
                  <button
                    onClick={() => alert('Signature/Draw tool is ready in memory. Complete local sandbox signature support coming in future updates!')}
                    className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white flex items-center gap-1.5 cursor-pointer text-[11px]"
                  >
                    <span>🖋️ Signature / Draw</span>
                  </button>
                  <button
                    onClick={() => {
                      if (!editFile) return;
                      pushUndo(textOverlays);
                      const newOverlay: TextOverlay = {
                        id: uid(),
                        text: 'HIGHLIGHT',
                        x: 0.4,
                        y: 0.4,
                        fontSize: 24,
                        fontFamily: 'sans',
                        color: '#FFFF00',
                        opacity: 0.45,
                        pageIndex: editPage,
                      };
                      setTextOverlays(prev => [...prev, newOverlay]);
                      setSelectedOverlayId(newOverlay.id);
                    }}
                    className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white flex items-center gap-1.5 cursor-pointer text-[11px]"
                  >
                    <span>🔲 Highlight Box</span>
                  </button>
                  <button
                    onClick={() => alert('Insert Image/Stamp tool is ready in memory. Complete local stamp support coming in future updates!')}
                    className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white flex items-center gap-1.5 cursor-pointer text-[11px]"
                  >
                    <span>🖼️ Insert Image/Stamp</span>
                  </button>
                </div>

                {/* Edit Canvas & Drag overlay workspace container */}
                <div 
                  className="flex-1 p-4 overflow-auto flex items-center justify-center relative min-h-[360px] bg-neutral-900/20" 
                  ref={editContainerRef}
                  onClick={() => { setSelectedOverlayId(null); setEditingOverlayId(null); }}
                >
                  <div className="relative shadow-lg border border-neutral-850 bg-white select-none" onClick={e => e.stopPropagation()}>
                    <canvas ref={editCanvasRef} className="max-w-full block pointer-events-none" />

                    {/* Draggable Absolute Text Overlay Elements */}
                    {editPageDims && textOverlays
                      .filter(o => o.pageIndex === editPage)
                      .map(o => {
                        const styleFont = FONT_FAMILIES.find(f => f.id === o.fontFamily)?.css || 'Helvetica, Arial, sans-serif';
                        const isSelected = selectedOverlayId === o.id;
                        const isEditing = editingOverlayId === o.id;

                        // Local coordinates computed from layout dimensions
                        const posX = o.x * editPageDims.w;
                        const posY = o.y * editPageDims.h;

                        // Drag start helper using mouse events
                        const handleMouseDown = (e: React.MouseEvent) => {
                          e.stopPropagation();
                          setSelectedOverlayId(o.id);
                          if (isEditing) return; // Typing mode

                          const startX = e.clientX;
                          const startY = e.clientY;
                          const startPctX = o.x;
                          const startPctY = o.y;

                          const handleMouseMove = (moveEvt: MouseEvent) => {
                            if (!editPageDims) return;
                            const deltaX = moveEvt.clientX - startX;
                            const deltaY = moveEvt.clientY - startY;

                            const deltaPctX = deltaX / editPageDims.w;
                            const deltaPctY = deltaY / editPageDims.h;

                            const nextX = Math.min(Math.max(0, startPctX + deltaPctX), 0.95);
                            const nextY = Math.min(Math.max(0, startPctY + deltaPctY), 0.95);

                            // Perform update without stack pollution during sliding drag
                            setTextOverlays(prev => prev.map(item => item.id === o.id ? { ...item, x: nextX, y: nextY } : item));
                          };

                          const handleMouseUp = () => {
                            window.removeEventListener('mousemove', handleMouseMove);
                            window.removeEventListener('mouseup', handleMouseUp);
                          };

                          window.addEventListener('mousemove', handleMouseMove);
                          window.addEventListener('mouseup', handleMouseUp);
                        };

                        return (
                          <div
                            key={o.id}
                            style={{
                              position: 'absolute',
                              left: `${posX}px`,
                              top: `${posY}px`,
                              fontSize: `${o.fontSize}px`,
                              fontFamily: styleFont,
                              color: o.color,
                              opacity: o.opacity,
                              transform: 'translate(-50%, -50%)',
                            }}
                            className={`absolute cursor-move select-none p-1 border rounded leading-tight transition-shadow ${
                              isSelected
                                ? 'border-[#1D9BF0] bg-neutral-950/80 shadow-lg shadow-[#1D9BF0]/10 z-30'
                                : 'border-transparent hover:border-neutral-400 bg-transparent hover:bg-neutral-950/20 z-20'
                            }`}
                            onMouseDown={handleMouseDown}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              setEditingOverlayId(o.id);
                            }}
                          >
                            {/* Floating Canva-style Contextual Toolbar directly above selected object */}
                            {isSelected && (
                              <div
                                className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-40 select-none animate-in fade-in zoom-in-95 duration-100"
                                onMouseDown={e => e.stopPropagation()} // block dragging on clicks
                              >
                                <select
                                  value={o.fontFamily}
                                  onChange={e => updateTextOverlay(o.id, { fontFamily: e.target.value as any })}
                                  className="bg-neutral-950 border border-neutral-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-neutral-300 focus:outline-none"
                                >
                                  <option value="sans">Sans</option>
                                  <option value="serif">Serif</option>
                                  <option value="mono">Mono</option>
                                </select>

                                <span className="w-px h-3.5 bg-neutral-800 mx-0.5" />

                                <button
                                  onClick={() => updateTextOverlay(o.id, { fontSize: Math.max(10, o.fontSize - 2) })}
                                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs font-bold font-mono"
                                >
                                  -
                                </button>
                                <span className="text-[10px] font-mono text-neutral-350 w-5 text-center">{o.fontSize}</span>
                                <button
                                  onClick={() => updateTextOverlay(o.id, { fontSize: Math.min(72, o.fontSize + 2) })}
                                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs font-bold font-mono"
                                >
                                  +
                                </button>

                                <span className="w-px h-3.5 bg-neutral-800 mx-0.5" />

                                <div className="relative w-5 h-5 rounded border border-neutral-800 bg-neutral-950 flex items-center justify-center overflow-hidden cursor-pointer">
                                  <div className="w-3 h-3 rounded-full border border-neutral-750" style={{ backgroundColor: o.color }} />
                                  <input
                                    type="color"
                                    value={o.color}
                                    onChange={e => updateTextOverlay(o.id, { color: e.target.value })}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                  />
                                </div>

                                <span className="w-px h-3.5 bg-neutral-800 mx-0.5" />

                                <button
                                  onClick={() => deleteTextOverlay(o.id)}
                                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-950/40 text-neutral-400 hover:text-red-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            {isEditing ? (
                              <input
                                type="text"
                                value={o.text}
                                onChange={e => updateTextOverlay(o.id, { text: e.target.value })}
                                onBlur={() => setEditingOverlayId(null)}
                                onKeyDown={e => { if (e.key === 'Enter') setEditingOverlayId(null); }}
                                onMouseDown={e => e.stopPropagation()} // don't drag while highlighting text
                                className="bg-transparent border-none outline-none focus:ring-0 p-0 m-0 w-auto min-w-[120px] text-inherit text-center"
                                autoFocus
                              />
                            ) : (
                              <span className="whitespace-nowrap px-2 block">{o.text}</span>
                            )}

                            {/* Pro Bounding Box: 8 Selection Handles */}
                            {isSelected && (
                              <>
                                <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#1D9BF0] border border-white rounded-sm pointer-events-none" />
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#1D9BF0] border border-white rounded-sm pointer-events-none" />
                                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#1D9BF0] border border-white rounded-sm pointer-events-none" />
                                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#1D9BF0] border border-white rounded-sm pointer-events-none" />
                                
                                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-[#1D9BF0] border border-white rounded-sm pointer-events-none" />
                                <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-[#1D9BF0] border border-white rounded-sm pointer-events-none" />
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1D9BF0] border border-white rounded-sm pointer-events-none" />
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1D9BF0] border border-white rounded-sm pointer-events-none" />
                              </>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-500 border border-neutral-800 rounded bg-neutral-900/10 min-h-[400px]">
                <FileText className="w-8 h-8 text-neutral-700 mb-2" />
                <p className="text-xs font-mono">No document loaded for editing</p>
                <p className="text-[10px] font-sans text-neutral-600 mt-1">Upload a PDF and switch to Edit PDF mode to append texts and annotations</p>
              </div>
            )
          ) : activeTab === 'merge' ? (
            <InteractivePreview
              pdfSource={mergePreviewBuffer}
              pageCount={
                mergePreviewBuffer
                  ? undefined // let pdfjs report the real count from the buffer
                  : mergeFiles.reduce((sum, f) => sum + (f.pageCount ?? 0), 0) || undefined
              }
              onDownload={
                mergePreviewBuffer
                  ? () => downloadBlob(mergePreviewBuffer, 'merged-output.pdf')
                  : mergeFiles.length >= 2
                    ? handleMerge
                    : undefined
              }
            />
          ) : (
            <InteractivePreview
              pdfSource={selectedFile?.file ?? null}
              pageCount={selectedFile?.pageCount ?? undefined}
              onDownload={
                selectedFile
                  ? activeTab === 'compress' && compressFile
                    ? handleCompress
                    : activeTab === 'split' && splitFile && splitRange.trim()
                      ? handleSplit
                      : () => {
                          const url = URL.createObjectURL(selectedFile.file);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = selectedFile.name;
                          a.click();
                          URL.revokeObjectURL(url);
                        }
                  : undefined
              }
            />
          )}
        </div>

      </div>

      {/* Footer Status and Info */}
      <div className="px-4 py-2.5 bg-neutral-900/80 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          {mergeWorking || compressWorking || splitWorking || editWorking || mergePreviewBuilding ? (
            <span className="text-neutral-400 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse" />
              <span>{mergePreviewBuilding && !mergeWorking ? 'Generating preview…' : 'Processing PDF...'}</span>
            </span>
          ) : (
            <span className="text-sky-400 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ready for Processing</span>
            </span>
          )}
        </div>

        <div className="text-neutral-400 text-[11px] flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-neutral-500" />
          <span>Local browser sandbox • No data transmitted to servers</span>
        </div>
      </div>

    </div>
  );
};
