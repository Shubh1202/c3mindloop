'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Check, Copy, Code2, ShieldCheck, Sparkles, RefreshCw, Trash2, Terminal } from 'lucide-react';
import { Link } from '../../lib/router-compat';
import { WatermarkBrandLayer } from '../ui/WatermarkBrandLayer';
import { useTranslation } from '../../lib/i18n';

const CYCLE_WORDS = ['Repeat.', 'Ship.', 'Debug.', 'Iterate.', 'Deploy.'];

export const Hero: React.FC = () => {
  const { t } = useTranslation();
  const defaultSample = `{\n  "platform": "C3 MindLoop",\n  "tagline": "Coding. Crashing. Crying.",\n  "privacy": "100% Client-Side Processing",\n  "version": "2.4.0",\n  "utilities": ["JSON Formatter", "Base64 Tool", "JWT Inspector", "Regex Tester"]\n}`;

  const [jsonInput, setJsonInput] = useState(defaultSample);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string>('Valid JSON • Ready');
  const [wordIdx, setWordIdx] = useState(0);
  const [displayWord, setDisplayWord] = useState(CYCLE_WORDS[0]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIdx, setCharIdx] = useState(CYCLE_WORDS[0].length);

  React.useEffect(() => {
    const full = CYCLE_WORDS[wordIdx];
    const delay = isDeleting ? 60 : charIdx === full.length ? 1800 : 80;
    const timer = setTimeout(() => {
      if (!isDeleting && charIdx === full.length) {
        setIsDeleting(true);
      } else if (isDeleting && charIdx === 0) {
        const next = (wordIdx + 1) % CYCLE_WORDS.length;
        setWordIdx(next);
        setIsDeleting(false);
      } else {
        const next = isDeleting ? charIdx - 1 : charIdx + 1;
        setCharIdx(next);
        setDisplayWord(CYCLE_WORDS[wordIdx].slice(0, next));
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [charIdx, isDeleting, wordIdx]);

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

  // Simple Syntax Highlighter for JSON preview
  const renderHighlightedJson = (rawJson: string) => {
    try {
      const parsed = JSON.parse(rawJson);
      const formatted = JSON.stringify(parsed, null, 2);
      
      // Tokenize JSON for colored rendering
      const tokenRegex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}\[\]:,])/g;
      
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = tokenRegex.exec(formatted)) !== null) {
        const textBefore = formatted.substring(lastIndex, match.index);
        if (textBefore) parts.push(textBefore);

        const token = match[0];
        let className = 'text-neutral-300';

        if (/^"/.test(token)) {
          if (/:$/.test(token)) {
            // JSON Key
            className = 'text-sky-400 font-semibold';
          } else {
            // String Value
            className = 'text-emerald-400';
          }
        } else if (/true|false/.test(token)) {
          // Boolean
          className = 'text-purple-400 font-bold';
        } else if (/null/.test(token)) {
          // Null
          className = 'text-rose-400 font-bold';
        } else if (/^-?\d+/.test(token)) {
          // Number
          className = 'text-amber-400 font-semibold';
        } else if (/[{}[\]]/.test(token)) {
          // Structural Brackets
          className = 'text-zinc-500 font-bold';
        } else if (/[:,]/.test(token)) {
          // Colons & Commas
          className = 'text-zinc-400';
        }

        parts.push(
          <span key={match.index} className={className}>
            {token}
          </span>
        );
        lastIndex = tokenRegex.lastIndex;
      }

      const rest = formatted.substring(lastIndex);
      if (rest) parts.push(rest);

      return parts;
    } catch {
      return rawJson;
    }
  };

  return (
    <section className="relative pt-16 pb-16 sm:pt-20 lg:pt-24 lg:pb-20 bg-transparent border-b border-theme-subtle overflow-hidden">
      {/* Ambient radial glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-cyan-500/10 via-purple-500/5 to-transparent blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-sky-500/8 via-indigo-500/5 to-transparent blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Floating cube watermark */}
      <div className="pointer-events-none absolute top-8 right-8 opacity-[0.07] dark:opacity-[0.12] animate-float" aria-hidden>
        <img src="/cube.svg" alt="" width={220} height={220} />
      </div>

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
                {t('hero.titleStatic', 'Think. Build. Learn. Deploy.')}
              </h1>
              <div className="text-lg sm:text-xl font-mono text-theme-muted flex items-baseline gap-2 pt-2">
                <span>Cycle:</span>
                <span className="text-sky-400 font-semibold inline-flex items-baseline gap-[2px]">
                  {displayWord}
                  <span className="animate-cursor-blink text-sky-300 font-thin">|</span>
                </span>
              </div>
            </motion.div>

            <motion.p
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-body-large text-theme-muted font-normal max-w-xl leading-relaxed"
            >
              {t('hero.description', 'Free, open-source, client-side browser utilities built for daily developer workflows. No tracking, zero server retention - 100% local execution.')}
            </motion.p>

            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 }}
            >
              {/* Terminal prompt - replaces pill badge */}
              <div className="inline-flex items-center gap-1.5 bg-neutral-900/80 border border-neutral-800 rounded-md px-3 py-1.5 font-mono text-xs mb-3">
                <span className="text-emerald-400 select-none">$</span>
                <span className="text-neutral-300">status:</span>
                <span className="text-neutral-100">{t('hero.pill', 'Coding. Crashing. Crying.')}</span>
              </div>

              {/* Plain Text Dev Reality Equation (No Pill, No Slashes) */}
              <div className="font-mono text-xs text-neutral-200 mb-8 flex flex-wrap items-center gap-1.5">
                <span className="text-amber-300 font-semibold">{t('hero.equationA', 'Client Demand')}</span>
                <span className="text-sky-300">+</span>
                <span className="text-amber-300 font-semibold">{t('hero.equationB', 'Boss Pressure')}</span>
                <span className="text-sky-300">+</span>
                <span className="text-amber-300 font-semibold">{t('hero.equationC', 'Code Crash')}</span>
                <span className="text-sky-300">=</span>
                <span className="text-red-400 font-bold">{t('hero.equationResult', 'Programmers Have No Life')}</span>
              </div>
            </motion.div>

            {/* Editorial Text-Link CTAs */}
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-wrap items-center gap-4 sm:gap-8 pt-4 border-t border-theme-subtle"
            >
              <Link
                to="/tools"
                className="btn-shimmer inline-flex items-center gap-2 text-sm font-medium text-theme-main hover:text-sky-400 transition-colors group cursor-pointer"
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
            {/* Utility Card Wrapper with Cyan Glow & VS Code Aesthetics */}
            <div className="animate-glow-pulse bg-neutral-950 border border-sky-500/30 rounded-lg overflow-hidden shadow-[0_0_25px_rgba(56,189,248,0.15)] font-mono text-xs">

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

              {/* Syntax Highlighted Interactive Code Display & Editor Area */}
              <div className="relative group bg-neutral-950">
                <pre className="w-full h-52 p-3.5 overflow-auto text-neutral-200 font-mono text-[11.5px] leading-relaxed whitespace-pre select-text">
                  <code>{renderHighlightedJson(jsonInput)}</code>
                </pre>
                <textarea
                  value={jsonInput}
                  onChange={(e) => {
                    setJsonInput(e.target.value);
                    setError(null);
                    setStatusMsg('Editing...');
                  }}
                  placeholder={t('hero.cardPlaceholder', 'Paste or type JSON here...')}
                  className="absolute inset-0 w-full h-full p-3.5 bg-transparent text-transparent caret-sky-400 font-mono text-[11.5px] leading-relaxed resize-none focus:outline-none selection:bg-[#1D9BF0]/30"
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
            <div className="p-4 rounded-lg bg-neutral-950 border border-theme-subtle space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-300 block font-bold">
                {t('hero.utilitiesLabel', 'Available Browser Utilities')}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/tools/base64-encoder" className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-200 hover:text-white hover:border-emerald-500 hover:bg-neutral-850 transition-all shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Base64 Encoder</span>
                </Link>
                <Link to="/tools/json-formatter" className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-200 hover:text-white hover:border-[#1D9BF0] hover:bg-neutral-850 transition-all shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1D9BF0]"></span>
                  <span>JSON Formatter</span>
                </Link>
                <Link to="/tools/jwt-inspector" className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-200 hover:text-white hover:border-purple-500 hover:bg-neutral-850 transition-all shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  <span>JWT Inspector</span>
                </Link>
                <Link to="/tools/regex-tester" className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-200 hover:text-white hover:border-rose-500 hover:bg-neutral-850 transition-all shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>Regex Tester</span>
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
