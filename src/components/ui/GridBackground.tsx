'use client';

import React from 'react';
import { motion } from 'motion/react';

export const GridBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-app select-none transition-colors duration-250">
      {/* Ambient Lighting Accent */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] pointer-events-none opacity-25 dark:opacity-25"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(29, 155, 240, 0.22) 0%, transparent 80%)',
        }}
      />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_0%,#000_70%,transparent_100%)]"
      />

      {/* Floating Watermark C³ MindLoop Cube 1 - Top Right */}
      <motion.div
        animate={{
          y: [0, -12, 0],
          rotate: [12, 14, 12],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-16 -right-12 sm:right-10 w-[280px] sm:w-[420px] h-[280px] sm:h-[420px] opacity-[0.06] pointer-events-none z-0"
      >
        <img
          src="/cube.svg"
          alt=""
          aria-hidden="true"
          loading="eager"
          className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(29,155,240,0.4)]"
        />
      </motion.div>

      {/* Floating Watermark C³ MindLoop Cube 2 - Mid Left */}
      <motion.div
        animate={{
          y: [0, 15, 0],
          rotate: [-12, -10, -12],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute top-[45%] -left-16 sm:left-4 w-[240px] sm:w-[360px] h-[240px] sm:h-[360px] opacity-[0.05] pointer-events-none z-0 hidden sm:block"
      >
        <img
          src="/cube.svg"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(29,155,240,0.3)]"
        />
      </motion.div>
    </div>
  );
};


