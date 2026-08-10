import React from 'react';
import { ArrowRight, Download, FileText, FileSpreadsheet, Code2, Check, ExternalLink } from 'lucide-react';

export const VSCodeExtensionCard: React.FC = () => {
  return (
    <div className="border border-white/15 rounded-lg p-6 sm:p-8 space-y-6 text-neutral-100 shadow-xl relative overflow-hidden font-sans" style={{ background: 'linear-gradient(135deg, #1c1c1c 0%, #161616 100%)' }}>
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          {/* VS Code Brand Badge */}
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
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Office Editor (Docx, Xlsx) — VS Code Extension
            </h3>
          </div>
        </div>

        {/* Primary CTA */}
        <a
          href="https://marketplace.visualstudio.com/items?itemName=shubhamprajapati1202.office-editor"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-[#007ACC] hover:bg-[#0062A3] text-white font-mono text-xs font-semibold uppercase tracking-wide transition-all shrink-0 cursor-pointer shadow-md hover:shadow-lg"
        >
          <span>Install Extension</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* Subtitle */}
      <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
        Edit Word (.docx) and Excel (.xlsx) files directly inside VS Code without switching apps.
      </p>

      {/* Metrics Badges */}
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

      {/* Feature Highlights Grid */}
      <div className="pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div className="p-3.5 rounded bg-white/[0.04] border border-white/10 space-y-1.5">
          <div className="flex items-center gap-2 text-neutral-200 font-semibold">
            <FileText className="w-4 h-4 text-[#007ACC]" />
            <span>.docx Rich Text Editor</span>
          </div>
          <p className="text-neutral-400 font-sans text-xs leading-relaxed">
            In-editor .docx rich text editing & formatting.
          </p>
        </div>

        <div className="p-3.5 rounded bg-white/[0.04] border border-white/10 space-y-1.5">
          <div className="flex items-center gap-2 text-neutral-200 font-semibold">
            <FileSpreadsheet className="w-4 h-4 text-sky-400" />
            <span>High-Performance .xlsx</span>
          </div>
          <p className="text-neutral-400 font-sans text-xs leading-relaxed">
            High-performance .xlsx viewer & editor powered by Tabulator (10k+ rows support).
          </p>
        </div>

        <div className="p-3.5 rounded bg-white/[0.04] border border-white/10 space-y-1.5">
          <div className="flex items-center gap-2 text-neutral-200 font-semibold">
            <Code2 className="w-4 h-4 text-amber-400" />
            <span>JSON Data Mode</span>
          </div>
          <p className="text-neutral-400 font-sans text-xs leading-relaxed">
            Toggle raw JSON data view for spreadsheet inspection.
          </p>
        </div>
      </div>

      {/* Footer link line */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400 font-mono">
        <span>Publisher: shubhamprajapati1202</span>
        <a
          href="https://marketplace.visualstudio.com/items?itemName=shubhamprajapati1202.office-editor"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[#007ACC] hover:underline"
        >
          <span>View on Visual Studio Marketplace</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
