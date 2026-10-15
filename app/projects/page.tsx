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
      name: 'What projects and tools are available on C³ MindLoop?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'C³ MindLoop provides practical, privacy-first developer tools and resources.',
      },
    },
  ],
};

export const metadata: Metadata = {
  title: 'Developer Projects & Tools',
  description: 'Explore practical developer tools, project updates, and resources from C³ MindLoop.',
  alternates: {
    canonical: 'https://www.c3mindloop.com/projects',
  },
  openGraph: {
    title: 'Developer Projects & Tools | C³ MindLoop',
    description: 'Explore practical developer tools, project updates, and resources from C³ MindLoop.',
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
