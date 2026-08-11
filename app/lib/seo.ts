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
  title: 'C³ MindLoop - The Ecosystem for Developers, AI & SaaS',
  description: 'MindLoop represents the continuous loop of learning, problem-solving, innovation and building. The future ecosystem for Developer Education, AI, SaaS Products, Automation, and Open Source.',
  url: 'https://cmindloop.com',
  ogImage: '/logo.svg',
  siteName: 'C³ MindLoop'
};

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'C³ MindLoop',
    url: 'https://cmindloop.com',
    logo: '/logo.svg',
    slogan: 'Coding. Crashing. Crying.',
    description: 'The ecosystem for Developer Education, AI, SaaS Products, Automation & Open Source.',
    foundingDate: '2025',
    sameAs: [
      'https://github.com/cmindloop',
      'https://twitter.com/cmindloop',
      'https://youtube.com/@cmindloop',
      'https://discord.gg/cmindloop'
    ]
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'C³ MindLoop',
    url: 'https://cmindloop.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://cmindloop.com/blog?q={search_term_string}',
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
      item: `https://cmindloop.com${item.url}`
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
    url: `https://cmindloop.com${article.url}`,
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
