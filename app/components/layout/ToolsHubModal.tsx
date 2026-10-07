'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from '../../lib/router-compat';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  Code2,
  ShieldCheck,
  Zap,
  Clock,
  Terminal,
  Regex,
  Database,
  Hash,
  FileText,
  Sparkles,
  Columns2,
  LayoutGrid,
  GitBranch,
  Flame,
  Grid,
  Layers,
  ArrowRight,
  SlidersHorizontal,
  Braces,
  KeyRound,
  QrCode,
} from 'lucide-react';
import { Logo } from '../ui/Logo';

export interface ToolItem {
  id: string;
  name: string;
  sub: string;
  path: string;
  icon: React.ElementType;
  categories: string[];
  isNew?: boolean;
  featured?: boolean;
  keywords?: string[];
}

export const ALL_TOOLS: ToolItem[] = [
  // JSON Tools
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    sub: 'Format, validate & beautify JSON with syntax highlighting',
    path: '/tools/json-formatter',
    icon: Braces,
    categories: ['JSON Tools'],
    featured: true,
    keywords: ['json', 'format', 'lint', 'prettify', 'validate', 'beautify'],
  },
  {
    id: 'json-graph',
    name: 'JSON Graph Visualizer',
    sub: 'Interactive node graph visualization with pan & zoom',
    path: '/tools/json-graph',
    icon: LayoutGrid,
    categories: ['JSON Tools'],
    isNew: true,
    keywords: ['json', 'graph', 'nodes', 'tree', 'visualizer', 'diagram'],
  },
  {
    id: 'sql-to-json',
    name: 'SQL to JSON',
    sub: 'Convert SQL CREATE TABLE & INSERT statements to JSON',
    path: '/tools/sql-to-json',
    icon: Database,
    categories: ['JSON Tools'],
    keywords: ['json', 'sql', 'database', 'schema', 'insert', 'convert'],
  },
  {
    id: 'jwt-inspector',
    name: 'JWT Inspector',
    sub: 'Decode JSON Web Token header, payload & inspect expiration locally',
    path: '/tools/jwt-inspector',
    icon: ShieldCheck,
    categories: ['JSON Tools', 'Security & Auth'],
    featured: true,
    keywords: ['jwt', 'json', 'token', 'auth', 'oauth', 'bearer', 'decode'],
  },
  {
    id: 'diff-checker',
    name: 'Diff Checker / JSON Diff',
    sub: 'Side-by-side diff tool with JSON-aware smart syntax highlighting',
    path: '/tools/diff-checker',
    icon: Columns2,
    categories: ['JSON Tools', 'Code & Converters'],
    isNew: true,
    featured: true,
    keywords: ['json', 'diff', 'compare', 'merge', 'git', 'changes'],
  },

  // Data & Formatters
  {
    id: 'base64-encoder',
    name: 'Base64 Encoder',
    sub: 'Encode & decode strings, binary data and URLs locally',
    path: '/tools/base64-encoder',
    icon: Zap,
    categories: ['Data & Formatters'],
    featured: true,
    keywords: ['base64', 'encode', 'decode', 'binary', 'url'],
  },

  // Code & Converters
  {
    id: 'curl-converter',
    name: 'cURL Converter',
    sub: 'Transform cURL commands into clean Fetch, Axios or Python code',
    path: '/tools/curl-converter',
    icon: Terminal,
    categories: ['Code & Converters'],
    keywords: ['curl', 'fetch', 'axios', 'api', 'http', 'request'],
  },
  {
    id: 'code-complexity-analyzer',
    name: 'Code Complexity Analyzer',
    sub: 'Analyze Cyclomatic & Cognitive complexity of code snippets',
    path: '/tools/code-complexity-analyzer',
    icon: GitBranch,
    categories: ['Code & Converters'],
    isNew: true,
    keywords: ['complexity', 'cyclomatic', 'cognitive', 'refactor', 'metrics'],
  },

  // Security & Auth
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    sub: 'Compute SHA-256, SHA-512, MD5 & HMAC hashes instantly',
    path: '/tools/hash-generator',
    icon: Hash,
    categories: ['Security & Auth'],
    keywords: ['hash', 'md5', 'sha256', 'sha512', 'crypto', 'hmac'],
  },
  {
    id: 'password-shuffle-generator',
    name: 'Password & Shuffle Generator',
    sub: 'Generate cryptographically secure passwords and shuffle any list — 100% local',
    path: '/tools/password-shuffle-generator',
    icon: KeyRound,
    categories: ['Security & Auth', 'Utilities'],
    isNew: true,
    keywords: ['password', 'generator', 'shuffle', 'randomize', 'crypto', 'entropy', 'list'],
  },

  // PDF & Documents
  {
    id: 'ats-resume-generator',
    name: 'ATS Resume Generator',
    sub: 'Create ATS-friendly single-page resumes with 100% local PDF export',
    path: '/tools/ats-resume-generator',
    icon: FileText,
    categories: ['PDF & Documents'],
    isNew: true,
    featured: true,
    keywords: ['resume', 'ats', 'cv', 'pdf', 'job'],
  },
  {
    id: 'pdf-suite',
    name: 'PDF Suite',
    sub: 'Merge, split, compress & organize PDF documents in-browser',
    path: '/tools/pdf-suite',
    icon: FileText,
    categories: ['PDF & Documents'],
    isNew: true,
    keywords: ['pdf', 'merge', 'split', 'compress', 'document'],
  },
  {
    id: 'edit-pdf',
    name: 'Edit PDF',
    sub: 'Annotate, sign, fill forms & add text to PDF files locally',
    path: '/tools/edit-pdf',
    icon: FileText,
    categories: ['PDF & Documents'],
    isNew: true,
    keywords: ['edit', 'sign', 'annotate', 'pdf', 'form'],
  },

  // Utilities
  {
    id: 'cron-visualizer',
    name: 'Cron Visualizer',
    sub: 'Parse cron syntax into human-readable schedules & timeline',
    path: '/tools/cron-visualizer',
    icon: Clock,
    categories: ['Utilities'],
    featured: true,
    keywords: ['cron', 'schedule', 'timer', 'crontab', 'job'],
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    sub: 'Test regular expressions with real-time match highlighting',
    path: '/tools/regex-tester',
    icon: Regex,
    categories: ['Utilities'],
    keywords: ['regex', 'pattern', 'match', 'expression', 'grep'],
  },
  {
    id: 'ai-prompt-builder',
    name: 'AI Prompt Builder',
    sub: 'Sanitize confidential tokens & structure context for LLMs',
    path: '/tools/ai-prompt-builder',
    icon: Sparkles,
    categories: ['Utilities'],
    isNew: true,
    keywords: ['ai', 'prompt', 'llm', 'gpt', 'sanitize', 'context'],
  },
  {
    id: 'node-event-loop-visualizer',
    name: 'Node.js Event Loop Visualizer',
    sub: 'Step-by-step visualizer for Call Stack, Timers, Microtasks, and Event Loop',
    path: '/tools/node-event-loop-visualizer',
    icon: Terminal,
    categories: ['Utilities'],
    isNew: true,
    featured: true,
    keywords: ['node', 'event loop', 'visualizer', 'microtask', 'nexttick', 'call stack', 'timer', 'setimmediate'],
  },
  {
    id: 'js-event-loop-visualizer',
    name: 'JavaScript Event Loop Visualizer',
    sub: 'Interactive JSV9000 visualizer for Task Queue, Microtask Queue, Call Stack & 4-stage loop',
    path: '/tools/js-event-loop-visualizer',
    icon: Terminal,
    categories: ['Utilities', 'Code & Converters'],
    isNew: true,
    featured: true,
    keywords: ['javascript', 'js', 'event loop', 'jsv9000', 'loupe', 'microtask', 'task queue', 'call stack', 'promise', 'settimeout'],
  },
  {
    id: 'git-visualizer',
    name: 'Git Interactive DAG Visualizer',
    sub: 'Visual commit DAG graph with terminal for commit, branch, merge, rebase & cherry-pick',
    path: '/tools/git-visualizer',
    icon: GitBranch,
    categories: ['Utilities', 'Code & Converters'],
    isNew: true,
    featured: true,
    keywords: ['git', 'github', 'dag', 'graph', 'branch', 'merge', 'rebase', 'cherry-pick', 'reset', 'commit', 'visualizer'],
  },
  {
    id: 'qr-code-generator',
    name: 'QR Code Generator',
    sub: 'Generate QR codes for URLs, Wi-Fi, vCard, email & phone — PNG/SVG export',
    path: '/tools/qr-code-generator',
    icon: QrCode,
    categories: ['Utilities', 'Security & Auth'],
    isNew: true,
    keywords: ['qr', 'qrcode', 'qr code', 'wifi', 'vcard', 'contact', 'url', 'generator', 'svg', 'png'],
  },
];

interface CategoryDef {
  id: string;
  name: string;
  icon: React.ElementType;
  count: number;
}

export const ToolsHubModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('JSON Tools');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      return;
    }

    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 80);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const categories: CategoryDef[] = useMemo(() => [
    { id: 'JSON Tools', name: 'JSON Tools', icon: Braces, count: ALL_TOOLS.filter(t => t.categories.includes('JSON Tools')).length },
    { id: 'featured', name: 'Featured & Popular', icon: Flame, count: ALL_TOOLS.filter(t => t.featured).length },
    { id: 'all', name: 'All Tools (A–Z)', icon: Grid, count: ALL_TOOLS.length },
    { id: 'Data & Formatters', name: 'Data & Formatters', icon: Code2, count: ALL_TOOLS.filter(t => t.categories.includes('Data & Formatters')).length },
    { id: 'Code & Converters', name: 'Code & Converters', icon: Terminal, count: ALL_TOOLS.filter(t => t.categories.includes('Code & Converters')).length },
    { id: 'Security & Auth', name: 'Security & Auth', icon: ShieldCheck, count: ALL_TOOLS.filter(t => t.categories.includes('Security & Auth')).length },
    { id: 'PDF & Documents', name: 'PDF & Documents', icon: FileText, count: ALL_TOOLS.filter(t => t.categories.includes('PDF & Documents')).length },
    { id: 'Utilities', name: 'Developer Utilities', icon: Zap, count: ALL_TOOLS.filter(t => t.categories.includes('Utilities')).length },
  ], []);

  const queryNormalized = searchQuery.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!queryNormalized) return [];
    return ALL_TOOLS.filter((t) => {
      const matchName = t.name.toLowerCase().includes(queryNormalized);
      const matchSub = t.sub.toLowerCase().includes(queryNormalized);
      const matchCat = t.categories.some(c => c.toLowerCase().includes(queryNormalized));
      const matchKw = t.keywords?.some((k) => k.toLowerCase().includes(queryNormalized));
      return matchName || matchSub || matchCat || matchKw;
    });
  }, [queryNormalized]);

  const displayedTools = useMemo(() => {
    if (queryNormalized) return searchResults;
    if (selectedCategory === 'featured') {
      return ALL_TOOLS.filter((t) => t.featured);
    }
    if (selectedCategory === 'all') {
      return [...ALL_TOOLS].sort((a, b) => a.name.localeCompare(b.name));
    }
    return ALL_TOOLS.filter((t) => t.categories.includes(selectedCategory));
  }, [queryNormalized, searchResults, selectedCategory]);

  const activeCategoryDef = categories.find((c) => c.id === selectedCategory) || categories[0];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-xl"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="relative w-full max-w-5xl h-[88vh] max-h-[720px] flex flex-col bg-zinc-950/98 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10"
        >
          {/* Top Bar (Search + Close) */}
          <div className="px-4 sm:px-6 py-3.5 border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-2 shrink-0">
                <Logo variant="compact" />
                <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-zinc-500 border-l border-zinc-800 pl-3 hidden md:inline">
                  Tool Explorer
                </span>
              </div>

              {/* Instant Search Bar */}
              <div className="relative flex-1 max-w-xl">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 16+ local tools (e.g. json, pdf, jwt, regex, diff)..."
                  className="w-full bg-zinc-900/90 border border-zinc-700/80 text-xs text-zinc-100 placeholder-zinc-500 rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:border-[#1D9BF0] focus:ring-1 focus:ring-[#1D9BF0]/40 transition-colors shadow-inner"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/60 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors text-xs font-mono cursor-pointer group"
                aria-label="Close Tool Explorer"
              >
                <span className="hidden sm:inline text-[10px] text-zinc-500 group-hover:text-zinc-400">Esc</span>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Layout: Left Sidebar + Right Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar (Categories) */}
            <div className="w-48 sm:w-56 border-r border-zinc-800/80 bg-zinc-900/30 overflow-y-auto p-2 sm:p-3 shrink-0 space-y-1">
              <div className="px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-semibold mb-1">
                Explore Categories
              </div>

              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id && !queryNormalized;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSearchQuery('');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-[#1D9BF0]/15 text-[#1D9BF0] border border-[#1D9BF0]/30 font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#1D9BF0]' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                      <span className="truncate">{cat.name}</span>
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.25 rounded shrink-0 ${
                      isSelected ? 'bg-[#1D9BF0]/20 text-[#1D9BF0]' : 'bg-zinc-800/60 text-zinc-500 group-hover:text-zinc-400'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}

              {queryNormalized && (
                <div className="mt-4 pt-3 border-t border-zinc-800/60 px-2">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#1D9BF0] font-semibold flex items-center gap-1.5">
                    <Search className="w-3 h-3" />
                    Search Active
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    {searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'} for &quot;{searchQuery}&quot;
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mt-2 text-[10px] font-mono text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
                  >
                    Clear search filter
                  </button>
                </div>
              )}
            </div>

            {/* Right Main Content Area (Compact Tool List) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col justify-between scrollbar-thin scrollbar-thumb-zinc-800">
              <div>
                {/* Header inside content panel */}
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                      {queryNormalized ? (
                        <>
                          Search Results
                          <span className="text-xs font-mono font-normal text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/50">
                            {searchResults.length} found
                          </span>
                        </>
                      ) : (
                        <>
                          <activeCategoryDef.icon className="w-4 h-4 text-[#1D9BF0]" />
                          {activeCategoryDef.name}
                          <span className="text-xs font-mono font-normal text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded border border-zinc-700/50">
                            {displayedTools.length} tools
                          </span>
                        </>
                      )}
                    </h3>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
                    Click any tool to open instantly
                  </span>
                </div>

                {/* Compact Scannable Tool Items Grid (2-3 columns on desktop) */}
                {displayedTools.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {displayedTools.map((tool) => (
                      <CompactToolItem key={tool.id} tool={tool} onClick={onClose} />
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-500">
                      <Search className="w-5 h-5" />
                    </div>
                    <h4 className="text-xs font-semibold text-zinc-300 mb-1">No tools found matching &quot;{searchQuery}&quot;</h4>
                    <p className="text-[11px] text-zinc-500 max-w-xs mx-auto mb-4">
                      Try searching for broader terms like <code className="text-zinc-400 bg-zinc-900 px-1 py-0.5 rounded">json</code>, <code className="text-zinc-400 bg-zinc-900 px-1 py-0.5 rounded">pdf</code>, or <code className="text-zinc-400 bg-zinc-900 px-1 py-0.5 rounded">jwt</code>.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      Clear search filter
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Footer Info Bar */}
              <div className="mt-6 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>100% Local Private Browser Execution</span>
                <Link
                  to="/tools"
                  onClick={onClose}
                  className="hover:text-[#1D9BF0] transition-colors flex items-center gap-1"
                >
                  View full /tools page <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const CompactToolItem: React.FC<{ tool: ToolItem; onClick: () => void }> = ({ tool, onClick }) => {
  const Icon = tool.icon;
  return (
    <Link
      to={tool.path}
      onClick={onClick}
      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/90 border border-zinc-800/70 hover:border-[#1D9BF0]/40 transition-all duration-150 group cursor-pointer"
    >
      <div className="p-1.5 rounded-md bg-zinc-800/80 text-zinc-300 group-hover:bg-[#1D9BF0]/20 group-hover:text-[#1D9BF0] transition-colors shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors truncate leading-tight">
            {tool.name}
          </span>
          {tool.isNew && (
            <span className="text-[8px] font-mono font-bold bg-[#1D9BF0] text-white px-1 py-0.25 rounded shrink-0 leading-none">
              NEW
            </span>
          )}
        </div>
        <p className="text-[10.5px] text-zinc-400 group-hover:text-zinc-300 transition-colors line-clamp-1 leading-snug">
          {tool.sub}
        </p>
      </div>
    </Link>
  );
};
