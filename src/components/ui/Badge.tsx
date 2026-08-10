import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'live' | 'beta' | 'soon' | 'labs' | 'purple' | 'blue' | 'zinc';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  className,
  dot = true
}) => {
  const variantStyles = {
    live: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs font-medium',
    beta: 'bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs font-medium',
    soon: 'bg-surface text-theme-muted border-theme-subtle text-xs font-medium',
    labs: 'bg-[#1D9BF0]/10 text-[#1D9BF0] border-[#1D9BF0]/25 text-xs font-medium',
    blue: 'bg-[#1D9BF0]/10 text-[#1D9BF0] border-[#1D9BF0]/25 text-xs font-medium',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20 text-xs font-medium',
    zinc: 'bg-surface text-theme-muted border-theme-subtle text-xs font-medium'
  };

  const dotColors = {
    live: 'bg-emerald-400',
    beta: 'bg-amber-400',
    soon: 'bg-zinc-500',
    labs: 'bg-[#1D9BF0]',
    blue: 'bg-[#1D9BF0]',
    purple: 'bg-purple-400',
    zinc: 'bg-zinc-400'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border backdrop-blur-sm tracking-tight',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />
      )}
      {children}
    </span>
  );
};

