import type { Metadata } from 'next';
import { ReviewsPage } from '@/app/views/ReviewsPage';

import initialReviews from '@/app/data/reviews.json';

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

const reviewsSchema = {
  '@context': 'https://schema.org',
  '@type': 'AggregateRating',
  itemReviewed: {
    '@type': 'SoftwareApplication',
    name: 'C³ MindLoop',
    operatingSystem: 'All',
    applicationCategory: 'DeveloperApplication',
  },
  ratingValue: '5.0',
  reviewCount: initialReviews.length.toString(),
  bestRating: '5',
  worstRating: '1',
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsSchema) }}
      />
      <ReviewsPage />
    </>
  );
}
