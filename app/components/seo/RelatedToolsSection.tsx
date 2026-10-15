'use client';

import React from 'react';
import { Link } from '../../lib/router-compat';
import { ArrowRight } from 'lucide-react';

export interface RelatedToolItem {
  id: string;
  name: string;
  description: string;
  href: string;
  category: string;
}

const ALL_TOOLS: Record<string, RelatedToolItem> = {
  'json-formatter': {
    id: 'json-formatter',
    name: 'JSON Formatter & Validator',
    description: 'Format, validate, beautify, and auto-repair JSON payloads locally in browser.',
    href: '/tools/json-formatter',
    category: 'Data Format',
  },
  'curl-converter': {
    id: 'curl-converter',
    name: 'cURL to Code Converter',
    description: 'Convert cURL commands to Python Requests, JavaScript Fetch, Axios, PHP, and Go.',
    href: '/tools/curl-converter',
    category: 'API Utilities',
  },
  'regex-tester': {
    id: 'regex-tester',
    name: 'Regex Tester & Debugger',
    description: 'Test regular expressions with real-time match highlighting and capture groups.',
    href: '/tools/regex-tester',
    category: 'Text & Regex',
  },
  'jwt-inspector': {
    id: 'jwt-inspector',
    name: 'JWT Decoder & Inspector',
    description: 'Decode token headers, payload claims, and verify expiry timestamps safely.',
    href: '/tools/jwt-inspector',
    category: 'Security & Auth',
  },
  'sql-to-json': {
    id: 'sql-to-json',
    name: 'SQL to JSON Converter',
    description: 'Parse SQL INSERT queries and table records into clean JSON object arrays.',
    href: '/tools/sql-to-json',
    category: 'Data Format',
  },
  'hash-generator': {
    id: 'hash-generator',
    name: 'Cryptographic Hash Generator',
    description: 'Compute SHA-256, SHA-512, SHA-1, and MD5 checksums for strings and files.',
    href: '/tools/hash-generator',
    category: 'Cryptography',
  },
  'base64-encoder': {
    id: 'base64-encoder',
    name: 'Base64 Encoder & Decoder',
    description: 'Encode and decode UTF-8 text, URL-safe strings, and file Data URIs locally.',
    href: '/tools/base64-encoder',
    category: 'Encoding',
  },
  'diff-checker': {
    id: 'diff-checker',
    name: 'Code & Text Diff Checker',
    description: 'Compare text and code files side-by-side with line-by-line diff highlighting.',
    href: '/tools/diff-checker',
    category: 'Code Inspection',
  },
  'json-graph': {
    id: 'json-graph',
    name: 'JSON Graph Visualizer',
    description: 'Render interactive 2D node graphs from nested JSON data structures.',
    href: '/tools/json-graph',
    category: 'Visualization',
  },
  'cron-visualizer': {
    id: 'cron-visualizer',
    name: 'Cron Expression Visualizer',
    description: 'Parse 5 and 6-part cron expressions into human-readable schedules.',
    href: '/tools/cron-visualizer',
    category: 'Automation',
  },
  'code-complexity-analyzer': {
    id: 'code-complexity-analyzer',
    name: 'Code Complexity Analyzer',
    description: 'Analyze cyclomatic complexity and maintainability index of code.',
    href: '/tools/code-complexity-analyzer',
    category: 'Code Quality',
  },
  'code-compiler': {
    id: 'code-compiler',
    name: 'Online Code Compiler',
    description: 'Compile and run Python, JavaScript, Java, C, and C++ in a sandboxed IDE.',
    href: '/compiler',
    category: 'Execution',
  },
};

interface RelatedToolsSectionProps {
  currentToolId: string;
  relatedIds?: string[];
  heading?: string;
  subheading?: string;
}

export const RelatedToolsSection: React.FC<RelatedToolsSectionProps> = ({
  currentToolId,
  relatedIds,
  heading = 'Related Developer Utilities',
  subheading = 'Explore complementary 100% client-side tools to accelerate your development workflow.',
}) => {
  let toolsToDisplay: RelatedToolItem[] = [];

  if (relatedIds && relatedIds.length > 0) {
    toolsToDisplay = relatedIds
      .filter((id) => id !== currentToolId && ALL_TOOLS[id])
      .map((id) => ALL_TOOLS[id]);
  } else {
    toolsToDisplay = Object.values(ALL_TOOLS)
      .filter((t) => t.id !== currentToolId)
      .slice(0, 3);
  }

  if (toolsToDisplay.length === 0) {
    return null;
  }

  return (
    <section className="pt-8 border-t border-theme-subtle">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-theme-main tracking-tight">
            {heading}
          </h2>
          <p className="text-xs sm:text-sm text-theme-muted mt-1">
            {subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {toolsToDisplay.map((tool) => (
            <Link
              key={tool.id}
              to={tool.href}
              className="group flex flex-col justify-between p-4 rounded-lg bg-surface border border-theme-subtle hover:border-neutral-700 transition-all hover:shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 bg-neutral-900/80 px-2 py-0.5 rounded border border-theme-subtle">
                    {tool.category}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500">100% Local</span>
                </div>
                <h3 className="text-sm font-semibold text-theme-main group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  {tool.name}
                </h3>
                <p className="text-xs text-theme-muted line-clamp-2 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-theme-subtle/50 flex items-center text-xs font-mono text-neutral-400 group-hover:text-neutral-200 transition-colors">
                <span>Launch Tool</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
