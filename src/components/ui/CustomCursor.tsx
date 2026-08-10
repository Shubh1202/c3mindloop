'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isOverInteractiveOrText, setIsOverInteractiveOrText] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Raw mouse position
  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  // Target position offset: when over links/buttons/text, offset by 12px to avoid text obstruction
  const targetX = useMotionValue(-100);
  const targetY = useMotionValue(-100);

  // Smooth spring physics for lag-free trailing
  const cursorX = useSpring(targetX, { damping: 28, stiffness: 320, mass: 0.4 });
  const cursorY = useSpring(targetY, { damping: 28, stiffness: 320, mass: 0.4 });

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);

      if (!isVisible) {
        setIsVisible(true);
      }

      const target = e.target as HTMLElement | null;
      let overElement = false;

      if (target) {
        const isClickable = Boolean(
          target.closest('a, button, input, textarea, select, [role="button"], [data-cursor="pointer"], label, summary, nav')
        );
        const isText = Boolean(
          target.closest('p, h1, h2, h3, h4, h5, h6, span, article, blockquote, code, li')
        );
        overElement = isClickable || isText;
      }

      setIsOverInteractiveOrText(overElement);

      // Offset by 12px when hovering text or interactive controls to prevent text obstruction
      if (overElement) {
        targetX.set(e.clientX + 12);
        targetY.set(e.clientY + 12);
      } else {
        targetX.set(e.clientX - 8);
        targetY.set(e.clientY - 8);
      }
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [rawX, rawY, targetX, targetY, isVisible]);

  if (isTouchDevice) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none">
      {/* Compact 16px C³ Cube Cursor Badge */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          willChange: 'transform',
        }}
        animate={{
          opacity: isVisible ? (isOverInteractiveOrText ? 0.3 : 0.85) : 0,
          scale: isPressed ? 0.7 : isOverInteractiveOrText ? 0.5 : 1,
        }}
        transition={{
          scale: { type: 'spring', damping: 25, stiffness: 350 },
          opacity: { duration: 0.15 },
        }}
        className={`fixed top-0 left-0 p-0.5 rounded border transition-colors duration-200 pointer-events-none ${
          isOverInteractiveOrText
            ? 'bg-transparent border-sky-400/40 shadow-none'
            : 'bg-sky-950/40 dark:bg-black/50 border-sky-400/50 shadow-[0_0_8px_rgba(56,189,248,0.25)]'
        }`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 filter drop-shadow-[0_0_4px_rgba(56,189,248,0.6)] block"
        >
          {/* Isometric 3D Cube Geometry */}
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 7v10l10 5V12L2 7z" />
          <path d="M12 12l10-5v10l-10 5V12z" />
        </svg>
      </motion.div>
    </div>
  );
};


