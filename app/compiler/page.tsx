import type { Metadata } from 'next';
import { CodeRunnerPage } from '@/app/views/CodeRunnerPage';
import {
  seoConfig,
  codeCompilerSchema,
  codeCompilerFaqSchema,
} from '@/app/config/seo.config';

const { codeCompiler } = seoConfig;

export const metadata: Metadata = {
  title: codeCompiler.title,
  description: codeCompiler.description,
  keywords: [...codeCompiler.keywords],
  alternates: { canonical: codeCompiler.canonical },
  openGraph: {
    ...codeCompiler.openGraph,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    ...codeCompiler.twitter,
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(codeCompilerSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(codeCompilerFaqSchema),
        }}
      />
      <CodeRunnerPage />
    </>
  );
}
