'use client';

import React from 'react';
import { Link } from '../lib/router-compat';
import { ArrowLeft, Code2 } from 'lucide-react';
import { SEOHead } from '../components/layout/SEOHead';
import { JsonFormatterTool } from '../components/tools/JsonFormatterTool';
import { CTASection } from '../components/sections/CTASection';

export const JsonFormatterPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="JSON Formatter, Validator & Tree Viewer — C³ MindLoop"
        description="Free, ultra-fast client-side JSON formatter, validator, minifier, and interactive tree viewer. 100% browser-based with zero server retention."
        canonical="/tools/json-formatter"
      />

      <div className="pt-6 sm:pt-8 pb-16 bg-app text-theme-main relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          {/* Breadcrumb Navigation & Compact Title */}
          <div className="space-y-1.5 border-b border-theme-subtle pb-3">
            <div className="flex items-center gap-2 text-xs font-mono text-theme-muted">
              <Link to="/tools" className="hover:text-theme-main transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Developer Tools</span>
              </Link>
              <span>/</span>
              <span className="text-[#1D9BF0] font-semibold">JSON Formatter</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-theme-main whitespace-nowrap">
                JSON Formatter & Validator
              </h1>
              <span className="text-[11px] font-mono text-neutral-400 bg-surface px-2.5 py-1 rounded border border-theme-subtle shrink-0">
                100% Client-Side • Local Browser Processing
              </span>
            </div>
          </div>

          {/* Interactive Tool Component */}
          <div>
            <JsonFormatterTool />
          </div>

          {/* Technical Workflow & Features Section */}
          <div className="pt-12 border-t border-theme-subtle grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono text-theme-muted">
            <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
              <h3 className="text-sm font-semibold text-theme-main font-sans">
                100% Client-Side Engine
              </h3>
              <p className="leading-relaxed">
                Your JSON data never leaves your device. All parsing and formatting operations execute in your browser's V8 engine.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
              <h3 className="text-sm font-semibold text-theme-main font-sans">
                Interactive Tree Inspection
              </h3>
              <p className="leading-relaxed">
                Toggle seamlessly between formatted code view and a collapsible node tree view to inspect deeply nested JSON objects.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
              <h3 className="text-sm font-semibold text-theme-main font-sans">
                Syntax Error Detection
              </h3>
              <p className="leading-relaxed">
                Real-time error location extraction identifies line numbers, missing brackets, or unexpected tokens immediately.
              </p>
            </div>
          </div>

          <CTASection />
        </div>
      </div>
    </>
  );
};
