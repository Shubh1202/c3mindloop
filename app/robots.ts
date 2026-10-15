import { MetadataRoute } from 'next';
import { BASE_URL } from './config/seo.config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /api/ routes are server-only endpoints; /_next/ must be allowed so
        // Bingbot, Applebot and other crawlers can fetch CSS/JS for rendering.
        disallow: ['/api/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
