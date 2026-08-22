# Bugfix Requirements Document

## Introduction

The "Cut & Move" tool in the PDF editor (`/tools/edit-pdf`) produces blurry, low-quality output when the moved content is exported. The root cause is that the current implementation rasterizes the selected PDF region into a low-resolution canvas screenshot, stores it as a PNG data-URL (`ImageOverlay`), and embeds that raster image into the exported PDF. Because the raster is captured at screen resolution rather than at the native PDF content resolution, text and vector content become visually degraded — the exported result looks like a screenshot pasted onto the document rather than native PDF content.

The fix must replace the raster-crop path for export with a vector-quality representation (e.g., a PDF Form XObject / clipped content stream copied from the original PDF), while keeping the interactive raster preview for the drag-and-drop UI experience.

---

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the user draws a Cut & Move rectangle over a region that contains text, THEN the system captures that region as a low-resolution raster image by calling `canvas.toDataURL('image/png')` on the pdfjs-rendered canvas and stores the result as an `ImageOverlay`.

1.2 WHEN the captured `ImageOverlay` is exported to PDF, THEN the system embeds the raster PNG via `pdfDoc.embedPng()` and draws it with `page.drawImage()`, causing text and vector content inside the moved region to appear blurry and visually degraded compared to the surrounding native PDF content.

1.3 WHEN a white rectangle (`WhiteoutOverlay`) is drawn over the original source region and the raster `ImageOverlay` is placed on top of it at the same or a different position, THEN the system draws a solid white rectangle on the exported page to cover the original content, which can leave a visible white block, mismatched background, or seam artifact if the page background is not pure white.

1.4 WHEN the user resizes or repositions the cutout overlay before exporting, THEN the system scales the raster PNG to the new dimensions, further degrading quality because a fixed-resolution raster is stretched or compressed.

### Expected Behavior (Correct)

2.1 WHEN the user draws a Cut & Move rectangle over a region that contains text, THEN the system SHALL capture the source rectangle coordinates in PDF-space (not canvas-space) and store them as a `CutoutOverlay` that references the source page, source rectangle, and the user-specified destination position — without converting the content to a raster image as the canonical export representation.

2.2 WHEN a `CutoutOverlay` is exported to PDF, THEN the system SHALL reproduce the moved content using a native PDF mechanism (e.g., a Form XObject constructed from the original page's content stream with a clipping rectangle, or an equivalent pdf-lib transformation) so that text remains as vector text, lines remain as vector lines, and images retain their original embedded resolution in the output PDF.

2.3 WHEN the original source region is covered in the exported PDF, THEN the system SHALL use a coverage method that matches the page background as closely as possible (e.g., by clipping or by sampling the page background color) rather than unconditionally drawing a solid white rectangle, so that no visible block or seam is left at the source location.

2.4 WHEN the user resizes or repositions the cutout overlay before exporting, THEN the system SHALL apply a PDF transformation matrix (scale + translate) to the Form XObject at export time so that quality is not degraded by stretching a raster image.

2.5 WHEN a `CutoutOverlay` is displayed in the interactive editor canvas, THEN the system SHALL STILL use a raster preview image for the draggable overlay during editing (acceptable for interactive use), but the raster preview SHALL NOT be used as the source for the final exported PDF content.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the user uses the Select tool to move, resize, or delete any overlay (text, whiteout, image, signature), THEN the system SHALL CONTINUE TO apply those overlays to the exported PDF exactly as before, with no change to the existing overlay export logic.

3.2 WHEN the user uses the Whiteout tool to draw a white rectangle, THEN the system SHALL CONTINUE TO draw a solid white rectangle on the exported page as before.

3.3 WHEN the user adds a Text overlay, THEN the system SHALL CONTINUE TO embed and render that text as native PDF text in the export, with no regression in font embedding or positioning.

3.4 WHEN the user adds an Image or Signature overlay (not from Cut & Move), THEN the system SHALL CONTINUE TO embed and render that raster image in the export as before.

3.5 WHEN the user performs Undo or Redo after creating a Cut & Move cutout, THEN the system SHALL CONTINUE TO correctly restore or re-apply the cutout overlay state.

3.6 WHEN the user exports a PDF that has no Cut & Move overlays, THEN the system SHALL CONTINUE TO export the PDF identically to the existing behavior.

3.7 WHEN the user navigates between pages, changes zoom level, or rotates a page in the editor, THEN the system SHALL CONTINUE TO render and interact with overlays correctly on all pages.

3.8 WHEN the user uses the page management tools (delete page, reorder page, rotate page), THEN the system SHALL CONTINUE TO produce a correctly ordered and rotated output PDF with no regression.

---

## Bug Condition (Pseudocode)

**Bug Condition Function** — identifies inputs that trigger the quality defect:

```pascal
FUNCTION isBugCondition(overlay)
  INPUT: overlay of type Overlay
  OUTPUT: boolean

  RETURN overlay.kind = 'image'
    AND overlay was created by the Cut & Move tool (i.e., paired with a WhiteoutOverlay at same position)
    AND the export path calls pdfDoc.embedPng(overlay.dataUrl)
END FUNCTION
```

**Property: Fix Checking**
```pascal
FOR ALL cutoutOverlay WHERE isBugCondition(cutoutOverlay) DO
  exportedPage ← buildEditedPdf'(sourceFile, [cutoutOverlay])
  contentAtDestination ← inspectPageContent(exportedPage, cutoutOverlay.destRect)
  ASSERT contentAtDestination is NOT a raster-embedded PNG of the source region
  ASSERT contentAtDestination preserves vector/text fidelity from source page
END FOR
```

**Property: Preservation Checking**
```pascal
FOR ALL overlay WHERE NOT isBugCondition(overlay) DO
  ASSERT buildEditedPdf(sourceFile, [overlay]) = buildEditedPdf'(sourceFile, [overlay])
END FOR
```
