'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Check, Copy, Code2, ShieldCheck, Sparkles, RefreshCw, Trash2, Terminal } from 'lucide-react';
import { Link } from '../../lib/router-compat';
import { WatermarkBrandLayer } from '../ui/WatermarkBrandLayer';
import { useTranslation } from '../../lib/i18n';

export const Hero: React.FC = () => {
  const { t } = useTranslation();
  const defaultSample = `{\n  "platform": "C3 MindLoop",\n  "tagline": "Coding. Crashing. Crying.",\n  "privacy": "100% Client-Side Processing",\n  "version": "2.4.0",\n  "utilities": ["JSON Formatter", "Base64 Tool", "JWT Inspector", "Regex Tester"]\n}`;

  const [jsonInput, setJsonInput] = useState(defaultSample);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>('Valid JSON • Ready');

  const formatJson = () => {
    try {
      if (!jsonInput.trim()) {
        setError('Input is empty');
        setStatusMsg('Empty input');
        return;
      }
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setError(null);
      setStatusMsg(`Formatted (${new Blob([jsonInput]).size} bytes)`);
    } catch (err: any) {
      setError(err.message || 'Invalid JSON syntax');
      setStatusMsg('JSON Syntax Error');
    }
  };

  const minifyJson = () => {
    try {
      if (!jsonInput.trim()) {
        setError('Input is empty');
        setStatusMsg('Empty input');
        return;
      }
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed));
      setError(null);
      setStatusMsg(`Minified (${new Blob([jsonInput]).size} bytes)`);
    } catch (err: any) {
      setError(err.message || 'Invalid JSON syntax');
      setStatusMsg('JSON Syntax Error');
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(jsonInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const loadSample = () => {
    setJsonInput(defaultSample);
    setError(null);
    setStatusMsg('Sample loaded');
  };

  const clearInput = () => {
    setJsonInput('');
    setError(null);
    setStatusMsg('Cleared');
  };

  return (
    <section className="relative pt-16 pb-16 sm:pt-20 lg:pt-24 lg:pb-20 bg-transparent border-b border-theme-subtle overflow-hidden">
      {/* C3 Cube Watermark Background */}
      <WatermarkBrandLayer
        position="top-right"
        size={520}
        opacityClass="opacity-[0.08] dark:opacity-20"
        animateSpin={false}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main 2-Column Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: High-Typography Display Headline */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-xs font-mono tracking-widest text-sky-400/90 uppercase mb-3 flex items-center gap-2">
                <span>{t('hero.kicker', 'C³ MINDLOOP • WHERE TECH MEETS TRUTH')}</span>
              </div>
            </motion.div>

            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="text-display text-theme-main font-bold leading-tight">
                {t('hero.titleLine1', 'Think. Build.')}<br />
                {t('hero.titleLine2', 'Learn.')} <span className="text-sky-400 font-semibold">{t('hero.titleHighlight', 'Repeat.')}</span>
              </h1>
            </motion.div>

            <motion.p
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-body-large text-theme-muted font-normal max-w-xl leading-relaxed"
            >
              {t('hero.description', 'Free, open-source, client-side browser utilities built for daily developer workflows. No tracking, zero server retention — 100% local execution.')}
            </motion.p>

            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 }}
            >
              {/* Only 'Coding. Crashing. Crying.' in a Stylized Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/60 border border-sky-800/60 font-mono text-xs text-sky-300 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                <span>{t('hero.pill', 'Coding. Crashing. Crying.')}</span>
              </div>

              {/* Plain Text Dev Reality Equation (No Pill, No Slashes) */}
              <div className="font-mono text-xs text-neutral-400 mb-8 flex items-center gap-1.5">
                <span className="text-amber-400 font-medium">{t('hero.equationA', 'Client Demand')}</span>
                <span className="text-sky-400">+</span>
                <span className="text-amber-400 font-medium">{t('hero.equationB', 'Boss Pressure')}</span>
                <span className="text-sky-400">=</span>
                <span className="text-red-400 font-semibold">{t('hero.equationResult', 'Programmers Have No Life')}</span>
              </div>
            </motion.div>

            {/* Editorial Text-Link CTAs */}
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex items-center gap-8 pt-4 border-t border-theme-subtle"
            >
              <Link
                to="/tools"
                className="inline-flex items-center gap-2 text-sm font-medium text-theme-main hover:text-sky-400 transition-colors group cursor-pointer"
              >
                <span>{t('hero.ctaPrimary', 'Explore Developer Tools')}</span>
                <ArrowRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1.5 transition-transform" />
              </Link>

              <Link
                to="/guides"
                className="inline-flex items-center gap-2 text-sm font-medium text-theme-muted hover:text-theme-main transition-colors group cursor-pointer"
              >
                <span>{t('hero.ctaSecondary', 'Read Practical Guides')}</span>
                <ArrowRight className="w-4 h-4 text-theme-muted group-hover:text-theme-main group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Featured Developer Utility Preview Card */}
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="lg:col-span-5 space-y-4"
          >
            {/* Utility Card Wrapper */}
            <div className="bg-neutral-900 dark:bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden shadow-2xl font-mono text-xs">
              
              {/* Utility Header */}
              <div className="px-4 py-3 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-[#1D9BF0]/20 text-[#1D9BF0]">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-sans font-semibold text-neutral-200">
                    {t('hero.cardTitle', 'Featured Utility: JSON Formatter')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={loadSample}
                    className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-sans transition-colors cursor-pointer"
                    title="Load Sample JSON"
                  >
                    {t('hero.cardSample', 'Sample')}
                  </button>
                  <button
                    onClick={clearInput}
                    className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                    title="Clear"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="px-3 py-2 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={formatJson}
                    className="px-2.5 py-1 rounded bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white text-[11px] font-sans font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t('hero.cardFormat', 'Format')}</span>
                  </button>
                  <button
                    onClick={minifyJson}
                    className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-sans font-medium transition-colors cursor-pointer"
                  >
                    {t('hero.cardMinify', 'Minify')}
                  </button>
                </div>

                <button
                  onClick={copyOutput}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-sky-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? t('hero.cardCopied', 'Copied!') : t('hero.cardCopy', 'Copy')}</span>
                </button>
              </div>

              {/* Interactive Code / JSON Input Area */}
              <div className="relative">
                <textarea
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value);
                    setError(null);
                    setStatusMsg('Editing...');
                  }}
                  placeholder={t('hero.cardPlaceholder', 'Paste or type JSON here...')}
                  className="w-full h-52 p-3 bg-neutral-900/90 text-neutral-200 font-mono text-[11px] leading-relaxed focus:outline-none resize-none selection:bg-[#1D9BF0]/30"
                  spellCheck={false}
                />
              </div>

              {/* Error or Status Banner */}
              {error ? (
                <div className="px-3 py-2 bg-red-950/80 border-t border-red-800/80 text-[11px] text-red-300 font-mono">
                  {error}
                </div>
              ) : (
                <div className="px-3 py-1.5 bg-neutral-950 border-t border-neutral-800 text-[10px] text-neutral-400 font-mono flex items-center justify-between">
                  <span>{statusMsg}</span>
                  <span className="text-neutral-500">{t('hero.cardLocalBrowser', 'Local Browser JS')}</span>
                </div>
              )}

              {/* Privacy Badge footer */}
              <div className="px-3.5 py-2 bg-neutral-950 border-t border-neutral-800 text-[11px] font-mono flex items-center gap-2 text-neutral-400">
                <span>{t('hero.cardPrivacy', 'Client-Side Processing: All operations run locally in your browser.')}</span>
              </div>
            </div>

            {/* Quick Links to Utility Categories */}
            <div className="p-3.5 rounded-lg bg-surface border border-theme-subtle space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-theme-muted block font-semibold">
                {t('hero.utilitiesLabel', 'Available Browser Utilities')}
              </span>
              <div className="flex flex-wrap gap-1.5">
                <Link to="/tools" className="px-2.5 py-1 rounded bg-app border border-theme-subtle text-xs text-theme-main hover:text-[#1D9BF0] hover:border-[#1D9BF0]/40 transition-colors">
                  JSON Formatter
                </Link>
                <Link to="/tools" className="px-2.5 py-1 rounded bg-app border border-theme-subtle text-xs text-theme-main hover:text-[#1D9BF0] hover:border-[#1D9BF0]/40 transition-colors">
                  Base64 Encode/Decode
                </Link>
                <Link to="/tools" className="px-2.5 py-1 rounded bg-app border border-theme-subtle text-xs text-theme-main hover:text-[#1D9BF0] hover:border-[#1D9BF0]/40 transition-colors">
                  JWT Inspector
                </Link>
                <Link to="/tools" className="px-2.5 py-1 rounded bg-app border border-theme-subtle text-xs text-theme-main hover:text-[#1D9BF0] hover:border-[#1D9BF0]/40 transition-colors">
                  Regex Tester
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Editorial Navigation Strip */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mt-16 sm:mt-20 pt-8 border-t border-theme-subtle grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <Link
            to="/tools"
            className="group border-l border-theme-subtle pl-4 space-y-1 hover:border-[#1D9BF0] transition-colors"
          >
            <div className="text-sm font-semibold text-theme-main group-hover:text-[#1D9BF0] transition-colors flex items-center justify-between">
              <span>{t('hero.nav1Title', 'Developer Utilities')}</span>
              <ArrowRight className="w-3.5 h-3.5 text-theme-muted group-hover:text-[#1D9BF0] group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-theme-muted font-normal">{t('hero.nav1Desc', 'Fast, 100% in-browser client utilities')}</p>
          </Link>

          <Link
            to="/guides"
            className="group border-l border-theme-subtle pl-4 space-y-1 hover:border-[#1D9BF0] transition-colors"
          >
            <div className="text-sm font-semibold text-theme-main group-hover:text-[#1D9BF0] transition-colors flex items-center justify-between">
              <span>{t('hero.nav2Title', 'Engineering Guides')}</span>
              <ArrowRight className="w-3.5 h-3.5 text-theme-muted group-hover:text-[#1D9BF0] group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-theme-muted font-normal">{t('hero.nav2Desc', 'Practical developer workflows & architecture')}</p>
          </Link>

          <Link
            to="/projects"
            className="group border-l border-theme-subtle pl-4 space-y-1 hover:border-[#1D9BF0] transition-colors"
          >
            <div className="text-sm font-semibold text-theme-main group-hover:text-[#1D9BF0] transition-colors flex items-center justify-between">
              <span>{t('hero.nav3Title', 'Project Logs')}</span>
              <ArrowRight className="w-3.5 h-3.5 text-theme-muted group-hover:text-[#1D9BF0] group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-theme-muted font-normal">{t('hero.nav3Desc', 'Transparent dev logs & crash postmortems')}</p>
          </Link>

          <Link
            to="/about"
            className="group border-l border-theme-subtle pl-4 space-y-1 hover:border-[#1D9BF0] transition-colors"
          >
            <div className="text-sm font-semibold text-theme-main group-hover:text-[#1D9BF0] transition-colors flex items-center justify-between">
              <span>{t('hero.nav4Title', 'Platform Ethos')}</span>
              <ArrowRight className="w-3.5 h-3.5 text-theme-muted group-hover:text-[#1D9BF0] group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-xs text-theme-muted font-normal">{t('hero.nav4Desc', 'Why we build zero-fluff developer tools')}</p>
          </Link>
        </motion.div>

      </div>
    </section>
  );
};
