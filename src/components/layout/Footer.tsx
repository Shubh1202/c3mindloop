'use client';

import React, { useState } from 'react';
import { Link } from '../../lib/router-compat';
import { Github, Twitter, Youtube, MessageSquare, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTranslation } from '../../lib/i18n';
import { Logo } from '../ui/Logo';

export const Footer: React.FC<{ onReplayIntro?: () => void }> = ({ onReplayIntro }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
  };

  return (
    <footer className="relative bg-app border-t border-theme-subtle pt-16 pb-12 overflow-hidden text-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-theme-subtle">
          {/* Brand Info & Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <Logo variant="full" showTagline />
            </Link>

            <p className="text-theme-muted text-sm leading-[1.6] max-w-sm pt-2">
              {t('footer.footerDesc', 'Free, open, browser-based utilities for daily developer workflows. No ads, no tracking, 100% local client-side processing.')}
            </p>

            <div className="pt-1">
              <div className="flex items-center gap-2 text-xs text-[#1D9BF0] font-mono font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D9BF0]" />
                <span>{t('footer.footerPill', 'Coding. Crashing. Crying.')}</span>
              </div>
            </div>

            {/* Newsletter Form */}
            <form onSubmit={handleSubscribe} className="pt-2 max-w-md">
              <span className="block text-xs font-mono uppercase font-semibold text-theme-muted mb-2">
                {t('footer.newsletterLabel', 'Developer Updates')}
              </span>
              {subscribed ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Subscribed to C³ MindLoop developer updates.</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('footer.newsletterPlaceholder', 'Enter developer email...')}
                    required
                    className="flex-1 bg-surface border border-theme-subtle rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-theme-main placeholder-theme-muted focus:outline-none focus:border-[#1D9BF0]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t('footer.newsletterBtn', 'Join')}</span>
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Col 1: Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-theme-main">
              {t('footer.colTools', 'TOOLS')}
            </h4>
            <ul className="space-y-2.5 text-sm text-theme-muted">
              <li><Link to="/tools" className="hover:text-[#1D9BF0] transition-colors">{t('footer.toolsJson', 'JSON Utilities')}</Link></li>
              <li><Link to="/tools" className="hover:text-[#1D9BF0] transition-colors">{t('footer.toolsCode', 'Code Formatters')}</Link></li>
              <li><Link to="/tools" className="hover:text-[#1D9BF0] transition-colors">{t('footer.toolsJwt', 'JWT & Web Tools')}</Link></li>
              <li className="flex items-center justify-between text-theme-muted/70">
                <span>{t('footer.toolsPdf', 'PDF & File Utilities')}</span>
                <span className="text-[10px] font-mono text-amber-500/90 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">{t('footer.toolsPdfSoon', 'Coming Soon')}</span>
              </li>
            </ul>
          </div>

          {/* Col 2: Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-theme-main">
              {t('footer.colResources', 'RESOURCES')}
            </h4>
            <ul className="space-y-2.5 text-sm text-theme-muted">
              <li><Link to="/guides" className="hover:text-[#1D9BF0] transition-colors">{t('footer.resGuides', 'Practical Guides')}</Link></li>
              <li><Link to="/guides" className="hover:text-[#1D9BF0] transition-colors">{t('footer.resWorkflows', 'Developer Workflows')}</Link></li>
              <li><Link to="/projects" className="hover:text-[#1D9BF0] transition-colors">{t('footer.resLogs', 'Project Logs')}</Link></li>
            </ul>
          </div>

          {/* Col 3: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-theme-main">
              {t('footer.colPlatform', 'PLATFORM')}
            </h4>
            <ul className="space-y-2.5 text-sm text-theme-muted">
              <li><Link to="/about" className="hover:text-[#1D9BF0] transition-colors">{t('footer.platAbout', 'About C³ MindLoop')}</Link></li>
              <li><Link to="/projects" className="hover:text-[#1D9BF0] transition-colors">{t('footer.platOpenSource', 'Open Source')}</Link></li>
              <li><Link to="/contact" className="hover:text-[#1D9BF0] transition-colors">{t('footer.platContact', 'Contact')}</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-[#1D9BF0] transition-colors">{t('footer.platPrivacy', 'Privacy Policy')}</Link></li>
              <li><Link to="/terms" className="hover:text-[#1D9BF0] transition-colors">{t('footer.platTerms', 'Terms of Service')}</Link></li>
              {onReplayIntro && (
                <li className="pt-1">
                  <button
                    onClick={onReplayIntro}
                    className="hover:text-[#1D9BF0] text-[#1D9BF0] transition-colors font-semibold cursor-pointer text-left text-xs"
                  >
                    {t('footer.platReplayIntro', 'Replay Intro')}
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Status */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-theme-muted">
          <div className="flex items-center gap-2">
            <span>{t('footer.copyright', '© 2026 C³ MindLoop. Built for real developers.')}</span>
          </div>

          {/* Operational Status */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-surface border border-theme-subtle text-theme-muted font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>{t('footer.status', 'All Systems Operational')}</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4 text-theme-muted">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-[#1D9BF0] transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-[#1D9BF0] transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://discord.gg" target="_blank" rel="noreferrer" className="hover:text-[#1D9BF0] transition-colors">
              <MessageSquare className="w-4 h-4" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-[#1D9BF0] transition-colors">
              <Youtube className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

