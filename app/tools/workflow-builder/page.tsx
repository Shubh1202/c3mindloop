import type { Metadata } from 'next';
import { WorkflowBuilderPage } from '../../views/WorkflowBuilderPage';
import { seoConfig, workflowBuilderSchema } from '../../config/seo.config';

const { workflowBuilder } = seoConfig;

export const metadata: Metadata = {
  title: workflowBuilder.title,
  description: workflowBuilder.description,
  keywords: [...workflowBuilder.keywords],
  alternates: { canonical: workflowBuilder.canonical },
  openGraph: workflowBuilder.openGraph,
  twitter: { card: 'summary_large_image', ...workflowBuilder.twitter },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(workflowBuilderSchema) }}
      />
      <WorkflowBuilderPage />
    </>
  );
}
