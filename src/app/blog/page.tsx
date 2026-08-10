import type { Metadata } from 'next';
import { BlogPage } from '../../pages/BlogPage';

export const metadata: Metadata = {
  title: 'Engineering Publication & Guides',
  description: 'Deep-dive technical articles on distributed systems, AI agent design, React performance, and engineering craft by the C³ MindLoop team.',
  alternates: {
    canonical: 'https://c3mindloop.dev/blog',
  },
  openGraph: {
    title: 'Engineering Publication & Guides | C³ MindLoop',
    description: 'Deep-dive technical articles on distributed systems, AI agent design, React performance, and engineering craft.',
    url: 'https://c3mindloop.dev/blog',
  },
};

export default function Page() {
  return <BlogPage />;
}
