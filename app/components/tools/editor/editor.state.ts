'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  EditorState, Overlay, ToolMode, PageMeta, FormField, PdfFile,
  TextOverlay, WhiteoutOverlay, ImageOverlay, SignatureOverlay, CutoutOverlay, RotationDeg,
} from './editor.types';
import { useEditorHistory } from './editor.history';
import { uid, buildPageMetas, makePdfFile } from './editor.utils';
import { detectFormFields, exportEditedPdf } from './pdf-editor.service';

const INITIAL: EditorState = {
  file: null,
  overlays: [],
  selectedId: null,
  editingId: null,
  activePage: 0,
  zoom: 1.0,
  toolMode: 'select',
  pageMetas: [],
  formFields: [],
  working: false,
  error: null,
  success: null,
};

export function useEditorState() {
  const [state, setState] = useState<EditorState>(INITIAL);
  const stateRef = useRef<EditorState>(INITIAL);
  const history = useEditorHistory();

  const snapshot = (s: EditorState) => ({
    overlays: s.overlays,
    pageMetas: s.pageMetas,
  });

  const set = useCallback((patch: Partial<EditorState>) => {
    setState(prev => {
      const next = { ...prev, ...patch };
      stateRef.current = next;
      return next;
    });
  }, []);

  // ── File loading ──────────────────────────────────────────────────────────

  const loadFile = useCallback(async (file: File) => {
    const pdfFile = await makePdfFile(file);
    const metas = await buildPageMetas(file, pdfFile.pageCount ?? 1);

    let formFields: FormField[] = [];
    try {
      formFields = await detectFormFields(file) as FormField[];
    } catch { /* PDF has no form */ }

    history.clear();
    const next = { ...INITIAL, file: pdfFile, pageMetas: metas, formFields };
    stateRef.current = next;
    setState(next);
  }, [history]);

  const clearFile = useCallback(() => {
    history.clear();
    stateRef.current = INITIAL;
    setState(INITIAL);
  }, [history]);

  // ── Overlay mutations ─────────────────────────────────────────────────────

  const addOverlay = useCallback((overlay: Overlay) => {
    setState(prev => {
      history.push(snapshot(prev));
      return { ...prev, overlays: [...prev.overlays, overlay], selectedId: overlay.id };
    });
  }, [history]);

  const updateOverlay = useCallback((id: string, patch: Partial<Overlay>) => {
    setState(prev => {
      history.push(snapshot(prev));
      return {
        ...prev,
        overlays: prev.overlays.map(o => o.id === id ? { ...o, ...patch } as Overlay : o),
      };
    });
  }, [history]);

  /** Update position without polluting undo stack (called during live drag) */
  const moveOverlaySilent = useCallback((id: string, x: number, y: number) => {
    setState(prev => {
      const next = {
        ...prev,
        overlays: prev.overlays.map(o => o.id === id ? { ...o, x, y } : o),
      };
      stateRef.current = next;
      return next;
    });
  }, []);

  /** Update size/position without polluting undo stack (called during live resize) */
  const resizeOverlaySilent = useCallback((id: string, patch: Partial<Overlay>) => {
    setState(prev => {
      const next = {
        ...prev,
        overlays: prev.overlays.map(o => o.id === id ? { ...o, ...patch } as Overlay : o),
      };
      stateRef.current = next;
      return next;
    });
  }, []);

  /** Update any overlay property silently (no history)- used for live slider drag */
  const updateOverlaySilent = useCallback((id: string, patch: Partial<Overlay>) => {
    setState(prev => {
      const next = {
        ...prev,
        overlays: prev.overlays.map(o => o.id === id ? { ...o, ...patch } as Overlay : o),
      };
      stateRef.current = next;
      return next;
    });
  }, []);

  /** Capture the current state into history BEFORE a silent drag begins (called on pointerdown) */
  const captureSnapshot = useCallback(() => {
    setState(prev => {
      history.push(snapshot(prev));
      return prev;
    });
  }, [history]);

  /** Commit a history snapshot after a silent drag completes */
  const commitMove = useCallback((id: string) => {
    setState(prev => {
      history.push(snapshot(prev));
      return prev;
    });
  }, [history]);

  /** Commit a history snapshot after a silent resize completes */
  const commitResize = useCallback((id: string) => {
    setState(prev => {
      history.push(snapshot(prev));
      return prev;
    });
  }, [history]);

  /** Commit a history snapshot after any silent property update completes (e.g. slider release) */
  const commitOverlay = useCallback((_id: string) => {
    setState(prev => {
      history.push(snapshot(prev));
      return prev;
    });
  }, [history]);

  const deleteOverlay = useCallback((id: string) => {
    setState(prev => {
      history.push(snapshot(prev));
      return {
        ...prev,
        overlays: prev.overlays.filter(o => o.id !== id),
        selectedId: prev.selectedId === id ? null : prev.selectedId,
      };
    });
  }, [history]);

  // ── Selection / editing ───────────────────────────────────────────────────

  const selectOverlay = useCallback((id: string | null) => {
    set({ selectedId: id, editingId: null });
  }, [set]);

  const startEditing = useCallback((id: string) => {
    set({ editingId: id, selectedId: id });
  }, [set]);

  const stopEditing = useCallback(() => {
    set({ editingId: null });
  }, [set]);

  // ── Tool / navigation ─────────────────────────────────────────────────────

  const setToolMode = useCallback((mode: ToolMode) => {
    set({ toolMode: mode, selectedId: null, editingId: null });
  }, [set]);

  const setActivePage = useCallback((page: number) => {
    set({ activePage: page, selectedId: null, editingId: null });
  }, [set]);

  const setZoom = useCallback((zoom: number) => {
    set({ zoom: Math.min(2.0, Math.max(0.5, zoom)) });
  }, [set]);

  // ── Page management ───────────────────────────────────────────────────────

  const deletePage = useCallback((pageIndex: number) => {
    setState(prev => {
      history.push(snapshot(prev));
      const metas = prev.pageMetas.map((m, i) =>
        i === pageIndex ? { ...m, deleted: true } : m,
      );
      const nextActive = Math.max(
        0,
        metas.findIndex((m, i) => !m.deleted && i >= pageIndex),
      );
      return { ...prev, pageMetas: metas, activePage: nextActive };
    });
  }, [history]);

  const rotatePage = useCallback((pageIndex: number, by: 90 | -90) => {
    setState(prev => {
      history.push(snapshot(prev));
      const metas = prev.pageMetas.map((m, i) => {
        if (i !== pageIndex) return m;
        const next = ((m.rotation + by + 360) % 360) as RotationDeg;
        return { ...m, rotation: next };
      });
      return { ...prev, pageMetas: metas };
    });
  }, [history]);

  const reorderPage = useCallback((fromIndex: number, toIndex: number) => {
    setState(prev => {
      if (fromIndex === toIndex) return prev;
      history.push(snapshot(prev));
      const metas = [...prev.pageMetas];
      const [item] = metas.splice(fromIndex, 1);
      metas.splice(toIndex, 0, item);
      return { ...prev, pageMetas: metas };
    });
  }, [history]);

  // ── Form fields ───────────────────────────────────────────────────────────

  const updateFormField = useCallback((name: string, value: string) => {
    setState(prev => ({
      ...prev,
      formFields: prev.formFields.map(f => f.name === name ? { ...f, value } : f),
    }));
  }, []);

  // ── Undo / Redo ───────────────────────────────────────────────────────────

  const undo = useCallback(() => {
    setState(prev => {
      const restored = history.undo(snapshot(prev));
      if (!restored) return prev;
      return { ...prev, overlays: restored.overlays, pageMetas: restored.pageMetas, selectedId: null };
    });
  }, [history]);

  const redo = useCallback(() => {
    setState(prev => {
      const restored = history.redo(snapshot(prev));
      if (!restored) return prev;
      return { ...prev, overlays: restored.overlays, pageMetas: restored.pageMetas, selectedId: null };
    });
  }, [history]);

  // ── Export ────────────────────────────────────────────────────────────────

  const exportPdf = useCallback(async () => {
    const snap = stateRef.current;
    if (!snap.file) return;
    set({ working: true, error: null, success: null });
    try {
      await exportEditedPdf(snap.file.file, snap.overlays, snap.pageMetas, snap.formFields);
      set({ working: false, success: 'PDF exported and downloaded successfully.' });
    } catch (err: any) {
      set({ working: false, error: `Export failed: ${err.message ?? 'Unknown error'}` });
    }
  }, [set]);

  // ── Convenience overlay factories ─────────────────────────────────────────

  const addText = useCallback(() => {
    if (!state.file) return;
    const overlay: TextOverlay = {
      id: uid(), kind: 'text',
      pageIndex: state.pageMetas[state.activePage]?.originalIndex ?? state.activePage,
      x: 0.3, y: 0.4,
      text: 'Double-click to edit',
      fontSize: 16, fontFamily: 'sans',
      color: '#1a1a1a', opacity: 1.0,
      bold: false, italic: false, underline: false,
    };
    addOverlay(overlay);
    set({ toolMode: 'select' });
  }, [state.file, state.activePage, state.pageMetas, addOverlay, set]);

  const addWhiteout = useCallback((x: number, y: number, width: number, height: number) => {
    if (!state.file) return;
    const overlay: WhiteoutOverlay = {
      id: uid(), kind: 'whiteout',
      pageIndex: state.pageMetas[state.activePage]?.originalIndex ?? state.activePage,
      x, y, width, height,
    };
    addOverlay(overlay);
    set({ toolMode: 'select' });
  }, [state.file, state.activePage, state.pageMetas, addOverlay, set]);

  const addImage = useCallback((dataUrl: string, w: number, h: number) => {
    if (!state.file) return;
    const overlay: ImageOverlay = {
      id: uid(), kind: 'image',
      pageIndex: state.pageMetas[state.activePage]?.originalIndex ?? state.activePage,
      x: 0.1, y: 0.1,
      dataUrl, width: w, height: h, opacity: 1.0,
    };
    addOverlay(overlay);
    set({ toolMode: 'select' });
  }, [state.file, state.activePage, state.pageMetas, addOverlay, set]);

  const addSignature = useCallback((dataUrl: string) => {
    if (!state.file) return;
    const overlay: SignatureOverlay = {
      id: uid(), kind: 'signature',
      pageIndex: state.pageMetas[state.activePage]?.originalIndex ?? state.activePage,
      x: 0.1, y: 0.6,
      dataUrl, width: 0.3, height: 0.08, opacity: 1.0,
    };
    addOverlay(overlay);
    set({ toolMode: 'select' });
  }, [state.file, state.activePage, state.pageMetas, addOverlay, set]);

  const addCutout = useCallback((
    x: number, y: number, w: number, h: number,
    srcPdfX: number, srcPdfY: number, srcPdfW: number, srcPdfH: number,
    previewDataUrl: string,
  ) => {
    if (!state.file) return;
    const pageIdx = state.pageMetas[state.activePage]?.originalIndex ?? state.activePage;
    const overlay: CutoutOverlay = {
      id: uid(), kind: 'cutout',
      pageIndex: pageIdx,
      x, y, width: w, height: h,
      srcPdfX, srcPdfY, srcPdfW, srcPdfH,
      srcPageIndex: pageIdx,
      previewDataUrl,
      opacity: 1.0,
    };
    setState(prev => {
      history.push(snapshot(prev));
      return { ...prev, overlays: [...prev.overlays, overlay], selectedId: overlay.id, toolMode: 'select' };
    });
  }, [state.file, state.activePage, state.pageMetas, history]);

  return {
    state,
    // file
    loadFile,
    clearFile,
    // overlays
    addOverlay,
    updateOverlay,
    updateOverlaySilent,
    moveOverlaySilent,
    commitMove,
    resizeOverlaySilent,
    commitResize,
    commitOverlay,
    captureSnapshot,
    deleteOverlay,
    // selection
    selectOverlay,
    startEditing,
    stopEditing,
    // tool / nav
    setToolMode,
    setActivePage,
    setZoom,
    // page management
    deletePage,
    rotatePage,
    reorderPage,
    // form
    updateFormField,
    // history
    undo,
    redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    // status
    clearStatus: () => set({ error: null, success: null }),
    // export
    exportPdf,
    // factories
    addText,
    addWhiteout,
    addImage,
    addSignature,
    addCutout,
  };
}

export type EditorActions = ReturnType<typeof useEditorState>;
