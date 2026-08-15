import type { Metadata } from 'next';
import { RegexTesterPage } from '@/app/views/RegexTesterPage';
import { seoConfig, regexTesterSchema } from '../../config/seo.config';

const { regexTester } = seoConfig;

const regexFaqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is this Regex Tester 100% free and private?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, completely free and private. C³ MindLoop runs all RegExp tokenization and pattern testing inside your local device\'s browser window using JavaScript\'s native engine. Your proprietary data strings and patterns never travel over HTTP networks.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which JavaScript Regex engine is used?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'This tool utilizes your browser\'s native ECMAScript RegExp engine (V8 engine in Chrome/Edge, SpiderMonkey in Firefox). It supports standard flags like global (g), case-insensitive (i), and multiline (m).',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I test email, URL, and phone number patterns?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. The interface provides built-in quick presets for standard validations, including RFC-compliant email matching, domain/URL structures, IPv4 addresses, and UUID v4 string schemas.',
      },
    },
  ],
};

export const metadata: Metadata = {
  title: 'Regex Tester, Debugger & AI Pattern Generator - Free Online Tool | 100% Private',
  description: 'Free online Regex Tester with live match highlighting, capture groups, code export, and an AI Pattern Generator. Describe a pattern in plain English — get a battle-tested regex instantly. 100% Private, zero server upload.',
  keywords: regexTester.keywords,
  alternates: { canonical: regexTester.canonical },
  openGraph: {
    ...regexTester.openGraph,
    title: 'Regex Tester, Debugger & AI Pattern Generator — Free | C³ MindLoop',
    description: 'Test regex patterns with live highlighting and capture groups. Describe a pattern in plain English — the AI generator writes it for you. 100% Private, zero server upload.',
  },
  twitter: {
    card: 'summary_large_image',
    ...regexTester.twitter,
    title: 'Regex Tester + AI Pattern Generator — Free | C³ MindLoop',
    description: 'Live regex testing + AI pattern generator from plain English. 100% Private, zero server upload.',
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(regexTesterSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(regexFaqPageSchema) }}
      />
      <RegexTesterPage />
    </>
  );
}
