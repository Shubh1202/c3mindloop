'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Trash2,
  Lock,
  Unlock,
  ShieldCheck,
  ClipboardCopy,
  ExternalLink,
  Code2,
  Terminal,
  Database,
  FileCode,
  Globe,
  Maximize2,
  Minimize2,
  Info,
  AlertCircle,
  Zap,
} from 'lucide-react';

type PresetType = 'debug' | 'design' | 'test' | 'refactor' | 'schema';
type InputType = 'auto' | 'json' | 'sql' | 'logs' | 'code';

interface Preset {
  id: PresetType;
  label: string;
  icon: React.ElementType;
}

const PRESETS: Preset[] = [
  { id: 'debug', label: 'Debug Error', icon: Terminal },
  { id: 'design', label: 'Architecture Design', icon: Globe },
  { id: 'test', label: 'Write Unit Tests', icon: FileCode },
  { id: 'refactor', label: 'Refactor Code', icon: Code2 },
  { id: 'schema', label: 'Schema to ORM', icon: Database },
];

// --- Full templates ---
const TEMPLATES: Record<PresetType, (input: string, fence: string, hint: string) => string> = {
  debug: (input, fence, hint) => `[ROLE]: Senior Engineer & Debugging Assistant
${hint}
[CONTEXT]:
We are facing an issue with the following execution state/log:

\`\`\`${fence}
${input}
\`\`\`

[TASK]:
1. Identify the root cause of the issue/error.
2. Provide a step-by-step fix with modern code snippets.
3. Mention any edge cases or performance bottlenecks to watch out for.`,

  design: (input, fence, hint) => `[ROLE]: Principal Systems Architect
${hint}
[CONTEXT]:
I need to design a system architecture or review a design for the following specifications/code:

\`\`\`${fence}
${input}
\`\`\`

[TASK]:
1. Design a clean, scalable system architecture based on these specifications.
2. Detail the components, data flows, and technology choices.
3. Address security concerns, trade-offs, and scalability bottlenecks.`,

  test: (input, fence, hint) => `[ROLE]: Senior Software Engineer (QA & Testing Specialist)
${hint}
[CONTEXT]:
Please write comprehensive unit tests for the following code snippet:

\`\`\`${fence}
${input}
\`\`\`

[TASK]:
1. Write robust unit tests covering success paths, error paths, and edge cases.
2. Use a standard modern testing framework matching the code language.
3. Keep tests clean, isolated, and readable with clear assertion messages.`,

  refactor: (input, fence, hint) => `[ROLE]: Senior Software Architect & Code Quality Expert
${hint}
[CONTEXT]:
I want to refactor the following code snippet to improve its quality, readability, or performance:

\`\`\`${fence}
${input}
\`\`\`

[TASK]:
1. Analyze the snippet for code smells, performance bottlenecks, or anti-patterns.
2. Provide a refactored version of the code utilizing modern language features.
3. Explain the improvements and why they are beneficial.`,

  schema: (input, fence, hint) => `[ROLE]: Senior Database Engineer & Backend Developer
${hint}
[CONTEXT]:
Convert the following database schema (SQL DDL, JSON object, or similar) into clean ORM models:

\`\`\`${fence}
${input}
\`\`\`

[TASK]:
1. Generate the equivalent ORM models (e.g., Prisma, Mongoose, TypeORM, SQLAlchemy) for the provided schema.
2. Ensure correct data types, constraints (primary/foreign keys, uniqueness, defaults), and relationships.
3. Provide a brief explanation of any mapping decisions.`,
};

// --- Compact templates (Token Saver ON) ---
const COMPACT_TEMPLATES: Record<PresetType, (input: string, fence: string) => string> = {
  debug: (input, fence) => `Role:Sr Eng/Debug. Fix the issue below.\n\`\`\`${fence}\n${input}\n\`\`\`\nTasks:1)Root cause 2)Fix with code 3)Edge cases`,
  design: (input, fence) => `Role:Systems Architect. Review/design for spec below.\n\`\`\`${fence}\n${input}\n\`\`\`\nTasks:1)Architecture 2)Components+data flow 3)Security+tradeoffs`,
  test: (input, fence) => `Role:QA Eng. Write unit tests for:\n\`\`\`${fence}\n${input}\n\`\`\`\nTasks:1)Success+error+edge cases 2)Modern test framework 3)Clean readable assertions`,
  refactor: (input, fence) => `Role:Sr Architect. Refactor code below.\n\`\`\`${fence}\n${input}\n\`\`\`\nTasks:1)Identify smells/anti-patterns 2)Refactored version 3)Explain improvements`,
  schema: (input, fence) => `Role:DB Eng. Convert schema to ORM models.\n\`\`\`${fence}\n${input}\n\`\`\`\nTasks:1)ORM models(Prisma/Mongoose/TypeORM/SQLAlchemy) 2)Correct types+constraints 3)Mapping decisions`,
};

// --- Format auto-detection ---
function autoDetectFormat(text: string): Exclude<InputType, 'auto'> {
  const t = text.trim();
  if (/^[\[{]/.test(t) && /("\w+"\s*:)/.test(t)) return 'json';
  if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE|ALTER TABLE|DROP TABLE)\b/i.test(t)) return 'sql';
  if (/\b(ERROR|WARN|INFO|DEBUG|FATAL|\d{4}-\d{2}-\d{2}T\d{2}:\d{2}|\[\d{2}:\d{2}:\d{2}\]|at\s+\w+\.\w+\()/i.test(t)) return 'logs';
  return 'code';
}

function resolveFormat(inputType: InputType, text: string): Exclude<InputType, 'auto'> {
  return inputType === 'auto' ? autoDetectFormat(text) : inputType;
}

const FORMAT_LABELS: Record<Exclude<InputType, 'auto'>, string> = {
  json: 'json',
  sql: 'sql',
  logs: 'plaintext',
  code: 'typescript',
};

const FORMAT_HINT: Record<Exclude<InputType, 'auto'>, string> = {
  json: '[FORMAT]: JSON payload',
  sql: '[FORMAT]: SQL DDL / Query',
  logs: '[FORMAT]: Application / Terminal Log output',
  code: '[FORMAT]: Source code snippet',
};

// --- Token estimator (cl100k heuristic: chars / 4) ---
function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

// --- Token Saver: aggressive minification of input context ---
function minifyContext(text: string, format: Exclude<InputType, 'auto'>): string {
  let out = text;
  // Strip single-line comments
  out = out.replace(/^\s*(\/\/[^\n]*|#[^\n]*)$/gm, '');
  // Strip block comments
  out = out.replace(/\/\*[\s\S]*?\*\//g, '');

  if (format === 'json') {
    try {
      return JSON.stringify(JSON.parse(out));
    } catch {
      // fallthrough
    }
  }

  if (format === 'sql') {
    return out.replace(/[ \t]+/g, ' ').replace(/\n+/g, ' ').trim();
  }

  // Generic: trim trailing spaces, collapse 3+ blank lines to 1
  return out
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function sanitizeInput(text: string): string {
  let s = text;
  s = s.replace(/mongodb(?:\+srv)?:\/\/[^\s]+/gi, '<REDACTED_MONGODB_URI>');
  s = s.replace(/(postgres|postgresql|mysql):\/\/[^\s]+/gi, (_m, p) => `<REDACTED_${p.toUpperCase()}_URI>`);
  s = s.replace(/bearer\s+[a-zA-Z0-9\-._~+/]+=*/gi, 'Bearer <REDACTED_BEARER_TOKEN>');
  s = s.replace(/eyJ[a-zA-Z0-9-_]+\.eyJ[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+/gi, '<REDACTED_JWT_TOKEN>');
  s = s.replace(/sk-[a-zA-Z0-9]{32,}/g, '<REDACTED_OPENAI_KEY>');
  s = s.replace(/(password|passwd|pass|secret|private_key|api_key|apikey|token|aws_secret)\s*[:=]\s*['"]?([a-zA-Z0-9\-._~+/]{16,})['"]?/gi, (_m, key) => `${key}: "<REDACTED_${key.toUpperCase()}>"`);
  s = s.replace(/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g, '<REDACTED_IP_ADDRESS>');
  s = s.replace(/\b(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}\b/g, '<REDACTED_IP_ADDRESS>');
  s = s.replace(/[\w.+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '<REDACTED_EMAIL>');
  return s;
}

export const AiPromptContextBuilderTool: React.FC = () => {
  const [rawInput, setRawInput] = useState<string>('');
  const [sanitizerEnabled, setSanitizerEnabled] = useState<boolean>(true);
  const [tokenSaverEnabled, setTokenSaverEnabled] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<PresetType>('debug');
  const [inputType, setInputType] = useState<InputType>('auto');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [baselinePrompt, setBaselinePrompt] = useState<string>('');
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) setIsFullScreen(false);
    };
    const navbar = document.querySelector('header') as HTMLElement | null;
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
      if (navbar) navbar.style.display = 'none';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      if (navbar) navbar.style.display = '';
    }
    return () => {
      document.body.style.overflow = '';
      if (navbar) navbar.style.display = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullScreen]);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, []);

  useEffect(() => {
    const sanitized = sanitizerEnabled ? sanitizeInput(rawInput) : rawInput;
    if (!sanitized.trim()) {
      setGeneratedPrompt('');
      setBaselinePrompt('');
      return;
    }
    const detected = resolveFormat(inputType, rawInput);
    const fence = FORMAT_LABELS[detected];
    const hint = FORMAT_HINT[detected];
    const full = TEMPLATES[activePreset](sanitized, fence, hint);
    setBaselinePrompt(full);
    if (tokenSaverEnabled) {
      const minified = minifyContext(sanitized, detected);
      setGeneratedPrompt(COMPACT_TEMPLATES[activePreset](minified, fence));
    } else {
      setGeneratedPrompt(full);
    }
  }, [rawInput, sanitizerEnabled, tokenSaverEnabled, activePreset, inputType]);

  const outputTokens = useMemo(() => estimateTokens(generatedPrompt), [generatedPrompt]);
  const baselineTokens = useMemo(() => estimateTokens(baselinePrompt), [baselinePrompt]);
  const savedPct = baselineTokens > 0 && tokenSaverEnabled
    ? Math.round(((baselineTokens - outputTokens) / baselineTokens) * 100)
    : 0;

  const handleClear = () => {
    setRawInput('');
    setGeneratedPrompt('');
    setBaselinePrompt('');
    showToast('Input cleared');
  };

  const handleCopyPrompt = async () => {
    if (!generatedPrompt) return;
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
      showToast('Copied full prompt to clipboard');
    } catch { showToast('Failed to copy'); }
  };

  const handleCopyAsMarkdown = async () => {
    if (!generatedPrompt) return;
    const block = '```markdown\n' + generatedPrompt + '\n```';
    try {
      await navigator.clipboard.writeText(block);
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2000);
      showToast('Copied as markdown block');
    } catch { showToast('Failed to copy'); }
  };

  const handleOpenExternal = (target: 'chatgpt' | 'claude') => {
    if (!generatedPrompt) return;
    const url = target === 'chatgpt'
      ? 'https://chatgpt.com/?q=' + encodeURIComponent(generatedPrompt)
      : 'https://claude.ai/new?q=' + encodeURIComponent(generatedPrompt);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleLoadSample = () => {
    const sample = [
      '// SAMPLE — heavily indented with comments and sensitive data',
      'const config = {',
      '  // Primary DB',
      '  dbUri: "mongodb+srv://admin:P@ssword123@cluster0.db.net/prod",',
      '',
      '  // AI key',
      '  apiKey: "sk-openai54321678901234567890abcdefghijklm",',
      '',
      '  /* Auth bearer */',
      '  bearer: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",',
      '',
      '  serverIp: "192.168.1.105",',
      '  adminEmail: "security@company.com",',
      '',
      '  features: {',
      '    enableCache: true,   // Redis layer',
      '    enableLogging: false, // off in prod',
      '    maxRetries: 3,',
      '  }',
      '};',
      '',
      '// Connect and verify',
      'function connect() {',
      '  // attempt connection',
      '  console.log("Connecting: " + config.dbUri);',
      '  // TODO: retry logic',
      '}',
    ].join('\n');
    setRawInput(sample);
    showToast('Sample loaded');
  };

  const lineCount = rawInput.split('\n').length;
  const byteCount = new Blob([rawInput]).size;
  const outputBytes = new Blob([generatedPrompt]).size;
  const inputTokens = estimateTokens(rawInput);

  return (
    <>
      <div className={`bg-neutral-950 border border-neutral-800 font-sans text-neutral-100 flex flex-col ${isFullScreen ? 'fixed inset-0 z-[9999] overflow-hidden' : 'w-full rounded-lg shadow-2xl'}`}>

        {/* Preset Pills */}
        <div className="px-3 py-2.5 bg-neutral-900/80 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-mono font-medium text-neutral-400 shrink-0">LLM Prompt Preset:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {PRESETS.map((preset) => {
              const isSelected = activePreset === preset.id;
              const Icon = preset.icon;
              return (
                <button
                  key={preset.id}
                  onClick={() => setActivePreset(preset.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium tracking-wide transition-all flex items-center gap-1.5 cursor-pointer ${isSelected
                    ? 'bg-[#1D9BF0] text-white shadow-md border border-[#1D9BF0]'
                    : 'bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/50'
                    }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Action Toolbar */}
        <div className={`px-3 py-2.5 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono ${isFullScreen ? 'sticky top-0 z-[10000]' : ''}`}>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSanitizerEnabled(!sanitizerEnabled)}
              className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${sanitizerEnabled
                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/80 hover:bg-emerald-950/60'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-transparent'
                }`}
            >
              {sanitizerEnabled ? <Lock className="w-3.5 h-3.5 text-emerald-400" /> : <Unlock className="w-3.5 h-3.5 text-neutral-400" />}
              <span>{sanitizerEnabled ? 'Auto-Sanitizer: ON' : 'Auto-Sanitizer: OFF'}</span>
            </button>

            <button
              onClick={() => {
                const next = !tokenSaverEnabled;
                setTokenSaverEnabled(next);
                showToast(next ? 'Token Saver ON — prompt compressed' : 'Token Saver OFF — full template restored');
              }}
              className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${tokenSaverEnabled
                ? 'bg-amber-950/40 text-amber-400 border border-amber-800/80 hover:bg-amber-950/60'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-transparent'
                }`}
            >
              <Zap className={`w-3.5 h-3.5 ${tokenSaverEnabled ? 'text-amber-400' : 'text-neutral-400'}`} />
              <span>{tokenSaverEnabled ? 'Token Saver: ON' : 'Token Saver: OFF'}</span>
            </button>

            <button
              onClick={handleLoadSample}
              className="px-2.5 py-1.5 rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
            >
              Sample Text
            </button>

            <button
              onClick={handleClear}
              className="px-2.5 py-1.5 rounded bg-neutral-800/80 hover:bg-red-950 hover:text-red-300 text-neutral-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-neutral-950 p-1 rounded border border-neutral-800 text-xs font-mono">
              <span className="text-neutral-500 px-2">Format:</span>
              {(['auto', 'json', 'sql', 'logs', 'code'] as InputType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setInputType(type)}
                  className={`px-2 py-0.5 rounded capitalize transition-colors cursor-pointer ${inputType === type ? 'bg-[#1D9BF0] text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
                >
                  {type === 'auto' ? 'Auto' : type === 'sql' ? 'SQL' : type === 'logs' ? 'Logs' : type}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
              className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Split Workspace */}
        <div className={`grid divide-neutral-800 grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x ${isFullScreen ? 'flex-1 overflow-hidden' : 'min-h-[480px]'}`}>

          {/* Left: Raw Input */}
          <div className={`flex flex-col bg-neutral-950 p-3 sm:p-4 space-y-2 ${isFullScreen ? 'overflow-y-auto' : ''}`}>
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pb-1 border-b border-neutral-900">
              <span className="font-semibold text-neutral-300">Raw Technical Context</span>
              <div className="flex items-center gap-2 text-[11px]">
                <span>{lineCount} lines</span>
                <span>•</span>
                <span>{byteCount} bytes</span>
                <span>•</span>
                <span className="text-neutral-400">~{inputTokens} tk</span>
              </div>
            </div>
            <div className="relative flex-1 flex">
              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="Paste terminal logs, DDL schemas, configurations, database URLs, or code files here..."
                spellCheck={false}
                className="w-full h-full min-h-[400px] p-3 font-mono text-xs sm:text-sm bg-neutral-900/90 text-neutral-100 border border-neutral-800 rounded focus:border-[#1D9BF0] focus:outline-none resize-none leading-relaxed transition-colors"
              />
            </div>
          </div>

          {/* Right: Output */}
          <div className={`flex flex-col bg-neutral-950 p-3 sm:p-4 space-y-2 ${isFullScreen ? 'overflow-y-auto' : ''}`}>
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pb-1 border-b border-neutral-900">
              <span className="font-semibold text-neutral-300">Optimized System Prompt</span>
              <div className="flex items-center gap-2 text-[11px] flex-wrap justify-end">
                {generatedPrompt && (
                  <span className={`flex items-center gap-1 font-mono ${tokenSaverEnabled && savedPct > 0 ? 'text-amber-400' : 'text-neutral-400'}`}>
                    <Zap className="w-3 h-3" />
                    <span>~{outputTokens} tokens</span>
                    {tokenSaverEnabled && savedPct > 0 && (
                      <span className="text-emerald-400 font-semibold ml-0.5">(↓ {savedPct}% saved)</span>
                    )}
                  </span>
                )}
                {generatedPrompt && sanitizerEnabled && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Sanitized</span>
                  </span>
                )}
                <span>{outputBytes} bytes</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              {generatedPrompt ? (
                <div className="relative flex-1 flex flex-col bg-neutral-900/90 border border-neutral-800 rounded min-h-[400px] overflow-hidden">
                  <div className="flex-1 overflow-auto p-4 font-mono text-xs sm:text-sm text-neutral-300 whitespace-pre-wrap select-all">
                    {generatedPrompt}
                  </div>
                  <div className="p-2.5 bg-neutral-950 border-t border-neutral-800 flex flex-wrap gap-2 justify-between items-center text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyPrompt}
                        className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedPrompt ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <ClipboardCopy className="w-3.5 h-3.5" />}
                        <span>{copiedPrompt ? 'Copied' : 'Copy Prompt'}</span>
                      </button>
                      <button
                        onClick={handleCopyAsMarkdown}
                        className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedMarkdown ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedMarkdown ? 'Copied' : 'Copy Markdown'}</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenExternal('chatgpt')}
                        className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-[#1A8CD8]/20 hover:text-[#1D9BF0] text-neutral-300 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open in ChatGPT</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleOpenExternal('claude')}
                        className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-[#1A8CD8]/20 hover:text-[#1D9BF0] text-neutral-300 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open in Claude</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-neutral-800 rounded min-h-[400px] text-neutral-500 font-mono text-xs text-center p-8 space-y-2">
                  <Sparkles className="w-8 h-8 text-neutral-600 animate-pulse" />
                  <p>Paste context in the left panel to build your prompt.</p>
                  <p className="text-[10px] text-neutral-600">Active preset: {PRESETS.find(p => p.id === activePreset)?.label}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-neutral-900/80 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            {generatedPrompt ? (
              <span className="text-sky-400 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  Prompt ready
                  {sanitizerEnabled ? ' • Sensitive data redacted' : ''}
                  {tokenSaverEnabled ? ' • Token-optimized' : ''}
                </span>
              </span>
            ) : (
              <span className="text-neutral-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Waiting for input</span>
              </span>
            )}
          </div>
          <div className="text-neutral-400 text-[11px] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-neutral-500" />
            <span>Local browser processing • No data sent to any server</span>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10001] animate-[fadeSlideUp_0.25s_ease-out]">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900/95 border border-neutral-700/60 text-neutral-200 text-xs font-mono shadow-xl backdrop-blur-sm">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#1D9BF0]" />
            <span className="max-w-[400px] truncate">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};
