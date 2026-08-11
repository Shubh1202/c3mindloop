import type { Metadata } from 'next';
import { AboutPage } from './../views/AboutPage';

export const metadata: Metadata = {
  title: 'About C³ MindLoop - Our Story, Vision & Philosophy',
  description:
    'Learn about C³ MindLoop (CCube) - the team behind free, privacy-first browser developer tools. Our mission: zero-tracking, client-side utilities for every developer.',
  keywords: [
    'about C³ MindLoop', 'about CCube', 'ccube.dev about', 'c3mindloop team',
    'developer tools company', 'privacy first developer tools', 'open source dev tools team',
    'who made ccube dev tools', 'c3mindloop mission',
  ],
  alternates: { canonical: 'https://ccube.dev/about' },
  openGraph: {
    title: 'About C³ MindLoop - Our Story, Vision & Philosophy',
    description:
      'Learn about C³ MindLoop (CCube) - the team behind free, privacy-first browser developer tools.',
    url: 'https://ccube.dev/about',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About C³ MindLoop | CCube',
    description: 'The team behind free, privacy-first browser developer tools.',
  },
};

export default function Page() {
  return <AboutPage />;
}
