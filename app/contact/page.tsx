import type { Metadata } from 'next';
import { ContactPage } from '@/app/views/ContactPage';

export const metadata: Metadata = {
  title: 'Contact Engineering Team',
  description: 'Get in touch with C³ MindLoop software architects, ask technical questions, or inquire about custom development consulting.',
  alternates: {
    canonical: 'https://www.c3mindloop.com/contact',
  },
  openGraph: {
    title: 'Contact Engineering Team | C³ MindLoop',
    description: 'Get in touch with C³ MindLoop software architects.',
    url: 'https://www.c3mindloop.com/contact',
  },
};

export default function Page() {
  return <ContactPage />;
}
