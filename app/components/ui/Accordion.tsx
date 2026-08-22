import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface AccordionItemProps {
  id: string;
  title: string;
  content: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  content,
  isOpen = false,
  onToggle
}) => {
  return (
    <div className="border-b border-theme-subtle last:border-0 py-4">
      <button
        onClick={onToggle}
        suppressHydrationWarning
        className="w-full flex items-center justify-between text-left font-semibold text-theme-main hover:text-[#1D9BF0] transition-colors py-2 gap-4 cursor-pointer focus:outline-none"
      >
        <span className="text-base sm:text-lg">{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="p-1.5 rounded-lg bg-app border border-theme-subtle shrink-0"
        >
          <ChevronDown className="w-4 h-4 text-[#1D9BF0]" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pt-2 pb-3 text-theme-muted text-xs sm:text-sm leading-relaxed">
              {content}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
