import type { Metadata } from 'next';
import { ProductsPage } from '../../views/ProductsPage';

export const metadata: Metadata = {
  title: 'Products & Tools',
  description: 'Explore C³ MindLoop Developer Tools and VS Code Extensions.',
  alternates: {
    canonical: 'https://c3mindloop.dev/products',
  },
  openGraph: {
    title: 'Products & Tools | C³ MindLoop',
    description: 'Explore C³ MindLoop Developer Tools and VS Code Extensions.',
    url: 'https://c3mindloop.dev/products',
  },
};

export default function Page() {
  return <ProductsPage />;
}
