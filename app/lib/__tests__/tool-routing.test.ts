import { PRODUCTS_LIST, GUIDES, getPublishedGuides } from '@/app/lib/constants';
import sitemap from '@/app/sitemap';
import fs from 'fs';
import path from 'path';

describe('Tool Routing and Sitemap Verification', () => {
  it('ensures every product in PRODUCTS_LIST maps to a valid route file on disk', () => {
    const toolRouteMap: Record<string, string> = {
      'json-formatter': '/tools/json-formatter',
      'jwt-inspector': '/tools/jwt-inspector',
      'base64-encoder': '/tools/base64-encoder',
      'curl-converter': '/tools/curl-converter',
      'cron-visualizer': '/tools/cron-visualizer',
      'regex-tester': '/tools/regex-tester',
      'regex-railroad': '/tools/regex-railroad-generator',
      'sql-to-json': '/tools/sql-to-json',
      'hash-generator': '/tools/hash-generator',
      'password-shuffle-generator': '/tools/password-shuffle-generator',
      'ats-resume-generator': '/tools/ats-resume-generator',
      'pdf-suite': '/tools/pdf-suite',
      'edit-pdf': '/tools/edit-pdf',
      'ai-prompt-builder': '/tools/ai-prompt-builder',
      'diff-checker': '/tools/diff-checker',
      'json-graph': '/tools/json-graph',
      'code-complexity-analyzer': '/tools/code-complexity-analyzer',
      'pipeline': '/tools/pipeline',
      'node-event-loop-visualizer': '/tools/node-event-loop-visualizer',
      'js-event-loop-visualizer': '/tools/js-event-loop-visualizer',
      'git-visualizer': '/tools/git-visualizer',
      'qr-code-generator': '/tools/qr-code-generator',
      'workflow-builder': '/tools/workflow-builder',
    };

    PRODUCTS_LIST.forEach((product) => {
      const destination = toolRouteMap[product.id];
      expect(destination).toBeDefined();
      expect(destination.startsWith('/tools/')).toBe(true);

      const routeDir = destination.replace('/tools/', '');
      const filePath = path.join(process.cwd(), 'app', 'tools', routeDir, 'page.tsx');
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  it('ensures sitemap does not contain localized guide stubs marked noindex', () => {
    const sitemapEntries = sitemap();
    const urls = sitemapEntries.map((e) => e.url);

    // Confirm that the conflicting stubs are omitted
    expect(urls).not.toContain('https://www.c3mindloop.com/es/guides');
    expect(urls).not.toContain('https://www.c3mindloop.com/de/guides');
    expect(urls).not.toContain('https://www.c3mindloop.com/ja/guides');

    // Confirm core guides are present
    expect(urls).toContain('https://www.c3mindloop.com/guides');
    const published = getPublishedGuides('en');
    published.forEach((guide) => {
      expect(urls).toContain(`https://www.c3mindloop.com/guides/${guide.slug}`);
    });
  });

  it('ensures all published guides link to valid existing tool paths', () => {
    const published = getPublishedGuides('en');
    expect(published.length).toBe(5);
    const slugs = published.map((g) => g.slug);
    expect(slugs).toContain('debug-invalid-jwt-claims');
    expect(slugs).toContain('convert-curl-to-fetch-axios-python');

    published.forEach((guide) => {
      expect(guide.toolPath).toBeDefined();
      expect(guide.toolPath.startsWith('/tools/')).toBe(true);

      const routeDir = guide.toolPath.replace('/tools/', '');
      const filePath = path.join(process.cwd(), 'app', 'tools', routeDir, 'page.tsx');
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  it('validates guide meta descriptions are ≤160 characters and titles are defined', () => {
    const published = getPublishedGuides('en');
    published.forEach((guide) => {
      expect(guide.title.length).toBeGreaterThan(0);
      expect(guide.metaDescription.length).toBeGreaterThan(0);
      expect(guide.metaDescription.length).toBeLessThanOrEqual(160);
    });
  });

  it('validates JWT guide iat claim row does not imply hard enforcement', () => {
    const published = getPublishedGuides('en');
    const jwtGuide = published.find((g) => g.slug === 'debug-invalid-jwt-claims');
    expect(jwtGuide).toBeDefined();
    // The iat row should NOT contain a verification rule expression like currentTime >= iat
    expect(jwtGuide!.content).not.toMatch(/\| `iat`[^|]+\| `currentTime >= iat/);
    // It should contain the word "Informational"
    expect(jwtGuide!.content).toMatch(/Informational/);
  });

  it('validates cURL guide does not promise multipart coverage it does not provide', () => {
    const published = getPublishedGuides('en');
    const curlGuide = published.find((g) => g.slug === 'convert-curl-to-fetch-axios-python');
    expect(curlGuide).toBeDefined();
    // Step 3 should no longer promise "or multipart form data" without qualification
    expect(curlGuide!.content).not.toMatch(/or multipart form data\./);
    // The guide should now contain the --insecure warning
    expect(curlGuide!.content).toMatch(/--insecure.*Never Translate/i);
  });

  it('verifies contextual documentation links point to existing published guides', () => {
    const base64DocsPath = path.join(process.cwd(), 'app', 'components', 'seo', 'docs', 'Base64Docs.tsx');
    const jsonDocsPath = path.join(process.cwd(), 'app', 'components', 'seo', 'docs', 'JsonFormatterDocs.tsx');
    const base64Content = fs.readFileSync(base64DocsPath, 'utf8');
    const jsonContent = fs.readFileSync(jsonDocsPath, 'utf8');

    expect(base64Content).toContain('/guides/debug-invalid-jwt-claims');
    expect(jsonContent).toContain('/guides/convert-curl-to-fetch-axios-python');
  });
});

