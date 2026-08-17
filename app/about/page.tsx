import type { Metadata } from 'next';
import { AboutPage } from './../views/AboutPage';

const aboutFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is C³ MindLoop?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'C³ MindLoop is an all-in-one suite of developer utilities designed for speed, accuracy, and absolute data privacy. From JSON formatting to cryptographic hash computations, all operations execute locally within your browser\'s client-side memory sandbox.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does C³ MindLoop ensure data privacy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Unlike traditional cloud tools, C³ MindLoop processes all input text, files, configurations, and API keys completely client-side using native browser APIs like WebCrypto, FileReader, and local Web Workers. Zero byte data is ever uploaded or logged to external servers.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is C³ MindLoop free for commercial and personal development?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, C³ MindLoop is completely free to use for individual software developers, enterprise DevOps engineers, students, and security analysts.',
      },
    },
  ],
};

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'C³ MindLoop',
  url: 'https://www.c3mindloop.com',
  logo: 'https://www.c3mindloop.com/icon.png',
  sameAs: [
  ],
};

export const metadata: Metadata = {
  title: 'About C³ MindLoop - 100% Private Client-Side Developer Utilities',
  description:
    'Learn about C³ MindLoop, a modern privacy-first developer utility suite. Engineered for instant, 100% client-side data parsing, formatting, and cryptographic operations with zero server network latency.',
  keywords: [
    'about C³ MindLoop', 'about CCube', 'ccube.dev about', 'c3mindloop mission',
    'privacy first developer tools', 'browser-based developer tools',
  ],
  alternates: { canonical: 'https://www.c3mindloop.com/about' },
  openGraph: {
    title: 'About C³ MindLoop - 100% Private Client-Side Developer Utilities',
    description:
      'Learn about C³ MindLoop, a modern privacy-first developer utility suite. Engineered for instant, 100% client-side data parsing, formatting, and cryptographic operations with zero server network latency.',
    url: 'https://www.c3mindloop.com/about',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About C³ MindLoop - 100% Private Client-Side Developer Utilities',
    description: 'Learn about C³ MindLoop, a modern privacy-first developer utility suite.',
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutFaqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <AboutPage />
    </>
  );
}
