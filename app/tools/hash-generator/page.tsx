import type { Metadata } from 'next';
import { HashGeneratorPage } from '../../views/HashGeneratorPage';
import { seoConfig, hashGeneratorSchema } from '../../config/seo.config';

const { hashGenerator } = seoConfig;

export const metadata: Metadata = {
  title: hashGenerator.title,
  description: hashGenerator.description,
  keywords: hashGenerator.keywords,
  alternates: { canonical: hashGenerator.canonical },
  openGraph: hashGenerator.openGraph,
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hashGeneratorSchema) }}
      />
      <HashGeneratorPage />
    </>
  );
}
