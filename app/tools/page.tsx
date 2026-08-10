import type { Metadata } from 'next';
import { ProductsPage } from './../views/ProductsPage';

export const metadata: Metadata = {
  title: 'Developer Utilities & VS Code Extension',
  description: 'Explore C³ MindLoop Developer Tools: Office Editor VS Code Extension, JSON Formatter, Base64 Encoder, JWT Inspector, Hash Generator, and Regex Tester.',
  alternates: {
    canonical: 'https://c3mindloop.dev/tools',
  },
  openGraph: {
    title: 'Developer Utilities & VS Code Extension | C³ MindLoop',
    description: 'Explore C³ MindLoop Developer Tools: Office Editor VS Code Extension, JSON Formatter, Base64 Encoder, JWT Inspector, Hash Generator, and Regex Tester.',
    url: 'https://c3mindloop.dev/tools',
  },
};

export default function Page() {
  return <ProductsPage />;
}
