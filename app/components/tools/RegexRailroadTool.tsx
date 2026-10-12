'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  Copy, Check, Trash2, Download, Info, AlertCircle, ZoomIn, ZoomOut, RotateCcw,
  Play, Pause, SkipForward, SkipBack, ShieldAlert, ShieldCheck, Code2,
  FileCode, Layers, Sparkles, Wand2
} from 'lucide-react';
import { analyzeReDoS } from './regexRailroad/redosAnalyzer';
import { buildMatchTrace, TraceStep } from './regexRailroad/tracerEngine';
import { generatePolyglotSnippets, LanguageId } from './regexRailroad/polyglotExport';
import { lintRegex, LintSuggestion } from './regexRailroad/linter';
import { generateMermaidDiagram, exportSvgAsPng } from './regexRailroad/mermaider';

// ─── Lexer ──────────────────────────────────────────────────────────────────

export type TokenKind =
  | 'ANCHOR_START' | 'ANCHOR_END' | 'WORD_BOUNDARY' | 'NON_WORD_BOUNDARY'
  | 'CHAR_CLASS' | 'DOT'
  | 'LITERAL'
  | 'QUANTIFIER'
  | 'GROUP_OPEN' | 'GROUP_CLOSE'
  | 'NON_CAPTURE_OPEN'
  | 'LOOKAHEAD_POS_OPEN' | 'LOOKAHEAD_NEG_OPEN'
  | 'LOOKBEHIND_POS_OPEN' | 'LOOKBEHIND_NEG_OPEN'
  | 'NAMED_GROUP_OPEN'
  | 'ALTERNATION'
  | 'BACKREFERENCE';

export interface Token {
  kind: TokenKind;
  raw: string;
  label: string;
  explanation: string;
  groupName?: string;
  groupIndex?: number;
}

export function lexRegex(pattern: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let groupCount = 0;

  while (i < pattern.length) {
    const c = pattern[i];

    // Anchors
    if (c === '^') {
      tokens.push({
        kind: 'ANCHOR_START',
        raw: '^',
        label: 'Start of line',
        explanation: 'Asserts position at the beginning of string or line (with m flag).',
      });
      i++;
    } else if (c === '$') {
      tokens.push({
        kind: 'ANCHOR_END',
        raw: '$',
        label: 'End of line',
        explanation: 'Asserts position at the end of string or line (with m flag).',
      });
      i++;
    } else if (c === '\\') {
      const next = pattern[i + 1] ?? '';
      if (next === 'b') {
        tokens.push({
          kind: 'WORD_BOUNDARY',
          raw: '\\b',
          label: 'Word boundary',
          explanation: 'Matches at a word boundary (between \\w and \\W).',
        });
        i += 2;
      } else if (next === 'B') {
        tokens.push({
          kind: 'NON_WORD_BOUNDARY',
          raw: '\\B',
          label: 'Non-word boundary',
          explanation: 'Matches at any position that is not a word boundary.',
        });
        i += 2;
      } else if (next === 'd') {
        tokens.push({
          kind: 'CHAR_CLASS',
          raw: '\\d',
          label: 'Digit [0-9]',
          explanation: 'Matches any digit character (equivalent to [0-9]).',
        });
        i += 2;
      } else if (next === 'D') {
        tokens.push({
          kind: 'CHAR_CLASS',
          raw: '\\D',
          label: 'Non-digit [^0-9]',
          explanation: 'Matches any character that is not a digit.',
        });
        i += 2;
      } else if (next === 'w') {
        tokens.push({
          kind: 'CHAR_CLASS',
          raw: '\\w',
          label: 'Word char [a-zA-Z0-9_]',
          explanation: 'Matches any alphanumeric word character or underscore.',
        });
        i += 2;
      } else if (next === 'W') {
        tokens.push({
          kind: 'CHAR_CLASS',
          raw: '\\W',
          label: 'Non-word char',
          explanation: 'Matches any non-word character.',
        });
        i += 2;
      } else if (next === 's') {
        tokens.push({
          kind: 'CHAR_CLASS',
          raw: '\\s',
          label: 'Whitespace',
          explanation: 'Matches whitespace characters (spaces, tabs, newlines).',
        });
        i += 2;
      } else if (next === 'S') {
        tokens.push({
          kind: 'CHAR_CLASS',
          raw: '\\S',
          label: 'Non-whitespace',
          explanation: 'Matches any non-whitespace character.',
        });
        i += 2;
      } else if (next === 'n') {
        tokens.push({ kind: 'LITERAL', raw: '\\n', label: 'Newline (\\n)', explanation: 'Matches a linefeed character.' });
        i += 2;
      } else if (next === 't') {
        tokens.push({ kind: 'LITERAL', raw: '\\t', label: 'Tab (\\t)', explanation: 'Matches a horizontal tab character.' });
        i += 2;
      } else if (next === 'r') {
        tokens.push({ kind: 'LITERAL', raw: '\\r', label: 'Carriage return (\\r)', explanation: 'Matches a carriage return character.' });
        i += 2;
      } else if (/\d/.test(next)) {
        let j = i + 1;
        while (j < pattern.length && /\d/.test(pattern[j])) j++;
        const ref = pattern.slice(i + 1, j);
        tokens.push({
          kind: 'BACKREFERENCE',
          raw: `\\${ref}`,
          label: `Backref \\${ref}`,
          explanation: `Matches the exact text captured by group #${ref}.`,
        });
        i = j;
      } else {
        tokens.push({
          kind: 'LITERAL',
          raw: `\\${next}`,
          label: `Escaped '${next}'`,
          explanation: `Matches the literal character '${next}'.`,
        });
        i += 2;
      }
    } else if (c === '[') {
      let j = i + 1;
      if (pattern[j] === '^') j++;
      while (j < pattern.length) {
        if (pattern[j] === '\\') { j += 2; continue; }
        if (pattern[j] === ']') { j++; break; }
        j++;
      }
      const raw = pattern.slice(i, j);
      const negated = raw[1] === '^';
      tokens.push({
        kind: 'CHAR_CLASS',
        raw,
        label: negated ? `Negated ${raw}` : `Class ${raw}`,
        explanation: negated
          ? `Matches any character except those defined inside: ${raw}.`
          : `Matches one character from the specified set: ${raw}.`,
      });
      i = j;
    } else if (c === '(') {
      const sub = pattern.substring(i);
      if (sub.startsWith('(?:')) {
        tokens.push({
          kind: 'NON_CAPTURE_OPEN',
          raw: '(?:',
          label: 'Non-capture group (?:',
          explanation: 'Groups tokens together without saving captured submatches.',
        });
        i += 3;
      } else if (sub.startsWith('(?=')) {
        tokens.push({
          kind: 'LOOKAHEAD_POS_OPEN',
          raw: '(?=',
          label: 'Lookahead (?=)',
          explanation: 'Positive lookahead: asserts subsequent tokens match without consuming characters.',
        });
        i += 3;
      } else if (sub.startsWith('(?!')) {
        tokens.push({
          kind: 'LOOKAHEAD_NEG_OPEN',
          raw: '(?!',
          label: 'Neg. lookahead (?!)',
          explanation: 'Negative lookahead: asserts subsequent tokens do not match.',
        });
        i += 3;
      } else if (sub.startsWith('(?<=')) {
        tokens.push({
          kind: 'LOOKBEHIND_POS_OPEN',
          raw: '(?<=',
          label: 'Lookbehind (?<=)',
          explanation: 'Positive lookbehind: asserts preceding tokens match without consuming characters.',
        });
        i += 4;
      } else if (sub.startsWith('(?<!')) {
        tokens.push({
          kind: 'LOOKBEHIND_NEG_OPEN',
          raw: '(?<!',
          label: 'Neg. lookbehind (?<!)',
          explanation: 'Negative lookbehind: asserts preceding tokens do not match.',
        });
        i += 4;
      } else if (sub.startsWith('(?<')) {
        const endName = sub.indexOf('>');
        if (endName > 0) {
          const groupName = sub.slice(3, endName);
          tokens.push({
            kind: 'NAMED_GROUP_OPEN',
            raw: `(?<${groupName}>`,
            label: `Group <${groupName}>`,
            explanation: `Named capturing group storing result in match.groups.${groupName}.`,
            groupName,
          });
          i += endName + 1;
        } else {
          groupCount++;
          tokens.push({
            kind: 'GROUP_OPEN',
            raw: '(',
            label: `Capture group #${groupCount}`,
            explanation: `Capturing group #${groupCount}. Stores submatch for extraction or backreferencing.`,
            groupIndex: groupCount,
          });
          i++;
        }
      } else {
        groupCount++;
        tokens.push({
          kind: 'GROUP_OPEN',
          raw: '(',
          label: `Capture group #${groupCount}`,
          explanation: `Capturing group #${groupCount}. Stores submatch for extraction or backreferencing.`,
          groupIndex: groupCount,
        });
        i++;
      }
    } else if (c === ')') {
      tokens.push({
        kind: 'GROUP_CLOSE',
        raw: ')',
        label: 'Close group )',
        explanation: 'Closes the current group or assertion.',
      });
      i++;
    } else if (c === '|') {
      tokens.push({
        kind: 'ALTERNATION',
        raw: '|',
        label: 'OR (alternation)',
        explanation: 'Matches either the pattern before or after the vertical bar.',
      });
      i++;
    } else if (c === '.') {
      tokens.push({
        kind: 'DOT',
        raw: '.',
        label: 'Any character (.)',
        explanation: 'Matches any single character except line terminators (unless dotAll flag is set).',
      });
      i++;
    } else if (c === '+' || c === '*' || c === '?') {
      let raw = c;
      let j = i + 1;
      if (pattern[j] === '?') { raw += '?'; j++; }
      else if (pattern[j] === '+') { raw += '+'; j++; }
      const isLazy = raw.endsWith('?');
      tokens.push({
        kind: 'QUANTIFIER',
        raw,
        label: `${raw} ${isLazy ? '(lazy)' : '(greedy)'}`,
        explanation: c === '+' ? 'Matches 1 or more times.' : c === '*' ? 'Matches 0 or more times.' : 'Matches 0 or 1 time (optional).',
      });
      i = j;
    } else if (c === '{') {
      let j = i + 1;
      while (j < pattern.length && pattern[j] !== '}') j++;
      if (j < pattern.length) j++;
      const raw = pattern.slice(i, j);
      tokens.push({
        kind: 'QUANTIFIER',
        raw,
        label: `Repeat ${raw}`,
        explanation: `Matches specified range of repetitions: ${raw}.`,
      });
      i = j;
    } else {
      let j = i + 1;
      while (
        j < pattern.length &&
        !'^$\\()[]{}|.*+?'.includes(pattern[j])
      ) j++;
      const raw = pattern.slice(i, j);
      tokens.push({
        kind: 'LITERAL',
        raw,
        label: `"${raw}"`,
        explanation: `Matches the exact string "${raw}".`,
      });
      i = j;
    }
  }

  return tokens;
}

// ─── Color & Palette ────────────────────────────────────────────────────────

const TOKEN_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  ANCHOR_START:        { fill: '#1e293b', stroke: '#38bdf8', text: '#bae6fd' },
  ANCHOR_END:          { fill: '#1e293b', stroke: '#38bdf8', text: '#bae6fd' },
  WORD_BOUNDARY:       { fill: '#1f2937', stroke: '#9ca3af', text: '#e5e7eb' },
  NON_WORD_BOUNDARY:   { fill: '#1f2937', stroke: '#6b7280', text: '#d1d5db' },
  CHAR_CLASS:          { fill: '#1e293b', stroke: '#60a5fa', text: '#93c5fd' },
  DOT:                 { fill: '#2e1065', stroke: '#c084fc', text: '#f3e8ff' },
  LITERAL:             { fill: '#14291f', stroke: '#22c55e', text: '#86efac' },
  QUANTIFIER:          { fill: '#2e2008', stroke: '#f59e0b', text: '#fde68a' },
  GROUP_OPEN:          { fill: '#082f49', stroke: '#0284c7', text: '#7dd3fc' },
  NON_CAPTURE_OPEN:    { fill: '#1f2937', stroke: '#64748b', text: '#cbd5e1' },
  LOOKAHEAD_POS_OPEN:  { fill: '#14332b', stroke: '#10b981', text: '#6ee7b7' },
  LOOKAHEAD_NEG_OPEN:  { fill: '#3f1717', stroke: '#ef4444', text: '#fca5a5' },
  LOOKBEHIND_POS_OPEN: { fill: '#14332b', stroke: '#10b981', text: '#6ee7b7' },
  LOOKBEHIND_NEG_OPEN: { fill: '#3f1717', stroke: '#ef4444', text: '#fca5a5' },
  NAMED_GROUP_OPEN:    { fill: '#082f49', stroke: '#0284c7', text: '#7dd3fc' },
  GROUP_CLOSE:         { fill: '#0f2937', stroke: '#0ea5e9', text: '#7dd3fc' },
  ALTERNATION:         { fill: '#3b1236', stroke: '#ec4899', text: '#f9a8d4' },
  BACKREFERENCE:       { fill: '#3b2d12', stroke: '#eab308', text: '#fef08a' },
};

const DEFAULT_COLOR = { fill: '#1e1e2e', stroke: '#52525b', text: '#a1a1aa' };

const PRESETS = [
  { name: 'Email Address', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', sample: 'developer@c3mindloop.dev' },
  { name: 'URL / Domain', pattern: '^https?:\\/\\/(?:www\\.)?[a-zA-Z0-9-]+\\.[a-z]{2,}(?:\\/[^\\s]*)?$', sample: 'https://c3mindloop.dev/tools' },
  { name: 'UUID v4', pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', sample: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' },
  { name: 'IPv4 Address', pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$', sample: '192.168.1.1' },
  { name: 'Strong Password', pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$', sample: 'P@ssw0rd2026!' },
  { name: 'Hex Color', pattern: '^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$', sample: '#1D9BF0' },
];

// Layout constants
const NODE_HEIGHT = 42;
const NODE_PADDING_X = 14;
const MIN_NODE_WIDTH = 80;
const ROW_GAP = 60;
const H_GAP = 22;
const MARGIN_X = 32;
const MARGIN_Y = 32;
const TOKENS_PER_ROW = 6;
const FONT_SIZE = 11;
const LABEL_FONT_SIZE = 9;

interface NodeLayout {
  token: Token;
  x: number;
  y: number;
  w: number;
  h: number;
  row: number;
  col: number;
  tokenIndex: number;
}

function measureText(text: string, fontSize: number): number {
  return text.length * fontSize * 0.62 + NODE_PADDING_X * 2;
}

function buildLayout(tokens: Token[]): { nodes: NodeLayout[]; svgWidth: number; svgHeight: number } {
  if (tokens.length === 0) return { nodes: [], svgWidth: 0, svgHeight: 0 };

  const nodes: NodeLayout[] = [];
  const rowCount = Math.ceil(tokens.length / TOKENS_PER_ROW);
  const rowWidths: number[] = new Array(rowCount).fill(0);

  tokens.forEach((token, idx) => {
    const row = Math.floor(idx / TOKENS_PER_ROW);
    const col = idx % TOKENS_PER_ROW;
    const rawLabel = token.raw.length > 18 ? token.raw.slice(0, 16) + '…' : token.raw;
    const w = Math.max(MIN_NODE_WIDTH, measureText(rawLabel, FONT_SIZE));
    rowWidths[row] += w + (col > 0 ? H_GAP : 0);
    nodes.push({ token, x: 0, y: 0, w, h: NODE_HEIGHT, row, col, tokenIndex: idx });
  });

  const maxRowWidth = Math.max(...rowWidths);
  const svgWidth = Math.max(500, maxRowWidth + MARGIN_X * 2);

  let curRow = -1;
  let curX = MARGIN_X;
  let curY = MARGIN_Y;

  nodes.forEach((node) => {
    if (node.row !== curRow) {
      curRow = node.row;
      curX = MARGIN_X;
      curY = MARGIN_Y + node.row * (NODE_HEIGHT + ROW_GAP);
    }
    node.x = curX;
    node.y = curY;
    curX += node.w + H_GAP;
  });

  const svgHeight = rowCount * (NODE_HEIGHT + ROW_GAP) + MARGIN_Y + 10;
  return { nodes, svgWidth, svgHeight };
}

// ─── SVG Railroad Component ─────────────────────────────────────────────────

function RailroadSVG({
  tokens,
  testString,
  activeTokenIndex,
  onNodeClick,
}: {
  tokens: Token[];
  testString: string;
  activeTokenIndex: number | null;
  onNodeClick: (token: Token) => void;
}) {
  const { nodes, svgWidth, svgHeight } = useMemo(() => buildLayout(tokens), [tokens]);

  if (tokens.length === 0) {
    return (
      <div className="flex items-center justify-center h-44 text-neutral-500 text-xs font-mono">
        Enter a regular expression above to generate the syntax diagram.
      </div>
    );
  }

  const matchedRaws = new Set<number>();
  if (testString) {
    tokens.forEach((t, idx) => {
      if (t.kind === 'LITERAL' && testString.includes(t.raw)) matchedRaws.add(idx);
    });
  }

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      xmlns="http://www.w3.org/2000/svg"
      className="font-mono select-none"
      style={{ minWidth: svgWidth }}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#404040" />
        </marker>
        <marker id="arrow-active" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#38bdf8" />
        </marker>
      </defs>

      {/* Connection lines */}
      {nodes.map((node, idx) => {
        const next = nodes[idx + 1];
        if (!next) return null;
        const isCurrentActive = activeTokenIndex === node.tokenIndex;

        if (node.row === next.row) {
          const x1 = node.x + node.w;
          const y1 = node.y + NODE_HEIGHT / 2;
          const x2 = next.x;
          const y2 = y1;
          return (
            <line
              key={`line-${idx}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isCurrentActive ? '#38bdf8' : '#334155'}
              strokeWidth={isCurrentActive ? 2 : 1.5}
              markerEnd={isCurrentActive ? 'url(#arrow-active)' : 'url(#arrow)'}
            />
          );
        } else {
          const x1 = node.x + node.w;
          const y1 = node.y + NODE_HEIGHT / 2;
          const xMid = node.x + node.w + H_GAP / 2;
          const y2 = next.y + NODE_HEIGHT / 2;
          const x2 = next.x;
          return (
            <path
              key={`line-${idx}`}
              d={`M ${x1} ${y1} L ${xMid} ${y1} L ${xMid} ${y2} L ${x2} ${y2}`}
              stroke={isCurrentActive ? '#38bdf8' : '#334155'}
              strokeWidth={isCurrentActive ? 2 : 1.5}
              fill="none"
              strokeLinejoin="round"
            />
          );
        }
      })}

      {/* Nodes */}
      {nodes.map((node) => {
        const colors = TOKEN_COLORS[node.token.kind] ?? DEFAULT_COLOR;
        const isMatch = matchedRaws.has(node.tokenIndex);
        const isActiveTracer = activeTokenIndex === node.tokenIndex;
        const rx = 6;
        const cx = node.x + node.w / 2;
        const cy = node.y + NODE_HEIGHT / 2;

        const isAnchor = node.token.kind === 'ANCHOR_START' || node.token.kind === 'ANCHOR_END' || node.token.kind === 'WORD_BOUNDARY' || node.token.kind === 'NON_WORD_BOUNDARY';
        const isAlternation = node.token.kind === 'ALTERNATION';
        const isQuantifier = node.token.kind === 'QUANTIFIER';

        const rawLabel = node.token.raw.length > 18 ? node.token.raw.slice(0, 16) + '…' : node.token.raw;
        const subLabel = node.token.label.length > 22 ? node.token.label.slice(0, 20) + '…' : node.token.label;

        return (
          <g
            key={node.tokenIndex}
            onClick={() => onNodeClick(node.token)}
            style={{ cursor: 'pointer' }}
          >
            {/* Active tracer pulse glow */}
            {isActiveTracer && (
              <rect
                x={node.x - 4} y={node.y - 4}
                width={node.w + 8} height={node.h + 8}
                rx={rx + 3} fill="none"
                stroke="#38bdf8" strokeWidth={2.5}
                filter="url(#glow)"
              />
            )}

            {/* Test match ring */}
            {isMatch && !isActiveTracer && (
              <rect
                x={node.x - 2} y={node.y - 2}
                width={node.w + 4} height={node.h + 4}
                rx={rx + 2} fill="none"
                stroke="#22c55e" strokeWidth={1.5} opacity={0.6}
              />
            )}

            {/* Node rect */}
            <rect
              x={node.x} y={node.y}
              width={node.w} height={node.h}
              rx={isAnchor ? 20 : isAlternation ? 4 : rx}
              fill={colors.fill}
              stroke={isActiveTracer ? '#38bdf8' : colors.stroke}
              strokeWidth={isActiveTracer ? 2 : isAlternation ? 2 : 1.5}
              strokeDasharray={isQuantifier ? '4 2' : undefined}
            />

            {/* Main Token text */}
            <text
              x={cx} y={cy - 5}
              textAnchor="middle"
              fontSize={FONT_SIZE}
              fill={isActiveTracer ? '#ffffff' : colors.text}
              fontFamily="monospace"
              fontWeight="600"
            >
              {rawLabel}
            </text>

            {/* Sub-label text */}
            <text
              x={cx} y={cy + 10}
              textAnchor="middle"
              fontSize={LABEL_FONT_SIZE}
              fill={isActiveTracer ? '#bae6fd' : '#94a3b8'}
              fontFamily="sans-serif"
            >
              {subLabel}
            </text>

            {/* Group badge */}
            {node.token.groupIndex !== undefined && (
              <g>
                <circle cx={node.x + node.w - 8} cy={node.y + 8} r={7} fill="#0ea5e9" opacity={0.9} />
                <text
                  x={node.x + node.w - 8} y={node.y + 11}
                  textAnchor="middle" fontSize={8}
                  fill="white" fontFamily="sans-serif" fontWeight="bold"
                >
                  {node.token.groupIndex}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Row labels */}
      {Array.from(new Set(nodes.map(n => n.row))).map(row => {
        const rowNodes = nodes.filter(n => n.row === row);
        if (rowNodes.length === 0) return null;
        const y = rowNodes[0].y + NODE_HEIGHT + 12;
        return (
          <text
            key={`row-${row}`}
            x={MARGIN_X} y={y}
            fontSize={9} fill="#475569" fontFamily="monospace"
          >
            {`── track ${row + 1} ──`}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Main Tool Component ────────────────────────────────────────────────────

export const RegexRailroadTool: React.FC = () => {
  const [pattern, setPattern] = useState('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
  const [testString, setTestString] = useState('developer@c3mindloop.dev');
  const [flags, setFlags] = useState({ global: false, ignoreCase: false, multiline: false, dotAll: false });
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

  // Feature Tabs
  const [activeTab, setActiveTab] = useState<'diagram' | 'tracer' | 'polyglot' | 'anatomy' | 'redos'>('diagram');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageId>('javascript');

  // Tracer playback state
  const [tracerStepIndex, setTracerStepIndex] = useState<number>(0);
  const [isPlayingTrace, setIsPlayingTrace] = useState<boolean>(false);

  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Tokens & Lexer
  const tokens = useMemo(() => {
    try { return lexRegex(pattern); }
    catch { return []; }
  }, [pattern]);

  // Syntax validity
  const regexError = useMemo(() => {
    if (!pattern) return null;
    try {
      const flagStr = [
        flags.global ? 'g' : '',
        flags.ignoreCase ? 'i' : '',
        flags.multiline ? 'm' : '',
        flags.dotAll ? 's' : '',
      ].join('');
      new RegExp(pattern, flagStr);
      return null;
    } catch (e: any) {
      return e.message;
    }
  }, [pattern, flags]);

  // ReDoS Analysis
  const redosResult = useMemo(() => analyzeReDoS(pattern), [pattern]);

  // Linter & Suggestions
  const lintSuggestions = useMemo(() => lintRegex(pattern), [pattern]);

  // Match Simulation & Tracer
  const traceResult = useMemo(() => {
    return buildMatchTrace(pattern, testString, tokens);
  }, [pattern, testString, tokens]);

  // Active step in tracer
  const currentTraceStep: TraceStep | undefined = traceResult.steps[tracerStepIndex];
  const activeTracerTokenIndex = activeTab === 'tracer' && currentTraceStep ? currentTraceStep.tokenIndex : null;

  // Auto-step player
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlayingTrace && traceResult.steps.length > 0) {
      timer = setInterval(() => {
        setTracerStepIndex((prev) => {
          if (prev >= traceResult.steps.length - 1) {
            setIsPlayingTrace(false);
            return prev;
          }
          return prev + 1;
        });
      }, 700);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlayingTrace, traceResult.steps.length]);

  // Polyglot Snippets
  const codeSnippets = useMemo(() => {
    return generatePolyglotSnippets(pattern, flags);
  }, [pattern, flags]);

  const activeSnippet = useMemo(() => {
    return codeSnippets.find((s) => s.id === selectedLanguage)?.code ?? '';
  }, [codeSnippets, selectedLanguage]);

  // Handlers
  const handleCopyRegex = () => {
    const flagStr = [
      flags.global ? 'g' : '',
      flags.ignoreCase ? 'i' : '',
      flags.multiline ? 'm' : '',
      flags.dotAll ? 's' : '',
    ].join('');
    navigator.clipboard.writeText(`/${pattern}/${flagStr}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1500);
  };

  const handleDownloadSVG = useCallback(() => {
    const svgEl = svgContainerRef.current?.querySelector('svg');
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const src = '<?xml version="1.0" standalone="no"?>\r\n' + serializer.serializeToString(svgEl);
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(src);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'regex-railroad.svg';
    a.click();
  }, []);

  const handleDownloadPNG = useCallback(() => {
    const svgEl = svgContainerRef.current?.querySelector('svg');
    if (!svgEl) return;
    exportSvgAsPng(svgEl, 'regex-railroad.png');
  }, []);

  const handleCopyMermaid = useCallback(() => {
    const mermaidCode = generateMermaidDiagram(tokens);
    navigator.clipboard.writeText(mermaidCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [tokens]);

  const handleClear = () => {
    setPattern('');
    setTestString('');
    setSelectedToken(null);
    setTracerStepIndex(0);
    setIsPlayingTrace(false);
  };

  const applyLintFix = (sug: LintSuggestion) => {
    setPattern((prev) => prev.replace(sug.original, sug.replacement));
  };

  return (
    <div className="developer-tool-container bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-100 flex flex-col w-full rounded-lg shadow-2xl overflow-hidden">

      {/* ── Action Toolbar (Starts directly with tool controls, NO duplicate H1) ── */}
      <div className="px-3 py-2.5 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-sans font-semibold text-neutral-400 mr-1">Presets:</span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setPattern(p.pattern);
                setTestString(p.sample);
                setSelectedToken(null);
                setTracerStepIndex(0);
              }}
              className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-sans transition-colors cursor-pointer"
            >
              {p.name}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="px-2.5 py-1 rounded bg-neutral-800/80 hover:bg-red-950 hover:text-red-300 text-neutral-400 text-[11px] font-sans transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* ReDoS Indicator Pill */}
          <button
            onClick={() => setActiveTab('redos')}
            className={`px-2.5 py-1 rounded border text-[11px] font-sans font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              redosResult.level === 'CRITICAL'
                ? 'bg-red-950/60 border-red-700 text-red-300 hover:bg-red-900/60'
                : redosResult.level === 'MODERATE'
                ? 'bg-amber-950/60 border-amber-700 text-amber-300 hover:bg-amber-900/60'
                : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40'
            }`}
            title="Click to view ReDoS & Catastrophic Backtracking Analysis"
          >
            {redosResult.level === 'CRITICAL' ? (
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>ReDoS: {redosResult.level}</span>
          </button>

          {/* Quick Copy */}
          <button
            onClick={handleCopyRegex}
            className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-sans font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Export Dropdown / Buttons */}
          <button
            onClick={handleDownloadSVG}
            className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-sans transition-colors cursor-pointer"
            title="Export Vector SVG"
          >
            <Download className="w-3 h-3 inline mr-1" />SVG
          </button>
          <button
            onClick={handleDownloadPNG}
            className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-sans transition-colors cursor-pointer"
            title="Export High-Res PNG (Retina 2x)"
          >
            <Download className="w-3 h-3 inline mr-1" />PNG
          </button>
          <button
            onClick={handleCopyMermaid}
            className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-sans transition-colors cursor-pointer"
            title="Copy Mermaid.js Markdown Flowchart for GitHub/Notion"
          >
            <FileCode className="w-3 h-3 inline mr-1" />Mermaid
          </button>
        </div>
      </div>

      {/* ── Pattern Input & Flags Row ── */}
      <div className="p-4 bg-neutral-950 border-b border-neutral-800 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Regex Pattern */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-sans font-semibold text-neutral-400">Regular Expression Pattern</label>
            {/* Flags */}
            <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
              <span className="text-neutral-500 font-sans">Flags:</span>
              {(['global', 'ignoreCase', 'multiline', 'dotAll'] as const).map((flag) => {
                const flagChar = flag === 'global' ? 'g' : flag === 'ignoreCase' ? 'i' : flag === 'multiline' ? 'm' : 's';
                const isSet = flags[flag];
                return (
                  <button
                    key={flag}
                    type="button"
                    onClick={() => setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }))}
                    className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                      isSet
                        ? 'bg-sky-500/20 border-sky-500/50 text-sky-300 font-bold'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {flagChar}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-neutral-500 text-base font-bold select-none">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => {
                setPattern(e.target.value);
                setSelectedToken(null);
                setTracerStepIndex(0);
              }}
              placeholder="e.g. ^[a-z0-9_-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"
              className="flex-1 p-2 bg-neutral-900 border border-neutral-800 rounded text-neutral-100 font-mono text-sm focus:outline-none focus:border-sky-500 transition-colors"
            />
            <span className="text-neutral-500 text-base font-bold select-none">/</span>
          </div>

          {regexError ? (
            <div className="flex items-center gap-2 text-red-400 text-[11px] pt-0.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{regexError}</span>
            </div>
          ) : lintSuggestions.length > 0 ? (
            <div className="flex items-center gap-2 text-[11px] text-amber-400/90 bg-amber-950/20 border border-amber-900/40 px-2 py-1 rounded">
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>{lintSuggestions.length} optimization suggestion available</span>
              <button
                onClick={() => applyLintFix(lintSuggestions[0])}
                className="ml-auto underline hover:text-amber-200 cursor-pointer font-sans text-[10px]"
              >
                Apply: {lintSuggestions[0].original} → {lintSuggestions[0].replacement}
              </button>
            </div>
          ) : null}
        </div>

        {/* Right: Test String Input */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-sans font-semibold text-neutral-400">
              Test Input String
            </label>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
              traceResult.isMatch
                ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-400'
                : testString
                ? 'bg-red-950/40 border-red-900/50 text-red-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500'
            }`}>
              {testString ? (traceResult.isMatch ? '● Full Match' : '○ No Match') : 'Empty Input'}
            </span>
          </div>

          <textarea
            value={testString}
            onChange={(e) => {
              setTestString(e.target.value);
              setTracerStepIndex(0);
            }}
            placeholder="Paste sample string to simulate matching & visualize tracks..."
            rows={2}
            className="w-full p-2 bg-neutral-900 border border-neutral-800 rounded text-neutral-200 font-mono text-xs focus:outline-none focus:border-sky-500 transition-colors resize-none"
          />
        </div>
      </div>

      {/* ── Sub-Navigation Tabs ── */}
      <div className="px-3 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('diagram')}
            className={`px-3 py-2 text-[11px] font-sans font-medium border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'diagram'
                ? 'border-sky-500 text-sky-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Railroad Diagram</span>
          </button>

          <button
            onClick={() => setActiveTab('tracer')}
            className={`px-3 py-2 text-[11px] font-sans font-medium border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'tracer'
                ? 'border-sky-500 text-sky-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-amber-400" />
            <span>Step-by-Step Tracer</span>
            {traceResult.steps.length > 0 && (
              <span className="text-[9px] px-1 bg-neutral-800 rounded font-mono text-neutral-300">
                {traceResult.steps.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('anatomy')}
            className={`px-3 py-2 text-[11px] font-sans font-medium border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'anatomy'
                ? 'border-sky-500 text-sky-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Pattern Anatomy</span>
            <span className="text-[9px] px-1 bg-neutral-800 rounded font-mono text-neutral-300">
              {tokens.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('redos')}
            className={`px-3 py-2 text-[11px] font-sans font-medium border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'redos'
                ? 'border-sky-500 text-sky-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>ReDoS & Performance</span>
          </button>

          <button
            onClick={() => setActiveTab('polyglot')}
            className={`px-3 py-2 text-[11px] font-sans font-medium border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'polyglot'
                ? 'border-sky-500 text-sky-400 font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Code Export</span>
          </button>
        </div>

        {/* Zoom controls shown when viewing diagram */}
        {activeTab === 'diagram' && (
          <div className="flex items-center gap-1 py-1 shrink-0">
            <button
              onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
              className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-neutral-400 min-w-[32px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))}
              className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
              title="Reset zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Main View Area ── */}
      <div className="flex-1 min-h-[300px] flex flex-col bg-neutral-950">

        {/* TAB 1: Diagram / Visualizer */}
        {activeTab === 'diagram' && (
          <div className="flex flex-col flex-1">
            <div
              ref={svgContainerRef}
              className="overflow-auto bg-neutral-950 p-4 flex-1"
              style={{ minHeight: 280, maxHeight: 520 }}
            >
              <div
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                  transition: 'transform 0.12s ease',
                }}
              >
                <RailroadSVG
                  tokens={tokens}
                  testString={testString}
                  activeTokenIndex={null}
                  onNodeClick={setSelectedToken}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Step-by-Step Match Tracer */}
        {activeTab === 'tracer' && (
          <div className="p-4 space-y-4">
            {/* Tracer Controls Bar */}
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-md flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTracerStepIndex(0)}
                  disabled={tracerStepIndex === 0}
                  className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-200 text-xs flex items-center gap-1 cursor-pointer"
                  title="Rewind to start"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                  <span>Start</span>
                </button>

                <button
                  onClick={() => setTracerStepIndex((p) => Math.max(0, p - 1))}
                  disabled={tracerStepIndex === 0}
                  className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-200 text-xs cursor-pointer"
                  title="Previous Step"
                >
                  ◀ Prev
                </button>

                <button
                  onClick={() => setIsPlayingTrace((p) => !p)}
                  className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                    isPlayingTrace
                      ? 'bg-amber-600 text-white'
                      : 'bg-sky-600 hover:bg-sky-500 text-white'
                  }`}
                >
                  {isPlayingTrace ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlayingTrace ? 'Pause' : 'Play Simulation'}</span>
                </button>

                <button
                  onClick={() => setTracerStepIndex((p) => Math.min(traceResult.steps.length - 1, p + 1))}
                  disabled={tracerStepIndex >= traceResult.steps.length - 1}
                  className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-200 text-xs cursor-pointer"
                  title="Next Step"
                >
                  Next ▶
                </button>

                <span className="text-[11px] font-mono text-neutral-400 ml-2">
                  Step {traceResult.steps.length > 0 ? tracerStepIndex + 1 : 0} of {traceResult.steps.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-mono px-2 py-1 rounded border ${
                  currentTraceStep?.matched
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                    : 'bg-red-950/60 border-red-800 text-red-300'
                }`}>
                  Status: {currentTraceStep?.status.toUpperCase() ?? 'IDLE'}
                </span>
              </div>
            </div>

            {/* Test String Interactive Position Highlight */}
            {testString && (
              <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-md">
                <div className="text-[10px] font-sans text-neutral-500 uppercase tracking-wider mb-1.5">
                  Input String Pointer Trace
                </div>
                <div className="font-mono text-sm tracking-wider flex flex-wrap gap-1 bg-neutral-950 p-2.5 rounded border border-neutral-800/80">
                  {testString.split('').map((char, cIdx) => {
                    const isCurrentChar = currentTraceStep?.charIndex === cIdx;
                    return (
                      <span
                        key={cIdx}
                        className={`px-1.5 py-0.5 rounded transition-all ${
                          isCurrentChar
                            ? 'bg-sky-500 text-neutral-950 font-bold scale-110 shadow-lg shadow-sky-500/50 ring-2 ring-sky-300'
                            : cIdx < (currentTraceStep?.charIndex ?? -1)
                            ? 'text-neutral-400 bg-neutral-900'
                            : 'text-neutral-600'
                        }`}
                      >
                        {char === ' ' ? '␣' : char}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step Explanation Banner */}
            {currentTraceStep && (
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-md space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-300">Action:</span>
                  <span className="font-mono text-sky-400">{currentTraceStep.explanation}</span>
                </div>
                <div className="text-[11px] text-neutral-400 flex items-center gap-4">
                  <span>Testing Character: <code className="text-amber-300 font-mono">'{currentTraceStep.char}'</code></span>
                  <span>Target Node: <code className="text-sky-300 font-mono">{currentTraceStep.tokenRaw}</code> ({currentTraceStep.tokenLabel})</span>
                </div>
              </div>
            )}

            {/* Embedded Railroad with highlighted active node */}
            <div className="overflow-auto bg-neutral-950 p-3 rounded border border-neutral-800 max-h-[300px]">
              <RailroadSVG
                tokens={tokens}
                testString={testString}
                activeTokenIndex={activeTracerTokenIndex}
                onNodeClick={setSelectedToken}
              />
            </div>
          </div>
        )}

        {/* TAB 3: Pattern Anatomy (Plain-English Breakdown) */}
        {activeTab === 'anatomy' && (
          <div className="p-4 space-y-3">
            <div className="text-xs text-neutral-400 font-sans">
              Plain-English breakdown of every token and construct inside your regular expression:
            </div>
            <div className="border border-neutral-800 rounded-md overflow-hidden bg-neutral-900/40">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 font-sans">
                    <th className="p-2.5 font-semibold w-12 text-center">#</th>
                    <th className="p-2.5 font-semibold w-28">Raw Token</th>
                    <th className="p-2.5 font-semibold w-36">Category</th>
                    <th className="p-2.5 font-semibold">Plain-English Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-mono">
                  {tokens.map((t, idx) => {
                    const colors = TOKEN_COLORS[t.kind] ?? DEFAULT_COLOR;
                    return (
                      <tr
                        key={idx}
                        onClick={() => setSelectedToken(t)}
                        className="hover:bg-neutral-800/40 cursor-pointer transition-colors"
                      >
                        <td className="p-2.5 text-center text-neutral-500 font-sans">{idx + 1}</td>
                        <td className="p-2.5">
                          <span
                            className="px-2 py-0.5 rounded border inline-block"
                            style={{ background: colors.fill, borderColor: colors.stroke, color: colors.text }}
                          >
                            {t.raw}
                          </span>
                        </td>
                        <td className="p-2.5 text-neutral-400 font-sans">
                          {t.kind.replace(/_/g, ' ').toLowerCase()}
                        </td>
                        <td className="p-2.5 text-neutral-300 font-sans leading-relaxed">
                          {t.explanation}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ReDoS & Performance Security */}
        {activeTab === 'redos' && (
          <div className="p-4 space-y-4">
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {redosResult.level === 'CRITICAL' ? (
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  )}
                  <h3 className="text-sm font-sans font-bold text-neutral-200">
                    {redosResult.title}
                  </h3>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded font-bold border ${
                  redosResult.level === 'CRITICAL'
                    ? 'bg-red-950 border-red-700 text-red-300'
                    : redosResult.level === 'MODERATE'
                    ? 'bg-amber-950 border-amber-700 text-amber-300'
                    : 'bg-emerald-950 border-emerald-700 text-emerald-300'
                }`}>
                  Risk Score: {redosResult.score} / 100
                </span>
              </div>

              <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                {redosResult.summary}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-neutral-950 rounded-full h-2 border border-neutral-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    redosResult.score >= 60
                      ? 'bg-red-500'
                      : redosResult.score >= 25
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.max(5, redosResult.score)}%` }}
                />
              </div>
            </div>

            {/* Culprits & Risky Nodes */}
            {redosResult.culprits.length > 0 && (
              <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-md space-y-2">
                <span className="text-xs font-sans font-semibold text-red-300">
                  Detected Vulnerability Markers:
                </span>
                <ul className="list-disc pl-5 text-xs font-mono text-red-400 space-y-1">
                  {redosResult.culprits.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mitigation Suggestions */}
            <div className="p-3 bg-neutral-900/60 border border-neutral-800 rounded-md space-y-2">
              <span className="text-xs font-sans font-semibold text-neutral-300">
                Recommended Mitigations:
              </span>
              <ul className="list-disc pl-5 text-xs font-sans text-neutral-400 space-y-1 leading-relaxed">
                {redosResult.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* TAB 5: Polyglot Code Export */}
        {activeTab === 'polyglot' && (
          <div className="p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1">
                {codeSnippets.map((snip) => (
                  <button
                    key={snip.id}
                    onClick={() => setSelectedLanguage(snip.id)}
                    className={`px-2.5 py-1 rounded text-xs font-sans transition-colors cursor-pointer ${
                      selectedLanguage === snip.id
                        ? 'bg-sky-600 text-white font-semibold'
                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                    }`}
                  >
                    {snip.name}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs font-sans flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied Code!' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-md overflow-x-auto">
              <pre className="font-mono text-xs text-sky-300 leading-relaxed">
                {activeSnippet}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* ── Token Inspector Drawer ── */}
      {selectedToken && (
        <div className="px-4 py-3 bg-neutral-900 border-t border-neutral-800 flex flex-wrap items-center gap-3 text-[11px]">
          <span className="font-sans font-semibold text-neutral-300">Node Inspector:</span>
          <span className="font-mono text-sky-300 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
            {selectedToken.raw}
          </span>
          <span className="text-neutral-400 font-sans">{selectedToken.label}</span>
          <span className="text-neutral-500 font-sans italic">{selectedToken.explanation}</span>
          {selectedToken.groupName && (
            <span className="text-cyan-400 font-sans">
              Named group: <code className="text-cyan-300 font-mono">{selectedToken.groupName}</code>
            </span>
          )}
          {selectedToken.groupIndex !== undefined && (
            <span className="text-cyan-400 font-sans">
              Group #: <code className="text-cyan-300 font-mono">{selectedToken.groupIndex}</code>
            </span>
          )}
          <button
            onClick={() => setSelectedToken(null)}
            className="ml-auto text-neutral-500 hover:text-neutral-300 cursor-pointer transition-colors font-sans"
          >
            ✕ Dismiss
          </button>
        </div>
      )}

      {/* ── Footer Status Bar ── */}
      <div className="px-4 py-2 bg-neutral-900/80 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-neutral-400">
          <Info className="w-3.5 h-3.5 text-neutral-500" />
          <span>Client-Side Engine · Interactive Railroad Tracer · ReDoS Analyzer</span>
        </div>
        <span className="text-neutral-500">ECMAScript RegExp · 100% In-Browser</span>
      </div>
    </div>
  );
};
