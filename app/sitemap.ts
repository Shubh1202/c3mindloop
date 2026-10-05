import { MetadataRoute } from 'next';
import { BASE_URL } from './config/seo.config';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: { path: string; freq: 'daily' | 'weekly'; priority: number }[] = [
    { path: '',                        freq: 'daily',  priority: 1.0 },
    { path: '/tools',                  freq: 'daily',  priority: 0.95 },
    { path: '/tools/json-formatter',   freq: 'weekly', priority: 0.9 },
    { path: '/tools/office-editor',    freq: 'weekly', priority: 0.9 },
    { path: '/tools/jwt-inspector',    freq: 'weekly', priority: 0.9 },
    { path: '/tools/regex-tester',     freq: 'weekly', priority: 0.9 },
    { path: '/tools/base64-encoder',   freq: 'weekly', priority: 0.9 },
    { path: '/tools/hash-generator',   freq: 'weekly', priority: 0.9 },
    { path: '/tools/sql-to-json',      freq: 'weekly', priority: 0.9 },
    { path: '/tools/cron-visualizer',  freq: 'weekly', priority: 0.9 },
    { path: '/tools/curl-converter',          freq: 'weekly', priority: 0.9 },
    { path: '/tools/ats-resume-generator',    freq: 'weekly', priority: 0.9 },
    { path: '/tools/diff-checker',            freq: 'weekly', priority: 0.9 },
    { path: '/tools/ai-prompt-builder',       freq: 'weekly', priority: 0.9 },
    { path: '/tools/pdf-suite',               freq: 'weekly', priority: 0.9 },
    { path: '/tools/edit-pdf',                freq: 'weekly', priority: 0.9 },
    { path: '/tools/node-event-loop-visualizer', freq: 'weekly', priority: 0.9 },
    { path: '/tools/qr-code-generator',          freq: 'weekly', priority: 0.9 },
    { path: '/blog',                   freq: 'daily',  priority: 0.8 },
    { path: '/guides',                 freq: 'weekly', priority: 0.75 },
    { path: '/about',                  freq: 'weekly', priority: 0.7 },
    { path: '/products',               freq: 'weekly', priority: 0.7 },
    { path: '/projects',               freq: 'weekly', priority: 0.7 },
    { path: '/services',               freq: 'weekly', priority: 0.65 },
    { path: '/community',              freq: 'weekly', priority: 0.65 },
    { path: '/reviews',                freq: 'weekly', priority: 0.65 },
    { path: '/contact',                freq: 'weekly', priority: 0.6 },
    { path: '/careers',                freq: 'weekly', priority: 0.6 },
    { path: '/privacy-policy',         freq: 'weekly', priority: 0.4 },
    { path: '/terms',                  freq: 'weekly', priority: 0.4 },
  ];

  return routes.map(({ path, freq, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: freq,
    priority,
  }));
}
