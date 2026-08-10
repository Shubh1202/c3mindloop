import React from 'react';

interface ParallaxBannerSectionProps {
  children?: React.ReactNode;
  className?: string;
  bgImage?: string;
  overlayClass?: string;
  kicker?: string;
  title?: string;
  subtitle?: string;
}

export const ParallaxBannerSection: React.FC<ParallaxBannerSectionProps> = ({
  children,
  className = '',
  bgImage = '/banner.jpg',
  overlayClass = 'bg-black/60 dark:bg-neutral-950/50 dark:backdrop-brightness-75',
  kicker,
  title,
  subtitle,
}) => {
  return (
    <section
      className={`relative py-20 lg:py-28 overflow-hidden border-y border-theme-subtle bg-neutral-950 ${className}`}
    >
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />

      {/* High-Contrast Dark Neutral Overlay Layer */}
      <div className={`absolute inset-0 ${overlayClass} backdrop-blur-[2px] transition-opacity pointer-events-none z-0`} />

      {/* Foreground Interactive Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(kicker || title || subtitle) && (
          <div className="max-w-3xl mb-12 space-y-3">
            {kicker && (
              <span className="text-xs font-mono uppercase tracking-widest text-[#1D9BF0] font-semibold block">
                {kicker}
              </span>
            )}
            {title && (
              <h2 className="text-h1 text-white font-bold tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-body-large text-slate-300 font-normal leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {children}
      </div>
    </section>
  );
};
