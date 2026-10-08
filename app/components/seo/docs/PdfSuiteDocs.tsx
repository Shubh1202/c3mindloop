'use client';

import React from 'react';

export const PdfSuiteDocs: React.FC = () => {
  return (
    <div className="space-y-10 text-theme-main">
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          Client-Side PDF Operations (Zero Cloud Upload)
        </h2>
        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
          Standard online PDF converters upload sensitive contracts, invoices, and financial records to remote cloud servers. C³ MindLoop manipulates PDF byte streams entirely within the local browser sandbox via WebAssembly and JavaScript:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="font-semibold text-theme-main text-xs text-blue-400">PDF Merge & Combine</h3>
            <p className="text-theme-muted">
              Appends pages from multiple vector documents into a single consolidated file while preserving bookmarks and font tables.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="font-semibold text-theme-main text-xs text-green-400">Page Extraction & Splitting</h3>
            <p className="text-theme-muted">
              Isolates specific page ranges into standalone PDF binaries with zero loss of vector clarity.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="font-semibold text-theme-main text-xs text-purple-400">Client-Side Compression</h3>
            <p className="text-theme-muted">
              Strips unused object streams and recompresses embedded image rasters locally to reduce file size.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
