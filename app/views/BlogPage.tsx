'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { getPublishedGuides } from '../lib/constants';
import { CTASection } from '../components/sections/CTASection';
import { GuideCard } from '../components/guides/GuideCard';

export const BlogPage: React.FC<{ variant?: 'blog' | 'guides' }> = ({ variant = 'blog' }) => {
  const { locale, t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'engineering', 'developerTools', 'aiAgents', 'developerCulture', 'typeScript'];
  const copy = (key: string, fallback: string) => t(`${variant}.${key}`, fallback);

  const guides = getPublishedGuides(locale).map((guide) => ({
    id: guide.id,
    slug: guide.slug,
    title: guide.title,
    excerpt: guide.excerpt,
    content: guide.content,
    category: guide.category,
    author: { name: guide.authorName || '', role: guide.authorRole || '', avatar: '' },
    publishedAt: guide.publishedAt,
    readTimeMinutes: guide.readTimeMinutes,
    tags: guide.tags,
  }));
  const posts = variant === 'guides' ? guides : [];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <div className="pt-16 pb-20 relative z-10 bg-app">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-[#1D9BF0] font-semibold block">
              {copy('kicker', 'Engineering Insights')}
            </span>
            <h1 className="text-h1 text-theme-main">
              {copy('title', 'Developer Publication & Build Logs')}
            </h1>
            <p className="text-body-large text-theme-muted max-w-2xl mx-auto">
              {copy('subtitle', 'Deep-dives into distributed systems, AI agent design, React performance, and engineering craft.')}
            </p>

            {/* Search Input */}
            <div className="relative max-w-xl mx-auto pt-4">
              <Search className="w-5 h-5 text-[#1D9BF0] absolute left-4 top-1/2 -translate-y-1/2 mt-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={copy('searchPlaceholder', 'Search articles by title, tag, or keyword...')}
                className="w-full bg-surface border border-theme-subtle rounded-xl pl-12 pr-4 py-3 text-body-small text-theme-main placeholder:text-theme-muted focus:outline-none focus:border-[#1D9BF0]"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${selectedCategory === cat
                    ? 'bg-[#1D9BF0] text-white font-semibold'
                    : 'bg-surface border border-theme-subtle text-theme-muted hover:text-theme-main'
                    }`}
                >
                  {copy(`categories.${cat}`, cat === 'all' ? 'All Categories' : cat)}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Grid */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 text-theme-muted font-mono text-xs">
              {copy('noResults', 'No articles found matching your criteria.')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredPosts.map((post) => (
                <GuideCard key={post.id} guide={post} />
              ))}
            </div>
          )}

          <CTASection />
        </div>
      </div>
    </>
  );
};
