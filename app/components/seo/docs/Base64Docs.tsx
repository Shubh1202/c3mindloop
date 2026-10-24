'use client';

import React from 'react';
import { Link } from '../../../lib/router-compat';

export const Base64Docs: React.FC = () => {
  return (
    <div className="space-y-10 text-theme-main">
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          Standard Base64 vs URL-Safe Base64 (RFC 4648)
        </h2>
        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
          Base64 encodes binary data into 64 printable ASCII characters. Standard vs URL-safe encoding differences:
        </p>

        <div className="overflow-x-auto rounded-lg border border-theme-subtle bg-surface">
          <table className="w-full text-left text-xs sm:text-sm font-mono divide-y divide-theme-subtle">
            <thead className="bg-neutral-900/60 text-theme-muted text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Variant</th>
                <th className="px-4 py-2.5 font-semibold">62nd & 63rd Chars</th>
                <th className="px-4 py-2.5 font-semibold">Padding (=)</th>
                <th className="px-4 py-2.5 font-semibold">Primary Use Case</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle text-theme-muted">
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-theme-main">Standard (RFC 4648 §4)</td>
                <td className="px-4 py-2.5 text-blue-400">+ and /</td>
                <td className="px-4 py-2.5">Strict (1 or 2 =)</td>
                <td className="px-4 py-2.5">MIME email attachments, HTTP Basic Auth, Data URIs</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-theme-main">URL-Safe (RFC 4648 §5)</td>
                <td className="px-4 py-2.5 text-green-400">- and _</td>
                <td className="px-4 py-2.5">Optional / Omitted</td>
                <td className="px-4 py-2.5">JWT headers & payloads, URL query parameters, filenames</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          File to Data URI Scheme Format
        </h2>
        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
          Data URIs allow embedding image, audio, and font files directly into HTML or CSS without separate HTTP network roundtrips:
        </p>
        <div className="p-3 bg-neutral-950 rounded border border-theme-subtle font-mono text-[11px] text-neutral-300 overflow-x-auto">
          <code>data:[&lt;mediatype&gt;][;base64],&lt;encoded_data&gt;</code>
          <p className="text-neutral-500 mt-1">Example: <span className="text-green-300">data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...</span></p>
        </div>
        <p className="text-xs text-theme-muted leading-relaxed">
          URL-safe Base64 is also the encoding format used by JSON Web Tokens (JWT) for both the header and payload segments.{' '}
          <Link href="/guides/debug-invalid-jwt-claims" className="text-[#1D9BF0] hover:underline">
            Learn how to debug invalid JWT claim errors
          </Link>.
        </p>
      </section>
    </div>
  );
};
