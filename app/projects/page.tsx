import type { Metadata } from 'next';
import { CommunityPage } from '@/app/views/CommunityPage';

export const metadata: Metadata = {
  title: 'Open Source Projects & Code Repositories',
  description: 'Explore authentic open source projects and developer utilities built by C³ MindLoop.',
  alternates: {
    canonical: 'https://www.c3mindloop.com/projects',
  },
  openGraph: {
    title: 'Open Source Projects & Code Repositories | C³ MindLoop',
    description: 'Explore authentic open source projects and developer utilities built by C³ MindLoop.',
    url: 'https://www.c3mindloop.com/projects',
  },
};

export default function Page() {
  return <CommunityPage />;
}
