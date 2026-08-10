import type { Metadata } from 'next';
import { JwtInspectorPage } from '../../../views/JwtInspectorPage';
import { seoConfig, jwtInspectorSchema } from '../../../config/seo.config';

const { jwtInspector } = seoConfig;

export const metadata: Metadata = {
  title: jwtInspector.title,
  description: jwtInspector.description,
  keywords: [...jwtInspector.keywords],
  alternates: { canonical: jwtInspector.canonical },
  openGraph: jwtInspector.openGraph,
  twitter: { card: 'summary_large_image', ...jwtInspector.twitter },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jwtInspectorSchema) }}
      />
      <JwtInspectorPage />
    </>
  );
}
