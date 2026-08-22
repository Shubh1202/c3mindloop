# Implementation Plan

## Overview

This task list follows the exploratory bugfix workflow for the Cut & Move quality fix.
Tasks are ordered: explore the bug first (Property 1), establish the preservation baseline (Property 2), implement the fix, then validate everything passes.

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1"] },
    { "wave": 2, "tasks": ["2"] },
    { "wave": 3, "tasks": ["3.1"] },
    { "wave": 4, "tasks": ["3.2", "3.3", "3.4"] },
    { "wave": 5, "tasks": ["3.5"] },
    { "wave": 6, "tasks": ["3.6", "3.7"] },
    { "wave": 7, "tasks": ["4"] }
  ]
}
```

## Tasks

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Raster PNG Embedded for Cut & Move CutoutOverlay
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate that `buildEditedPdf` embeds `previewDataUrl` as a raster PNG when processing an overlay created by Cut & Move
  - **Scoped PBT Approach**: Scope the property to a concrete `CutoutOverlay`-shaped input (kind='cutout', all required PDF-space source coords present). On unfixed code this overlay will hit the `kind === 'image'` fallthrough or be mishandled; the exported bytes will contain the base64 fragment of `previewDataUrl`
  - Bug Condition (from design): `overlay.kind = 'image'` AND overlay was created by Cut & Move AND export calls `pdfDoc.embedPng(overlay.dataUrl)` — equivalently, any overlay with `kind='cutout'` that the unfixed export path cannot handle correctly
  - Test file: `app/components/tools/editor/__tests__/pdf-editor.service.pbt.test.ts`
  - Write an `fc.asyncProperty` over `arbitraryCutoutOverlay()` that calls `buildEditedPdf` and asserts the exported bytes do NOT contain the first 20 characters of `overlay.previewDataUrl`'s base64 payload
  - Use the `FIXTURE_MINIMAL_PDF` and `TINY_PNG_DATA_URL` fixtures defined in the design document
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct — it proves the bug exists)
  - Document the counterexample found (e.g., "exported bytes contain the preview PNG base64 fragment — raster was embedded instead of a Form XObject")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-CutoutOverlay Overlays Produce Identical Export Output
  - **IMPORTANT**: Follow observation-first methodology — run the UNFIXED code with non-buggy inputs first, observe output, then encode as properties
  - Bug non-condition: `overlay.kind !== 'cutout'` (TextOverlay, WhiteoutOverlay, ImageOverlay from user-drop, SignatureOverlay)
  - Test file: `app/components/tools/editor/__tests__/pdf-editor.service.regression.test.ts`
  - Observe: `buildEditedPdf(FIXTURE_MINIMAL_PDF, [textOverlay], ...)` produces a parseable single-page PDF on unfixed code
  - Observe: `buildEditedPdf(FIXTURE_MINIMAL_PDF, [whiteoutOverlay], ...)` produces a parseable single-page PDF on unfixed code
  - Observe: `buildEditedPdf(FIXTURE_MINIMAL_PDF, [imageOverlay], ...)` (user-dropped, not Cut & Move) produces a parseable single-page PDF and uses `embedPng` on unfixed code
  - Observe: `buildEditedPdf(FIXTURE_MINIMAL_PDF, [signatureOverlay], ...)` produces a parseable single-page PDF on unfixed code
  - Observe: `buildEditedPdf(FIXTURE_MINIMAL_PDF, [], ...)` (no overlays) produces a parseable single-page PDF on unfixed code
  - Write regression tests RT-1 through RT-5 as defined in the design document's Testing Strategy section
  - Note: byte-identity (`toEqual`) is NOT required — pdf-lib serialization is not guaranteed deterministic; assert parseability and page count only
  - Run all regression tests on UNFIXED code
  - **EXPECTED OUTCOME**: All regression tests PASS (confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and all pass on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 3. Fix: Replace raster-export path with vector Form XObject for Cut & Move

  - [x] 3.1 Add `CutoutOverlay` type to `editor/editor.types.ts`
    - Add the `CutoutOverlay` interface with fields: `kind: 'cutout'`, `srcPdfX`, `srcPdfY`, `srcPdfW`, `srcPdfH` (PDF-space source rect in points), `srcPageIndex`, `width`, `height`, `previewDataUrl`, `opacity`
    - Add `CutoutOverlay` to the `Overlay` discriminated union
    - `previewDataUrl` must carry a JSDoc comment: "Raster preview for drag UI only. MUST NEVER be read by buildEditedPdf or any export path."
    - _Bug_Condition: isBugCondition(overlay) where overlay.kind='image' AND created by Cut & Move AND export calls pdfDoc.embedPng — fixed by introducing a distinct 'cutout' kind_
    - _Expected_Behavior: overlay.kind='cutout' carries PDF-space source coordinates; export uses embedPage+drawPage instead of embedPng+drawImage_
    - _Preservation: No changes to TextOverlay, WhiteoutOverlay, ImageOverlay, or SignatureOverlay interfaces or the Overlay union members they occupy_
    - _Requirements: 2.1, 2.2_

  - [x] 3.2 Derive `pagePdfSizes` at file-load in `PdfEditor/index.tsx`
    - Add `pagePdfSizes` state (array of `{ width: number; height: number }`)
    - Add a `useEffect` on `state.file` that loads a separate `PDFDocument` instance via `pdf-lib` and calls `doc.getPages().map(p => p.getSize())`
    - Derive `pagePdfSize` for the active page using `pageMeta[activePage].originalIndex` with an A4 fallback (`{ width: 595, height: 842 }`) for the window before sizes load
    - Pass `pagePdfSize` as a new prop to `PdfEditorCanvas`
    - _Requirements: 2.1_

  - [x] 3.3 Update `PdfEditorCanvas.tsx` to compute PDF-space coordinates and call updated `onCutoutDrawn`
    - Add `pagePdfSize: { width: number; height: number }` to the `Props` interface
    - In the cutout `handleCanvasMouseUp` branch: compute `srcPdfX = whiteoutRect.x * pdfW`, `srcPdfY = (1 - whiteoutRect.y - whiteoutRect.h) * pdfH`, `srcPdfW = whiteoutRect.w * pdfW`, `srcPdfH = whiteoutRect.h * pdfH` (Y-axis flip for PDF bottom-up convention)
    - Call `toDataURL('image/png')` for `previewDataUrl` (UI preview only — not passed to export)
    - Update `onCutoutDrawn` call signature to pass `(x, y, w, h, srcPdfX, srcPdfY, srcPdfW, srcPdfH, previewDataUrl)`
    - Update the `onCutoutDrawn` prop type declaration to match the new signature
    - Add `CutoutOverlay` rendering branch to `OverlayElement`: render `previewDataUrl` as `<img>` with `pointerEvents: 'none'`; include `FloatingPropertiesPanel`, `ResizeHandles` (same infrastructure as `ImageOverlay`)
    - _Bug_Condition: Previous path passed canvas dataUrl to addCutout which stored it as ImageOverlay for export_
    - _Expected_Behavior: previewDataUrl is UI-only; PDF-space coords are passed to addCutout for storage in CutoutOverlay_
    - _Preservation: All other overlay rendering branches (text, whiteout, image, signature) are not modified_
    - _Requirements: 2.1, 2.5_

  - [x] 3.4 Rewrite `addCutout` in `editor/editor.state.ts`
    - Update `addCutout` signature to accept `(x, y, w, h, srcPdfX, srcPdfY, srcPdfW, srcPdfH, previewDataUrl)`
    - Replace the `WhiteoutOverlay + ImageOverlay` pair with a single `CutoutOverlay` using `kind: 'cutout'`
    - Set `srcPageIndex = pageMeta[activePage].originalIndex ?? activePage` (stable through reorder/delete)
    - Push history snapshot before state mutation (same pattern as existing overlay additions)
    - Set `selectedId` and switch `toolMode` to `'select'` after creation
    - Update the `onCutoutDrawn` call site that invokes `addCutout` to pass the new arguments
    - _Bug_Condition: Previous addCutout created WhiteoutOverlay+ImageOverlay — ImageOverlay.kind='image' was indistinguishable from user-dropped images at export time_
    - _Expected_Behavior: Single CutoutOverlay with PDF-space source coords; no ImageOverlay created by Cut & Move path_
    - _Preservation: No changes to addText, addWhiteout, addImage, addSignature, undo/redo, or any other state mutations_
    - _Requirements: 2.1, 2.2_

  - [x] 3.5 Add `'cutout'` export branch and `applyCoverRect` to `editor/pdf-editor.service.ts`
    - Add `if (overlay.kind === 'cutout')` branch in `buildEditedPdf`'s overlay loop
    - Guard: `if (!srcPage || !destPage) continue;` for out-of-range `srcPageIndex`
    - Build `boundingBox = { left: srcPdfX, bottom: srcPdfY, right: srcPdfX + srcPdfW, top: srcPdfY + srcPdfH }` (pdf-lib bottom-left origin)
    - Call `await pdfDoc.embedPage(srcPage, boundingBox)` to create a Form XObject (no rasterization)
    - Compute destination rect: `dx = overlay.x * dw`, `dy = (1 - overlay.y - overlay.height) * dh`, `dw2 = overlay.width * dw`, `dh2 = overlay.height * dh`
    - Call `applyCoverRect(destPage, overlay)` BEFORE `drawPage` to cover source region
    - Call `destPage.drawPage(xobj, { x: dx, y: dy, width: dw2, height: dh2, opacity: overlay.opacity })`
    - Wrap entire cutout branch in try/catch that re-throws with user-facing message: `"Cut & Move export failed: the source region could not be embedded as vector content. Try redrawing the selection."`
    - Add `applyCoverRect` helper: draws a solid white rectangle at `(srcPdfX, srcPdfY, srcPdfW, srcPdfH)` using `rgb(1, 1, 1)`
    - CRITICAL: `previewDataUrl` must NEVER be read in this branch — no raster fallback under any condition
    - _Bug_Condition: Previous path hit kind='image' branch, called pdfDoc.embedPng(overlay.dataUrl), produced blurry raster in exported PDF_
    - _Expected_Behavior: embedPage+drawPage writes a Form XObject (cm operator, no rasterization); text glyphs and vector paths are preserved at full fidelity_
    - _Preservation: The existing kind='image', kind='text', kind='whiteout', kind='signature' branches are not modified_
    - _Requirements: 2.2, 2.3, 2.4_

  - [x] 3.6 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - No Raster PNG Embedded for CutoutOverlay
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - The test from task 1 (`pdf-editor.service.pbt.test.ts`) encodes the expected behavior: exported bytes must not contain the preview PNG base64 fragment
    - When this test passes, it confirms that `buildEditedPdf` is using `embedPage`/`drawPage` instead of `embedPng` for `CutoutOverlay`
    - Run the property-based test from step 1 with `numRuns: 20`
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed — no raster PNG embedded for cut region)
    - _Requirements: 2.2, 2.5_

  - [x] 3.7 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-CutoutOverlay Overlays Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Run all regression tests RT-1 through RT-5 from `pdf-editor.service.regression.test.ts`
    - **EXPECTED OUTCOME**: All tests PASS (confirms no regressions in TextOverlay, WhiteoutOverlay, ImageOverlay, SignatureOverlay, and no-overlay export paths)
    - Confirm TypeScript compilation succeeds with no type errors across all changed files
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_

- [x] 4. Checkpoint — Ensure all tests pass
  - Run the full test suite for the editor module: `pdf-editor.service.pbt.test.ts`, `pdf-editor.service.acceptance.test.ts`, `pdf-editor.service.regression.test.ts`
  - Verify PBT 1 (no preview PNG base64 in exported bytes) passes with `numRuns: 20`
  - Verify PBT 2 (output is a valid parseable PDF) passes with `numRuns: 20`
  - Verify acceptance tests AT-1 through AT-6 all pass (including the spy-based AT-6 confirming `embedPage` is called and `embedPng` is not called with preview data)
  - Verify regression tests RT-1 through RT-5 all pass
  - Verify TypeScript reports zero errors for: `editor.types.ts`, `editor.state.ts`, `pdf-editor.service.ts`, `PdfEditorCanvas.tsx`, `PdfEditor/index.tsx`
  - If any test fails, do not proceed — diagnose and fix before marking this checkpoint complete
  - Ask the user if any questions arise about edge cases (e.g., multi-page PDFs, encrypted source PDFs, overlays spanning page boundaries)

## Notes

- The `previewDataUrl` on `CutoutOverlay` is strictly UI-only. It must never reach any export code path. If `embedPage` fails (e.g., encrypted PDF stream), the export must fail with a clear user-facing error — no silent raster fallback is permitted under any condition.
- Byte-identity assertions between unfixed and fixed exports for non-cutout overlays are intentionally avoided because pdf-lib serialization is non-deterministic (timestamps, object IDs). Parseability and page count are the correct preservation assertions.
- `srcPageIndex` uses `PageMeta.originalIndex` (set at file-load and never mutated), so the source page reference remains stable through all page reorder and delete operations.
- The A4 fallback (`595 × 842`) in `PdfEditor/index.tsx` only applies during the brief async window while page sizes are loading. The canvas cannot complete a draw gesture before the page is rendered, so this fallback is unreachable in practice.
