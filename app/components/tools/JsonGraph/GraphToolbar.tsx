'use client';

import React, { useCallback } from 'react';
import {
  ZoomIn, ZoomOut, Maximize, RotateCcw,
  Download, Loader2, ChevronsDownUp, ChevronsUpDown,
  GitBranch, List, Maximize2, Minimize2,
} from 'lucide-react';

export type ViewMode = 'graph' | 'tree';

interface GraphToolbarProps {
  viewMode: ViewMode;
  scale: number;
  disabled: boolean;
  canExport: boolean;
  isExporting: boolean;
  isFullScreen: boolean;
  visibleNodeCount: number;
  totalNodeCount: number;
  onViewModeChange: (mode: ViewMode) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  onResetLayout: () => void;
  onExport: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onToggleFullScreen: () => void;
}

const MIN_SCALE = 0.1;
const MAX_SCALE = 3.0;

interface TBtnProps {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
  /** render with text label beside icon */
  text?: string;
  /** highlight as active/primary */
  active?: boolean;
}

const TBtn: React.FC<TBtnProps> = ({ label, disabled, onClick, children, title, text, active }) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }
    },
    [disabled, onClick],
  );

  return (
    <button
      aria-label={label}
      title={title ?? label}
      aria-disabled={disabled ? 'true' : undefined}
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9BF0] ${
        disabled
          ? 'text-neutral-700 cursor-not-allowed pointer-events-none'
          : active
          ? 'bg-[#1D9BF0] text-white cursor-pointer'
          : 'text-neutral-300 hover:text-white hover:bg-neutral-800 cursor-pointer'
      }`}
    >
      {children}
      {text && <span>{text}</span>}
    </button>
  );
};

/** Icon-only square button (no text label) */
const IBtn: React.FC<Omit<TBtnProps, 'text' | 'active'>> = ({ label, disabled, onClick, children, title }) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }
    },
    [disabled, onClick],
  );

  return (
    <button
      aria-label={label}
      title={title ?? label}
      aria-disabled={disabled ? 'true' : undefined}
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={`flex items-center justify-center w-8 h-8 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1D9BF0] ${
        disabled
          ? 'text-neutral-700 cursor-not-allowed pointer-events-none'
          : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 cursor-pointer'
      }`}
    >
      {children}
    </button>
  );
};

const Sep: React.FC = () => (
  <div className="w-px h-5 bg-neutral-800 mx-0.5 shrink-0" />
);

/**
 * Primary toolbar — full-width, in-flow, top of the workspace.
 * Mirrors the JSON Formatter's toolbar position exactly.
 * Never overlaps the graph canvas.
 */
export const GraphToolbar: React.FC<GraphToolbarProps> = ({
  viewMode,
  scale,
  disabled,
  canExport,
  isExporting,
  isFullScreen,
  visibleNodeCount,
  totalNodeCount,
  onViewModeChange,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onResetLayout,
  onExport,
  onExpandAll,
  onCollapseAll,
  onToggleFullScreen,
}) => {
  const zoomPercent = Math.round(scale * 100);
  const atMin = scale <= MIN_SCALE + 0.001;
  const atMax = scale >= MAX_SCALE - 0.001;
  const isGraph = viewMode === 'graph';

  return (
    <div className="flex items-center flex-wrap gap-1 px-3 py-2 bg-neutral-900 border-b border-neutral-800 shrink-0">

      {/* ── View mode toggle — mirrors JSON Formatter's Code/Tree tabs ── */}
      <TBtn
        label="Graph view"
        disabled={false}
        onClick={() => onViewModeChange('graph')}
        active={isGraph}
      >
        <GitBranch className="w-3.5 h-3.5" />
        <span>Graph</span>
      </TBtn>

      <TBtn
        label="Tree view"
        disabled={false}
        onClick={() => onViewModeChange('tree')}
        active={!isGraph}
      >
        <List className="w-3.5 h-3.5" />
        <span>Tree</span>
      </TBtn>

      <Sep />

      {/* ── Zoom controls (graph mode only) ── */}
      {isGraph && (
        <>
          <IBtn label="Zoom out" disabled={disabled || atMin} onClick={onZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </IBtn>

          <span
            className="min-w-[40px] text-center text-xs font-mono text-neutral-500 select-none"
            aria-live="polite"
            aria-label={`Current zoom: ${zoomPercent}%`}
          >
            {zoomPercent}%
          </span>

          <IBtn label="Zoom in" disabled={disabled || atMax} onClick={onZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </IBtn>

          <Sep />

          <IBtn label="Fit to screen" disabled={disabled} onClick={onFitToScreen} title="Fit to screen">
            <Maximize className="w-4 h-4" />
          </IBtn>

          <IBtn label="Reset layout" disabled={disabled} onClick={onResetLayout} title="Reset layout">
            <RotateCcw className="w-4 h-4" />
          </IBtn>

          <Sep />

          <IBtn label="Expand all nodes" disabled={disabled || !canExport} onClick={onExpandAll} title="Expand all">
            <ChevronsUpDown className="w-4 h-4" />
          </IBtn>

          <IBtn label="Collapse all nodes" disabled={disabled || !canExport} onClick={onCollapseAll} title="Collapse all">
            <ChevronsDownUp className="w-4 h-4" />
          </IBtn>

          <Sep />

          {/* Export PNG */}
          <TBtn
            label="Export as PNG"
            disabled={disabled || !canExport || isExporting}
            onClick={onExport}
            title="Export as PNG"
          >
            {isExporting
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Download className="w-3.5 h-3.5" />}
            <span>{isExporting ? 'Exporting…' : 'Export PNG'}</span>
          </TBtn>
        </>
      )}

      {/* ── Right side: node count + fullscreen ── */}
      <div className="ml-auto flex items-center gap-1">
        {isGraph && totalNodeCount > 0 && (
          <span className="text-[10px] font-mono text-neutral-600 select-none whitespace-nowrap px-1 hidden sm:inline">
            {visibleNodeCount}/{totalNodeCount} nodes
          </span>
        )}

        {isGraph && totalNodeCount > 0 && (
          <Sep />
        )}

        {/* Fullscreen toggle — always visible, matches JSON Formatter */}
        <IBtn
          label={isFullScreen ? 'Exit full screen' : 'Full screen'}
          title={isFullScreen ? 'Exit full screen (Esc)' : 'Full screen'}
          disabled={false}
          onClick={onToggleFullScreen}
        >
          {isFullScreen
            ? <Minimize2 className="w-3.5 h-3.5" />
            : <Maximize2 className="w-3.5 h-3.5" />}
        </IBtn>
      </div>
    </div>
  );
};
