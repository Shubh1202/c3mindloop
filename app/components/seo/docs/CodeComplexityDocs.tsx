'use client';

import React from 'react';

export const CodeComplexityDocs: React.FC = () => {
  return (
    <div className="space-y-10 text-theme-main">
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          Cyclomatic Complexity ($M$) & Maintainability Index Benchmarks
        </h2>
        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
          Cyclomatic complexity measures the number of linearly independent paths through a program&apos;s source code:
        </p>

        <div className="overflow-x-auto rounded-lg border border-theme-subtle bg-surface">
          <table className="w-full text-left text-xs sm:text-sm font-mono divide-y divide-theme-subtle">
            <thead className="bg-neutral-900/60 text-theme-muted text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Complexity Score ($M$)</th>
                <th className="px-4 py-2.5 font-semibold">Risk Category</th>
                <th className="px-4 py-2.5 font-semibold">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle text-theme-muted">
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-green-400">1 – 10</td>
                <td className="px-4 py-2.5 text-green-400 font-semibold">Low Risk</td>
                <td className="px-4 py-2.5">Simple, structured code; high testability and maintainability</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-yellow-400">11 – 20</td>
                <td className="px-4 py-2.5 text-yellow-400 font-semibold">Moderate Risk</td>
                <td className="px-4 py-2.5">Moderate complexity; consider breaking large conditionals into helper methods</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-orange-400">21 – 50</td>
                <td className="px-4 py-2.5 text-orange-400 font-semibold">High Risk</td>
                <td className="px-4 py-2.5">Complex logic; refactor into modular functions or strategy patterns</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-red-400">&gt; 50</td>
                <td className="px-4 py-2.5 text-red-400 font-semibold">Very High Risk</td>
                <td className="px-4 py-2.5">Unstable, untestable code; urgent architectural refactoring required</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
