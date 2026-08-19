'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Loader2, FileText, RotateCw, RotateCcw, Trash2, GripVertical } from 'lucide-react';
import type { PdfFile, PageMeta } from '../editor/editor.types';
import { renderPageThumbnail } from '../editor/editor.utils';

interface Props {
  file: PdfFile;
  pageMetas: PageMeta[];
  activePage: number;
  onSelectPage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onRotatePage: (index: number, by: 90 | -90) => void;
  onReorderPage: (from: number, to: number) => void;
}

interface ThumbState {
  dataUrl: string | null;
  loading: boolean;
}

export const PdfEditorPageThumbnails: React.FC<Props> = ({
  file, pageMetas, activePage,
  onSelectPage, onDeletePage, onRotatePage, onReorderPage,
}) => {
  const [thumbs, setThumbs] = useState<ThumbState[]>([]);
  const dragRef = useRef<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);

  // Build thumb state array whenever pageMetas changes (length OR order)
  useEffect(() => {
    setThumbs(pageMetas.map(() => ({ dataUrl: null, loading: true })));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageMetas]);

  // Render thumbnails for visible (non-deleted) pages
  useEffect(() => {
    let cancelled = false;
    pageMetas.forEach((meta, i) => {
      if (meta.deleted) return;
      renderPageThumbnail(file.file, meta.originalIndex, 80).then(url => {
        if (cancelled) return;
        setThumbs(prev => {
          const next = [...prev];
          next[i] = { dataUrl: url, loading: false };
          return next;
        });
      });
    });
    return () => { cancelled = true; };
  }, [file, pageMetas]);

  const visibleMetas = pageMetas.map((m, i) => ({ ...m, displayIndex: i })).filter(m => !m.deleted);

  return (
    <div className="flex flex-col gap-1 overflow-y-auto py-2 px-1 h-full">
      <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider px-1 pb-1 shrink-0">
        Pages ({visibleMetas.length})
      </p>
      {visibleMetas.map(meta => {
        const i = meta.displayIndex;
        const thumb = thumbs[i];
        const isActive = activePage === i;

        return (
          <div
            key={meta.originalIndex}
            draggable
            onDragStart={() => { dragRef.current = i; }}
            onDragOver={e => { e.preventDefault(); setDropTarget(i); }}
            onDrop={e => {
              e.preventDefault();
              if (dragRef.current !== null && dragRef.current !== i) {
                onReorderPage(dragRef.current, i);
              }
              dragRef.current = null;
              setDropTarget(null);
            }}
            onDragEnd={() => { dragRef.current = null; setDropTarget(null); }}
            onClick={() => onSelectPage(i)}
            className={`group relative flex flex-col items-center gap-1 p-1.5 rounded border cursor-pointer transition-all select-none ${
              isActive
                ? 'border-[#1D9BF0] bg-[#1D9BF0]/10'
                : dropTarget === i
                  ? 'border-[#1D9BF0]/50 bg-[#1D9BF0]/5'
                  : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/20'
            }`}
          >
            {/* Drag handle */}
            <GripVertical className="absolute top-1 left-0.5 w-3 h-3 text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Thumbnail */}
            <div
              className="w-[64px] h-[82px] bg-white border border-neutral-700 rounded overflow-hidden flex items-center justify-center shrink-0"
              style={{ transform: `rotate(${meta.rotation}deg)` }}
            >
              {!thumb || thumb.loading ? (
                <Loader2 className="w-3 h-3 animate-spin text-neutral-400" />
              ) : thumb.dataUrl ? (
                <img src={thumb.dataUrl} alt={`Page ${i + 1}`} className="w-full h-full object-contain" />
              ) : (
                <FileText className="w-4 h-4 text-neutral-400" />
              )}
            </div>

            {/* Page number */}
            <span className="text-[9px] font-mono text-neutral-400">{i + 1}</span>

            {/* Hover action buttons */}
            <div
              className="absolute bottom-1 right-0.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => onRotatePage(i, -90)}
                title="Rotate left"
                className="p-0.5 rounded bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-400 hover:text-neutral-200 cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={() => onRotatePage(i, 90)}
                title="Rotate right"
                className="p-0.5 rounded bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-400 hover:text-neutral-200 cursor-pointer"
              >
                <RotateCw className="w-2.5 h-2.5" />
              </button>
              <button
                onClick={() => onDeletePage(i)}
                title="Delete page"
                className="p-0.5 rounded bg-neutral-900 border border-neutral-700 hover:border-red-900 text-neutral-400 hover:text-red-400 cursor-pointer"
              >
                <Trash2 className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
