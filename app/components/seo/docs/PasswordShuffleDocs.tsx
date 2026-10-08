'use client';

import React from 'react';

export const PasswordShuffleDocs: React.FC = () => {
  return (
    <div className="space-y-10 text-theme-main">
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          CSPRNG Cryptographic Entropy & Entropy Formula
        </h2>
        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
          Standard pseudorandom generators like <code className="bg-neutral-900 px-1 py-0.5 rounded text-red-300">Math.random()</code> are predictable. C³ MindLoop uses the native Web Cryptography API&apos;s <code className="bg-neutral-900 px-1 py-0.5 rounded text-green-300">crypto.getRandomValues()</code> to sample hardware entropy:
        </p>

        <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2 text-xs">
          <h3 className="font-semibold text-theme-main">Shannon Entropy Formula</h3>
          <div className="p-3 bg-neutral-950 rounded border border-theme-subtle font-mono text-[11px] text-yellow-400">
            Entropy (bits) = Length × log2(Pool Size)
          </div>
          <p className="text-theme-muted mt-1">
            A 16-character password using uppercase, lowercase, numbers, and symbols (pool size 94) provides <strong className="text-theme-main">~104.9 bits of entropy</strong>, making brute-force cracking mathematically infeasible.
          </p>
        </div>
      </section>
    </div>
  );
};
