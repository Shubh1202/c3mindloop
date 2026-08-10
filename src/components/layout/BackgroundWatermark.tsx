'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

export const BackgroundWatermark: React.FC = () => {
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 1200], [0, -100]);
  const parallaxRotate = useTransform(scrollY, [0, 2000], [0, 30]);
  const bannerY = useTransform(scrollY, [0, 1200], [0, -60]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Parallax Banner Background Image */}
      <motion.div
        style={{ y: bannerY }}
        className="absolute inset-0 w-full h-full"
      >
        <img
          src="/banner-bg.jpg"
          alt=""
          className="w-full h-full object-cover object-center opacity-10 pointer-events-none select-none"
        />
      </motion.div>

      {/* Dark gradient overlay to keep text readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0e0e0e]/80 via-[#0e0e0e]/60 to-[#0e0e0e]/90 pointer-events-none" />

      {/* Radial Ambient Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sky-500/15 blur-[100px] rounded-full pointer-events-none" />

      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Rotating Cube Watermark with Parallax */}
      <motion.div
        style={{ y: parallaxY, rotate: parallaxRotate }}
        className="absolute -right-12 top-1/4 w-[600px] h-[600px] pointer-events-none"
      >
        <img
          src="/cube.svg"
          alt=""
          loading="eager"
          className="w-full h-full object-contain animate-[spin_40s_linear_infinite] opacity-10 pointer-events-none"
        />
      </motion.div>
    </div>
  );
};
