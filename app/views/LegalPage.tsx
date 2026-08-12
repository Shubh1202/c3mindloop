'use client';

import React from 'react';
import { useLocation } from '../lib/router-compat';
import { useTranslation } from '../lib/i18n';
import { SEOHead } from '../components/layout/SEOHead';

const privacySections = [
  { title: 'section1Title', body: 'section1Body' },
  { title: 'section2Title', body: 'section2Body' },
  { title: 'section3Title', body: 'section3Body' },
  { title: 'section4Title', body: 'section4Body' },
  { title: 'section5Title', body: 'section5Body' },
  { title: 'section6Title', body: 'section6Body' },
  { title: 'section7Title', body: 'section7Body' },
];

const termsSections = [
  { title: 'section1Title', body: 'section1Body' },
  { title: 'section2Title', body: 'section2Body' },
  { title: 'section3Title', body: 'section3Body' },
  { title: 'section4Title', body: 'section4Body' },
  { title: 'section5Title', body: 'section5Body' },
];

export const LegalPage: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const isTerms = location.pathname.includes('terms');

  if (isTerms) {
    return (
      <>
        <SEOHead
          title="Terms of Service - C³ MindLoop"
          description="Terms of service and usage guidelines for C³ MindLoop developer tools and open-source platforms."
          canonical={location.pathname}
        />
        <div className="pt-10 pb-16 bg-app text-theme-main relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-4 mb-10">
              <span className="text-xs font-mono uppercase tracking-widest text-[#1D9BF0] font-semibold block">
                Legal
              </span>
              <h1 className="text-h1 text-theme-main">
                {t('terms.title', 'Terms of Service')}
              </h1>
              <p className="text-xs font-mono text-theme-muted">
                {t('terms.lastUpdated', 'Last updated: August 11, 2026')}
              </p>
              <p className="text-body text-theme-muted max-w-2xl mx-auto leading-relaxed">
                {t('terms.heroSubtitle')}
              </p>
            </div>
            <div className="space-y-8">
              {termsSections.map(({ title, body }, idx) => (
                <div
                  key={idx}
                  className="p-7 sm:p-9 rounded-xl bg-surface border border-theme-subtle space-y-3"
                >
                  <h2 className="text-h3 text-theme-main font-semibold">
                    {t(`terms.${title}`)}
                  </h2>
                  <p className="text-body-small text-theme-muted leading-relaxed">
                    {t(`terms.${body}`)}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-12 text-center text-xs font-mono text-theme-muted">
              Questions? Reach us at{' '}
              <a href="mailto:hello@c3mindloop.com" className="text-[#1D9BF0] hover:underline">
                hello@c3mindloop.com
              </a>
              {' '}or inspect our source on GitHub.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Privacy Policy - C³ MindLoop | Zero Data Collection, Client-Side Processing"
        description="C³ MindLoop's privacy policy. 100% client-side processing, zero data collection, offline developer utilities. Your code never leaves your browser."
        canonical={location.pathname}
      />

      <div className="pt-10 pb-16 bg-app text-theme-main relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center space-y-4 mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-[#1D9BF0] font-semibold block">
              Privacy First
            </span>
            <h1 className="text-h1 text-theme-main">
              {t('privacy.title', 'Privacy Policy')}
            </h1>
            <p className="text-xs font-mono text-theme-muted">
              {t('privacy.lastUpdated', 'Last updated: August 11, 2026')}
            </p>
            <p className="text-body text-theme-muted max-w-2xl mx-auto leading-relaxed">
              {t('privacy.heroSubtitle')}
            </p>
          </div>

          <div className="space-y-8">
            {privacySections.map(({ title, body }, idx) => (
              <div
                key={idx}
                className="p-7 sm:p-9 rounded-xl bg-surface border border-theme-subtle space-y-3"
              >
                <h2 className="text-h3 text-theme-main font-semibold">
                  {t(`privacy.${title}`)}
                </h2>
                <p className="text-body-small text-theme-muted leading-relaxed">
                  {t(`privacy.${body}`)}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-12 text-center text-xs font-mono text-theme-muted">
            Questions? Reach us at{' '}
            <a
              href="mailto:hello@c3mindloop.com"
              className="text-[#1D9BF0] hover:underline"
            >
              hello@c3mindloop.com
            </a>
            {' '}or inspect our source on GitHub.
          </p>

        </div>
      </div>
    </>
  );
};
