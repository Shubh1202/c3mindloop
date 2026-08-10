'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from '../../lib/router-compat';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, BookOpen, Layers, PhoneCall, Code2, Cpu, ArrowRight, RotateCcw, Sun, Moon } from 'lucide-react';
import { PRODUCTS_LIST, BLOG_POSTS } from '../../lib/constants';
import { useTheme } from '../../lib/theme';

export const CommandPalette: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onReplayIntro?: () => void;
}> = ({
  isOpen,
  onClose,
  onReplayIntro,
}) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null; // Handled outside
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { name: 'Home', path: '/', icon: Sparkles },
    { name: 'Products Showcase', path: '/products', icon: Layers },
    { name: 'Services & Architecture', path: '/services', icon: Code2 },
    { name: 'Developer Community', path: '/community', icon: Cpu },
    { name: 'Blog & Deep Dives', path: '/blog', icon: BookOpen },
    { name: 'Contact Engineering Team', path: '/contact', icon: PhoneCall },
  ];

  const filteredLinks = quickLinks.filter((l) =>
    l.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredProducts = PRODUCTS_LIST.filter((p) =>
    p.id.toLowerCase().includes(query.toLowerCase()) || p.nameKey.toLowerCase().includes(query.toLowerCase())
  );

  const filteredBlog = BLOG_POSTS.filter((b) =>
    b.title.toLowerCase().includes(query.toLowerCase()) || b.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-xl rounded-2xl bg-surface border border-theme-subtle shadow-2xl overflow-hidden z-10"
        >
          {/* Search Input Bar */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-theme-subtle bg-app/80">
            <Search className="w-5 h-5 text-[#1D9BF0] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages, products, themes, or articles..."
              autoFocus
              className="w-full bg-transparent text-theme-main placeholder-theme-muted text-sm focus:outline-none"
            />
            <kbd className="px-2 py-0.5 text-[10px] font-mono bg-surface text-theme-muted rounded border border-theme-subtle">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-2 space-y-4">
            {/* Theme Shortcuts */}
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-theme-muted uppercase tracking-wider font-mono">
                Appearance
              </div>
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                <button
                  onClick={() => { setTheme('light'); onClose(); }}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                    resolvedTheme === 'light' ? 'bg-[#1D9BF0]/15 border-[#1D9BF0] text-[#1D9BF0] font-semibold' : 'bg-surface border-theme-subtle text-theme-muted hover:text-theme-main'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light Mode</span>
                </button>
                <button
                  onClick={() => { setTheme('dark'); onClose(); }}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                    resolvedTheme === 'dark' ? 'bg-[#1D9BF0]/15 border-[#1D9BF0] text-[#1D9BF0] font-semibold' : 'bg-surface border-theme-subtle text-theme-muted hover:text-theme-main'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-[#1D9BF0]" />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>

            {/* Brand Intro Action */}
            {onReplayIntro && (
              <div>
                <div className="px-3 py-1 text-[11px] font-semibold text-[#1D9BF0] uppercase tracking-wider font-mono">
                  Brand & Ecosystem
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onReplayIntro();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#1D9BF0]/10 text-theme-main transition-colors cursor-pointer group text-sm border border-[#1D9BF0]/20 bg-[#1D9BF0]/5 my-1"
                >
                  <div className="flex items-center gap-3">
                    <RotateCcw className="w-4 h-4 text-[#1D9BF0]" />
                    <span className="font-semibold">Replay 3D Brand Intro Animation</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#1D9BF0] px-2 py-0.5 rounded bg-[#1D9BF0]/20">3D Cube</span>
                </button>
              </div>
            )}

            {/* Quick Links */}
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-theme-muted uppercase tracking-wider font-mono">
                Pages & Navigation
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleSelect(item.path)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#1D9BF0]/10 text-theme-muted hover:text-theme-main transition-colors cursor-pointer group text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-[#1D9BF0]" />
                        <span>{item.name}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-theme-muted group-hover:text-[#1D9BF0] transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length > 0 && (
              <div>
                <div className="px-3 py-1 text-[11px] font-semibold text-theme-muted uppercase tracking-wider font-mono">
                  SaaS Products
                </div>
                <div className="space-y-0.5 mt-1">
                  {filteredProducts.map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => handleSelect('/products')}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-surface text-theme-muted hover:text-theme-main transition-colors cursor-pointer text-sm"
                    >
                      <span className="font-mono text-[#1D9BF0]">{prod.id}</span>
                      <span className="text-xs text-theme-muted uppercase">{prod.status}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Articles */}
            {filteredBlog.length > 0 && (
              <div>
                <div className="px-3 py-1 text-[11px] font-semibold text-theme-muted uppercase tracking-wider font-mono">
                  Blog & Articles
                </div>
                <div className="space-y-0.5 mt-1">
                  {filteredBlog.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => handleSelect('/blog')}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-surface text-theme-muted hover:text-theme-main transition-colors cursor-pointer text-xs line-clamp-1"
                    >
                      {post.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

