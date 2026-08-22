/**
 * Regression Tests — pdf-editor.service.ts — Preservation Baseline
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
 *
 * =============================================================================
 * PURPOSE (Task 2 — Run on UNFIXED code, all must PASS)
 * =============================================================================
 *
 * These tests establish the preservation baseline for non-CutoutOverlay
 * overlay types. They confirm that TextOverlay, WhiteoutOverlay, ImageOverlay
 * (user-dropped), SignatureOverlay, and the no-overlay case all produce a
 * parseable, correctly-paged PDF on the UNFIXED code.
 *
 * This baseline must remain passing after the fix is implemented (Task 3.7).
 *
 * NOTE: Byte-identity (toEqual) is intentionally NOT asserted — pdf-lib
 * serialization is non-deterministic (timestamps, object IDs).
 * Parseability and page count are the correct preservation assertions.
 * =============================================================================
 */

import { PDFDocument } from 'pdf-lib';
import { buildEditedPdf } from '../pdf-editor.service';
import type { TextOverlay, WhiteoutOverlay, ImageOverlay, SignatureOverlay, PageMeta } from '../editor.types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

/**
 * A 1×1 transparent PNG encoded as a data-URL.
 * Used as dataUrl for ImageOverlay and SignatureOverlay in regression tests.
 */
const TINY_PNG_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

let FIXTURE_MINIMAL_PDF: File;

beforeAll(async () => {
  const { PDFDocument: PD } = await import('pdf-lib');
  const doc = await PD.create();
  const page = doc.addPage([595, 842]);
  page.drawText('Hello World', { x: 100, y: 700, size: 24 });
  page.drawLine({ start: { x: 50, y: 600 }, end: { x: 545, y: 600 }, thickness: 1 });
  const bytes = await doc.save();
  FIXTURE_MINIMAL_PDF = new File([bytes.buffer as ArrayBuffer], 'fixture.pdf', { type: 'application/pdf' });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Build a minimal pageMetas array with n non-deleted pages.
 */
function defaultPageMetas(n: number): PageMeta[] {
  return Array.from({ length: n }, (_, i) => ({
    originalIndex: i,
    rotation: 0 as const,
    deleted: false,
  }));
}

// ── RT-1: TextOverlay ─────────────────────────────────────────────────────────

/**
 * Validates: Requirements 3.1
 *
 * TextOverlay is an unrelated overlay kind. The fix must not touch this branch.
 * Baseline: buildEditedPdf with a TextOverlay produces a parseable single-page PDF.
 */
test('RT-1: TextOverlay export produces a parseable single-page PDF', async () => {
  const overlay: TextOverlay = {
    id: 'r1',
    kind: 'text',
    pageIndex: 0,
    x: 0.1,
    y: 0.1,
    text: 'Regression',
    fontSize: 12,
    fontFamily: 'sans',
    color: '#000000',
    opacity: 1,
  };

  const bytes = await buildEditedPdf(FIXTURE_MINIMAL_PDF, [overlay], defaultPageMetas(1), []);
  const parsed = await PDFDocument.load(bytes);

  expect(parsed.getPageCount()).toBe(1);
});

// ── RT-2: WhiteoutOverlay ─────────────────────────────────────────────────────

/**
 * Validates: Requirements 3.2
 *
 * WhiteoutOverlay is an unrelated overlay kind. The fix must not touch this branch.
 * Baseline: buildEditedPdf with a WhiteoutOverlay produces a parseable single-page PDF.
 */
test('RT-2: WhiteoutOverlay export produces a parseable single-page PDF', async () => {
  const overlay: WhiteoutOverlay = {
    id: 'r2',
    kind: 'whiteout',
    pageIndex: 0,
    x: 0.1,
    y: 0.1,
    width: 0.2,
    height: 0.1,
  };

  const bytes = await buildEditedPdf(FIXTURE_MINIMAL_PDF, [overlay], defaultPageMetas(1), []);
  const parsed = await PDFDocument.load(bytes);

  expect(parsed.getPageCount()).toBe(1);
});

// ── RT-3: ImageOverlay (user-dropped, NOT from Cut & Move) ────────────────────

/**
 * Validates: Requirements 3.3
 *
 * A user-dropped ImageOverlay (kind: 'image') must continue to be processed
 * via pdfDoc.embedPng and produce a parseable single-page PDF.
 * The fix adds a new 'cutout' branch but must not modify this existing branch.
 */
test('RT-3: ImageOverlay (user-dropped) export is parseable', async () => {
  const overlay: ImageOverlay = {
    id: 'r3',
    kind: 'image',
    pageIndex: 0,
    x: 0.1,
    y: 0.1,
    dataUrl: TINY_PNG_DATA_URL,
    width: 0.2,
    height: 0.1,
    opacity: 1,
  };

  const bytes = await buildEditedPdf(FIXTURE_MINIMAL_PDF, [overlay], defaultPageMetas(1), []);
  const parsed = await PDFDocument.load(bytes);

  expect(parsed.getPageCount()).toBe(1);
});

// ── RT-4: SignatureOverlay ────────────────────────────────────────────────────

/**
 * Validates: Requirements 3.4
 *
 * SignatureOverlay is an unrelated overlay kind. The fix must not touch this branch.
 * Baseline: buildEditedPdf with a SignatureOverlay produces a parseable single-page PDF.
 */
test('RT-4: SignatureOverlay export is parseable', async () => {
  const overlay: SignatureOverlay = {
    id: 'r4',
    kind: 'signature',
    pageIndex: 0,
    x: 0.1,
    y: 0.7,
    dataUrl: TINY_PNG_DATA_URL,
    width: 0.3,
    height: 0.08,
    opacity: 1,
  };

  const bytes = await buildEditedPdf(FIXTURE_MINIMAL_PDF, [overlay], defaultPageMetas(1), []);
  const parsed = await PDFDocument.load(bytes);

  expect(parsed.getPageCount()).toBe(1);
});

// ── RT-5: No overlays ────────────────────────────────────────────────────────

/**
 * Validates: Requirements 3.5, 3.6
 *
 * The no-overlay case is the base case for export. The fix must not affect it.
 * Baseline: buildEditedPdf with zero overlays produces a parseable single-page PDF.
 */
test('RT-5: no overlays export produces a parseable PDF', async () => {
  const bytes = await buildEditedPdf(FIXTURE_MINIMAL_PDF, [], defaultPageMetas(1), []);
  const parsed = await PDFDocument.load(bytes);

  expect(parsed.getPageCount()).toBe(1);
});
