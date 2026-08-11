import type { Metadata } from 'next';
import { CronVisualizerPage } from './../../views/CronVisualizerPage';
import { seoConfig, cronVisualizerSchema } from './../../config/seo.config';

const { cronVisualizer } = seoConfig;

export const metadata: Metadata = {
  title: cronVisualizer.title,
  description: cronVisualizer.description,
  keywords: [...cronVisualizer.keywords],
  alternates: { canonical: cronVisualizer.canonical },
  openGraph: cronVisualizer.openGraph,
  twitter: { card: 'summary_large_image', ...cronVisualizer.twitter },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cronVisualizerSchema) }}
      />
      <CronVisualizerPage />
    </>
  );
}
