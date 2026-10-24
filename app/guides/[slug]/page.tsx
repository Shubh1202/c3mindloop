import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedEnglishGuide, getPublishedGuides } from '@/app/lib/constants';
import { BASE_URL } from '@/app/config/seo.config';

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
  return {
    title: titleWithBrand,
    description: guide.metaDescription,
    alternates: { canonical: url },
    openGraph: { title: titleWithBrand, description: guide.metaDescription, url, type: 'article' },
  };
}

/**
 * Renders inline markdown tokens within a text string.
 * Handles: [link](url), `code`, **bold**, _italic_.
 * All tokens are mutually exclusive in this simple implementation.
 */
function renderInlineContent(text: string): React.ReactNode[] {
  // Split on markdown links, backtick code, bold (**…**), and italic (_…_)
  const TOKEN_RE = /(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|_[^_]+_)/g;
  const parts = text.split(TOKEN_RE);
  return parts.map((part, i) => {
    // Markdown link: [text](href)
    if (part.startsWith('[') && part.includes('](')) {
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match) {
        const [, linkText, href] = match;
        return (
          <Link key={i} href={href} className="text-[#1D9BF0] hover:underline font-medium">
            {linkText}
          </Link>
        );
      }
    }
    // Inline code: `code`
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-neutral-900 border border-theme-subtle font-mono text-xs text-sky-300">
          {part.slice(1, -1)}
        </code>
      );
    }
    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i} className="font-semibold text-theme-main">{part.slice(2, -2)}</strong>;
    }
    // Italic: _text_
    if (part.startsWith('_') && part.endsWith('_') && part.length > 2) {
      return <em key={i} className="italic">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function renderGuideBlock(block: string, index: number) {
  const trimmed = block.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('```')) {
    const lines = trimmed.split('\n');
    const firstLine = lines[0];
    const lang = firstLine.replace(/^```/, '').trim();
    const code = lines.slice(1, lines[lines.length - 1].startsWith('```') ? -1 : undefined).join('\n');
    return (
      <div key={index} className="my-5 rounded-lg border border-theme-subtle bg-neutral-950 p-4 font-mono text-xs sm:text-sm text-neutral-200 overflow-x-auto shadow-sm">
        {lang && (
          <div className="text-[10px] uppercase font-mono text-neutral-500 pb-2 mb-2 border-b border-neutral-800">
            {lang}
          </div>
        )}
        <pre className="overflow-x-auto leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  if (trimmed.startsWith('|') && trimmed.includes('\n|')) {
    const lines = trimmed.split('\n').filter((l) => l.trim().startsWith('|'));
    if (lines.length >= 2) {
      const headers = lines[0]
        .split('|')
        .slice(1, -1)
        .map((h) => h.trim());
      const rowLines = lines.slice(2);
      return (
        <div key={index} className="overflow-x-auto my-6 rounded-lg border border-theme-subtle bg-surface">
          <table className="w-full text-left text-xs sm:text-sm font-mono divide-y divide-theme-subtle">
            <thead className="bg-neutral-900/60 text-theme-muted text-[11px] uppercase tracking-wider">
              <tr>
                {headers.map((h, hIdx) => (
                  <th key={hIdx} className="px-4 py-2.5 font-semibold text-theme-main">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle text-theme-muted">
              {rowLines.map((rowLine, rIdx) => {
                const cells = rowLine
                  .split('|')
                  .slice(1, -1)
                  .map((c) => c.trim());
                return (
                  <tr key={rIdx} className="hover:bg-neutral-900/40">
                    {cells.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-2.5">
                        {renderInlineContent(cell)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
  }

  if (trimmed.startsWith('## ')) {
    return (
      <h2 key={index} className="text-xl sm:text-2xl font-bold text-theme-main pt-6 pb-2 border-b border-theme-subtle/50">
        {renderInlineContent(trimmed.replace(/^## /, ''))}
      </h2>
    );
  }

  if (trimmed.startsWith('### ')) {
    return (
      <h3 key={index} className="text-base sm:text-lg font-bold text-theme-main pt-4 pb-1">
        {renderInlineContent(trimmed.replace(/^### /, ''))}
      </h3>
    );
  }

  if (trimmed.startsWith('> ')) {
    return (
      <blockquote key={index} className="border-l-2 border-[#1D9BF0] pl-4 py-2 italic text-theme-muted my-3 bg-neutral-900/40 rounded-r text-sm">
        {renderInlineContent(trimmed.replace(/^> /, ''))}
      </blockquote>
    );
  }

  if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
    const items = trimmed.split('\n').filter((l) => l.trim().startsWith('- ') || l.trim().startsWith('* '));
    return (
      <ul key={index} className="list-disc list-inside space-y-1.5 pl-2 text-theme-muted text-sm sm:text-base my-3 leading-relaxed">
        {items.map((item, iIdx) => (
          <li key={iIdx}>
            {renderInlineContent(item.replace(/^[-*]\s+/, ''))}
          </li>
        ))}
      </ul>
    );
  }

  if (/^\d+\.\s/.test(trimmed)) {
    const items = trimmed.split('\n').filter((l) => /^\d+\.\s/.test(l.trim()));
    return (
      <ol key={index} className="list-decimal list-inside space-y-1.5 pl-2 text-theme-muted text-sm sm:text-base my-3 leading-relaxed">
        {items.map((item, iIdx) => (
          <li key={iIdx}>
            {renderInlineContent(item.replace(/^\d+\.\s+/, ''))}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <p key={index} className="text-body text-theme-muted leading-relaxed whitespace-pre-line">
      {renderInlineContent(trimmed)}
    </p>
  );
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
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.metaDescription,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt ?? guide.publishedAt,
    mainEntityOfPage: url,
  };

  const companion = COMPANION_TOOLS[guide.slug];

  return (
    <main className="pt-16 pb-20 bg-app min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mb-8 text-xs font-mono text-theme-muted" aria-label="Breadcrumb">
          <Link href="/guides" className="hover:text-[#1D9BF0]">Guides</Link>
          <span className="px-2">/</span>
          <span>{guide.title}</span>
        </nav>
        <div className="rounded-xl bg-surface border border-theme-subtle p-6 sm:p-10">
          <p className="text-xs font-mono uppercase tracking-widest text-[#1D9BF0] mb-4">{guide.category}</p>
          <h1 className="text-h1 text-theme-main mb-4">{guide.title}</h1>
          <p className="text-body-large text-theme-muted mb-6">{guide.excerpt}</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {guide.tags.map((tag) => <span key={tag} className="px-2.5 py-1 rounded bg-app border border-theme-subtle text-code text-theme-muted">#{tag}</span>)}
          </div>
          <div className="border-t border-theme-subtle pt-8 space-y-5 text-body text-theme-muted leading-relaxed">
            {guide.content.split('\n\n').map((block, index) => renderGuideBlock(block, index))}
          </div>
          <div className="mt-10 pt-6 border-t border-theme-subtle">
            <div className="p-5 rounded-lg bg-surface border border-theme-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#1D9BF0] font-semibold">
                  Companion Developer Tool
                </span>
                <p className="text-sm font-semibold text-theme-main">
                  {companion ? companion.name : 'Developer Utility'}
                </p>
                <p className="text-xs text-theme-muted leading-relaxed max-w-xl">
                  {companion ? companion.desc : 'Run this workflow client-side with 100% private, local browser processing.'}
                </p>
              </div>
              <Link
                href={guide.toolPath}
                className="px-4 py-2.5 rounded-lg bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white text-xs font-semibold font-mono transition-colors inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
              >
                <span>{companion ? companion.action : 'Open Tool'}</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
