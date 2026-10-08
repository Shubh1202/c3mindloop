'use client';

import React from 'react';

export const SqlToJsonDocs: React.FC = () => {
  return (
    <div className="space-y-10 text-theme-main">
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          How SQL Statements Parse to JSON Schema
        </h2>
        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
          The parser extracts table columns and row tuples from SQL statements (<code className="text-xs font-mono bg-neutral-900 px-1 py-0.5 rounded">INSERT INTO table (col1, col2) VALUES (...)</code>) and maps data types dynamically into structured JSON object arrays:
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="font-semibold text-theme-main text-xs flex items-center justify-between">
              <span>SQL Input Statement</span>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded">SQL</span>
            </h3>
            <div className="p-3 bg-neutral-950 rounded border border-theme-subtle font-mono text-[11px] overflow-x-auto text-neutral-300">
              <p><span className="text-blue-400">INSERT INTO</span> users (id, name, is_active)</p>
              <p><span className="text-blue-400">VALUES</span> (1, <span className="text-green-300">&apos;Alex&apos;</span>, <span className="text-yellow-400">true</span>),</p>
              <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(2, <span className="text-green-300">&apos;Sam&apos;</span>, <span className="text-yellow-400">false</span>);</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="font-semibold text-theme-main text-xs flex items-center justify-between">
              <span>Generated JSON Output</span>
              <span className="text-[10px] font-mono text-green-400 bg-green-950/40 px-2 py-0.5 rounded border border-green-900/50">JSON Array</span>
            </h3>
            <div className="p-3 bg-neutral-950 rounded border border-theme-subtle font-mono text-[11px] overflow-x-auto text-neutral-300">
              <p>[</p>
              <p>&nbsp;&nbsp;&#123; <span className="text-blue-300">&quot;id&quot;</span>: 1, <span className="text-blue-300">&quot;name&quot;</span>: <span className="text-green-300">&quot;Alex&quot;</span>, <span className="text-blue-300">&quot;is_active&quot;</span>: <span className="text-yellow-400">true</span> &#125;,</p>
              <p>&nbsp;&nbsp;&#123; <span className="text-blue-300">&quot;id&quot;</span>: 2, <span className="text-blue-300">&quot;name&quot;</span>: <span className="text-green-300">&quot;Sam&quot;</span>, <span className="text-blue-300">&quot;is_active&quot;</span>: <span className="text-yellow-400">false</span> &#125;</p>
              <p>]</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
