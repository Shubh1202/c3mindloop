import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogPage } from '@/app/views/BlogPage';
import { guideLocales, guidesMetadata, isGuideLocale } from '@/app/config/guides-i18n';

export function generateStaticParams() {
  return guideLocales.filter((locale) => locale !== 'en').map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isGuideLocale(locale) || locale === 'en') return {};
  return guidesMetadata(locale);
}

export default async function LocalizedGuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isGuideLocale(locale) || locale === 'en') notFound();

  return <BlogPage variant="guides" />;
}
