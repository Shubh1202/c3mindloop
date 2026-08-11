import type { Metadata } from 'next';
import { CurlConverterPage } from './../../views/CurlConverterPage';
import { seoConfig, curlConverterSchema } from './../../config/seo.config';

const { curlConverter } = seoConfig;

export const metadata: Metadata = {
  title: curlConverter.title,
  description: curlConverter.description,
  keywords: [...curlConverter.keywords],
  alternates: { canonical: curlConverter.canonical },
  openGraph: curlConverter.openGraph,
  twitter: { card: 'summary_large_image', ...curlConverter.twitter },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(curlConverterSchema) }}
      />
      <CurlConverterPage />
    </>
  );
}
