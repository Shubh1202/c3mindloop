'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { I18nProvider } from '../../lib/i18n';
import { ThemeProvider } from '../../lib/theme';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CommandPalette } from './CommandPalette';

// ---------------------------------------------------------------------------
// Decorative / non-critical components: lazy-loaded out of the critical path.
// They carry heavy motion runtime (scroll listeners, infinite animations, WebGL)
// and a large image (banner-bg.jpg ~877 KB). Deferring them keeps the main
// thread free during LCP and removes their JS from the initial parse budget.
// ---------------------------------------------------------------------------
const BackgroundWatermark = dynamic(
  () => import('./BackgroundWatermark').then((m) => m.BackgroundWatermark),
  { ssr: false, loading: () => null }
);

const GridBackground = dynamic(
  () => import('../ui/GridBackground').then((m) => m.GridBackground),
  { ssr: false, loading: () => null }
);

const BrandIntro = dynamic(
  () => import('../ui/BrandIntro').then((m) => m.BrandIntro),
  { ssr: false, loading: () => null }
);

export function AppClientShell({ children }: { children: React.ReactNode }) {
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [forceReplayIntro, setForceReplayIntro] = useState(false);

  const handleReplayIntro = () => {
    setForceReplayIntro(true);
  };

  return (
    <ThemeProvider>
      <I18nProvider>
        {/*
          selection:bg-accent/30 — uses the named CSS utility class instead of
          the arbitrary bracket value bg-[#1D9BF0]/30.
        */}
        <div className="min-h-screen bg-app text-theme-main font-sans selection:bg-accent/30 selection:text-theme-main transition-colors duration-250 print:min-h-0 print:bg-white print:text-neutral-900 print:overflow-visible">
          {/* Scroll-Driven Parallax and Rotating Cube Background Layer */}
          <div className="no-print print:hidden">
            <BackgroundWatermark />
          </div>

          {/* First Load & On-Demand Brand Intro Animation */}
          <div className="no-print print:hidden">
            <BrandIntro
              forceShow={forceReplayIntro}
              onComplete={() => setForceReplayIntro(false)}
            />
          </div>

          {/* Subtle Ambient Background Lighting — pure CSS, no JS cost */}
          <div className="fixed inset-0 pointer-events-none opacity-15 dark:opacity-10 z-0 transition-opacity no-print print:hidden">
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-accent blur-[160px]" />
          </div>

          {/* Global Dynamic Grid Background */}
          <div className="no-print print:hidden">
            <GridBackground />
          </div>

          {/* Navigation Bar - Sticky at top of the viewport on scroll */}
          <div className="sticky top-0 z-50 no-print print:hidden">
            <Navbar
              onOpenCmdPalette={() => setCmdPaletteOpen(true)}
              onReplayIntro={handleReplayIntro}
            />
          </div>

          {/* Page Content */}
          <div className="overflow-x-hidden print:overflow-visible">
            <main id="main-content" className="relative z-10 print:static print:overflow-visible">
              {children}
            </main>

            {/* Site Footer */}
            <div className="no-print print:hidden">
              <Footer onReplayIntro={handleReplayIntro} />
            </div>
          </div>

          {/* Global Search Palette (Cmd+K) */}
          <div className="no-print print:hidden">
            <CommandPalette
              isOpen={cmdPaletteOpen}
              onClose={() => setCmdPaletteOpen(false)}
              onReplayIntro={handleReplayIntro}
            />
          </div>
        </div>
      </I18nProvider>
    </ThemeProvider>
  );
}
