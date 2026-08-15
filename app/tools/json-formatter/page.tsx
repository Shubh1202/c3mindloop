import type { Metadata } from 'next';
import { JsonFormatterPage } from '@/app/views/JsonFormatterPage';
import { seoConfig, jsonFormatterSchema } from './../../config/seo.config';

const { jsonFormatter } = seoConfig;

export const metadata: Metadata = {
  title: 'JSON Formatter, Validator & AI Smart Repair - Free Online Tool | 100% Private',
  description: 'Free online JSON formatter, validator and minifier with built-in AI Smart Repair. Fixes trailing commas, missing brackets, single quotes, and unquoted keys — 100% client-side, zero server upload.',
  keywords: [...jsonFormatter.keywords],
  alternates: { canonical: jsonFormatter.canonical },
  openGraph: {
    ...jsonFormatter.openGraph,
    title: 'JSON Formatter, Validator & AI Smart Repair — Free | C³ MindLoop',
    description: 'Format, validate, and auto-repair JSON in the browser. AI Smart Repair fixes trailing commas, missing brackets, and more — 100% Private, zero server upload.',
  },
  twitter: {
    card: 'summary_large_image',
    ...jsonFormatter.twitter,
    title: 'JSON Formatter + AI Smart Repair — Free | C³ MindLoop',
    description: 'Format, validate & auto-repair JSON locally. 100% Private, zero server upload. AI Smart Repair runs in-browser.',
  },
};

const faqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': [
    {
      '@type': 'Question',
      'name': 'What is a JSON Formatter and why is it used?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'A JSON Formatter is a utility tool that takes raw, minified, or unformatted JSON strings and converts them into a human-readable format with proper indentation and line breaks.'
      }
    },
    {
      '@type': 'Question',
      'name': 'Is this JSON Formatter secure for sensitive corporate configs and API keys?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'Yes, 100%. Unlike cloud-based SaaS tools, C³ MindLoop runs entirely on client-side processing using your browser\'s V8 engine. No data ever leaves your filesystem or machine.'
      }
    },
    {
      '@type': 'Question',
      'name': 'How does the built-in syntax error detector work?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'The engine tokenizes the inputs in real-time. If it finds a structural issue (like missing brackets or commas), it instantly highlights the exact line location and error type.'
      }
    },
    {
      '@type': 'Question',
      'name': 'Can I use this JSON tool without an active internet connection?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'Absolutely. Since all minification, formatting, and tree-mapping algorithms are written in native client-side JavaScript, the tool functions perfectly offline once the page is loaded.'
      }
    },
    {
      '@type': 'Question',
      'name': 'Why should I choose client-side tools over cloud-based formatters?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'Cloud-based formatters transmit your data over public networks, posing severe security and log leakage risks. Client-side processing ensures complete network isolation and faster parsing with zero overhead.'
      }
    }
  ]
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonFormatterSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />
      <JsonFormatterPage />
    </>
  );
}
