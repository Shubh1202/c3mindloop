import type { Metadata } from 'next';
import { ContactPage } from './../views/ContactPage';

export const metadata: Metadata = {
  title: 'Contact Engineering Team',
  description: 'Get in touch with C³ MindLoop software architects, ask technical questions, or inquire about custom development consulting.',
  alternates: {
    canonical: 'https://c3mindloop.dev/contact',
  },
  openGraph: {
    title: 'Contact Engineering Team | C³ MindLoop',
    description: 'Get in touch with C³ MindLoop software architects.',
    url: 'https://c3mindloop.dev/contact',
  },
};

export default function Page() {
  return <ContactPage />;
}
