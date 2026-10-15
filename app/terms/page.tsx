import type { Metadata } from 'next';
import { LegalPage } from '@/app/views/LegalPage';

import { BASE_URL } from '@/app/config/seo.config';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service and usage guidelines for C³ MindLoop developer tools and services.',
  alternates: {
    canonical: `${BASE_URL}/terms`,
  },
  openGraph: {
    title: 'Terms of Service | C³ MindLoop',
    description: 'Terms of service and usage guidelines for C³ MindLoop developer tools.',
    url: `${BASE_URL}/terms`,
  },
};

export default function Page() {
  return <LegalPage />;
}
