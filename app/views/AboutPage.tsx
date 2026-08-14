'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Terminal, ShieldCheck, Code2, Zap } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { SEOHead } from '../components/layout/SEOHead';
import { CTASection } from '../components/sections/CTASection';

export const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  const milestones = [
    { year: t('about.milestone1Year'), title: t('about.milestone1Title'), desc: t('about.milestone1Desc') },
    { year: t('about.milestone2Year'), title: t('about.milestone2Title'), desc: t('about.milestone2Desc') },
    { year: t('about.milestone3Year'), title: t('about.milestone3Title'), desc: t('about.milestone3Desc') },
  ];

  const team = [
    {
      name: t('about.member1Name'),
      role: t('about.member1Role'),
      icon: <ShieldCheck className="w-8 h-8 text-[#1D9BF0]" />,
      bio: t('about.member1Bio'),
    },
    {
      name: t('about.member2Name'),
      role: t('about.member2Role'),
      icon: <Terminal className="w-8 h-8 text-[#1D9BF0]" />,
      bio: t('about.member2Bio'),
    },
    {
      name: t('about.member3Name'),
      role: t('about.member3Role'),
      icon: <Code2 className="w-8 h-8 text-[#1D9BF0]" />,
      bio: t('about.member3Bio'),
    },
  ];

  return (
    <>
      <SEOHead
        title="About C³ MindLoop - 100% Private Client-Side Developer Utilities"
        description="Learn about C³ MindLoop, a modern privacy-first developer utility suite. Engineered for instant, 100% client-side data parsing, formatting, and cryptographic operations with zero server network latency."
        canonical="/about"
      />

      <div className="pt-16 pb-20 bg-app text-theme-main relative z-10 overflow-hidden">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">

          {/* Hero Header */}
          <div className="text-center max-w-4xl mx-auto space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#1D9BF0] font-semibold block">
              {t('about.kicker', 'Engineered for Privacy')}
            </span>
            <h1 className="text-h1 text-theme-main">
              {t('about.title', 'Engineered for Privacy. Built for Developers.')}
            </h1>
            <p className="text-body-large text-theme-muted font-normal max-w-2xl mx-auto">
              {t('about.subtitle', 'A modern privacy-first developer utility suite. Engineered for instant, 100% client-side data parsing, formatting, and cryptographic operations with zero server network latency.')}
            </p>
          </div>

          {/* Brand Meaning Breakdown */}
          <div className="space-y-6 pt-2 border-t border-theme-subtle">
            <div className="space-y-2 mt-8">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-100">
                {t('about.brandSectionTitle', 'Why C³ MindLoop?')}
              </h2>
              <p className="text-body text-theme-muted font-normal max-w-2xl">
                {t('about.brandSectionDesc')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* C³ Card */}
              <div className="bg-neutral-900/80 border border-white/10 rounded-xl p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black font-mono text-[#1D9BF0] leading-none">
                    {t('about.brandC3Label', 'C³')}
                  </h3>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <p className="text-base font-bold text-white">
                  {t('about.brandC3Title', 'Coding. Crashing. Crying.')}
                </p>
                <p className="text-sm text-neutral-400 font-normal leading-relaxed">
                  {t('about.brandC3Desc')}
                </p>
              </div>

              {/* Mind Card */}
              <div className="bg-neutral-900/80 border border-white/10 rounded-xl p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black font-mono text-[#1D9BF0] leading-none">
                    {t('about.brandMindLabel', 'Mind')}
                  </h3>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <p className="text-base font-bold text-white">
                  {t('about.brandMindTitle')}
                </p>
                <p className="text-sm text-neutral-400 font-normal leading-relaxed">
                  {t('about.brandMindDesc')}
                </p>
              </div>

              {/* Loop Card */}
              <div className="bg-neutral-900/80 border border-white/10 rounded-xl p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black font-mono text-[#1D9BF0] leading-none">
                    {t('about.brandLoopLabel', 'Loop')}
                  </h3>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <p className="text-base font-bold text-white">
                  {t('about.brandLoopTitle')}
                </p>
                <p className="text-sm text-neutral-400 font-normal leading-relaxed">
                  {t('about.brandLoopDesc')}
                </p>
              </div>

              {/* Privacy / How we build Card */}
              <div className="bg-neutral-900/80 border border-white/10 rounded-xl p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-semibold text-[#1D9BF0] uppercase tracking-widest">
                    {t('about.brandPrivacyLabel', 'How we build tools')}
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {t('about.brandPrivacyTitle', '100% Local Browser Execution. Zero Server Data Logging.')}
                </h3>
                <p className="text-sm text-neutral-400 font-normal leading-relaxed">
                  {t('about.brandPrivacyDesc')}
                </p>
              </div>

            </div>
          </div>

          {/* Narrative Story */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start pt-12 border-t border-theme-subtle">
            <div className="space-y-4">
              <h2 className="text-h2 text-theme-main font-semibold">{t('about.storyTitle', 'The Mission')}</h2>
              <p className="text-body text-theme-muted font-normal leading-relaxed">
                {t('about.storyP1')}
              </p>
              <p className="text-body text-theme-muted font-normal leading-relaxed">
                {t('about.storyP2')}
              </p>
            </div>

            {/* Tri-Pillar Matrix - Flattened vertical list */}
            <div className="space-y-6">
              <h3 className="text-h2 text-theme-main font-semibold">
                {t('about.pillarsTitle', 'The C³ Tri-Pillar Matrix')}
              </h3>

              <div className="space-y-6">
                <div className="border-l-2 border-[#1D9BF0] pl-4 space-y-1">
                  <h4 className="text-xs font-mono font-medium text-[#1D9BF0] uppercase tracking-wider">{t('about.p1Name', 'Community (Coding, Crashing, Crying)')}</h4>
                  <p className="text-sm text-theme-muted font-normal">{t('about.p1Desc', 'Empathetic, authentic developer connection where engineers share real mistakes.')}</p>
                </div>

                <div className="border-l-2 border-[#1D9BF0] pl-4 space-y-1">
                  <h4 className="text-xs font-mono font-medium text-[#1D9BF0] uppercase tracking-wider">{t('about.p2Name', 'Creation (Automate, Optimize, Build Smarter)')}</h4>
                  <p className="text-sm text-theme-muted font-normal">{t('about.p2Desc', 'Shipping tools and infrastructure that eradicate developer toil.')}</p>
                </div>

                <div className="border-l-2 border-[#1D9BF0] pl-4 space-y-1">
                  <h4 className="text-xs font-mono font-medium text-[#1D9BF0] uppercase tracking-wider">{t('about.p3Name', 'Continuation (Think, Build, Learn, Repeat)')}</h4>
                  <p className="text-sm text-theme-muted font-normal">{t('about.p3Desc', 'The perpetual feedback loop driving personal mastery and engineering velocity.')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Principles Grid - Editorial Line Dividers */}
          <div className="space-y-8 pt-12 border-t border-theme-subtle">
            <h2 className="text-h1 text-theme-main font-bold">{t('about.valuesTitle', 'Core Values')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border-l border-theme-subtle pl-6 space-y-3">
                <span className="text-xs font-mono text-[#1D9BF0]">{t('about.principle01', '🛡️ 100% Client-Side Sandbox')}</span>
                <h3 className="text-xl font-semibold text-theme-main">{t('about.val1Title')}</h3>
                <p className="text-sm text-theme-muted font-normal leading-relaxed">{t('about.val1Desc')}</p>
              </div>

              <div className="border-l border-theme-subtle pl-6 space-y-3">
                <span className="text-xs font-mono text-[#1D9BF0]">{t('about.principle02', '⚡ Sub-Millisecond Execution')}</span>
                <h3 className="text-xl font-semibold text-theme-main">{t('about.val2Title')}</h3>
                <p className="text-sm text-theme-muted font-normal leading-relaxed">{t('about.val2Desc')}</p>
              </div>

              <div className="border-l border-theme-subtle pl-6 space-y-3">
                <span className="text-xs font-mono text-[#1D9BF0]">{t('about.principle03', '🔓 Open Standard Compliance')}</span>
                <h3 className="text-xl font-semibold text-theme-main">{t('about.val3Title')}</h3>
                <p className="text-sm text-theme-muted font-normal leading-relaxed">{t('about.val3Desc')}</p>
              </div>
            </div>
          </div>

          {/* Timeline - Editorial Vertical Border Items */}
          <div className="space-y-8 pt-12 border-t border-theme-subtle">
            <h2 className="text-h1 text-theme-main font-bold">{t('about.timelineTitle', 'Evolution Timeline')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {milestones.map((m) => (
                <div key={m.year} className="border-l border-theme-subtle pl-6 space-y-2">
                  <span className="text-2xl font-mono font-medium text-[#1D9BF0]">{m.year}</span>
                  <h3 className="text-lg font-semibold text-theme-main">{m.title}</h3>
                  <p className="text-sm text-theme-muted font-normal">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team - Editorial Layout */}
          <div className="space-y-8 pt-12 border-t border-theme-subtle">
            <h2 className="text-h1 text-theme-main font-bold">{t('about.teamTitle', 'Engineering Divisions')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member) => (
                <div key={member.name} className="border-l border-theme-subtle pl-6 space-y-3">
                  <div className="p-2 bg-neutral-900 border border-theme-subtle rounded-lg w-fit">
                    {member.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-theme-main">{member.name}</h3>
                    <p className="text-xs text-[#1D9BF0] font-mono mt-0.5">{member.role}</p>
                  </div>
                  <p className="text-sm text-theme-muted font-normal leading-relaxed">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>

          <CTASection />
        </div>
      </div>
    </>
  );
};
