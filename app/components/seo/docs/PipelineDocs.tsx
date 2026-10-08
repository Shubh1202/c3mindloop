'use client';

import React from 'react';

export const PipelineDocs: React.FC = () => {
  return (
    <div className="space-y-10 text-theme-main">
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          Client-Side Tool Pipelining & Data Stream Chaining
        </h2>
        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
          The pipeline engine lets developers compose modular data transformations without intermediate copy-pasting or server roundtrips:
        </p>

        <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2 text-xs">
          <h3 className="font-semibold text-theme-main">Popular Pipeline Chains</h3>
          <div className="p-3 bg-neutral-950 rounded border border-theme-subtle font-mono text-[11px] text-green-300 space-y-1">
            <p>1. cURL Request → Extracted JSON Payload → JSON Formatter & Minifier</p>
            <p>2. JWT Bearer Token → Base64URL Decode Payload → JSON Formatter</p>
            <p>3. Raw Log Text → Regex Match Filter → JSON Object Array</p>
          </div>
        </div>
      </section>
    </div>
  );
};
