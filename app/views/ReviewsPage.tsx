'use client';

import React from 'react';
import Script from 'next/script';
import { ReviewSection } from '../components/ui/ReviewSection';
import { CTASection } from '../components/sections/CTASection';
import { useTranslation } from '../lib/i18n';

export const ReviewsPage: React.FC = () => {
  const { t } = useTranslation();
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  return (
    <>
      {recaptchaSiteKey && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`}
          strategy="afterInteractive"
        />
      )}

      <div className="pt-16 pb-20 bg-app text-theme-main relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Header (Aligned with AboutPage & ProductsPage) */}
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-[#1D9BF0] font-semibold block">
              {t('reviews.kicker', 'Community Feedback')}
            </span>
            <h1 className="text-h1 text-theme-main">
              {t('reviews.title', 'Verified Developer Reviews')}
            </h1>
            <p className="text-body-large text-theme-muted font-normal max-w-2xl mx-auto">
              {t('reviews.subtitle', 'Explore real ratings, feedback, and reviews from software engineers and architects using C³ MindLoop developer utilities.')}
            </p>
          </div>

          {/* Full Review Section Showcase */}
          <div className="pt-2">
            <ReviewSection limit={undefined} showViewAllLink={false} />
          </div>

        </div>
      </div>

      <CTASection />
    </>
  );
};
