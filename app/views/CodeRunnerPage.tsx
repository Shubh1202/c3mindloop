'use client';

import React from 'react';
import { Link } from '../lib/router-compat';
import { ArrowLeft, PlayCircle, Maximize2, Terminal, ShieldCheck } from 'lucide-react';
import { CodeRunnerTool } from '../components/tools/CodeRunnerTool';
import { ToolSeoWrapper } from '../components/seo/ToolSeoWrapper';
import { CodeCompilerDocs } from '../components/seo/docs/CodeCompilerDocs';
import { CTASection } from '../components/sections/CTASection';

export const CodeRunnerPage: React.FC = () => {
  return (
    <div className="pt-6 sm:pt-8 pb-16 bg-app text-theme-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Breadcrumb + H1 — Single Heading Policy */}
        <div className="space-y-1.5 border-b border-theme-subtle pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-theme-muted">
            <Link to="/" className="hover:text-theme-main transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span>/</span>
            <span className="text-[#1D9BF0] font-semibold">Compiler</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pt-1">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-theme-main flex items-center gap-3">
                <PlayCircle className="w-7 h-7 text-[#1D9BF0] shrink-0" />
                Online Code Compiler
              </h1>
              <p className="text-sm text-theme-muted font-mono max-w-xl">
                Compile and run Python, JavaScript, Java, C, C++, and PHP directly in your browser. Real-time stdout/stderr, interactive stdin, and fullscreen IDE mode.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <span className="text-[11px] font-mono text-neutral-400 bg-surface px-2.5 py-1 rounded border border-theme-subtle">
                Sandboxed Engine
              </span>
              <span className="text-[11px] font-mono text-neutral-400 bg-surface px-2.5 py-1 rounded border border-theme-subtle">
                6 Languages
              </span>
              <span className="text-[11px] font-mono text-neutral-400 bg-surface px-2.5 py-1 rounded border border-theme-subtle">
                Fullscreen Mode
              </span>
            </div>
          </div>
        </div>

        {/* Code Runner Tool */}
        <CodeRunnerTool />

        {/* Key Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-surface border border-theme-subtle rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <h3 className="text-sm font-semibold text-theme-main">Sandboxed Isolation</h3>
            </div>
            <p className="text-xs text-theme-muted leading-relaxed">
              Every execution runs in an ephemeral, isolated sandbox with strict timeouts and automatic cleanup. Fast, secure, and private.
            </p>
          </div>

          <div className="bg-surface border border-theme-subtle rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-[#1D9BF0]">
              <Terminal className="w-4 h-4 shrink-0" />
              <h3 className="text-sm font-semibold text-theme-main">Interactive stdin Streams</h3>
            </div>
            <p className="text-xs text-theme-muted leading-relaxed">
              Feed custom input data directly into your programs. Compatible with Python input(), C scanf(), C++ cin, and Java Scanner.
            </p>
          </div>

          <div className="bg-surface border border-theme-subtle rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400">
              <Maximize2 className="w-4 h-4 shrink-0" />
              <h3 className="text-sm font-semibold text-theme-main">Fullscreen IDE Mode</h3>
            </div>
            <p className="text-xs text-theme-muted leading-relaxed">
              Immerse yourself in a distraction-free development environment. Supports hotkeys including Ctrl+Enter to run and Esc to exit.
            </p>
          </div>
        </div>

        {/* Rich SEO Documentation & Technical Guide */}
        <ToolSeoWrapper
          toolKey="codeCompiler"
          showWorkflow={false}
          showGuide={false}
          showFaq={false}
          relatedToolIds={['json-formatter', 'diff-checker', 'regex-tester', 'curl-converter']}
        >
          <CodeCompilerDocs />
        </ToolSeoWrapper>

        {/* CTA Section */}
        <CTASection />
      </div>
    </div>
  );
};
