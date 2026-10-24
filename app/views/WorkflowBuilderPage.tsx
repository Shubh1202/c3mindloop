'use client';

import React from 'react';
import { Link } from '../lib/router-compat';
import { ArrowLeft } from 'lucide-react';
import { WorkflowBuilderTool } from '../components/tools/WorkflowBuilderTool';
import { CTASection } from '../components/sections/CTASection';
import { useTranslation } from '../lib/i18n';

export const WorkflowBuilderPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="pt-6 sm:pt-8 pb-16 bg-app text-theme-main relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb + H1 - ONLY heading on this page (Single H1 Policy) */}
        <div className="space-y-1.5 border-b border-theme-subtle pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-theme-muted">
            <Link to="/tools" className="hover:text-theme-main transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('tools.workflowBuilder.breadcrumbParent', 'Developer Tools')}</span>
            </Link>
            <span>/</span>
            <span className="text-[#1D9BF0] font-semibold">
              {t('tools.workflowBuilder.breadcrumb', 'Workflow Builder')}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-theme-main">
              {t('tools.workflowBuilder.pageTitle', 'Visual Workflow Builder & Tool Chaining')}
            </h1>
            <span className="text-[11px] font-mono text-neutral-400 bg-surface px-2.5 py-1 rounded border border-theme-subtle shrink-0">
              {t('tools.workflowBuilder.pageBadge', '100% Client-Side - Local Browser Processing')}
            </span>
          </div>
        </div>

        {/* Main Tool Component */}
        <WorkflowBuilderTool />

        {/* 3-Column Technical Feature Cards */}
        <div className="pt-8 border-t border-theme-subtle grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono text-theme-muted">
          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="text-sm font-semibold text-theme-main">
              {t('tools.workflowBuilder.feat1Title', 'Zero-Server DAG Execution')}
            </h3>
            <p className="text-neutral-400 leading-relaxed">
              {t(
                'tools.workflowBuilder.feat1Desc',
                'Topological cycle-safe execution runs directly inside your browser JS engine. Sensitive keys and tokens never leave your local memory sandbox.'
              )}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="text-sm font-semibold text-theme-main">
              {t('tools.workflowBuilder.feat2Title', 'Crack & Crash Isolation')}
            </h3>
            <p className="text-neutral-400 leading-relaxed">
              {t(
                'tools.workflowBuilder.feat2Desc',
                'Pinpoint the exact step where JSON parsing or base64 decoding fails. Inspect live intermediate payloads and step durations.'
              )}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="text-sm font-semibold text-theme-main">
              {t('tools.workflowBuilder.feat3Title', 'Declarative Versioned Schemas')}
            </h3>
            <p className="text-neutral-400 leading-relaxed">
              {t(
                'tools.workflowBuilder.feat3Desc',
                'Export and import clean JSON schemas. Share pipeline topologies or store them in local storage with strict schema validation.'
              )}
            </p>
          </div>
        </div>

        <CTASection />
      </div>
    </div>
  );
};
