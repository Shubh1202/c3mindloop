'use client';

import React from 'react';

export const RegexRailroadDocs: React.FC = () => {
  return (
    <div className="space-y-10 text-theme-main">

      {/* How the diagram works */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          How the Railroad Diagram Works
        </h2>
        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
          A railroad diagram (also called a syntax diagram or flowchart diagram) represents a regular expression as
          a series of connected nodes — one per token — laid out left to right. Reading the diagram from left to right
          describes exactly which characters or constructs the engine matches at each step.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-surface border border-theme-subtle space-y-1.5">
            <h3 className="font-semibold text-theme-main">Client-Side Lexer</h3>
            <p className="text-theme-muted leading-relaxed">
              The pattern is tokenized entirely in your browser using a hand-written regex lexer. It identifies
              anchors, character classes, quantifiers, capture groups, lookaheads, lookbehinds, named groups,
              alternations, and backreferences — no server or third-party library involved.
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-surface border border-theme-subtle space-y-1.5">
            <h3 className="font-semibold text-theme-main">SVG Flow Generator</h3>
            <p className="text-theme-muted leading-relaxed">
              Each token is rendered as a labeled node in an SVG canvas. Nodes are color-coded by category,
              connected by directional lines, and wrapped into rows automatically. The diagram can be exported
              as a standalone SVG file for documentation and code review.
            </p>
          </div>
        </div>
      </section>

      {/* Token color reference */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          Token Categories &amp; Color Reference
        </h2>
        <div className="overflow-x-auto rounded-lg border border-theme-subtle bg-surface">
          <table className="w-full text-left text-xs sm:text-sm font-mono divide-y divide-theme-subtle">
            <thead className="bg-neutral-900/60 text-theme-muted text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Color</th>
                <th className="px-4 py-2.5 font-semibold">Category</th>
                <th className="px-4 py-2.5 font-semibold">Example Tokens</th>
                <th className="px-4 py-2.5 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle text-theme-muted">
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5"><span className="inline-block w-3 h-3 rounded-sm bg-blue-500" /></td>
                <td className="px-4 py-2.5">Anchors &amp; Boundaries</td>
                <td className="px-4 py-2.5 text-blue-400"><code>^ $ \b \B</code></td>
                <td className="px-4 py-2.5">Zero-width assertions — match a position, not a character</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5"><span className="inline-block w-3 h-3 rounded-sm bg-green-500" /></td>
                <td className="px-4 py-2.5">Character Classes</td>
                <td className="px-4 py-2.5 text-green-400"><code>\d \w \s [a-z] .</code></td>
                <td className="px-4 py-2.5">Sets or ranges of characters the engine can match</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5"><span className="inline-block w-3 h-3 rounded-sm bg-indigo-500" /></td>
                <td className="px-4 py-2.5">Literals</td>
                <td className="px-4 py-2.5 text-indigo-400"><code>"hello" \n \t</code></td>
                <td className="px-4 py-2.5">Exact character sequences or escape sequences</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5"><span className="inline-block w-3 h-3 rounded-sm bg-amber-500" /></td>
                <td className="px-4 py-2.5">Quantifiers (dashed border)</td>
                <td className="px-4 py-2.5 text-amber-400"><code>* + ? {'{2,4}'} *?</code></td>
                <td className="px-4 py-2.5">How many times the preceding element can repeat</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5"><span className="inline-block w-3 h-3 rounded-sm bg-cyan-500" /></td>
                <td className="px-4 py-2.5">Capture Groups</td>
                <td className="px-4 py-2.5 text-cyan-400"><code>( ) (?:) (?&lt;name&gt;)</code></td>
                <td className="px-4 py-2.5">Capture, non-capture, and named groups with numeric badge</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5"><span className="inline-block w-3 h-3 rounded-sm bg-purple-500" /></td>
                <td className="px-4 py-2.5">Lookahead/Lookbehind</td>
                <td className="px-4 py-2.5 text-purple-400"><code>(?=) (?&lt;=)</code></td>
                <td className="px-4 py-2.5">Positive lookahead and lookbehind zero-width assertions</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5"><span className="inline-block w-3 h-3 rounded-sm bg-red-500" /></td>
                <td className="px-4 py-2.5">Negative Assertions</td>
                <td className="px-4 py-2.5 text-red-400"><code>(?!) (?&lt;!)</code></td>
                <td className="px-4 py-2.5">Negative lookahead and lookbehind assertions</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5"><span className="inline-block w-3 h-3 rounded-sm bg-pink-500" /></td>
                <td className="px-4 py-2.5">Alternation</td>
                <td className="px-4 py-2.5 text-pink-400"><code>|</code></td>
                <td className="px-4 py-2.5">OR branch — matches either left or right sub-expression</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5"><span className="inline-block w-3 h-3 rounded-sm bg-yellow-500" /></td>
                <td className="px-4 py-2.5">Backreferences</td>
                <td className="px-4 py-2.5 text-yellow-400"><code>\1 \2</code></td>
                <td className="px-4 py-2.5">References to a previously captured group</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Use cases */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          When to Use a Railroad Diagram for Regex Debugging
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-surface border border-theme-subtle space-y-1.5">
            <h3 className="font-semibold text-theme-main">Code Review</h3>
            <p className="text-theme-muted leading-relaxed">
              Export the diagram as SVG and embed it in pull request comments to explain complex patterns to reviewers who may not be regex experts.
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-surface border border-theme-subtle space-y-1.5">
            <h3 className="font-semibold text-theme-main">Debugging Failures</h3>
            <p className="text-theme-muted leading-relaxed">
              When a pattern fails to match, walking each node left to right reveals which token is the boundary that the input stops satisfying.
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-surface border border-theme-subtle space-y-1.5">
            <h3 className="font-semibold text-theme-main">Learning Regex</h3>
            <p className="text-theme-muted leading-relaxed">
              New team members can read the diagram like a flowchart instead of parsing dense regex syntax — lowering the learning curve significantly.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          Client-Side Processing — Your Patterns Stay Private
        </h2>
        <div className="p-4 rounded-lg bg-surface border border-theme-subtle text-xs sm:text-sm text-theme-muted leading-relaxed space-y-2">
          <p>
            The lexer, layout engine, and SVG renderer all run inside your browser's JavaScript sandbox. No pattern
            or test string is transmitted to any server, analytics endpoint, or third-party service.
          </p>
          <p>
            This matters when working with sensitive data: authentication token patterns, PII extraction regexes,
            internal log format matchers, or proprietary parsing rules — all remain on your device.
          </p>
        </div>
      </section>

    </div>
  );
};
