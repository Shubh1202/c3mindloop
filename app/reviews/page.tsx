import type { Metadata } from 'next';
import { ReviewsPage } from '@/app/views/ReviewsPage';

export const metadata: Metadata = {
  title: 'Developer Reviews & Ratings',
  description: 'Read verified developer reviews, community ratings, and user feedback for C³ MindLoop software utilities and developer tools.',
  alternates: {
    canonical: 'https://www.c3mindloop.com/reviews',
  },
  openGraph: {
    title: 'Developer Reviews & Ratings | C³ MindLoop',
    description: 'Read verified developer reviews, ratings, and feedback for C³ MindLoop utilities.',
    url: 'https://www.c3mindloop.com/reviews',
  },
};

export default function Page() {
  return <ReviewsPage />;
}
