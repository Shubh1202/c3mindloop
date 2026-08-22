'use client';

import React from 'react';
import {
  ZoomIn, ZoomOut, Maximize, RotateCcw,
  Download, Loader2, ChevronsDownUp, ChevronsUpDown,
  GitBranch, List, Maximize2, Minimize2, Search,
  Upload, FlaskConical, Trash2,
} from 'lucide-react';
import { Toolbar } from '../../ui/Toolbar';


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
  searchOpen: boolean;
  hasSearchQuery: boolean;
  onSearchToggle: () => void;
  // Input panel actions -  moved into toolbar
  hasInput: boolean;
  onUpload: () => void;
  onExamples: () => void;
  onClear: () => void;
}

// Helpers removed, standard Toolbar components are used directly instead.

/**
 * Primary toolbar -  full-width, in-flow, top of the workspace.
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
  searchOpen,
  hasSearchQuery,
  onSearchToggle,
  hasInput,
  onUpload,
  onExamples,
  onClear,
}) => {
  const zoomPercent = Math.round(scale * 100);
  const isGraph = viewMode === 'graph';

  const zoomOutDisabled = disabled || scale <= 0.101;
  const zoomInDisabled = disabled || scale >= 2.999;

  return (
    <Toolbar.Root isDark={true} isFullScreen={isFullScreen}>
      <Toolbar.Group>
        <Toolbar.Button
          onClick={() => onViewModeChange('graph')}
          active={isGraph}
          variant="primary"
          isDark={true}
          icon={GitBranch}
          label="Graph"
        />

        <Toolbar.Button
          onClick={() => onViewModeChange('tree')}
          active={!isGraph}
          variant="primary"
          isDark={true}
          icon={List}
          label="Tree"
        />

        <Toolbar.Separator />

        {/* ── Zoom controls (graph mode only) ── */}
        {isGraph && (
          <>
            <Toolbar.Button
              onClick={onZoomOut}
              disabled={zoomOutDisabled}
              title="Zoom out"
              aria-label="Zoom out"
              isDark={true}
              icon={ZoomOut}
              className="w-8 h-8 p-0 justify-center"
            />

            <span
              className="min-w-[40px] text-center text-xs font-mono text-neutral-500 select-none"
              aria-live="polite"
              aria-label={`Current zoom: ${zoomPercent}%`}
            >
              {zoomPercent}%
            </span>

            <Toolbar.Button
              onClick={onZoomIn}
              disabled={zoomInDisabled}
              title="Zoom in"
              aria-label="Zoom in"
              isDark={true}
              icon={ZoomIn}
              className="w-8 h-8 p-0 justify-center"
            />

            <Toolbar.Separator />

            <Toolbar.Button
              onClick={onFitToScreen}
              disabled={disabled}
              title="Fit to screen"
              aria-label="Fit to screen"
              isDark={true}
              icon={Maximize}
              className="w-8 h-8 p-0 justify-center"
            />

            <Toolbar.Button
              onClick={onResetLayout}
              disabled={disabled}
              title="Reset layout"
              aria-label="Reset layout"
              isDark={true}
              icon={RotateCcw}
              className="w-8 h-8 p-0 justify-center"
            />

            <Toolbar.Separator />

            <Toolbar.Button
              onClick={onExpandAll}
              disabled={disabled || !canExport}
              title="Expand all"
              aria-label="Expand all nodes"
              isDark={true}
              icon={ChevronsUpDown}
              className="w-8 h-8 p-0 justify-center"
            />

            <Toolbar.Button
              onClick={onCollapseAll}
              disabled={disabled || !canExport}
              title="Collapse all"
              aria-label="Collapse all nodes"
              isDark={true}
              icon={ChevronsDownUp}
              className="w-8 h-8 p-0 justify-center"
            />

            <Toolbar.Separator />

            {/* Upload / Examples / Clear / Search - before Export PNG */}
            <Toolbar.Button
              onClick={onUpload}
              disabled={disabled}
              title="Upload .json file"
              isDark={true}
              icon={Upload}
              label="Upload"
              className="hidden sm:flex"
            />

            <Toolbar.Button
              onClick={onExamples}
              disabled={disabled}
              title="Load example JSON"
              isDark={true}
              icon={FlaskConical}
              label="Examples"
              className="hidden sm:flex"
            />

            <Toolbar.Button
              onClick={onClear}
              disabled={!hasInput}
              title="Clear input"
              aria-label="Clear input"
              variant="danger"
              isDark={true}
              icon={Trash2}
              label="Clear"
            />

            {/* Search - positioned here to match JsonFormatter (before Export) */}
            <Toolbar.Button
              onClick={onSearchToggle}
              title="Search keys or values (Ctrl+F)"
              aria-label="Search"
              active={searchOpen || hasSearchQuery}
              variant="ghost"
              isDark={true}
              icon={Search}
              label="Search"
            />

            <Toolbar.Separator />

            {/* Export PNG */}
            <Toolbar.Button
              onClick={onExport}
              disabled={disabled || !canExport || isExporting}
              title="Export as PNG"
              isDark={true}
              icon={isExporting ? Loader2 : Download}
              iconClassName={isExporting ? "animate-spin" : ""}
              label={isExporting ? 'Exporting…' : 'Export PNG'}
            />
          </>
        )}
      </Toolbar.Group>

      {/* ── Right side: node count + fullscreen ── */}
      <Toolbar.Group align="right">
        {isGraph && totalNodeCount > 0 && (
          <span className="text-[10px] font-mono text-neutral-600 select-none whitespace-nowrap px-1 hidden sm:inline">
            {visibleNodeCount}/{totalNodeCount} nodes
          </span>
        )}

        {isGraph && totalNodeCount > 0 && (
          <Toolbar.Separator />
        )}

        {/* Fullscreen toggle */}
        <Toolbar.Button
          onClick={onToggleFullScreen}
          title={isFullScreen ? 'Exit full screen (Esc)' : 'Full screen'}
          isDark={true}
          icon={isFullScreen ? Minimize2 : Maximize2}
          className="w-8 h-8 p-0 justify-center"
        />
      </Toolbar.Group>
    </Toolbar.Root>
  );
};
