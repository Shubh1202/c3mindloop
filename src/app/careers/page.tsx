import type { Metadata } from 'next';
import { CareersPage } from '../../pages/CareersPage';

export const metadata: Metadata = {
  title: 'Careers — Join C³ MindLoop Engineering',
  description: 'Build the future of developer tools, AI engines, and SaaS products. View open engineering positions at C³ MindLoop.',
  alternates: {
    canonical: 'https://c3mindloop.dev/careers',
  },
  openGraph: {
    title: 'Careers — Join C³ MindLoop Engineering',
    description: 'Build the future of developer tools, AI engines, and SaaS products. View open engineering positions at C³ MindLoop.',
    url: 'https://c3mindloop.dev/careers',
  },
};

export default function Page() {
  return <CareersPage />;
}
