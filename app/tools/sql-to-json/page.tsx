import type { Metadata } from 'next';
import { SqlToJsonPage } from '@/app/views/SqlToJsonPage';
import { seoConfig, sqlToJsonSchema } from '../../config/seo.config';

const { sqlToJson } = seoConfig;

export const metadata: Metadata = {
  title: sqlToJson.title,
  description: sqlToJson.description,
  keywords: sqlToJson.keywords,
  alternates: { canonical: sqlToJson.canonical },
  openGraph: sqlToJson.openGraph,
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sqlToJsonSchema) }}
      />
      <SqlToJsonPage />
    </>
  );
}
