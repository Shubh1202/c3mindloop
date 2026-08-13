import type { Metadata } from 'next';
import { CommunityPage } from '@/app/views/CommunityPage';

export const metadata: Metadata = {
  title: 'Global Developer Community & Open Source Projects',
  description: 'Join the C³ MindLoop developer community across GitHub, Discord, and YouTube. Access open-source code repositories and join live engineering hackathons.',
  alternates: {
    canonical: 'https://www.c3mindloop.com/community',
  },
  openGraph: {
    title: 'Global Developer Community & Open Source Projects | C³ MindLoop',
    description: 'Join the C³ MindLoop developer community across GitHub, Discord, and YouTube.',
    url: 'https://www.c3mindloop.com/community',
  },
};

export default function Page() {
  return <CommunityPage />;
}
