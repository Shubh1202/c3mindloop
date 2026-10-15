import type { Metadata } from 'next';
import { ProductsPage } from '@/app/views/ProductsPage';
import { toolsCollectionSchema, BASE_URL } from '@/app/config/seo.config';

export const metadata: Metadata = {
  title: 'Free Developer Utilities - JSON Formatter, JWT Decoder, Base64 Encoder',
  description:
    'Browse all C³ MindLoop free developer tools: JSON Formatter, Base64 Encoder, JWT Decoder and more. 100% client-side, no login, no data collection.',
  keywords: [
    'free developer tools', 'online developer utilities', 'browser developer tools',
    'json formatter online', 'jwt decoder online', 'base64 encoder online',
    'client side developer tools', 'developer tools no login', 'private dev tools',
    'C³ MindLoop tools', 'ccube dev tools', 'c3mindloop utilities',
  ],
  alternates: { canonical: `${BASE_URL}/tools` },
  openGraph: {
    title: 'Free Developer Utilities - JSON, JWT, Base64 | C³ MindLoop',
    description:
      'Browse all C³ MindLoop free developer tools: JSON Formatter, Base64 Encoder, JWT Decoder and more. 100% client-side, no data collection.',
    url: `${BASE_URL}/tools`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Developer Utilities | C³ MindLoop',
    description: 'JSON Formatter, JWT Decoder, Base64 Encoder - all free, 100% client-side.',
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolsCollectionSchema) }}
      />
      <ProductsPage />
    </>
  );
}
