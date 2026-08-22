'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ToolbarRootProps {
  children: React.ReactNode;
  isDark?: boolean;
  isFullScreen?: boolean;
  className?: string;
}

interface ToolbarGroupProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right';
}

interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  iconClassName?: string;
  label?: string;
  active?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  hideTextOnMobile?: boolean;
  isDark?: boolean;
}

export const ToolbarRoot: React.FC<ToolbarRootProps> = ({
  children,
  isDark = true,
  isFullScreen = false,
  className = '',
}) => {
  return (
    <div
      className={`px-2.5 py-2.5 border-b flex flex-nowrap items-center justify-between text-xs font-mono min-w-0 ${
        isDark
          ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
          : 'bg-[#F8F9FA] border-[#E4E4E7] text-[#111111]'
      } ${isFullScreen ? 'sticky top-0 z-[10000]' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export const ToolbarGroup: React.FC<ToolbarGroupProps> = ({
  children,
  className = '',
  align = 'left',
}) => {
  return (
    <div
      className={`flex flex-nowrap items-center gap-1.5 shrink-0 ${
        align === 'right' ? 'ml-auto' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const ToolbarSeparator: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`w-px h-5 bg-neutral-800 mx-0.5 shrink-0 ${className}`} />;
};

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon: Icon,
  iconClassName = '',
  label,
  active = false,
  variant = 'secondary',
  hideTextOnMobile = true,
  isDark = true,
  className = '',
  children,
  disabled,
  ...props
}) => {
  // Common styles
  const baseClass =
    'px-2.5 py-1.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer font-semibold shadow-sm text-xs font-mono disabled:opacity-40 disabled:cursor-not-allowed select-none border border-transparent';

  let variantClass = '';

  if (variant === 'primary') {
    variantClass = active
      ? 'bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white'
      : isDark
      ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
      : 'bg-[#E4E4E7] hover:bg-[#D4D4D8] text-[#3F3F46] hover:text-[#18181B]';
  } else if (variant === 'danger') {
    variantClass = isDark
      ? 'bg-neutral-800/80 hover:bg-red-950 hover:text-red-300 text-neutral-400'
      : 'bg-[#E4E4E7] hover:bg-red-100 hover:text-red-700 text-[#3F3F46]';
  } else if (variant === 'ghost') {
    variantClass = active
      ? 'bg-[#1D9BF0]/20 text-[#1D9BF0] border border-[#1D9BF0]/30'
      : isDark
      ? 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
      : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/50';
  } else {
    // secondary
    variantClass = active
      ? 'bg-[#1D9BF0]/20 text-[#1D9BF0] border border-[#1D9BF0]/30'
      : isDark
      ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
      : 'bg-[#E4E4E7] hover:bg-[#D4D4D8] text-[#3F3F46] hover:text-[#18181B]';
  }

  return (
    <button
      disabled={disabled}
      className={`${baseClass} ${variantClass} ${className}`}
      {...props}
    >
      {Icon && <Icon className={`w-3.5 h-3.5 ${iconClassName}`} />}
      {label && <span className={hideTextOnMobile ? 'hidden sm:inline' : ''}>{label}</span>}
      {children}
    </button>
  );
};

export const Toolbar = {
  Root: ToolbarRoot,
  Group: ToolbarGroup,
  Separator: ToolbarSeparator,
  Button: ToolbarButton,
};
