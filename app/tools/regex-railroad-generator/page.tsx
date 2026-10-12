import type { Metadata } from 'next';
import { RegexRailroadPage } from '@/app/views/RegexRailroadPage';
import { BASE_URL } from '../../config/seo.config';

const canonical = `${BASE_URL}/tools/regex-railroad-generator`;

export const metadata: Metadata = {
  title: 'RegEx Railroad Diagram Generator — Visualize Regex as SVG Flowcharts | C³ MindLoop',
  description:
    'Visualize complex Regular Expressions as clean, intuitive SVG railroad/flowchart syntax diagrams. Live lexer with capture groups, lookaheads, quantifiers, and character class highlighting. 100% client-side, zero server upload.',
  keywords: [
    'regex railroad diagram', 'regex flowchart generator', 'regex visualizer online',
    'regular expression diagram', 'regex syntax diagram', 'regex to svg',
    'regex debugger visualizer', 'regex railroad generator free',
    'visualize regex pattern', 'regex capture group diagram',
    'regex lookahead visualizer', 'regex flowchart online free',
    'client side regex visualizer', 'regex to flowchart browser',
    'railroad diagram generator', 'regex structure visualizer',
    'C³ MindLoop regex tools', 'free regex diagram tool',
  ],
  alternates: { canonical },
  openGraph: {
    type: 'website',
    title: 'RegEx Railroad Diagram Generator — SVG Flowcharts | C³ MindLoop',
    description:
      'Convert any regex pattern into a clean SVG railroad diagram. Highlights capture groups, lookaheads, quantifiers, and character classes. 100% private, client-side.',
    url: canonical,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RegEx Railroad Diagram Generator | C³ MindLoop',
    description:
      'Visualize your regex as an SVG railroad diagram — live, in-browser, zero upload.',
  },
};

const railroadSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'RegEx Railroad Diagram Generator',
  description:
    'Client-side tool that converts Regular Expression patterns into SVG railroad/flowchart syntax diagrams. Highlights capture groups, lookaheads, lookbehinds, quantifiers, and character classes.',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web Browser',
  url: canonical,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is a regex railroad diagram?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A railroad diagram (syntax diagram) is a visual representation of a regular expression as a directed graph. Each token in the pattern becomes a labeled node. Reading the diagram left to right shows exactly what the engine matches at each step.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does this regex visualizer run in the browser?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The lexer, layout engine, and SVG renderer all run inside your browser\'s JavaScript sandbox. No regex pattern or test string is sent to any server.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I export the railroad diagram as SVG?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Click the SVG button in the toolbar to download the current diagram as a standalone SVG file suitable for documentation, pull request comments, or presentations.',
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(railroadSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <RegexRailroadPage />
    </>
  );
}
