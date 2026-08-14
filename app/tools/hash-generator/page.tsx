import type { Metadata } from 'next';
import { HashGeneratorPage } from '@/app/views/HashGeneratorPage';
import { seoConfig, hashGeneratorSchema } from '../../config/seo.config';

const { hashGenerator } = seoConfig;

const hashGeneratorFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is my input text or file uploaded to a server?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "No, never. C³ MindLoop utilizes your browser's native crypto.subtle API primitives to calculate cryptographic digests directly in your device's memory sandbox. No files or strings ever cross public networks.",
      },
    },
    {
      '@type': 'Question',
      name: 'What hashing algorithms are supported?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "This utility simultaneously computes standard secure cryptographic hash algorithms including SHA-256, SHA-512, and SHA-1 using native WebCrypto, alongside legacy MD5 strings computed locally via clean JavaScript.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can I verify the checksum of large software files?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes, you can upload installers, binaries, or archival files locally. The file reader streams your data chunk-by-chunk directly into the local hashing engine to verify integrity against your expected signature values without crashes.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: 'Hash Generator & Checksum Calculator - Free Online Tool | 100% Private Client-Side',
  description: 'Free, 100% private client-side Hash Generator & Checksum Calculator. Instantly compute SHA-256, SHA-512, SHA-1, and MD5 cryptographic digests locally using the native WebCrypto API.',
  keywords: hashGenerator.keywords,
  alternates: { canonical: hashGenerator.canonical },
  openGraph: {
    ...hashGenerator.openGraph,
    title: 'Hash Generator & Checksum Calculator - Free Online Tool | 100% Private Client-Side',
    description: 'Free, 100% private client-side Hash Generator & Checksum Calculator. Instantly compute SHA-256, SHA-512, SHA-1, and MD5 cryptographic digests locally using the native WebCrypto API.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hash Generator & Checksum Calculator - Free Online Tool | 100% Private Client-Side',
    description: 'Free, 100% private client-side Hash Generator & Checksum Calculator. Instantly compute SHA-256, SHA-512, SHA-1, and MD5 cryptographic digests locally using the native WebCrypto API.',
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hashGeneratorSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hashGeneratorFaqSchema) }}
      />
      <HashGeneratorPage />
    </>
  );
}
