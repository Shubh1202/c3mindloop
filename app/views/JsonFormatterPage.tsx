'use client';

import React from 'react';
import { Link } from '../lib/router-compat';
import { ArrowLeft } from 'lucide-react';
import { SEOHead } from '../components/layout/SEOHead';
import { JsonFormatterTool } from '../components/tools/JsonFormatterTool';
import { CTASection } from '../components/sections/CTASection';
import { ToolSeoWrapper } from '../components/seo/ToolSeoWrapper';
import { useTranslation } from '../lib/i18n';

export const JsonFormatterPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title="100% Private Client-Side JSON Formatter & Validator - C³ MindLoop"
        description="Free, ultra-fast client-side JSON formatter, validator, minifier, and interactive tree viewer. 100% browser-based with zero server retention."
        canonical="/tools/json-formatter"
      />

      <div className="pt-6 sm:pt-8 pb-16 bg-app text-theme-main relative z-10 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Breadcrumb Navigation & Title */}
          <div className="space-y-1.5 border-b border-theme-subtle pb-3">
            <div className="flex items-center gap-2 text-xs font-mono text-theme-muted">
              <Link to="/tools" className="hover:text-theme-main transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('tools.jsonFormatter.breadcrumbParent', 'Developer Tools')}</span>
              </Link>
              <span>/</span>
              <span className="text-[#1D9BF0] font-semibold">{t('tools.jsonFormatter.breadcrumb', 'JSON Formatter')}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-theme-main">
                {t('tools.jsonFormatter.pageTitle', '100% Private Client-Side JSON Formatter & Validator')}
              </h1>
              <span className="text-[11px] font-mono text-neutral-400 bg-surface px-2.5 py-1 rounded border border-theme-subtle shrink-0">
                {t('tools.jsonFormatter.pageBadge', '100% Client-Side • Local Browser Processing')}
              </span>
            </div>
          </div>

          {/* Interactive Tool Component */}
          <div>
            <JsonFormatterTool />
          </div>

          {/* Reusable SEO Wrapper (Workflow, Guide Overview & Accordion FAQ) */}
          <ToolSeoWrapper toolKey="jsonFormatter" />

          <CTASection />
        </div>
      </div>
    </>
  );
};
