import type { Metadata } from 'next';
import { PdfSuitePage } from '@/app/views/PdfSuitePage';
import { seoConfig, pdfSuiteSchema } from '../../config/seo.config';

const { pdfSuite } = seoConfig;

export const metadata: Metadata = {
  title: pdfSuite.title,
  description: pdfSuite.description,
  keywords: [...pdfSuite.keywords],
  alternates: { canonical: pdfSuite.canonical },
  openGraph: {
    ...pdfSuite.openGraph,
    title: pdfSuite.title,
    description: pdfSuite.description,
  },
  twitter: {
    card: 'summary_large_image',
    ...pdfSuite.twitter,
    title: pdfSuite.title,
    description: pdfSuite.description,
  },
};

const pdfSuiteFaqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': [
    {
      '@type': 'Question',
      'name': 'Is my document secure when using C³ MindLoop PDF tools?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'Yes, completely. Unlike traditional PDF converters that process files on remote servers, our PDF Suite runs 100% locally in your web browser memory sandbox. Your document never leaves your machine.'
      }
    },
    {
      '@type': 'Question',
      'name': 'What is the difference between basic and strong compression?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'Basic compression strips metadata and structures without loss of quality. Strong compression uses client-side page rendering and re-encodes images at lower resolution/quality for maximum size reduction.'
      }
    }
  ]
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pdfSuiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pdfSuiteFaqPageSchema) }}
      />
      <PdfSuitePage />
    </>
  );
}
