'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Check, Trash2, AlertCircle, Info, Terminal, Maximize2, Minimize2, Columns2, Rows2 } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';

// ── Types ────────────────────────────────────────────────────────────────────

interface ParsedCurl {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string | null;
  auth: { user: string; pass: string } | null;
}

type Language =
  | 'js-fetch'
  | 'js-axios'
  | 'node-fetch'
  | 'python'
  | 'go'
  | 'php-curl'
  | 'php-guzzle';

// ── Sample cURL ──────────────────────────────────────────────────────────────

const SAMPLE_CURL = `curl -X POST https://api.example.com/v1/users \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.sample" \\
  -d '{"name":"Alex Rivera","email":"alex@example.com"}'`;

// ── Parser ───────────────────────────────────────────────────────────────────

function tokenize(raw: string): string[] {
  // Normalize line continuations and collapse whitespace
  const normalized = raw.replace(/\\\n/g, ' ').replace(/\s+/g, ' ').trim();
  const tokens: string[] = [];
  let i = 0;
  while (i < normalized.length) {
    if (normalized[i] === ' ') { i++; continue; }
    if (normalized[i] === "'" || normalized[i] === '"') {
      const q = normalized[i++];
      let val = '';
      while (i < normalized.length && normalized[i] !== q) {
        if (normalized[i] === '\\' && i + 1 < normalized.length) { i++; }
        val += normalized[i++];
      }
      i++; // closing quote
      tokens.push(val);
    } else {
      let val = '';
      while (i < normalized.length && normalized[i] !== ' ') val += normalized[i++];
      tokens.push(val);
    }
  }
  return tokens;
}

function parseCurl(raw: string): ParsedCurl | null {
  const tokens = tokenize(raw.trim());
  if (!tokens.length || tokens[0].toLowerCase() !== 'curl') return null;

  const result: ParsedCurl = { method: 'GET', url: '', headers: {}, body: null, auth: null };
  let i = 1;

  while (i < tokens.length) {
    const t = tokens[i];

    if (t === '-X' || t === '--request') {
      result.method = (tokens[++i] ?? 'GET').toUpperCase();
    } else if (t === '-H' || t === '--header') {
      const hdr = tokens[++i] ?? '';
      const sep = hdr.indexOf(':');
      if (sep !== -1) {
        const key = hdr.slice(0, sep).trim();
        const val = hdr.slice(sep + 1).trim();
        result.headers[key] = val;
      }
    } else if (t === '-d' || t === '--data' || t === '--data-raw' || t === '--data-binary') {
      result.body = tokens[++i] ?? null;
      if (!result.method || result.method === 'GET') result.method = 'POST';
    } else if (t === '-u' || t === '--user') {
      const creds = tokens[++i] ?? '';
      const sep = creds.indexOf(':');
      result.auth = sep !== -1
        ? { user: creds.slice(0, sep), pass: creds.slice(sep + 1) }
        : { user: creds, pass: '' };
    } else if (!t.startsWith('-')) {
      if (!result.url) result.url = t;
    }
    i++;
  }

  if (!result.url) return null;
  return result;
}

// ── Code Generators ──────────────────────────────────────────────────────────

function indent(s: string, n = 2): string {
  return s.split('\n').map(l => ' '.repeat(n) + l).join('\n');
}

function headersObj(h: Record<string, string>): string {
  const entries = Object.entries(h).map(([k, v]) => `  '${k}': '${v}'`);
  return entries.length ? `{\n${entries.join(',\n')}\n}` : '{}';
}

function pyDict(h: Record<string, string>): string {
  const entries = Object.entries(h).map(([k, v]) => `    '${k}': '${v}'`);
  return entries.length ? `{\n${entries.join(',\n')}\n}` : '{}';
}

const generators: Record<Language, (p: ParsedCurl) => string> = {
  'js-fetch': (p) => {
    const opts: string[] = [`  method: '${p.method}'`];
    const hdrs = { ...p.headers };
    if (p.auth) hdrs['Authorization'] = `Basic ${btoa(`${p.auth.user}:${p.auth.pass}`)}`;
    if (Object.keys(hdrs).length) opts.push(`  headers: ${indent(headersObj(hdrs), 2).trimStart()}`);
    if (p.body) opts.push(`  body: \`${p.body}\``);
    return `const response = await fetch('${p.url}', {\n${opts.join(',\n')}\n});\nconst data = await response.json();\nconsole.log(data);`;
  },

  'js-axios': (p) => {
    const cfg: string[] = [];
    const hdrs = { ...p.headers };
    if (p.auth) hdrs['Authorization'] = `Basic ${btoa(`${p.auth.user}:${p.auth.pass}`)}`;
    if (Object.keys(hdrs).length) cfg.push(`  headers: ${indent(headersObj(hdrs), 2).trimStart()}`);
    if (p.body) cfg.push(`  data: \`${p.body}\``);
    const cfgStr = cfg.length ? `, {\n${cfg.join(',\n')}\n}` : '';
    const method = p.method.toLowerCase();
    const hasBody = ['post', 'put', 'patch'].includes(method);
    if (hasBody && p.body) {
      return `import axios from 'axios';\n\nconst { data } = await axios.${method}(\n  '${p.url}',\n  \`${p.body}\`,\n  ${cfg.filter(c => !c.includes('data:')).join(',\n  ') || '{}'}\n);\nconsole.log(data);`;
    }
    return `import axios from 'axios';\n\nconst { data } = await axios.${method}('${p.url}'${cfgStr});\nconsole.log(data);`;
  },

  'node-fetch': (p) => {
    const hdrs = { ...p.headers };
    if (p.auth) hdrs['Authorization'] = `Basic ${btoa(`${p.auth.user}:${p.auth.pass}`)}`;
    const opts: string[] = [`  method: '${p.method}'`];
    if (Object.keys(hdrs).length) opts.push(`  headers: ${indent(headersObj(hdrs), 2).trimStart()}`);
    if (p.body) opts.push(`  body: \`${p.body}\``);
    return `import fetch from 'node-fetch';\n\nconst response = await fetch('${p.url}', {\n${opts.join(',\n')}\n});\nconst data = await response.json();\nconsole.log(data);`;
  },

  python: (p) => {
    const lines: string[] = ['import requests', ''];
    const hdrs = { ...p.headers };
    if (p.auth) {
      lines.push(`auth = ('${p.auth.user}', '${p.auth.pass}')`);
    }
    if (Object.keys(hdrs).length) lines.push(`headers = ${pyDict(hdrs)}`);
    if (p.body) lines.push(`data = '${p.body}'`);
    lines.push('');
    const args = [`'${p.url}'`];
    if (Object.keys(hdrs).length) args.push('headers=headers');
    if (p.body) args.push('data=data');
    if (p.auth) args.push('auth=auth');
    lines.push(`response = requests.${p.method.toLowerCase()}(${args.join(', ')})`);
    lines.push('print(response.json())');
    return lines.join('\n');
  },

  go: (p) => {
    const hdrs = { ...p.headers };
    if (p.auth) hdrs['Authorization'] = `Basic ${btoa(`${p.auth.user}:${p.auth.pass}`)}`;
    const hdrLines = Object.entries(hdrs).map(([k, v]) => `\treq.Header.Set("${k}", "${v}")`).join('\n');
    const bodyLine = p.body
      ? `\tbody := strings.NewReader(\`${p.body}\`)\n\treq, err := http.NewRequest("${p.method}", "${p.url}", body)`
      : `\treq, err := http.NewRequest("${p.method}", "${p.url}", nil)`;
    const imports = p.body
      ? `"net/http"\n\t"strings"\n\t"fmt"`
      : `"net/http"\n\t"fmt"`;
    return `package main\n\nimport (\n\t${imports}\n)\n\nfunc main() {\n${bodyLine}\n\tif err != nil {\n\t\tpanic(err)\n\t}\n${hdrLines ? hdrLines + '\n' : ''}\n\tclient := &http.Client{}\n\tresp, err := client.Do(req)\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\tdefer resp.Body.Close()\n\tfmt.Println(resp.Status)\n}`;
  },

  'php-curl': (p) => {
    const hdrs = { ...p.headers };
    if (p.auth) hdrs['Authorization'] = `Basic ${btoa(`${p.auth.user}:${p.auth.pass}`)}`;
    const hdrArr = Object.entries(hdrs).map(([k, v]) => `    '${k}: ${v}'`).join(",\n");
    const lines = [
      '<?php',
      '$ch = curl_init();',
      `curl_setopt($ch, CURLOPT_URL, '${p.url}');`,
      'curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);',
    ];
    if (p.method !== 'GET') lines.push(`curl_setopt($ch, CURLOPT_CUSTOMREQUEST, '${p.method}');`);
    if (p.body) lines.push(`curl_setopt($ch, CURLOPT_POSTFIELDS, '${p.body}');`);
    if (hdrArr) lines.push(`curl_setopt($ch, CURLOPT_HTTPHEADER, [\n${hdrArr}\n]);`);
    lines.push('$response = curl_exec($ch);', 'curl_close($ch);', 'echo $response;');
    return lines.join('\n');
  },

  'php-guzzle': (p) => {
    const hdrs = { ...p.headers };
    if (p.auth) hdrs['Authorization'] = `Basic ${btoa(`${p.auth.user}:${p.auth.pass}`)}`;
    const hdrEntries = Object.entries(hdrs).map(([k, v]) => `        '${k}' => '${v}'`).join(",\n");
    const opts: string[] = [];
    if (hdrEntries) opts.push(`    'headers' => [\n${hdrEntries}\n    ]`);
    if (p.body) opts.push(`    'body' => '${p.body}'`);
    const optsStr = opts.length ? `[\n${opts.join(',\n')}\n]` : '[]';
    return `<?php\nuse GuzzleHttp\\Client;\n\n$client = new Client();\n$response = $client->request('${p.method}', '${p.url}', ${optsStr});\necho $response->getBody();`;
  },
};

// ── Language Tab Config ──────────────────────────────────────────────────────

const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'js-fetch',    label: 'JS Fetch' },
  { id: 'js-axios',   label: 'Axios' },
  { id: 'node-fetch',  label: 'Node.js' },
  { id: 'python',      label: 'Python' },
  { id: 'go',          label: 'Go' },
  { id: 'php-curl',    label: 'PHP cURL' },
  { id: 'php-guzzle',  label: 'PHP Guzzle' },
];

// ── Syntax Highlight (minimal token-based) ───────────────────────────────────

function highlight(code: string, lang: Language): string {
  const esc = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  if (lang === 'python') {
    return esc
      .replace(/(#[^\n]*)/g, '<span class="text-neutral-500 italic">$1</span>')
      .replace(/\b(import|from|def|return|if|else|for|in|not|and|or|True|False|None)\b/g, '<span class="text-purple-400">$1</span>')
      .replace(/('(?:[^'\\]|\\.)*')/g, '<span class="text-emerald-400">$1</span>');
  }
  if (lang === 'go') {
    return esc
      .replace(/(\/\/[^\n]*)/g, '<span class="text-neutral-500 italic">$1</span>')
      .replace(/\b(package|import|func|var|const|if|else|return|defer|nil)\b/g, '<span class="text-purple-400">$1</span>')
      .replace(/("(?:[^"\\]|\\.)*")/g, '<span class="text-emerald-400">$1</span>')
      .replace(/(`(?:[^`])*`)/g, '<span class="text-emerald-400">$1</span>');
  }
  if (lang === 'php-curl' || lang === 'php-guzzle') {
    return esc
      .replace(/(\/\/[^\n]*)/g, '<span class="text-neutral-500 italic">$1</span>')
      .replace(/\b(use|new|echo|function|return|if|else|true|false|null)\b/g, '<span class="text-purple-400">$1</span>')
      .replace(/('(?:[^'\\]|\\.)*')/g, '<span class="text-emerald-400">$1</span>');
  }
  // JS / Node
  return esc
    .replace(/(\/\/[^\n]*)/g, '<span class="text-neutral-500 italic">$1</span>')
    .replace(/\b(import|from|const|let|var|await|async|return|if|else|new)\b/g, '<span class="text-purple-400">$1</span>')
    .replace(/(`(?:[^`\\]|\\.)*`)/g, '<span class="text-emerald-400">$1</span>')
    .replace(/('(?:[^'\\]|\\.)*')/g, '<span class="text-emerald-400">$1</span>');
}

// ── Component ────────────────────────────────────────────────────────────────

export const CurlConverterTool: React.FC = () => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [lang, setLang] = useState<Language>('js-fetch');
  const [copied, setCopied] = useState(false);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSideBySide, setIsSideBySide] = useState(true);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && isFullScreen) setIsFullScreen(false); };
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

  const parsed = input.trim() ? parseCurl(input) : null;
  const hasInput = input.trim().length > 0;
  const isInvalid = hasInput && !parsed;
  const output = parsed ? generators[lang](parsed) : '';

  const handleCopy = useCallback(() => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleSample = () => setInput(SAMPLE_CURL);
  const handleClear = () => setInput('');

  return (
    <div className={`bg-neutral-950 border border-neutral-800 font-sans text-neutral-100 flex flex-col ${
      isFullScreen ? 'fixed inset-0 z-[9999] overflow-hidden' : 'w-full rounded-lg shadow-2xl'
    }`}>

      {/* Toolbar */}
      <div className={`px-3 py-2.5 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono ${
        isFullScreen ? 'sticky top-0 z-[10000]' : ''
      }`}>
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-neutral-500" />
          <span className="font-semibold text-neutral-300">{t('tools.curlConverter.inputLabel')}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSample} className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer">
            {t('tools.curlConverter.loadSample')}
          </button>
          <button onClick={handleClear} className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-red-950 hover:text-red-300 text-neutral-400 transition-colors flex items-center gap-1 cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" />
            {t('tools.curlConverter.clear')}
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
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
          >
            {isFullScreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Main split pane */}
      <div className={`grid divide-neutral-800 ${
        isSideBySide
          ? 'grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x'
          : 'grid-cols-1 divide-y'
      } ${isFullScreen ? 'flex-1 overflow-hidden' : 'min-h-[420px]'}`}>

        {/* Left / Top pane: Input */}
        <div className={`flex flex-col p-3 sm:p-4 space-y-2 bg-neutral-950 ${
          isFullScreen ? 'overflow-y-auto' : ''
        }`}>
          <div className="text-xs font-mono text-neutral-400 pb-1 border-b border-neutral-900">
            <span className="font-semibold text-neutral-300">cURL Input</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('tools.curlConverter.inputPlaceholder')}
            spellCheck={false}
            className={`w-full p-3 font-mono text-xs bg-neutral-900/90 text-neutral-100 border border-neutral-800 rounded focus:border-[#1D9BF0] focus:outline-none resize-y leading-relaxed transition-colors placeholder-neutral-600 ${
              isSideBySide ? 'min-h-[340px]' : 'min-h-[120px] max-h-[280px]'
            }`}
          />
          {isInvalid && (
            <div className="flex items-start gap-2 p-3 bg-red-950/40 border border-red-900/80 rounded text-xs text-red-300 font-mono">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{t('tools.curlConverter.errorInvalid')}</span>
            </div>
          )}
        </div>

        {/* Right / Bottom pane: Lang tabs + Output */}
        <div className={`flex flex-col p-3 sm:p-4 space-y-2 bg-neutral-950 ${
          isFullScreen ? 'overflow-y-auto' : ''
        }`}>
          {/* Language tabs */}
          <div className="flex items-center gap-1 flex-wrap pb-1 border-b border-neutral-900">
            {LANGUAGES.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setLang(id)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer ${
                  lang === id
                    ? 'bg-[#1D9BF0] text-white'
                    : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700'
                }`}
              >
                {label}
              </button>
            ))}
            {output && (
              <button
                onClick={handleCopy}
                className="ml-auto flex items-center gap-1.5 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer text-xs font-mono"
              >
                {copied ? <Check className="w-3 h-3 text-sky-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? t('tools.curlConverter.copied') : t('tools.curlConverter.copyCode')}</span>
              </button>
            )}
          </div>

          {/* Output */}
          <div
            className={`bg-neutral-900/90 border border-neutral-800 rounded overflow-auto ${
              isFullScreen ? 'flex-1' : isSideBySide ? 'flex-1 min-h-[300px]' : 'resize-y min-h-[220px]'
            }`}
          >
            {output ? (
              <pre
                className="font-mono text-xs p-4 leading-relaxed text-neutral-200 whitespace-pre"
                dangerouslySetInnerHTML={{ __html: highlight(output, lang) }}
              />
            ) : (
              <div className="p-4 text-xs text-neutral-600 font-mono italic">
                {hasInput ? '...' : t('tools.curlConverter.outputPlaceholder')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-neutral-900/80 border-t border-neutral-800 flex items-center justify-end text-xs font-mono">
        <div className="text-neutral-400 text-[11px] flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-neutral-500" />
          <span>{t('tools.curlConverter.privacyNote')}</span>
        </div>
      </div>
    </div>
  );
};
