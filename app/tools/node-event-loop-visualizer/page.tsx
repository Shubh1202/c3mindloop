import type { Metadata } from 'next';
import { NodeEventLoopVisualizerPage } from '../../views/NodeEventLoopVisualizerPage';
import { seoConfig, nodeEventLoopVisualizerSchema } from '../../config/seo.config';

const { nodeEventLoopVisualizer } = seoConfig;

export const metadata: Metadata = {
  title: nodeEventLoopVisualizer.title,
  description: nodeEventLoopVisualizer.description,
  keywords: [...nodeEventLoopVisualizer.keywords],
  alternates: { canonical: nodeEventLoopVisualizer.canonical },
  openGraph: nodeEventLoopVisualizer.openGraph,
  twitter: { card: 'summary_large_image', ...nodeEventLoopVisualizer.twitter },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(nodeEventLoopVisualizerSchema) }}
      />
      <NodeEventLoopVisualizerPage />
    </>
  );
}
