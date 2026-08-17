'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Calendar, Building2 } from 'lucide-react';
import { Link } from '../../lib/router-compat';
import { WatermarkBrandLayer } from '../ui/WatermarkBrandLayer';
import { useTranslation } from '../../lib/i18n';

export const CTASection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="py-16 lg:py-20 border-t border-b border-theme-subtle relative bg-app overflow-hidden">
      <WatermarkBrandLayer position="center" size={400} opacityClass="opacity-[0.04] dark:opacity-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 text-left sm:text-center"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-[#1D9BF0] font-medium block">
            {t('cta.kicker', 'Open & Client-Side')}
          </span>

          <h2 className="text-h1 text-theme-main font-bold">
            {t('cta.title', 'Built for Daily Developer Workflows')}
          </h2>

          <p className="text-body-large text-theme-muted font-normal max-w-xl sm:mx-auto leading-relaxed">
            {t('cta.subtitle', 'Free, browser-based utilities that format, validate, and convert data locally. No accounts, no ads, no backend data collection.')}
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center justify-start sm:justify-center gap-4">
            <Link
              to="/tools"
              className="px-6 py-3 rounded-lg bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white font-medium text-xs font-mono uppercase transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <span>{t('cta.ctaPrimary', 'Explore Developer Tools')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/guides"
              className="px-6 py-3 rounded-lg bg-surface border border-theme-subtle hover:border-[#1D9BF0] text-theme-main hover:text-[#1D9BF0] font-medium text-xs font-mono uppercase transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <span>{t('cta.ctaSecondary', 'Read Practical Guides')}</span>
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-start sm:justify-center gap-6 text-xs font-mono text-theme-muted">
            <Link to="/projects" className="inline-flex items-center gap-1.5 text-[#1D9BF0] hover:underline">
              <span>View Project Updates</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <span>•</span>
            <Link to="/about" className="hover:text-theme-main transition-colors">
              {t('cta.ctaEthos', 'Platform Ethos')}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

