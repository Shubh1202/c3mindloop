'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error?: Error & { digest?: string };
  reset?: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Something went wrong!</h2>
          <p className="text-sm text-neutral-400 mb-6">{error?.message || 'A global error occurred.'}</p>
          {reset && (
            <button
              type="button"
              onClick={() => reset()}
              className="px-4 py-2 bg-[#1D9BF0] text-white rounded-lg text-sm font-medium hover:bg-[#1D9BF0]/90 transition-colors"
            >
              Try again
            </button>
          )}
        </div>
      </body>
    </html>
  );
}
