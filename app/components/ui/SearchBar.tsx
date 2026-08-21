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
import { useTheme } from '../../lib/theme';

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
  const { isDark } = useTheme();

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

  const btnClass = isDark
    ? "p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shrink-0"
    : "p-1 rounded bg-[#E4E4E7] hover:bg-[#D4D4D8] text-[#3F3F46] hover:text-[#18181B] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shrink-0";

  const closeBtnClass = isDark
    ? "p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 transition-colors cursor-pointer shrink-0"
    : "p-1 rounded bg-[#E4E4E7] hover:bg-[#D4D4D8] text-[#71717A] hover:text-[#18181B] transition-colors cursor-pointer shrink-0";

  return (
    <div
      className={`px-3 py-2 border-b flex items-center gap-2 text-xs font-mono shrink-0 ${
        isDark
          ? 'bg-neutral-900 border-neutral-800 text-neutral-400'
          : 'bg-[#F8F9FA] border-[#E4E4E7] text-[#52525B]'
      } ${className}`}
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
          className={`w-full border rounded px-2 py-1 focus:outline-none font-mono text-xs transition-colors ${
            isDark
              ? `bg-neutral-800 text-neutral-200 placeholder-neutral-600 ${
                  noResults ? 'border-red-800 focus:border-red-600' : 'border-neutral-700 focus:border-neutral-500'
                }`
              : `bg-[#FFFFFF] text-[#111111] placeholder-[#A1A1AA] ${
                  noResults ? 'border-red-600 focus:border-red-500' : 'border-[#D4D4D8] focus:border-[#1D9BF0]'
                }`
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
        className={btnClass}
        title="Previous match (Shift+Enter)"
        aria-label="Previous match"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
      </button>

      {/* Next */}
      <button
        onClick={onNext}
        disabled={totalMatches === 0}
        className={btnClass}
        title="Next match (Enter)"
        aria-label="Next match"
      >
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      {/* Close */}
      <button
        onClick={onClose}
        className={closeBtnClass}
        title="Close search (Escape)"
        aria-label="Close search"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
