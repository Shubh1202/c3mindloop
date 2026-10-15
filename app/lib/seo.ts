import { BASE_URL } from '../config/seo.config';

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  type?: 'website' | 'article' | 'product';
  schemaType?: 'Organization' | 'WebSite' | 'BreadcrumbList' | 'Article' | 'SoftwareApplication';
  extraSchema?: object;
}

export const defaultSEO = {
  title: 'C³ MindLoop',
  description: 'Free browser-based developer tools that process data locally.',
  url: BASE_URL,
  ogImage: `${BASE_URL}/logo.svg`,
  siteName: 'C³ MindLoop'
};

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'C³ MindLoop',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.svg`,
    slogan: 'Coding. Crashing. Crying.',
    description: 'Free browser-based developer tools that process data locally.',
    foundingDate: '2025',
    sameAs: [
      'https://twitter.com/c3mindloop'
    ]
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'C³ MindLoop',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/blog?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`
    }))
  };
}

export function generateArticleSchema(article: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  authorName: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    url: `${BASE_URL}${article.url}`,
    datePublished: article.datePublished,
    author: {
      '@type': 'Person',
      name: article.authorName
    },
    publisher: generateOrganizationSchema()
  };
}

export function generateProductSchema(product: {
  name: string;
  description: string;
  category: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: product.name,
    description: product.description,
    applicationCategory: product.category,
    operatingSystem: 'All Web Browsers',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  };
}
