import type { Metadata } from 'next';
import { HomePage } from '../views/HomePage';
import { seoConfig } from '../config/seo.config';

const { home } = seoConfig;

export const metadata: Metadata = {
  title: home.title,
  description: home.description,
  keywords: [...home.keywords],
  alternates: { canonical: home.canonical },
  openGraph: home.openGraph,
  twitter: { card: 'summary_large_image', ...home.twitter },
};

export default function Page() {
  return <HomePage />;
}
