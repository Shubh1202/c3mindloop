/**
 * diffDetector.ts
 *
 * Deterministic content-type detection for the Smart Diff engine.
 * No AI, no external APIs, no side effects.
 * Inspects BOTH inputs to determine the safest common type.
 */

export type ContentType =
  | 'json'
  | 'yaml'
  | 'xml'
  | 'csv'
  | 'tsv'
  | 'markdown'
  | 'javascript'
  | 'typescript'
  | 'html'
  | 'css'
  | 'sql'
  | 'php'
  | 'python'
  | 'java'
  | 'c'
  | 'shell'
  | 'text';

export type CompareMode = 'smart' | 'text' | 'structured';

export interface DetectionResult {
  type: ContentType;
  mode: CompareMode;
  label: string;          // human-readable label for UI badge
  modeLabel: string;
  isMixed: boolean;       // true when original and modified detected as different types
}

// ── Individual detector functions ────────────────────────────────────────────

function isJson(s: string): boolean {
  const t = s.trim();
  if (!t.startsWith('{') && !t.startsWith('[')) return false;
  try { JSON.parse(t); return true; } catch { return false; }
}

function isXml(s: string): boolean {
  const t = s.trim();
  // Must start with < and have a closing tag or self-close
  if (!t.startsWith('<')) return false;
  // Allow XML declaration or doctype
  if (/^<\?xml/i.test(t) || /^<!DOCTYPE/i.test(t)) return true;
  // Simple tag heuristic: starts and ends with tags
  return /^<[a-zA-Z]/.test(t) && /<\/[a-zA-Z]/.test(t);
}

function isHtml(s: string): boolean {
  const t = s.trim().toLowerCase();
  return (
    t.startsWith('<!doctype html') ||
    t.startsWith('<html') ||
    (t.startsWith('<') && (
      t.includes('</div>') ||
      t.includes('</p>') ||
      t.includes('</span>') ||
      t.includes('</body>') ||
      t.includes('</head>') ||
      t.includes('<br') ||
      t.includes('<img ')
    ))
  );
}

function isYaml(s: string): boolean {
  const t = s.trim();
  // YAML indicators: starts with ---, has key: value lines, no JSON braces
  if (t.startsWith('{') || t.startsWith('[')) return false;
  const lines = t.split('\n').slice(0, 20);
  const yamlKeyLine = /^[\w\- ]+:\s/;
  const yamlListItem = /^\s*-\s+/;
  let score = 0;
  if (t.startsWith('---')) score += 3;
  for (const line of lines) {
    if (yamlKeyLine.test(line)) score++;
    if (yamlListItem.test(line)) score++;
  }
  return score >= 2;
}

function isCsv(s: string): boolean {
  const lines = s.trim().split('\n').slice(0, 5);
  if (lines.length < 2) return false;
  const commaCount = lines.map(l => (l.match(/,/g) || []).length);
  const consistent = commaCount.every(c => c > 0 && Math.abs(c - commaCount[0]) <= 1);
  return consistent && commaCount[0] >= 1;
}

function isTsv(s: string): boolean {
  const lines = s.trim().split('\n').slice(0, 5);
  if (lines.length < 2) return false;
  const tabCount = lines.map(l => (l.match(/\t/g) || []).length);
  return tabCount.every(c => c > 0 && c === tabCount[0]);
}

function isMarkdown(s: string): boolean {
  const t = s.trim();
  let score = 0;
  if (/^#{1,6}\s/.test(t)) score += 3;                        // heading
  if (/\*\*[^*]+\*\*/.test(t)) score++;                       // bold
  if (/^\s*[-*+]\s/m.test(t)) score++;                        // list
  if (/^\s*>\s/m.test(t)) score++;                            // blockquote
  if (/```/.test(t)) score += 2;                              // code fence
  if (/\[[^\]]+\]\([^)]+\)/.test(t)) score++;                 // link
  if (/^\|.+\|/m.test(t)) score++;                            // table
  if (/^---+\s*$/m.test(t) && score > 0) score++;             // hr
  return score >= 2;
}

function isTypeScript(s: string): boolean {
  return (
    /:\s*(string|number|boolean|void|any|never|unknown|null|undefined)\b/.test(s) ||
    /\binterface\s+\w+/.test(s) ||
    /\btype\s+\w+\s*=/.test(s) ||
    /\benum\s+\w+/.test(s) ||
    /<[A-Z]\w*>/.test(s)          // generic usage
  );
}

function isJavaScript(s: string): boolean {
  return (
    /\bfunction\s+\w+\s*\(/.test(s) ||
    /\b(const|let|var)\s+\w+\s*=/.test(s) ||
    /\bimport\s+.+\bfrom\b/.test(s) ||
    /\brequire\s*\(/.test(s) ||
    /\b(async|await)\b/.test(s) ||
    /=>\s*[\{(]/.test(s)
  );
}

function isCss(s: string): boolean {
  const t = s.trim();
  // Require clear CSS patterns -  avoid matching TypeScript interfaces/objects
  return (
    /@(media|keyframes|import|charset|font-face)/.test(t) ||
    (
      /[.#][\w-]+\s*\{/.test(t) &&   // class or id selector
      /:\s*(px|em|rem|%|vh|vw|auto|inherit|none)\b/.test(t)
    )
  );
}

function isSql(s: string): boolean {
  return /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|FROM|WHERE|JOIN|TABLE|INDEX)\b/i.test(s);
}

function isPython(s: string): boolean {
  return (
    /^def\s+\w+\s*\(/m.test(s) ||
    /^class\s+\w+/m.test(s) ||
    /\bimport\s+\w+/.test(s) ||
    /\bprint\s*\(/.test(s) ||
    /^from\s+\w+\s+import/m.test(s)
  );
}

function isPhp(s: string): boolean {
  return /<\?php/.test(s) || /\$[a-zA-Z_]\w*\s*=/.test(s);
}

function isJava(s: string): boolean {
  return (
    /\bpublic\s+(class|interface|enum)\s+\w+/.test(s) ||
    /\b(public|private|protected)\s+\w+\s+\w+\s*\(/.test(s) ||
    /\bSystem\.out\.print/.test(s)
  );
}

function isC(s: string): boolean {
  return (
    /#include\s*[<"]/.test(s) ||
    /\bint\s+main\s*\(/.test(s) ||
    /\bprintf\s*\(/.test(s)
  );
}

function isShell(s: string): boolean {
  return (
    /^#!/.test(s.trim()) ||
    /\b(echo|export|source|grep|awk|sed|chmod|mkdir|rm|ls|cd)\b/.test(s) ||
    /\$\{?\w+\}?/.test(s)
  );
}

// ── Single-input detector ────────────────────────────────────────────────────

function detectSingle(s: string, fileExt?: string): ContentType {
  const t = s.trim();
  if (t === '') return 'text';

  // File extension takes strong precedence
  if (fileExt) {
    const ext = fileExt.toLowerCase().replace(/^\./, '');
    const extMap: Record<string, ContentType> = {
      json: 'json', jsonc: 'json',
      yaml: 'yaml', yml: 'yaml',
      xml: 'xml', xsd: 'xml', xsl: 'xml', svg: 'xml',
      html: 'html', htm: 'html',
      css: 'css', scss: 'css', less: 'css',
      ts: 'typescript', tsx: 'typescript',
      js: 'javascript', jsx: 'javascript', mjs: 'javascript',
      sql: 'sql',
      py: 'python',
      php: 'php',
      java: 'java',
      c: 'c', cpp: 'c', h: 'c',
      sh: 'shell', bash: 'shell', zsh: 'shell',
      csv: 'csv',
      tsv: 'tsv',
      md: 'markdown', mdx: 'markdown',
    };
    if (ext in extMap) return extMap[ext];
  }

  // Structural checks -  order matters (most specific first)
  if (isJson(t)) return 'json';
  if (isHtml(t)) return 'html';
  if (isXml(t)) return 'xml';
  if (isTsv(t)) return 'tsv';
  if (isCsv(t)) return 'csv';

  // Language-specific before generic text
  if (isPhp(t)) return 'php';
  if (isC(t)) return 'c';
  if (isPython(t)) return 'python';
  if (isJava(t)) return 'java';
  if (isShell(t)) return 'shell';
  if (isSql(t)) return 'sql';
  // TypeScript check before CSS/JavaScript (TS is a superset of JS)
  if (isTypeScript(t)) return 'typescript';
  if (isJavaScript(t)) return 'javascript';
  if (isCss(t)) return 'css';
  // Markdown before YAML (both can have --- and key-like lines)
  if (isMarkdown(t)) return 'markdown';
  if (isYaml(t)) return 'yaml';

  return 'text';
}

// ── Human-readable labels ────────────────────────────────────────────────────

const TYPE_LABELS: Record<ContentType, string> = {
  json:       'JSON',
  yaml:       'YAML',
  xml:        'XML',
  csv:        'CSV',
  tsv:        'TSV',
  markdown:   'Markdown',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  html:       'HTML',
  css:        'CSS',
  sql:        'SQL',
  php:        'PHP',
  python:     'Python',
  java:       'Java',
  c:          'C/C++',
  shell:      'Shell',
  text:       'Plain Text',
};

// Content types that have a structural comparison strategy
const STRUCTURAL_TYPES: Set<ContentType> = new Set(['json', 'yaml', 'xml', 'csv', 'tsv']);

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Detect content type from both inputs.
 * If they differ, falls back to text mode (mixed content).
 */
export function detectContent(
  original: string,
  modified: string,
  origExt?: string,
  modExt?: string,
): DetectionResult {
  const origType = detectSingle(original, origExt);
  const modType  = detectSingle(modified, modExt);

  const isMixed  = origType !== modType;
  const type: ContentType = isMixed ? 'text' : origType;

  const mode: CompareMode = STRUCTURAL_TYPES.has(type) ? 'smart' : 'smart';

  const modeLabel = STRUCTURAL_TYPES.has(type) && !isMixed
    ? 'Structural'
    : type === 'text'
    ? 'Line + Character'
    : 'Line + Character';

  return {
    type,
    mode,
    label: isMixed ? 'Mixed Content' : TYPE_LABELS[type],
    modeLabel,
    isMixed,
  };
}

export { TYPE_LABELS, STRUCTURAL_TYPES, detectSingle };
