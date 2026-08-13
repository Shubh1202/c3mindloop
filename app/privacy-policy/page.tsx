import type { Metadata } from 'next';
import { LegalPage } from '@/app/views/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy - C³ MindLoop | Zero Data Collection',
  description: 'C³ MindLoop privacy policy. 100% client-side processing, zero data collection, offline developer utilities. Your code never leaves your browser.',
  alternates: {
    canonical: 'https://www.c3mindloop.com/privacy-policy',
  },
  openGraph: {
    title: 'Privacy Policy - C³ MindLoop | Zero Data Collection',
    description: 'C³ MindLoop privacy policy. 100% client-side processing, zero data collection, offline developer utilities.',
    url: 'https://www.c3mindloop.com/privacy-policy',
  },
};

export default function Page() {
  return <LegalPage />;
}
