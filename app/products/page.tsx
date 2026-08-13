import type { Metadata } from 'next';
import { ProductsPage } from '@/app/views/ProductsPage';

export const metadata: Metadata = {
  title: 'Products & Tools',
  description: 'Explore C³ MindLoop Developer Tools and VS Code Extensions.',
  alternates: {
    canonical: 'https://www.c3mindloop.com/products',
  },
  openGraph: {
    title: 'Products & Tools | C³ MindLoop',
    description: 'Explore C³ MindLoop Developer Tools and VS Code Extensions.',
    url: 'https://www.c3mindloop.com/products',
  },
};

export default function Page() {
  return <ProductsPage />;
}
