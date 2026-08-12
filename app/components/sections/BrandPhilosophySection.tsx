import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from '../../lib/i18n';
import { ParallaxBannerSection } from '../ui/ParallaxBannerSection';
import { WatermarkBrandLayer } from '../ui/WatermarkBrandLayer';

export const BrandPhilosophySection: React.FC = () => {
  const { t } = useTranslation();

  const phases = [
    {
      id: 'think',
      phase: '01',
      title: 'THINK',
      subtitle: 'Deconstruct & Architecture',
      desc: 'Analyze system bottlenecks, map execution flows, and conceive resilient clean architecture before writing code.'
    },
    {
      id: 'build',
      phase: '02',
      title: 'BUILD',
      subtitle: 'Type-Safe Execution',
      desc: 'Ship robust software. Use modern developer tooling, automated AST validation, and high-scale cloud patterns.'
    },
    {
      id: 'learn',
      phase: '03',
      title: 'LEARN',
      subtitle: 'Post-Mortem & Insight',
      desc: 'Extract wisdom from crashes, production edge cases, and unexpected failures. Engineering craft is forged through friction.'
    },
    {
      id: 'loop',
      phase: '04',
      title: 'LOOP',
      subtitle: 'Continuous Refactoring',
      desc: 'Feed real-world runtime telemetry directly back into the next engineering iteration for compound velocity.'
    }
  ];

  return (
    <ParallaxBannerSection
      bgImage="/banner.jpg"
      overlayClass="bg-black/60 dark:bg-neutral-950/50 dark:backdrop-brightness-75"
      className="relative overflow-hidden"
    >
      {/* Subtle Rotating Cube Watermark */}
      <WatermarkBrandLayer position="top-right" size={450} opacityClass="opacity-[0.15] dark:opacity-[0.25]" />

      {/* 2-Column Editorial Header with Right Panel Code Snippet Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-12 relative z-10">

        {/* Left Column: Title & Subtitle */}
        <div className="lg:col-span-7 space-y-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#1D9BF0] font-semibold block">
            {t('philosophySection.kicker', 'Brand Philosophy')}
          </span>
          <h2 className="text-h1 text-white font-bold">
            {t('philosophySection.title', 'Engineering Philosophy')}
          </h2>
          <p className="text-body-large text-theme-muted font-normal leading-relaxed">
            {t('philosophySection.subtitle', 'Respecting the raw, iterative cycle that every software engineer lives through every day.')}
          </p>

          {/* Dual Ethos Rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-white/10">
            <div className="space-y-2 border-l-2 border-[#1D9BF0] pl-4">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-medium block">
                {t('philosophySection.communityCardTitle', 'Developer Culture')}
              </span>
              <div className="text-base font-semibold text-white tracking-tight">
                {t('philosophySection.communityCardQuote', '"Coding. Crashing. Crying."')}
              </div>
              <p className="text-body-small text-theme-muted font-normal leading-relaxed">
                {t('philosophySection.communityCardDesc', 'The unvarnished reality of software engineering. Writing code, encountering production crashes, debugging late into the night - and turning those lessons into craft.')}
              </p>
            </div>

            <div className="space-y-2 border-l-2 border-[#1D9BF0] pl-4">
              <span className="text-xs font-mono uppercase tracking-widest text-theme-muted font-medium block">
                {t('philosophySection.productCardTitle', 'Product Philosophy')}
              </span>
              <div className="text-base font-semibold text-[#1D9BF0] tracking-tight">
                {t('philosophySection.productCardQuote', '"Automate. Optimize. Build Smarter."')}
              </div>
              <p className="text-body-small text-theme-muted font-normal leading-relaxed">
                {t('philosophySection.productCardDesc', 'Software that eliminates repetitive developer friction so teams can focus strictly on core architecture and building meaningful products.')}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Dark-Themed Developer Code Snippet Card */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 shadow-2xl space-y-3 font-mono text-xs">
            {/* Window Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 text-neutral-400">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                <span className="ml-2 text-[11px] text-neutral-300 font-semibold">mindloop-philosophy.ts</span>
              </div>
              <span className="text-[10px] text-[#1D9BF0] font-medium bg-[#1D9BF0]/10 px-2 py-0.5 rounded">
                ES2026 Engine
              </span>
            </div>

            {/* Code Block */}
            <pre className="text-neutral-200 text-[11px] leading-relaxed overflow-x-auto p-1">
              <code>{`// Built on Eternal Developer Reality
import { MindLoopEngine } from '@cmindloop/core';

export async function executeContinuousCraft() {
  const engine = new MindLoopEngine({ mode: 'reality' });

  while (engine.hasBugsToSolve()) {
    const spec = await engine.think('Deconstruct System');
    const app  = await engine.build(spec);
    
    if (app.crashes()) {
      const insight = await engine.learn(app.stackTrace);
      engine.loop(insight); // Continuous Velocity
    }
  }
}`}</code>
            </pre>

            {/* Bottom Status Tag */}
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400">
              <span>Local Browser WASM Engine</span>
              <span className="text-emerald-400 font-semibold">✓ 100% Client-Side</span>
            </div>
          </div>
        </div>

      </div>

      {/* Continuous 4-Phase Grid - Clean Vertical Border Dividers */}
      <div className="space-y-6 relative z-10">
        <div className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
          Phase Lifecycle Execution
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-4">
          {phases.map((item, index) => (
            <motion.div
              key={item.id}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              className="border-l border-white/10 pl-5 space-y-3 group hover:border-[#1D9BF0] transition-colors bg-white/5 p-4 rounded-sm backdrop-blur-xs"
            >
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>PHASE {item.phase}</span>
                <span className="text-[#1D9BF0]">STEP {index + 1}/4</span>
              </div>

              <h3 className="text-lg font-semibold text-white group-hover:text-[#1D9BF0] transition-colors tracking-tight">
                {item.title}
              </h3>

              <div className="text-xs font-mono text-[#1D9BF0]">
                {item.subtitle}
              </div>

              <p className="text-xs text-slate-300 font-normal leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </ParallaxBannerSection>
  );
};

