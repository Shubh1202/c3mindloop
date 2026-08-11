'use client';

import React, { useState } from 'react';
import { Code2, Server, Sparkles, Bot, Network, ShieldCheck, Calculator, ArrowRight, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { Link } from '../lib/router-compat';
import { useTranslation } from '../lib/i18n';
import { SERVICES_LIST } from '../lib/constants';
import { SEOHead } from '../components/layout/SEOHead';
import { Button } from '../components/ui/Button';
import { CTASection } from '../components/sections/CTASection';

export const ServicesPage: React.FC = () => {
  const { t } = useTranslation();

  // Project Estimator State
  const [projectType, setProjectType] = useState<'web' | 'backend' | 'saas' | 'ai'>('saas');
  const [scope, setScope] = useState<'mvp' | 'growth' | 'enterprise'>('growth');
  const [hasAI, setHasAI] = useState(true);
  const [hasAuth, setHasAuth] = useState(true);

  const calculateEstimate = () => {
    let base = 8000;
    if (projectType === 'web') base = 6500;
    if (projectType === 'backend') base = 9000;
    if (projectType === 'saas') base = 12500;
    if (projectType === 'ai') base = 11000;

    let multiplier = 1;
    if (scope === 'mvp') multiplier = 1;
    if (scope === 'growth') multiplier = 1.5;
    if (scope === 'enterprise') multiplier = 2.4;

    let addOns = 0;
    if (hasAI) addOns += 3500;
    if (hasAuth) addOns += 2000;

    const total = Math.round((base * multiplier) + addOns);
    const weeks = Math.round(3 * multiplier + (hasAI ? 1 : 0));

    return { total: `$${total.toLocaleString()}`, weeks: `${weeks}-${weeks + 2} Weeks` };
  };

  const estimate = calculateEstimate();

  const iconMap: Record<string, any> = {
    Code2,
    Server,
    Sparkles,
    Bot,
    Network,
    ShieldCheck
  };

  return (
    <>
      <SEOHead
        title="Engineering Services & Architecture Consulting"
        description="Partner with C³ MindLoop for custom Web Development, Backend Microservices, SaaS Product Engineering, AI Automation, and API Architecture."
        canonical="/services"
      />

      <div className="pt-16 pb-20 bg-app text-theme-main relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          
          {/* Header */}
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#1D9BF0] block">
              {t('services.kicker', 'Engineering Services')}
            </span>
            <h1 className="text-display text-theme-main">
              {t('services.title', 'Custom Architecture & SaaS Development')}
            </h1>
            <p className="text-body-large text-theme-muted max-w-2xl mx-auto">
              {t('services.subtitle', 'Partner with senior software architects and AI researchers to build your next-gen product.')}
            </p>
          </div>

          {/* Editorial Two-Column List View (No 3x2 Card Grid) */}
          <div className="divide-y divide-theme-subtle border-t border-b border-theme-subtle">
            {SERVICES_LIST.map((srv, idx) => {
              const Icon = iconMap[srv.icon] || Code2;
              const title = t(srv.titleKey, srv.id);
              const desc = t(srv.descKey, '');

              return (
                <div key={srv.id} className="py-10 flex flex-col lg:flex-row lg:items-start justify-between gap-8 group">
                  {/* Left Column: Title, Icon, Description */}
                  <div className="lg:w-1/2 space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-theme-muted">0{idx + 1}</span>
                      <div className="p-2 rounded-md bg-[#1D9BF0]/10 text-[#1D9BF0]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h2 className="text-h2 text-theme-main group-hover:text-[#1D9BF0] transition-colors">
                        {title}
                      </h2>
                    </div>
                    <p className="text-body text-theme-muted leading-relaxed pl-12">
                      {desc}
                    </p>
                  </div>

                  {/* Right Column: Deliverables, Price, CTA */}
                  <div className="lg:w-5/12 space-y-6 pl-12 lg:pl-0">
                    <div className="space-y-2.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted block">
                        DELIVERABLES:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {srv.deliverables.map((item) => (
                          <div key={item} className="flex items-center gap-2 text-xs text-theme-main">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#1D9BF0] shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-theme-subtle flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted block">
                          STARTING AT
                        </span>
                        <span className="text-body font-semibold text-[#1D9BF0]">
                          {srv.startingPrice}
                        </span>
                      </div>
                      <Link to="/contact">
                        <Button size="sm" variant="primary" icon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                          Book Scope Session
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Project Cost Estimator */}
          <div className="pt-12 border-t border-theme-subtle space-y-8">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1D9BF0]">
              <Calculator className="w-4 h-4" />
              <span>{t('services.calcTitle', 'Interactive Project Estimator')}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-theme-muted mb-2.5">
                    1. Select Primary Service Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'web', name: 'Web App' },
                      { id: 'backend', name: 'Backend API' },
                      { id: 'saas', name: 'Full SaaS' },
                      { id: 'ai', name: 'AI Integration' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setProjectType(item.id as any)}
                        className={`p-3 rounded-md text-xs font-medium border transition-all cursor-pointer ${
                          projectType === item.id
                            ? 'bg-[#1D9BF0] text-white border-[#1D9BF0]'
                            : 'bg-app border-theme-subtle text-theme-muted hover:text-theme-main'
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-theme-muted mb-2.5">
                    2. Scope & Complexity Tier
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'mvp', name: 'MVP Launch' },
                      { id: 'growth', name: 'Growth / Scale' },
                      { id: 'enterprise', name: 'Enterprise Core' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setScope(item.id as any)}
                        className={`p-3 rounded-md text-xs font-medium border transition-all cursor-pointer ${
                          scope === item.id
                            ? 'bg-[#1D9BF0] text-white border-[#1D9BF0]'
                            : 'bg-app border-theme-subtle text-theme-muted hover:text-theme-main'
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-theme-muted mb-2.5">
                    3. Add-on Modules
                  </label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-xs text-theme-muted cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasAI}
                        onChange={(e) => setHasAI(e.target.checked)}
                        className="rounded accent-[#1D9BF0]"
                      />
                      <span>AI Model / LLM Integration (+$3,500)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-theme-muted cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasAuth}
                        onChange={(e) => setHasAuth(e.target.checked)}
                        className="rounded accent-[#1D9BF0]"
                      />
                      <span>Multi-Tenant Auth & Billing (+$2,000)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Estimate Result Box */}
              <div className="p-6 rounded-lg bg-surface border border-theme-subtle flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted block mb-1">
                    {t('services.calcTotal', 'Estimated Investment Range:')}
                  </span>
                  <div className="text-2xl font-bold text-[#1D9BF0]">
                    {estimate.total}
                  </div>

                  <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted block mt-4 mb-1">
                    {t('services.calcTimeline', 'Estimated Timeline:')}
                  </span>
                  <div className="text-body-small font-semibold text-theme-main">
                    {estimate.weeks}
                  </div>
                </div>

                <Link to="/contact">
                  <Button className="w-full" variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
                    Get Exact Proposal
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <CTASection />
        </div>
      </div>
    </>
  );
};
