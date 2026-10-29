'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  Share2, 
  Check, 
  Copy, 
  ExternalLink, 
  BookOpen, 
  Calendar, 
  User 
} from 'lucide-react';
import { PublishedGuide } from '@/app/lib/constants';
import { GuideCard } from './GuideCard';

interface CompanionToolInfo {
  name: string;
  desc: string;
  action: string;
  path?: string;
}

export interface GuideArticleReaderProps {
  guide: PublishedGuide;
  relatedGuides: PublishedGuide[];
  companionTool?: CompanionToolInfo;
}

// Code Block with Interactive Copy Action
const CodeSnippetBlock: React.FC<{ code: string; lang?: string }> = ({ code, lang }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/80 border-b border-neutral-800 text-[11px] font-mono text-neutral-400">
        <span className="uppercase tracking-wider font-semibold text-neutral-300">
          {lang || 'Code Snippet'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer text-xs"
          title="Copy code to clipboard"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-neutral-200 leading-relaxed whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Inline markdown parser: [text](url), `code`, **bold**, _italic_
function renderInlineContent(text: string): React.ReactNode[] {
  const TOKEN_RE = /(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|_[^_]+_)/g;
  const parts = text.split(TOKEN_RE);
  return parts.map((part, i) => {
    // Markdown link
    if (part.startsWith('[') && part.includes('](')) {
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match) {
        const [, linkText, href] = match;
        return (
          <Link key={i} href={href} className="text-accent hover:underline font-medium">
            {linkText}
          </Link>
        );
      }
    }
    // Inline code
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 font-mono text-xs text-sky-300">
          {part.slice(1, -1)}
        </code>
      );
    }
    // Bold
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }
    // Italic
    if (part.startsWith('_') && part.endsWith('_') && part.length > 2) {
      return <em key={i} className="italic text-neutral-300">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

function renderGuideBlock(block: string, index: number) {
  const trimmed = block.trim();
  if (!trimmed) return null;

  // Code block
  if (trimmed.startsWith('```')) {
    const lines = trimmed.split('\n');
    const firstLine = lines[0];
    const lang = firstLine.replace(/^```/, '').trim();
    const code = lines.slice(1, lines[lines.length - 1].startsWith('```') ? -1 : undefined).join('\n');
    return <CodeSnippetBlock key={index} code={code} lang={lang} />;
  }

  // Markdown Table
  if (trimmed.startsWith('|') && trimmed.includes('\n|')) {
    const lines = trimmed.split('\n').filter((l) => l.trim().startsWith('|'));
    if (lines.length >= 2) {
      const headers = lines[0]
        .split('|')
        .slice(1, -1)
        .map((h) => h.trim());
      const rowLines = lines.slice(2);
      return (
        <div key={index} className="overflow-x-auto my-6 rounded-xl border border-neutral-800 bg-neutral-950/60 shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm font-mono divide-y divide-neutral-800">
            <thead className="bg-neutral-900 text-neutral-300 text-[11px] uppercase tracking-wider">
              <tr>
                {headers.map((h, hIdx) => (
                  <th key={hIdx} className="px-4 py-3 font-semibold text-white">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80 text-neutral-300">
              {rowLines.map((rowLine, rIdx) => {
                const cells = rowLine
                  .split('|')
                  .slice(1, -1)
                  .map((c) => c.trim());
                return (
                  <tr key={rIdx} className="hover:bg-neutral-900/40 transition-colors">
                    {cells.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-3 leading-relaxed">
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

  // H2 Header
  if (trimmed.startsWith('## ')) {
    const titleText = trimmed.replace(/^## /, '');
    return (
      <h2 key={index} className="text-xl sm:text-2xl font-bold text-white pt-8 pb-3 border-b border-neutral-800 tracking-tight">
        {renderInlineContent(titleText)}
      </h2>
    );
  }

  // H3 Header
  if (trimmed.startsWith('### ')) {
    return (
      <h3 key={index} className="text-base sm:text-lg font-bold text-neutral-100 pt-5 pb-1">
        {renderInlineContent(trimmed.replace(/^### /, ''))}
      </h3>
    );
  }

  // Blockquote
  if (trimmed.startsWith('> ')) {
    return (
      <blockquote key={index} className="border-l-4 border-accent bg-neutral-900/50 pl-4 py-3 rounded-r-lg italic text-neutral-300 my-4 text-sm sm:text-base leading-relaxed">
        {renderInlineContent(trimmed.replace(/^> /, ''))}
      </blockquote>
    );
  }

  // Bullet list
  if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
    const items = trimmed.split('\n').filter((l) => l.trim().startsWith('- ') || l.trim().startsWith('* '));
    return (
      <ul key={index} className="list-disc list-inside space-y-2 pl-2 text-neutral-300 text-sm sm:text-base my-4 leading-relaxed">
        {items.map((item, iIdx) => (
          <li key={iIdx}>
            {renderInlineContent(item.replace(/^[-*]\s+/, ''))}
          </li>
        ))}
      </ul>
    );
  }

  // Numbered list
  if (/^\d+\.\s/.test(trimmed)) {
    const items = trimmed.split('\n').filter((l) => /^\d+\.\s/.test(l.trim()));
    return (
      <ol key={index} className="list-decimal list-inside space-y-2 pl-2 text-neutral-300 text-sm sm:text-base my-4 leading-relaxed">
        {items.map((item, iIdx) => (
          <li key={iIdx}>
            {renderInlineContent(item.replace(/^\d+\.\s+/, ''))}
          </li>
        ))}
      </ol>
    );
  }

  // Default Paragraph
  return (
    <p key={index} className="text-sm sm:text-base text-neutral-300 leading-relaxed whitespace-pre-line my-4 font-normal">
      {renderInlineContent(trimmed)}
    </p>
  );
}

export const GuideArticleReader: React.FC<GuideArticleReaderProps> = ({
  guide,
  relatedGuides,
  companionTool,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const authorName = guide.authorName || 'C³ Engineering Team';
  const authorRole = guide.authorRole || 'Technical Lead';
  const targetToolPath = companionTool?.path || guide.toolPath;

  return (
    <div className="pt-16 pb-24 bg-app min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Breadcrumb Navigation & Top Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-theme-subtle pb-4">
          <nav className="flex items-center gap-2 text-xs font-mono text-theme-muted" aria-label="Breadcrumb">
            <Link href="/guides" className="hover:text-accent transition-colors flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>All Guides</span>
            </Link>
            <span className="text-neutral-600">/</span>
            <span className="text-accent uppercase tracking-wider">{guide.category}</span>
          </nav>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-theme-subtle hover:border-accent text-xs font-mono text-theme-muted hover:text-theme-main transition-colors cursor-pointer"
            aria-label="Share guide link"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                <span className="text-emerald-400 font-semibold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Share Guide</span>
              </>
            )}
          </button>
        </div>

        {/* Article Reading Container */}
        <article className="w-full rounded-2xl bg-surface border border-theme-subtle p-6 sm:p-10 lg:p-12 shadow-sm space-y-8">
          
          {/* Header Metadata */}
          <header className="space-y-4 border-b border-theme-subtle pb-8">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-accent font-semibold uppercase tracking-widest bg-sky-500/10 px-2.5 py-1 rounded border border-sky-500/20">
                {guide.category}
              </span>
              <span className="text-neutral-500">•</span>
              <span className="flex items-center gap-1 text-theme-muted">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{guide.readTimeMinutes} min read</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
              {guide.title}
            </h1>

            <p className="text-base sm:text-lg text-theme-muted font-normal leading-relaxed">
              {guide.excerpt}
            </p>

            {/* Author / Date Strip */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 text-xs font-mono text-theme-muted">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-sky-400">
                  <User className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="font-semibold text-white">{authorName}</div>
                  <div className="text-[11px] text-neutral-400">{authorRole}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Published: {guide.publishedAt}</span>
                </span>
                {guide.updatedAt && guide.updatedAt !== guide.publishedAt && (
                  <span className="hidden sm:inline">
                    (Updated: {guide.updatedAt})
                  </span>
                )}
              </div>
            </div>

            {/* Tags */}
            {guide.tags && guide.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {guide.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded bg-app border border-theme-subtle text-[11px] font-mono text-theme-muted"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Formatted Guide Article Content */}
          <div className="space-y-4 text-theme-muted text-sm sm:text-base leading-relaxed">
            {guide.content.split('\n\n').map((block, index) => renderGuideBlock(block, index))}
          </div>

          {/* Companion Developer Tool Callout Banner */}
          <section className="pt-8 border-t border-theme-subtle" aria-labelledby="companion-tool-heading">
            <div className="p-6 rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-900/60 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Companion Developer Utility</span>
                </span>
                <h2 id="companion-tool-heading" className="text-base font-semibold text-white">
                  {companionTool ? companionTool.name : 'Browser Developer Utility'}
                </h2>
                <p className="text-xs text-neutral-400 leading-relaxed max-w-xl">
                  {companionTool
                    ? companionTool.desc
                    : 'Execute this engineering workflow locally in your browser with zero server uploads and live peer-to-peer collaboration.'}
                </p>
              </div>

              <Link
                href={targetToolPath}
                className="px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold font-mono transition-colors inline-flex items-center gap-2 shrink-0 self-start sm:self-auto shadow-sm"
              >
                <span>{companionTool ? companionTool.action : 'Launch Utility'}</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </section>

        </article>

        {/* Related Guides Section ("guide is related to each other") */}
        {relatedGuides && relatedGuides.length > 0 && (
          <section className="space-y-6 pt-6" aria-labelledby="related-guides-heading">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-theme-subtle pb-4">
              <div>
                <h2 id="related-guides-heading" className="text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-accent" aria-hidden="true" />
                  <span>Related Engineering Guides</span>
                </h2>
                <p className="text-xs text-theme-muted mt-1">
                  Continue exploring related developer tools, architecture deep-dives, and production best practices.
                </p>
              </div>
              <Link
                href="/guides"
                className="text-xs font-mono text-accent hover:underline flex items-center gap-1 shrink-0"
              >
                <span>View all guides</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedGuides.map((relGuide) => (
                <GuideCard key={relGuide.id} guide={relGuide} compact={true} />
              ))}
            </div>
          </section>
        )}

        {/* Bottom Back Navigation */}
        <div className="text-center pt-8">
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface border border-theme-subtle hover:border-accent text-xs font-medium text-theme-main hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Return to All Engineering Guides</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
