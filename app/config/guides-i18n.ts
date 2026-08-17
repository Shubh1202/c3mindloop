import type { Metadata } from 'next';
import type { SupportedLocale } from '@/app/types';
import { GUIDES } from '@/app/lib/constants';

export const guideLocales = ['en', 'es', 'de', 'ja'] as const satisfies readonly SupportedLocale[];

const BASE_URL = 'https://www.c3mindloop.com';

const copy: Record<SupportedLocale, { title: string; description: string; ogLocale: string }> = {
  en: { title: 'Engineering Guides', description: 'Practical notes and references for developer workflows.', ogLocale: 'en_US' },
  es: { title: 'Guías de ingeniería', description: 'Notas y referencias prácticas para flujos de trabajo de desarrollo.', ogLocale: 'es_ES' },
  de: { title: 'Engineering-Leitfäden', description: 'Praktische Notizen und Referenzen für Entwickler-Workflows.', ogLocale: 'de_DE' },
  ja: { title: 'エンジニアリングガイド', description: '開発ワークフローのための実用的なノートとリファレンス。', ogLocale: 'ja_JP' },
};

export function isGuideLocale(locale: string): locale is SupportedLocale {
  return guideLocales.includes(locale as SupportedLocale);
}

export function guidePath(locale: SupportedLocale) {
  return locale === 'en' ? '/guides' : `/${locale}/guides`;
}

function publishedGuides() {
  return GUIDES.filter((guide) => guide.isPublished && guide.translations.en);
}

function hasCompleteTranslation(locale: SupportedLocale) {
  const published = publishedGuides();
  return locale === 'en' || (published.length > 0 && published.every((guide) => guide.translations[locale]));
}

export function guidesMetadata(locale: SupportedLocale): Metadata {
  const published = publishedGuides();
  const hasLocalizedContent = hasCompleteTranslation(locale);
  // A route with any English fallback must not be represented as a translated
  // document. Canonicalize it to the English guide index and omit hreflang.
  const contentLocale = hasLocalizedContent ? locale : 'en';
  const localized = copy[contentLocale];
  const url = `${BASE_URL}${guidePath(contentLocale)}`;
  const indexable = published.length > 0 && hasLocalizedContent;
  const localizedAlternates = Object.fromEntries(
    guideLocales
      .filter((entry) => hasCompleteTranslation(entry))
      .map((entry) => [entry, `${BASE_URL}${guidePath(entry)}`]),
  );

  return {
    title: localized.title,
    description: localized.description,
    robots: { index: indexable, follow: true },
    alternates: {
      canonical: url,
      ...(indexable ? { languages: localizedAlternates } : {}),
    },
    openGraph: { title: localized.title, description: localized.description, url, locale: localized.ogLocale },
  };
}
