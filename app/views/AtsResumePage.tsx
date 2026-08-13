'use client';

import React from 'react';
import { Link } from '../lib/router-compat';
import { ArrowLeft } from 'lucide-react';
import { AtsResumeTool } from '../components/tools/AtsResumeTool';
import { CTASection } from '../components/sections/CTASection';
import { SmartAdUnit } from '../components/monetization/SmartAdUnit';
import { ToolSeoWrapper } from '../components/seo/ToolSeoWrapper';

export const AtsResumePage: React.FC = () => {
  return (
    <div className="pt-4 sm:pt-6 pb-16 bg-app text-theme-main relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">

        {/* Breadcrumb Navigation & Title (Single H1 – per brand rule) */}
        <div className="space-y-1 border-b border-theme-subtle pb-2">
          <div className="flex items-center gap-2 text-xs font-mono text-theme-muted">
            <Link to="/tools" className="hover:text-theme-main transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Developer Tools</span>
            </Link>
            <span>/</span>
            <span className="text-[#1D9BF0] font-semibold">ATS Resume Generator</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-0.5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-theme-main">
              ATS Resume Generator
            </h1>
            <span className="text-[11px] font-mono text-neutral-400 bg-surface px-2.5 py-1 rounded border border-theme-subtle shrink-0">
              100% Client-Side • No Upload • Print to PDF
            </span>
          </div>

          <p className="text-xs text-neutral-500 max-w-2xl">
            Fill in the form, preview the output, and hit{' '}
            <strong className="text-neutral-400">Export PDF</strong> to download via your browser's print dialog.
            Nothing is sent to any server.
          </p>
        </div>

        {/* Tool Component */}
        <AtsResumeTool />

        {/* Reusable SEO Layout Wrapper (FAQ, How-to, Privacy) */}
        <ToolSeoWrapper toolKey="atsResume" />

        {/* Monetisation unit – below the tool so it doesn't push the editor away from the header */}
        <SmartAdUnit slot="3456789012" className="max-w-2xl" />

        <CTASection />
      </div>
    </div>
  );
};
