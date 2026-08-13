import type { Metadata } from 'next';
import { BlogPage } from './../views/BlogPage';

export const metadata: Metadata = {
  title: 'Engineering Blog - Developer Guides & Technical Articles',
  description:
    'Technical articles, developer guides and engineering deep-dives from the C³ MindLoop team. Topics: JSON, JWT, web security, React, distributed systems and more.',
  keywords: [
    'developer blog', 'engineering blog', 'technical articles for developers',
    'json tutorial', 'jwt tutorial', 'base64 tutorial', 'web developer guides',
    'react performance articles', 'distributed systems blog', 'C³ MindLoop blog',
    'ccube dev blog', 'c3mindloop engineering',
  ],
  alternates: { canonical: 'https://www.c3mindloop.com/blog' },
  openGraph: {
    title: 'Engineering Blog - Developer Guides & Technical Articles | C³ MindLoop',
    description:
      'Technical articles and developer guides from the C³ MindLoop team. JSON, JWT, web security, React and more.',
    url: 'https://www.c3mindloop.com/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Engineering Blog | C³ MindLoop',
    description: 'Technical articles and developer guides from the C³ MindLoop team.',
  },
};

export default function Page() {
  return <BlogPage />;
}
