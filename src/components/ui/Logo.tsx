import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'horizontal' | 'icon' | 'compact';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'horizontal',
  showTagline = false,
}) => {
  if (variant === 'icon') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
        <img src="/icon.svg" alt="C³ MindLoop Icon" className="w-full h-full object-contain" />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <img src="/icon.svg" alt="C³ MindLoop" className="w-8 h-8 object-contain" />
        <span className="font-bold text-lg tracking-tight text-white font-sans flex items-center gap-1">
          C<sup className="text-xs text-white">3</sup> <span className="text-[#0091FF]">MINDLOOP</span>
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-3">
        {/* Cube Graphic */}
        <div className="relative w-9 h-9 shrink-0">
          <img src="/cube.svg" alt="C³ Cube" loading="eager" className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(0,145,255,0.4)]" />
        </div>

        {/* Text Portion */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-black text-xl tracking-tight text-theme-main font-sans">
              C<sup className="text-xs text-theme-main font-bold">3</sup>
            </span>
            <span className="font-black text-xl tracking-tight text-[#0091FF] font-sans">
              MINDLOOP
            </span>
          </div>
          {showTagline && (
            <span className="text-xs font-bold text-theme-muted tracking-wide font-sans mt-0.5">
              Coding. Crashing. Crying.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
