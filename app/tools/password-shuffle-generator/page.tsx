import type { Metadata } from 'next';
import { PasswordShuffleGeneratorPage } from '@/app/views/PasswordShuffleGeneratorPage';
import { seoConfig, passwordShuffleGeneratorSchema } from '../../config/seo.config';

const { passwordShuffleGenerator } = seoConfig;

export const metadata: Metadata = {
  title: passwordShuffleGenerator.title,
  description: passwordShuffleGenerator.description,
  keywords: [...passwordShuffleGenerator.keywords],
  alternates: { canonical: passwordShuffleGenerator.canonical },
  openGraph: {
    ...passwordShuffleGenerator.openGraph,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: passwordShuffleGenerator.twitter.title,
    description: passwordShuffleGenerator.twitter.description,
    images: passwordShuffleGenerator.twitter.images,
  },
};

const faqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is this password generator actually secure?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. All randomness comes exclusively from crypto.getRandomValues — the browser\'s CSPRNG seeded by the OS (e.g. /dev/urandom on Linux, BCryptGenRandom on Windows). This is the same entropy source used in TLS handshakes. Math.random() is never called anywhere in the generation logic.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do my passwords get sent to a server?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Never. The entire tool runs inside your browser tab as client-side JavaScript. No password, no list item, and no configuration is transmitted over any network. Nothing is written to localStorage, sessionStorage, cookies, or IndexedDB — state exists only in browser memory for the duration of your session.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does "Exclude Ambiguous Characters" do?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'When enabled, the characters 0 (zero), O (uppercase letter O), l (lowercase letter L), 1 (one), and I (uppercase letter I) are removed from the active character set before generation. This prevents confusion when reading or typing passwords manually, especially in fixed-width fonts.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is password entropy calculated?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Entropy is computed as floor(length × log2(charsetSize)), where charsetSize is the count of unique characters in the active set after applying the Exclude Ambiguous filter. Higher entropy means a larger search space and a harder-to-crack password. The tool displays a real-time strength label: Weak (<40 bits), Fair (40–59 bits), Strong (60–79 bits), or Very Strong (80+ bits).',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the Shuffle Generator work for a single line of text?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'When the input contains only one non-empty line, the tool treats each character as an individual item and shuffles them using the Fisher-Yates algorithm with crypto.getRandomValues. This lets you randomize the characters of a word or short string. For multi-line input, each line is treated as one item and the lines are shuffled.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use this tool offline?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Once the page has loaded, all password generation and shuffle operations work entirely offline. No external libraries are fetched at runtime — only the browser\'s built-in crypto.getRandomValues API is used.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the maximum password length supported?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The tool supports password lengths from 8 to 128 characters inclusive. Values outside this range are automatically clamped — entering 200 will produce a 128-character password, and entering 4 will produce an 8-character password.',
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(passwordShuffleGeneratorSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />
      <PasswordShuffleGeneratorPage />
    </>
  );
}
