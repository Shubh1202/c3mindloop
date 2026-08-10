import type { Metadata } from 'next';
import { ServicesPage } from '../../pages/ServicesPage';

export const metadata: Metadata = {
  title: 'Engineering Services & Architecture Consulting',
  description: 'Partner with C³ MindLoop for custom Web Development, Backend Microservices, SaaS Product Engineering, AI Automation, and API Architecture.',
  alternates: {
    canonical: 'https://c3mindloop.dev/services',
  },
  openGraph: {
    title: 'Engineering Services & Architecture Consulting | C³ MindLoop',
    description: 'Partner with C³ MindLoop for custom Web Development, Backend Microservices, SaaS Product Engineering, AI Automation, and API Architecture.',
    url: 'https://c3mindloop.dev/services',
  },
};

export default function Page() {
  return <ServicesPage />;
}
