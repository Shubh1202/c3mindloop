'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ThumbsUp } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';
import { ROADMAP_ITEMS } from '../../lib/constants';

export const RoadmapSection: React.FC = () => {
  const { t } = useTranslation();
  const [upvotes, setUpvotes] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    ROADMAP_ITEMS.forEach((item) => {
      initial[item.id] = item.upvotes;
    });
    return initial;
  });

  const [upvotedState, setUpvotedState] = useState<Record<string, boolean>>({});

  const handleUpvote = (id: string) => {
    if (upvotedState[id]) {
      setUpvotes((prev) => ({ ...prev, [id]: prev[id] - 1 }));
      setUpvotedState((prev) => ({ ...prev, [id]: false }));
    } else {
      setUpvotes((prev) => ({ ...prev, [id]: prev[id] + 1 }));
      setUpvotedState((prev) => ({ ...prev, [id]: true }));
    }
  };

  return (
    <section className="py-16 lg:py-20 bg-app border-b border-theme-subtle relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="max-w-3xl mb-12 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#1D9BF0] font-normal block">
            {t('roadmap.kicker', 'Ecosystem Vision')}
          </span>
          <h2 className="text-h1 text-theme-main font-bold">
            {t('roadmap.title', 'C³ MindLoop Development Roadmap')}
          </h2>
          <p className="text-body-large text-theme-muted font-normal">
            {t('roadmap.subtitle', 'Explore upcoming features, experiment goals, and planned tooling.')}
          </p>
        </div>

        {/* Roadmap Editorial Columns with Line Dividers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-theme-subtle pt-10">
          {ROADMAP_ITEMS.map((item, idx) => {
            const title = t(item.titleKey, item.titleKey);
            const desc = t(item.descKey, item.descKey);
            const count = upvotes[item.id] ?? item.upvotes;
            const isVoted = upvotedState[item.id];

            return (
              <motion.div
                key={item.id}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="border-l border-theme-subtle pl-6 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-theme-muted">
                    <span className="text-[#1D9BF0] font-semibold">{item.quarter}</span>
                    <span className="uppercase">{item.status === 'in-progress' ? 'In Progress' : 'Planned'}</span>
                  </div>

                  <h3 className="text-lg font-semibold text-theme-main tracking-tight">{title}</h3>
                  <p className="text-xs text-theme-muted font-normal leading-relaxed">{desc}</p>
                </div>

                <div className="pt-4 border-t border-theme-subtle flex items-center justify-between text-xs font-mono">
                  <span className="text-theme-muted uppercase">{item.category}</span>
                  <button
                    onClick={() => handleUpvote(item.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 transition-colors cursor-pointer border ${
                      isVoted
                        ? 'border-[#1D9BF0] text-[#1D9BF0] font-semibold'
                        : 'border-theme-subtle text-theme-muted hover:text-theme-main hover:border-theme-subtle'
                    }`}
                  >
                    <ThumbsUp className={`w-3 h-3 ${isVoted ? 'fill-current' : ''}`} />
                    <span>{count}</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

