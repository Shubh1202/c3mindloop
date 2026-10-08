'use client';

import React from 'react';

export const DiffCheckerDocs: React.FC = () => {
  return (
    <div className="space-y-10 text-theme-main">
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          Diff Comparison Modes: Split (Side-by-Side) vs Unified (Inline)
        </h2>
        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
          The diff engine evaluates two text buffers line-by-line using the Longest Common Subsequence (LCS) algorithm with intra-line character highlighting:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="font-semibold text-theme-main text-xs text-blue-400">Split Mode (Side-by-Side)</h3>
            <p className="text-theme-muted">
              Displays Original and Modified buffers in synchronized adjacent columns. Best for desktop code reviews, schema migrations, and configuration drift comparisons.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="font-semibold text-theme-main text-xs text-green-400">Unified Mode (Inline Diff)</h3>
            <p className="text-theme-muted">
              Merges changes into a single chronological stream with green <code className="text-green-300 bg-neutral-900 px-1 rounded">+ additions</code> and red <code className="text-red-300 bg-neutral-900 px-1 rounded">- deletions</code>. Matches standard <code className="font-mono text-neutral-300">git diff</code> terminal output.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
