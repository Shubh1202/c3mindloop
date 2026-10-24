'use client';

import React from 'react';
import { Link } from '../../../lib/router-compat';
import { ArrowRight, BookOpen } from 'lucide-react';

export const JsonFormatterDocs: React.FC = () => {
  return (
    <div className="space-y-10 text-theme-main">
      {/* Contextual Companion Guide */}
      <section className="p-4 sm:p-5 rounded-lg bg-surface border border-theme-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#1D9BF0] font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Companion Engineering Guide</span>
          </div>
          <h3 className="text-sm font-semibold text-theme-main">
            How to Format and Validate JSON in the Browser
          </h3>
          <p className="text-xs text-theme-muted leading-relaxed">
            Read our practical walkthrough on validating payloads, catching syntax errors, minifying output, and local file loading.
          </p>
        </div>
        <Link
          href="/guides/format-and-validate-json-in-the-browser"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#1D9BF0]/10 hover:bg-[#1D9BF0]/20 text-[#1D9BF0] border border-[#1D9BF0]/30 text-xs font-mono font-medium transition-colors shrink-0 self-start sm:self-auto"
        >
          <span>Read Guide</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>

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
        <p className="text-xs text-theme-muted leading-relaxed">
          Copying a formatted API response from your browser? See our guide on{' '}
          <Link href="/guides/convert-curl-to-fetch-axios-python" className="text-[#1D9BF0] hover:underline">
            converting cURL commands to Fetch, Axios, and Python
          </Link>{' '}
          to wire the request directly into application code.
        </p>
      </section>
    </div>
  );
};
