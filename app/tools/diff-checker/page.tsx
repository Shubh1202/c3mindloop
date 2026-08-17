import type { Metadata } from 'next';
import { DiffCheckerPage } from '@/app/views/DiffCheckerPage';
import { seoConfig, diffCheckerSchema } from '../../config/seo.config';

const { diffChecker } = seoConfig;

const diffCheckerFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Does the Diff Checker send my code or text to a server?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. All diff computation runs inside your browser using pure JavaScript. Your text, code, credentials, or configuration files never leave your device. There are no network requests during the diff process.',
      },
    },
    {
      '@type': 'Question',
      name: 'What algorithm does this diff tool use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The tool uses the Myers O(ND) algorithm - the same algorithm used by Git and GNU diff - to produce the shortest possible edit script between two inputs. Character-level highlighting within changed lines also uses Myers applied at the character level.',
      },
    },
    {
      '@type': 'Question',
      name: 'What types of files can I compare?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Any plain-text content: source code in any language, JSON, YAML, TOML, Markdown, log files, configuration files, and plain prose. Binary files are not supported. You can paste text directly or upload files from your filesystem using the Upload button on each panel.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between Split View and Inline View?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Split View shows the original on the left and the modified on the right in two synchronized columns - useful for comparing files side by side. Inline View shows all lines in a single column with removals and additions interleaved, similar to the output of git diff.',
      },
    },
  ],
};

export const metadata: Metadata = {
  title: diffChecker.title,
  description: diffChecker.description,
  keywords: [...diffChecker.keywords],
  alternates: { canonical: diffChecker.canonical },
  openGraph: {
    ...diffChecker.openGraph,
    title: diffChecker.title,
    description: diffChecker.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: diffChecker.twitter.title,
    description: diffChecker.twitter.description,
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(diffCheckerSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(diffCheckerFaqSchema) }}
      />
      <DiffCheckerPage />
    </>
  );
}
