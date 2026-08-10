import type { Metadata } from 'next';
import { CommunityPage } from './../views/CommunityPage';

export const metadata: Metadata = {
  title: 'Open Source Projects & Code Repositories',
  description: 'Explore authentic open source projects and developer utilities built by C³ MindLoop.',
  alternates: {
    canonical: 'https://c3mindloop.dev/projects',
  },
  openGraph: {
    title: 'Open Source Projects & Code Repositories | C³ MindLoop',
    description: 'Explore authentic open source projects and developer utilities built by C³ MindLoop.',
    url: 'https://c3mindloop.dev/projects',
  },
};

export default function Page() {
  return <CommunityPage />;
}
