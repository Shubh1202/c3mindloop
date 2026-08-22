'use client';

import React, { useRef, useState } from 'react';
import {
  MousePointer2, Type, Eraser, Image, PenLine,
  ZoomIn, ZoomOut, Undo2, Redo2, Download, Loader2,
  Maximize2, Minimize2, FolderOpen, X, ChevronDown, Scissors,
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

const TOOLS: { mode: ToolMode; icon: React.ReactNode; label: string; shortcut: string }[] = [
  { mode: 'select',    icon: <MousePointer2 className="w-3.5 h-3.5" />, label: 'Select',     shortcut: 'V' },
  { mode: 'text',      icon: <Type className="w-3.5 h-3.5" />,          label: 'Text',       shortcut: 'T' },
  { mode: 'whiteout',  icon: <Eraser className="w-3.5 h-3.5" />,        label: 'Whiteout',   shortcut: 'W' },
  { mode: 'cutout',    icon: <Scissors className="w-3.5 h-3.5" />,      label: 'Cut & Move', shortcut: 'X' },
  { mode: 'image',     icon: <Image className="w-3.5 h-3.5" />,         label: 'Image',      shortcut: 'I' },
  { mode: 'signature', icon: <PenLine className="w-3.5 h-3.5" />,       label: 'Sign',       shortcut: 'S' },
];

const ZOOM_PRESETS = [
  { label: '50%',  value: 0.5  },
  { label: '75%',  value: 0.75 },
  { label: '100%', value: 1.0  },
  { label: '125%', value: 1.25 },
  { label: '150%', value: 1.5  },
  { label: '200%', value: 2.0  },
];

export const PdfEditorToolbar: React.FC<Props> = ({
  toolMode, zoom, canUndo, canRedo, working, isFullScreen,
  onToolMode, onZoom, onUndo, onRedo, onExport,
  onImageUpload, onSignatureOpen, onToggleFullScreen,
  onReplacePdf, onClosePdf,
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [zoomOpen, setZoomOpen] = useState(false);

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
    <div className="bg-neutral-900 border-b border-neutral-800 font-mono">
      <div className="px-2.5 py-1.5 flex items-center gap-1.5 flex-wrap">

        {/* Tool mode pill group */}
        <div
          role="toolbar"
          aria-label="Annotation tools"
          className="flex items-center gap-0.5 bg-neutral-950 border border-neutral-800 rounded-md p-0.5"
        >
          {TOOLS.map(({ mode, icon, label, shortcut }) => (
            <button
              key={mode}
              onClick={() => handleToolClick(mode)}
              title={`${label} (${shortcut})`}
              aria-pressed={toolMode === mode}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition-all duration-150 cursor-pointer select-none ${
                toolMode === mode
                  ? 'bg-[#1D9BF0] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <span className="w-px h-5 bg-neutral-800 shrink-0" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <span className="w-px h-5 bg-neutral-800 shrink-0" />

        {/* Zoom controls with presets dropdown */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onZoom(Math.max(0.25, zoom - 0.25))}
            title="Zoom out"
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 cursor-pointer transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Zoom level + presets dropdown */}
          <div className="relative">
            <button
              onClick={() => setZoomOpen(v => !v)}
              title="Zoom presets"
              className="flex items-center gap-0.5 px-2 py-1 rounded hover:bg-neutral-800 text-neutral-300 text-[11px] cursor-pointer transition-colors min-w-[58px] justify-center"
            >
              <span>{Math.round(zoom * 100)}%</span>
              <ChevronDown className="w-3 h-3 text-neutral-500" />
            </button>
            {zoomOpen && (
              <>
                {/* Click-outside backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setZoomOpen(false)}
                />
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl py-1 min-w-[90px]">
                  {ZOOM_PRESETS.map(p => (
                    <button
                      key={p.label}
                      onClick={() => { onZoom(p.value); setZoomOpen(false); }}
                      className={`w-full text-left px-3 py-1.5 text-[11px] font-mono hover:bg-neutral-800 transition-colors cursor-pointer ${
                        Math.round(zoom * 100) === Math.round(p.value * 100)
                          ? 'text-[#1D9BF0]'
                          : 'text-neutral-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => onZoom(Math.min(3, zoom + 0.25))}
            title="Zoom in"
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 cursor-pointer transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Push document actions to the right */}
        <div className="flex-1" />

        {/* Replace PDF */}
        <button
          onClick={onReplacePdf}
          title="Replace PDF"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 hover:text-white text-[11px] transition-colors cursor-pointer"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Replace</span>
        </button>

        {/* Close PDF — clearly destructive */}
        <button
          onClick={onClosePdf}
          title="Close PDF"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-neutral-800 hover:bg-red-950 border border-neutral-700 hover:border-red-900 text-neutral-400 hover:text-red-300 text-[11px] transition-all cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Close</span>
        </button>

        <span className="w-px h-5 bg-neutral-800 shrink-0" />

        {/* Export PDF — primary CTA */}
        <button
          onClick={onExport}
          disabled={working}
          title="Export & download PDF"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#1D9BF0] hover:bg-[#1A8CD8] active:bg-[#167ec2] text-white text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {working ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          <span>{working ? 'Exporting…' : 'Export PDF'}</span>
        </button>

        {/* Fullscreen toggle */}
        <button
          onClick={onToggleFullScreen}
          title={isFullScreen ? 'Exit Full Screen (Esc)' : 'Enter Full Screen'}
          className="p-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
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
    </div>
  );
};
