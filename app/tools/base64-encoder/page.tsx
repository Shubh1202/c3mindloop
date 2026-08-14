import type { Metadata } from 'next';
import { Base64Page } from '@/app/views/Base64Page';
import { seoConfig, base64EncoderSchema } from './../../config/seo.config';

const { base64Encoder } = seoConfig;

const base64FaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Base64 encoding used for?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Base64 encoding is primarily used to transmit binary data (like images, zip files, or binary certificates) over network channels that only reliably support text characters, such as embedding media in HTML/CSS Data URIs or passing Basic Authentication credentials in HTTP headers.",
      },
    },
    {
      '@type': 'Question',
      name: 'Is Base64 encryption?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "No, Base64 is absolutely not encryption. It is a data masking and translation mechanism designed for structural compatibility, not security. Anyone can instantly reverse a Base64 string back to plain text using native tools without any cryptographic keys.",
      },
    },
    {
      '@type': 'Question',
      name: 'Does this Base64 tool send data to servers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "No. C³ MindLoop handles all text and file string evaluations within your local client device using native browser JavaScript APIs (btoa, atob, and FileReader). Your raw configuration logs, files, and credentials never travel across any public network nodes.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: 'Base64 Encoder & Decoder - Free Online Tool | 100% Private Client-Side',
  description: 'Free, 100% private client-side Base64 Encoder & Decoder. Convert text or files to RFC 4648 URL-safe strings or Data URIs locally in your browser with zero server logs.',
  keywords: [...base64Encoder.keywords],
  alternates: { canonical: base64Encoder.canonical },
  openGraph: {
    ...base64Encoder.openGraph,
    title: 'Base64 Encoder & Decoder - Free Online Tool | 100% Private Client-Side',
    description: 'Free, 100% private client-side Base64 Encoder & Decoder. Convert text or files to RFC 4648 URL-safe strings or Data URIs locally in your browser with zero server logs.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Base64 Encoder & Decoder - Free Online Tool | 100% Private Client-Side',
    description: 'Free, 100% private client-side Base64 Encoder & Decoder. Convert text or files to RFC 4648 URL-safe strings or Data URIs locally in your browser with zero server logs.',
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(base64EncoderSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(base64FaqSchema) }}
      />
      <Base64Page />
    </>
  );
}
