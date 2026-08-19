'use client';

import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';
import { GraphStats } from './graphTypes';

interface GraphInfoBarProps {
  stats: GraphStats | null;
  searchQuery: string;
  searchMatchCount: number;
  onSearchChange: (q: string) => void;
  copiedPath: string | null;
}

export const GraphInfoBar: React.FC<GraphInfoBarProps> = ({
  stats,
  searchQuery,
  searchMatchCount,
  onSearchChange,
  copiedPath,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 border-b border-neutral-800 bg-neutral-900/40 shrink-0 flex-wrap">

      {/* Search */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0 max-w-xs">
        <Search className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search keys or values…"
          className="flex-1 min-w-0 bg-transparent text-xs font-mono text-neutral-200 placeholder-neutral-600 outline-none border-none"
          spellCheck={false}
          aria-label="Search nodes"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="text-neutral-600 hover:text-neutral-400 transition-colors cursor-pointer shrink-0"
            aria-label="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}
        {searchQuery && (
          <span className={`text-[10px] font-mono shrink-0 ${searchMatchCount > 0 ? 'text-amber-400' : 'text-neutral-600'}`}>
            {searchMatchCount} match{searchMatchCount !== 1 ? 'es' : ''}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-neutral-800 shrink-0 hidden sm:block" />

      {/* Stats */}
      {stats && (
        <div className="flex items-center gap-3 text-[10px] font-mono text-neutral-600 flex-wrap">
          <span title="Total keys">
            <span className="text-neutral-500">{stats.totalKeys}</span> keys
          </span>
          <span title="Maximum nesting depth">
            depth <span className="text-neutral-500">{stats.maxDepth}</span>
          </span>
          <span title="Object count" className="hidden sm:inline">
            <span className="text-sky-700">{stats.objectCount}</span> obj
          </span>
          <span title="Array count" className="hidden sm:inline">
            <span className="text-purple-700">{stats.arrayCount}</span> arr
          </span>
          {stats.nullCount > 0 && (
            <span title="Null value count" className="hidden md:inline">
              <span className="text-neutral-500">{stats.nullCount}</span> null
            </span>
          )}
        </div>
      )}

      {/* Copy path toast */}
      {copiedPath && (
        <>
          <div className="w-px h-4 bg-neutral-800 shrink-0 hidden sm:block" />
          <span className="text-[10px] font-mono text-emerald-500 truncate max-w-[200px]" title={copiedPath}>
            ✓ {copiedPath}
          </span>
        </>
      )}
    </div>
  );
};
