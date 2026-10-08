'use client';

import React from 'react';

export const QrCodeDocs: React.FC = () => {
  return (
    <div className="space-y-10 text-theme-main">
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          QR Code Error Correction Levels (Reed-Solomon)
        </h2>
        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
          QR codes encode redundancy to allow accurate optical decoding even if the barcode is smudged, torn, or partially obscured:
        </p>

        <div className="overflow-x-auto rounded-lg border border-theme-subtle bg-surface">
          <table className="w-full text-left text-xs sm:text-sm font-mono divide-y divide-theme-subtle">
            <thead className="bg-neutral-900/60 text-theme-muted text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Level</th>
                <th className="px-4 py-2.5 font-semibold">Error Recovery Capacity</th>
                <th className="px-4 py-2.5 font-semibold">Recommended Usage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle text-theme-muted">
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-blue-400">Level L (Low)</td>
                <td className="px-4 py-2.5 text-theme-main">~7% recovery</td>
                <td className="px-4 py-2.5">High-density data strings, clean digital screens</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-green-400">Level M (Medium)</td>
                <td className="px-4 py-2.5 text-theme-main">~15% recovery</td>
                <td className="px-4 py-2.5">Standard default for marketing flyers and business cards</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-yellow-400">Level Q (Quartile)</td>
                <td className="px-4 py-2.5 text-theme-main">~25% recovery</td>
                <td className="px-4 py-2.5">Industrial labels, packaging, high-wear physical environments</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-purple-400">Level H (High)</td>
                <td className="px-4 py-2.5 text-theme-main">~30% recovery</td>
                <td className="px-4 py-2.5">Codes with embedded central logos or severe environmental exposure</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
