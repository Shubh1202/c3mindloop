'use client';

import React from 'react';
import { GraphStats } from './graphTypes';

interface GraphInfoBarProps {
  stats: GraphStats | null;
  copiedPath: string | null;
}

/**
 * Slim stats bar -  shows live graph metrics and copy-path feedback.
 * Search has been moved to a collapsible row in JsonGraphTool (standard pattern).
 */
export const GraphInfoBar: React.FC<GraphInfoBarProps> = ({ stats, copiedPath }) => {
  if (!stats && !copiedPath) return null;

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 border-b border-neutral-800 bg-neutral-900/40 shrink-0 flex-wrap text-[10px] font-mono text-neutral-600">
      {stats && (
        <>
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
        </>
      )}

      {copiedPath && (
        <>
          {stats && <div className="w-px h-4 bg-neutral-800 shrink-0 hidden sm:block" />}
          <span className="text-emerald-500 truncate max-w-[200px]" title={copiedPath}>
            ✓ {copiedPath}
          </span>
        </>
      )}
    </div>
  );
};
