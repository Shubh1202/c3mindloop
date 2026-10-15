'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Play,
  Square,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  Terminal,
  Upload,
  AlertTriangle,
  Clock,
  Cpu,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useTheme } from '../../lib/theme';

// ─── Language Definitions ──────────────────────────────────────────────────

export interface Language {
  id: string;
  name: string;
  langKey: string;
  version: string;
  extension: string;
  defaultCode: string;
  monoColor: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  {
    id: 'python',
    name: 'Python',
    langKey: 'python',
    version: '3.14.0',
    extension: 'py',
    monoColor: '#3B82F6',
    defaultCode: `# Python
def greet(name: str) -> str:
    return f"Hello, {name}!"

name = input("Enter your name: ") if False else "World"
print(greet(name))
print("\\nFibonacci sequence:")
a, b = 0, 1
for _ in range(10):
    print(a, end=" ")
    a, b = b, a + b
print()
`,
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    langKey: 'javascript',
    version: 'Node.js 24',
    extension: 'js',
    monoColor: '#F59E0B',
    defaultCode: `// JavaScript (Node.js)
console.log("Hello, World!");

console.log("\\nFibonacci sequence:");
let [a, b] = [0, 1];
const fib = [];
for (let i = 0; i < 10; i++) {
  fib.push(a);
  [a, b] = [b, a + b];
}
console.log(fib.join(' '));
`,
  },
  {
    id: 'java',
    name: 'Java',
    langKey: 'java',
    version: 'JDK 21',
    extension: 'java',
    monoColor: '#EF4444',
    defaultCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");

        System.out.println("\\nFibonacci sequence:");
        int a = 0, b = 1;
        for (int i = 0; i < 10; i++) {
            System.out.print(a + " ");
            int temp = a + b;
            a = b;
            b = temp;
        }
        System.out.println();
    }
}
`,
  },
  {
    id: 'c',
    name: 'C',
    langKey: 'c',
    version: 'GCC 13/14',
    extension: 'c',
    monoColor: '#8B5CF6',
    defaultCode: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");

    printf("\\nFibonacci sequence:\\n");
    int a = 0, b = 1;
    for (int i = 0; i < 10; i++) {
        printf("%d ", a);
        int temp = a + b;
        a = b;
        b = temp;
    }
    printf("\\n");
    return 0;
}
`,
  },
  {
    id: 'cpp',
    name: 'C++',
    langKey: 'c++',
    version: 'G++ 14',
    extension: 'cpp',
    monoColor: '#06B6D4',
    defaultCode: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;

    cout << "\\nFibonacci sequence:" << endl;
    int a = 0, b = 1;
    for (int i = 0; i < 10; i++) {
        cout << a << " ";
        int temp = a + b;
        a = b;
        b = temp;
    }
    cout << endl;
    return 0;
}
`,
  },
  {
    id: 'php',
    name: 'PHP',
    langKey: 'php',
    version: 'PHP 8.3',
    extension: 'php',
    monoColor: '#6366F1',
    defaultCode: `<?php
// PHP 8.3 Runner
$name = trim(fgets(STDIN));
if (empty($name)) {
    $name = "World";
}

echo "Hello, {$name}!\n\n";

echo "PHP Version: " . phpversion() . "\n";
echo "Fibonacci sequence:\n";

$a = 0;
$b = 1;
for ($i = 0; $i < 10; $i++) {
    echo $a . " ";
    $temp = $a + $b;
    $a = $b;
    $b = $temp;
}
echo "\n";
`,
  },
];

// ─── Self-Hosted Compiler API ────────────────────────────────────────────────

const COMPILER_API = '/api/compiler/execute';

interface CompilerResponse {
  stdout: string;
  stderr: string;
  exitCode: number;
  runtime: number;
  compileError?: string;
}

async function runCode(
  language: Language,
  code: string,
  stdin: string
): Promise<{ output: string; error: string; exitCode: number; runtime: number }> {
  const res = await fetch(COMPILER_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: language.langKey,
      code,
      stdin,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Compiler error ${res.status}: ${text}`);
  }

  const data: CompilerResponse = await res.json();

  return {
    output: data.stdout || '',
    error: data.stderr || '',
    exitCode: data.exitCode,
    runtime: data.runtime,
  };
}

// ─── Language Selector ────────────────────────────────────────────────────

function LanguageSelector({
  selected,
  onSelect,
  isDark = true,
}: {
  selected: Language;
  onSelect: (lang: Language) => void;
  isDark?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id="language-selector-btn"
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-medium border transition-all cursor-pointer ${
          isDark
            ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:border-neutral-600 hover:bg-neutral-750'
            : 'bg-[#FFFFFF] border-[#D4D4D8] text-[#18181B] hover:border-[#A1A1AA] hover:bg-[#F4F4F5] shadow-xs'
        }`}
      >
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: selected.monoColor }}
        />
        <span>{selected.name}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''} ${
            isDark ? 'text-neutral-400' : 'text-[#71717A]'
          }`}
        />
      </button>

      {open && (
        <div
          className={`absolute left-0 top-full mt-1.5 z-50 rounded-lg border py-1 min-w-[160px] shadow-2xl font-mono text-xs ${
            isDark
              ? 'bg-neutral-900 border-neutral-700 text-neutral-300'
              : 'bg-[#FFFFFF] border-[#E4E4E7] text-[#18181B] shadow-xl'
          }`}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              id={`lang-select-${lang.id}`}
              type="button"
              onClick={() => {
                onSelect(lang);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono text-left transition-colors cursor-pointer ${
                lang.id === selected.id
                  ? isDark
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'bg-[#1D9BF0]/10 text-[#1D9BF0] font-semibold'
                  : isDark
                    ? 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                    : 'text-[#3F3F46] hover:bg-[#F4F4F5] hover:text-[#18181B]'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: lang.monoColor }}
              />
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Tool Component ──────────────────────────────────────────────────

type RunStatus = 'idle' | 'running' | 'success' | 'error';

interface OutputResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  runtime: number;
}

export const CodeRunnerTool: React.FC = () => {
  const { isDark } = useTheme();
  const [language, setLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]);
  const [code, setCode] = useState(SUPPORTED_LANGUAGES[0].defaultCode);
  const [stdin, setStdin] = useState('World\n');
  const [status, setStatus] = useState<RunStatus>('idle');
  const [result, setResult] = useState<OutputResult | null>(null);
  const [copied, setCopied] = useState<'code' | 'output' | null>(null);
  const [showStdin, setShowStdin] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRun = useCallback(async () => {
    if (status === 'running') return;
    setStatus('running');
    setResult(null);

    try {
      const { output, error, exitCode, runtime } = await runCode(language, code, stdin);
      setResult({ stdout: output, stderr: error, exitCode, runtime });
      setStatus(exitCode === 0 && !error ? 'success' : 'error');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setResult({ stdout: '', stderr: message, exitCode: -1, runtime: 0 });
      setStatus('error');
    }
  }, [code, language, stdin, status]);

  // ── Keyboard shortcuts: Escape exits fullscreen, Ctrl+Enter / Cmd+Enter runs code
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullScreen, handleRun]);

  // ── Lock body scrolling when in fullscreen mode
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullScreen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = ta.value.substring(0, start) + '  ' + ta.value.substring(end);
      setCode(newVal);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCode(lang.defaultCode);
    setResult(null);
    setStatus('idle');
  };

  const handleReset = () => {
    setCode(language.defaultCode);
    setResult(null);
    setStatus('idle');
  };

  const handleCopy = async (type: 'code' | 'output') => {
    const text = type === 'code' ? code : (result?.stdout || '') + (result?.stderr || '');
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCode(ev.target?.result as string);
    reader.readAsText(file);
    e.target.value = '';
  };

  const lines = code.split('\n');

  // Secondary button styling based on theme
  const secondaryBtnClass = `flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono border transition-all cursor-pointer ${
    isDark
      ? 'bg-neutral-800/50 border-neutral-700/50 text-neutral-300 hover:text-white hover:border-neutral-600'
      : 'bg-[#FFFFFF] border-[#D4D4D8] text-[#52525B] hover:text-[#18181B] hover:border-[#A1A1AA] hover:bg-[#F4F4F5] shadow-xs'
  }`;

  const toolContent = (
    <div
      className={`developer-tool-container font-sans flex flex-col transition-all duration-200 ${
        isDark
          ? 'bg-neutral-950 border-neutral-800 text-neutral-100'
          : 'bg-[#FFFFFF] border-[#E4E4E7] text-[#111111]'
      } ${
        isFullScreen
          ? 'fixed inset-0 z-[99999] overflow-hidden rounded-none border-none'
          : 'w-full rounded-xl border overflow-hidden shadow-2xl'
      }`}
    >
      {/* ── Toolbar ── */}
      <div
        className={`flex items-center justify-between gap-3 px-4 py-2.5 border-b flex-wrap gap-y-2 shrink-0 ${
          isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-[#F8F9FA] border-[#E4E4E7]'
        }`}
      >
        <div className="flex items-center gap-3">
          <LanguageSelector selected={language} onSelect={handleLanguageChange} isDark={isDark} />

          <button
            type="button"
            onClick={() => setShowStdin((p) => !p)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono border transition-all cursor-pointer ${
              showStdin
                ? isDark
                  ? 'bg-neutral-700 border-neutral-600 text-neutral-200'
                  : 'bg-[#1D9BF0]/15 border-[#1D9BF0]/40 text-[#1D9BF0] font-semibold'
                : secondaryBtnClass
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            stdin
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="code-upload" className={secondaryBtnClass}>
            <Upload className="w-3.5 h-3.5" />
            Upload
            <input
              id="code-upload"
              type="file"
              accept=".py,.js,.ts,.java,.c,.cpp,.go,.rb,.php,.rs,.cs"
              className="sr-only"
              onChange={handleUpload}
            />
          </label>

          <button
            type="button"
            id="copy-code-btn"
            onClick={() => handleCopy('code')}
            className={secondaryBtnClass}
          >
            {copied === 'code' ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied === 'code' ? 'Copied' : 'Copy'}
          </button>

          <button
            type="button"
            id="reset-code-btn"
            onClick={handleReset}
            className={secondaryBtnClass}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          <button
            type="button"
            id="fullscreen-code-btn"
            onClick={() => setIsFullScreen((p) => !p)}
            title={isFullScreen ? 'Exit Full Screen (Esc)' : 'Full Screen'}
            className={secondaryBtnClass}
          >
            {isFullScreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-[#1D9BF0]" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{isFullScreen ? 'Exit' : 'Full Screen'}</span>
          </button>

          <button
            type="button"
            id="run-code-btn"
            onClick={handleRun}
            disabled={status === 'running' || !code.trim()}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold font-mono transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              status === 'running'
                ? isDark
                  ? 'bg-neutral-700 text-neutral-300 border border-neutral-600'
                  : 'bg-neutral-300 text-neutral-600 border border-neutral-400'
                : 'bg-[#1D9BF0] text-white hover:bg-[#1A8CD8] border border-[#1D9BF0]/50 shadow-md shadow-[#1D9BF0]/20'
            }`}
          >
            {status === 'running' ? (
              <>
                <Square className="w-3.5 h-3.5 animate-pulse" />
                Running…
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Run
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Stdin ── */}
      {showStdin && (
        <div
          className={`border-b px-4 py-2.5 shrink-0 ${
            isDark ? 'border-neutral-800 bg-neutral-900/60' : 'border-[#E4E4E7] bg-[#F8F9FA]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <Terminal className={`w-3.5 h-3.5 ${isDark ? 'text-neutral-500' : 'text-[#71717A]'}`} />
            <span
              className={`text-xs font-mono font-medium ${
                isDark ? 'text-neutral-400' : 'text-[#52525B]'
              }`}
            >
              Standard Input (stdin)
            </span>
          </div>
          <textarea
            id="stdin-input"
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Enter program input here..."
            rows={3}
            className={`w-full rounded-md px-3 py-2 text-sm font-mono focus:outline-none resize-y border transition-colors ${
              isDark
                ? 'bg-neutral-950 border-neutral-800 text-neutral-200 placeholder-neutral-600 focus:border-neutral-600'
                : 'bg-[#FFFFFF] border-[#D4D4D8] text-[#18181B] placeholder-[#A1A1AA] focus:border-[#1D9BF0]'
            }`}
          />
        </div>
      )}

      {/* ── Editor + Output ── */}
      <div
        className={`flex flex-col lg:flex-row ${
          isFullScreen ? 'flex-1 min-h-0 overflow-hidden' : 'min-h-[520px]'
        }`}
      >
        {/* Code Editor */}
        <div
          className={`flex-1 flex flex-col border-b lg:border-b-0 lg:border-r min-h-0 ${
            isDark ? 'border-neutral-800' : 'border-[#E4E4E7]'
          }`}
        >
          <div
            className={`flex items-center justify-between px-4 py-1.5 border-b shrink-0 ${
              isDark
                ? 'bg-neutral-900/50 border-neutral-800 text-neutral-400'
                : 'bg-[#F8F9FA] border-[#E4E4E7] text-[#71717A]'
            }`}
          >
            <span className="text-xs font-mono font-medium">main.{language.extension}</span>
            <span className="text-xs font-mono">{lines.length} lines</span>
          </div>

          <div
            className={`flex flex-1 overflow-auto min-h-0 ${
              isDark ? 'bg-neutral-950' : 'bg-[#FFFFFF]'
            }`}
          >
            {/* Line numbers */}
            <div
              className={`select-none pt-3 pb-3 pl-3 pr-2 text-right font-mono text-xs leading-6 border-r sticky left-0 ${
                isDark
                  ? 'text-neutral-600 border-neutral-800/60 bg-neutral-950'
                  : 'text-[#A1A1AA] border-[#E4E4E7] bg-[#FAFAFA]'
              }`}
              aria-hidden="true"
              style={{ minWidth: '3rem' }}
            >
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              id="code-editor-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              autoComplete="off"
              className={`flex-1 resize-none bg-transparent pt-3 pb-3 pl-3 pr-4 font-mono text-sm leading-6 focus:outline-none ${
                isDark
                  ? 'text-neutral-100 placeholder-neutral-600'
                  : 'text-[#18181B] placeholder-[#A1A1AA]'
              }`}
              style={{ tabSize: 2, minHeight: '100%' }}
            />
          </div>
        </div>

        {/* Output Panel */}
        <div
          className={`flex-1 flex flex-col min-h-0 ${
            isFullScreen ? 'h-full' : 'min-h-[240px]'
          }`}
        >
          <div
            className={`flex items-center justify-between px-4 py-1.5 border-b shrink-0 ${
              isDark
                ? 'bg-neutral-900/50 border-neutral-800'
                : 'bg-[#F8F9FA] border-[#E4E4E7]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Terminal className={`w-3.5 h-3.5 ${isDark ? 'text-neutral-500' : 'text-[#71717A]'}`} />
              <span
                className={`text-xs font-mono font-medium ${
                  isDark ? 'text-neutral-400' : 'text-[#52525B]'
                }`}
              >
                Output
              </span>
              {result && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${
                    result.exitCode === 0 && !result.stderr
                      ? isDark
                        ? 'text-emerald-400 border-emerald-800/50 bg-emerald-950/40'
                        : 'text-emerald-700 border-emerald-300 bg-emerald-50'
                      : isDark
                        ? 'text-red-400 border-red-800/50 bg-red-950/40'
                        : 'text-red-700 border-red-300 bg-red-50'
                  }`}
                >
                  exit {result.exitCode}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {result && (
                <>
                  <span
                    className={`flex items-center gap-1 text-[10px] font-mono ${
                      isDark ? 'text-neutral-500' : 'text-[#71717A]'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {result.runtime}ms
                  </span>
                  <span
                    className={`flex items-center gap-1 text-[10px] font-mono ${
                      isDark ? 'text-neutral-500' : 'text-[#71717A]'
                    }`}
                  >
                    <Cpu className="w-3 h-3" />
                    {language.name}
                  </span>
                </>
              )}
              {(result?.stdout || result?.stderr) && (
                <button
                  type="button"
                  id="copy-output-btn"
                  onClick={() => handleCopy('output')}
                  className={`flex items-center gap-1 text-[10px] font-mono transition-colors cursor-pointer ${
                    isDark
                      ? 'text-neutral-400 hover:text-neutral-200'
                      : 'text-[#52525B] hover:text-[#18181B]'
                  }`}
                >
                  {copied === 'output' ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  {copied === 'output' ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
          </div>

          <div
            className={`flex-1 overflow-auto p-4 font-mono text-sm min-h-0 ${
              isDark ? 'bg-neutral-950' : 'bg-[#FAFAFA]'
            }`}
          >
            {status === 'idle' && !result && (
              <div
                className={`h-full flex flex-col items-center justify-center gap-3 ${
                  isDark ? 'text-neutral-600' : 'text-[#71717A]'
                }`}
              >
                <Play className="w-8 h-8 opacity-40" />
                <span className="text-sm font-medium">Press Run to execute your code</span>
              </div>
            )}

            {status === 'running' && (
              <div
                className={`h-full flex flex-col items-center justify-center gap-3 ${
                  isDark ? 'text-neutral-400' : 'text-[#52525B]'
                }`}
              >
                <div className="w-6 h-6 border-2 border-[#1D9BF0]/40 border-t-[#1D9BF0] rounded-full animate-spin" />
                <span className="text-sm font-mono font-medium">Executing…</span>
              </div>
            )}

            {result && (
              <div className="space-y-3">
                {result.stdout && (
                  <pre
                    className={`whitespace-pre-wrap leading-6 text-[13px] font-mono ${
                      isDark ? 'text-emerald-300' : 'text-emerald-800 font-medium'
                    }`}
                  >
                    {result.stdout}
                  </pre>
                )}
                {result.stderr && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertTriangle
                        className={`w-3.5 h-3.5 ${isDark ? 'text-red-400' : 'text-red-600'}`}
                      />
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wide font-semibold ${
                          isDark ? 'text-red-400' : 'text-red-600'
                        }`}
                      >
                        stderr / error
                      </span>
                    </div>
                    <pre
                      className={`whitespace-pre-wrap leading-6 text-[13px] font-mono ${
                        isDark ? 'text-red-300' : 'text-red-700 font-medium'
                      }`}
                    >
                      {result.stderr}
                    </pre>
                  </div>
                )}
                {!result.stdout && !result.stderr && (
                  <span
                    className={`text-sm ${
                      isDark ? 'text-neutral-500' : 'text-[#71717A]'
                    }`}
                  >
                    Program exited with code {result.exitCode}. No output produced.
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Status bar ── */}
      <div
        className={`flex items-center justify-between px-4 py-1.5 border-t shrink-0 text-[10px] font-mono ${
          isDark
            ? 'bg-neutral-900 border-neutral-800 text-neutral-500'
            : 'bg-[#F8F9FA] border-[#E4E4E7] text-[#71717A]'
        }`}
      >
        <span>
          Self-Hosted Engine · Isolated Sandbox · {isFullScreen ? 'Press Esc to exit full screen' : 'Ctrl+Enter to Run'}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded border ${
              isDark
                ? 'bg-neutral-800 border-neutral-700/50 text-neutral-400'
                : 'bg-[#FFFFFF] border-[#D4D4D8] text-[#52525B] shadow-xs'
            }`}
          >
            {language.name} · /api/compiler/execute
          </span>
          <span>Server-Side</span>
        </div>
      </div>
    </div>
  );

  if (isFullScreen && mounted && typeof document !== 'undefined') {
    return createPortal(toolContent, document.body);
  }

  return toolContent;
};
