'use client';

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from '../../lib/router-compat';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Command, RotateCcw, Github } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';
// Temporarily hidden while incomplete locale coverage is audited and repaired.
// import { LanguageSelector } from '../ui/LanguageSelector';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';
import { ToolsHubModal } from './ToolsHubModal';

export const Navbar: React.FC<{
  onOpenCmdPalette: () => void;
  onReplayIntro?: () => void;
}> = ({ onOpenCmdPalette, onReplayIntro }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsHubOpen, setToolsHubOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('navbar.home', 'Home'), path: '/' },
    { name: t('navbar.tools', 'Tools'), path: '/tools' },
    { name: 'Compiler', path: '/compiler' },
    { name: t('navbar.guides', 'Guides'), path: '/guides' },
    { name: t('navbar.projects', 'Projects'), path: '/projects' },
    { name: t('navbar.community', 'Community'), path: '/community' },
    { name: t('navbar.reviews', 'Reviews'), path: '/reviews' },
    { name: t('navbar.about', 'About'), path: '/about' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#0e0e0e]/90 backdrop-blur-md border-b border-white/10 text-white shadow-lg transition-all duration-200 pointer-events-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 relative z-50 pointer-events-auto">
          {/* Official Brand Logo */}
          <Link to="/" className="flex items-center group transition-transform duration-200 hover:opacity-90 relative z-50 pointer-events-auto">
            <Logo variant="compact" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-neutral-900/80 p-1 rounded-lg border border-white/10 backdrop-blur-md shadow-sm relative z-50 pointer-events-auto">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path === '/tools' && location.pathname.startsWith('/tools')) || (link.path === '/compiler' && location.pathname.startsWith('/compiler'));
              const isTools = link.path === '/tools';

              if (isTools) {
                return (
                  <div
                    key={link.path}
                    className={`inline-flex items-center rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#1D9BF0]/15 text-[#1D9BF0] font-semibold border border-[#1D9BF0]/30'
                        : 'text-neutral-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Link
                      to="/tools"
                      className="px-3 py-1.5 hover:text-white transition-colors flex items-center focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1D9BF0] rounded-l-md"
                    >
                      {link.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setToolsHubOpen(true)}
                      suppressHydrationWarning
                      aria-label="Open Quick Tools Hub Modal"
                      title="Open Quick Tools Hub Modal"
                      className="pr-2 pl-0.5 py-1.5 cursor-pointer text-[9px] font-mono text-neutral-400 hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1D9BF0] rounded-r-md transition-colors"
                    >
                      <span className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-1.5 py-0.5 rounded border border-neutral-700/60 ml-0.5">
                        Hub
                      </span>
                    </button>
                  </div>
                );
              }

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#1D9BF0]/15 text-[#1D9BF0] font-semibold border border-[#1D9BF0]/30'
                      : 'text-neutral-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Actions (Theme, Language, GitHub) - Desktop */}
          <div className="hidden lg:flex items-center gap-2 relative z-50 pointer-events-auto">
            <a
              href="https://github.com/Shubh1202/c3mindloop"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-3 rounded-lg bg-neutral-900 border border-white/10 text-neutral-300 hover:text-white hover:border-[#1D9BF0]/40 hover:bg-neutral-800 transition-all cursor-pointer pointer-events-auto flex items-center gap-1.5 shrink-0 text-xs font-mono"
              title="GitHub Repository & Community"
            >
              <Github className="w-4 h-4 text-neutral-300" />
              <span className="hidden xl:inline">GitHub</span>
            </a>

            {onReplayIntro && (
              <button
                type="button"
                onClick={onReplayIntro}
                suppressHydrationWarning
                className="h-9 w-9 p-2 rounded-lg bg-neutral-900 border border-white/10 text-neutral-300 hover:text-[#1D9BF0] hover:bg-neutral-800 transition-colors cursor-pointer pointer-events-auto flex items-center justify-center shrink-0"
                title="Replay Brand Intro Animation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            <ThemeToggle />

            {/* <LanguageSelector /> */}
          </div>

          {/* Mobile & Tablet Controls */}
          <div className="flex items-center gap-2 lg:hidden relative z-50 pointer-events-auto">
            <a
              href="https://github.com/Shubh1202/c3mindloop"
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 w-9 rounded-lg bg-neutral-900 border border-white/10 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center justify-center shrink-0"
              title="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>

            {onReplayIntro && (
              <button
                type="button"
                onClick={onReplayIntro}
                suppressHydrationWarning
                className="h-9 w-9 p-2 rounded-lg bg-neutral-900 border border-white/10 text-neutral-300 hover:text-[#1D9BF0] hover:bg-neutral-800 transition-colors cursor-pointer pointer-events-auto flex items-center justify-center shrink-0"
                title="Replay Brand Intro Animation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <ThemeToggle />
            {/* <LanguageSelector /> */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              suppressHydrationWarning
              className="p-2 rounded-lg bg-surface border border-theme-subtle text-theme-muted hover:text-theme-main cursor-pointer pointer-events-auto"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-b border-theme-subtle bg-app/95 backdrop-blur-2xl overflow-hidden px-4 py-6 shadow-2xl"
            >
              <div className="space-y-1 mb-6">
                {navLinks.map((link) => {
                  if (link.path === '/tools') {
                    return (
                      <div key={link.path} className="flex items-center gap-2">
                        <Link
                          to="/tools"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            location.pathname.startsWith('/tools')
                              ? 'bg-[#1D9BF0]/15 text-[#1D9BF0] font-semibold border border-[#1D9BF0]/30'
                              : 'text-neutral-300 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {link.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setToolsHubOpen(true);
                          }}
                          suppressHydrationWarning
                          aria-label="Open Quick Tools Hub Modal"
                          className="px-3 py-2 rounded-lg text-xs font-mono font-medium transition-colors bg-surface border border-theme-subtle text-theme-muted hover:text-[#1D9BF0] shrink-0"
                        >
                          Quick Hub
                        </button>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === link.path
                          ? 'bg-[#1D9BF0]/15 text-[#1D9BF0] border border-[#1D9BF0]/30 font-semibold'
                          : 'text-theme-muted hover:bg-surface hover:text-theme-main'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Full-Screen Tools Hub Modal Overlay */}
      <ToolsHubModal isOpen={toolsHubOpen} onClose={() => setToolsHubOpen(false)} />
    </>
  );
};

