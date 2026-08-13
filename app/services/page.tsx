import type { Metadata } from 'next';
import { ServicesPage } from '@/app/views/ServicesPage';

export const metadata: Metadata = {
  title: 'Engineering Services & Architecture Consulting',
  description: 'Partner with C³ MindLoop for custom Web Development, Backend Microservices, SaaS Product Engineering, AI Automation, and API Architecture.',
  alternates: {
    canonical: 'https://www.c3mindloop.com/services',
  },
  openGraph: {
    title: 'Engineering Services & Architecture Consulting | C³ MindLoop',
    description: 'Partner with C³ MindLoop for custom Web Development, Backend Microservices, SaaS Product Engineering, AI Automation, and API Architecture.',
    url: 'https://www.c3mindloop.com/services',
  },
};

export default function Page() {
  return <ServicesPage />;
}
