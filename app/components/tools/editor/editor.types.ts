// ── Shared PDF file descriptor ────────────────────────────────────────────────

export interface PdfFile {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  pageCount: number | null;
}

// ── Tool modes ────────────────────────────────────────────────────────────────

export type ToolMode =
  | 'select'      // move / select overlays
  | 'text'        // place a new text overlay
  | 'whiteout'    // draw a white rectangle (cover existing content)
  | 'image'       // place an image / stamp
  | 'signature';  // freehand draw signature

// ── Overlay element types ─────────────────────────────────────────────────────

export type FontFamily = 'sans' | 'serif' | 'mono';

export interface BaseOverlay {
  id: string;
  pageIndex: number;   // 0-based
  /** Fraction 0–1 of rendered canvas width  */
  x: number;
  /** Fraction 0–1 of rendered canvas height */
  y: number;
}

export interface TextOverlay extends BaseOverlay {
  kind: 'text';
  text: string;
  fontSize: number;
  fontFamily: FontFamily;
  color: string;   // hex
  opacity: number; // 0–1
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface WhiteoutOverlay extends BaseOverlay {
  kind: 'whiteout';
  /** Fraction of canvas width  */
  width: number;
  /** Fraction of canvas height */
  height: number;
  /** Optional replacement text drawn on top of the white rect */
  replacementText?: string;
  replacementFontSize?: number;
  replacementFontFamily?: FontFamily;
  replacementColor?: string;
}

export interface ImageOverlay extends BaseOverlay {
  kind: 'image';
  /** data-URL (jpeg/png) */
  dataUrl: string;
  /** Fraction of canvas width  */
  width: number;
  /** Fraction of canvas height */
  height: number;
  opacity: number;
}

export interface SignatureOverlay extends BaseOverlay {
  kind: 'signature';
  /** data-URL of the drawn signature (PNG) */
  dataUrl: string;
  width: number;
  height: number;
  opacity: number;
}

export type Overlay =
  | TextOverlay
  | WhiteoutOverlay
  | ImageOverlay
  | SignatureOverlay;

// ── Page management ───────────────────────────────────────────────────────────

export type RotationDeg = 0 | 90 | 180 | 270;

export interface PageMeta {
  /** 0-based original index in the loaded PDF */
  originalIndex: number;
  rotation: RotationDeg;
  deleted: boolean;
}

// ── AcroForm field ────────────────────────────────────────────────────────────

export interface FormField {
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'unknown';
  value: string;
  options?: string[]; // for dropdown / radio
}

// ── Editor state shape (used by useEditorState) ───────────────────────────────

export interface EditorState {
  file: PdfFile | null;
  overlays: Overlay[];
  selectedId: string | null;
  editingId: string | null;   // overlay currently in text-edit mode
  activePage: number;         // 0-based
  zoom: number;
  toolMode: ToolMode;
  pageMetas: PageMeta[];
  formFields: FormField[];
  working: boolean;
  error: string | null;
  success: string | null;
}
