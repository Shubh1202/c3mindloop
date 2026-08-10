'use client';

import React from 'react';
import { Link } from '../lib/router-compat';
import { ArrowLeft } from 'lucide-react';
import { JwtInspectorTool } from '../components/tools/JwtInspectorTool';
import { CTASection } from '../components/sections/CTASection';
import { useTranslation } from '../lib/i18n';

export const JwtInspectorPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="pt-6 sm:pt-8 pb-16 bg-app text-theme-main relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">

        {/* Breadcrumb */}
        <div className="space-y-1.5 border-b border-theme-subtle pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-theme-muted">
            <Link to="/tools" className="hover:text-theme-main transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('tools.jwtInspector.breadcrumbParent')}</span>
            </Link>
            <span>/</span>
            <span className="text-[#1D9BF0] font-semibold">{t('tools.jwtInspector.breadcrumb')}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-theme-main">
              {t('tools.jwtInspector.pageTitle')}
            </h1>
            <span className="text-[11px] font-mono text-neutral-400 bg-surface px-2.5 py-1 rounded border border-theme-subtle shrink-0">
              {t('tools.jwtInspector.pageBadge')}
            </span>
          </div>
        </div>

        {/* Tool */}
        <JwtInspectorTool />

        {/* Feature Info Cards */}
        <div className="pt-12 border-t border-theme-subtle grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono text-theme-muted">
          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="text-sm font-semibold text-theme-main font-sans">
              {t('tools.jwtInspector.feat1Title')}
            </h3>
            <p className="leading-relaxed">{t('tools.jwtInspector.feat1Desc')}</p>
          </div>
          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="text-sm font-semibold text-theme-main font-sans">
              {t('tools.jwtInspector.feat2Title')}
            </h3>
            <p className="leading-relaxed">{t('tools.jwtInspector.feat2Desc')}</p>
          </div>
          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="text-sm font-semibold text-theme-main font-sans">
              {t('tools.jwtInspector.feat3Title')}
            </h3>
            <p className="leading-relaxed">{t('tools.jwtInspector.feat3Desc')}</p>
          </div>
        </div>

        <CTASection />
      </div>
    </div>
  );
};
