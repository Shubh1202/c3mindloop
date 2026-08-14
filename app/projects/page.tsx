import type { Metadata } from 'next';
import { CommunityPage } from '@/app/views/CommunityPage';

const projectsFaqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How can I submit my production crash story or post-mortem?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can submit your anonymous production post-mortems and key engineering lessons directly via our community GitHub repository PR or the inline submission drawer.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are the workshops and masterclasses free to attend?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, all live C³ MindLoop system design and hackathon sessions are 100% free and open for developers worldwide.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I list my open-source project on C³ MindLoop?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely! We showcase high-impact, privacy-first developer tools and open-source repositories built by our active developer community.',
      },
    },
  ],
};

export const metadata: Metadata = {
  title: 'Open Source Projects & Code Repositories - C³ MindLoop',
  description: 'Explore open-source developer projects, production post-mortems, and live engineering workshops at C³ MindLoop. Share your crash stories and build smarter together.',
  alternates: {
    canonical: 'https://www.c3mindloop.com/projects',
  },
  openGraph: {
    title: 'Open Source Projects & Code Repositories | C³ MindLoop',
    description: 'Explore open-source developer projects, production post-mortems, and live engineering workshops at C³ MindLoop. Share your crash stories and build smarter together.',
    url: 'https://www.c3mindloop.com/projects',
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectsFaqPageSchema) }}
      />
      <CommunityPage />
    </>
  );
}
