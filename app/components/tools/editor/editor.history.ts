import { useState, useCallback } from 'react';
import type { Overlay, PageMeta } from './editor.types';

export interface HistorySnapshot {
  overlays: Overlay[];
  pageMetas: PageMeta[];
}

const MAX_HISTORY = 50;

export function useEditorHistory() {
  const [past, setPast] = useState<HistorySnapshot[]>([]);
  const [future, setFuture] = useState<HistorySnapshot[]>([]);

  const push = useCallback((snapshot: HistorySnapshot) => {
    setPast(prev => {
      const next = [...prev, snapshot];
      return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
    });
    setFuture([]);
  }, []);

  const undo = useCallback(
    (current: HistorySnapshot): HistorySnapshot | null => {
      if (past.length === 0) return null;
      const previous = past[past.length - 1];
      setPast(p => p.slice(0, -1));
      setFuture(f => [current, ...f]);
      return previous;
    },
    [past],
  );

  const redo = useCallback(
    (current: HistorySnapshot): HistorySnapshot | null => {
      if (future.length === 0) return null;
      const next = future[0];
      setFuture(f => f.slice(1));
      setPast(p => [...p, current]);
      return next;
    },
    [future],
  );

  const clear = useCallback(() => {
    setPast([]);
    setFuture([]);
  }, []);

  return {
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    push,
    undo,
    redo,
    clear,
  };
}
