'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Copy, Check, Trash2, Upload, ArrowLeftRight,
  Info, AlertCircle, Maximize2, Minimize2, Columns2,
  AlignLeft, ChevronUp, ChevronDown, Search,
  RotateCcw, RotateCw,
} from 'lucide-react';
import { toUnifiedDiff, type DiffResult, type DiffLine, type CharSpan } from './diffEngine';
import { smartDiff, type SmartDiffResult } from './smartDiff';
import { useSearch } from '../../hooks/useSearch';
import { SearchBar } from '../ui/SearchBar';
import { Toolbar } from '../ui/Toolbar';
import { useTheme } from '../../lib/theme';

type ViewMode = 'split' | 'inline';
type CompareMode = 'smart' | 'text';

// Ã¢â€â‚¬Ã¢â€â‚¬ Resize constants Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const MIN_H = 300;
const MAX_H_VH = 0.88;
const DEFAULT_H_VH = 0.65;

// Ã¢â€â‚¬Ã¢â€â‚¬ Samples Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const SAMPLE_ORIGINAL = `function fetchUser(id) {
  const url = '/api/user/' + id;
  return fetch(url)
    .then(res => res.json())
    .then(data => {
      console.log('user:', data);
      return data;
    });
}

const MAX_RETRIES = 3;`;

const SAMPLE_MODIFIED = `async function fetchUser(id, options = {}) {
  const url = \`/api/user/\${id}\`;
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  const data = await res.json();
  return data;
}

const MAX_RETRIES = 5;
const DEFAULT_TIMEOUT = 3000;`;

// Ã¢â€â‚¬Ã¢â€â‚¬ Visual constants Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const ROW_BG = {
  added:     'var(--diff-added-bg)',
  removed:   'var(--diff-removed-bg)',
  empty:     'var(--diff-empty-bg)',
  unchanged: 'transparent',
} as const;

const CHAR_HL = {
  added:   'var(--diff-added-hl)',
  removed: 'var(--diff-removed-hl)',
} as const;

const GUTTER_CLS = {
  '+': 'text-emerald-400',
  '-': 'text-red-400',
  ' ': 'text-neutral-700',
  '':  'text-neutral-700',
} as const;

const TEXT_DIM  = 'text-neutral-400';
const TEXT_FULL = 'text-neutral-100';
const ROW_H     = 22; // px - every row is exactly this height
const ROW_H_CLS = 'h-[22px]';
const LEAD_CLS  = 'leading-[22px]';

// Ã¢â€â‚¬Ã¢â€â‚¬ Types Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
interface SplitRow {
  origLineNo: number | null;
  origGutter: '+' | '-' | ' ' | '';
  origText:   string;
  origType:   'removed' | 'unchanged' | 'empty';
  origSpans?: CharSpan[];
  modLineNo:  number | null;
  modGutter:  '+' | '-' | ' ' | '';
  modText:    string;
  modType:    'added' | 'unchanged' | 'empty';
  modSpans?:  CharSpan[];
}

interface HunkIndex { rowIdx: number }

interface SearchMatch {
  rowIdx: number;
  side: 'orig' | 'mod';
  startChar: number;
  endChar: number;
}

interface ScrollAnchor {
  origPx: number;
  modPx: number;
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Span renderer Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function renderSpans(spans: CharSpan[], side: 'added' | 'removed'): React.ReactNode {
  const color = CHAR_HL[side];
  return spans.map((span, i) =>
    span.changed
      ? <span key={i} style={{ backgroundColor: color, borderRadius: 2, padding: '0 1px' }}>{span.text}</span>
      : <React.Fragment key={i}>{span.text}</React.Fragment>
  );
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Hunk helpers Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function findHunkStarts(splitRows: SplitRow[]): HunkIndex[] {
  const hunks: HunkIndex[] = [];
  let inHunk = false;
  for (let i = 0; i < splitRows.length; i++) {
    const changed = splitRows[i].origType !== 'unchanged' || splitRows[i].modType !== 'unchanged';
    if (changed && !inHunk) { hunks.push({ rowIdx: i }); inHunk = true; }
    else if (!changed) inHunk = false;
  }
  return hunks;
}

function findInlineHunkStarts(lines: DiffLine[]): HunkIndex[] {
  const hunks: HunkIndex[] = [];
  let inHunk = false;
  for (let i = 0; i < lines.length; i++) {
    const changed = lines[i].type !== 'unchanged';
    if (changed && !inHunk) { hunks.push({ rowIdx: i }); inHunk = true; }
    else if (!changed) inHunk = false;
  }
  return hunks;
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Split row builder Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function buildSplitRows(diffLines: DiffLine[]): SplitRow[] {
  const rows: SplitRow[] = [];
  let i = 0;
  while (i < diffLines.length) {
    const line = diffLines[i];
    if (line.type === 'unchanged') {
      rows.push({
        origLineNo: line.origLineNo, origGutter: ' ', origText: line.text, origType: 'unchanged',
        modLineNo:  line.modLineNo,  modGutter:  ' ', modText:  line.text, modType:  'unchanged',
      });
      i++;
    } else {
      const removed: DiffLine[] = [];
      const added:   DiffLine[] = [];
      while (i < diffLines.length && diffLines[i].type !== 'unchanged') {
        if (diffLines[i].type === 'removed') removed.push(diffLines[i]);
        else added.push(diffLines[i]);
        i++;
      }
      const len = Math.max(removed.length, added.length);
      for (let h = 0; h < len; h++) {
        const rem = removed[h];
        const add = added[h];
        rows.push({
          origLineNo: rem ? rem.origLineNo : null,
          origGutter: rem ? '-' : '',
          origText:   rem ? rem.text : '',
          origType:   rem ? 'removed' : 'empty',
          origSpans:  rem?.origCharSpans,
          modLineNo:  add ? add.modLineNo : null,
          modGutter:  add ? '+' : '',
          modText:    add ? add.text : '',
          modType:    add ? 'added' : 'empty',
          modSpans:   add?.modCharSpans,
        });
      }
    }
  }
  return rows;
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Build scroll anchors from split rows Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function buildScrollAnchors(splitRows: SplitRow[]): ScrollAnchor[] {
  const anchors: ScrollAnchor[] = [];
  for (let i = 0; i < splitRows.length; i++) {
    const row = splitRows[i];
    // Use unchanged rows as anchors -  both sides have content at the same row
    if (row.origType === 'unchanged' && row.modType === 'unchanged') {
      anchors.push({ origPx: i * ROW_H, modPx: i * ROW_H });
    }
  }
  // Always add start and end anchors
  if (anchors.length === 0 || anchors[0].origPx !== 0) {
    anchors.unshift({ origPx: 0, modPx: 0 });
  }
  const totalPx = splitRows.length * ROW_H;
  if (anchors[anchors.length - 1].origPx < totalPx) {
    anchors.push({ origPx: totalPx, modPx: totalPx });
  }
  return anchors;
}

function interpolateScroll(anchors: ScrollAnchor[], srcPx: number, fromSide: 'orig' | 'mod'): number {
  if (anchors.length === 0) return srcPx;
  // Find surrounding anchors
  let lo = anchors[0];
  let hi = anchors[anchors.length - 1];
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];
    const aSrc = fromSide === 'orig' ? a.origPx : a.modPx;
    const bSrc = fromSide === 'orig' ? b.origPx : b.modPx;
    if (srcPx >= aSrc && srcPx <= bSrc) { lo = a; hi = b; break; }
  }
  const loSrc = fromSide === 'orig' ? lo.origPx : lo.modPx;
  const hiSrc = fromSide === 'orig' ? hi.origPx : hi.modPx;
  const loDst = fromSide === 'orig' ? lo.modPx : lo.origPx;
  const hiDst = fromSide === 'orig' ? hi.modPx : hi.origPx;
  if (hiSrc === loSrc) return loDst;
  const t = (srcPx - loSrc) / (hiSrc - loSrc);
  return loDst + t * (hiDst - loDst);
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Content cell Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function ContentCell({ text, type, spans, searchHighlights }: {
  text:  string;
  type:  'removed' | 'added' | 'unchanged' | 'empty';
  spans: CharSpan[] | undefined;
  searchHighlights?: { startChar: number; endChar: number; isCurrent: boolean }[];
}) {
  const bg      = ROW_BG[type] ?? 'transparent';
  const textCls = type === 'unchanged' ? TEXT_DIM : TEXT_FULL;

  const inner = (() => {
    if (type === 'empty') return <>&zwj;</>;

    // If we have search highlights, render with them (overrides char spans for simplicity)
    if (searchHighlights && searchHighlights.length > 0) {
      const parts: React.ReactNode[] = [];
      let cursor = 0;
      // Sort highlights by startChar
      const sorted = [...searchHighlights].sort((a, b) => a.startChar - b.startChar);
      for (const hl of sorted) {
        if (hl.startChar > cursor) parts.push(<React.Fragment key={cursor}>{text.slice(cursor, hl.startChar)}</React.Fragment>);
        parts.push(
          <span key={hl.startChar} style={{ backgroundColor: hl.isCurrent ? 'var(--diff-search-cur)' : 'var(--diff-search-bg)', borderRadius: 2, padding: '0 1px' }}>
            {text.slice(hl.startChar, hl.endChar)}
          </span>
        );
        cursor = hl.endChar;
      }
      if (cursor < text.length) parts.push(<React.Fragment key={cursor}>{text.slice(cursor)}</React.Fragment>);
      return <>{parts}</>;
    }

    if (spans && spans.length > 0) return renderSpans(spans, type as 'added' | 'removed');
    return <>{text || <>&zwj;</>}</>;
  })();

  return (
    <td style={{ backgroundColor: bg }} className={`align-top max-w-0 ${ROW_H_CLS}`}>
      <div className="overflow-x-auto h-full">
        <pre
          className={`font-mono text-xs ${LEAD_CLS} ${textCls} whitespace-pre px-2`}
          style={{ display: 'inline-block', minWidth: '100%', margin: 0 }}
        >
          {inner}
        </pre>
      </div>
    </td>
  );
}

// Ã¢â€â‚¬Ã¢â€â‚¬ No-diff state Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const NoDiffState: React.FC = () => (
  <div className="flex flex-col items-center gap-2 py-10 px-6 text-center">
    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
      <Check className="w-4 h-4 text-emerald-400" />
    </div>
    <p className="font-mono text-sm font-semibold text-neutral-300">Files are identical</p>
    <p className="font-mono text-xs text-neutral-600">No differences found.</p>
  </div>
);

// Ã¢â€â‚¬Ã¢â€â‚¬ Hunk nav Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const HunkNav: React.FC<{
  total: number; current: number; onPrev: () => void; onNext: () => void;
}> = ({ total, current, onPrev, onNext }) => {
  if (total === 0) return null;
  return (
    <div className="flex items-center gap-1 font-mono text-[11px] text-neutral-400 select-none">
      <button onClick={onPrev} disabled={current <= 1}
        className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        title="Previous change"><ChevronUp className="w-3.5 h-3.5" /></button>
      <span className="px-1.5 tabular-nums">{current} / {total}</span>
      <button onClick={onNext} disabled={current >= total}
        className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        title="Next change"><ChevronDown className="w-3.5 h-3.5" /></button>
    </div>
  );
};

// Ã¢â€â‚¬Ã¢â€â‚¬ Resize handle Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const ResizeHandle: React.FC<{ onPointerDown: (e: React.PointerEvent) => void }> = ({ onPointerDown }) => (
  <div
    onPointerDown={onPointerDown}
    className="h-3 flex items-center justify-center bg-neutral-900 border-t border-neutral-800 cursor-row-resize select-none group shrink-0"
    title="Drag to resize"
    aria-label="Drag to resize diff area"
  >
    <div className="flex items-center gap-0.5 opacity-40 group-hover:opacity-80 transition-opacity">
      {[0,1,2,3,4].map(k => <div key={k} className="w-1 h-1 rounded-full bg-neutral-500" />)}
    </div>
  </div>
);

// Ã¢â€â‚¬Ã¢â€â‚¬ Panel header (shared by InputPanels and SplitView) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const PanelHeader: React.FC<{
  label: string;
  fileRef: React.RefObject<HTMLInputElement | null>;
  panel: 'orig' | 'mod';
  fileError: string | null;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, panel: 'orig' | 'mod') => void;
  extraCls?: string;
}> = ({ label, fileRef, panel, fileError, handleFileUpload, extraCls = '' }) => (
  <div className={`flex items-center justify-between px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 text-xs font-mono shrink-0 ${extraCls}`}>
    <span className="font-semibold text-neutral-300">{label}</span>
    <div className="flex items-center gap-2">
      {fileError && <span className="text-red-400 text-[11px] truncate max-w-[150px]">{fileError}</span>}
      <button onClick={() => fileRef.current?.click()}
        className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer">
        <Upload className="w-3 h-3" /><span>Upload</span>
      </button>
      <input ref={fileRef} type="file" className="hidden" onChange={(e) => handleFileUpload(e, panel)} />
    </div>
  </div>
);

// Ã¢â€â‚¬Ã¢â€â‚¬ Input panels Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const InputPanels: React.FC<{
  original: string; modified: string;
  setOriginal: (v: string) => void; setModified: (v: string) => void;
  origFileError: string | null; modFileError: string | null;
  origFileRef: React.RefObject<HTMLInputElement | null>;
  modFileRef:  React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, panel: 'orig' | 'mod') => void;
  viewportH:    number;
  isFullScreen: boolean;
}> = ({ original, modified, setOriginal, setModified,
        origFileError, modFileError, origFileRef, modFileRef,
        handleFileUpload, viewportH, isFullScreen }) => {

  const h = isFullScreen ? 'calc(100vh - 7rem)' : `${viewportH}px`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800">
      <div className="flex flex-col">
        <PanelHeader label="Original" fileRef={origFileRef} panel="orig" fileError={origFileError} handleFileUpload={handleFileUpload} />
        <textarea value={original} onChange={(e) => setOriginal(e.target.value)}
          placeholder="Paste original text or code hereÃ¢â‚¬Â¦"
          spellCheck={false}
          style={{ height: h, resize: 'none' }}
          className="p-3 font-mono text-xs bg-[#111] text-neutral-200 border-none focus:outline-none leading-[22px] placeholder-neutral-700"
        />
      </div>
      <div className="flex flex-col">
        <PanelHeader label="Modified" fileRef={modFileRef} panel="mod" fileError={modFileError} handleFileUpload={handleFileUpload} />
        <textarea value={modified} onChange={(e) => setModified(e.target.value)}
          placeholder="Paste modified text or code hereÃ¢â‚¬Â¦"
          spellCheck={false}
          style={{ height: h, resize: 'none' }}
          className="p-3 font-mono text-xs bg-[#111] text-neutral-200 border-none focus:outline-none leading-[22px] placeholder-neutral-700"
        />
      </div>
    </div>
  );
};

// Ã¢â€â‚¬Ã¢â€â‚¬ Inline View Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const InlineView: React.FC<{
  diffResult:   DiffResult;
  scrollRef:    React.RefObject<HTMLDivElement | null>;
  rowRefs:      React.MutableRefObject<(HTMLTableRowElement | null)[]>;
  viewportH:    number;
  isFullScreen: boolean;
  searchMatches: SearchMatch[];
  searchIdx: number;
}> = ({ diffResult, scrollRef, rowRefs, viewportH, isFullScreen, searchMatches, searchIdx }) => {
  const lines   = diffResult.lines;
  const scrollH = isFullScreen ? 'calc(100vh - 7rem)' : `${viewportH}px`;

  if (lines.length === 0) return <NoDiffState />;

  return (
    <div ref={scrollRef} className="overflow-auto overscroll-none" style={{ height: scrollH }}>
      <table className="border-collapse" style={{ width: '100%', minWidth: '100%', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: 44 }} />
          <col style={{ width: 20 }} />
          <col />
        </colgroup>
        <tbody>
          {lines.map((line, idx) => {
            const bg       = ROW_BG[line.type];
            const gutSym   = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';
            const gutCls   = GUTTER_CLS[gutSym];
            const lineNo   = line.type === 'removed' ? line.origLineNo : line.modLineNo;
            const spans    = line.type === 'removed' ? line.origCharSpans : line.modCharSpans;
            const textCls  = line.type === 'unchanged' ? TEXT_DIM : TEXT_FULL;
            // Search highlights for inline
            const side: 'orig' | 'mod' = line.type === 'removed' ? 'orig' : 'mod';
            const highlights = searchMatches
              .filter(m => m.rowIdx === idx && m.side === side)
              .map((m) => ({ startChar: m.startChar, endChar: m.endChar, isCurrent: searchMatches.indexOf(m) === searchIdx }));
            return (
              <tr key={idx} ref={(el) => { rowRefs.current[idx] = el; }} style={{ height: ROW_H }}>
                <td style={{ backgroundColor: bg, whiteSpace: 'nowrap' }}
                  className={`text-right pr-1.5 pl-1 text-neutral-600 font-mono text-[11px] select-none align-top border-r border-neutral-800/50 ${ROW_H_CLS} ${LEAD_CLS}`}>
                  {lineNo ?? ''}
                </td>
                <td style={{ backgroundColor: bg, whiteSpace: 'nowrap' }}
                  className={`text-center font-mono text-xs font-bold select-none align-top ${ROW_H_CLS} ${LEAD_CLS} ${gutCls}`}>
                  {gutSym}
                </td>
                <td style={{ backgroundColor: bg }} className={`align-top max-w-0 ${ROW_H_CLS}`}>
                  <div className="overflow-x-auto h-full">
                    <pre className={`font-mono text-xs ${LEAD_CLS} ${textCls} whitespace-pre px-2`}
                      style={{ display: 'inline-block', minWidth: '100%', margin: 0 }}>
                      {highlights.length > 0
                        ? (() => {
                            const parts: React.ReactNode[] = [];
                            let cursor = 0;
                            const sorted = [...highlights].sort((a, b) => a.startChar - b.startChar);
                            for (const hl of sorted) {
                              if (hl.startChar > cursor) parts.push(<React.Fragment key={cursor}>{line.text.slice(cursor, hl.startChar)}</React.Fragment>);
                              parts.push(<span key={hl.startChar} style={{ backgroundColor: hl.isCurrent ? 'var(--diff-search-cur)' : 'var(--diff-search-bg)', borderRadius: 2, padding: '0 1px' }}>{line.text.slice(hl.startChar, hl.endChar)}</span>);
                              cursor = hl.endChar;
                            }
                            if (cursor < line.text.length) parts.push(<React.Fragment key={cursor}>{line.text.slice(cursor)}</React.Fragment>);
                            return <>{parts}</>;
                          })()
                        : spans && spans.length > 0
                        ? renderSpans(spans, line.type as 'added' | 'removed')
                        : (line.text || <>&zwj;</>)}
                    </pre>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Ã¢â€â‚¬Ã¢â€â‚¬ Split View (two independent scroll panels with sync scroll) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
interface SplitViewProps {
  splitRows:       SplitRow[];
  origScrollRef:   React.RefObject<HTMLDivElement | null>;
  modScrollRef:    React.RefObject<HTMLDivElement | null>;
  origRowRefs:     React.MutableRefObject<(HTMLTableRowElement | null)[]>;
  modRowRefs:      React.MutableRefObject<(HTMLTableRowElement | null)[]>;
  handleOrigScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  handleModScroll:  (e: React.UIEvent<HTMLDivElement>) => void;
  viewportH:       number;
  isFullScreen:    boolean;
  origFileError:   string | null;
  modFileError:    string | null;
  origFileRef:     React.RefObject<HTMLInputElement | null>;
  modFileRef:      React.RefObject<HTMLInputElement | null>;
  handleFileUpload:(e: React.ChangeEvent<HTMLInputElement>, panel: 'orig' | 'mod') => void;
  onApplyChange:   (rowIdx: number, direction: 'toOrig' | 'toMod') => void;
  searchMatches:   SearchMatch[];
  searchIdx:       number;
}

const SplitView: React.FC<SplitViewProps> = ({
  splitRows, origScrollRef, modScrollRef, origRowRefs, modRowRefs,
  handleOrigScroll, handleModScroll, viewportH, isFullScreen,
  origFileError, modFileError, origFileRef, modFileRef, handleFileUpload,
  onApplyChange, searchMatches, searchIdx,
}) => {
  const scrollH = isFullScreen ? 'calc(100vh - 7rem)' : `${viewportH}px`;

  if (splitRows.length === 0) {
    return (
      <div className="grid grid-cols-2 divide-x divide-neutral-800" style={{ height: isFullScreen ? 'calc(100vh - 7rem)' : `${viewportH}px` }}>
        <div className="col-span-2"><NoDiffState /></div>
      </div>
    );
  }

  const renderTable = (side: 'orig' | 'mod', scrollRef: React.RefObject<HTMLDivElement | null>, rowRefs: React.MutableRefObject<(HTMLTableRowElement | null)[]>, onScroll: (e: React.UIEvent<HTMLDivElement>) => void) => {
    return (
      <div ref={scrollRef} className="overflow-auto flex-1 overscroll-none" onScroll={onScroll} style={{ height: scrollH }}>
        <table className="border-collapse" style={{ width: '100%', minWidth: '100%', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 44 }} />
            <col style={{ width: 28 }} />
            <col />
          </colgroup>
          <tbody>
            {splitRows.map((row, idx) => {
              const isOrig = side === 'orig';
              const type   = isOrig ? row.origType : row.modType;
              const lineNo = isOrig ? row.origLineNo : row.modLineNo;
              const gutter = isOrig ? row.origGutter : row.modGutter;
              const text   = isOrig ? row.origText : row.modText;
              const spans  = isOrig ? row.origSpans : row.modSpans;
              const bg     = ROW_BG[type] ?? 'transparent';
              const gutCls = GUTTER_CLS[gutter] ?? 'text-neutral-700';
              // Search highlights
              const hlSide: 'orig' | 'mod' = isOrig ? 'orig' : 'mod';
              const highlights = searchMatches
                .filter(m => m.rowIdx === idx && m.side === hlSide)
                .map(m => ({ startChar: m.startChar, endChar: m.endChar, isCurrent: searchMatches.indexOf(m) === searchIdx }));
              // Change transfer button logic
              const showToMod  = isOrig && row.origType === 'removed' && row.modType === 'empty';
              const showToOrig = !isOrig && row.modType === 'added' && row.origType === 'empty';
              const showBoth   = isOrig ? (row.origType === 'removed' && row.modType === 'added') : (row.modType === 'added' && row.origType === 'removed');

              return (
                <tr key={idx} ref={(el) => { rowRefs.current[idx] = el; }} style={{ height: ROW_H }} className="group/row">
                  {/* Line number */}
                  <td style={{ backgroundColor: bg, whiteSpace: 'nowrap' }}
                    className={`text-right pr-1.5 pl-1 text-neutral-600 font-mono text-[11px] select-none align-top border-r border-neutral-800/50 ${ROW_H_CLS} ${LEAD_CLS}`}>
                    {lineNo ?? ''}
                  </td>
                  {/* Gutter with action buttons */}
                  <td style={{ backgroundColor: bg, whiteSpace: 'nowrap', position: 'relative' }}
                    className={`text-center font-mono text-xs font-bold select-none align-top ${ROW_H_CLS} ${LEAD_CLS} ${gutCls}`}>
                    <span className="group-hover/row:opacity-0 transition-opacity">{gutter}</span>
                    {/* Action buttons -  visible on hover */}
                    <div className="absolute inset-0 flex items-center justify-center gap-px opacity-0 group-hover/row:opacity-100 transition-opacity">
                      {(showToMod || showBoth) && isOrig && (
                        <button
                          onClick={() => onApplyChange(idx, 'toMod')}
                          title="Apply to Modified"
                          style={{ width: 14, height: 14, fontSize: 9 }}
                          className="rounded bg-neutral-700 hover:bg-emerald-800 text-neutral-200 flex items-center justify-center cursor-pointer shrink-0"
                        >Ã¢â€ â€™</button>
                      )}
                      {(showToOrig || showBoth) && !isOrig && (
                        <button
                          onClick={() => onApplyChange(idx, 'toOrig')}
                          title="Apply to Original"
                          style={{ width: 14, height: 14, fontSize: 9 }}
                          className="rounded bg-neutral-700 hover:bg-red-900 text-neutral-200 flex items-center justify-center cursor-pointer shrink-0"
                        >Ã¢â€ Â</button>
                      )}
                    </div>
                  </td>
                  {/* Content */}
                  <ContentCell text={text} type={type} spans={spans} searchHighlights={highlights.length > 0 ? highlights : undefined} />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 divide-x divide-neutral-800" style={{ height: isFullScreen ? 'auto' : undefined }}>
      <div className="flex flex-col">
        <PanelHeader label="Original" fileRef={origFileRef} panel="orig" fileError={origFileError} handleFileUpload={handleFileUpload} />
        {renderTable('orig', origScrollRef, origRowRefs, handleOrigScroll)}
      </div>
      <div className="flex flex-col">
        <PanelHeader label="Modified" fileRef={modFileRef} panel="mod" fileError={modFileError} handleFileUpload={handleFileUpload} />
        {renderTable('mod', modScrollRef, modRowRefs, handleModScroll)}
      </div>
    </div>
  );
};

// Ã¢â€â‚¬Ã¢â€â‚¬ Main component Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
export const DiffCheckerTool: React.FC = () => {
  const { isDark } = useTheme();
  const [original, setOriginalState]      = useState('');
  const [modified, setModifiedState]      = useState('');
  const [diffResult, setDiffResult]       = useState<SmartDiffResult | null>(null);
  const [viewMode, setViewMode]           = useState<ViewMode>('split');
  const [mode, setMode]                   = useState<'input' | 'diff'>('input');
  const [compareMode, setCompareMode]     = useState<CompareMode>('smart');
  const [copied, setCopied]               = useState(false);
  const [copyError, setCopyError]         = useState(false);
  const [isFullScreen, setIsFullScreen]   = useState(false);
  const [origFileError, setOrigFileError] = useState<string | null>(null);
  const [modFileError,  setModFileError]  = useState<string | null>(null);
  const [activeHunk, setActiveHunk]       = useState(0);
  const [origExt, setOrigExt]             = useState<string | undefined>(undefined);
  const [modExt,  setModExt]              = useState<string | undefined>(undefined);

  // Ã¢â€â‚¬Ã¢â€â‚¬ Undo / Redo Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const [undoStack, setUndoStack] = useState<Array<{ original: string; modified: string }>>([]);
  const [redoStack, setRedoStack] = useState<Array<{ original: string; modified: string }>>([]);

  const pushUndo = useCallback((orig: string, mod: string) => {
    setUndoStack(s => [...s, { original: orig, modified: mod }]);
    setRedoStack([]);
  }, []);

  const setOriginal = useCallback((v: string) => setOriginalState(v), []);
  const setModified = useCallback((v: string) => setModifiedState(v), []);

  const handleUndo = useCallback(() => {
    setUndoStack(stack => {
      if (stack.length === 0) return stack;
      const prev = stack[stack.length - 1];
      const rest = stack.slice(0, -1);
      setRedoStack(rs => [...rs, { original, modified }]);
      setOriginalState(prev.original);
      setModifiedState(prev.modified);
      return rest;
    });
  }, [original, modified]);

  const handleRedo = useCallback(() => {
    setRedoStack(stack => {
      if (stack.length === 0) return stack;
      const next = stack[stack.length - 1];
      const rest = stack.slice(0, -1);
      setUndoStack(us => [...us, { original, modified }]);
      setOriginalState(next.original);
      setModifiedState(next.modified);
      return rest;
    });
  }, [original, modified]);

  // Ã¢â€â‚¬Ã¢â€â‚¬ Search (useSearch hook) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const search = useSearch({ debounceMs: 200, captureCtrlF: false }); // Ctrl+F handled in our own keydown
  const [searchScope, setSearchScope] = useState<'both' | 'orig' | 'mod'>('both');
  const [searchMatches, setSearchMatches] = useState<SearchMatch[]>([]);

  // Ã¢â€â‚¬Ã¢â€â‚¬ Viewport height Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const [viewportH, setViewportH] = useState<number>(500);
  const didInitH = useRef(false);
  useEffect(() => {
    if (!didInitH.current) {
      setViewportH(Math.round(window.innerHeight * DEFAULT_H_VH));
      didInitH.current = true;
    }
  }, []);

  // Ã¢â€â‚¬Ã¢â€â‚¬ Refs Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const debounceRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Inline / single scroll ref
  const scrollRef     = useRef<HTMLDivElement | null>(null);
  // Split view independent scroll refs
  const origScrollRef = useRef<HTMLDivElement | null>(null);
  const modScrollRef  = useRef<HTMLDivElement | null>(null);
  // Sync mutex
  const syncingRef    = useRef(false);
  // Row refs for split view
  const origRowRefs   = useRef<(HTMLTableRowElement | null)[]>([]);
  const modRowRefs    = useRef<(HTMLTableRowElement | null)[]>([]);
  // Row refs for inline view
  const inlineRowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const origFileRef   = useRef<HTMLInputElement | null>(null);
  const modFileRef    = useRef<HTMLInputElement | null>(null);

  // Ã¢â€â‚¬Ã¢â€â‚¬ Split rows and scroll anchors Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const splitRows = useMemo(() => diffResult ? buildSplitRows(diffResult.lines) : [], [diffResult]);
  const scrollAnchors = useMemo(() => buildScrollAnchors(splitRows), [splitRows]);

  // Ã¢â€â‚¬Ã¢â€â‚¬ Sync scroll handlers Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const handleOrigScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (syncingRef.current) return;
    const src = e.currentTarget.scrollTop;
    const target = modScrollRef.current;
    if (!target) return;
    syncingRef.current = true;
    const dst = interpolateScroll(scrollAnchors, src, 'orig');
    requestAnimationFrame(() => {
      if (target) target.scrollTop = dst;
      syncingRef.current = false;
    });
  }, [scrollAnchors]);

  const handleModScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (syncingRef.current) return;
    const src = e.currentTarget.scrollTop;
    const target = origScrollRef.current;
    if (!target) return;
    syncingRef.current = true;
    const dst = interpolateScroll(scrollAnchors, src, 'mod');
    requestAnimationFrame(() => {
      if (target) target.scrollTop = dst;
      syncingRef.current = false;
    });
  }, [scrollAnchors]);

  // Ã¢â€â‚¬Ã¢â€â‚¬ Debounced diff Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDiffResult(smartDiff(original, modified, compareMode === 'text', origExt, modExt));
      setActiveHunk(0);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [original, modified, compareMode, origExt, modExt]);

  // Ã¢â€â‚¬Ã¢â€â‚¬ Search logic -  recompute matches when debouncedQuery / scope / diff changes Ã¢â€â‚¬Ã¢â€â‚¬
  // Use a ref to batch the state update outside the synchronous effect body.
  const searchMatchesRef = useRef<SearchMatch[]>([]);
  useEffect(() => {
    const matches: SearchMatch[] = [];
    if (search.debouncedQuery && diffResult) {
      const rows = buildSplitRows(diffResult.lines);
      const q = search.debouncedQuery.toLowerCase();
      rows.forEach((row, rowIdx) => {
        if (searchScope !== 'mod') {
          const t = row.origText.toLowerCase();
          let pos = 0;
          while ((pos = t.indexOf(q, pos)) !== -1) {
            matches.push({ rowIdx, side: 'orig', startChar: pos, endChar: pos + q.length });
            pos += q.length;
          }
        }
        if (searchScope !== 'orig') {
          const t = row.modText.toLowerCase();
          let pos = 0;
          while ((pos = t.indexOf(q, pos)) !== -1) {
            matches.push({ rowIdx, side: 'mod', startChar: pos, endChar: pos + q.length });
            pos += q.length;
          }
        }
      });
    }
    searchMatchesRef.current = matches;
    const id = setTimeout(() => setSearchMatches(matches), 0);
    return () => clearTimeout(id);
  }, [search.debouncedQuery, searchScope, diffResult]);

  // Scroll to current search match
  useEffect(() => {
    if (searchMatches.length === 0) return;
    const match = searchMatches[search.matchIdx];
    if (!match) return;
    const rowIdx = match.rowIdx;
    const scrollTo = (ref: React.RefObject<HTMLDivElement | null>, rowRef: HTMLTableRowElement | null) => {
      if (!ref.current || !rowRef) return;
      ref.current.scrollTo({ top: Math.max(0, rowRef.offsetTop - 60) });
    };
    if (viewMode === 'split') {
      if (match.side === 'orig') scrollTo(origScrollRef, origRowRefs.current[rowIdx] ?? null);
      else scrollTo(modScrollRef, modRowRefs.current[rowIdx] ?? null);
    } else {
      scrollTo(scrollRef, inlineRowRefs.current[rowIdx] ?? null);
    }
  }, [search.matchIdx, searchMatches, viewMode]);

  // Ã¢â€â‚¬Ã¢â€â‚¬ Keyboard shortcuts Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (search.isOpen) { search.close(); return; }
        setIsFullScreen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        search.open();
      }
      if (e.ctrlKey && !e.shiftKey && e.key === 'z') { e.preventDefault(); handleUndo(); }
      if ((e.ctrlKey && e.shiftKey && e.key === 'Z') || (e.ctrlKey && e.key === 'y')) { e.preventDefault(); handleRedo(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullScreen, search, handleUndo, handleRedo]);

  // Ã¢â€â‚¬Ã¢â€â‚¬ Fullscreen body scroll lock Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  useEffect(() => {
    const nav = document.querySelector('header') as HTMLElement | null;
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
      if (nav) nav.style.display = 'none';
    } else {
      document.body.style.overflow = '';
      if (nav) nav.style.display = '';
    }
    return () => {
      document.body.style.overflow = '';
      const n = document.querySelector('header') as HTMLElement | null;
      if (n) n.style.display = '';
    };
  }, [isFullScreen]);

  // Ã¢â€â‚¬Ã¢â€â‚¬ Resize drag Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const dragStartY  = useRef<number>(0);
  const dragStartH  = useRef<number>(0);
  const isDragging  = useRef(false);

  const handleResizePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    dragStartY.current = e.clientY;
    dragStartH.current = viewportH;
    isDragging.current = true;
    const onMove = (ev: PointerEvent) => {
      if (!isDragging.current) return;
      const delta = ev.clientY - dragStartY.current;
      const maxH  = Math.round(window.innerHeight * MAX_H_VH);
      setViewportH(Math.min(maxH, Math.max(MIN_H, dragStartH.current + delta)));
    };
    const onUp = () => {
      isDragging.current = false;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup',   onUp);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup',   onUp);
  }, [viewportH]);

  // Ã¢â€â‚¬Ã¢â€â‚¬ Hunk navigation Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const inlineLines = diffResult ? diffResult.lines : [];
  const hunks = viewMode === 'split'
    ? findHunkStarts(splitRows)
    : findInlineHunkStarts(inlineLines);

  const scrollToHunk = useCallback((idx: number) => {
    if (idx < 0 || idx >= hunks.length) return;
    const rowIdx = hunks[idx].rowIdx;
    const targetPx = rowIdx * ROW_H;
    const offset = 60;
    if (viewMode === 'split') {
      // Scroll both panels
      if (origScrollRef.current) origScrollRef.current.scrollTo({ top: Math.max(0, targetPx - offset) });
      if (modScrollRef.current)  modScrollRef.current.scrollTo({ top: Math.max(0, targetPx - offset) });
    } else {
      if (scrollRef.current) {
        const rowEl = inlineRowRefs.current[rowIdx];
        if (rowEl) scrollRef.current.scrollTo({ top: Math.max(0, rowEl.offsetTop - offset), behavior: 'smooth' });
      }
    }
  }, [hunks, viewMode]);

  const handlePrevHunk = () => { const n = Math.max(0, activeHunk - 1); setActiveHunk(n); scrollToHunk(n); };
  const handleNextHunk = () => { const n = Math.min(hunks.length - 1, activeHunk + 1); setActiveHunk(n); scrollToHunk(n); };

  // Ã¢â€â‚¬Ã¢â€â‚¬ File upload Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, panel: 'orig' | 'mod') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.includes('.') ? file.name.split('.').pop() : undefined;
    const reader = new FileReader();
    reader.onload  = (ev) => {
      const content = ev.target?.result as string;
      if (panel === 'orig') { setOriginalState(content); setOrigFileError(null); setOrigExt(ext); }
      else                  { setModifiedState(content); setModFileError(null); setModExt(ext); }
    };
    reader.onerror = () => {
      const msg = 'Cannot read file - binary files are not supported.';
      if (panel === 'orig') setOrigFileError(msg); else setModFileError(msg);
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  // Ã¢â€â‚¬Ã¢â€â‚¬ Toolbar actions Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const handleSwap = () => {
    pushUndo(original, modified);
    setOriginalState(modified); setModifiedState(original);
    setOrigFileError(null); setModFileError(null);
    setOrigExt(modExt); setModExt(origExt);
  };
  const handleLoadSample = () => {
    pushUndo(original, modified);
    setOriginalState(SAMPLE_ORIGINAL); setModifiedState(SAMPLE_MODIFIED);
    setOrigFileError(null); setModFileError(null);
    setOrigExt(undefined); setModExt(undefined);
    setMode('diff');
  };
  const handleClear = () => {
    pushUndo(original, modified);
    setOriginalState(''); setModifiedState('');
    setDiffResult(null); setActiveHunk(0);
    setOrigFileError(null); setModFileError(null);
    setOrigExt(undefined); setModExt(undefined);
    setMode('input');
  };
  const handleCompare = () => {
    setDiffResult(smartDiff(original, modified, compareMode === 'text', origExt, modExt));
    setActiveHunk(0);
    setMode('diff');
  };
  const handleCopyDiff = async () => {
    if (!diffResult) return;
    const text = toUnifiedDiff(original, modified, diffResult);
    try   { await navigator.clipboard.writeText(text || '(no differences)'); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { setCopyError(true); setTimeout(() => setCopyError(false), 2000); }
  };

  // Ã¢â€â‚¬Ã¢â€â‚¬ Change transfer Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const handleApplyChange = useCallback((rowIdx: number, direction: 'toOrig' | 'toMod') => {
    if (!diffResult) return;
    const row = splitRows[rowIdx];
    if (!row) return;

    pushUndo(original, modified);

    const isJson = diffResult.detection.type === 'json';

    if (direction === 'toMod') {
      // Apply orig line to modified
      const origLines = original.split('\n');
      const modLines  = modified.split('\n');
      const origLineNo = row.origLineNo;
      const modLineNo  = row.modLineNo;

      if (isJson) {
        // For JSON: re-parse and use structural merge (simplified: text approach on formatted)
        try {
          const origParsed = JSON.parse(original.trim());
          const modParsed  = JSON.parse(modified.trim());
          // Apply the change by setting the path value from orig into mod
          // For simplicity, reconstruct modified text by replacing its line
          if (modLineNo !== null && origLineNo !== null) {
            modLines[modLineNo - 1] = origLines[origLineNo - 1];
            setModifiedState(modLines.join('\n'));
          } else if (origLineNo !== null) {
            modLines.splice(modLineNo !== null ? modLineNo - 1 : modLines.length, 0, origLines[origLineNo - 1]);
            setModifiedState(modLines.join('\n'));
          }
          void origParsed; void modParsed;
        } catch {
          if (origLineNo !== null) {
            if (modLineNo !== null) modLines[modLineNo - 1] = origLines[origLineNo - 1];
            else modLines.splice(rowIdx, 0, origLines[origLineNo - 1]);
            setModifiedState(modLines.join('\n'));
          }
        }
      } else {
        if (origLineNo !== null) {
          if (modLineNo !== null) modLines[modLineNo - 1] = origLines[origLineNo - 1];
          else modLines.splice(rowIdx, 0, origLines[origLineNo - 1]);
          setModifiedState(modLines.join('\n'));
        }
      }
    } else {
      // Apply mod line to original
      const origLines = original.split('\n');
      const modLines  = modified.split('\n');
      const origLineNo = row.origLineNo;
      const modLineNo  = row.modLineNo;

      if (modLineNo !== null) {
        if (origLineNo !== null) origLines[origLineNo - 1] = modLines[modLineNo - 1];
        else origLines.splice(rowIdx, 0, modLines[modLineNo - 1]);
        setOriginalState(origLines.join('\n'));
      }
    }

    setActiveHunk(0);
  }, [diffResult, splitRows, original, modified, pushUndo]);

  useEffect(() => { origRowRefs.current = []; modRowRefs.current = []; inlineRowRefs.current = []; }, [diffResult, viewMode]);

  const isEmpty  = original === '' && modified === '';
  const hasDiff  = diffResult !== null;
  const noChange = hasDiff && diffResult.addedCount === 0 && diffResult.removedCount === 0 && !isEmpty;

  // Ã¢â€â‚¬Ã¢â€â‚¬ Render Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
  const borderClass = isDark ? 'border-neutral-700' : 'border-[#E4E4E7]';
  const inactiveBtnClass = isDark
    ? 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
    : 'bg-[#E4E4E7]/40 text-[#3F3F46] hover:bg-[#D4D4D8] hover:text-[#18181B]';

  return (
    <div className={`developer-tool-container bg-neutral-950 border border-neutral-800 text-neutral-100 flex flex-col ${
      isFullScreen ? 'fixed inset-0 z-[9999]' : 'w-full rounded-lg overflow-hidden shadow-xl'
    }`}>

      {/* Toolbar */}
      <Toolbar.Root isDark={isDark} isFullScreen={isFullScreen}>
        <Toolbar.Group>
          {/* Edit / Compare Mode Switcher */}
          <div className={`flex items-center rounded border ${borderClass} overflow-hidden shrink-0`}>
            <button
              onClick={() => setMode('input')}
              className={`px-3 py-1.5 transition-colors cursor-pointer ${mode === 'input' ? 'bg-[#1D9BF0] text-white font-semibold' : inactiveBtnClass}`}
            >
              Edit
            </button>
            <button
              onClick={handleCompare}
              className={`px-3 py-1.5 transition-colors cursor-pointer ${mode === 'diff' ? 'bg-[#1D9BF0] text-white font-semibold' : inactiveBtnClass}`}
            >
              Compare
            </button>
          </div>

          {/* Split / Inline View Switcher */}
          {mode === 'diff' && (
            <div className={`flex items-center rounded border ${borderClass} overflow-hidden shrink-0`}>
              <button
                onClick={() => { setViewMode('split'); setActiveHunk(0); }}
                className={`px-2.5 py-1.5 flex items-center gap-1 transition-colors cursor-pointer ${viewMode === 'split' ? 'bg-[#1D9BF0]/20 text-[#1D9BF0]' : inactiveBtnClass}`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Split</span>
              </button>
              <button
                onClick={() => { setViewMode('inline'); setActiveHunk(0); }}
                className={`px-2.5 py-1.5 flex items-center gap-1 transition-colors cursor-pointer ${viewMode === 'inline' ? 'bg-[#1D9BF0]/20 text-[#1D9BF0]' : inactiveBtnClass}`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Inline</span>
              </button>
            </div>
          )}

          {/* Smart / Text comparison toggle */}
          <div className={`flex items-center rounded border ${borderClass} overflow-hidden shrink-0`} title="Smart: auto-detects content type. Text: forces plain line diff.">
            <button
              onClick={() => setCompareMode('smart')}
              className={`px-2.5 py-1.5 transition-colors cursor-pointer text-xs ${
                compareMode === 'smart'
                  ? isDark
                    ? 'bg-neutral-700 text-neutral-100 font-semibold'
                    : 'bg-[#1D9BF0] text-white font-semibold'
                  : inactiveBtnClass
              }`}
            >
              Smart
            </button>
            <button
              onClick={() => setCompareMode('text')}
              className={`px-2.5 py-1.5 transition-colors cursor-pointer text-xs ${
                compareMode === 'text'
                  ? isDark
                    ? 'bg-neutral-700 text-neutral-100 font-semibold'
                    : 'bg-[#1D9BF0] text-white font-semibold'
                  : inactiveBtnClass
              }`}
            >
              Text
            </button>
          </div>

          <Toolbar.Button
            onClick={handleSwap}
            disabled={isEmpty}
            isDark={isDark}
            icon={ArrowLeftRight}
            label="Swap"
            className="hidden sm:flex"
          />

          <Toolbar.Button
            onClick={handleLoadSample}
            isDark={isDark}
            label="Sample"
            className="hidden sm:flex"
          />

          <Toolbar.Button
            onClick={handleClear}
            disabled={isEmpty}
            variant="danger"
            isDark={isDark}
            icon={Trash2}
            label="Clear"
          />

          {/* Undo / Redo */}
          {undoStack.length > 0 && (
            <Toolbar.Button
              onClick={handleUndo}
              title="Undo (Ctrl+Z)"
              isDark={isDark}
              icon={RotateCcw}
            />
          )}

          {redoStack.length > 0 && (
            <Toolbar.Button
              onClick={handleRedo}
              title="Redo (Ctrl+Shift+Z)"
              isDark={isDark}
              icon={RotateCw}
            />
          )}

          {/* Search Toggle */}
          {mode === 'diff' && (
            <Toolbar.Button
              onClick={search.toggle}
              active={search.isOpen}
              title="Search (Ctrl+F)"
              isDark={isDark}
              icon={Search}
            />
          )}
        </Toolbar.Group>

        <Toolbar.Group align="right">
          {mode === 'diff' && !noChange && hunks.length > 0 && (
            <HunkNav total={hunks.length} current={activeHunk + 1} onPrev={handlePrevHunk} onNext={handleNextHunk} />
          )}

          {hasDiff && !isEmpty && (
            <div className={`flex items-center gap-1 font-mono text-[11px] px-2 py-1.5 rounded select-none border ${
              isDark
                ? 'bg-neutral-800/60 border-neutral-700/50 text-neutral-300'
                : 'bg-neutral-200/50 border-neutral-300 text-neutral-700'
            }`}>
              {diffResult?.smartSummary ? (
                <span>{diffResult.smartSummary.text}</span>
              ) : (
                <>
                  <span className="text-emerald-400 font-semibold">+{diffResult.addedCount}</span>
                  <span className="text-neutral-600 mx-0.5">/</span>
                  <span className="text-red-400 font-semibold">-{diffResult.removedCount}</span>
                </>
              )}
              {noChange && <span className="text-neutral-500 ml-1.5">identical</span>}
            </div>
          )}

          <Toolbar.Button
            onClick={handleCopyDiff}
            disabled={!hasDiff || isEmpty}
            isDark={isDark}
            icon={copied ? Check : Copy}
            label={copied ? 'Copied!' : 'Copy Diff'}
          />

          <Toolbar.Button
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? 'Exit full screen' : 'Full screen'}
            isDark={isDark}
            icon={isFullScreen ? Minimize2 : Maximize2}
          />
        </Toolbar.Group>
      </Toolbar.Root>

      {/* Search bar */}
      {search.isOpen && mode === 'diff' && (
        <SearchBar
          query={search.query}
          onQueryChange={search.setQuery}
          totalMatches={searchMatches.length}
          matchIdx={search.matchIdx}
          onNext={() => search.next(searchMatches.length)}
          onPrev={() => search.prev(searchMatches.length)}
          onClose={search.close}
          inputRef={search.inputRef}
          scopeSelector={
            <div className="flex items-center rounded border border-neutral-700 overflow-hidden shrink-0">
              {(['both', 'orig', 'mod'] as const).map(scope => (
                <button key={scope} onClick={() => setSearchScope(scope)}
                  className={`px-2 py-1 transition-colors cursor-pointer capitalize text-xs ${searchScope === scope ? 'bg-neutral-700 text-neutral-100' : 'bg-neutral-900 text-neutral-500 hover:text-neutral-300'}`}>
                  {scope === 'both' ? 'Both' : scope === 'orig' ? 'Orig' : 'Mod'}
                </button>
              ))}
            </div>
          }
        />
      )}

      {/* Content */}
      {mode === 'input' ? (
        <InputPanels
          original={original} modified={modified}
          setOriginal={setOriginal} setModified={setModified}
          origFileError={origFileError} modFileError={modFileError}
          origFileRef={origFileRef} modFileRef={modFileRef}
          handleFileUpload={handleFileUpload}
          viewportH={viewportH} isFullScreen={isFullScreen}
        />
      ) : noChange ? (
        <div style={{ height: isFullScreen ? undefined : viewportH }}>
          <NoDiffState />
        </div>
      ) : isEmpty ? (
        <div className="flex items-center justify-center text-neutral-500 font-mono text-xs"
          style={{ height: isFullScreen ? undefined : viewportH }}>
          Paste content in both panels and click Compare.
        </div>
      ) : viewMode === 'split' ? (
        <SplitView
          splitRows={splitRows}
          origScrollRef={origScrollRef}
          modScrollRef={modScrollRef}
          origRowRefs={origRowRefs}
          modRowRefs={modRowRefs}
          handleOrigScroll={handleOrigScroll}
          handleModScroll={handleModScroll}
          viewportH={viewportH}
          isFullScreen={isFullScreen}
          origFileError={origFileError}
          modFileError={modFileError}
          origFileRef={origFileRef}
          modFileRef={modFileRef}
          handleFileUpload={handleFileUpload}
          onApplyChange={handleApplyChange}
          searchMatches={searchMatches}
          searchIdx={search.matchIdx}
        />
      ) : (
        <InlineView
          diffResult={diffResult!}
          scrollRef={scrollRef}
          rowRefs={inlineRowRefs}
          viewportH={viewportH}
          isFullScreen={isFullScreen}
          searchMatches={searchMatches}
          searchIdx={search.matchIdx}
        />
      )}

      {/* Resize handle */}
      {!isFullScreen && (
        <ResizeHandle onPointerDown={handleResizePointerDown} />
      )}

      {/* Footer */}
      <div className="px-4 py-2 bg-neutral-900/80 border-t border-neutral-800 flex items-center justify-between shrink-0">
        {diffResult?.detection && !isEmpty ? (
          <span className="text-neutral-600 text-[11px] font-mono flex items-center gap-1.5">
            <span className="text-neutral-500">
              {diffResult.detection.isMixed ? 'Mixed Content' : diffResult.detection.label}
            </span>
            <span className="text-neutral-700">Ã‚Â·</span>
            <span>{diffResult.detection.modeLabel}</span>
          </span>
        ) : <span />}
        <span className="text-neutral-500 text-[11px] font-mono flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-neutral-600" />
          Local browser processing Ã‚Â· No data sent to any server
        </span>
      </div>
    </div>
  );
};
