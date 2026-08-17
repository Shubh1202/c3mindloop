import type { Metadata } from 'next';
import { BlogPage } from './../views/BlogPage';

export const metadata: Metadata = {
  title: 'Engineering Notes',
  description: 'Engineering notes and project updates from C³ MindLoop.',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://www.c3mindloop.com/blog' },
  openGraph: {
    title: 'Engineering Notes | C³ MindLoop',
    description: 'Engineering notes and project updates from C³ MindLoop.',
    url: 'https://www.c3mindloop.com/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Engineering Notes | C³ MindLoop',
    description: 'Engineering notes and project updates from C³ MindLoop.',
  },
};

export default function Page() {
  return <BlogPage />;
}
