import type { Metadata } from 'next';
import { CommunityPage } from '@/app/views/CommunityPage';

export const metadata: Metadata = {
  title: 'Developer Tools & Resources',
  description: 'Discover practical developer tools, resources, and ideas from C³ MindLoop.',
  alternates: {
    canonical: 'https://www.c3mindloop.com/community',
  },
  openGraph: {
    title: 'Developer Tools & Resources | C³ MindLoop',
    description: 'Discover practical developer tools, resources, and ideas from C³ MindLoop.',
    url: 'https://www.c3mindloop.com/community',
  },
};

export default function Page() {
  return <CommunityPage />;
}
