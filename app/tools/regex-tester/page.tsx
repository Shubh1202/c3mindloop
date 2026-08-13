import type { Metadata } from 'next';
import { RegexTesterPage } from '@/app/views/RegexTesterPage';
import { seoConfig, regexTesterSchema } from '../../config/seo.config';

const { regexTester } = seoConfig;

export const metadata: Metadata = {
  title: regexTester.title,
  description: regexTester.description,
  keywords: regexTester.keywords,
  alternates: { canonical: regexTester.canonical },
  openGraph: regexTester.openGraph,
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(regexTesterSchema) }}
      />
      <RegexTesterPage />
    </>
  );
}
