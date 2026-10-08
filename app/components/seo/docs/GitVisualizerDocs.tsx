'use client';

import React from 'react';

export const GitVisualizerDocs: React.FC = () => {
  return (
    <div className="space-y-10 text-theme-main">
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          Git Commit DAG (Directed Acyclic Graph) & Branch Pointers
        </h2>
        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
          Git models repository history as a directed acyclic graph of immutable commit nodes referenced by mutable branch pointers and HEAD:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="font-semibold text-theme-main text-xs text-blue-400">Git Merge (Preserves History)</h3>
            <p className="text-theme-muted">
              Creates a dedicated 2-parent merge commit that joins diverging branch histories while preserving original commit timestamps and author signatures.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="font-semibold text-theme-main text-xs text-green-400">Git Rebase (Linear History)</h3>
            <p className="text-theme-muted">
              Replays commits sequentially onto a new base tip, generating fresh commit hashes to maintain a clean linear project history.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
