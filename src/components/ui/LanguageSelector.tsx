'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';
import type { SupportedLocale } from '../../types';

export const LanguageSelector: React.FC = () => {
  const { locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: SupportedLocale; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
  ];

  const activeLang = languages.find((l) => l.code === locale) || languages[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative z-50 pointer-events-auto" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 flex items-center gap-1.5 px-3 rounded-lg bg-neutral-900 border border-white/10 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer relative z-50 pointer-events-auto"
        aria-label="Select Language"
      >
        <Globe className="w-3.5 h-3.5 text-[#1D9BF0]" />
        <span>{activeLang.flag}</span>
        <span className="hidden sm:inline">{activeLang.label}</span>
        <ChevronDown className="w-3 h-3 text-theme-muted" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-xl bg-neutral-900 border border-white/10 shadow-xl py-1.5 z-50 backdrop-blur-xl pointer-events-auto">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setLocale(lang.code);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-white/5 text-neutral-300 hover:text-white transition-colors cursor-pointer pointer-events-auto"
            >
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </div>
              {locale === lang.code && <Check className="w-3.5 h-3.5 text-[#1D9BF0]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

