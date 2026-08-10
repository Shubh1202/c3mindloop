'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from '../../lib/router-compat';
import { useTranslation } from '../../lib/i18n';
import { CRASH_STORIES } from '../../lib/constants';

export const CommunitySection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 lg:py-20 bg-app border-b border-theme-subtle relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-12 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#1D9BF0] font-normal block">
            {t('community.kicker', 'Developer Movement')}
          </span>
          <h2 className="text-h1 text-theme-main font-bold">
            {t('community.title', 'Where Engineers Connect & Share')}
          </h2>
          <p className="text-body-large text-theme-muted font-normal">
            {t('community.subtitle', 'A developer-first community sharing honest engineering stories, code reviews, and open-source collaboration.')}
          </p>
        </div>

        {/* Discord / Community Banner - Clean Line Dividers */}
        <div className="py-8 border-t border-b border-theme-subtle mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-mono uppercase tracking-widest text-[#1D9BF0]">
                {t('community.discordTitle', 'Official Community Hub')}
              </span>
              <h3 className="text-2xl font-semibold text-theme-main">
                "Coding. Crashing. Crying."
              </h3>
              <p className="text-sm text-theme-muted font-normal leading-relaxed">
                {t('community.discordDesc', 'Discussions, code reviews, architecture feedback, and open-source contributions.')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 shrink-0">
              <Link
                to="/community"
                className="inline-flex items-center gap-2 text-sm font-medium text-theme-main hover:text-[#1D9BF0] transition-colors group cursor-pointer"
              >
                <span>{t('community.joinBtn', 'Join Community')}</span>
                <ArrowRight className="w-4 h-4 text-[#1D9BF0] group-hover:translate-x-1.5 transition-transform" />
              </Link>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-sm font-medium text-theme-muted hover:text-theme-main transition-colors group cursor-pointer"
              >
                <span>Read Technical Writings</span>
                <ArrowRight className="w-4 h-4 text-theme-muted group-hover:text-theme-main group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Crash Stories Section - Editorial Grid */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-theme-subtle pb-3">
            <h3 className="text-xl font-semibold text-theme-main">
              {t('community.storiesTitle', 'Developer Crash Stories')}
            </h3>
            <Link to="/community" className="text-xs font-mono font-semibold uppercase tracking-wider text-[#1D9BF0] hover:underline flex items-center gap-1">
              View All Stories →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
            {CRASH_STORIES.map((story) => (
              <div key={story.id} className="border-l border-theme-subtle pl-6 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-theme-muted">
                  <span className="text-[#1D9BF0] font-semibold">{story.author}</span>
                  <span>{story.role}</span>
                </div>
                <h4 className="text-base font-semibold text-theme-main">{story.title}</h4>
                <p className="text-xs text-theme-muted font-normal leading-relaxed">{story.story}</p>

                <div className="pt-2 border-t border-theme-subtle text-xs font-mono text-theme-muted">
                  <span className="text-[#1D9BF0] block mb-1">Lesson Learned:</span>
                  {story.lesson}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

