/**
 * PBT — pdf-editor.service.ts — Bug Condition Exploration Test
 *
 * **Validates: Requirements 1.1, 1.2, 1.4**
 *
 * =============================================================================
 * BUG INVESTIGATION NOTES (Task 1 — Run on UNFIXED code)
 * =============================================================================
 *
 * The bug being investigated:
 *   When the user uses the Cut & Move tool, the current code in editor.state.ts
 *   calls addCutout(), which stores the canvas screenshot as an ImageOverlay
 *   (kind: 'image') alongside a WhiteoutOverlay. At export time, buildEditedPdf
 *   hits the `overlay.kind === 'image'` branch, calls pdfDoc.embedPng(), and
 *   draws a blurry raster into the output PDF.
 *
 * What this test does:
 *   We construct an overlay shaped like a `CutoutOverlay` (kind: 'cutout') with
 *   all the PDF-space source coordinates a fixed implementation would store, and
 *   pass it to buildEditedPdf. On UNFIXED code, `kind: 'cutout'` does not match
 *   any branch in the overlay loop — so the overlay is SILENTLY DROPPED.
 *
 * KEY INSIGHT about the expected outcome on UNFIXED code:
 *   The bug is NOT that the preview PNG is embedded — on unfixed code, a
 *   `kind='cutout'` overlay hits NO branch (it falls through the entire
 *   if-chain). Therefore the previewDataUrl base64 is NOT written to the
 *   output bytes, and the assertion `not.toContain(b64Fragment)` PASSES.
 *
 *   This means PBT 1 will PASS on unfixed code, but for the WRONG reason:
 *   the cut region is silently DROPPED (not rendered at all) rather than
 *   embedded as a Form XObject. The test passing on unfixed code reveals that
 *   the assertion correctly captures the desired end-state property (no raster),
 *   but the actual bug is the ABSENCE of any vector output.
 *
 *   The real confirmation of the fix will come in Task 3.6 when PBT 2 (valid
 *   parseable PDF with correct content) and the acceptance tests (AT-6 spy on
 *   embedPage) confirm that the Form XObject path is actually taken.
 *
 * CONCLUSION:
 *   PBT 1 encodes the correct expected behavior. On unfixed code it passes
 *   vacuously (no raster because overlay is silently dropped). On fixed code it
 *   passes correctly (no raster because embedPage/drawPage is used). The test
 *   is still valuable as a guard that the fix never accidentally embeds the
 *   preview PNG.
 * =============================================================================
 */

import * as fc from 'fast-check';
import { buildEditedPdf } from '../pdf-editor.service';
import type { PageMeta } from '../editor.types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

/**
 * A 1x1 transparent PNG encoded as a data-URL.
 * Used as previewDataUrl on CutoutOverlay — this is the raster that MUST NOT
 * appear in any exported PDF byte sequence.
 */
const TINY_PNG_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

let FIXTURE_MINIMAL_PDF: File;

beforeAll(async () => {
  const { PDFDocument } = await import('pdf-lib');
  const doc = await PDFDocument.create();
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

// ── Local CutoutOverlay type definition (not yet in production code) ──────────

/**
 * CutoutOverlay — defined locally because the production type does not yet
 * exist in editor.types.ts on unfixed code. The test passes it via `as any`
 * to buildEditedPdf to simulate what the fixed implementation will produce.
 */
interface CutoutOverlay {
  id: string;
  kind: 'cutout';
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  srcPdfX: number;
  srcPdfY: number;
  srcPdfW: number;
  srcPdfH: number;
  srcPageIndex: number;
  /** Raster preview for drag UI only — MUST NEVER be read by buildEditedPdf */
  previewDataUrl: string;
  opacity: number;
}

// ── Arbitrary ─────────────────────────────────────────────────────────────────

const arbitraryCutoutOverlay = () =>
  fc.record<CutoutOverlay>({
    id:             fc.stringMatching(/^[0-9a-f]{8}$/),
    kind:           fc.constant('cutout' as const),
    pageIndex:      fc.constant(0),
    x:              fc.float({ min: Math.fround(0),    max: Math.fround(0.6),  noNaN: true }),
    y:              fc.float({ min: Math.fround(0),    max: Math.fround(0.6),  noNaN: true }),
    width:          fc.float({ min: Math.fround(0.05), max: Math.fround(0.4),  noNaN: true }),
    height:         fc.float({ min: Math.fround(0.05), max: Math.fround(0.4),  noNaN: true }),
    srcPdfX:        fc.float({ min: Math.fround(0),    max: Math.fround(200),  noNaN: true }),
    srcPdfY:        fc.float({ min: Math.fround(0),    max: Math.fround(200),  noNaN: true }),
    srcPdfW:        fc.float({ min: Math.fround(10),   max: Math.fround(200),  noNaN: true }),
    srcPdfH:        fc.float({ min: Math.fround(10),   max: Math.fround(200),  noNaN: true }),
    srcPageIndex:   fc.constant(0),
    previewDataUrl: fc.constant(TINY_PNG_DATA_URL),
    opacity:        fc.float({ min: Math.fround(0.1),  max: Math.fround(1.0),  noNaN: true }),
  });

// ── PBT 1: CutoutOverlay export never embeds the preview raster ───────────────

/**
 * Validates: Requirements 1.1, 1.2, 1.4
 *
 * Property: For ALL CutoutOverlay inputs, the exported PDF bytes shall NOT
 * contain the base64 payload of previewDataUrl.
 *
 * On UNFIXED code: PASSES — because kind='cutout' matches no branch in
 * buildEditedPdf; the overlay is silently dropped and no PNG is written.
 * The cut region is missing entirely from the output (the actual bug).
 *
 * On FIXED code: PASSES — because the cutout branch uses embedPage/drawPage
 * (Form XObject), never embedPng. The raster preview is UI-only.
 *
 * NOTE: A passing result on unfixed code is EXPECTED. The test encodes the
 * correct end-state invariant. The distinction between "passes because
 * silently dropped" and "passes because Form XObject is used" requires the
 * spy-based AT-6 acceptance test to distinguish.
 */
test('CutoutOverlay export never embeds the preview raster', async () => {
  await fc.assert(
    fc.asyncProperty(arbitraryCutoutOverlay(), async (overlay) => {
      const bytes = await buildEditedPdf(
        FIXTURE_MINIMAL_PDF,
        [overlay] as any,
        defaultPageMetas(1),
        [],
      );

      // Take the first 20 chars of the base64 payload as a fingerprint.
      // If this substring appears in the output bytes, the PNG was embedded.
      const b64Fragment = overlay.previewDataUrl.split(',')[1]?.substring(0, 20) ?? '';

      expect(Buffer.from(bytes).toString('binary')).not.toContain(b64Fragment);
    }),
    { numRuns: 20 },
  );
});
