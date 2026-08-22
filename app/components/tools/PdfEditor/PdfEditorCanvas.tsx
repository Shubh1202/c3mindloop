'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import type { Overlay, ToolMode, PdfFile, FormField } from '../editor/editor.types';
import { renderPageToCanvas, FONT_CSS } from '../editor/editor.utils';

interface PageDims { w: number; h: number; }

interface Props {
  file: PdfFile;
  activePage: number;           // display index (0-based position in pageMetas)
  activeOriginalIndex: number;  // originalIndex of the active page
  pageRotation: number;         // page's user-applied rotation
  zoom: number;
  overlays: Overlay[];
  selectedId: string | null;
  editingId: string | null;
  toolMode: ToolMode;
  formFields: FormField[];
  onSelectOverlay: (id: string | null) => void;
  onStartEditing: (id: string) => void;
  onStopEditing: () => void;
  onMoveOverlay: (id: string, x: number, y: number) => void;
  onCommitMove: (id: string) => void;
  onResizeOverlay: (id: string, patch: Partial<Overlay>) => void;
  onCommitResize: (id: string) => void;
  onUpdateOverlay: (id: string, patch: Partial<Overlay>) => void;
  onUpdateOverlaySilent: (id: string, patch: Partial<Overlay>) => void;
  onCaptureSnapshot: (id: string) => void;
  onDeleteOverlay: (id: string) => void;
  onWhiteoutDrawn: (x: number, y: number, w: number, h: number) => void;
  onCutoutDrawn: (
    x: number, y: number, w: number, h: number,
    srcPdfX: number, srcPdfY: number, srcPdfW: number, srcPdfH: number,
    previewDataUrl: string,
  ) => void;
  onCanvasClick: (xFrac: number, yFrac: number) => void;
  onUpdateFormField: (name: string, value: string) => void;
  pagePdfSize: { width: number; height: number };
}

export const PdfEditorCanvas: React.FC<Props> = ({
  file, activePage, activeOriginalIndex, pageRotation, zoom, overlays, selectedId, editingId, toolMode,
  formFields, onUpdateFormField,
  onSelectOverlay, onStartEditing, onStopEditing,
  onMoveOverlay, onCommitMove, onResizeOverlay, onCommitResize,
  onUpdateOverlay, onUpdateOverlaySilent, onCaptureSnapshot, onDeleteOverlay,
  onWhiteoutDrawn, onCutoutDrawn, onCanvasClick,
  pagePdfSize,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<PageDims | null>(null);
  const [loading, setLoading] = useState(false);

  // Whiteout drag state
  const whiteoutStart = useRef<{ x: number; y: number } | null>(null);
  const [whiteoutRect, setWhiteoutRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // ── Render PDF page ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!file) return;
    let active = true;
    setLoading(true);

    const canvas = canvasRef.current;
    if (!canvas) return;

    renderPageToCanvas(file.file, activeOriginalIndex, canvas, zoom, 520, pageRotation)
      .then(d => { if (active) { setDims(d); setLoading(false); } })
      .catch(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [file, activeOriginalIndex, zoom, pageRotation]);

  // ── Canvas pointer events (whiteout draw / text place) ───────────────────
  const getCanvasFrac = useCallback((e: React.MouseEvent): { x: number; y: number } | null => {
    if (!dims || !containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    // The canvas is centered inside the container
    const canvasEl = canvasRef.current!;
    const canvasRect = canvasEl.getBoundingClientRect();
    const x = (e.clientX - canvasRect.left) / canvasRect.width;
    const y = (e.clientY - canvasRect.top) / canvasRect.height;
    return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
  }, [dims]);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (toolMode === 'whiteout' || toolMode === 'cutout') {
      const frac = getCanvasFrac(e);
      if (!frac) return;
      whiteoutStart.current = frac;
      setWhiteoutRect({ x: frac.x, y: frac.y, w: 0, h: 0 });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if ((toolMode === 'whiteout' || toolMode === 'cutout') && whiteoutStart.current) {
      const frac = getCanvasFrac(e);
      if (!frac) return;
      const sx = whiteoutStart.current.x;
      const sy = whiteoutStart.current.y;
      setWhiteoutRect({
        x: Math.min(sx, frac.x),
        y: Math.min(sy, frac.y),
        w: Math.abs(frac.x - sx),
        h: Math.abs(frac.y - sy),
      });
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    if (whiteoutStart.current && whiteoutRect) {
      if (whiteoutRect.w > 0.01 && whiteoutRect.h > 0.01) {
        if (toolMode === 'whiteout') {
          onWhiteoutDrawn(whiteoutRect.x, whiteoutRect.y, whiteoutRect.w, whiteoutRect.h);
        } else if (toolMode === 'cutout') {
          const canvas = canvasRef.current;
          if (canvas) {
            const cropX = whiteoutRect.x * canvas.width;
            const cropY = whiteoutRect.y * canvas.height;
            const cropW = whiteoutRect.w * canvas.width;
            const cropH = whiteoutRect.h * canvas.height;

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = cropW;
            tempCanvas.height = cropH;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
              tempCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
              try {
                const { width: pdfW, height: pdfH } = pagePdfSize;

                // canvas fractions → PDF-points (Y-axis flip: canvas top = PDF bottom)
                const srcPdfX =  whiteoutRect.x * pdfW;
                const srcPdfY = (1 - whiteoutRect.y - whiteoutRect.h) * pdfH;
                const srcPdfW =  whiteoutRect.w * pdfW;
                const srcPdfH =  whiteoutRect.h * pdfH;

                const previewDataUrl = tempCanvas.toDataURL('image/png');  // UI preview only

                onCutoutDrawn(
                  whiteoutRect.x, whiteoutRect.y, whiteoutRect.w, whiteoutRect.h,
                  srcPdfX, srcPdfY, srcPdfW, srcPdfH,
                  previewDataUrl,
                );
              } catch (err) {
                console.error("Canvas crop failed (tainted canvas?):", err);
              }
            }
          }
        }
      }
      whiteoutStart.current = null;
      setWhiteoutRect(null);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only act if the click landed directly on the page div, not on a child overlay
    if (e.target !== e.currentTarget) return;
    if (toolMode === 'text') {
      const frac = getCanvasFrac(e);
      if (frac) onCanvasClick(frac.x, frac.y);
    } else if (toolMode === 'select') {
      onSelectOverlay(null);
    }
  };

  const pageOverlays = overlays.filter(o => o.pageIndex === activeOriginalIndex);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto flex items-start justify-center p-4 bg-neutral-900/20 relative"
      style={{ cursor: (toolMode === 'whiteout' || toolMode === 'cutout') ? 'crosshair' : toolMode === 'text' ? 'text' : 'default' }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-neutral-950/30">
          <Loader2 className="w-6 h-6 animate-spin text-[#1D9BF0]" />
        </div>
      )}

      {/* Page canvas + overlay layer */}
      <div
        className="relative shadow-xl border border-neutral-700 bg-white select-none"
        style={{ width: dims?.w, height: dims?.h, minWidth: dims?.w, minHeight: dims?.h }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onClick={handleCanvasClick}
      >
        <canvas ref={canvasRef} className="block pointer-events-none" />

        {/* Whiteout / Cutout drag preview */}
        {whiteoutRect && dims && (
          <div
            className={`absolute border-2 border-dashed pointer-events-none ${
              toolMode === 'cutout'
                ? 'border-orange-500 bg-orange-500/10 animate-pulse'
                : 'border-orange-400 bg-white'
            }`}
            style={{
              left: whiteoutRect.x * dims.w,
              top: whiteoutRect.y * dims.h,
              width: whiteoutRect.w * dims.w,
              height: whiteoutRect.h * dims.h,
            }}
          />
        )}

        {/* Overlay elements */}
        {dims && pageOverlays.map(overlay => (
          <OverlayElement
            key={overlay.id}
            overlay={overlay}
            dims={dims}
            toolMode={toolMode}
            isSelected={selectedId === overlay.id}
            isEditing={editingId === overlay.id}
            onSelect={() => onSelectOverlay(overlay.id)}
            onStartEditing={() => onStartEditing(overlay.id)}
            onStopEditing={onStopEditing}
            onMove={(x, y) => onMoveOverlay(overlay.id, x, y)}
            onCommitMove={() => onCommitMove(overlay.id)}
            onResize={patch => onResizeOverlay(overlay.id, patch)}
            onCommitResize={() => onCommitResize(overlay.id)}
            onUpdate={patch => onUpdateOverlay(overlay.id, patch)}
            onUpdateSilent={patch => onUpdateOverlaySilent(overlay.id, patch)}
            onCaptureSnapshot={() => onCaptureSnapshot(overlay.id)}
            onDelete={() => onDeleteOverlay(overlay.id)}
          />
        ))}
      </div>

      <FormFieldsWidget
        formFields={formFields}
        onUpdateFormField={onUpdateFormField}
      />
    </div>
  );
};

// ── Individual overlay element ────────────────────────────────────────────────

interface OverlayProps {
  overlay: Overlay;
  dims: PageDims;
  toolMode: ToolMode;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onStartEditing: () => void;
  onStopEditing: () => void;
  onMove: (x: number, y: number) => void;
  onCommitMove: () => void;
  onResize: (patch: Partial<Overlay>) => void;
  onCommitResize: () => void;
  onUpdate: (patch: Partial<Overlay>) => void;
  onUpdateSilent: (patch: Partial<Overlay>) => void;
  onCaptureSnapshot: () => void;
  onDelete: () => void;
}

const OverlayElement: React.FC<OverlayProps> = ({
  overlay, dims, toolMode, isSelected, isEditing,
  onSelect, onStartEditing, onStopEditing, onMove, onCommitMove, onResize, onCommitResize, onUpdate, onUpdateSilent, onCaptureSnapshot, onDelete,
}) => {
  const posX = overlay.x * dims.w;
  const posY = overlay.y * dims.h;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (toolMode !== 'select') return;  // only interact in select mode
    e.stopPropagation();
    onSelect();
    if (isEditing) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startFracX = overlay.x;
    const startFracY = overlay.y;
    let moved = false;

    const onMove_ = (mv: MouseEvent) => {
      moved = true;
      const dx = (mv.clientX - startX) / dims.w;
      const dy = (mv.clientY - startY) / dims.h;
      onMove(
        Math.min(Math.max(0, startFracX + dx), 0.95),
        Math.min(Math.max(0, startFracY + dy), 0.95),
      );
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove_);
      window.removeEventListener('mouseup', onUp);
      if (moved) onCommitMove();
    };
    window.addEventListener('mousemove', onMove_);
    window.addEventListener('mouseup', onUp);
  };

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: posX,
    top: posY,
    cursor: 'move',
    userSelect: 'none',
  };

  const selectionClass = isSelected
    ? 'ring-2 ring-[#1D9BF0] ring-offset-0 z-30'
    : 'hover:ring-1 hover:ring-neutral-400 z-20';

  // ── Text overlay ──────────────────────────────────────────────────────────
  if (overlay.kind === 'text') {
    return (
      <div
        style={{
          ...baseStyle,
          fontSize: overlay.fontSize,
          fontFamily: FONT_CSS[overlay.fontFamily],
          fontWeight: overlay.bold ? 'bold' : 'normal',
          fontStyle: overlay.italic ? 'italic' : 'normal',
          textDecoration: overlay.underline ? 'underline' : 'none',
          color: overlay.color,
          // opacity is NOT on the wrapper- it goes only on the text content below
          // so that ContextToolbar and DecorativeHandles are never affected
        }}
        className={`absolute rounded leading-tight ${selectionClass}`}
        onMouseDown={handleMouseDown}
        onDoubleClick={e => { e.stopPropagation(); onStartEditing(); }}
      >
        {isSelected && (
          <FloatingPropertiesPanel
            overlay={overlay}
            onUpdate={onUpdate}
            onUpdateSilent={onUpdateSilent}
            onCaptureSnapshot={onCaptureSnapshot}
            onDelete={onDelete}
          />
        )}
        {/* Opacity applied only to the text content, never to the toolbar or handles */}
        {isEditing ? (
          <input
            autoFocus
            type="text"
            value={overlay.text}
            onChange={e => onUpdate({ text: e.target.value })}
            onBlur={onStopEditing}
            onKeyDown={e => { if (e.key === 'Enter') onStopEditing(); }}
            onMouseDown={e => e.stopPropagation()}
            style={{ opacity: overlay.opacity }}
            className="bg-transparent border-none outline-none focus:ring-0 p-0 m-0 min-w-[100px] text-inherit"
          />
        ) : (
          <span style={{ opacity: overlay.opacity }} className="whitespace-nowrap px-1 block">{overlay.text}</span>
        )}
        {/* Text uses decorative handles only- resize via font size */}
        {isSelected && <DecorativeHandles />}
      </div>
    );
  }

  // ── Whiteout overlay ──────────────────────────────────────────────────────
  if (overlay.kind === 'whiteout') {
    const w = overlay.width * dims.w;
    const h = overlay.height * dims.h;
    return (
      <div
        style={{ ...baseStyle, width: w, height: h, backgroundColor: 'white', overflow: 'visible' }}
        className={`absolute border border-dashed border-orange-300/60 ${selectionClass}`}
        onMouseDown={handleMouseDown}
      >
        {isSelected && (
          <FloatingPropertiesPanel
            overlay={overlay}
            onUpdate={onUpdate}
            onUpdateSilent={onUpdateSilent}
            onCaptureSnapshot={onCaptureSnapshot}
            onDelete={onDelete}
          />
        )}
        {overlay.replacementText && (
          <span
            className="absolute inset-0 flex items-center px-1 overflow-hidden"
            style={{
              fontSize: overlay.replacementFontSize ?? 12,
              fontFamily: FONT_CSS[overlay.replacementFontFamily ?? 'sans'],
              color: overlay.replacementColor ?? '#000000',
            }}
          >
            {overlay.replacementText}
          </span>
        )}
        {isSelected && (
          <ResizeHandles
            overlay={overlay}
            dims={dims}
            onResize={onResize}
            onCommitResize={onCommitResize}
            keepAspect={false}
          />
        )}
      </div>
    );
  }

  // ── Image / Signature overlay ─────────────────────────────────────────────
  if (overlay.kind === 'image' || overlay.kind === 'signature') {
    const w = overlay.width * dims.w;
    const h = overlay.height * dims.h;
    return (
      <div
        style={{ ...baseStyle, width: w, height: h, overflow: 'visible' }}
        className={`absolute ${selectionClass}`}
        onMouseDown={handleMouseDown}
      >
        {isSelected && (
          <FloatingPropertiesPanel
            overlay={overlay}
            onUpdate={onUpdate}
            onUpdateSilent={onUpdateSilent}
            onCaptureSnapshot={onCaptureSnapshot}
            onDelete={onDelete}
          />
        )}
        {/* Opacity applied ONLY to the image content, not to toolbar/handles */}
        <img
          src={overlay.dataUrl}
          alt=""
          style={{ opacity: overlay.opacity }}
          className="w-full h-full object-contain pointer-events-none"
        />
        {isSelected && (
          <ResizeHandles
            overlay={overlay}
            dims={dims}
            onResize={onResize}
            onCommitResize={onCommitResize}
            keepAspect={true}
          />
        )}
      </div>
    );
  }

  // ── Cutout overlay ────────────────────────────────────────────────────────
  if (overlay.kind === 'cutout') {
    const w = overlay.width  * dims.w;
    const h = overlay.height * dims.h;
    return (
      <div
        style={{ ...baseStyle, width: w, height: h, overflow: 'visible' }}
        className={`absolute ${selectionClass}`}
        onMouseDown={handleMouseDown}
      >
        {isSelected && (
          <FloatingPropertiesPanel
            overlay={overlay}
            onUpdate={onUpdate}
            onUpdateSilent={onUpdateSilent}
            onCaptureSnapshot={onCaptureSnapshot}
            onDelete={onDelete}
          />
        )}
        <img
          src={overlay.previewDataUrl}
          alt="cut region preview"
          style={{ width: '100%', height: '100%', objectFit: 'fill', opacity: overlay.opacity, pointerEvents: 'none' }}
          draggable={false}
        />
        {isSelected && (
          <ResizeHandles
            overlay={overlay}
            dims={dims}
            onResize={onResize}
            onCommitResize={onCommitResize}
            keepAspect={false}
          />
        )}
      </div>
    );
  }

  return null;
};

// ── Shared sub-components ─────────────────────────────────────────────────────

// ── Floating Contextual Properties Panel ──────────────────────────────────────

const FloatingPropertiesPanel: React.FC<{
  overlay: Overlay;
  onUpdate: (patch: Partial<Overlay>) => void;
  onUpdateSilent: (patch: Partial<Overlay>) => void;
  onCaptureSnapshot: () => void;
  onDelete: () => void;
}> = ({ overlay, onUpdate, onUpdateSilent, onCaptureSnapshot, onDelete }) => {
  return (
    <div
      className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 flex flex-col gap-2 p-2 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-50 text-neutral-200 text-xs font-mono w-56 whitespace-normal"
      onMouseDown={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-neutral-800 pb-1 mb-1">
        <span className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider">
          {overlay.kind === 'text' ? 'Text Details' : overlay.kind === 'whiteout' ? 'Whiteout Details' : 'Image Details'}
        </span>
        <button
          onClick={onDelete}
          className="text-neutral-500 hover:text-red-400 p-0.5 rounded transition-colors"
          title="Delete element"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {overlay.kind === 'text' && (
        <div className="space-y-1.5 text-left">
          {/* Text Input */}
          <div className="space-y-0.5">
            <label className="text-[8px] uppercase text-neutral-500 block">Text</label>
            <input
              type="text"
              value={overlay.text}
              onChange={e => onUpdate({ text: e.target.value })}
              className="w-full px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-200 text-[10px] font-mono focus:border-[#1D9BF0] focus:outline-none"
            />
          </div>

          {/* Font and Size */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5">
              <label className="text-[8px] uppercase text-neutral-500 block">Font</label>
              <select
                value={overlay.fontFamily}
                onChange={e => onUpdate({ fontFamily: e.target.value as any })}
                className="w-full px-1 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-200 text-[10px] font-mono focus:outline-none"
              >
                <option value="sans">Sans</option>
                <option value="serif">Serif</option>
                <option value="mono">Mono</option>
              </select>
            </div>
            <div className="space-y-0.5">
              <label className="text-[8px] uppercase text-neutral-500 block">Size</label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onUpdate({ fontSize: Math.max(8, overlay.fontSize - 1) })}
                  className="w-4 h-4 flex items-center justify-center rounded bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 text-xs font-bold"
                >
                  -
                </button>
                <span className="flex-1 text-center text-[10px]">{overlay.fontSize}</span>
                <button
                  onClick={() => onUpdate({ fontSize: Math.min(72, overlay.fontSize + 1) })}
                  className="w-4 h-4 flex items-center justify-center rounded bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 text-xs font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Style Modifiers & Color */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex gap-0.5">
              <button
                onClick={() => onUpdate({ bold: !overlay.bold })}
                className={`w-5 h-5 rounded text-[10px] font-bold font-mono transition-colors ${
                  overlay.bold ? 'bg-[#1D9BF0] text-white' : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                B
              </button>
              <button
                onClick={() => onUpdate({ italic: !overlay.italic })}
                className={`w-5 h-5 rounded text-[10px] font-bold italic font-mono transition-colors ${
                  overlay.italic ? 'bg-[#1D9BF0] text-white' : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                I
              </button>
              <button
                onClick={() => onUpdate({ underline: !overlay.underline })}
                className={`w-5 h-5 rounded text-[10px] font-bold underline font-mono transition-colors ${
                  overlay.underline ? 'bg-[#1D9BF0] text-white' : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                U
              </button>
            </div>

            <div className="flex items-center gap-1">
              <div className="relative w-5 h-5 rounded border border-neutral-800 overflow-hidden cursor-pointer bg-neutral-950 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: overlay.color }} />
                <input
                  type="color"
                  value={overlay.color}
                  onChange={e => onUpdate({ color: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
              <span className="text-[9px] text-neutral-400">{overlay.color}</span>
            </div>
          </div>

          {/* Opacity */}
          <div className="space-y-0.5 pt-0.5">
            <div className="flex justify-between text-[8px] uppercase text-neutral-500">
              <span>Opacity</span>
              <span>{Math.round(overlay.opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={overlay.opacity}
              onPointerDown={onCaptureSnapshot}
              onChange={e => onUpdateSilent({ opacity: parseFloat(e.target.value) })}
              className="w-full accent-[#1D9BF0] bg-neutral-950 h-1 rounded cursor-pointer"
            />
          </div>
        </div>
      )}

      {overlay.kind === 'whiteout' && (
        <div className="space-y-1.5 text-left">
          {/* Replacement Text */}
          <div className="space-y-0.5">
            <label className="text-[8px] uppercase text-neutral-500 block">Replace with</label>
            <input
              type="text"
              placeholder="Replacement text…"
              value={overlay.replacementText ?? ''}
              onChange={e => onUpdate({ replacementText: e.target.value })}
              className="w-full px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-200 text-[10px] font-mono focus:border-[#1D9BF0] focus:outline-none"
            />
          </div>

          {/* Font and Size */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5">
              <label className="text-[8px] uppercase text-neutral-500 block">Font</label>
              <select
                value={overlay.replacementFontFamily ?? 'sans'}
                onChange={e => onUpdate({ replacementFontFamily: e.target.value as any })}
                className="w-full px-1 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-200 text-[10px] font-mono focus:outline-none"
              >
                <option value="sans">Sans</option>
                <option value="serif">Serif</option>
                <option value="mono">Mono</option>
              </select>
            </div>
            <div className="space-y-0.5">
              <label className="text-[8px] uppercase text-neutral-500 block">Size</label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onUpdate({ replacementFontSize: Math.max(8, (overlay.replacementFontSize ?? 12) - 1) })}
                  className="w-4 h-4 flex items-center justify-center rounded bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 text-xs font-bold"
                >
                  -
                </button>
                <span className="flex-1 text-center text-[10px]">{overlay.replacementFontSize ?? 12}</span>
                <button
                  onClick={() => onUpdate({ replacementFontSize: Math.min(48, (overlay.replacementFontSize ?? 12) + 1) })}
                  className="w-4 h-4 flex items-center justify-center rounded bg-neutral-950 border border-neutral-800 hover:bg-neutral-800 text-xs font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Replacement Color */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <span className="text-[8px] uppercase text-neutral-500">Color</span>
            <div className="flex items-center gap-1">
              <div className="relative w-5 h-5 rounded border border-neutral-800 overflow-hidden cursor-pointer bg-neutral-950 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: overlay.replacementColor ?? '#000000' }} />
                <input
                  type="color"
                  value={overlay.replacementColor ?? '#000000'}
                  onChange={e => onUpdate({ replacementColor: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
              <span className="text-[9px] text-neutral-400">{overlay.replacementColor ?? '#000000'}</span>
            </div>
          </div>
        </div>
      )}

      {(overlay.kind === 'image' || overlay.kind === 'signature') && (
        <div className="space-y-1.5 text-left">
          {/* Opacity */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-[8px] uppercase text-neutral-500">
              <span>Opacity</span>
              <span>{Math.round(overlay.opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={overlay.opacity}
              onPointerDown={onCaptureSnapshot}
              onChange={e => onUpdateSilent({ opacity: parseFloat(e.target.value) })}
              className="w-full accent-[#1D9BF0] bg-neutral-950 h-1 rounded cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ── Collapsible Floating AcroForm Fields Widget ────────────────────────────────

const FormFieldsWidget: React.FC<{
  formFields: FormField[];
  onUpdateFormField: (name: string, value: string) => void;
}> = ({ formFields, onUpdateFormField }) => {
  const [open, setOpen] = React.useState(false);
  if (formFields.length === 0) return null;

  return (
    <div className="absolute bottom-4 right-4 z-50 bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl text-neutral-200 text-xs font-mono w-64 max-h-[300px] flex flex-col">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between p-2.5 font-bold uppercase tracking-wider text-[10px] text-neutral-400 border-b border-neutral-800 hover:bg-neutral-800 transition-colors rounded-t-lg cursor-pointer"
      >
        <span>Form Fields ({formFields.length})</span>
        <span>{open ? '▼' : '▲'}</span>
      </button>
      {open && (
        <div className="p-3 overflow-y-auto space-y-2 flex-1 max-h-[250px] text-left">
          {formFields.map(field => (
            <div key={field.name} className="space-y-1">
              <label className="text-[9px] uppercase text-neutral-500 block truncate" title={field.name}>
                {field.name}
              </label>
              {field.type === 'checkbox' ? (
                <input
                  type="checkbox"
                  checked={field.value === 'true'}
                  onChange={e => onUpdateFormField(field.name, String(e.target.checked))}
                  className="accent-[#1D9BF0]"
                />
              ) : field.type === 'dropdown' && field.options ? (
                <select
                  value={field.value}
                  onChange={e => onUpdateFormField(field.name, e.target.value)}
                  className="w-full px-2 py-1 rounded bg-neutral-950 border border-neutral-800 text-neutral-200 text-[10px] font-mono focus:outline-none"
                >
                  {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  value={field.value}
                  onChange={e => onUpdateFormField(field.name, e.target.value)}
                  className="w-full px-2 py-1 rounded bg-neutral-950 border border-neutral-800 text-neutral-200 text-[10px] font-mono focus:border-[#1D9BF0] focus:outline-none"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/** Decorative-only handles for text overlay (no resize interaction) */
const DecorativeHandles: React.FC = () => (
  <>
    {[
      { style: { top: -4, left: -4 } },
      { style: { top: -4, right: -4 } },
      { style: { bottom: -4, left: -4 } },
      { style: { bottom: -4, right: -4 } },
    ].map((h, i) => (
      <div
        key={i}
        className="absolute w-2 h-2 bg-[#1D9BF0] border border-white rounded-sm pointer-events-none"
        style={{ position: 'absolute', ...h.style }}
      />
    ))}
  </>
);

// ── Resize handle types ───────────────────────────────────────────────────────

type HandleDir = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const HANDLE_CURSORS: Record<HandleDir, string> = {
  nw: 'nwse-resize', n: 'ns-resize', ne: 'nesw-resize',
  e: 'ew-resize',   se: 'nwse-resize', s: 'ns-resize',
  sw: 'nesw-resize', w: 'ew-resize',
};

// Position each handle as absolute offset from overlay top-left (in px, outside the box)
const HANDLE_POSITIONS: Record<HandleDir, React.CSSProperties> = {
  nw: { top: -6,  left: -6  },
  n:  { top: -6,  left: '50%', transform: 'translateX(-50%)' },
  ne: { top: -6,  right: -6 },
  e:  { top: '50%', right: -6, transform: 'translateY(-50%)' },
  se: { bottom: -6, right: -6 },
  s:  { bottom: -6, left: '50%', transform: 'translateX(-50%)' },
  sw: { bottom: -6, left: -6 },
  w:  { top: '50%', left: -6, transform: 'translateY(-50%)' },
};

interface ResizeHandlesProps {
  overlay: Overlay & { width: number; height: number };
  dims: PageDims;
  onResize: (patch: Partial<Overlay>) => void;
  onCommitResize: () => void;
  keepAspect: boolean;
}

const ResizeHandles: React.FC<ResizeHandlesProps> = ({ overlay, dims, onResize, onCommitResize, keepAspect }) => {
  const handles: HandleDir[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

  const startResize = (e: React.MouseEvent, dir: HandleDir) => {
    e.stopPropagation();  // prevent overlay drag from starting
    e.preventDefault();

    const startPx = e.clientX;
    const startPy = e.clientY;
    const startX = overlay.x;
    const startY = overlay.y;
    const startW = overlay.width;
    const startH = overlay.height;
    const aspect = startW / startH;
    const MIN = 0.02; // minimum size in fractions

    const onMouseMove = (mv: MouseEvent) => {
      // Raw pixel delta → fraction of page dims
      const dpx = (mv.clientX - startPx) / dims.w;
      const dpy = (mv.clientY - startPy) / dims.h;

      let newX = startX, newY = startY, newW = startW, newH = startH;

      // Apply delta per handle direction
      if (dir === 'se') {
        newW = Math.max(MIN, startW + dpx);
        newH = Math.max(MIN, startH + dpy);
        if (keepAspect) { newH = newW / aspect; }
      } else if (dir === 'sw') {
        newW = Math.max(MIN, startW - dpx);
        newH = Math.max(MIN, startH + dpy);
        newX = startX + startW - newW;
        if (keepAspect) { newH = newW / aspect; }
      } else if (dir === 'ne') {
        newW = Math.max(MIN, startW + dpx);
        newH = Math.max(MIN, startH - dpy);
        newY = startY + startH - newH;
        if (keepAspect) { newH = newW / aspect; newY = startY + startH - newH; }
      } else if (dir === 'nw') {
        newW = Math.max(MIN, startW - dpx);
        newH = Math.max(MIN, startH - dpy);
        newX = startX + startW - newW;
        newY = startY + startH - newH;
        if (keepAspect) { newH = newW / aspect; newY = startY + startH - newH; }
      } else if (dir === 'e') {
        newW = Math.max(MIN, startW + dpx);
      } else if (dir === 'w') {
        newW = Math.max(MIN, startW - dpx);
        newX = startX + startW - newW;
      } else if (dir === 's') {
        newH = Math.max(MIN, startH + dpy);
      } else if (dir === 'n') {
        newH = Math.max(MIN, startH - dpy);
        newY = startY + startH - newH;
      }

      onResize({ x: newX, y: newY, width: newW, height: newH } as Partial<Overlay>);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      onCommitResize();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <>
      {handles.map(dir => (
        <div
          key={dir}
          onMouseDown={e => startResize(e, dir)}
          style={{
            position: 'absolute',
            ...HANDLE_POSITIONS[dir],
            width: 12,
            height: 12,
            cursor: HANDLE_CURSORS[dir],
            zIndex: 40,
            // Larger invisible hit area via padding trick
            boxSizing: 'border-box',
          }}
          className="bg-[#1D9BF0] border-2 border-white rounded-sm"
        />
      ))}
    </>
  );
};
