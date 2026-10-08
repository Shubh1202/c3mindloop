'use client';

import React from 'react';

export const JsonGraphDocs: React.FC = () => {
  return (
    <div className="space-y-10 text-theme-main">
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          Visualizing Nested JSON Hierarchies as Node Graphs
        </h2>
        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
          Deeply nested API responses with arrays and objects can be challenging to inspect linearly. The JSON Graph visualizer translates JSON objects into interactive node-edge diagrams:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="font-semibold text-theme-main text-xs text-blue-400">Object & Array Nodes</h3>
            <p className="text-theme-muted">
              Objects generate structural branch nodes connecting keys to their respective child values or nested arrays.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="font-semibold text-theme-main text-xs text-green-400">Primitive Leaves & Type Color-Coding</h3>
            <p className="text-theme-muted">
              String, number, boolean, and null primitives render as distinct terminal nodes with syntax-highlighted labels.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
