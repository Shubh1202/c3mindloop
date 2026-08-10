import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  iconPosition = 'right',
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D9BF0]/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-2.5 text-sm sm:text-base gap-2.5 rounded-lg'
  };

  const variantStyles = {
    primary: 'bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white font-semibold shadow-sm hover:shadow-[0_0_20px_rgba(29,155,240,0.3)] border border-sky-400/20 active:scale-[0.98]',
    glow: 'bg-surface text-theme-main border border-[#1D9BF0]/40 hover:border-[#1D9BF0] shadow-sm hover:shadow-[0_0_20px_rgba(29,155,240,0.25)]',
    secondary: 'bg-surface hover:bg-surface/80 text-theme-main border border-theme-subtle font-medium active:scale-[0.98]',
    outline: 'bg-transparent hover:bg-surface text-theme-main border border-theme-subtle hover:border-[#1D9BF0]/50',
    ghost: 'bg-transparent hover:bg-surface text-theme-muted hover:text-theme-main'
  };

  return (
    <motion.button
      whileHover={{ y: disabled ? 0 : -1 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0 transition-transform group-hover:translate-x-0.5">{icon}</span>}
    </motion.button>
  );
};

