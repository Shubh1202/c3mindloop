import type { Metadata } from 'next';
import { LegalPage } from '../../pages/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy — C³ MindLoop',
  description: 'Legal policies and privacy commitment for C³ MindLoop developer tools, browser utilities, and community platforms.',
  alternates: {
    canonical: 'https://c3mindloop.dev/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy — C³ MindLoop',
    description: 'Legal policies and privacy commitment for C³ MindLoop developer tools.',
    url: 'https://c3mindloop.dev/privacy-policy',
  },
};

export default function Page() {
  return <LegalPage />;
}
