'use client';

import React from 'react';
import { Link } from '../lib/router-compat';
import { ArrowLeft, Download, FileText, FileSpreadsheet, Code2, Check, ExternalLink, ShieldAlert, Cpu } from 'lucide-react';
import { CTASection } from '../components/sections/CTASection';

export const OfficeEditorPage: React.FC = () => {
  return (
    <>
      <div className="pt-6 sm:pt-8 pb-16 bg-app text-theme-main relative z-10 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Breadcrumb Navigation & Compact Title */}
          <div className="space-y-1.5 border-b border-theme-subtle pb-3">
            <div className="flex items-center gap-2 text-xs font-mono text-theme-muted">
              <Link to="/tools" className="hover:text-theme-main transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Developer Tools</span>
              </Link>
              <span>/</span>
              <span className="text-[#1D9BF0] font-semibold">Office Editor</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-theme-main">
                Office Editor - VS Code Extension
              </h1>
              <span className="text-[11px] font-mono text-neutral-400 bg-surface px-2.5 py-1 rounded border border-theme-subtle shrink-0">
                Local Editor • 100% Offline-First
              </span>
            </div>
          </div>

          {/* Hero Card */}
          <div className="border border-theme-subtle rounded-lg p-6 sm:p-8 space-y-6 text-neutral-100 shadow-xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1c1c1c 0%, #161616 100%)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#007ACC]/10 border border-[#007ACC]/30 flex items-center justify-center shrink-0 text-[#007ACC]">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      VS Code Extension
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Official Release
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                    Office Editor (Docx, Xlsx, PDF)
                  </h2>
                </div>
              </div>

              <a
                href="https://marketplace.visualstudio.com/items?itemName=shubhamprajapati1202.office-editor"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-[#007ACC] hover:bg-[#0062A3] text-white font-mono text-xs font-semibold uppercase tracking-wide transition-all shrink-0 cursor-pointer shadow-md hover:shadow-lg"
              >
                <span>Install Extension</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
              Edit Word (.docx) and Excel (.xlsx) files and preview PDFs directly inside your VS Code workspace without switching apps or compromising local security policies.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 border border-white/10 text-xs font-mono text-neutral-200">
                <Download className="w-3.5 h-3.5 text-[#007ACC]" />
                <span>14,400+ Installs on VS Code Marketplace</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 border border-white/10 text-xs font-mono text-neutral-200">
                <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
                <span>Tabulator & Rich Text Engine</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/5 border border-white/10 text-xs font-mono text-neutral-200">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Free & Developer-Focused</span>
              </div>
            </div>
          </div>

          {/* Detailed Content / SEO Prose */}
          <div className="pt-10 border-t border-theme-subtle space-y-12">

            {/* Structured Features Grid */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-theme-main">
                Key Features & Capabilities
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-5 rounded-lg bg-surface border border-theme-subtle space-y-3">
                  <div className="w-8 h-8 rounded bg-[#107C41]/10 border border-[#107C41]/30 flex items-center justify-center text-[#107C41]">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-theme-main">
                    Excel Sheet Viewer & Editor
                  </h3>
                  <p className="text-xs text-theme-muted leading-relaxed">
                    Open and edit spreadsheet files (.xlsx, .xls) directly in VS Code. Powered by Tabulator for fast, high-performance rendering of up to 10k+ rows with formula support.
                  </p>
                </div>

                <div className="p-5 rounded-lg bg-surface border border-theme-subtle space-y-3">
                  <div className="w-8 h-8 rounded bg-[#2B579A]/10 border border-[#2B579A]/30 flex items-center justify-center text-[#2B579A]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-theme-main">
                    Word Document Editor
                  </h3>
                  <p className="text-xs text-theme-muted leading-relaxed">
                    Edit Word document (.docx, .doc) files inside your IDE using a rich text editor. Adjust styles, headings, tables, list structures, and formats with zero external dependencies.
                  </p>
                </div>

                <div className="p-5 rounded-lg bg-surface border border-theme-subtle space-y-3">
                  <div className="w-8 h-8 rounded bg-[#D24726]/10 border border-[#D24726]/30 flex items-center justify-center text-[#D24726]">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-theme-main">
                    PowerPoint & PDF Support
                  </h3>
                  <p className="text-xs text-theme-muted leading-relaxed">
                    Preview slides (.pptx) or inspect PDF documents inside your editor view. Perfect for reading spec files, manuals, and layout sheets inline.
                  </p>
                </div>

                <div className="p-5 rounded-lg bg-surface border border-theme-subtle space-y-3">
                  <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-theme-main">
                    JSON Data Inspection Mode
                  </h3>
                  <p className="text-xs text-theme-muted leading-relaxed">
                    Instantly toggle between tabular grid layout and raw structured JSON representation of your spreadsheet content, making API integration and database seed testing direct.
                  </p>
                </div>
              </div>
            </div>

            {/* Deep-Dive Technical Explanation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm text-theme-muted leading-relaxed">
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-theme-main">
                  Developer Workflow Integration
                </h2>
                <p>
                  Modern software engineers frequently interact with CSV, Excel, and docx documentation sheets when handling client reports, seed configurations, and testing scripts. Toggling back and forth between VS Code and external spreadsheet software disrupts development focus.
                </p>
                <p>
                  Office Editor bridges this gap by rendering standard documentation structures as tabbed webview containers directly within the editor layout. This makes inspecting document variables, viewing spreadsheet grids, and verifying PDF assets instantaneous.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-bold text-theme-main">
                  Security & Zero Cloud Footprint
                </h2>
                <p>
                  Security is paramount. Traditional office tools often sync configurations, Excel formulas, and Word draft layouts to third-party servers. In secure enterprises, this triggers immediate security concerns.
                </p>
                <p>
                  C³ MindLoop's Office Editor operates 100% offline. Files are loaded from your local directory, compiled into memory inside your IDE's sandboxed environment, and saved directly to disk. No network transmission occurs. Your source configurations remain private and isolated.
                </p>
              </div>
            </div>

            {/* Accordion FAQ UI */}
            <div className="space-y-4 max-w-4xl pt-6">
              <h2 className="text-lg font-bold text-theme-main">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                <div className="border border-theme-subtle rounded-lg bg-surface p-4 space-y-2">
                  <h3 className="font-semibold text-theme-main text-sm">
                    Is the extension completely free to install?
                  </h3>
                  <p className="text-xs text-theme-muted">
                    Yes, Office Editor is fully free, open-source, and dedicated to developers. There are no registration forms, trial limits, or login screens required.
                  </p>
                </div>
                <div className="border border-theme-subtle rounded-lg bg-surface p-4 space-y-2">
                  <h3 className="font-semibold text-theme-main text-sm">
                    Can it open huge spreadsheets quickly?
                  </h3>
                  <p className="text-xs text-theme-muted">
                    Yes, thanks to our virtual rendering and tabular layout system, sheet records with 10k+ entries compile quickly inside the IDE.
                  </p>
                </div>
                <div className="border border-theme-subtle rounded-lg bg-surface p-4 space-y-2">
                  <h3 className="font-semibold text-theme-main text-sm">
                    Does my data leave the editor environment?
                  </h3>
                  <p className="text-xs text-theme-muted">
                    Never. All code actions, formatting, and file modifications occur strictly on your machine.
                  </p>
                </div>
              </div>
            </div>

          </div>

          <CTASection />
        </div>
      </div>
    </>
  );
};
