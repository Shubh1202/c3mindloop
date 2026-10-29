import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedEnglishGuide, getPublishedGuides, getRelatedGuides } from '@/app/lib/constants';
import { BASE_URL } from '@/app/config/seo.config';
import { GuideArticleReader } from '@/app/components/guides/GuideArticleReader';

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPublishedGuides('en').map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getPublishedEnglishGuide(slug);
  if (!guide) return {};

  const url = `${BASE_URL}/guides/${guide.slug}`;
  const titleWithBrand = `${guide.title} | C³ MindLoop`;
  const authorName = guide.authorName || 'C³ Engineering Team';
  const defaultImage = `${BASE_URL}/logo-cube.png`;

  return {
    title: titleWithBrand,
    description: guide.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: titleWithBrand,
      description: guide.metaDescription,
      url,
      type: 'article',
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt ?? guide.publishedAt,
      authors: [authorName],
      section: guide.category,
      tags: guide.tags,
      images: [
        {
          url: defaultImage,
          width: 1200,
          height: 630,
          alt: guide.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: titleWithBrand,
      description: guide.metaDescription,
      images: [defaultImage],
    },
  };
}

const COMPANION_TOOLS: Record<string, { name: string; desc: string; action: string }> = {
  'format-and-validate-json-in-the-browser': {
    name: 'JSON Formatter & Validator',
    desc: 'Format, validate, repair, and minify JSON payloads in your browser with zero server latency.',
    action: 'Open JSON Formatter',
  },
  'test-regular-expressions-in-the-browser': {
    name: 'Regex Matcher & Syntax Tester',
    desc: 'Test regex patterns, inspect live capture groups, and copy generated code snippets locally.',
    action: 'Open Regex Tester',
  },
  'check-cron-expressions-before-scheduling': {
    name: 'Cron Expression Visualizer & Generator',
    desc: 'Parse 5-part and 6-part cron expressions, review human descriptions, and view upcoming runs.',
    action: 'Open Cron Visualizer',
  },
  'debug-invalid-jwt-claims': {
    name: 'JWT Inspector & Token Debugger',
    desc: 'Decode JWT headers, payload claims, and expiration timestamps locally with zero server transmission.',
    action: 'Open JWT Inspector',
  },
  'convert-curl-to-fetch-axios-python': {
    name: 'cURL to Code Converter',
    desc: 'Convert cURL commands to JavaScript Fetch, Axios, Node.js Fetch, Python Requests, Go net/http, and PHP Guzzle — 100% client-side, zero server upload.',
    action: 'Open cURL Converter',
  },
};

export default async function GuideArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = getPublishedEnglishGuide(slug);
  if (!guide) notFound();

  const url = `${BASE_URL}/guides/${guide.slug}`;
  const authorName = guide.authorName || 'C³ Engineering Team';
  const authorRole = guide.authorRole || 'Technical Lead';
  const logoUrl = `${BASE_URL}/logo-cube.png`;

  // Google Search Central compliant Article Structured Data
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.metaDescription,
    image: [logoUrl],
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt ?? guide.publishedAt,
    author: {
      '@type': 'Person',
      name: authorName,
      jobTitle: authorRole,
    },
    publisher: {
      '@type': 'Organization',
      name: 'C³ MindLoop',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: logoUrl,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    articleSection: guide.category,
    keywords: guide.tags.join(', '),
    inLanguage: 'en',
  };

  // BreadcrumbList Structured Data for Rich Search Results
  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Engineering Guides',
        item: `${BASE_URL}/guides`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: guide.title,
        item: url,
      },
    ],
  };

  const companion = COMPANION_TOOLS[guide.slug];
  const relatedGuides = getRelatedGuides(guide.slug, 'en', 3);

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <GuideArticleReader
        guide={guide}
        relatedGuides={relatedGuides}
        companionTool={companion}
      />
    </main>
  );
}
