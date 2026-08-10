import type { Metadata } from 'next';
import { JsonFormatterPage } from '../../../views/JsonFormatterPage';
import { seoConfig, jsonFormatterSchema } from '../../../config/seo.config';

const { jsonFormatter } = seoConfig;

export const metadata: Metadata = {
  title: jsonFormatter.title,
  description: jsonFormatter.description,
  keywords: [...jsonFormatter.keywords],
  alternates: { canonical: jsonFormatter.canonical },
  openGraph: jsonFormatter.openGraph,
  twitter: { card: 'summary_large_image', ...jsonFormatter.twitter },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonFormatterSchema) }}
      />
      <JsonFormatterPage />
    </>
  );
}
