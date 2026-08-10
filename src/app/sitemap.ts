import { MetadataRoute } from 'next';
import { BASE_URL } from '../config/seo.config';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/tools',
    '/tools/json-formatter',
    '/products',
    '/guides',
    '/blog',
    '/projects',
    '/community',
    '/about',
    '/services',
    '/contact',
    '/careers',
    '/privacy-policy',
    '/terms',
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/tools' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route.startsWith('/tools') ? 0.9 : 0.7,
  }));
}
