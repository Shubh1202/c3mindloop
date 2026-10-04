'use client';

import React, { useState } from 'react';
import { I18nProvider } from '../../lib/i18n';
import { ThemeProvider } from '../../lib/theme';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CommandPalette } from './CommandPalette';
import { GridBackground } from '../ui/GridBackground';
import { CustomCursor } from '../ui/CustomCursor';
import { BrandIntro } from '../ui/BrandIntro';
import { BackgroundWatermark } from './BackgroundWatermark';

export function AppClientShell({ children }: { children: React.ReactNode }) {
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [forceReplayIntro, setForceReplayIntro] = useState(false);

  const handleReplayIntro = () => {
    setForceReplayIntro(true);
  };

  return (
    <ThemeProvider>
      <I18nProvider>
        <div className="min-h-screen bg-app text-theme-main font-sans selection:bg-[#1D9BF0]/30 selection:text-theme-main transition-colors duration-250 print:min-h-0 print:bg-white print:text-neutral-900 print:overflow-visible">
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

          {/* Subtle Ambient Background Lighting */}
          <div className="fixed inset-0 pointer-events-none opacity-15 dark:opacity-10 z-0 transition-opacity no-print print:hidden">
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#1D9BF0] blur-[160px]" />
          </div>

          {/* Global Dynamic Grid Background */}
          <div className="no-print print:hidden">
            <GridBackground />
          </div>

          {/* Navigation Bar - must be direct child with no overflow ancestor */}
          <div className="no-print print:hidden">
            <Navbar
              onOpenCmdPalette={() => setCmdPaletteOpen(true)}
              onReplayIntro={handleReplayIntro}
            />
          </div>

          {/* Page Content - overflow-x clipped here, below the sticky header */}
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
