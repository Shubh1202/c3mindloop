'use client';

import React, { useRef } from 'react';
import {
  MousePointer2, Type, Eraser, Image, PenLine,
  ZoomIn, ZoomOut, Undo2, Redo2, Download, Loader2,
  Maximize2, Minimize2, FolderOpen, X,
} from 'lucide-react';
import type { ToolMode } from '../editor/editor.types';

interface Props {
  toolMode: ToolMode;
  zoom: number;
  activePage: number;
  pageCount: number;
  canUndo: boolean;
  canRedo: boolean;
  working: boolean;
  isFullScreen: boolean;
  onToolMode: (mode: ToolMode) => void;
  onZoom: (z: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onImageUpload: (dataUrl: string, w: number, h: number) => void;
  onSignatureOpen: () => void;
  onToggleFullScreen: () => void;
  onReplacePdf: () => void;
  onClosePdf: () => void;
}

const TOOLS: { mode: ToolMode; icon: React.ReactNode; label: string }[] = [
  { mode: 'select',    icon: <MousePointer2 className="w-3.5 h-3.5" />, label: 'Select' },
  { mode: 'text',      icon: <Type className="w-3.5 h-3.5" />,          label: 'Text' },
  { mode: 'whiteout',  icon: <Eraser className="w-3.5 h-3.5" />,        label: 'Whiteout' },
  { mode: 'image',     icon: <Image className="w-3.5 h-3.5" />,         label: 'Image' },
  { mode: 'signature', icon: <PenLine className="w-3.5 h-3.5" />,       label: 'Sign' },
];

export const PdfEditorToolbar: React.FC<Props> = ({
  toolMode, zoom, canUndo, canRedo, working, isFullScreen,
  onToolMode, onZoom, onUndo, onRedo, onExport,
  onImageUpload, onSignatureOpen, onToggleFullScreen,
  onReplacePdf, onClosePdf,
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleToolClick = (mode: ToolMode) => {
    if (mode === 'image') {
      imageInputRef.current?.click();
      onToolMode('select');  // return to select; image is placed then auto-selects
      return;
    }
    if (mode === 'signature') {
      onSignatureOpen();
      onToolMode('select');  // signature pad handles its own flow
      return;
    }
    onToolMode(mode);
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        // Normalize to fraction: default 30% wide, proportional height
        const aspectRatio = img.naturalHeight / img.naturalWidth;
        onImageUpload(dataUrl, 0.3, 0.3 * aspectRatio);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  return (
    <div className="px-3 py-2 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center gap-2 text-xs font-mono">
      {/* Tool mode buttons */}
      <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-800 rounded p-0.5">
        {TOOLS.map(({ mode, icon, label }) => (
          <button
            key={mode}
            onClick={() => handleToolClick(mode)}
            title={label}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-all cursor-pointer ${
              toolMode === mode
                ? 'bg-[#1D9BF0] text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            {icon}
            <span className="hidden sm:inline text-[10px]">{label}</span>
          </button>
        ))}
      </div>

      <span className="w-px h-5 bg-neutral-800" />

      {/* Undo / Redo */}
      <div className="flex items-center gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 disabled:opacity-30 cursor-pointer"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 disabled:opacity-30 cursor-pointer"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <span className="w-px h-5 bg-neutral-800" />

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onZoom(zoom - 0.2)}
          className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-neutral-400 w-10 text-center text-[10px]">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => onZoom(zoom + 0.2)}
          className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Replace PDF */}
      <button
        onClick={onReplacePdf}
        title="Replace PDF"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px] font-mono transition-colors cursor-pointer"
      >
        <FolderOpen className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Replace</span>
      </button>

      {/* Close PDF */}
      <button
        onClick={onClosePdf}
        title="Close PDF"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-red-950 text-neutral-400 hover:text-red-300 text-[11px] font-mono transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Close</span>
      </button>

      <span className="w-px h-5 bg-neutral-800" />

      {/* Export */}
      <button
        onClick={onExport}
        disabled={working}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
      >
        {working ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
        <span>{working ? 'Exporting…' : 'Export PDF'}</span>
      </button>

      {/* Fullscreen toggle */}
      <button
        onClick={onToggleFullScreen}
        title={isFullScreen ? 'Exit Full Screen (Esc)' : 'Full Screen'}
        className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
      >
        {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
      </button>

      {/* Hidden image file input */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleImageFile}
      />
    </div>
  );
};
