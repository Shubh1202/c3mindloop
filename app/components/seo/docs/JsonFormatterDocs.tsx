'use client';

import React from 'react';

export const JsonFormatterDocs: React.FC = () => {
  return (
    <div className="space-y-10 text-theme-main">
      {/* JSON Formatting & Error Repair Reference */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          Common JSON Syntax Errors & In-Browser Smart Repair
        </h2>
        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
          Standard RFC 8259 JSON requires strict compliance. Our in-browser validator detects and automatically fixes typical developer formatting oversights:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="font-semibold text-theme-main text-xs flex items-center justify-between">
              <span>Trailing Commas in Objects & Arrays</span>
              <span className="text-[10px] font-mono text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-900/50">Syntax Error</span>
            </h3>
            <p className="text-theme-muted">
              Standard parsers reject <code className="bg-neutral-900 px-1 py-0.5 rounded text-red-300">&#123;&quot;a&quot;: 1,&#125;</code>. The Smart Repair engine safely strips trailing delimiters without corrupting payloads.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="font-semibold text-theme-main text-xs flex items-center justify-between">
              <span>Single Quotes & Unquoted Object Keys</span>
              <span className="text-[10px] font-mono text-yellow-400 bg-yellow-950/40 px-2 py-0.5 rounded border border-yellow-900/50">JS Object Literal</span>
            </h3>
            <p className="text-theme-muted">
              JavaScript object syntax like <code className="bg-neutral-900 px-1 py-0.5 rounded text-yellow-300">&#123; name: &apos;value&apos; &#125;</code> is converted to valid double-quoted RFC JSON.
            </p>
          </div>
        </div>
      </section>

      {/* Beautify vs Minify Comparison */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          JSON Beautify (Pretty Print) vs JSON Minify
        </h2>
        
        <div className="overflow-x-auto rounded-lg border border-theme-subtle bg-surface">
          <table className="w-full text-left text-xs sm:text-sm font-mono divide-y divide-theme-subtle">
            <thead className="bg-neutral-900/60 text-theme-muted text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Mode</th>
                <th className="px-4 py-2.5 font-semibold">Indentation / Whitespace</th>
                <th className="px-4 py-2.5 font-semibold">Typical Usage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle text-theme-muted">
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-blue-400">Beautify (2 / 4 spaces)</td>
                <td className="px-4 py-2.5 text-theme-main">Formatted indentation, hierarchical structure</td>
                <td className="px-4 py-2.5">API debugging, code review, documentation inspection</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-green-400">Minify (0 whitespace)</td>
                <td className="px-4 py-2.5 text-theme-main">All newlines and whitespace stripped</td>
                <td className="px-4 py-2.5">Production network payloads, Redis/cache storage, bandwidth saving</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
