'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Copy, Check, Trash2, Download, FileText, Database,
  Terminal, AlertCircle, Info, ShieldCheck, Maximize2, Minimize2, ArrowRightLeft,
  Code
} from 'lucide-react';

// ─── SQL Parser ──────────────────────────────────────────────────────────────

function parseSql(sql: string): object[] {
  const results: object[] = [];
  const insertRegex = /INSERT\s+INTO\s+\S+\s*\(([^)]+)\)\s*VALUES\s*([\s\S]+?)(?:;|$)/gi;
  let insertMatch: RegExpExecArray | null;

  while ((insertMatch = insertRegex.exec(sql)) !== null) {
    const columns = insertMatch[1].split(',').map((c) => c.trim().replace(/[`"[\]]/g, ''));
    const valuesBlock = insertMatch[2];

    const rowRegex = /\(([^)]+)\)/g;
    let rowMatch: RegExpExecArray | null;
    while ((rowMatch = rowRegex.exec(valuesBlock)) !== null) {
      const rawValues = rowMatch[1].match(/(?:'[^']*'|"[^"]*"|[^,]+)/g) ?? [];
      const row: Record<string, unknown> = {};
      columns.forEach((col, i) => {
        let val: string = (rawValues[i] ?? '').trim().replace(/^['"]|['"]$/g, '');
        if (val.toLowerCase() === 'null') row[col] = null;
        else if (val.toLowerCase() === 'true') row[col] = true;
        else if (val.toLowerCase() === 'false') row[col] = false;
        else if (!isNaN(Number(val)) && val !== '') row[col] = Number(val);
        else row[col] = val;
      });
      results.push(row);
    }
  }

  if (results.length === 0) {
    const lines = sql.trim().split('\n').filter((l) => l.trim());
    if (lines.length >= 2) {
      const headers = lines[0].split(/[,|\t]/).map((h) => h.trim().replace(/[`"]/g, ''));
      for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(/[,|\t]/).map((c) => c.trim().replace(/^['"]|['"]$/g, ''));
        if (cells.length === headers.length) {
          const row: Record<string, unknown> = {};
          headers.forEach((h, idx) => {
            const v = cells[idx];
            if (v.toLowerCase() === 'null') row[h] = null;
            else if (v.toLowerCase() === 'true') row[h] = true;
            else if (v.toLowerCase() === 'false') row[h] = false;
            else if (!isNaN(Number(v)) && v !== '') row[h] = Number(v);
            else row[h] = v;
          });
          results.push(row);
        }
      }
    }
  }

  return results;
}

// ─── cURL Parser ─────────────────────────────────────────────────────────────

interface CurlResult {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: unknown;
}

function parseCurl(curlStr: string): CurlResult {
  const normalized = curlStr.replace(/\\\s*\n\s*/g, ' ').replace(/\s+/g, ' ').trim();
  const result: CurlResult = { method: 'GET', url: '', headers: {}, body: null };

  const urlMatch = normalized.match(/curl\s+(?:-[^\s]+\s+)*['"]?(https?:\/\/[^\s'"]+)['"]?/i);
  if (urlMatch) result.url = urlMatch[1];

  const methodMatch = normalized.match(/-X\s+['"]?(\w+)['"]?/i);
  if (methodMatch) result.method = methodMatch[1].toUpperCase();

  const headerRegex = /-H\s+['"]([^'"]+)['"]/g;
  let hMatch: RegExpExecArray | null;
  while ((hMatch = headerRegex.exec(normalized)) !== null) {
    const sep = hMatch[1].indexOf(':');
    if (sep > -1) {
      const key = hMatch[1].slice(0, sep).trim();
      const val = hMatch[1].slice(sep + 1).trim();
      result.headers[key] = val;
    }
  }

  const bodyMatch = normalized.match(/(?:--data(?:-raw)?|-d)\s+['"]?([\s\S]*?)['"]?(?:\s+-|$)/);
  if (bodyMatch) {
    if (['POST', 'PUT', 'PATCH'].includes(result.method) || methodMatch) {
      result.method = result.method === 'GET' ? 'POST' : result.method;
    }
    const rawBody = bodyMatch[1].trim().replace(/\\'/g, "'").replace(/\\"/g, '"');
    try {
      result.body = JSON.parse(rawBody);
    } catch {
      if (rawBody.includes('=')) {
        const pairs: Record<string, string> = {};
        rawBody.split('&').forEach((pair) => {
          const [k, v] = pair.split('=').map(decodeURIComponent);
          if (k) pairs[k] = v ?? '';
        });
        result.body = pairs;
      } else {
        result.body = rawBody;
      }
    }
  }

  return result;
}

// ─── Reverse JSON-to-SQL Conversion ──────────────────────────────────────────

function jsonToSqlInsert(jsonStr: string, tableName = 'table_name'): string {
  try {
    const parsed = JSON.parse(jsonStr);
    const records = Array.isArray(parsed) ? parsed : [parsed];
    if (records.length === 0 || typeof records[0] !== 'object' || records[0] === null) {
      throw new Error('JSON must contain at least one non-empty object or array of objects.');
    }
    
    const columns = Array.from(new Set(records.flatMap(r => Object.keys(r))));
    if (columns.length === 0) return '';
    
    const colList = columns.join(', ');
    const valuesList = records.map(r => {
      const valRow = columns.map(col => {
        const val = (r as any)[col];
        if (val === undefined || val === null) return 'NULL';
        if (typeof val === 'boolean') return val ? 'true' : 'false';
        if (typeof val === 'number') return val.toString();
        const escapedVal = val.toString().replace(/'/g, "''");
        return `'${escapedVal}'`;
      }).join(', ');
      return `(${valRow})`;
    }).join(',\n       ');
    
    return `INSERT INTO ${tableName} (${colList})\nVALUES ${valuesList};`;
  } catch (e: any) {
    throw new Error('Invalid JSON input: ' + e.message);
  }
}

// ─── Sample Data ─────────────────────────────────────────────────────────────

const SQL_SAMPLE = `INSERT INTO users (id, name, email, active, score)
VALUES (1, 'Alice Nguyen', 'alice@example.com', true, 98.5),
       (2, 'Bob Smith', 'bob@example.com', false, 74),
       (3, 'Carol Dana', 'carol@c3mindloop.com', true, 100);`;

const CURL_SAMPLE = `curl -X POST 'https://api.c3mindloop.com/v1/tools' \\
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.sample' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Request-ID: req-12345' \\
  -d '{"tool":"sql-to-json","version":"1.0","clientSide":true}'`;

const JSON_SAMPLE = `[
  { "id": 1, "name": "Alice Nguyen", "email": "alice@example.com", "active": true, "score": 98.5 },
  { "id": 2, "name": "Bob Smith", "email": "bob@example.com", "active": false, "score": 74 },
  { "id": 3, "name": "Carol Dana", "email": "carol@c3mindloop.com", "active": true, "score": 100 }
]`;

type Mode = 'sql' | 'curl' | 'jsontosql';

export const SqlToJsonTool: React.FC = () => {
  const [mode, setMode] = useState<Mode>('sql');
  const [input, setInput] = useState(SQL_SAMPLE);
  const [copied, setCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Swap sample when mode changes
  useEffect(() => {
    if (mode === 'sql') setInput(SQL_SAMPLE);
    else if (mode === 'curl') setInput(CURL_SAMPLE);
    else setInput(JSON_SAMPLE);
  }, [mode]);

  // Fullscreen ESC + navbar hide
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) setIsFullScreen(false);
    };
    const navbar = document.querySelector('header') as HTMLElement | null;
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
      if (navbar) navbar.style.display = 'none';
      window.addEventListener('keydown', handleKey);
    } else {
      document.body.style.overflow = '';
      if (navbar) navbar.style.display = '';
    }
    return () => {
      document.body.style.overflow = '';
      if (navbar) navbar.style.display = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [isFullScreen]);

  const result = useMemo(() => {
    if (!input.trim()) return { data: null, error: null };
    try {
      if (mode === 'sql') {
        const data = parseSql(input);
        if (data.length === 0) return { data: null, error: 'No SQL INSERT or CSV data recognized. Paste a valid INSERT INTO ... VALUES (...) statement.' };
        return { data, error: null };
      } else if (mode === 'curl') {
        const data = parseCurl(input);
        if (!data.url) return { data: null, error: 'No URL found. Make sure the cURL command starts with curl https://...' };
        return { data, error: null };
      } else {
        const sqlString = jsonToSqlInsert(input);
        return { data: sqlString, error: null };
      }
    } catch (e: any) {
      return { data: null, error: e.message };
    }
  }, [input, mode]);

  const outputText = useMemo(() => {
    if (!result.data) return '';
    if (mode === 'jsontosql') return result.data as string;
    return JSON.stringify(result.data, null, 2);
  }, [result.data, mode]);

  const renderHighlightedOutput = (text: string) => {
    if (!text) return null;
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    let highlighted = escaped;
    if (mode !== 'jsontosql') {
      highlighted = escaped.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
          let cls = 'text-amber-400';
          if (/^"/.test(match)) {
            cls = /:$/.test(match) ? 'text-sky-400 font-semibold' : 'text-emerald-400';
          } else if (/true|false/.test(match)) {
            cls = 'text-purple-400 font-semibold';
          } else if (/null/.test(match)) {
            cls = 'text-neutral-500 italic';
          }
          return `<span class="${cls}">${match}</span>`;
        }
      );
    } else {
      highlighted = escaped.replace(/\b(INSERT INTO|VALUES|NULL|true|false)\b/g, '<span class="text-purple-400 font-semibold">$1</span>');
    }
    
    return <pre className="font-mono text-xs p-4 overflow-y-auto leading-relaxed text-neutral-200 whitespace-pre-wrap break-words [word-break:break-word] overflow-x-hidden" dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = () => {
    if (!outputText) return;
    const isSql = mode === 'jsontosql';
    const blob = new Blob([outputText], { type: isSql ? 'text/plain' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isSql ? 'converted-statements.sql' : `${mode}-converted.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => setInput('');
  const handleLoadSample = () => {
    if (mode === 'sql') setInput(SQL_SAMPLE);
    else if (mode === 'curl') setInput(CURL_SAMPLE);
    else setInput(JSON_SAMPLE);
  };

  return (
    <div className={`bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-100 flex flex-col ${isFullScreen ? 'fixed inset-0 z-[9999] overflow-hidden' : 'w-full rounded-lg shadow-2xl'}`}>

      {/* Toolbar */}
      <div className={`px-3 py-2.5 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2 ${isFullScreen ? 'sticky top-0 z-[10000]' : ''}`}>
        {/* Left: Mode Toggle + Sample + Clear */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode switcher */}
          <div className="flex items-center bg-neutral-950 p-1 rounded border border-neutral-800 text-[11px] font-sans">
            <button
              onClick={() => setMode('sql')}
              className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${mode === 'sql' ? 'bg-[#1D9BF0] text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
            >
              <Database className="w-3 h-3" />
              <span>SQL → JSON</span>
            </button>
            <button
              onClick={() => setMode('curl')}
              className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${mode === 'curl' ? 'bg-[#1D9BF0] text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
            >
              <Terminal className="w-3 h-3" />
              <span>cURL → JSON</span>
            </button>
            <button
              onClick={() => setMode('jsontosql')}
              className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${mode === 'jsontosql' ? 'bg-[#1D9BF0] text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
            >
              <Code className="w-3 h-3" />
              <span>JSON → SQL</span>
            </button>
          </div>

          <button
            onClick={handleLoadSample}
            className="px-2.5 py-1.5 rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-[11px] font-sans flex items-center gap-1 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Load Sample</span>
          </button>

          <button
            onClick={handleClear}
            className="px-2.5 py-1.5 rounded bg-neutral-800/80 hover:bg-red-950 hover:text-red-300 text-neutral-400 text-[11px] font-sans flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

        {/* Right: Convert indicator + Copy + Download + Fullscreen */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-sans text-neutral-500">
            <ArrowRightLeft className="w-3 h-3" />
            <span>
              {mode === 'sql' ? 'SQL → JSON' : mode === 'curl' ? 'cURL → JSON' : 'JSON → SQL'}
            </span>
          </span>

          <button
            onClick={handleCopy}
            disabled={!outputText}
            className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-sans font-medium flex items-center gap-1.5 disabled:opacity-40 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : mode === 'jsontosql' ? 'Copy SQL' : 'Copy JSON'}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={!outputText}
            className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-sans flex items-center gap-1 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center transition-colors cursor-pointer"
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Split Pane */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800 ${isFullScreen ? 'flex-1 overflow-hidden' : 'min-h-[440px]'}`}>

        {/* Left: Input */}
        <div className={`flex flex-col p-3 sm:p-4 space-y-2 ${isFullScreen ? 'overflow-y-auto' : ''}`}>
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pb-1 border-b border-neutral-900">
            <span className="font-semibold text-neutral-300">
              {mode === 'sql' ? 'SQL Input' : mode === 'curl' ? 'cURL Command Input' : 'JSON Object / Array Input'}
            </span>
            <span className="text-[11px]">{input.split('\n').length} lines</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'sql'
              ? 'Paste INSERT INTO table (col1, col2) VALUES (...) or CSV output...'
              : mode === 'curl'
                ? 'Paste cURL command here...'
                : 'Paste a JSON array of objects to convert to SQL...'
            }
            spellCheck={false}
            className="w-full flex-1 min-h-[380px] p-3 font-mono text-xs bg-neutral-900/90 text-neutral-100 border border-neutral-800 rounded focus:border-[#1D9BF0] focus:outline-none resize-y leading-relaxed transition-colors whitespace-pre-wrap break-words [word-break:break-word] overflow-x-hidden"
          />
        </div>

        {/* Right: Output */}
        <div className={`flex flex-col p-3 sm:p-4 space-y-2 ${isFullScreen ? 'overflow-y-auto' : ''}`}>
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pb-1 border-b border-neutral-900">
            <span className="font-semibold text-neutral-300">
              {mode === 'jsontosql' ? 'SQL Output' : 'JSON Output'}
            </span>
            {result.data && (
              <span className="text-[11px] text-sky-400 font-semibold">
                {mode === 'jsontosql' ? 'SQL Statements' : (Array.isArray(result.data) ? `${(result.data as unknown[]).length} record${(result.data as unknown[]).length !== 1 ? 's' : ''}` : '1 object')}
              </span>
            )}
          </div>

          <div className="flex-1 min-h-[380px] bg-neutral-900/90 border border-neutral-800 rounded overflow-auto">
            {result.error ? (
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Parse Error</span>
                </div>
                <div className="p-3 bg-red-950/40 border border-red-900/80 rounded text-red-300 text-xs font-mono leading-relaxed whitespace-pre-wrap break-words [word-break:break-word]">
                  {result.error}
                </div>
              </div>
            ) : outputText ? (
              renderHighlightedOutput(outputText)
            ) : (
              <div className="p-6 text-neutral-600 text-xs italic text-center">
                Paste your content on the left to see output here.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Footer */}
      <div className="px-4 py-2 bg-neutral-900/80 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-neutral-400">
          <Info className="w-3.5 h-3.5 text-neutral-500" />
          <span>Local browser processing • No data sent to any server</span>
        </div>
        <div className="flex items-center gap-1.5 text-neutral-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
          <span>Client-Side Engine</span>
        </div>
      </div>
    </div>
  );
};
