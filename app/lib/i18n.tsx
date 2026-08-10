'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SupportedLocale } from '../types';

import en from '../messages/en.json';
import es from '../messages/es.json';
import de from '../messages/de.json';
import ja from '../messages/ja.json';

const translations: Record<SupportedLocale, Record<string, any>> = {
  en,
  es,
  de,
  ja
};

interface I18nContextType {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (keyPath: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<SupportedLocale>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cmindloop_locale') as SupportedLocale;
      if (saved && translations[saved]) {
        setLocaleState(saved);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cmindloop_locale', locale);
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = (newLocale: SupportedLocale) => {
    if (translations[newLocale]) {
      setLocaleState(newLocale);
    }
  };

  const t = (keyPath: string, fallback?: string): string => {
    const keys = keyPath.split('.');
    
    // First try active locale
    let current: any = translations[locale];
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        current = undefined;
        break;
      }
    }

    if (typeof current === 'string') {
      return current;
    }

    // Fallback to English
    current = translations.en;
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        current = undefined;
        break;
      }
    }

    if (typeof current === 'string') {
      return current;
    }

    return fallback || keyPath;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

const defaultI18nContext: I18nContextType = {
  locale: 'en',
  setLocale: () => {},
  t: (key: string) => {
    const keys = key.split('.');
    let value: any = translations['en'];
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    return typeof value === 'string' ? value : key;
  },
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    return defaultI18nContext;
  }
  return context;
};
