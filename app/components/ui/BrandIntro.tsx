'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Code2, Brain, Sparkles, X } from 'lucide-react';

interface BrandIntroProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export const BrandIntro: React.FC<BrandIntroProps> = ({ onComplete, forceShow = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Check session storage
    const hasSeen = sessionStorage.getItem('c3_intro_seen');

    if (forceShow) {
      setIsVisible(true);
    } else if (onComplete) {
      onComplete();
    }
  }, [forceShow, onComplete]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    if (prefersReducedMotion) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 500);
      return () => clearTimeout(timer);
    }

    setPhase(1);

    // Precise Timeline Scale (2.2s execution + 0.3s exit transition = 2.5s total max):
    // 0ms – 650ms: Phase 1 ("Coding. Crashing. Crying.")
    // 650ms – 1300ms: Phase 2 ("Future Technology Ecosystem")
    // 1300ms – 2200ms: Phase 3 ("Think. Build. Loop.") & Subtle Hold State
    // 2200ms: Instant finish & 300ms exit fade transition handoff to home page
    const t1 = setTimeout(() => setPhase(2), 650);
    const t2 = setTimeout(() => setPhase(3), 1300);
    const t3 = setTimeout(() => handleDismiss(), 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isVisible, prefersReducedMotion]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onComplete) {
      onComplete();
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030712] text-[#F8FAFC] overflow-hidden select-none font-sans"
      >
        {/* Subtle Ambient Lighting */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(29,155,240,0.18)_0%,rgba(3,7,18,0)_70%)] blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        </div>

        {/* Top Header Actions (Skip & Esc) */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
          <button
            onClick={handleDismiss}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/10 hover:border-[#1D9BF0]/40 transition-colors cursor-pointer shadow-lg"
          >
            <span>Skip Intro</span>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-black/50 rounded border border-white/10 text-slate-400">ESC</kbd>
            <X className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        {/* Main Stage */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-lg mx-auto space-y-8">
          
          {/* 3D Glassmorphic Cube - Smooth 2.2s Rotation Sequence */}
          <div className="w-52 h-52 sm:w-64 sm:h-64 relative perspective-[1200px] flex items-center justify-center">
            <motion.div
              animate={
                prefersReducedMotion
                  ? { rotateY: 0, rotateX: 0 }
                  : {
                      rotateX: [20, 380],
                      rotateY: [0, 360],
                      rotateZ: [0, 0],
                    }
              }
              transition={{
                duration: 2.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ transformStyle: 'preserve-3d' }}
              className="w-32 h-32 sm:w-36 sm:h-36 relative"
            >
              {/* Face 1: Front -> CODE */}
              <div
                style={{ transform: 'translateZ(72px)' }}
                className="absolute inset-0 bg-[#0B0F19]/90 border border-[#1D9BF0]/70 rounded-2xl flex flex-col items-center justify-center p-3 shadow-[0_0_30px_rgba(29,155,240,0.25)] backdrop-blur-xl"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1D9BF0]/10 border border-[#1D9BF0]/30 flex items-center justify-center mb-1.5 shadow-[inset_0_0_12px_rgba(29,155,240,0.2)]">
                  <Code2 className="w-7 h-7 text-[#1D9BF0]" />
                </div>
                <span className="text-[11px] font-mono tracking-widest text-[#1D9BF0] font-bold uppercase">CODE</span>
              </div>

              {/* Face 2: Right -> AI / MIND */}
              <div
                style={{ transform: 'rotateY(90deg) translateZ(72px)' }}
                className="absolute inset-0 bg-[#0B0F19]/90 border border-[#1D9BF0]/70 rounded-2xl flex flex-col items-center justify-center p-3 shadow-[0_0_30px_rgba(29,155,240,0.25)] backdrop-blur-xl"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1D9BF0]/10 border border-[#1D9BF0]/30 flex items-center justify-center mb-1.5 shadow-[inset_0_0_12px_rgba(29,155,240,0.2)]">
                  <Brain className="w-7 h-7 text-[#1D9BF0]" />
                </div>
                <span className="text-[11px] font-mono tracking-widest text-[#1D9BF0] font-bold uppercase">AI / MIND</span>
              </div>

              {/* Face 3: Back -> C³ IDENTITY */}
              <div
                style={{ transform: 'rotateY(180deg) translateZ(72px)' }}
                className="absolute inset-0 bg-[#0B0F19]/90 border border-[#1D9BF0]/70 rounded-2xl flex flex-col items-center justify-center p-3 shadow-[0_0_30px_rgba(29,155,240,0.25)] backdrop-blur-xl"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1D9BF0]/10 border border-[#1D9BF0]/30 flex items-center justify-center mb-1.5 shadow-[inset_0_0_12px_rgba(29,155,240,0.2)]">
                  <span className="text-xl font-black font-mono text-[#1D9BF0]">
                    C³
                  </span>
                </div>
                <span className="text-[11px] font-mono tracking-widest text-[#1D9BF0] font-bold uppercase">IDENTITY</span>
              </div>

              {/* Face 4: Left -> PRODUCTS */}
              <div
                style={{ transform: 'rotateY(-90deg) translateZ(72px)' }}
                className="absolute inset-0 bg-[#0B0F19]/90 border border-[#1D9BF0]/70 rounded-2xl flex flex-col items-center justify-center p-3 shadow-[0_0_30px_rgba(29,155,240,0.25)] backdrop-blur-xl"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1D9BF0]/10 border border-[#1D9BF0]/30 flex items-center justify-center mb-1.5 shadow-[inset_0_0_12px_rgba(29,155,240,0.2)]">
                  <Sparkles className="w-7 h-7 text-[#1D9BF0]" />
                </div>
                <span className="text-[11px] font-mono tracking-widest text-[#1D9BF0] font-bold uppercase">PRODUCTS</span>
              </div>

              {/* Face 5: Top -> CONTINUOUS LOOP */}
              <div
                style={{ transform: 'rotateX(90deg) translateZ(72px)' }}
                className="absolute inset-0 bg-[#0B0F19]/90 border border-[#1D9BF0]/40 rounded-2xl flex items-center justify-center p-2"
              >
                <span className="text-[10px] font-mono text-[#1D9BF0] tracking-widest uppercase font-bold">CONTINUOUS LOOP</span>
              </div>

              {/* Face 6: Bottom -> C³ CORE */}
              <div
                style={{ transform: 'rotateX(-90deg) translateZ(72px)' }}
                className="absolute inset-0 bg-[#0B0F19]/90 border border-[#1D9BF0]/40 rounded-2xl flex items-center justify-center p-2"
              >
                <span className="text-[10px] font-mono text-[#1D9BF0] tracking-widest uppercase font-bold">C³ CORE</span>
              </div>
            </motion.div>
          </div>

          {/* Sequential Taglines Below the Rotating Cube */}
          <div className="space-y-3 min-h-[80px] flex flex-col justify-center items-center">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              C³ MindLoop
            </h1>

            <div className="h-8 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {phase === 1 && (
                  <motion.p
                    key="phase-1"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="text-xs sm:text-sm font-mono tracking-widest uppercase text-slate-300 font-semibold"
                  >
                    Coding. Crashing. Crying.
                  </motion.p>
                )}

                {phase === 2 && (
                  <motion.p
                    key="phase-2"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="text-xs sm:text-sm font-mono tracking-widest uppercase text-[#1D9BF0] font-bold"
                  >
                    Future Technology Ecosystem
                  </motion.p>
                )}

                {phase === 3 && (
                  <motion.div
                    key="phase-3"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center justify-center gap-2.5 font-mono text-xs sm:text-sm tracking-widest uppercase text-[#1D9BF0] font-bold"
                  >
                    <span className="text-white">Think.</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-white">Build.</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-[#1D9BF0]">Loop.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* 2.2s Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden z-20">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.2, ease: 'linear' }}
            className="h-full bg-gradient-to-r from-[#1D9BF0] via-cyan-400 to-[#1D9BF0]"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

