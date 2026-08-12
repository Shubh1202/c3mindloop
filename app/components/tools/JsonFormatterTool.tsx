import React, { useState, useEffect, useRef } from 'react';
import {
  Copy,
  Check,
  Trash2,
  FileCode,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  FolderTree,
  Maximize2,
  Minimize2,
  Info,
  AlignLeft,
  Columns2,
  Rows2,
} from 'lucide-react';
import { JsonTreeView } from './JsonTreeView';

type IndentOption = '2' | '4' | 'tab';

const SAMPLE_JSON_DATA = {
  appName: "C³ MindLoop",
  version: "1.4.0",
  environment: "production",
  features: {
    clientSideOnly: true,
    zeroServerLogs: true,
    supportedTools: ["JSON Formatter", "JWT Inspector", "Base64 Encoder", "Hash Generator", "Regex Tester"]
  },
  metrics: {
    installs: 14400,
    rating: 4.9,
    activeUsers: 8500
  },
  author: {
    name: "Shubham Prajapati",
    role: "Core Developer",
    github: "shubhamprajapati1202"
  },
  tags: ["developer-tools", "json", "formatter", "privacy-first"]
};

export const JsonFormatterTool: React.FC = () => {
  const [rawInput, setRawInput] = useState<string>(() => JSON.stringify(SAMPLE_JSON_DATA, null, 2));
  const [formattedOutput, setFormattedOutput] = useState<string>('');
  const [parsedObject, setParsedObject] = useState<any>(null);
  const [indentOption, setIndentOption] = useState<IndentOption>('2');
  const [viewMode, setViewMode] = useState<'code' | 'tree'>('code');
  const [isValid, setIsValid] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSideBySide, setIsSideBySide] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show a transient toast notification
  const showToast = (message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3000);
  };

  // Lock body scroll + Esc key + hide navbar when fullscreen
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

  // Helper to parse line & col from JSON SyntaxError
  const parseJsonErrorLocation = (input: string, err: SyntaxError) => {
    const msg = err.message;
    // Try matching position (e.g., "at position 42" or "line 3 column 5")
    const posMatch = msg.match(/at position (\d+)/i) || msg.match(/position (\d+)/i);
    const lineColMatch = msg.match(/line (\d+) column (\d+)/i);

    if (lineColMatch) {
      return { line: parseInt(lineColMatch[1], 10), col: parseInt(lineColMatch[2], 10), message: msg };
    }

    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const lines = input.slice(0, pos).split('\n');
      const line = lines.length;
      const col = lines[lines.length - 1].length + 1;
      return { line, col, message: `${msg} (Line ${line}, Col ${col})` };
    }

    return { line: null, col: null, message: msg };
  };

  const getIndentValue = () => {
    if (indentOption === 'tab') return '\t';
    return parseInt(indentOption, 10);
  };

  // Format JSON - syncs prettified result back to the input textarea
  const handleFormat = (syncToInput = false) => {
    if (!rawInput.trim()) {
      setFormattedOutput('');
      setParsedObject(null);
      setIsValid(true);
      setErrorMessage(null);
      setErrorLine(null);
      return;
    }

    try {
      const parsed = JSON.parse(rawInput);
      const formatted = JSON.stringify(parsed, null, getIndentValue());
      setParsedObject(parsed);
      setFormattedOutput(formatted);
      if (syncToInput) {
        setRawInput(formatted);
      }
      setIsValid(true);
      setErrorMessage(null);
      setErrorLine(null);
    } catch (err: any) {
      setIsValid(false);
      setParsedObject(null);
      const errLoc = parseJsonErrorLocation(rawInput, err);
      setErrorMessage(errLoc.message);
      setErrorLine(errLoc.line);
      if (syncToInput) {
        showToast(`Invalid JSON syntax: ${errLoc.message}`);
      }
    }
  };

  // Minify JSON
  const handleMinify = () => {
    if (!rawInput.trim()) return;
    try {
      const parsed = JSON.parse(rawInput);
      const minified = JSON.stringify(parsed);
      setParsedObject(parsed);
      setFormattedOutput(minified);
      setRawInput(minified);
      setIsValid(true);
      setErrorMessage(null);
      setErrorLine(null);
    } catch (err: any) {
      setIsValid(false);
      const errLoc = parseJsonErrorLocation(rawInput, err);
      setErrorMessage(errLoc.message);
      setErrorLine(errLoc.line);
    }
  };

  // Validate JSON explicitly
  const handleValidate = () => {
    handleFormat();
  };

  // Auto-format on initial mount or rawInput change - debounced to avoid aggressive error feedback while typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setIsTyping(true);
    debounceRef.current = setTimeout(() => {
      setIsTyping(false);
      handleFormat();
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [rawInput, indentOption]);

  const handleClear = () => {
    setRawInput('');
    setFormattedOutput('');
    setParsedObject(null);
    setErrorMessage(null);
    setErrorLine(null);
    setIsValid(true);
  };

  const handleLoadSample = () => {
    setRawInput(JSON.stringify(SAMPLE_JSON_DATA, null, 2));
  };

  const handleCopy = () => {
    const textToCopy = formattedOutput || rawInput;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawInput(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = () => {
    const content = formattedOutput || rawInput;
    if (!content) return;
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Metrics
  const rawBytes = new Blob([rawInput]).size;
  const outputBytes = new Blob([formattedOutput]).size;
  const lineCount = rawInput.split('\n').length;

  // Simple syntax highliter for Code View
  const renderHighlightedJson = (jsonString: string) => {
    if (!jsonString) return null;
    const escaped = jsonString
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const highlighted = escaped.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'text-amber-400'; // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-sky-400 font-semibold'; // key
          } else {
            cls = 'text-emerald-400'; // string
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-purple-400 font-semibold'; // boolean
        } else if (/null/.test(match)) {
          cls = 'text-neutral-500 italic'; // null
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );

    return (
      <pre
        className="font-mono text-xs sm:text-sm p-4 overflow-x-auto text-neutral-200 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    );
  };

  return (
    <>

      <div className={`bg-neutral-950 border border-neutral-800 font-sans text-neutral-100 flex flex-col ${isFullScreen ? 'fixed inset-0 z-[9999] overflow-hidden' : 'w-full rounded-lg shadow-2xl'}`}>

        {/* Primary Control Toolbar */}
        <div className={`px-3 py-2.5 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono ${isFullScreen ? 'sticky top-0 z-[10000]' : ''}`}>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleFormat(true)}
              className="px-3 py-1.5 rounded bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Format</span>
            </button>

            <button
              onClick={handleMinify}
              className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Minify</span>
            </button>

            <button
              onClick={handleValidate}
              className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Validate</span>
            </button>

            <button
              onClick={handleLoadSample}
              className="px-2.5 py-1.5 rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
            >
              Sample JSON
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
            {/* Indent Selector */}
            <div className="flex items-center bg-neutral-950 p-1 rounded border border-neutral-800 text-xs font-mono">
              <span className="text-neutral-500 px-2">Spacing:</span>
              <button
                onClick={() => setIndentOption('2')}
                className={`px-2 py-0.5 rounded transition-colors ${indentOption === '2' ? 'bg-[#1D9BF0] text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
              >
                2 Sp
              </button>
              <button
                onClick={() => setIndentOption('4')}
                className={`px-2 py-0.5 rounded transition-colors ${indentOption === '4' ? 'bg-[#1D9BF0] text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
              >
                4 Sp
              </button>
              <button
                onClick={() => setIndentOption('tab')}
                className={`px-2 py-0.5 rounded transition-colors ${indentOption === 'tab' ? 'bg-[#1D9BF0] text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
              >
                Tab
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json,application/json,text/plain"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={!formattedOutput && !rawInput}
              className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-40 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={handleCopy}
              disabled={!formattedOutput && !rawInput}
              className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 disabled:opacity-40 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Layout toggle - desktop only */}
            <div className="hidden lg:flex items-center bg-neutral-950 p-1 rounded border border-neutral-800">
              <button
                onClick={() => setIsSideBySide(true)}
                title="Side-by-Side View"
                className={`p-1 rounded transition-colors cursor-pointer ${isSideBySide ? 'bg-[#1D9BF0] text-white' : 'text-neutral-400 hover:text-white'}`}
              >
                <Columns2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsSideBySide(false)}
                title="Stacked View"
                className={`p-1 rounded transition-colors cursor-pointer ${!isSideBySide ? 'bg-[#1D9BF0] text-white' : 'text-neutral-400 hover:text-white'}`}
              >
                <Rows2 className="w-3.5 h-3.5" />
              </button>
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

        {/* Main Dual Split Pane Area */}
        <div className={`grid divide-neutral-800 ${isSideBySide
          ? 'grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x'
          : 'grid-cols-1 divide-y'
          } ${isFullScreen ? 'flex-1 overflow-hidden' : 'min-h-[480px]'}`}>

          {/* Left Pane: Raw JSON Input */}
          <div className={`flex flex-col bg-neutral-950 p-3 sm:p-4 space-y-2 ${isFullScreen ? 'overflow-y-auto' : ''}`}>
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pb-1 border-b border-neutral-900">
              <span className="font-semibold text-neutral-300">Raw JSON Input</span>
              <div className="flex items-center gap-3 text-[11px]">
                <span>{lineCount} lines</span>
                <span>•</span>
                <span>{rawBytes} bytes</span>
              </div>
            </div>

            <div className="relative flex-1 flex">
              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="Paste raw JSON here..."
                spellCheck={false}
                className="w-full h-full min-h-[400px] p-3 font-mono text-xs sm:text-sm bg-neutral-900/90 text-neutral-100 border border-neutral-800 rounded focus:border-[#1D9BF0] focus:outline-none resize-y leading-relaxed transition-colors"
              />
            </div>
          </div>

          {/* Right Pane: Output (Code or Tree View) */}
          <div className={`flex flex-col bg-neutral-950 p-3 sm:p-4 space-y-2 ${isFullScreen ? 'overflow-y-auto' : ''}`}>
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pb-1 border-b border-neutral-900">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-300">Formatted Output</span>
                {/* View Switcher */}
                <div className="flex items-center bg-neutral-900 p-0.5 rounded border border-neutral-800 text-[11px]">
                  <button
                    onClick={() => setViewMode('code')}
                    className={`px-2 py-0.5 rounded transition-colors ${viewMode === 'code' ? 'bg-[#1D9BF0] text-white font-medium' : 'text-neutral-400 hover:text-white'}`}
                  >
                    Code View
                  </button>
                  <button
                    onClick={() => setViewMode('tree')}
                    disabled={!isValid || !parsedObject}
                    className={`px-2 py-0.5 rounded transition-colors disabled:opacity-40 flex items-center gap-1 ${viewMode === 'tree' ? 'bg-[#1D9BF0] text-white font-medium' : 'text-neutral-400 hover:text-white'}`}
                  >
                    <FolderTree className="w-3 h-3" />
                    <span>Tree View</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <span>{outputBytes} bytes</span>
              </div>
            </div>

            {/* View Container */}
            <div className="flex-1 bg-neutral-900/90 border border-neutral-800 rounded min-h-[400px] overflow-hidden flex flex-col">
              {isValid || isTyping ? (
                viewMode === 'code' ? (
                  renderHighlightedJson(formattedOutput || rawInput)
                ) : (
                  <JsonTreeView data={parsedObject} initialExpandedDepth={2} />
                )
              ) : (
                <div className="p-6 text-red-400 font-mono text-xs space-y-3">
                  <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Invalid JSON Syntax</span>
                  </div>
                  <div className="p-3 bg-red-950/40 border border-red-900/80 rounded text-red-300 leading-relaxed font-mono">
                    {errorMessage}
                  </div>
                  {errorLine && (
                    <p className="text-neutral-400 text-[11px]">
                      📍 Syntax error identified around Line {errorLine}. Please review your brackets, trailing commas, or quotes.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Validation Banner / Status Line */}
        <div className="px-4 py-2 bg-neutral-900/80 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            {isTyping ? (
              <span className="text-neutral-400 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse" />
                <span>Editing...</span>
              </span>
            ) : isValid ? (
              <span className="text-sky-400 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Valid JSON Payload</span>
              </span>
            ) : (
              <span className="text-red-400 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Syntax Error Detected</span>
              </span>
            )}
          </div>

          {/* Strict Minimal Privacy Badge (per AGENTSKILLS.md) */}
          <div className="text-neutral-400 text-[11px] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-neutral-500" />
            <span>Local browser processing • No data sent to any server</span>
          </div>
        </div>
      </div>

      {/* Error Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10001] animate-[fadeSlideUp_0.25s_ease-out]">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-950/95 border border-red-800/60 text-red-300 text-xs font-mono shadow-xl backdrop-blur-sm">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="max-w-[400px] truncate">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-red-400 hover:text-red-200 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};
