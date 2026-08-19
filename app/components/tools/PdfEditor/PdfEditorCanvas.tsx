'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import type { Overlay, ToolMode, PdfFile } from '../editor/editor.types';
import { renderPageToCanvas, FONT_CSS } from '../editor/editor.utils';

interface PageDims { w: number; h: number; }

interface Props {
  file: PdfFile;
  activePage: number;           // display index (0-based position in pageMetas)
  activeOriginalIndex: number;  // originalIndex of the active page
  zoom: number;
  overlays: Overlay[];
  selectedId: string | null;
  editingId: string | null;
  toolMode: ToolMode;
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
  onCanvasClick: (xFrac: number, yFrac: number) => void;
}

export const PdfEditorCanvas: React.FC<Props> = ({
  file, activePage, activeOriginalIndex, zoom, overlays, selectedId, editingId, toolMode,
  onSelectOverlay, onStartEditing, onStopEditing,
  onMoveOverlay, onCommitMove, onResizeOverlay, onCommitResize,
  onUpdateOverlay, onUpdateOverlaySilent, onCaptureSnapshot, onDeleteOverlay,
  onWhiteoutDrawn, onCanvasClick,
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

    renderPageToCanvas(file.file, activeOriginalIndex, canvas, zoom, 520)
      .then(d => { if (active) { setDims(d); setLoading(false); } })
      .catch(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [file, activeOriginalIndex, zoom]);

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
    if (toolMode === 'whiteout') {
      const frac = getCanvasFrac(e);
      if (!frac) return;
      whiteoutStart.current = frac;
      setWhiteoutRect({ x: frac.x, y: frac.y, w: 0, h: 0 });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (toolMode === 'whiteout' && whiteoutStart.current) {
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
    if (toolMode === 'whiteout' && whiteoutStart.current && whiteoutRect) {
      if (whiteoutRect.w > 0.01 && whiteoutRect.h > 0.01) {
        onWhiteoutDrawn(whiteoutRect.x, whiteoutRect.y, whiteoutRect.w, whiteoutRect.h);
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
      style={{ cursor: toolMode === 'whiteout' ? 'crosshair' : toolMode === 'text' ? 'text' : 'default' }}
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

        {/* Whiteout drag preview */}
        {whiteoutRect && dims && (
          <div
            className="absolute border-2 border-dashed border-orange-400 bg-white pointer-events-none"
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
          <ContextToolbar onDelete={onDelete}>
            <select
              value={overlay.fontFamily}
              onChange={e => onUpdate({ fontFamily: e.target.value as any })}
              className="bg-neutral-950 border border-neutral-800 rounded px-1 py-0.5 text-[10px] font-mono text-neutral-300 focus:outline-none"
              onMouseDown={e => e.stopPropagation()}
            >
              <option value="sans">Sans</option>
              <option value="serif">Serif</option>
              <option value="mono">Mono</option>
            </select>
            <span className="w-px h-3.5 bg-neutral-800" />
            <button onClick={() => onUpdate({ fontSize: Math.max(8, overlay.fontSize - 2) })} className={ctxBtn}>−</button>
            <span className="text-[10px] font-mono text-neutral-300 w-5 text-center">{overlay.fontSize}</span>
            <button onClick={() => onUpdate({ fontSize: Math.min(72, overlay.fontSize + 2) })} className={ctxBtn}>+</button>
            <span className="w-px h-3.5 bg-neutral-800" />
            {/* Bold */}
            <button
              onClick={() => onUpdate({ bold: !overlay.bold })}
              title="Bold"
              className={`w-5 h-5 flex items-center justify-center rounded text-xs font-bold font-mono cursor-pointer transition-colors ${
                overlay.bold ? 'bg-[#1D9BF0] text-white' : 'hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >B</button>
            {/* Italic */}
            <button
              onClick={() => onUpdate({ italic: !overlay.italic })}
              title="Italic"
              className={`w-5 h-5 flex items-center justify-center rounded text-xs font-bold italic font-mono cursor-pointer transition-colors ${
                overlay.italic ? 'bg-[#1D9BF0] text-white' : 'hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >I</button>
            {/* Underline */}
            <button
              onClick={() => onUpdate({ underline: !overlay.underline })}
              title="Underline"
              className={`w-5 h-5 flex items-center justify-center rounded text-xs font-bold underline font-mono cursor-pointer transition-colors ${
                overlay.underline ? 'bg-[#1D9BF0] text-white' : 'hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >U</button>
            <span className="w-px h-3.5 bg-neutral-800" />
            <div className="relative w-5 h-5 rounded border border-neutral-700 overflow-hidden cursor-pointer">
              <div className="w-3 h-3 rounded-full absolute top-1 left-1" style={{ backgroundColor: overlay.color }} />
              <input type="color" value={overlay.color} onChange={e => onUpdate({ color: e.target.value })}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onMouseDown={e => e.stopPropagation()} />
            </div>
          </ContextToolbar>
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
          <ContextToolbar onDelete={onDelete}>
            <span className="text-[10px] font-mono text-neutral-400">Whiteout</span>
            <span className="w-px h-3.5 bg-neutral-800" />
            <input
              type="text"
              placeholder="Replacement text…"
              value={overlay.replacementText ?? ''}
              onChange={e => onUpdate({ replacementText: e.target.value })}
              onMouseDown={e => e.stopPropagation()}
              className="bg-neutral-950 border border-neutral-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-neutral-200 focus:outline-none w-32"
            />
          </ContextToolbar>
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
          <ContextToolbar onDelete={onDelete}>
            <span className="text-[10px] font-mono text-neutral-400">
              {overlay.kind === 'signature' ? 'Signature' : 'Image'}
            </span>
            <span className="w-px h-3.5 bg-neutral-800" />
            <input
              type="range" min={0.1} max={1} step={0.05}
              value={overlay.opacity}
              onPointerDown={() => onCaptureSnapshot()}
              onChange={e => onUpdateSilent({ opacity: parseFloat(e.target.value) })}
              onMouseDown={e => e.stopPropagation()}
              className="w-16 accent-[#1D9BF0]"
            />
          </ContextToolbar>
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

  return null;
};

// ── Shared sub-components ─────────────────────────────────────────────────────

const ctxBtn = 'w-5 h-5 flex items-center justify-center rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs font-bold font-mono cursor-pointer';

const ContextToolbar: React.FC<{ children: React.ReactNode; onDelete: () => void }> = ({ children, onDelete }) => (
  <div
    className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-50 whitespace-nowrap"
    onMouseDown={e => e.stopPropagation()}
  >
    {children}
    <span className="w-px h-3.5 bg-neutral-800" />
    <button onClick={onDelete} className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-950/40 text-neutral-400 hover:text-red-400 cursor-pointer">
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  </div>
);

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
