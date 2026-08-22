/**
 * Acceptance Tests — pdf-editor.service.ts — CutoutOverlay Fix Validation
 *
 * **Validates: Requirements 2.2, 2.3, 2.4, 2.5**
 *
 * =============================================================================
 * PURPOSE (Task 4 — Run on FIXED code, all must PASS)
 * =============================================================================
 *
 * These acceptance tests confirm that the CutoutOverlay fix is working
 * correctly end-to-end:
 *
 *   AT-1  Text-heavy region: preview PNG base64 never appears in exported bytes
 *   AT-2  Move without resize: output is a valid parseable PDF
 *   AT-3  Move + resize: output is a valid parseable PDF (tests matrix scaling)
 *   AT-4  No unexpected page duplication: output page count equals input
 *   AT-5  PBT — no preview PNG base64 for any CutoutOverlay geometry (broad)
 *   AT-6  Spy confirms embedPage is called and embedPng is NOT called with preview
 *
 * CutoutOverlay is imported from production code (editor.types.ts) since Task 3.1
 * has added it there.
 * =============================================================================
 */

import * as fc from 'fast-check';
import { PDFDocument } from 'pdf-lib';
import { buildEditedPdf } from '../pdf-editor.service';
import type { CutoutOverlay, PageMeta } from '../editor.types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

/**
 * A 1×1 transparent PNG encoded as a data-URL.
 * Used as previewDataUrl on CutoutOverlay — this is the raster that MUST NOT
 * appear in any exported PDF byte sequence.
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

/**
 * Create a CutoutOverlay with sensible defaults, with optional overrides.
 */
function makeCutoutOverlay(overrides: Partial<CutoutOverlay> = {}): CutoutOverlay {
  return {
    id: 'test-cutout',
    kind: 'cutout',
    pageIndex: 0,
    x: 0.1, y: 0.1, width: 0.2, height: 0.1,
    srcPdfX: 50, srcPdfY: 650, srcPdfW: 200, srcPdfH: 80,
    srcPageIndex: 0,
    previewDataUrl: TINY_PNG_DATA_URL,
    opacity: 1.0,
    ...overrides,
  };
}

// ── AT-1: Text-heavy region — preview PNG not embedded ────────────────────────

/**
 * Validates: Requirements 2.2, 2.5
 *
 * The source region contains text (drawText 'Hello World'). The preview PNG
 * base64 payload must not appear anywhere in the exported PDF bytes.
 * This confirms that embedPage/drawPage (Form XObject) is used — not embedPng.
 */
test('AT-1: text-heavy CutoutOverlay: preview PNG base64 not in exported bytes', async () => {
  const overlay = makeCutoutOverlay({ srcPdfX: 50, srcPdfY: 650, srcPdfW: 200, srcPdfH: 80 });
  const bytes = await buildEditedPdf(FIXTURE_MINIMAL_PDF, [overlay], defaultPageMetas(1), []);
  const b64 = TINY_PNG_DATA_URL.split(',')[1].substring(0, 20);
  expect(Buffer.from(bytes).toString('binary')).not.toContain(b64);
});

// ── AT-2: Move without resize — output parseable ──────────────────────────────

/**
 * Validates: Requirements 2.3
 *
 * The overlay is moved to a new position (x: 0.5, y: 0.5) without changing
 * the width/height relative to the default. Output must be a valid PDF.
 */
test('AT-2: move-only (no resize): output is a valid PDF', async () => {
  const overlay = makeCutoutOverlay({ x: 0.5, y: 0.5, width: 0.2, height: 0.1 });
  const bytes = await buildEditedPdf(FIXTURE_MINIMAL_PDF, [overlay], defaultPageMetas(1), []);
  await expect(PDFDocument.load(bytes)).resolves.toBeDefined();
});

// ── AT-3: Move + resize ───────────────────────────────────────────────────────

/**
 * Validates: Requirements 2.3, 2.4
 *
 * The overlay is scaled to a larger destination size (0.5 × 0.5 fractions).
 * This exercises the cm matrix scaling path in drawPage — no rasterization.
 */
test('AT-3: move + resize: output is a valid PDF', async () => {
  const overlay = makeCutoutOverlay({ width: 0.5, height: 0.5 });
  const bytes = await buildEditedPdf(FIXTURE_MINIMAL_PDF, [overlay], defaultPageMetas(1), []);
  await expect(PDFDocument.load(bytes)).resolves.toBeDefined();
});

// ── AT-4: No unexpected page duplication ──────────────────────────────────────

/**
 * Validates: Requirements 2.3
 *
 * embedPage stamps a Form XObject — it must not duplicate the page.
 * Output page count must equal input page count (1).
 */
test('AT-4: page count of output equals input page count', async () => {
  const overlay = makeCutoutOverlay({});
  const bytes = await buildEditedPdf(FIXTURE_MINIMAL_PDF, [overlay], defaultPageMetas(1), []);
  const parsed = await PDFDocument.load(bytes);
  expect(parsed.getPageCount()).toBe(1);
});

// ── AT-5: PBT — no preview PNG base64 for any geometry ───────────────────────

/**
 * Validates: Requirements 2.2, 2.5
 *
 * Property: For ALL CutoutOverlay geometry configurations, the exported PDF
 * bytes shall NOT contain the base64 payload of previewDataUrl.
 *
 * This is a broad property-based test that exercises many different
 * positions, sizes, and source rectangle configurations.
 */
test('AT-5: PBT — no preview PNG base64 for any CutoutOverlay geometry', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.record({
        x:       fc.float({ min: Math.fround(0),    max: Math.fround(0.6),  noNaN: true }),
        y:       fc.float({ min: Math.fround(0),    max: Math.fround(0.6),  noNaN: true }),
        width:   fc.float({ min: Math.fround(0.05), max: Math.fround(0.4),  noNaN: true }),
        height:  fc.float({ min: Math.fround(0.05), max: Math.fround(0.4),  noNaN: true }),
        srcPdfX: fc.float({ min: Math.fround(0),    max: Math.fround(200),  noNaN: true }),
        srcPdfY: fc.float({ min: Math.fround(0),    max: Math.fround(200),  noNaN: true }),
        srcPdfW: fc.float({ min: Math.fround(10),   max: Math.fround(200),  noNaN: true }),
        srcPdfH: fc.float({ min: Math.fround(10),   max: Math.fround(200),  noNaN: true }),
        opacity: fc.float({ min: Math.fround(0.1),  max: Math.fround(1.0),  noNaN: true }),
      }),
      async (geom) => {
        const overlay = makeCutoutOverlay(geom);
        const bytes = await buildEditedPdf(FIXTURE_MINIMAL_PDF, [overlay], defaultPageMetas(1), []);
        const b64 = overlay.previewDataUrl.split(',')[1]?.substring(0, 20) ?? '';
        expect(Buffer.from(bytes).toString('binary')).not.toContain(b64);
      },
    ),
    { numRuns: 20 },
  );
});

// ── AT-6: embedPage is called (not embedPng) — spy-based ─────────────────────

/**
 * Validates: Requirements 2.2, 2.3, 2.5
 *
 * Spy-based confirmation that:
 *   - pdfDoc.embedPage is called exactly once for a CutoutOverlay
 *   - pdfDoc.embedPng is NOT called with any image data (preview raster not embedded)
 *
 * This is the definitive test that distinguishes "passed because Form XObject"
 * from "passed because overlay was silently dropped".
 */
test('AT-6: buildEditedPdf calls embedPage, not embedPng, for CutoutOverlay', async () => {
  const { PDFDocument: PD } = await import('pdf-lib');
  const embedPngSpy = jest.spyOn(PD.prototype, 'embedPng');
  const embedPageSpy = jest.spyOn(PD.prototype, 'embedPage');

  const overlay = makeCutoutOverlay({});
  await buildEditedPdf(FIXTURE_MINIMAL_PDF, [overlay], defaultPageMetas(1), []);

  expect(embedPngSpy).not.toHaveBeenCalledWith(expect.stringContaining('data:image'));
  expect(embedPageSpy).toHaveBeenCalledTimes(1);

  embedPngSpy.mockRestore();
  embedPageSpy.mockRestore();
});
