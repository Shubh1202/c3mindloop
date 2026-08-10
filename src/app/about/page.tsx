import type { Metadata } from 'next';
import { AboutPage } from '../../views/AboutPage';

export const metadata: Metadata = {
  title: 'About C³ MindLoop — Our Story, Vision & Philosophy',
  description: 'Learn about C³ MindLoop, the future ecosystem for Developer Education, AI, SaaS Products, Automation, and Open Source.',
  alternates: {
    canonical: 'https://c3mindloop.dev/about',
  },
  openGraph: {
    title: 'About C³ MindLoop — Our Story, Vision & Philosophy',
    description: 'Learn about C³ MindLoop, the future ecosystem for Developer Education, AI, SaaS Products, Automation, and Open Source.',
    url: 'https://c3mindloop.dev/about',
  },
};

export default function Page() {
  return <AboutPage />;
}
