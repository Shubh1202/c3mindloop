'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from '../../lib/router-compat';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Command, RotateCcw, Code2, ShieldCheck, Zap, Clock, Terminal, Regex, Database, Hash, FileText, Sparkles } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';
// Temporarily hidden while incomplete locale coverage is audited and repaired.
// import { LanguageSelector } from '../ui/LanguageSelector';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';

export const Navbar: React.FC<{
  onOpenCmdPalette: () => void;
  onReplayIntro?: () => void;
}> = ({ onOpenCmdPalette, onReplayIntro }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openTools = () => {
    if (toolsTimerRef.current) clearTimeout(toolsTimerRef.current);
    setToolsOpen(true);
  };
  const closeTools = () => {
    toolsTimerRef.current = setTimeout(() => setToolsOpen(false), 120);
  };

  const col1Tools = [
    { name: 'JSON Formatter', sub: 'Format & Validate', path: '/tools/json-formatter', icon: Code2 },
    { name: 'Base64 Encoder', sub: 'Encode & Decode', path: '/tools/base64-encoder', icon: Zap },
    { name: 'SQL to JSON', sub: 'Convert & Export', path: '/tools/sql-to-json', icon: Database },
    { name: 'cURL Converter', sub: 'Convert to Code', path: '/tools/curl-converter', icon: Terminal },
    { name: 'AI Prompt Builder', sub: 'Sanitize & Optimize', path: '/tools/ai-prompt-builder', icon: Sparkles, isNew: true },
  ];

  const col2Tools = [
    { name: 'ATS Resume Generator', sub: '100% Private PDF', path: '/tools/ats-resume-generator', icon: FileText, isNew: true },
    { name: 'JWT Inspector', sub: 'Decode & Inspect', path: '/tools/jwt-inspector', icon: ShieldCheck },
    { name: 'Hash Generator', sub: 'SHA-256 & MD5', path: '/tools/hash-generator', icon: Hash },
    { name: 'Cron Visualizer', sub: 'Parse & Schedule', path: '/tools/cron-visualizer', icon: Clock },
    { name: 'Regex Tester', sub: 'Test & Debug', path: '/tools/regex-tester', icon: Regex },
    { name: 'PDF Suite', sub: 'Compress & Merge', path: '/tools/pdf-suite', icon: FileText, isNew: true },
  ];

  const toolsDropdown = [...col1Tools, ...col2Tools];

  const navLinks = [
    { name: t('navbar.home', 'Home'), path: '/' },
    { name: t('navbar.tools', 'Tools'), path: '/tools' },
    { name: t('navbar.guides', 'Guides'), path: '/guides' },
    { name: t('navbar.projects', 'Projects'), path: '/projects' },
    { name: t('navbar.about', 'About'), path: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0e0e0e]/90 backdrop-blur-md border-b border-white/10 text-white shadow-lg transition-all duration-200 pointer-events-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 relative z-50 pointer-events-auto">
        {/* Official Brand Logo */}
        <Link to="/" className="flex items-center group transition-transform duration-200 hover:opacity-90 relative z-50 pointer-events-auto">
          <Logo variant="compact" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-neutral-900/80 p-1 rounded-lg border border-white/10 backdrop-blur-md shadow-sm relative z-50 pointer-events-auto">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const isTools = link.path === '/tools';

            if (isTools) {
              return (
                <div
                  key={link.path}
                  className="relative"
                  onMouseEnter={openTools}
                  onMouseLeave={closeTools}
                >
                  <Link
                    to={link.path}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
                      isActive
                        ? 'bg-[#1D9BF0]/15 text-[#1D9BF0] font-semibold border border-[#1D9BF0]/30'
                        : 'text-neutral-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                    <svg className={`w-3 h-3 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </Link>

                  {/* Invisible hover bridge */}
                  <div className="absolute top-full left-0 w-full h-2" />

                  <AnimatePresence>
                    {toolsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-[100] w-[540px] max-h-[85vh] overflow-y-auto bg-zinc-900/95 border border-zinc-800 backdrop-blur-md shadow-2xl rounded-xl p-3"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          {/* Column 1 (Data & Formatters) */}
                          <div className="space-y-1">
                            <div className="px-3 py-1 text-[9px] font-mono uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 mb-1">
                              Data & Formatters
                            </div>
                            {col1Tools.map((tool) => {
                              const Icon = tool.icon;
                              const isToolActive = location.pathname === tool.path;
                              return (
                                <Link
                                  key={tool.path}
                                  to={tool.path}
                                  onClick={() => setToolsOpen(false)}
                                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
                                    isToolActive
                                      ? 'bg-[#1D9BF0]/15 text-[#1D9BF0]'
                                      : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                                  }`}
                                >
                                  <div className={`p-1.5 rounded-md shrink-0 ${
                                    isToolActive ? 'bg-[#1D9BF0]/20 text-[#1D9BF0]' : 'bg-neutral-800 text-neutral-400 group-hover:text-[#1D9BF0] group-hover:bg-[#1D9BF0]/10'
                                  } transition-colors`}>
                                    <Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-semibold leading-tight flex items-center gap-1.5">
                                      <span>{tool.name}</span>
                                    </div>
                                    <div className="text-[10px] text-neutral-500 group-hover:text-neutral-400 transition-colors">{tool.sub}</div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>

                          {/* Column 2 (Dev Utilities & Tools) */}
                          <div className="space-y-1">
                            <div className="px-3 py-1 text-[9px] font-mono uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 mb-1">
                              Dev Utilities & Tools
                            </div>
                            {col2Tools.map((tool) => {
                              const Icon = tool.icon;
                              const isToolActive = location.pathname === tool.path;
                              return (
                                <Link
                                  key={tool.path}
                                  to={tool.path}
                                  onClick={() => setToolsOpen(false)}
                                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
                                    isToolActive
                                      ? 'bg-[#1D9BF0]/15 text-[#1D9BF0]'
                                      : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                                  }`}
                                >
                                  <div className={`p-1.5 rounded-md shrink-0 ${
                                    isToolActive ? 'bg-[#1D9BF0]/20 text-[#1D9BF0]' : 'bg-neutral-800 text-neutral-400 group-hover:text-[#1D9BF0] group-hover:bg-[#1D9BF0]/10'
                                  } transition-colors`}>
                                    <Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-semibold leading-tight flex items-center gap-1.5">
                                      <span>{tool.name}</span>
                                      {tool.isNew && (
                                        <span className="text-[8px] font-mono font-bold bg-[#1D9BF0] text-white px-1 py-0.25 rounded shrink-0 leading-none scale-90 origin-left">
                                          NEW
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-neutral-500 group-hover:text-neutral-400 transition-colors">{tool.sub}</div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-zinc-800">
                          <Link
                            to="/tools"
                            onClick={() => setToolsOpen(false)}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono text-neutral-500 hover:text-[#1D9BF0] hover:bg-white/5 transition-colors"
                          >
                            View all tools →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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

        {/* Actions (Theme, Language) - Desktop */}
        <div className="hidden lg:flex items-center gap-2 relative z-50 pointer-events-auto">
          {onReplayIntro && (
            <button
              type="button"
              onClick={onReplayIntro}
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
          {onReplayIntro && (
            <button
              type="button"
              onClick={onReplayIntro}
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
              {navLinks.map((link) => (
                <React.Fragment key={link.path}>
                  <Link
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
                  {link.path === '/tools' && (
                    <div className="pl-4 space-y-0.5">
                      {toolsDropdown.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <Link
                            key={tool.path}
                            to={tool.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <Icon className="w-3.5 h-3.5 text-theme-muted" />
                            {tool.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

