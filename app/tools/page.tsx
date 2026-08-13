import type { Metadata } from 'next';
import { ProductsPage } from '@/app/views/ProductsPage';

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
  alternates: { canonical: 'https://www.c3mindloop.com/tools' },
  openGraph: {
    title: 'Free Developer Utilities - JSON, JWT, Base64 | C³ MindLoop',
    description:
      'Browse all C³ MindLoop free developer tools: JSON Formatter, Base64 Encoder, JWT Decoder and more. 100% client-side, no data collection.',
    url: 'https://www.c3mindloop.com/tools',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Developer Utilities | C³ MindLoop',
    description: 'JSON Formatter, JWT Decoder, Base64 Encoder - all free, 100% client-side.',
  },
};

export default function Page() {
  return <ProductsPage />;
}
