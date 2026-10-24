'use client';

import React from 'react';
import { Link } from '../../../lib/router-compat';
import { ArrowRight, BookOpen } from 'lucide-react';

export const RegexTesterDocs: React.FC = () => {
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
            How to Test Regular Expressions in the Browser
          </h3>
          <p className="text-xs text-theme-muted leading-relaxed">
            Learn how to evaluate patterns, configure regex flags, inspect capture groups, and export clean snippets across runtimes.
          </p>
        </div>
        <Link
          href="/guides/test-regular-expressions-in-the-browser"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#1D9BF0]/10 hover:bg-[#1D9BF0]/20 text-[#1D9BF0] border border-[#1D9BF0]/30 text-xs font-mono font-medium transition-colors shrink-0 self-start sm:self-auto"
        >
          <span>Read Guide</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>

      {/* Quick Regex Cheatsheet Reference Table */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          Regular Expression Syntax Cheatsheet & Tokens
        </h2>
        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
          Quick reference for common RegExp tokens, character classes, quantifiers, and lookaround assertions supported by the native ECMAScript / V8 JavaScript engine:
        </p>

        <div className="overflow-x-auto rounded-lg border border-theme-subtle bg-surface">
          <table className="w-full text-left text-xs sm:text-sm font-mono divide-y divide-theme-subtle">
            <thead className="bg-neutral-900/60 text-theme-muted text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Token / Syntax</th>
                <th className="px-4 py-2.5 font-semibold">Category</th>
                <th className="px-4 py-2.5 font-semibold">Description & Match Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle text-theme-muted">
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-blue-400">^ / $</td>
                <td className="px-4 py-2.5">Anchors</td>
                <td className="px-4 py-2.5">Matches start (<code className="text-neutral-300">^</code>) or end (<code className="text-neutral-300">$</code>) of string/line</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-blue-400">\d / \D</td>
                <td className="px-4 py-2.5">Character Class</td>
                <td className="px-4 py-2.5">Matches any digit [0-9] / non-digit character</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-blue-400">\w / \W</td>
                <td className="px-4 py-2.5">Character Class</td>
                <td className="px-4 py-2.5">Matches word character [a-zA-Z0-9_] / non-word character</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-blue-400">\s / \S</td>
                <td className="px-4 py-2.5">Character Class</td>
                <td className="px-4 py-2.5">Matches whitespace (space, tab, newline) / non-whitespace</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-green-400">*, +, ?, &#123;n,m&#125;</td>
                <td className="px-4 py-2.5">Quantifiers</td>
                <td className="px-4 py-2.5">0 or more (<code className="text-neutral-300">*</code>), 1 or more (<code className="text-neutral-300">+</code>), 0 or 1 (<code className="text-neutral-300">?</code>), range (<code className="text-neutral-300">&#123;2,4&#125;</code>)</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-yellow-400">(?=...), (?!...)</td>
                <td className="px-4 py-2.5">Lookahead</td>
                <td className="px-4 py-2.5">Positive lookahead (<code className="text-neutral-300">?=</code>) & Negative lookahead (<code className="text-neutral-300">?!</code>) assertions</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-purple-400">(?&lt;=...), (?&lt;!...)</td>
                <td className="px-4 py-2.5">Lookbehind</td>
                <td className="px-4 py-2.5">Positive lookbehind (<code className="text-neutral-300">?&lt;=</code>) & Negative lookbehind (<code className="text-neutral-300">?&lt;!</code>) assertions</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-cyan-400">g, i, m, s, u</td>
                <td className="px-4 py-2.5">Flags</td>
                <td className="px-4 py-2.5">Global (g), Case-insensitive (i), Multiline (m), DotAll (s), Unicode (u)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Production Regex Recipes */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          Common Production-Ready Regex Patterns
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-surface border border-theme-subtle space-y-1.5">
            <h3 className="font-semibold text-theme-main text-xs">RFC 5322 Email Validation</h3>
            <p className="font-mono text-[11px] text-blue-400 bg-neutral-950 p-2 rounded border border-theme-subtle break-all">
              ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]&#123;2,&#125;$
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-surface border border-theme-subtle space-y-1.5">
            <h3 className="font-semibold text-theme-main text-xs">IPv4 Address Matcher</h3>
            <p className="font-mono text-[11px] text-green-400 bg-neutral-950 p-2 rounded border border-theme-subtle break-all">
              ^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.)&#123;3&#125;(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-surface border border-theme-subtle space-y-1.5">
            <h3 className="font-semibold text-theme-main text-xs">UUID v4 Identifier</h3>
            <p className="font-mono text-[11px] text-yellow-400 bg-neutral-950 p-2 rounded border border-theme-subtle break-all">
              ^[0-9a-f]&#123;8&#125;-[0-9a-f]&#123;4&#125;-4[0-9a-f]&#123;3&#125;-[89ab][0-9a-f]&#123;3&#125;-[0-9a-f]&#123;12&#125;$
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-surface border border-theme-subtle space-y-1.5">
            <h3 className="font-semibold text-theme-main text-xs">HTTPS URL Pattern</h3>
            <p className="font-mono text-[11px] text-purple-400 bg-neutral-950 p-2 rounded border border-theme-subtle break-all">
              ^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]&#123;1,256&#125;\.[a-zA-Z0-9()]&#123;1,6&#125;\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)$
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-surface border border-theme-subtle space-y-1.5">
            <h3 className="font-semibold text-theme-main text-xs">Hex Color Code</h3>
            <p className="font-mono text-[11px] text-cyan-400 bg-neutral-950 p-2 rounded border border-theme-subtle break-all">
              ^#(?:[0-9a-fA-F]&#123;3&#125;|[0-9a-fA-F]&#123;4&#125;|[0-9a-fA-F]&#123;6&#125;|[0-9a-fA-F]&#123;8&#125;)$
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-surface border border-theme-subtle space-y-1.5">
            <h3 className="font-semibold text-theme-main text-xs">Strong Password (8+ chars, 1 num, 1 sym)</h3>
            <p className="font-mono text-[11px] text-pink-400 bg-neutral-950 p-2 rounded border border-theme-subtle break-all">
              ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]&#123;8,&#125;$
            </p>
          </div>
        </div>
      </section>

      {/* ReDoS and Privacy Guide */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          Client-Side Execution & ReDoS Security
        </h2>
        
        <div className="space-y-3 text-xs sm:text-sm text-theme-muted">
          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-1.5">
            <h3 className="font-semibold text-theme-main">Why test regexes locally in the browser?</h3>
            <p className="leading-relaxed">
              When debugging server logs, authorization tokens, or sensitive user database strings, uploading test data to third-party online regex servers risks catastrophic data leaks. C³ MindLoop runs evaluation entirely within your device&apos;s isolated JavaScript V8 engine sandbox.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
