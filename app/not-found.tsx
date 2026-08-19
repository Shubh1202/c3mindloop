'use client';

import type { Metadata } from 'next';
import Link from 'next/link';
import { useEffect } from 'react';
import { ArrowLeft, Terminal } from 'lucide-react';
import { trackEvent, GA_EVENTS } from './lib/analytics';

export default function NotFound() {
  useEffect(() => {
    trackEvent(GA_EVENTS.PAGE_404, {
      page_path: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    });
  }, []);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20 bg-app text-theme-main">
      <div className="p-4 rounded-full bg-[#1D9BF0]/10 text-[#1D9BF0] mb-6">
        <Terminal className="w-10 h-10" />
      </div>
      <span className="text-xs font-mono uppercase tracking-widest text-[#1D9BF0] font-semibold mb-2">
        Error 404
      </span>
      <h1 className="text-display font-bold text-theme-main mb-4">
        Page Not Found
      </h1>
      <p className="text-body text-theme-muted max-w-md mx-auto mb-8">
        The route you are looking for does not exist or has been moved within C³ MindLoop.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1D9BF0] text-white text-xs font-mono font-medium hover:bg-[#1D9BF0]/90 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>
    </div>
  );
}
