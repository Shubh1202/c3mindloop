'use client';

import React from 'react';

export const JwtInspectorDocs: React.FC = () => {
  return (
    <div className="space-y-10 text-theme-main">
      {/* JWT Anatomy Structure */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          Anatomy of a JSON Web Token (JWT)
        </h2>
        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
          A JSON Web Token consists of three base64url-encoded parts separated by periods (<code className="text-xs font-mono bg-neutral-900 px-1 py-0.5 rounded">.</code>):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-red-400">1. Header</span>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded">Metadata</span>
            </div>
            <p className="text-theme-muted">
              Specifies the cryptographic signing algorithm (e.g. <code className="text-red-300">HS256</code>, <code className="text-red-300">RS256</code>, <code className="text-red-300">ES256</code>) and token type (<code className="text-red-300">JWT</code>).
            </p>
          </div>

          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-purple-400">2. Payload</span>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded">Claims</span>
            </div>
            <p className="text-theme-muted">
              Contains the user identity, permissions, issuer (<code className="text-purple-300">iss</code>), subject (<code className="text-purple-300">sub</code>), and expiration timestamp (<code className="text-purple-300">exp</code>).
            </p>
          </div>

          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-cyan-400">3. Signature</span>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded">Integrity</span>
            </div>
            <p className="text-theme-muted">
              Computed by hashing the header and payload with a private key or secret to prevent tampering across networks.
            </p>
          </div>
        </div>
      </section>

      {/* Standard JWT Claims Reference */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          Standard Registered JWT Claims Reference
        </h2>
        
        <div className="overflow-x-auto rounded-lg border border-theme-subtle bg-surface">
          <table className="w-full text-left text-xs sm:text-sm font-mono divide-y divide-theme-subtle">
            <thead className="bg-neutral-900/60 text-theme-muted text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Claim Key</th>
                <th className="px-4 py-2.5 font-semibold">Claim Name</th>
                <th className="px-4 py-2.5 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle text-theme-muted">
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-purple-400">exp</td>
                <td className="px-4 py-2.5 text-theme-main">Expiration Time</td>
                <td className="px-4 py-2.5">Unix timestamp (seconds) after which the token must not be accepted</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-purple-400">iat</td>
                <td className="px-4 py-2.5 text-theme-main">Issued At</td>
                <td className="px-4 py-2.5">Unix timestamp when the JWT was generated</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-purple-400">nbf</td>
                <td className="px-4 py-2.5 text-theme-main">Not Before</td>
                <td className="px-4 py-2.5">Unix timestamp before which the token must be rejected</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-purple-400">sub</td>
                <td className="px-4 py-2.5 text-theme-main">Subject</td>
                <td className="px-4 py-2.5">Unique identifier for the authenticated user or entity</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-purple-400">iss</td>
                <td className="px-4 py-2.5 text-theme-main">Issuer</td>
                <td className="px-4 py-2.5">Domain or authority that signed and issued the token</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
