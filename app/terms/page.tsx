import type { Metadata } from 'next';
import { LegalPage } from './../views/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Service - C³ MindLoop',
  description: 'Terms of service and usage guidelines for C³ MindLoop developer tools, APIs, and open-source platforms.',
  alternates: {
    canonical: 'https://c3mindloop.dev/terms',
  },
  openGraph: {
    title: 'Terms of Service - C³ MindLoop',
    description: 'Terms of service and usage guidelines for C³ MindLoop developer tools.',
    url: 'https://c3mindloop.dev/terms',
  },
};

export default function Page() {
  return <LegalPage />;
}
