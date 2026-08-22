import type { Metadata } from 'next';
import { PipelinePage } from '../../views/PipelinePage';
import { seoConfig, pipelineSchema } from '../../config/seo.config';

const { pipeline } = seoConfig;

export const metadata: Metadata = {
  title: pipeline.title,
  description: pipeline.description,
  keywords: [...pipeline.keywords],
  alternates: { canonical: pipeline.canonical },
  openGraph: pipeline.openGraph,
  twitter: { card: 'summary_large_image', ...pipeline.twitter },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pipelineSchema) }}
      />
      <PipelinePage />
    </>
  );
}
