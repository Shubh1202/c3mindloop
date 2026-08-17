'use client';

/**
 * LocalAIPanel - Shared, 100% client-side AI assist panel
 *
 * Architecture:
 *  - Tier 1: Deterministic rule engines for JSON Smart Repair and Regex Generation.
 *            Runs instantly. Zero network. Always available.
 *  - Tier 2: Transformers.js model (Xenova/flan-t5-small, ~65MB quantized) via Web Worker.
 *            Lazy-loaded only when the developer explicitly clicks "Load Model".
 *            The Web Worker runs off the main thread in /public/ai-worker.js.
 *            Models are browser-cached after the first download.
 *  - No network requests until Tier 2 is explicitly opted into.
 *  - No data leaves the browser at any point.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Bot, X, Wand2, ChevronDown, ChevronUp, Cpu, ShieldCheck,
  Loader2, AlertCircle, Zap, Download, CheckCircle2, Info,
  BrainCircuit, ChevronRight,
} from 'lucide-react';

// ── JSON Smart Repair Engine ───────────────────────────────────────────────

/**
 * Deterministic rule-based JSON repair. Handles the most common malformed
 * patterns developers encounter: trailing commas, single quotes, missing
 * closing brackets/braces, unquoted keys, and JavaScript comments.
 */
export function smartRepairJson(raw: string): { fixed: string; changes: string[] } {
  const changes: string[] = [];
  let s = raw.trim();

  // 1. Strip single-line comments (// ...)
  const stripped1 = s.replace(/\/\/[^\n]*/g, '');
  if (stripped1 !== s) { changes.push('Removed single-line comments (//)'); s = stripped1; }

  // 2. Strip block comments (/* ... */)
  const stripped2 = s.replace(/\/\*[\s\S]*?\*\//g, '');
  if (stripped2 !== s) { changes.push('Removed block comments (/* */)'); s = stripped2; }

  // 3. Replace single-quoted strings with double-quoted (simple heuristic)
  const dq = s.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');
  if (dq !== s) { changes.push('Converted single quotes to double quotes'); s = dq; }

  // 4. Remove trailing commas before } or ]
  const tc = s.replace(/,\s*([\}\]])/g, '$1');
  if (tc !== s) { changes.push('Removed trailing commas'); s = tc; }

  // 5. Quote unquoted object keys: { key: "value" } → { "key": "value" }
  const qk = s.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
  if (qk !== s) { changes.push('Quoted unquoted object keys'); s = qk; }

  // 6. Balance mismatched brackets/braces
  const stack: string[] = [];
  const pairs: Record<string, string> = { '{': '}', '[': ']' };
  const closePairs: Record<string, string> = { '}': '{', ']': '[' };
  let inStr = false;
  let escape = false;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inStr) { escape = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === '{' || ch === '[') stack.push(ch);
    if ((ch === '}' || ch === ']') && stack.length && stack[stack.length - 1] === closePairs[ch]) {
      stack.pop();
    }
  }

  const closing = stack.map(c => pairs[c]).reverse().join('');
  if (closing) {
    changes.push(`Added ${closing.length} missing closing character(s): ${closing}`);
    s = s + closing;
  }

  // 7. Validate result
  try {
    JSON.parse(s);
  } catch {
    changes.push('⚠️ Partial repair - manual review still required for complex errors');
  }

  return { fixed: s, changes };
}

// ── Regex Generator Engine ────────────────────────────────────────────────

interface RegexPattern {
  keywords: string[];
  pattern: string;
  flags: string;
  description: string;
}

const REGEX_KNOWLEDGE_BASE: RegexPattern[] = [
  {
    keywords: ['email', 'e-mail', 'mail address'],
    pattern: '^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$',
    flags: 'i',
    description: 'RFC-5322 simplified email address'
  },
  {
    keywords: ['url', 'link', 'website', 'http', 'https'],
    pattern: 'https?:\\/\\/(www\\.)?[\\w\\-]+(\\.[\\w]{2,})+(\\/[\\w\\-._~:/?#[\\]@!$&\'()*+,;=]*)?',
    flags: 'gi',
    description: 'HTTP/HTTPS URL'
  },
  {
    keywords: ['phone', 'telephone', 'mobile', 'phone number'],
    pattern: '^[+]?[(]?[0-9]{1,4}[)]?[-\\s.]?[0-9]{1,4}[-\\s.]?[0-9]{4,10}$',
    flags: '',
    description: 'International phone number'
  },
  {
    keywords: ['ip address', 'ipv4', 'ip'],
    pattern: '\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\b',
    flags: 'g',
    description: 'IPv4 address'
  },
  {
    keywords: ['ipv6'],
    pattern: '([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}',
    flags: 'gi',
    description: 'IPv6 address (simplified)'
  },
  {
    keywords: ['uuid', 'guid'],
    pattern: '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}',
    flags: 'gi',
    description: 'UUID / GUID'
  },
  {
    keywords: ['date', 'yyyy-mm-dd', 'iso date'],
    pattern: '\\b\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\b',
    flags: 'g',
    description: 'ISO 8601 date (YYYY-MM-DD)'
  },
  {
    keywords: ['time', 'hh:mm', 'hours minutes'],
    pattern: '\\b([01]?\\d|2[0-3]):([0-5]\\d)(:[0-5]\\d)?\\b',
    flags: 'g',
    description: '24-hour time (HH:MM or HH:MM:SS)'
  },
  {
    keywords: ['hex color', 'color code', 'hex code', 'css color'],
    pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b',
    flags: 'gi',
    description: 'CSS hex color code'
  },
  {
    keywords: ['credit card', 'card number', 'visa', 'mastercard'],
    pattern: '\\b(?:4[0-9]{12}(?:[0-9]{3})?|(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}|3[47][0-9]{13})\\b',
    flags: 'g',
    description: 'Visa / Mastercard / Amex credit card number'
  },
  {
    keywords: ['zip code', 'postal code', 'us zip'],
    pattern: '\\b\\d{5}(?:-\\d{4})?\\b',
    flags: 'g',
    description: 'US ZIP code (5 or 9 digit)'
  },
  {
    keywords: ['username', 'user name', 'handle', 'slug'],
    pattern: '^[a-zA-Z0-9_\\-]{3,20}$',
    flags: '',
    description: 'Username / handle (3-20 alphanumeric, _ or -)'
  },
  {
    keywords: ['password', 'strong password'],
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    flags: '',
    description: 'Strong password (min 8 chars, uppercase, lowercase, digit, symbol)'
  },
  {
    keywords: ['integer', 'whole number', 'number only', 'digits only'],
    pattern: '^-?\\d+$',
    flags: '',
    description: 'Integer (positive or negative)'
  },
  {
    keywords: ['decimal', 'float', 'floating point'],
    pattern: '^-?\\d+(\\.\\d+)?$',
    flags: '',
    description: 'Decimal / float number'
  },
  {
    keywords: ['alphanumeric', 'letters and numbers'],
    pattern: '^[a-zA-Z0-9]+$',
    flags: '',
    description: 'Alphanumeric string only'
  },
  {
    keywords: ['whitespace', 'blank line', 'empty line'],
    pattern: '^\\s*$',
    flags: 'gm',
    description: 'Empty or whitespace-only lines'
  },
  {
    keywords: ['html tag', 'html element', 'xml tag'],
    pattern: '<[^>]+>',
    flags: 'gi',
    description: 'HTML / XML tags'
  },
  {
    keywords: ['markdown link', 'markdown url'],
    pattern: '\\[([^\\]]+)\\]\\((https?://[^)]+)\\)',
    flags: 'gi',
    description: 'Markdown hyperlink syntax [text](url)'
  },
  {
    keywords: ['jwt', 'json web token', 'bearer token'],
    pattern: '^[A-Za-z0-9_-]{2,}\\.[A-Za-z0-9_-]{2,}\\.[A-Za-z0-9_-]{2,}$',
    flags: '',
    description: 'JWT (3 Base64url parts separated by dots)'
  },
  {
    keywords: ['semver', 'semantic version', 'version number'],
    pattern: '^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$',
    flags: '',
    description: 'Semantic Version (semver.org spec)'
  },
  {
    keywords: ['mac address', 'network address'],
    pattern: '^([0-9A-Fa-f]{2}[:\\-]){5}([0-9A-Fa-f]{2})$',
    flags: '',
    description: 'MAC address'
  },
  {
    keywords: ['base64', 'base 64'],
    pattern: '^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$',
    flags: '',
    description: 'Base64 encoded string'
  },
];

export function generateRegexFromDescription(input: string): {
  pattern: string;
  flags: string;
  description: string;
  confidence: 'high' | 'medium' | 'low';
} | null {
  const lower = input.toLowerCase();

  let bestMatch: RegexPattern | null = null;
  let bestScore = 0;

  for (const entry of REGEX_KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) {
        score += kw.split(' ').length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (!bestMatch || bestScore === 0) return null;

  const confidence: 'high' | 'medium' | 'low' = bestScore >= 2 ? 'high' : bestScore === 1 ? 'medium' : 'low';
  return {
    pattern: bestMatch.pattern,
    flags: bestMatch.flags,
    description: bestMatch.description,
    confidence,
  };
}

// ── Tier 2: Web Worker Provider Hook ─────────────────────────────────────

type WorkerStatus = 'idle' | 'loading' | 'ready' | 'error';

interface WorkerProgress {
  stage: string;
  percent: number;
}

interface UseLocalAIWorkerReturn {
  status: WorkerStatus;
  progress: WorkerProgress;
  errorMsg: string | null;
  loadModel: () => void;
  runInfer: (task: string, payload: string, onResult: (output: string) => void) => void;
}

function useLocalAIWorker(): UseLocalAIWorkerReturn {
  const workerRef = useRef<Worker | null>(null);
  const pendingCallbackRef = useRef<((output: string) => void) | null>(null);

  const [status, setStatus] = useState<WorkerStatus>('idle');
  const [progress, setProgress] = useState<WorkerProgress>({ stage: '', percent: 0 });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const loadModel = useCallback(() => {
    if (status === 'loading' || status === 'ready') return;

    setStatus('loading');
    setErrorMsg(null);
    setProgress({ stage: 'Initializing Web Worker...', percent: 0 });

    try {
      // Instantiate worker lazily from static public asset
      const worker = new Worker('/ai-worker.js');
      workerRef.current = worker;

      worker.onmessage = (event) => {
        const { type, stage, progress: pct, output, task, message } = event.data;

        switch (type) {
          case 'progress':
            setProgress({ stage: stage || 'Loading...', percent: pct ?? 0 });
            break;
          case 'ready':
            setStatus('ready');
            setProgress({ stage: 'Model ready', percent: 100 });
            break;
          case 'result':
            if (pendingCallbackRef.current) {
              pendingCallbackRef.current(output);
              pendingCallbackRef.current = null;
            }
            break;
          case 'error':
            setStatus('error');
            setErrorMsg(message || 'Unknown worker error');
            pendingCallbackRef.current = null;
            break;
          default:
            break;
        }
      };

      worker.onerror = (err) => {
        setStatus('error');
        setErrorMsg(`Worker error: ${err.message || 'Script failed to load'}`);
      };

      // Send load command
      worker.postMessage({ type: 'load' });
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(`Failed to create Web Worker: ${err.message || 'Unknown error'}`);
    }
  }, [status]);

  const runInfer = useCallback((
    task: string,
    payload: string,
    onResult: (output: string) => void
  ) => {
    if (!workerRef.current || status !== 'ready') return;
    pendingCallbackRef.current = onResult;
    workerRef.current.postMessage({ type: 'infer', task, payload });
  }, [status]);

  return { status, progress, errorMsg, loadModel, runInfer };
}

// ── Component ─────────────────────────────────────────────────────────────

type PanelMode = 'json-repair' | 'regex-gen';

interface LocalAIPanelProps {
  mode: PanelMode;
  rawJson?: string;
  onApplyJson?: (fixed: string) => void;
  onApplyRegex?: (pattern: string, flags: string) => void;
}

export const LocalAIPanel: React.FC<LocalAIPanelProps> = ({
  mode,
  rawJson = '',
  onApplyJson,
  onApplyRegex,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [showTier2, setShowTier2] = useState(false);

  // Tier 1 - JSON repair
  const [repairResult, setRepairResult] = useState<{ fixed: string; changes: string[] } | null>(null);
  const [repairError, setRepairError] = useState<string | null>(null);

  // Tier 1 - Regex gen
  const [regexDescription, setRegexDescription] = useState('');
  const [regexResult, setRegexResult] = useState<{
    pattern: string; flags: string; description: string; confidence: 'high' | 'medium' | 'low';
  } | null>(null);
  const [regexError, setRegexError] = useState<string | null>(null);

  // Tier 2 - AI explanation output
  const [tier2Output, setTier2Output] = useState<string | null>(null);
  const [tier2Working, setTier2Working] = useState(false);

  // Web Worker provider
  const { status: workerStatus, progress, errorMsg: workerError, loadModel, runInfer } = useLocalAIWorker();

  const handleRepair = useCallback(() => {
    if (!rawJson.trim()) { setRepairError('No input JSON to repair.'); return; }
    setIsWorking(true);
    setRepairResult(null);
    setRepairError(null);
    setTier2Output(null);
    requestAnimationFrame(() => {
      setTimeout(() => {
        try {
          setRepairResult(smartRepairJson(rawJson));
        } catch {
          setRepairError('Repair engine encountered an unexpected error.');
        }
        setIsWorking(false);
      }, 200);
    });
  }, [rawJson]);

  const handleGenerateRegex = useCallback(() => {
    if (!regexDescription.trim()) { setRegexError('Please describe the pattern you need.'); return; }
    setIsWorking(true);
    setRegexResult(null);
    setRegexError(null);
    setTier2Output(null);
    requestAnimationFrame(() => {
      setTimeout(() => {
        const result = generateRegexFromDescription(regexDescription);
        if (result) { setRegexResult(result); }
        else { setRegexError('No matching pattern found. Try: email, UUID, JWT, phone number, semver, etc.'); }
        setIsWorking(false);
      }, 200);
    });
  }, [regexDescription]);

  // Tier 2: explain a generated regex or repaired JSON via the AI model
  const handleTier2Explain = useCallback(() => {
    if (workerStatus !== 'ready') return;
    setTier2Working(true);
    setTier2Output(null);

    if (mode === 'regex-gen' && regexResult) {
      runInfer('regex-explain', regexResult.pattern, (output) => {
        setTier2Output(output);
        setTier2Working(false);
      });
    } else if (mode === 'json-repair' && repairResult) {
      runInfer('json-explain', repairResult.fixed, (output) => {
        setTier2Output(output);
        setTier2Working(false);
      });
    }
  }, [workerStatus, mode, regexResult, repairResult, runInfer]);

  const confidenceColor = (c: 'high' | 'medium' | 'low') =>
    ({ high: 'text-emerald-400', medium: 'text-amber-400', low: 'text-red-400' })[c];

  const confidenceBg = (c: 'high' | 'medium' | 'low') =>
    ({ high: 'bg-emerald-500/10 border-emerald-500/20', medium: 'bg-amber-500/10 border-amber-500/20', low: 'bg-red-500/10 border-red-500/20' })[c];

  // Derive whether Tier 2 explain button should appear
  const canExplain = (mode === 'regex-gen' && !!regexResult) || (mode === 'json-repair' && !!repairResult);

  return (
    <div className="w-full">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-mono font-semibold transition-all cursor-pointer border ${
          isOpen
            ? 'bg-[#1D9BF0]/15 border-[#1D9BF0]/40 text-[#1D9BF0]'
            : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600'
        }`}
      >
        <Bot className="w-3.5 h-3.5" />
        <span>🤖 Local AI Assist</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1D9BF0]/10 border border-[#1D9BF0]/20 text-[#1D9BF0] font-bold uppercase tracking-wide">
          100% In-Browser
        </span>
        {isOpen ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
      </button>

      {isOpen && (
        <div className="mt-2 rounded-lg border border-neutral-800 bg-neutral-950 overflow-hidden">

          {/* Panel Header */}
          <div className="px-4 py-2.5 bg-neutral-900/80 border-b border-neutral-800 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-[#1D9BF0]" />
              <span className="text-[11px] font-mono font-semibold text-neutral-300">
                {mode === 'json-repair' ? 'JSON Smart Repair Engine' : 'Regex Pattern Generator'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500">
              <ShieldCheck className="w-3 h-3 text-emerald-500/70" />
              <span>Runs on your GPU/CPU via browser · Zero byte leaves your device</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-0.5 rounded hover:bg-neutral-800 text-neutral-500 hover:text-neutral-300 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 space-y-4">

            {/* ── TIER 1: Deterministic Engine ── */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                <Zap className="w-3 h-3 text-[#1D9BF0]" />
                <span>Tier 1 - Instant Rule Engine</span>
              </div>

              {mode === 'json-repair' && (
                <>
                  <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                    Analyzes your JSON input for common errors: trailing commas, single quotes, JS comments, unquoted keys, and missing closing brackets. All processing runs locally - no data leaves your browser.
                  </p>
                  <button
                    onClick={handleRepair}
                    disabled={isWorking}
                    className="flex items-center gap-2 px-4 py-2 rounded bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white text-xs font-mono font-semibold transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isWorking
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Analyzing...</span></>
                      : <><Wand2 className="w-3.5 h-3.5" /><span>Run Smart Repair</span></>}
                  </button>

                  {repairError && (
                    <div className="flex items-start gap-2 p-3 rounded bg-red-950/40 border border-red-900/60 text-xs text-red-300 font-mono">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{repairError}</span>
                    </div>
                  )}

                  {repairResult && (
                    <div className="space-y-3">
                      {repairResult.changes.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Detected &amp; Applied Fixes</p>
                          <div className="space-y-1">
                            {repairResult.changes.map((c, i) => (
                              <div key={i} className="flex items-start gap-2 text-[11px] font-mono text-neutral-300">
                                <span className="text-emerald-400 shrink-0">✓</span>
                                <span>{c}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="rounded border border-neutral-800 overflow-hidden">
                        <div className="px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                          Repaired Output Preview
                        </div>
                        <pre className="p-3 text-[11px] font-mono text-emerald-300 leading-relaxed whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
                          {repairResult.fixed}
                        </pre>
                      </div>
                      {onApplyJson && (
                        <button
                          onClick={() => { onApplyJson(repairResult.fixed); setIsOpen(false); }}
                          className="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-mono font-semibold transition-all cursor-pointer"
                        >
                          <span>Apply to Editor</span>
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}

              {mode === 'regex-gen' && (
                <>
                  <p className="text-[11px] text-neutral-400 font-sans leading-relaxed">
                    Describe what you want to match in plain English. Maps to a battle-tested pattern from 23+ built-in templates. Runs 100% in your browser - zero data sent anywhere.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={regexDescription}
                      onChange={e => { setRegexDescription(e.target.value); setRegexResult(null); setRegexError(null); }}
                      onKeyDown={e => e.key === 'Enter' && handleGenerateRegex()}
                      placeholder="e.g. email address, UUID, JWT, phone number, semver..."
                      className="flex-1 px-3 py-2 rounded bg-neutral-900 border border-neutral-800 focus:border-[#1D9BF0] focus:outline-none text-xs font-mono text-neutral-100 placeholder-neutral-600"
                    />
                    <button
                      onClick={handleGenerateRegex}
                      disabled={isWorking || !regexDescription.trim()}
                      className="flex items-center gap-1.5 px-3 py-2 rounded bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white text-xs font-mono font-semibold transition-all cursor-pointer disabled:opacity-60"
                    >
                      {isWorking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                      <span>Generate</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {['email address', 'UUID', 'IPv4 address', 'JWT', 'semver', 'hex color', 'base64', 'strong password'].map(ex => (
                      <button
                        key={ex}
                        onClick={() => { setRegexDescription(ex); setRegexResult(null); setRegexError(null); }}
                        className="px-2 py-0.5 text-[10px] font-mono rounded bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-[#1D9BF0] hover:border-[#1D9BF0]/30 transition-colors cursor-pointer"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>

                  {regexError && (
                    <div className="flex items-start gap-2 p-3 rounded bg-red-950/40 border border-red-900/60 text-xs text-red-300 font-mono">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{regexError}</span>
                    </div>
                  )}

                  {regexResult && (
                    <div className="space-y-3">
                      <div className={`flex items-center gap-2 px-2 py-1 rounded border text-[11px] font-mono ${confidenceBg(regexResult.confidence)}`}>
                        <CheckCircle2 className={`w-3 h-3 shrink-0 ${confidenceColor(regexResult.confidence)}`} />
                        <span className={`font-semibold ${confidenceColor(regexResult.confidence)}`}>
                          {regexResult.confidence.toUpperCase()}
                        </span>
                        <span className="text-neutral-400">- {regexResult.description}</span>
                      </div>
                      <div className="rounded border border-neutral-800 overflow-hidden">
                        <div className="px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 text-[10px] font-mono text-neutral-500 uppercase tracking-wider flex items-center justify-between">
                          <span>Generated Pattern</span>
                          {regexResult.flags && (
                            <span className="text-[#1D9BF0]">flags: <strong>{regexResult.flags}</strong></span>
                          )}
                        </div>
                        <pre className="p-3 text-xs font-mono text-emerald-300 leading-relaxed whitespace-pre-wrap break-all">
                          {regexResult.pattern}
                        </pre>
                      </div>
                      {onApplyRegex && (
                        <button
                          onClick={() => { onApplyRegex(regexResult.pattern, regexResult.flags); setIsOpen(false); }}
                          className="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-mono font-semibold transition-all cursor-pointer"
                        >
                          <span>Apply Pattern to Tester</span>
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── TIER 2: AI Model (Opt-in) ── */}
            <div className="border-t border-neutral-800 pt-3 space-y-2">
              <button
                onClick={() => setShowTier2(v => !v)}
                className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer uppercase tracking-wider"
              >
                <BrainCircuit className="w-3 h-3 text-neutral-600" />
                <span>Tier 2 - AI Model (Opt-in, ~65 MB)</span>
                <ChevronRight className={`w-3 h-3 transition-transform ${showTier2 ? 'rotate-90' : ''}`} />
              </button>

              {showTier2 && (
                <div className="space-y-3 pl-0">
                  {/* Status / CTA row */}
                  {workerStatus === 'idle' && (
                    <div className="rounded border border-neutral-800 bg-neutral-900/50 p-3 space-y-2">
                      <div className="flex items-start gap-2 text-[11px] font-sans text-neutral-400 leading-relaxed">
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-neutral-500" />
                        <span>
                          Loads <strong className="text-neutral-300">Xenova/flan-t5-small</strong> (quantized int8, ~65 MB) into a Web Worker.
                          Model runs entirely on your CPU/GPU. Downloaded once and cached by the browser.
                          Adds plain-English explanations to Tier 1 results.
                        </span>
                      </div>
                      <button
                        onClick={loadModel}
                        className="flex items-center gap-2 px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 text-neutral-300 text-[11px] font-mono font-semibold transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Load Model (~65 MB, one-time)</span>
                      </button>
                    </div>
                  )}

                  {workerStatus === 'loading' && (
                    <div className="rounded border border-neutral-800 bg-neutral-900/50 p-3 space-y-2">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-300">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1D9BF0]" />
                        <span>{progress.stage}</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-1.5 bg-[#1D9BF0] rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(4, progress.percent)}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-mono text-neutral-600">
                        {progress.percent > 0 ? `${progress.percent}%` : 'Starting...'}
                      </p>
                    </div>
                  )}

                  {workerStatus === 'error' && (
                    <div className="flex items-start gap-2 p-3 rounded bg-red-950/40 border border-red-900/60 text-xs text-red-300 font-mono">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="block">{workerError}</span>
                        <button
                          onClick={loadModel}
                          className="text-[10px] text-red-400 hover:text-red-200 underline underline-offset-2 cursor-pointer"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  )}

                  {workerStatus === 'ready' && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Model ready · flan-t5-small loaded in Web Worker</span>
                      </div>

                      {canExplain && (
                        <button
                          onClick={handleTier2Explain}
                          disabled={tier2Working}
                          className="flex items-center gap-2 px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 text-[11px] font-mono font-semibold transition-all cursor-pointer disabled:opacity-60"
                        >
                          {tier2Working
                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Explaining...</span></>
                            : <><BrainCircuit className="w-3.5 h-3.5" /><span>Explain with AI</span></>}
                        </button>
                      )}

                      {tier2Output && (
                        <div className="rounded border border-neutral-800 bg-neutral-900/60 overflow-hidden">
                          <div className="px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 text-[10px] font-mono text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                            <BrainCircuit className="w-3 h-3" />
                            <span>AI Explanation (flan-t5-small)</span>
                          </div>
                          <p className="p-3 text-[11px] font-sans text-neutral-300 leading-relaxed">
                            {tier2Output}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
