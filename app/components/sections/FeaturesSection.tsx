'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from '../../lib/router-compat';
import { useTranslation } from '../../lib/i18n';
import { useTheme } from '../../lib/theme';

export const FeaturesSection: React.FC = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  const features = [
    { id: 'f1', titleKey: 'features.f1Title', descKey: 'features.f1Desc', link: '/tools' },
    { id: 'f2', titleKey: 'features.f2Title', descKey: 'features.f2Desc', link: '/tools' },
    { id: 'f3', titleKey: 'features.f3Title', descKey: 'features.f3Desc', link: '/tools' },
    { id: 'f4', titleKey: 'features.f4Title', descKey: 'features.f4Desc', link: '/guides' },
    { id: 'f5', titleKey: 'features.f5Title', descKey: 'features.f5Desc', link: '/projects' },
    { id: 'f6', titleKey: 'features.f6Title', descKey: 'features.f6Desc', link: '/projects' },
  ];

  return (
    <section
      className="py-16 lg:py-20 border-b border-theme-subtle relative transition-colors"
      style={{ backgroundColor: isDark ? 'transparent' : '#F8FAFC' }}
    >

      {/* Parallax Banner Background — dark mode only */}
      {isDark && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: "url('/banner-bg.jpg')",
            backgroundAttachment: 'fixed',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}

      {/* Dark overlay — dark mode only */}
      {isDark && (
        <div className="absolute inset-0 bg-[#0e0e0e]/85 pointer-events-none z-0" />
      )}

      {/* Rotating Cube Watermark */}
      <div
        className="absolute right-[-5%] top-1/2 -translate-y-1/2 pointer-events-none z-0 select-none w-[560px] h-[560px]"
        style={{ opacity: isDark ? 0.05 : 0.04 }}
      >
        <img
          src="/cube.svg"
          alt=""
          loading="lazy"
          className="w-full h-full object-contain animate-[spin_50s_linear_infinite] pointer-events-none select-none"
        />
      </div>

      {/* Foreground Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Editorial Section Header */}
        <div className="max-w-3xl mb-12 space-y-3">
          <span
            className="text-xs font-mono uppercase tracking-widest font-medium block"
            style={{ color: isDark ? '#1D9BF0' : '#2563EB' }}
          >
            {t('features.kicker', 'Platform Features')}
          </span>
          <h2
            className="text-h1 font-bold"
            style={{ color: isDark ? '#ffffff' : '#0F172A' }}
          >
            {t('features.title', 'Tooling & Engineering Resources')}
          </h2>
          <p
            className="text-body-large font-normal"
            style={{ color: isDark ? '#A1A1AA' : '#475569' }}
          >
            {t('features.subtitle', 'Fast browser utilities, practical guides, and transparent project logs.')}
          </p>
        </div>

        {/* 3-Column Feature Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10"
          style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}` }}
        >
          {features.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Link
                to={item.link}
                className="group block pl-6 space-y-3 transition-colors"
                style={{ borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}` }}
              >
                <div
                  className="flex items-center justify-between text-xs font-mono font-semibold"
                  style={{ color: isDark ? '#60A5FA' : '#2563EB' }}
                >
                  <span>PILLAR 0{idx + 1}</span>
                  <ArrowRight
                    className="w-3.5 h-3.5 group-hover:translate-x-1 transition-all"
                    style={{ color: isDark ? '#71717A' : '#94A3B8' }}
                  />
                </div>
                <h3
                  className="text-lg font-semibold transition-colors tracking-tight"
                  style={{ color: isDark ? '#ffffff' : '#0F172A' }}
                >
                  {t(item.titleKey)}
                </h3>
                <p
                  className="text-xs font-normal leading-relaxed"
                  style={{ color: isDark ? '#A1A1AA' : '#475569' }}
                >
                  {t(item.descKey)}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
