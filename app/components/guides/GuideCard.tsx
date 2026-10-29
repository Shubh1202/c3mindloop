'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight, User } from 'lucide-react';

export interface GuideCardProps {
  guide: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    tags?: string[];
    readTimeMinutes?: number;
    publishedAt?: string;
    author?: {
      name?: string;
      role?: string;
    };
    authorName?: string;
    authorRole?: string;
  };
  compact?: boolean;
}

export const GuideCard: React.FC<GuideCardProps> = ({ guide, compact = false }) => {
  const authorName = guide.author?.name || guide.authorName || '';
  const readTime = guide.readTimeMinutes || 5;
  const guideHref = `/guides/${guide.slug}`;

  if (compact) {
    return (
      <div className="p-5 rounded-xl bg-surface border border-theme-subtle hover:border-accent/40 transition-all flex flex-col justify-between group space-y-4 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-theme-muted">
            <span className="text-accent font-semibold uppercase tracking-wider">{guide.category}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" aria-hidden="true" />
              <span>{readTime} min read</span>
            </span>
          </div>

          <h3 className="text-base font-semibold text-theme-main group-hover:text-accent transition-colors leading-snug">
            <Link href={guideHref} className="focus:outline-none focus:underline">
              {guide.title}
            </Link>
          </h3>

          <p className="text-xs text-theme-muted line-clamp-2 leading-relaxed">
            {guide.excerpt}
          </p>
        </div>

        <div className="pt-3 border-t border-theme-subtle/80 flex items-center justify-between">
          <span className="text-[11px] font-mono text-theme-muted">
            {guide.publishedAt}
          </span>
          <Link
            href={guideHref}
            className="text-xs font-semibold text-accent hover:text-sky-300 transition-colors inline-flex items-center gap-1 group-hover:translate-x-0.5"
            aria-label={`Read guide: ${guide.title}`}
          >
            <span>Read Guide</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="p-6 sm:p-8 rounded-xl bg-surface border border-theme-subtle flex flex-col justify-between space-y-6 group hover:border-accent/40 transition-colors shadow-sm">
      <div className="space-y-4">
        {/* Top Meta: Category + Read Time */}
        <div className="flex items-center justify-between text-xs font-mono text-theme-muted">
          <span className="text-accent font-semibold uppercase tracking-wider">
            {guide.category}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{readTime} min read</span>
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-theme-main group-hover:text-accent transition-colors leading-tight">
          <Link href={guideHref} className="hover:underline focus:outline-none focus:ring-1 focus:ring-sky-400 rounded">
            {guide.title}
          </Link>
        </h2>

        {/* Excerpt */}
        <p className="text-body-small text-theme-muted leading-relaxed">
          {guide.excerpt}
        </p>

        {/* Tags */}
        {guide.tags && guide.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {guide.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded bg-app border border-theme-subtle text-[11px] font-mono text-theme-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer: Author / Date + Read Action */}
      <div className="pt-6 border-t border-theme-subtle flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {authorName ? (
            <div>
              <div className="text-xs font-semibold text-theme-main flex items-center gap-1">
                <User className="w-3 h-3 text-neutral-400" aria-hidden="true" />
                <span>{authorName}</span>
              </div>
              {guide.publishedAt && (
                <div className="text-[11px] text-theme-muted font-mono">{guide.publishedAt}</div>
              )}
            </div>
          ) : (
            guide.publishedAt && (
              <div className="text-xs text-theme-muted font-mono">{guide.publishedAt}</div>
            )
          )}
        </div>

        <Link
          href={guideHref}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-accent hover:bg-neutral-800 text-neutral-100 hover:text-white text-xs font-semibold transition-all group-hover:shadow-sm"
          aria-label={`Read full guide: ${guide.title}`}
        >
          <span>Read Guide</span>
          <ArrowRight className="w-3.5 h-3.5 text-accent group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
};
