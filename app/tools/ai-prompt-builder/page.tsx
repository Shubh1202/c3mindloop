import type { Metadata } from 'next';
import { AiPromptContextBuilderPage } from '@/app/views/AiPromptContextBuilderPage';
import { seoConfig, aiPromptBuilderSchema } from '../../config/seo.config';

const { aiPromptBuilder } = seoConfig;

export const metadata: Metadata = {
  title: aiPromptBuilder.title,
  description: aiPromptBuilder.description,
  keywords: [...aiPromptBuilder.keywords],
  alternates: { canonical: aiPromptBuilder.canonical },
  openGraph: {
    ...aiPromptBuilder.openGraph,
    title: aiPromptBuilder.title,
    description: aiPromptBuilder.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: aiPromptBuilder.title,
    description: aiPromptBuilder.description,
  },
};

const faqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': [
    {
      '@type': 'Question',
      'name': 'How does the local sanitization engine work?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'The sanitization engine uses native client-side regular expressions to parse and redact sensitive patterns like Bearer tokens, AWS keys, JWTs, IPv4/v6 addresses, database URIs, and API keys. The redaction process happens entirely in your browser memory before output generation.'
      }
    },
    {
      '@type': 'Question',
      'name': 'Are my codebases or secrets sent to any server?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'No, 100% client-side. The tool runs zero backend endpoints or external APIs. All sanitization, templating, and compilation happen completely within your local web browser tab sandbox.'
      }
    }
  ]
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aiPromptBuilderSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />
      <AiPromptContextBuilderPage />
    </>
  );
}
