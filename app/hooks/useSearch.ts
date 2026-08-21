/**
 * useSearch.ts
 *
 * Reusable search hook for all tool pages.
 * Handles: query state, debounce, match index navigation, keyboard shortcuts (Ctrl+F).
 *
 * Each tool provides its own match-computation logic -  this hook only owns
 * the shared plumbing so tools don't duplicate it.
 *
 * Usage:
 *   const search = useSearch({ debounceMs: 200 });
 *   // use search.debouncedQuery to compute matches in the tool
 *   // pass search.* to <SearchBar />
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseSearchOptions {
  /** Debounce delay in ms before debouncedQuery updates. Default: 200 */
  debounceMs?: number;
  /** Open the search bar when Ctrl+F / Cmd+F is pressed. Default: true */
  captureCtrlF?: boolean;
}

export interface UseSearchReturn {
  /** Raw query as the user types */
  query: string;
  setQuery: (v: string) => void;
  /** Debounced query -  use this for expensive match computation */
  debouncedQuery: string;
  /** Whether the search bar is currently visible */
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  /** Current active match index (0-based) */
  matchIdx: number;
  setMatchIdx: (i: number) => void;
  /** Go to next match. Pass total match count. */
  next: (total: number) => void;
  /** Go to previous match. Pass total match count. */
  prev: (total: number) => void;
  /** Clear query and reset match index */
  clear: () => void;
  /** Ref to attach to the search <input> for auto-focus */
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const { debounceMs = 200, captureCtrlF = true } = options;

  const [query, setQueryState]         = useState('');
  const [debouncedQuery, setDebounced] = useState('');
  const [isOpen, setIsOpen]            = useState(false);
  const [matchIdx, setMatchIdx]        = useState(0);
  const inputRef                       = useRef<HTMLInputElement | null>(null);
  const debounceRef                    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Debounce ────────────────────────────────────────────────────────────────
  const setQuery = useCallback((v: string) => {
    setQueryState(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebounced(v);
      setMatchIdx(0);
    }, debounceMs);
  }, [debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  // ── Open / close ─────────────────────────────────────────────────────────────
  const open = useCallback(() => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      if (!prev) setTimeout(() => inputRef.current?.focus(), 50);
      return !prev;
    });
  }, []);

  const clear = useCallback(() => {
    setQueryState('');
    setDebounced('');
    setMatchIdx(0);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  // ── Navigation ───────────────────────────────────────────────────────────────
  const next = useCallback((total: number) => {
    if (total === 0) return;
    setMatchIdx(i => (i + 1) % total);
  }, []);

  const prev = useCallback((total: number) => {
    if (total === 0) return;
    setMatchIdx(i => (i - 1 + total) % total);
  }, []);

  // ── Ctrl+F capture ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!captureCtrlF) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [captureCtrlF, open]);

  return {
    query,
    setQuery,
    debouncedQuery,
    isOpen,
    open,
    close,
    toggle,
    matchIdx,
    setMatchIdx,
    next,
    prev,
    clear,
    inputRef,
  };
}
