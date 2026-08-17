'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Clock, ArrowRight, Share2, Check } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { getPublishedGuides } from '../lib/constants';
import { SEOHead } from '../components/layout/SEOHead';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { BlogPost } from '../types';
import { CTASection } from '../components/sections/CTASection';

export const BlogPage: React.FC<{ variant?: 'blog' | 'guides' }> = ({ variant = 'blog' }) => {
  const { locale, t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {variant === 'blog' && (
      <SEOHead
        title="Engineering Publication - C³ MindLoop"
        description="Deep-dive technical articles on distributed systems, AI agent design, React performance, and engineering craft by the C³ MindLoop team."
        canonical="/blog"
      />
      )}

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
                <div key={post.id} className="p-5 sm:p-8 rounded-xl bg-surface border border-theme-subtle flex flex-col justify-between space-y-6 group hover:border-[#1D9BF0]/40 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-4 text-xs font-mono text-theme-muted">
                      <span className="text-[#1D9BF0] font-semibold">{copy(`categories.${post.category}`, post.category)}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readTimeMinutes} {copy('readTime', 'min read')}
                      </span>
                    </div>

                    <h2 className="text-h3 text-theme-main mb-3 group-hover:text-[#1D9BF0] transition-colors">
                      {variant === 'guides' ? (
                        <Link href={`/guides/${post.slug}`} className="hover:underline">
                          {post.title}
                        </Link>
                      ) : post.title}
                    </h2>

                    <p className="text-body-small text-theme-muted mb-6">
                      {post.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {post.tags.map((tag) => (
                        <span key={tag} className="px-2.5 py-1 rounded bg-app border border-theme-subtle text-code text-theme-muted">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-theme-subtle flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div>
                        {post.author.name && (
                          <div className="text-xs font-semibold text-theme-main">{post.author.name}</div>
                        )}
                        <div className="text-xs text-theme-muted font-mono">{post.publishedAt}</div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setActiveArticle(post)}
                      icon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      {copy('readArticle', 'Read Article')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <CTASection />
        </div>
      </div>

      {/* Article Detail Modal */}
      <Modal isOpen={!!activeArticle} onClose={() => setActiveArticle(null)} title={activeArticle?.title}>
        {activeArticle && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs font-mono text-theme-muted pb-4 border-b border-theme-subtle">
              <span>{activeArticle.author.name ? `${activeArticle.author.name} • ${activeArticle.publishedAt}` : activeArticle.publishedAt}</span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1 text-[#1D9BF0] hover:underline cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Link' : 'Share'}</span>
              </button>
            </div>

            <p className="text-body text-theme-muted leading-relaxed">
              {activeArticle.content}
            </p>

            {activeArticle.codeSnippet && (
              <div className="p-4 rounded-lg bg-app border border-theme-subtle font-mono text-code text-[#1D9BF0] overflow-x-auto">
                <pre>{activeArticle.codeSnippet}</pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};
