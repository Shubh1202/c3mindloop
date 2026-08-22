// Pipeline tool adapters
// Each adapter is a pure function: (input: string, config: AdapterConfig) => string
// All processing is 100% client-side - no data leaves the browser.

import type { AdapterId, AdapterConfig } from './types';

// ── Base64 ───────────────────────────────────────────────────────────────────

function base64Encode(text: string, urlSafe = false): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  let b64 = btoa(binary);
  if (urlSafe) b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return b64;
}

function base64Decode(b64: string): string {
  const normalized = b64.trim().replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

// ── JSON ─────────────────────────────────────────────────────────────────────

function jsonFormat(text: string, indent: 2 | 4 = 2): string {
  const parsed = JSON.parse(text.trim());
  return JSON.stringify(parsed, null, indent);
}

function jsonMinify(text: string): string {
  const parsed = JSON.parse(text.trim());
  return JSON.stringify(parsed);
}

// ── JWT ──────────────────────────────────────────────────────────────────────

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function jwtInspect(token: string): string {
  const parts = token.trim().split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT: expected 3 dot-separated parts.');
  const header = JSON.parse(base64UrlDecode(parts[0]));
  const payload = JSON.parse(base64UrlDecode(parts[1]));
  const now = Math.floor(Date.now() / 1000);
  const status =
    payload.exp === undefined ? 'no-exp' : payload.exp > now ? 'active' : 'expired';
  return JSON.stringify({ header, payload, status, signature: parts[2] }, null, 2);
}

// ── Regex Filter ─────────────────────────────────────────────────────────────

function regexFilter(text: string, pattern: string, flags = 'gm'): string {
  if (!pattern) throw new Error('No regex pattern provided.');
  const re = new RegExp(pattern, flags);
  const lines = text.split('\n');
  const matching = lines.filter((line) => re.test(line));
  if (matching.length === 0) return '(no matching lines)';
  return matching.join('\n');
}

// ── Hash (SHA-256 via Web Crypto API) ────────────────────────────────────────

async function hashSha256(text: string): Promise<string> {
  const encoded = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ── SQL to JSON ───────────────────────────────────────────────────────────────

function sqlToJson(sql: string): string {
  const results: object[] = [];
  const insertRegex =
    /INSERT\s+INTO\s+\S+\s*\(([^)]+)\)\s*VALUES\s*([\s\S]+?)(?:;|$)/gi;
  let insertMatch: RegExpExecArray | null;

  while ((insertMatch = insertRegex.exec(sql)) !== null) {
    const columns = insertMatch[1]
      .split(',')
      .map((c) => c.trim().replace(/[`"[\]]/g, ''));
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
    // Try TSV / CSV fallback
    const lines = sql.trim().split('\n').filter((l) => l.trim());
    if (lines.length >= 2) {
      const sep = lines[0].includes('\t') ? '\t' : ',';
      const headers = lines[0].split(sep).map((h) => h.trim().replace(/^['"]|['"]$/g, ''));
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(sep).map((v) => v.trim().replace(/^['"]|['"]$/g, ''));
        const row: Record<string, unknown> = {};
        headers.forEach((h, j) => (row[h] = vals[j] ?? ''));
        results.push(row);
      }
    }
  }

  if (results.length === 0) throw new Error('No INSERT statements or tabular data detected.');
  return JSON.stringify(results, null, 2);
}

// ── Adapter registry ─────────────────────────────────────────────────────────

export interface ToolAdapter {
  id: AdapterId;
  label: string;
  description: string;
  category: 'encoding' | 'json' | 'auth' | 'text' | 'crypto' | 'data';
  configFields: Array<{
    key: keyof AdapterConfig;
    label: string;
    type: 'boolean' | 'select';
    options?: Array<{ value: string | number; label: string }>;
    defaultValue: boolean | number | string;
  }>;
  // Returns string (sync) or Promise<string> (async, e.g. crypto)
  process: (input: string, config: AdapterConfig) => string | Promise<string>;
}

export const ADAPTERS: ToolAdapter[] = [
  {
    id: 'base64-encode',
    label: 'Base64 Encode',
    description: 'Encode text to Base64 string.',
    category: 'encoding',
    configFields: [
      { key: 'urlSafe', label: 'URL-safe', type: 'boolean', defaultValue: false },
    ],
    process: (input, config) => base64Encode(input, config.urlSafe),
  },
  {
    id: 'base64-decode',
    label: 'Base64 Decode',
    description: 'Decode a Base64 string back to text.',
    category: 'encoding',
    configFields: [],
    process: (input) => base64Decode(input),
  },
  {
    id: 'json-format',
    label: 'JSON Format',
    description: 'Pretty-print JSON with configurable indentation.',
    category: 'json',
    configFields: [
      {
        key: 'indent',
        label: 'Indent',
        type: 'select',
        options: [
          { value: 2, label: '2 spaces' },
          { value: 4, label: '4 spaces' },
        ],
        defaultValue: 2,
      },
    ],
    process: (input, config) => jsonFormat(input, (config.indent as 2 | 4) ?? 2),
  },
  {
    id: 'json-minify',
    label: 'JSON Minify',
    description: 'Strip whitespace from JSON to produce compact output.',
    category: 'json',
    configFields: [],
    process: (input) => jsonMinify(input),
  },
  {
    id: 'jwt-inspect',
    label: 'JWT Inspect',
    description: 'Decode a JWT token and expose its header, payload, and expiry status.',
    category: 'auth',
    configFields: [],
    process: (input) => jwtInspect(input),
  },
  {
    id: 'regex-filter',
    label: 'Regex Filter',
    description: 'Keep only lines in the input that match the given regex pattern.',
    category: 'text',
    configFields: [
      { key: 'pattern', label: 'Pattern', type: 'boolean', defaultValue: '' },
      { key: 'flags', label: 'Flags', type: 'boolean', defaultValue: 'gm' },
    ],
    process: (input, config) => regexFilter(input, config.pattern ?? '', config.flags ?? 'gm'),
  },
  {
    id: 'hash-sha256',
    label: 'Hash SHA-256',
    description: 'Generate a SHA-256 hex digest of the input using the Web Crypto API.',
    category: 'crypto',
    configFields: [],
    process: (input) => hashSha256(input),
  },
  {
    id: 'sql-to-json',
    label: 'SQL to JSON',
    description: 'Convert INSERT SQL statements or CSV/TSV data to a JSON array.',
    category: 'data',
    configFields: [],
    process: (input) => sqlToJson(input),
  },
];

export const ADAPTER_MAP: Record<AdapterId, ToolAdapter> = Object.fromEntries(
  ADAPTERS.map((a) => [a.id, a])
) as Record<AdapterId, ToolAdapter>;
