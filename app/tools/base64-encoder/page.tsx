import type { Metadata } from 'next';
import { Base64Page } from './../../views/Base64Page';
import { seoConfig, base64EncoderSchema } from './../../config/seo.config';

const { base64Encoder } = seoConfig;

export const metadata: Metadata = {
  title: base64Encoder.title,
  description: base64Encoder.description,
  keywords: [...base64Encoder.keywords],
  alternates: { canonical: base64Encoder.canonical },
  openGraph: base64Encoder.openGraph,
  twitter: { card: 'summary_large_image', ...base64Encoder.twitter },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(base64EncoderSchema) }}
      />
      <Base64Page />
    </>
  );
}
