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
  return {
    title: guide.title,
    description: guide.metaDescription,
    alternates: { canonical: url },
    openGraph: { title: guide.title, description: guide.metaDescription, url, type: 'article' },
  };
}

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
          <div className="border-t border-theme-subtle pt-8 space-y-5 text-body text-theme-muted leading-relaxed whitespace-pre-line">
            {guide.content.split('\n\n').map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <div className="mt-10 pt-6 border-t border-theme-subtle">
            <Link href={guide.toolPath} className="text-sm font-semibold text-[#1D9BF0] hover:underline">
              Open the related tool
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
