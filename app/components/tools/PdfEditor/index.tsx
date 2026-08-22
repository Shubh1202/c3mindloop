'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2, X, ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { useEditorState } from '../editor/editor.state';
import { uid } from '../editor/editor.utils';
import { PdfEditorToolbar } from './PdfEditorToolbar';
import { PdfEditorCanvas } from './PdfEditorCanvas';
import { PdfEditorPageThumbnails } from './PdfEditorPageThumbnails';
import { PdfEditorProperties } from './PdfEditorProperties';
import { SignaturePad } from './SignaturePad';

interface Props {
  isFullScreen?: boolean;
}

export const PdfEditor: React.FC<Props> = ({ isFullScreen: isFullScreenProp }) => {
  const editor = useEditorState();
  const { state } = editor;
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // ── PDF page sizes (derived at file-load via pdf-lib, for PDF-space coordinate conversion) ──
  const [pagePdfSizes, setPagePdfSizes] = useState<Array<{ width: number; height: number }>>([]);

  useEffect(() => {
    if (!state.file) { setPagePdfSizes([]); return; }
    (async () => {
      const { PDFDocument } = await import('pdf-lib');
      const buf = await state.file!.file.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      setPagePdfSizes(doc.getPages().map(p => p.getSize()));
    })();
  }, [state.file]);

  const activeOriginalIndex = state.pageMetas[state.activePage]?.originalIndex ?? state.activePage;
  const pagePdfSize = pagePdfSizes[activeOriginalIndex] ?? { width: 595, height: 842 }; // A4 fallback

  // Fullscreen side-effects: hide navbar, lock scroll, Esc to exit
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) setIsFullScreen(false);
    };
    const navbar = document.querySelector('header') as HTMLElement | null;
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
      if (navbar) navbar.style.display = 'none';
      window.addEventListener('keydown', handleKey);
    } else {
      document.body.style.overflow = '';
      if (navbar) navbar.style.display = '';
    }
    return () => {
      document.body.style.overflow = '';
      if (navbar) navbar.style.display = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [isFullScreen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); editor.undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); editor.redo(); }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const tag = (document.activeElement as HTMLElement)?.tagName;
        const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || (document.activeElement as HTMLElement)?.isContentEditable;
        if (state.selectedId && state.editingId === null && !isTyping) {
          editor.deleteOverlay(state.selectedId);
        }
      }
      if (e.key === 'Escape') { editor.selectOverlay(null); editor.stopEditing(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.selectedId, state.editingId, editor]);

  const selectedOverlay = state.overlays.find(o => o.id === state.selectedId) ?? null;
  const visiblePageCount = state.pageMetas.filter(m => !m.deleted).length;
  const hasUnsavedChanges = state.overlays.length > 0;

  // ── Document management ───────────────────────────────────────────────────

  const handleClosePdf = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowConfirmClose(true);
    } else {
      editor.clearFile();
    }
  }, [hasUnsavedChanges, editor]);

  const handleConfirmClose = useCallback(() => {
    setShowConfirmClose(false);
    editor.clearFile();
  }, [editor]);

  const handleReplacePdf = useCallback(() => {
    if (replaceInputRef.current) {
      replaceInputRef.current.value = '';
      replaceInputRef.current.click();
    }
  }, []);

  const handleReplaceFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) editor.loadFile(file);
    if (replaceInputRef.current) replaceInputRef.current.value = '';
  }, [editor]);

  // ── Canvas click ──────────────────────────────────────────────────────────

  const handleCanvasClick = useCallback((xFrac: number, yFrac: number) => {
    if (state.toolMode === 'text') {
      editor.addOverlay({
        id: uid(),
        kind: 'text',
        pageIndex: state.pageMetas[state.activePage]?.originalIndex ?? state.activePage,
        x: xFrac,
        y: yFrac,
        text: 'Double-click to edit',
        fontSize: 14,
        fontFamily: 'sans',
        color: '#1a1a1a',
        opacity: 1.0,
        bold: false,
        italic: false,
        underline: false,
      });
      editor.setToolMode('select');
    }
  }, [state.toolMode, state.activePage, state.pageMetas, editor]);

  // ── Empty state ───────────────────────────────────────────────────────────

  if (!state.file) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center p-8 text-neutral-500 border-2 border-dashed border-neutral-800 rounded bg-neutral-900/10 min-h-[400px] cursor-pointer hover:border-neutral-700 hover:bg-neutral-900/20 transition-all"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault();
          const file = Array.from(e.dataTransfer.files).find(f => f.type === 'application/pdf');
          if (file) editor.loadFile(file);
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) editor.loadFile(file);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
        />
        <Upload className="w-8 h-8 text-neutral-700 mb-3" />
        <p className="text-xs font-mono font-semibold text-neutral-300">Drop a PDF or click to browse</p>
        <p className="text-[10px] font-sans text-neutral-600 mt-1">Supports text overlays, whiteout, images, signatures, page management &amp; form filling</p>
      </div>
    );
  }

  // ── Editor workspace ──────────────────────────────────────────────────────

  return (
    <div className={`relative flex flex-col flex-1 border border-neutral-800 rounded bg-neutral-950 overflow-hidden ${isFullScreen ? 'fixed inset-0 z-[9999]' : 'min-h-[520px]'}`}>

      {/* Hidden replace-PDF file input (separate from the empty-state input) */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleReplaceFileChange}
      />

      {/* Toolbar */}
      <PdfEditorToolbar
        toolMode={state.toolMode}
        zoom={state.zoom}
        activePage={state.activePage}
        pageCount={visiblePageCount}
        canUndo={editor.canUndo}
        canRedo={editor.canRedo}
        working={state.working}
        isFullScreen={isFullScreen}
        onToolMode={editor.setToolMode}
        onZoom={editor.setZoom}
        onUndo={editor.undo}
        onRedo={editor.redo}
        onExport={editor.exportPdf}
        onImageUpload={(dataUrl, w, h) => editor.addImage(dataUrl, w, h)}
        onSignatureOpen={() => setShowSignaturePad(true)}
        onToggleFullScreen={() => setIsFullScreen(v => !v)}
        onReplacePdf={handleReplacePdf}
        onClosePdf={handleClosePdf}
      />

      {/* Status messages */}
      {(state.error || state.success) && (
        <div className={`px-3 py-2 flex items-center gap-2 text-xs font-mono border-b border-neutral-800 ${state.error ? 'bg-red-950/30 text-red-300' : 'bg-emerald-950/30 text-emerald-300'}`}>
          {state.error
            ? <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            : <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
          <span className="flex-1">{state.error ?? state.success}</span>
          <button onClick={() => editor.clearStatus()} className="p-0.5 rounded hover:bg-neutral-800 cursor-pointer">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Confirm close dialog */}
      {showConfirmClose && (
        <div className="absolute inset-0 z-[10001] flex items-center justify-center bg-neutral-950/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 space-y-4">
            <h2 className="text-sm font-semibold text-neutral-100 font-mono">Remove this PDF?</h2>
            <p className="text-xs text-neutral-400 font-mono leading-relaxed">
              You have unsaved annotations. Closing the PDF will discard all changes.
            </p>
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setShowConfirmClose(false)}
                className="px-4 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClose}
                className="px-4 py-1.5 rounded bg-red-900 hover:bg-red-800 text-red-200 text-xs font-mono transition-colors cursor-pointer"
              >
                Remove PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main 3-column workspace */}
      <div className={`flex flex-1 divide-x divide-neutral-800 overflow-hidden ${isFullScreen ? 'min-h-0' : ''}`}>

        {/* Left: Page thumbnails — widened to 116px for readability */}
        <div className="w-[116px] shrink-0 bg-neutral-950 overflow-y-auto">
          <PdfEditorPageThumbnails
            file={state.file}
            pageMetas={state.pageMetas}
            activePage={state.activePage}
            onSelectPage={editor.setActivePage}
            onDeletePage={editor.deletePage}
            onRotatePage={editor.rotatePage}
            onReorderPage={editor.reorderPage}
          />
        </div>

        {/* Center: Canvas (relative parent for the absolute properties floating panel) */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Page nav bar */}
          <div className="px-3 py-1.5 bg-neutral-900/60 border-b border-neutral-800 flex items-center justify-between text-[10px] font-mono text-neutral-400">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => editor.setActivePage(Math.max(0, state.activePage - 1))}
                disabled={state.activePage === 0}
                className="p-0.5 rounded hover:bg-neutral-800 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span>Page {state.activePage + 1} of {visiblePageCount}</span>
              <button
                onClick={() => editor.setActivePage(Math.min(visiblePageCount - 1, state.activePage + 1))}
                disabled={state.activePage >= visiblePageCount - 1}
                className="p-0.5 rounded hover:bg-neutral-800 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-neutral-600">
              {state.overlays.filter(o => o.pageIndex === (state.pageMetas[state.activePage]?.originalIndex ?? state.activePage)).length} element(s) on page
            </span>
          </div>

          <PdfEditorCanvas
            file={state.file}
            activePage={state.activePage}
            activeOriginalIndex={state.pageMetas[state.activePage]?.originalIndex ?? state.activePage}
            pageRotation={state.pageMetas[state.activePage]?.rotation ?? 0}
            zoom={state.zoom}
            overlays={state.overlays}
            selectedId={state.selectedId}
            editingId={state.editingId}
            toolMode={state.toolMode}
            formFields={state.formFields}
            onSelectOverlay={editor.selectOverlay}
            onStartEditing={editor.startEditing}
            onStopEditing={editor.stopEditing}
            onMoveOverlay={editor.moveOverlaySilent}
            onCommitMove={editor.commitMove}
            onResizeOverlay={editor.resizeOverlaySilent}
            onCommitResize={editor.commitResize}
            onUpdateOverlay={(id, patch) => editor.updateOverlay(id, patch as any)}
            onUpdateOverlaySilent={(id, patch) => editor.updateOverlaySilent(id, patch as any)}
            onCaptureSnapshot={editor.captureSnapshot}
            onDeleteOverlay={editor.deleteOverlay}
            onWhiteoutDrawn={editor.addWhiteout}
            onCutoutDrawn={(x, y, w, h, srcPdfX, srcPdfY, srcPdfW, srcPdfH, previewDataUrl) =>
              editor.addCutout(x, y, w, h, srcPdfX, srcPdfY, srcPdfW, srcPdfH, previewDataUrl)
            }
            onCanvasClick={handleCanvasClick}
            onUpdateFormField={editor.updateFormField}
            pagePdfSize={pagePdfSize}
          />

          {/* ── Floating Properties Panel ────────────────────────────────────────
               Absolutely positioned over the canvas — zero layout shift.
               Fades in/out with opacity + scale transition.                    */}
          <div
            className={`absolute bottom-4 right-4 z-[200] transition-all duration-200 pointer-events-none ${
              selectedOverlay
                ? 'opacity-100 scale-100 pointer-events-auto'
                : 'opacity-0 scale-95'
            }`}
          >
            <PdfEditorProperties
              selectedOverlay={selectedOverlay}
              formFields={state.formFields}
              onUpdateOverlay={(id, patch) => editor.updateOverlay(id, patch as any)}
              onUpdateOverlaySilent={(id, patch) => editor.updateOverlaySilent(id, patch as any)}
              onCaptureSnapshot={editor.captureSnapshot}
              onUpdateFormField={editor.updateFormField}
              onClose={() => editor.selectOverlay(null)}
            />
          </div>
        </div>
      </div>

      {/* Signature pad modal */}
      {showSignaturePad && (
        <SignaturePad
          onConfirm={dataUrl => {
            editor.addSignature(dataUrl);
            setShowSignaturePad(false);
          }}
          onClose={() => setShowSignaturePad(false)}
        />
      )}
    </div>
  );
};
