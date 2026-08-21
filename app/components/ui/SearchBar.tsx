/**
 * SearchBar.tsx
 *
 * Shared search bar UI component used by all tool pages.
 * Stateless -  all state comes from the parent (via useSearch hook).
 *
 * Features:
 * - Query input with debounce (handled by hook)
 * - Match counter: "1 / 3" or "No results"
 * - Prev / Next navigation buttons
 * - Enter = next, Shift+Enter = prev, Escape = close
 * - Optional slot: scopeSelector (extra controls rendered after the input)
 * - Close button
 *
 * Visual style matches the existing dark tool theme (bg-neutral-900 toolbar bar).
 */

'use client';

import React from 'react';
import { Search, ArrowLeft, ArrowRight, X } from 'lucide-react';

export interface SearchBarProps {
  /** Current raw query value */
  query: string;
  onQueryChange: (v: string) => void;
  /** Total number of matches in the current result set */
  totalMatches: number;
  /** 0-based index of the currently highlighted match */
  matchIdx: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  /** Ref forwarded to the <input> for external focus control */
  inputRef?: React.RefObject<HTMLInputElement | null>;
  /** Optional extra controls (scope selector, match-case toggle, etc.) */
  scopeSelector?: React.ReactNode;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  totalMatches,
  matchIdx,
  onNext,
  onPrev,
  onClose,
  inputRef,
  scopeSelector,
  placeholder = 'Search…',
  className = '',
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onNext();
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      onPrev();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const noResults = query.length > 0 && totalMatches === 0;

  return (
    <div
      className={`px-3 py-2 bg-neutral-900 border-b border-neutral-800 flex items-center gap-2 text-xs font-mono shrink-0 ${className}`}
    >
      {/* Search icon */}
      <Search className="w-3.5 h-3.5 text-neutral-500 shrink-0" />

      {/* Input */}
      <div className="relative flex-1 min-w-0">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full bg-neutral-800 border rounded px-2 py-1 text-neutral-200 placeholder-neutral-600 focus:outline-none font-mono text-xs transition-colors ${
            noResults
              ? 'border-red-800 focus:border-red-600'
              : 'border-neutral-700 focus:border-neutral-500'
          }`}
        />
      </div>

      {/* Optional scope selector slot */}
      {scopeSelector}

      {/* Match counter */}
      {query.length > 0 && (
        <span className="text-neutral-500 shrink-0 tabular-nums whitespace-nowrap">
          {noResults ? 'No results' : `${matchIdx + 1} / ${totalMatches}`}
        </span>
      )}

      {/* Prev */}
      <button
        onClick={onPrev}
        disabled={totalMatches === 0}
        className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shrink-0"
        title="Previous match (Shift+Enter)"
        aria-label="Previous match"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
      </button>

      {/* Next */}
      <button
        onClick={onNext}
        disabled={totalMatches === 0}
        className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shrink-0"
        title="Next match (Enter)"
        aria-label="Next match"
      >
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      {/* Close */}
      <button
        onClick={onClose}
        className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 transition-colors cursor-pointer shrink-0"
        title="Close search (Escape)"
        aria-label="Close search"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
