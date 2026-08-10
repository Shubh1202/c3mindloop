import type { Metadata } from 'next';
import { BlogPage } from '../../views/BlogPage';

export const metadata: Metadata = {
  title: 'Engineering Guides & Masterclasses',
  description: 'In-depth engineering guides, architecture patterns, and technical masterclasses by C³ MindLoop.',
  alternates: {
    canonical: 'https://c3mindloop.dev/guides',
  },
  openGraph: {
    title: 'Engineering Guides & Masterclasses | C³ MindLoop',
    description: 'In-depth engineering guides, architecture patterns, and technical masterclasses by C³ MindLoop.',
    url: 'https://c3mindloop.dev/guides',
  },
};

export default function Page() {
  return <BlogPage />;
}
