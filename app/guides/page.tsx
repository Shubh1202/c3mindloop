import type { Metadata } from 'next';
import { BlogPage } from '@/app/views/BlogPage';

export const metadata: Metadata = {
  title: 'Engineering Guides & Masterclasses',
  description: 'In-depth engineering guides, architecture patterns, and technical masterclasses by C³ MindLoop.',
  alternates: {
    canonical: 'https://www.c3mindloop.com/guides',
  },
  openGraph: {
    title: 'Engineering Guides & Masterclasses | C³ MindLoop',
    description: 'In-depth engineering guides, architecture patterns, and technical masterclasses by C³ MindLoop.',
    url: 'https://www.c3mindloop.com/guides',
  },
};

export default function Page() {
  return <BlogPage />;
}
