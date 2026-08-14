import type { Metadata } from 'next';
import { SqlToJsonPage } from '@/app/views/SqlToJsonPage';
import { seoConfig, sqlToJsonSchema } from '../../config/seo.config';

const { sqlToJson } = seoConfig;

const sqlToJsonFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is this converter completely free and private?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes, 100% free and private. Since C³ MindLoop runs entirely client-side, your database dumps, table names, sensitive records, or cURL API tokens are processed locally within your browser context and never transmitted over public networks.",
      },
    },
    {
      '@type': 'Question',
      name: 'What types of SQL queries are supported?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "The current engine natively parses standard SQL INSERT INTO table_name (columns) VALUES (...); statements, dynamically mapping values into structural JSON object arrays while handling booleans, numbers, strings, and null bounds.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can it convert cURL headers and request bodies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Absolutely. When switched to cURL mode, the local parser tokenizes terminal strings, capturing -H network headers, methods, and -d or --data-raw request bodies to organize them into a clean JSON API scheme.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: 'SQL & cURL to JSON Converter - Free Online Tool | 100% Private Client-Side',
  description: 'Free, 100% private client-side SQL & cURL to JSON Converter. Instantly convert database SQL dumps or terminal cURL commands into structured JSON objects locally in your browser.',
  keywords: sqlToJson.keywords,
  alternates: { canonical: sqlToJson.canonical },
  openGraph: {
    ...sqlToJson.openGraph,
    title: 'SQL & cURL to JSON Converter - Free Online Tool | 100% Private Client-Side',
    description: 'Free, 100% private client-side SQL & cURL to JSON Converter. Instantly convert database SQL dumps or terminal cURL commands into structured JSON objects locally in your browser.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SQL & cURL to JSON Converter - Free Online Tool | 100% Private Client-Side',
    description: 'Free, 100% private client-side SQL & cURL to JSON Converter. Instantly convert database SQL dumps or terminal cURL commands into structured JSON objects locally in your browser.',
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sqlToJsonSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sqlToJsonFaqSchema) }}
      />
      <SqlToJsonPage />
    </>
  );
}
