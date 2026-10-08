'use client';

import React from 'react';

export const HashGeneratorDocs: React.FC = () => {
  return (
    <div className="space-y-10 text-theme-main">
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          Cryptographic Hash Algorithms: SHA-256 vs SHA-512 vs MD5
        </h2>
        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
          Cryptographic hash functions generate fixed-size string digests from variable-length inputs. Comparison of supported hashing algorithms:
        </p>

        <div className="overflow-x-auto rounded-lg border border-theme-subtle bg-surface">
          <table className="w-full text-left text-xs sm:text-sm font-mono divide-y divide-theme-subtle">
            <thead className="bg-neutral-900/60 text-theme-muted text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Algorithm</th>
                <th className="px-4 py-2.5 font-semibold">Output Size</th>
                <th className="px-4 py-2.5 font-semibold">Security Level</th>
                <th className="px-4 py-2.5 font-semibold">Primary Use Case</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle text-theme-muted">
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-green-400">SHA-256</td>
                <td className="px-4 py-2.5">256 bits (64 hex)</td>
                <td className="px-4 py-2.5 text-green-400 font-semibold">Secure (Industry Standard)</td>
                <td className="px-4 py-2.5">TLS/SSL certificates, Bitcoin, file integrity, HMAC</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-cyan-400">SHA-512</td>
                <td className="px-4 py-2.5">512 bits (128 hex)</td>
                <td className="px-4 py-2.5 text-cyan-400 font-semibold">High Security (64-bit systems)</td>
                <td className="px-4 py-2.5">Cryptographic signing, password hashing, secure storage</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-yellow-400">SHA-1</td>
                <td className="px-4 py-2.5">160 bits (40 hex)</td>
                <td className="px-4 py-2.5 text-yellow-400">Deprecated for Security</td>
                <td className="px-4 py-2.5">Git commit hashes, legacy checksum comparison</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-red-400">MD5</td>
                <td className="px-4 py-2.5">128 bits (32 hex)</td>
                <td className="px-4 py-2.5 text-red-400">Broken (Insecure for crypto)</td>
                <td className="px-4 py-2.5">Non-cryptographic checksums, deduplication, cache keys</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
