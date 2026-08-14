import type { Metadata } from 'next';
import { CurlConverterPage } from '@/app/views/CurlConverterPage';
import { seoConfig, curlConverterSchema } from './../../config/seo.config';

const { curlConverter } = seoConfig;

const curlConverterFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Which languages are supported for cURL conversion?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'This tool supports 7 major target implementations: JavaScript (Fetch & Axios), Node.js (node-fetch), Python (requests), Go (net/http), and PHP (native cURL & Guzzle).',
      },
    },
    {
      '@type': 'Question',
      name: 'Are API tokens in cURL commands safe?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, 100% safe. The parsing logic is executed entirely inside your browser\'s JavaScript engine. No text strings, tokens, or network headers are ever transmitted to an external server.',
      },
    },
  ],
};

export const metadata: Metadata = {
  title: curlConverter.title,
  description: curlConverter.description,
  keywords: [...curlConverter.keywords],
  alternates: { canonical: curlConverter.canonical },
  openGraph: curlConverter.openGraph,
  twitter: { card: 'summary_large_image', ...curlConverter.twitter },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(curlConverterSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(curlConverterFaqSchema) }}
      />
      <CurlConverterPage />
    </>
  );
}
