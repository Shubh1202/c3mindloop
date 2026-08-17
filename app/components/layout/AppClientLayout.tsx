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

export function AppClientLayout({ children }: { children: React.ReactNode }) {
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [forceReplayIntro, setForceReplayIntro] = useState(false);

  const handleReplayIntro = () => {
    setForceReplayIntro(true);
  };

  return (
    <ThemeProvider>
      <I18nProvider>
        <div className="min-h-screen bg-app text-theme-main font-sans selection:bg-[#1D9BF0]/30 selection:text-theme-main relative transition-colors duration-250">
          {/* Scroll-Driven Parallax and Rotating Cube Background Layer */}
          <BackgroundWatermark />

          {/* Interactive Custom Pointer Overlay */}
          {/* <CustomCursor /> */}

          {/* First Load & On-Demand Brand Intro Animation */}
          <BrandIntro
            forceShow={forceReplayIntro}
            onComplete={() => setForceReplayIntro(false)}
          />

          {/* Subtle Ambient Background Lighting */}
          <div className="fixed inset-0 pointer-events-none opacity-15 dark:opacity-10 z-0 transition-opacity">
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#1D9BF0] blur-[160px]" />
          </div>

          {/* Global Dynamic Grid Background */}
          <GridBackground />

          {/* Navigation Bar */}
          <Navbar
            onOpenCmdPalette={() => setCmdPaletteOpen(true)}
            onReplayIntro={handleReplayIntro}
          />

          {/* Page Content */}
          <main className="relative z-10">{children}</main>

          {/* Site Footer */}
          <Footer onReplayIntro={handleReplayIntro} />

          {/* Global Search Palette (Cmd+K) */}
          <CommandPalette
            isOpen={cmdPaletteOpen}
            onClose={() => setCmdPaletteOpen(false)}
            onReplayIntro={handleReplayIntro}
          />
        </div>
      </I18nProvider>
    </ThemeProvider>
  );
}
