'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Link as LinkIcon, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  Code2, 
  Columns2, 
  FileCode, 
  Terminal, 
  CheckCircle2, 
  Lock,
  Radio
} from 'lucide-react';
import { Link } from '../../lib/router-compat';

interface CollabToolInfo {
  id: string;
  name: string;
  route: string;
  icon: React.FC<{ className?: string }>;
  tagline: string;
  syncedFields: string[];
  localFields: string[];
}

const COLLAB_TOOLS: CollabToolInfo[] = [
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    route: '/tools/json-formatter',
    icon: Code2,
    tagline: 'Debug & format structured payloads synchronously',
    syncedFields: ['Shared raw JSON editor text'],
    localFields: ['Format / Minify actions', 'Syntax error inspection', 'Clipboard copy'],
  },
  {
    id: 'diff-checker',
    name: 'Diff Checker',
    route: '/tools/diff-checker',
    icon: Columns2,
    tagline: 'Review code or payload diffs together',
    syncedFields: ['Original document text', 'Modified document text', 'Comparison options (whitespace & case)'],
    localFields: ['Split side-by-side vs inline unified view mode'],
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    route: '/tools/regex-tester',
    icon: FileCode,
    tagline: 'Construct and test regex expressions with peers',
    syncedFields: ['Regex pattern', 'Test string', 'Regex flags (g, i, m, s, u, y)'],
    localFields: ['Match results list', 'Match group inspect panel'],
  },
  {
    id: 'curl-converter',
    name: 'cURL Converter',
    route: '/tools/curl-converter',
    icon: Terminal,
    tagline: 'Convert API requests across multiple languages',
    syncedFields: ['Raw cURL command string'],
    localFields: ['Target language selection (Fetch, Axios, Python, Go, PHP)', 'Generated code output'],
  },
  {
    id: 'jwt-inspector',
    name: 'JWT Inspector',
    route: '/tools/jwt-inspector',
    icon: ShieldCheck,
    tagline: 'Inspect token headers and payload claims in private',
    syncedFields: ['Raw JWT token string'],
    localFields: ['Decoded claims tab view', 'Expiration analysis', 'Local verification secret'],
  },
];

export const CollaborationShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('json-formatter');
  const selectedTool = COLLAB_TOOLS.find((t) => t.id === activeTab) || COLLAB_TOOLS[0];
  const SelectedIcon = selectedTool.icon;

  return (
    <section className="py-16 sm:py-20 bg-neutral-950/60 border-b border-theme-subtle relative overflow-hidden" aria-labelledby="collab-showcase-heading">
      {/* Subtle ambient lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-sky-500/10 via-emerald-500/8 to-transparent blur-3xl opacity-70" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-sky-500/10 border border-sky-500/20 text-[11px] font-mono font-medium text-sky-400 uppercase tracking-widest">
            <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" aria-hidden="true" />
            <span>Peer-to-Peer Workflow • Zero Cloud Storage</span>
          </div>
          <h2 id="collab-showcase-heading" className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
            Multi-User Live Collaboration Inside 5 Browser Utilities
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 font-normal leading-relaxed">
            Need to debug a failing API payload, regex pattern, or JWT token with a teammate? Start a session right inside your browser utility. No account creation, no document storage on our servers, and zero telemetry on your inputs.
          </p>
        </div>

        {/* 3-Step Real Workflow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Step 1 */}
          <div className="p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold text-sky-400 uppercase tracking-wider">Step 01</span>
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Users className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-white">Host Starts a Session</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                Click <span className="font-mono text-neutral-200 bg-neutral-800 px-1 py-0.5 rounded">Collaborate</span> in any of the 5 supported tools. Your browser initializes a local CRDT document and generates a 256-bit encryption key.
              </p>
            </div>
            <div className="pt-3 border-t border-neutral-800 text-[11px] font-mono text-neutral-500 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>Keys stay in your browser</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold text-emerald-400 uppercase tracking-wider">Step 02</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <LinkIcon className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-white">Share the Invite Link</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                Copy the generated invite URL. The room identifier and decryption secret are encoded directly inside the URL hash (<span className="font-mono text-neutral-200">#room=...&amp;key=...</span>), never sent in HTTP headers.
              </p>
            </div>
            <div className="pt-3 border-t border-neutral-800 text-[11px] font-mono text-neutral-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" aria-hidden="true" />
              <span>Zero server log persistence</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-semibold text-purple-400 uppercase tracking-wider">Step 03</span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Zap className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-white">Work Together in Real Time</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                Peers connect via WebRTC data channels. Shared editor state synchronizes with sub-millisecond updates, while your personal display settings remain completely local.
              </p>
            </div>
            <div className="pt-3 border-t border-neutral-800 text-[11px] font-mono text-neutral-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-purple-400 shrink-0" aria-hidden="true" />
              <span>Full mesh P2P synchronization</span>
            </div>
          </div>
        </div>

        {/* 5 Collaborative Tools Breakdown */}
        <div className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span>Supported Collaborative Tools &amp; Sync Capabilities</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Select a tool to verify exactly what synchronizes across participants and what stays local.
              </p>
            </div>
            <div className="text-xs font-mono text-neutral-500">
              5 of 23 utilities collaborative
            </div>
          </div>

          {/* Tool Selector Tabs */}
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Collaborative utilities">
            {COLLAB_TOOLS.map((tool) => {
              const Icon = tool.icon;
              const isActive = tool.id === activeTab;
              return (
                <button
                  key={tool.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${tool.id}`}
                  id={`tab-${tool.id}`}
                  onClick={() => setActiveTab(tool.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-neutral-800 text-sky-400 border border-sky-500/40 shadow-sm'
                      : 'bg-neutral-900/80 text-neutral-400 hover:text-neutral-200 border border-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tool.name}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Tool Details Card */}
          <div
            id={`tabpanel-${selectedTool.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${selectedTool.id}`}
            className="p-5 rounded-xl bg-neutral-950 border border-neutral-800/90 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
          >
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                  <SelectedIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-white">{selectedTool.name}</h4>
                  <p className="text-xs text-neutral-400 font-mono">{selectedTool.tagline}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
                  <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Synchronized Between Peers</span>
                  </div>
                  <ul className="text-xs text-neutral-300 space-y-1">
                    {selectedTool.syncedFields.map((field) => (
                      <li key={field} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 select-none">•</span>
                        <span>{field}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 space-y-1.5">
                  <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                    <span>Local To Your Browser</span>
                  </div>
                  <ul className="text-xs text-neutral-400 space-y-1">
                    {selectedTool.localFields.map((field) => (
                      <li key={field} className="flex items-start gap-1.5">
                        <span className="text-neutral-500 select-none">•</span>
                        <span>{field}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-center sm:items-start lg:items-end gap-3 pt-2 lg:pt-0">
              <Link
                to={selectedTool.route}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-all shadow-md shadow-sky-500/20 group cursor-pointer"
              >
                <span>Launch {selectedTool.name}</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </Link>
              <span className="text-[11px] font-mono text-neutral-500 text-center sm:text-left">
                Click &apos;Collaborate&apos; in toolbar to invite peers
              </span>
            </div>
          </div>
        </div>

        {/* Global CTA Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-semibold text-white">Ready to start a peer-to-peer debugging session?</h3>
            <p className="text-xs text-neutral-400">
              Open any supported utility, click Collaborate, and share your session link.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              to="/tools/json-formatter"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-white" />
              <span>Try Live Collaboration</span>
            </Link>
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
            >
              <span>Explore All Utilities</span>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};
