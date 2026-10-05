'use client';

import React from 'react';
import { Link } from '../lib/router-compat';
import { ArrowLeft } from 'lucide-react';
import { QrCodeGeneratorTool } from '../components/tools/QrCodeGeneratorTool';
import { CTASection } from '../components/sections/CTASection';
import { ToolSeoWrapper } from '../components/seo/ToolSeoWrapper';
import { useTranslation } from '../lib/i18n';

export const QrCodeGeneratorPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="pt-6 sm:pt-8 pb-16 bg-app text-theme-main relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Breadcrumb Navigation & Title */}
        <div className="space-y-1.5 border-b border-theme-subtle pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-theme-muted">
            <Link to="/tools" className="hover:text-theme-main transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('tools.qrCodeGenerator.breadcrumbParent', 'Developer Tools')}</span>
            </Link>
            <span>/</span>
            <span className="text-[#1D9BF0] font-semibold">{t('tools.qrCodeGenerator.breadcrumb', 'QR Code Generator')}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-theme-main">
              {t('tools.qrCodeGenerator.pageTitle', 'QR Code Generator')}
            </h1>
            <span className="text-[11px] font-mono text-neutral-400 bg-surface px-2.5 py-1 rounded border border-theme-subtle shrink-0">
              {t('tools.qrCodeGenerator.pageBadge', '100% Client-Side • qrcode npm')}
            </span>
          </div>
        </div>

        {/* Tool Component */}
        <QrCodeGeneratorTool />

        {/* Reusable SEO Layout Wrapper */}
        <ToolSeoWrapper toolKey="qrCodeGenerator" />

        <CTASection />
      </div>
    </div>
  );
};
