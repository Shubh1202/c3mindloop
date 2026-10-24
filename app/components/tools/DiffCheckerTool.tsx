'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Copy, Check, Trash2, Upload, Download, ArrowLeftRight,
  Info, AlertCircle, Maximize2, Minimize2, Columns2,
  AlignLeft, ChevronUp, ChevronDown, Search,
  RotateCcw, RotateCw, FileCode, SlidersHorizontal, WrapText,
} from 'lucide-react';
import { toUnifiedDiff, type DiffResult, type DiffLine, type CharSpan, type DiffOptions } from './diffEngine';
import { smartDiff, type SmartDiffResult } from './smartDiff';
import { detectSingle, TYPE_LABELS } from './diffDetector';
import { useSearch } from '../../hooks/useSearch';
import { SearchBar } from '../ui/SearchBar';
import { Toolbar } from '../ui/Toolbar';
import { useTheme } from '../../lib/theme';
import { useCollaborationRoom, useCollaborativeText } from '../../lib/collaboration';
import { CollabToolbarButton } from '../collaboration';

type ViewMode = 'split' | 'inline';
type CompareMode = 'smart' | 'text';
type Granularity = 'words' | 'chars' | 'lines';

// ── Resize constants ────────────────────────────────────────────────────────
const MIN_H = 300;
const MAX_H_VH = 0.88;
const DEFAULT_H_VH = 0.65;

// ── Sample Presets ──────────────────────────────────────────────────────────
const SAMPLES = {
  code: {
    label: 'Code (TypeScript)',
    original: `function fetchUser(id: string) {
  const url = '/api/user/' + id;
  return fetch(url)
    .then(res => res.json())
    .then(data => {
      console.log('user:', data);
      return data;
    });
}

const MAX_RETRIES = 3;`,
    modified: `async function fetchUser(id: string, options: RequestInit = {}) {
  const url = \`/api/user/\${id}\`;
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(\`HTTP error \${res.status}: Failed to fetch user records with id \${id}\`);
  }
  const data = await res.json();
  return data;
}

const MAX_RETRIES = 5;
const DEFAULT_TIMEOUT_MS = 3000;`,
  },
  json: {
    label: 'JSON Data',
    original: `{
  "name": "c3mindloop",
  "version": "1.0.0",
  "private": true,
  "description": "Developer utility suite for client-side local browser workflows",
  "engines": {
    "node": ">=18.0.0"
  },
  "features": [
    "json-formatter",
    "diff-checker"
  ]
}`,
    modified: `{
  "name": "c3mindloop",
  "version": "1.1.0",
  "private": true,
  "description": "Developer utility platform with integrated local browser engines",
  "engines": {
    "node": ">=20.0.0"
  },
  "features": [
    "json-formatter",
    "diff-checker",
    "jwt-inspector",
    "ats-resume"
  ]
}`,
  },
  csv: {
    label: 'CSV Data',
    original: `id,username,role,status,notes
1,alice,admin,active,Core maintainer of repositories
2,bob,developer,active,Frontend engineer working on diff tools
3,charlie,designer,pending,Awaiting onboarding verification`,
    modified: `id,username,role,status,notes
1,alice,superadmin,active,Core maintainer and security lead
2,bob,lead_developer,active,Frontend engineer working on diff tools and split viewers
3,charlie,designer,active,Onboarding complete
4,david,security_engineer,active,Infra security audits`,
  },
  text: {
    label: 'Plain Text',
    original: `The quick brown fox jumps over the lazy dog.
Antigravity IDE provides fast AI assisted tools for local development.
Client side computation ensures private data stays local without transmitting across any networks.`,
    modified: `The quick brown fox leaps over the sleeping dog with incredible agility.
Antigravity IDE provides high-speed AI assisted tools for modern web applications.
Client-side computation ensures all private developer data stays 100% local on user machines without transmitting across any networks.`,
  },
};

// ── Visual constants ────────────────────────────────────────────────────────
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

// ── Types ───────────────────────────────────────────────────────────────────
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

// ── Span renderer ───────────────────────────────────────────────────────────
function renderSpans(spans: CharSpan[], side: 'added' | 'removed'): React.ReactNode {
  const color = CHAR_HL[side];
  return spans.map((span, i) =>
    span.changed
      ? <span key={i} style={{ backgroundColor: color, borderRadius: 2, padding: '0 1px' }}>{span.text}</span>
      : <React.Fragment key={i}>{span.text}</React.Fragment>
  );
}

// ── Hunk helpers ────────────────────────────────────────────────────────────
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

// ── Split row builder ───────────────────────────────────────────────────────
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
          origSpans:  rem ? rem.origCharSpans : undefined,
          modLineNo:  add ? add.modLineNo : null,
          modGutter:  add ? '+' : '',
          modText:    add ? add.text : '',
          modType:    add ? 'added' : 'empty',
          modSpans:   add ? add.modCharSpans : undefined,
        });
      }
    }
  }
  return rows;
}

// ── Sub-components ──────────────────────────────────────────────────────────

const NoDiffState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[220px] text-center p-8">
    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
      <Check className="w-5 h-5 text-emerald-400" />
    </div>
    <p className="text-sm font-medium text-neutral-300">Files are identical</p>
    <p className="text-xs text-neutral-500 mt-1">No differences found between Original and Modified.</p>
  </div>
);

const PanelHeader: React.FC<{
  label:            string;
  fileRef:          React.RefObject<HTMLInputElement | null>;
  panel:            'orig' | 'mod';
  fileError:        string | null;
  detectedType?:    string;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, panel: 'orig' | 'mod') => void;
  onClear?:         () => void;
  onDownload?:      () => void;
}> = ({ label, fileRef, panel, fileError, detectedType, handleFileUpload, onClear, onDownload }) => (
  <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 shrink-0 select-none">
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-neutral-300 font-mono">{label}</span>
      {detectedType && (
        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 border border-neutral-700 text-neutral-300">
          {detectedType}
        </span>
      )}
      {fileError && (
        <span className="text-[11px] text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {fileError}
        </span>
      )}
    </div>
    <div className="flex items-center gap-1">
      <input
        ref={fileRef}
        type="file"
        accept=".txt,.js,.ts,.tsx,.jsx,.json,.css,.html,.md,.csv,.sql,.yaml,.yml,.py,.go,.rs,.c,.cpp,.h"
        onChange={(e) => handleFileUpload(e, panel)}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        title="Upload file"
        className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-200 px-2 py-0.5 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
      >
        <Upload className="w-3 h-3" />
        <span>Open</span>
      </button>
      {onDownload && (
        <button
          type="button"
          onClick={onDownload}
          title="Download content"
          className="text-neutral-400 hover:text-neutral-200 p-1 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Download className="w-3 h-3" />
        </button>
      )}
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          title="Clear panel"
          className="text-neutral-400 hover:text-red-400 p-1 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  </div>
);

const ContentCell: React.FC<{
  text:             string;
  type:             'added' | 'removed' | 'unchanged' | 'empty';
  spans?:           CharSpan[];
  searchHighlights?: Array<{ startChar: number; endChar: number; isCurrent: boolean }>;
  wrapLines?:       boolean;
}> = ({ text, type, spans, searchHighlights, wrapLines = true }) => {
  const textCls = type === 'unchanged' ? TEXT_DIM : TEXT_FULL;
  const bg      = ROW_BG[type] ?? 'transparent';

  return (
    <td
      style={{ backgroundColor: bg }}
      className="align-top px-2 py-0.5 max-w-0"
    >
      <div
        className={`font-mono text-xs leading-[20px] ${textCls} ${
          wrapLines
            ? 'whitespace-pre-wrap break-words [overflow-wrap:anywhere]'
            : 'whitespace-pre overflow-x-auto'
        }`}
      >
        {type === 'empty' ? (
          <>&zwj;</>
        ) : searchHighlights && searchHighlights.length > 0 ? (
          (() => {
            const parts: React.ReactNode[] = [];
            let cursor = 0;
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
          })()
        ) : spans && spans.length > 0 ? (
          renderSpans(spans, type as 'added' | 'removed')
        ) : (
          text || <>&zwj;</>
        )}
      </div>
    </td>
  );
};

const HunkNav: React.FC<{
  total:   number;
  current: number;
  onPrev:  () => void;
  onNext:  () => void;
}> = ({ total, current, onPrev, onNext }) => {
  if (total === 0) return null;
  return (
    <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-700 rounded px-1.5 py-1 shrink-0">
      <span className="text-[11px] font-mono text-neutral-400 select-none">
        {current} / {total} {total === 1 ? 'change' : 'changes'}
      </span>
      <button
        onClick={onPrev}
        disabled={current <= 1}
        title="Previous change"
        className="text-neutral-400 hover:text-neutral-100 disabled:opacity-30 p-0.5 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
      >
        <ChevronUp className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onNext}
        disabled={current >= total}
        title="Next change"
        className="text-neutral-400 hover:text-neutral-100 disabled:opacity-30 p-0.5 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

const ResizeHandle: React.FC<{ onPointerDown: (e: React.PointerEvent) => void }> = ({ onPointerDown }) => (
  <div
    onPointerDown={onPointerDown}
    className="h-2 bg-neutral-900 border-t border-neutral-800 cursor-ns-resize flex items-center justify-center group hover:bg-neutral-800 transition-colors select-none shrink-0"
  >
    <div className="w-12 h-1 bg-neutral-700 rounded group-hover:bg-neutral-500 transition-colors" />
  </div>
);

// ── Input Panels Mode ───────────────────────────────────────────────────────
const InputPanels: React.FC<{
  original:         string;
  modified:         string;
  setOriginal:      (v: string) => void;
  setModified:      (v: string) => void;
  origFileError:    string | null;
  modFileError:     string | null;
  origDetected?:    string;
  modDetected?:     string;
  origFileRef:      React.RefObject<HTMLInputElement | null>;
  modFileRef:       React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, panel: 'orig' | 'mod') => void;
  handleFileDrop:   (file: File, panel: 'orig' | 'mod') => void;
  viewportH:        number;
  isFullScreen:     boolean;
  wrapLines:        boolean;
  onClearOrig:      () => void;
  onClearMod:       () => void;
  onDownloadOrig:   () => void;
  onDownloadMod:    () => void;
}> = ({
  original, modified, setOriginal, setModified,
  origFileError, modFileError, origDetected, modDetected,
  origFileRef, modFileRef, handleFileUpload, handleFileDrop,
  viewportH, isFullScreen, wrapLines,
  onClearOrig, onClearMod, onDownloadOrig, onDownloadMod,
}) => {
  const h = isFullScreen ? 'calc(100vh - 7rem)' : `${viewportH}px`;
  const [dragOverOrig, setDragOverOrig] = useState(false);
  const [dragOverMod, setDragOverMod] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800">
      {/* Original Panel */}
      <div
        className={`flex flex-col relative transition-colors ${dragOverOrig ? 'bg-neutral-900/60 ring-2 ring-inset ring-neutral-600' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOverOrig(true); }}
        onDragLeave={() => setDragOverOrig(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOverOrig(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFileDrop(file, 'orig');
        }}
      >
        <PanelHeader
          label="Original"
          fileRef={origFileRef}
          panel="orig"
          fileError={origFileError}
          detectedType={origDetected}
          handleFileUpload={handleFileUpload}
          onClear={onClearOrig}
          onDownload={onDownloadOrig}
        />
        <textarea
          value={original}
          onChange={(e) => setOriginal(e.target.value)}
          placeholder="Paste original text or code here, or drop a file…"
          spellCheck={false}
          style={{ height: h, resize: 'none' }}
          className={`p-3 font-mono text-xs bg-[#111] text-neutral-200 border-none focus:outline-none leading-[20px] placeholder-neutral-700 ${
            wrapLines ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto'
          }`}
        />
      </div>

      {/* Modified Panel */}
      <div
        className={`flex flex-col relative transition-colors ${dragOverMod ? 'bg-neutral-900/60 ring-2 ring-inset ring-neutral-600' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOverMod(true); }}
        onDragLeave={() => setDragOverMod(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOverMod(false);
          const file = e.dataTransfer.files?.[0];
          if (file) handleFileDrop(file, 'mod');
        }}
      >
        <PanelHeader
          label="Modified"
          fileRef={modFileRef}
          panel="mod"
          fileError={modFileError}
          detectedType={modDetected}
          handleFileUpload={handleFileUpload}
          onClear={onClearMod}
          onDownload={onDownloadMod}
        />
        <textarea
          value={modified}
          onChange={(e) => setModified(e.target.value)}
          placeholder="Paste modified text or code here, or drop a file…"
          spellCheck={false}
          style={{ height: h, resize: 'none' }}
          className={`p-3 font-mono text-xs bg-[#111] text-neutral-200 border-none focus:outline-none leading-[20px] placeholder-neutral-700 ${
            wrapLines ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto'
          }`}
        />
      </div>
    </div>
  );
};

// ── Inline (Unified) View ───────────────────────────────────────────────────
const InlineView: React.FC<{
  diffResult:    DiffResult;
  scrollRef:     React.RefObject<HTMLDivElement | null>;
  rowRefs:       React.MutableRefObject<(HTMLTableRowElement | null)[]>;
  viewportH:     number;
  isFullScreen:  boolean;
  wrapLines:     boolean;
  searchMatches: SearchMatch[];
  searchIdx:     number;
}> = ({ diffResult, scrollRef, rowRefs, viewportH, isFullScreen, wrapLines, searchMatches, searchIdx }) => {
  const lines   = diffResult.lines;
  const scrollH = isFullScreen ? 'calc(100vh - 7rem)' : `${viewportH}px`;

  if (lines.length === 0) return <NoDiffState />;

  return (
    <div ref={scrollRef} className="overflow-auto overscroll-none w-full" style={{ height: scrollH }}>
      <table className="border-collapse w-full min-w-full" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: 44 }} />
          <col style={{ width: 24 }} />
          <col />
        </colgroup>
        <tbody>
          {lines.map((line, idx) => {
            const bg       = ROW_BG[line.type];
            const gutSym   = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';
            const gutCls   = GUTTER_CLS[gutSym];
            const lineNo   = line.type === 'removed' ? line.origLineNo : line.modLineNo;
            const spans    = line.type === 'removed' ? line.origCharSpans : line.modCharSpans;
            const side: 'orig' | 'mod' = line.type === 'removed' ? 'orig' : 'mod';
            const highlights = searchMatches
              .filter(m => m.rowIdx === idx && m.side === side)
              .map((m) => ({ startChar: m.startChar, endChar: m.endChar, isCurrent: searchMatches.indexOf(m) === searchIdx }));
            return (
              <tr key={idx} ref={(el) => { rowRefs.current[idx] = el; }}>
                <td
                  style={{ backgroundColor: bg, whiteSpace: 'nowrap' }}
                  className="text-right pr-1.5 pl-1 text-neutral-600 font-mono text-[11px] select-none align-top border-r border-neutral-800/50 py-0.5 leading-[20px]"
                >
                  {lineNo ?? ''}
                </td>
                <td
                  style={{ backgroundColor: bg, whiteSpace: 'nowrap' }}
                  className={`text-center font-mono text-xs font-bold select-none align-top py-0.5 leading-[20px] ${gutCls}`}
                >
                  {gutSym}
                </td>
                <ContentCell
                  text={line.text}
                  type={line.type}
                  spans={spans}
                  searchHighlights={highlights.length > 0 ? highlights : undefined}
                  wrapLines={wrapLines}
                />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ── Split (Side-by-Side) View ───────────────────────────────────────────────
interface SplitViewProps {
  splitRows:        SplitRow[];
  splitScrollRef:   React.RefObject<HTMLDivElement | null>;
  origRowRefs:      React.MutableRefObject<(HTMLTableRowElement | null)[]>;
  modRowRefs:       React.MutableRefObject<(HTMLTableRowElement | null)[]>;
  viewportH:        number;
  isFullScreen:     boolean;
  wrapLines:        boolean;
  origFileError:    string | null;
  modFileError:     string | null;
  origDetected?:    string;
  modDetected?:     string;
  origFileRef:      React.RefObject<HTMLInputElement | null>;
  modFileRef:       React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, panel: 'orig' | 'mod') => void;
  onApplyChange:    (rowIdx: number, direction: 'toOrig' | 'toMod') => void;
  searchMatches:    SearchMatch[];
  searchIdx:        number;
  onClearOrig?:     () => void;
  onClearMod?:      () => void;
  onDownloadOrig?:  () => void;
  onDownloadMod?:   () => void;
}

function SplitSideCells({ row, idx, side, onApplyChange, searchMatches, searchIdx, wrapLines }: {
  row: SplitRow; idx: number; side: 'orig' | 'mod';
  onApplyChange: (rowIdx: number, direction: 'toOrig' | 'toMod') => void;
  searchMatches: SearchMatch[]; searchIdx: number; wrapLines: boolean;
}) {
  const isOrig = side === 'orig';
  const type   = isOrig ? row.origType : row.modType;
  const lineNo = isOrig ? row.origLineNo : row.modLineNo;
  const gutter = isOrig ? row.origGutter : row.modGutter;
  const text   = isOrig ? row.origText : row.modText;
  const spans  = isOrig ? row.origSpans : row.modSpans;
  const bg     = ROW_BG[type] ?? 'transparent';
  const gutCls = GUTTER_CLS[gutter] ?? 'text-neutral-700';

  const hlSide: 'orig' | 'mod' = isOrig ? 'orig' : 'mod';
  const highlights = searchMatches
    .filter(m => m.rowIdx === idx && m.side === hlSide)
    .map(m => ({ startChar: m.startChar, endChar: m.endChar, isCurrent: searchMatches.indexOf(m) === searchIdx }));

  const showToMod  = isOrig && row.origType === 'removed' && row.modType === 'empty';
  const showToOrig = !isOrig && row.modType === 'added' && row.origType === 'empty';
  const showBoth   = isOrig ? (row.origType === 'removed' && row.modType === 'added') : (row.modType === 'added' && row.origType === 'removed');

  return (
    <>
      <td
        style={{ backgroundColor: bg, whiteSpace: 'nowrap' }}
        className="text-right pr-1.5 pl-1 text-neutral-600 font-mono text-[11px] select-none align-top border-r border-neutral-800/50 py-0.5 leading-[20px]"
      >
        {lineNo ?? ''}
      </td>
      <td
        style={{ backgroundColor: bg, whiteSpace: 'nowrap', position: 'relative' }}
        className={`text-center font-mono text-xs font-bold select-none align-top py-0.5 leading-[20px] ${gutCls}`}
      >
        <span className="group-hover/row:opacity-0 transition-opacity">{gutter}</span>
        <div className="absolute inset-0 flex items-center justify-center gap-px opacity-0 group-hover/row:opacity-100 transition-opacity">
          {(showToMod || showBoth) && isOrig && (
            <button
              onClick={() => onApplyChange(idx, 'toMod')}
              title="Apply change to Modified"
              style={{ width: 14, height: 14, fontSize: 9 }}
              className="rounded bg-neutral-700 hover:bg-emerald-800 text-neutral-200 flex items-center justify-center cursor-pointer shrink-0"
            >→</button>
          )}
          {(showToOrig || showBoth) && !isOrig && (
            <button
              onClick={() => onApplyChange(idx, 'toOrig')}
              title="Apply change to Original"
              style={{ width: 14, height: 14, fontSize: 9 }}
              className="rounded bg-neutral-700 hover:bg-red-900 text-neutral-200 flex items-center justify-center cursor-pointer shrink-0"
            >←</button>
          )}
        </div>
      </td>
      <ContentCell
        text={text}
        type={type}
        spans={spans}
        searchHighlights={highlights.length > 0 ? highlights : undefined}
        wrapLines={wrapLines}
      />
    </>
  );
}

const SplitView: React.FC<SplitViewProps> = ({
  splitRows, splitScrollRef, origRowRefs, modRowRefs,
  viewportH, isFullScreen, wrapLines,
  origFileError, modFileError, origDetected, modDetected,
  origFileRef, modFileRef, handleFileUpload,
  onApplyChange, searchMatches, searchIdx,
  onClearOrig, onClearMod, onDownloadOrig, onDownloadMod,
}) => {
  const scrollH = isFullScreen ? 'calc(100vh - 7rem)' : `${viewportH}px`;

  if (splitRows.length === 0) {
    return (
      <div style={{ height: isFullScreen ? 'calc(100vh - 7rem)' : `${viewportH}px` }}>
        <NoDiffState />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full" style={{ height: isFullScreen ? 'auto' : undefined }}>
      <div className="grid grid-cols-2 divide-x divide-neutral-800 shrink-0">
        <PanelHeader
          label="Original"
          fileRef={origFileRef}
          panel="orig"
          fileError={origFileError}
          detectedType={origDetected}
          handleFileUpload={handleFileUpload}
          onClear={onClearOrig}
          onDownload={onDownloadOrig}
        />
        <PanelHeader
          label="Modified"
          fileRef={modFileRef}
          panel="mod"
          fileError={modFileError}
          detectedType={modDetected}
          handleFileUpload={handleFileUpload}
          onClear={onClearMod}
          onDownload={onDownloadMod}
        />
      </div>
      <div ref={splitScrollRef} className="overflow-y-auto overscroll-none w-full" style={{ height: scrollH }}>
        <table className="border-collapse w-full min-w-full" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            {/* Original side */}
            <col style={{ width: 44 }} />
            <col style={{ width: 24 }} />
            <col style={{ width: 'calc(50% - 35px)' }} />
            {/* Divider */}
            <col style={{ width: 1 }} />
            {/* Modified side */}
            <col style={{ width: 44 }} />
            <col style={{ width: 24 }} />
            <col style={{ width: 'calc(50% - 35px)' }} />
          </colgroup>
          <tbody>
            {splitRows.map((row, idx) => (
              <tr
                key={idx}
                ref={(el) => { origRowRefs.current[idx] = el; modRowRefs.current[idx] = el; }}
                className="group/row"
              >
                <SplitSideCells
                  row={row}
                  idx={idx}
                  side="orig"
                  onApplyChange={onApplyChange}
                  searchMatches={searchMatches}
                  searchIdx={searchIdx}
                  wrapLines={wrapLines}
                />
                <td className="bg-neutral-800 p-0" style={{ width: 1 }} />
                <SplitSideCells
                  row={row}
                  idx={idx}
                  side="mod"
                  onApplyChange={onApplyChange}
                  searchMatches={searchMatches}
                  searchIdx={searchIdx}
                  wrapLines={wrapLines}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Main Tool Component ─────────────────────────────────────────────────────
export const DiffCheckerTool: React.FC = () => {
  const { isDark } = useTheme();

  const [original, setOriginalState]            = useState(SAMPLES.code.original);
  const [modified, setModifiedState]            = useState(SAMPLES.code.modified);

  // Real-Time WebRTC Peer-to-Peer Collaboration
  const collab = useCollaborationRoom({
    toolId: 'diff-checker',
    autoConnectFromUrl: true,
  });

  useCollaborativeText({
    ydoc: collab.ydoc,
    field: 'original',
    value: original,
    onChange: setOriginalState,
    enabled: collab.isCollaborating,
    isHost: collab.isHost,
  });

  useCollaborativeText({
    ydoc: collab.ydoc,
    field: 'modified',
    value: modified,
    onChange: setModifiedState,
    enabled: collab.isCollaborating,
    isHost: collab.isHost,
  });
  const [diffResult, setDiffResult]             = useState<SmartDiffResult | null>(null);
  const [viewMode, setViewMode]                 = useState<ViewMode>('split');
  const [mode, setMode]                         = useState<'input' | 'diff'>('diff');
  const [compareMode, setCompareMode]           = useState<CompareMode>('smart');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase]             = useState(false);
  const [wrapLines, setWrapLines]               = useState(true);
  const [granularity, setGranularity]           = useState<Granularity>('words');
  const [showOptions, setShowOptions]           = useState(false);
  const [showSampleMenu, setShowSampleMenu]     = useState(false);
  const sampleMenuRef                            = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied]                     = useState(false);
  const [copyError, setCopyError]               = useState(false);
  const [isFullScreen, setIsFullScreen]         = useState(false);
  const [origFileError, setOrigFileError]       = useState<string | null>(null);
  const [modFileError,  setModFileError]        = useState<string | null>(null);
  const [activeHunk, setActiveHunk]             = useState(0);
  const [origExt, setOrigExt]                   = useState<string | undefined>(undefined);
  const [modExt,  setModExt]                    = useState<string | undefined>(undefined);

  // Undo / Redo
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

  // Search
  const search = useSearch({ debounceMs: 200, captureCtrlF: false });
  const [searchScope, setSearchScope] = useState<'both' | 'orig' | 'mod'>('both');
  const [searchMatches, setSearchMatches] = useState<SearchMatch[]>([]);

  // Viewport height
  const [viewportH, setViewportH] = useState<number>(500);
  const didInitH = useRef(false);
  useEffect(() => {
    if (!didInitH.current) {
      setViewportH(Math.round(window.innerHeight * DEFAULT_H_VH));
      didInitH.current = true;
    }
  }, []);

  // Refs
  const debounceRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef      = useRef<HTMLDivElement | null>(null);
  const splitScrollRef = useRef<HTMLDivElement | null>(null);
  const origRowRefs    = useRef<(HTMLTableRowElement | null)[]>([]);
  const modRowRefs     = useRef<(HTMLTableRowElement | null)[]>([]);
  const inlineRowRefs  = useRef<(HTMLTableRowElement | null)[]>([]);
  const origFileRef    = useRef<HTMLInputElement | null>(null);
  const modFileRef     = useRef<HTMLInputElement | null>(null);

  // Split rows memo
  const splitRows = useMemo(() => (diffResult ? buildSplitRows(diffResult.lines) : []), [diffResult]);

  // Detected format per pane
  const origDetected = useMemo(() => (original.trim() ? TYPE_LABELS[detectSingle(original, origExt)] : undefined), [original, origExt]);
  const modDetected  = useMemo(() => (modified.trim() ? TYPE_LABELS[detectSingle(modified, modExt)] : undefined), [modified, modExt]);

  // Diff Options bundle
  const diffOptions: DiffOptions = useMemo(() => ({
    ignoreWhitespace,
    ignoreCase,
    granularity,
  }), [ignoreWhitespace, ignoreCase, granularity]);

  // Compute diff with options
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDiffResult(smartDiff(original, modified, compareMode === 'text', origExt, modExt, diffOptions));
      setActiveHunk(0);
    }, 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [original, modified, compareMode, origExt, modExt, diffOptions]);

  // Search matches
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

  // Scroll to search match
  useEffect(() => {
    if (searchMatches.length === 0) return;
    const match = searchMatches[search.matchIdx];
    if (!match) return;
    const rowIdx = match.rowIdx;
    const scrollTo = (ref: React.RefObject<HTMLDivElement | null>, rowRef: HTMLTableRowElement | null) => {
      if (!ref.current || !rowRef) return;
      ref.current.scrollTo({ top: Math.max(0, rowRef.offsetTop - 60), behavior: 'smooth' });
    };
    if (viewMode === 'split') {
      scrollTo(splitScrollRef, origRowRefs.current[rowIdx] ?? null);
    } else {
      scrollTo(scrollRef, inlineRowRefs.current[rowIdx] ?? null);
    }
  }, [search.matchIdx, searchMatches, viewMode]);

  // Keyboard shortcuts
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

  // Fullscreen lock
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

  // Click outside sample menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sampleMenuRef.current && !sampleMenuRef.current.contains(e.target as Node)) {
        setShowSampleMenu(false);
      }
    };
    if (showSampleMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSampleMenu]);

  // Resize drag
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

  // Hunks
  const hunks = useMemo(() => {
    if (!diffResult) return [];
    return viewMode === 'split' ? findHunkStarts(splitRows) : findInlineHunkStarts(diffResult.lines);
  }, [diffResult, viewMode, splitRows]);

  const scrollToHunk = useCallback((hunkIdx: number) => {
    const targetHunk = hunks[hunkIdx];
    if (!targetHunk) return;
    const rowIdx = targetHunk.rowIdx;

    if (viewMode === 'split') {
      const container = splitScrollRef.current;
      const targetRow = origRowRefs.current[rowIdx];
      if (container && targetRow) {
        container.scrollTo({ top: Math.max(0, targetRow.offsetTop - 40), behavior: 'smooth' });
      }
    } else {
      const container = scrollRef.current;
      const targetRow = inlineRowRefs.current[rowIdx];
      if (container && targetRow) {
        container.scrollTo({ top: Math.max(0, targetRow.offsetTop - 40), behavior: 'smooth' });
      }
    }
  }, [hunks, viewMode]);

  const handleNextHunk = () => {
    if (activeHunk < hunks.length - 1) {
      const next = activeHunk + 1;
      setActiveHunk(next);
      scrollToHunk(next);
    }
  };

  const handlePrevHunk = () => {
    if (activeHunk > 0) {
      const prev = activeHunk - 1;
      setActiveHunk(prev);
      scrollToHunk(prev);
    }
  };

  // File Upload & Drop
  const readFile = (file: File, panel: 'orig' | 'mod') => {
    const reader = new FileReader();
    const ext = file.name.split('.').pop()?.toLowerCase();
    reader.onload = (ev) => {
      const content = ev.target?.result;
      if (typeof content === 'string') {
        pushUndo(original, modified);
        if (panel === 'orig') {
          setOriginalState(content);
          setOrigFileError(null);
          setOrigExt(ext);
        } else {
          setModifiedState(content);
          setModFileError(null);
          setModExt(ext);
        }
      }
    };
    reader.onerror = () => {
      if (panel === 'orig') setOrigFileError('Failed to read file');
      else setModFileError('Failed to read file');
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, panel: 'orig' | 'mod') => {
    const file = e.target.files?.[0];
    if (file) readFile(file, panel);
    e.target.value = '';
  };

  const handleFileDrop = (file: File, panel: 'orig' | 'mod') => {
    readFile(file, panel);
  };

  // Actions
  const handleSwap = () => {
    pushUndo(original, modified);
    setOriginalState(modified);
    setModifiedState(original);
    setOrigFileError(null);
    setModFileError(null);
    setOrigExt(modExt);
    setModExt(origExt);
  };

  const handleLoadSample = (sampleKey: keyof typeof SAMPLES = 'code') => {
    const sample = SAMPLES[sampleKey];
    pushUndo(original, modified);
    setOriginalState(sample.original);
    setModifiedState(sample.modified);
    setOrigFileError(null);
    setModFileError(null);
    setOrigExt(undefined);
    setModExt(undefined);
    setMode('diff');
  };

  const handleClear = () => {
    pushUndo(original, modified);
    setOriginalState('');
    setModifiedState('');
    setDiffResult(null);
    setActiveHunk(0);
    setOrigFileError(null);
    setModFileError(null);
    setOrigExt(undefined);
    setModExt(undefined);
    setMode('input');
  };

  const handleCompare = () => {
    setDiffResult(smartDiff(original, modified, compareMode === 'text', origExt, modExt, diffOptions));
    setActiveHunk(0);
    setMode('diff');
  };

  const handleCopyDiff = async () => {
    if (!diffResult) return;
    const text = toUnifiedDiff(original, modified, diffResult);
    try {
      await navigator.clipboard.writeText(text || '(no differences)');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 2000);
    }
  };

  const handleDownloadPatch = () => {
    const text = toUnifiedDiff(original, modified, diffResult ?? undefined);
    const blob = new Blob([text], { type: 'text/x-diff;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'changes.patch';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Change transfer
  const handleApplyChange = useCallback((rowIdx: number, direction: 'toOrig' | 'toMod') => {
    if (!diffResult) return;
    const row = splitRows[rowIdx];
    if (!row) return;

    pushUndo(original, modified);

    if (direction === 'toMod') {
      const origLines = original.split('\n');
      const modLines  = modified.split('\n');
      const origLineNo = row.origLineNo;
      const modLineNo  = row.modLineNo;

      if (origLineNo !== null) {
        if (modLineNo !== null) modLines[modLineNo - 1] = origLines[origLineNo - 1];
        else modLines.splice(rowIdx, 0, origLines[origLineNo - 1]);
        setModifiedState(modLines.join('\n'));
      }
    } else {
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

  useEffect(() => {
    origRowRefs.current = [];
    modRowRefs.current = [];
    inlineRowRefs.current = [];
  }, [diffResult, viewMode]);

  const isEmpty  = original === '' && modified === '';
  const hasDiff  = diffResult !== null;
  const noChange = hasDiff && diffResult.addedCount === 0 && diffResult.removedCount === 0 && !isEmpty;

  const borderClass = isDark ? 'border-neutral-700' : 'border-[#E4E4E7]';
  const inactiveBtnClass = isDark
    ? 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
    : 'bg-[#E4E4E7]/40 text-[#3F3F46] hover:bg-[#D4D4D8] hover:text-[#18181B]';

  return (
    <div className={`developer-tool-container bg-neutral-950 border border-neutral-800 text-neutral-100 flex flex-col ${
      isFullScreen ? 'fixed inset-0 z-[9999]' : 'w-full rounded-lg overflow-hidden shadow-xl'
    }`}>

      {/* Main Toolbar */}
      <Toolbar.Root isDark={isDark} isFullScreen={isFullScreen}>
        <Toolbar.Group>
          {/* Edit / Compare Toggle */}
          <div className={`flex items-center rounded border ${borderClass} overflow-hidden shrink-0`}>
            <button
              onClick={() => setMode('input')}
              className={`px-3 py-1.5 transition-colors cursor-pointer text-xs ${mode === 'input' ? 'bg-[#1D9BF0] text-white font-semibold' : inactiveBtnClass}`}
            >
              Edit
            </button>
            <button
              onClick={handleCompare}
              className={`px-3 py-1.5 transition-colors cursor-pointer text-xs ${mode === 'diff' ? 'bg-[#1D9BF0] text-white font-semibold' : inactiveBtnClass}`}
            >
              Compare
            </button>
          </div>

          {/* Split / Inline View Switcher */}
          {mode === 'diff' && (
            <div className={`flex items-center rounded border ${borderClass} overflow-hidden shrink-0`}>
              <button
                onClick={() => { setViewMode('split'); setActiveHunk(0); }}
                className={`px-2.5 py-1.5 flex items-center gap-1 transition-colors cursor-pointer text-xs ${viewMode === 'split' ? 'bg-[#1D9BF0]/20 text-[#1D9BF0]' : inactiveBtnClass}`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Split</span>
              </button>
              <button
                onClick={() => { setViewMode('inline'); setActiveHunk(0); }}
                className={`px-2.5 py-1.5 flex items-center gap-1 transition-colors cursor-pointer text-xs ${viewMode === 'inline' ? 'bg-[#1D9BF0]/20 text-[#1D9BF0]' : inactiveBtnClass}`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Inline</span>
              </button>
            </div>
          )}

          {/* Smart / Text Mode Switcher */}
          <div className={`flex items-center rounded border ${borderClass} overflow-hidden shrink-0`} title="Smart auto-detects format. Text forces plain line comparison.">
            <button
              onClick={() => setCompareMode('smart')}
              className={`px-2.5 py-1.5 transition-colors cursor-pointer text-xs ${compareMode === 'smart' ? 'bg-neutral-700 text-neutral-100 font-semibold' : inactiveBtnClass}`}
            >
              Smart
            </button>
            <button
              onClick={() => setCompareMode('text')}
              className={`px-2.5 py-1.5 transition-colors cursor-pointer text-xs ${compareMode === 'text' ? 'bg-neutral-700 text-neutral-100 font-semibold' : inactiveBtnClass}`}
            >
              Text
            </button>
          </div>

          {/* Prominent Auto-Detected Format Badge */}
          {diffResult?.detection && !isEmpty && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono select-none ${
                isDark
                  ? 'bg-neutral-900 border-neutral-700/80 text-neutral-200'
                  : 'bg-[#E4E4E7]/60 border-neutral-300 text-neutral-800'
              }`}
              title={`Automatic language & format detection: ${diffResult.detection.label} (${diffResult.detection.modeLabel})`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-neutral-400 text-[11px] hidden md:inline">Detected:</span>
              <span className="font-semibold text-neutral-200">
                {diffResult.detection.isMixed ? 'Mixed' : diffResult.detection.label}
              </span>
            </div>
          )}

          {/* Line Wrap Toggle */}
          <button
            onClick={() => setWrapLines(!wrapLines)}
            title={wrapLines ? 'Disable line wrap' : 'Enable line wrap'}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border ${borderClass} transition-colors cursor-pointer ${
              wrapLines ? 'bg-neutral-800 text-neutral-100 border-neutral-600' : inactiveBtnClass
            }`}
          >
            <WrapText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Wrap</span>
          </button>

          {/* Options Dropdown Trigger */}
          <button
            onClick={() => setShowOptions(!showOptions)}
            title="Comparison options (whitespace, case, granularity)"
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border ${borderClass} transition-colors cursor-pointer ${
              showOptions || ignoreWhitespace || ignoreCase || granularity === 'chars'
                ? 'bg-neutral-800 text-neutral-100 border-neutral-600'
                : inactiveBtnClass
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Options</span>
            {(ignoreWhitespace || ignoreCase || granularity === 'chars') && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" />
            )}
          </button>

          {/* Swap */}
          <Toolbar.Button
            onClick={handleSwap}
            disabled={isEmpty}
            isDark={isDark}
            icon={ArrowLeftRight}
            label="Swap"
            className="hidden sm:flex"
          />

          {/* Preset Samples Selector */}
          <div ref={sampleMenuRef} className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setShowSampleMenu(!showSampleMenu)}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border ${borderClass} transition-colors cursor-pointer ${
                showSampleMenu ? 'bg-neutral-800 text-neutral-100 border-neutral-600' : inactiveBtnClass
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Sample</span>
              <ChevronDown className={`w-3 h-3 text-neutral-500 transition-transform duration-150 ${showSampleMenu ? 'rotate-180' : ''}`} />
            </button>
            {showSampleMenu && (
              <div className="absolute left-0 top-full mt-1 flex flex-col bg-neutral-900 border border-neutral-700 rounded shadow-xl py-1 z-30 min-w-[170px]">
                {Object.entries(SAMPLES).map(([key, sample]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      handleLoadSample(key as keyof typeof SAMPLES);
                      setShowSampleMenu(false);
                    }}
                    className="px-3 py-1.5 text-xs text-left text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear */}
          <Toolbar.Button
            onClick={handleClear}
            disabled={isEmpty}
            variant="danger"
            isDark={isDark}
            icon={Trash2}
            label="Clear"
          />

          {/* Undo / Redo */}
          <div className="hidden lg:flex items-center gap-0.5">
            <Toolbar.Button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              title="Undo (Ctrl+Z)"
              isDark={isDark}
              icon={RotateCcw}
            />
            <Toolbar.Button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              title="Redo (Ctrl+Y)"
              isDark={isDark}
              icon={RotateCw}
            />
          </div>

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

          {/* Real-Time Live P2P Collaboration Button */}
          <CollabToolbarButton
            sessionState={collab}
            startSession={collab.startSession}
            joinSession={collab.joinSession}
            leaveSession={collab.leaveSession}
            setDisplayName={collab.setDisplayName}
            isDark={isDark}
          />
        </Toolbar.Group>

        <Toolbar.Group align="right">
          {/* Hunk Navigation */}
          {mode === 'diff' && !noChange && hunks.length > 0 && (
            <HunkNav total={hunks.length} current={activeHunk + 1} onPrev={handlePrevHunk} onNext={handleNextHunk} />
          )}

          {/* Statistics summary */}
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

          {/* Download Patch */}
          {hasDiff && !isEmpty && (
            <Toolbar.Button
              onClick={handleDownloadPatch}
              isDark={isDark}
              icon={Download}
              label=".patch"
              title="Download standard unified diff patch"
              className="hidden sm:flex"
            />
          )}

          {/* Copy Diff */}
          <Toolbar.Button
            onClick={handleCopyDiff}
            disabled={!hasDiff || isEmpty}
            isDark={isDark}
            icon={copied ? Check : Copy}
            label={copied ? 'Copied!' : 'Copy Diff'}
          />

          {/* Fullscreen */}
          <Toolbar.Button
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? 'Exit full screen' : 'Full screen'}
            isDark={isDark}
            icon={isFullScreen ? Minimize2 : Maximize2}
          />
        </Toolbar.Group>
      </Toolbar.Root>

      {/* Options Panel Sub-bar */}
      {showOptions && (
        <div className="px-4 py-2 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center gap-4 text-xs font-mono select-none">
          <label className="flex items-center gap-1.5 cursor-pointer text-neutral-300 hover:text-white select-none">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(e) => setIgnoreWhitespace(e.target.checked)}
              className="rounded bg-neutral-800 border-neutral-700 text-neutral-200 accent-neutral-500 cursor-pointer"
            />
            <span>Ignore Whitespace</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-neutral-300 hover:text-white select-none">
            <input
              type="checkbox"
              checked={ignoreCase}
              onChange={(e) => setIgnoreCase(e.target.checked)}
              className="rounded bg-neutral-800 border-neutral-700 text-neutral-200 accent-neutral-500 cursor-pointer"
            />
            <span>Ignore Case</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-neutral-300 hover:text-white select-none">
            <input
              type="checkbox"
              checked={wrapLines}
              onChange={(e) => setWrapLines(e.target.checked)}
              className="rounded bg-neutral-800 border-neutral-700 text-neutral-200 accent-neutral-500 cursor-pointer"
            />
            <span>Word Wrap</span>
          </label>

          <div className="flex items-center gap-1 text-neutral-400">
            <span>Inline Highlight:</span>
            <div className="flex rounded border border-neutral-700 overflow-hidden">
              <button
                type="button"
                onClick={() => setGranularity('words')}
                className={`px-2 py-0.5 cursor-pointer ${granularity === 'words' ? 'bg-neutral-700 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}
              >
                Words
              </button>
              <button
                type="button"
                onClick={() => setGranularity('chars')}
                className={`px-2 py-0.5 cursor-pointer ${granularity === 'chars' ? 'bg-neutral-700 text-white' : 'bg-neutral-900 text-neutral-400 hover:text-white'}`}
              >
                Chars
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
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
                <button
                  key={scope}
                  onClick={() => setSearchScope(scope)}
                  className={`px-2 py-1 transition-colors cursor-pointer capitalize text-xs ${
                    searchScope === scope ? 'bg-neutral-700 text-neutral-100' : 'bg-neutral-900 text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {scope === 'both' ? 'Both' : scope === 'orig' ? 'Orig' : 'Mod'}
                </button>
              ))}
            </div>
          }
        />
      )}

      {/* Main Workspace */}
      {mode === 'input' ? (
        <InputPanels
          original={original}
          modified={modified}
          setOriginal={setOriginal}
          setModified={setModified}
          origFileError={origFileError}
          modFileError={modFileError}
          origDetected={origDetected}
          modDetected={modDetected}
          origFileRef={origFileRef}
          modFileRef={modFileRef}
          handleFileUpload={handleFileUpload}
          handleFileDrop={handleFileDrop}
          viewportH={viewportH}
          isFullScreen={isFullScreen}
          wrapLines={wrapLines}
          onClearOrig={() => { pushUndo(original, modified); setOriginalState(''); }}
          onClearMod={() => { pushUndo(original, modified); setModifiedState(''); }}
          onDownloadOrig={() => handleDownloadFile(original, 'original.txt')}
          onDownloadMod={() => handleDownloadFile(modified, 'modified.txt')}
        />
      ) : noChange ? (
        <div style={{ height: isFullScreen ? undefined : viewportH }}>
          <NoDiffState />
        </div>
      ) : isEmpty ? (
        <div
          className="flex items-center justify-center text-neutral-500 font-mono text-xs"
          style={{ height: isFullScreen ? undefined : viewportH }}
        >
          Paste content in both panels and click Compare.
        </div>
      ) : viewMode === 'split' ? (
        <SplitView
          splitRows={splitRows}
          splitScrollRef={splitScrollRef}
          origRowRefs={origRowRefs}
          modRowRefs={modRowRefs}
          viewportH={viewportH}
          isFullScreen={isFullScreen}
          wrapLines={wrapLines}
          origFileError={origFileError}
          modFileError={modFileError}
          origDetected={origDetected}
          modDetected={modDetected}
          origFileRef={origFileRef}
          modFileRef={modFileRef}
          handleFileUpload={handleFileUpload}
          onApplyChange={handleApplyChange}
          searchMatches={searchMatches}
          searchIdx={search.matchIdx}
          onClearOrig={() => { pushUndo(original, modified); setOriginalState(''); }}
          onClearMod={() => { pushUndo(original, modified); setModifiedState(''); }}
          onDownloadOrig={() => handleDownloadFile(original, 'original.txt')}
          onDownloadMod={() => handleDownloadFile(modified, 'modified.txt')}
        />
      ) : (
        <InlineView
          diffResult={diffResult!}
          scrollRef={scrollRef}
          rowRefs={inlineRowRefs}
          viewportH={viewportH}
          isFullScreen={isFullScreen}
          wrapLines={wrapLines}
          searchMatches={searchMatches}
          searchIdx={search.matchIdx}
        />
      )}

      {/* Resize handle */}
      {!isFullScreen && (
        <ResizeHandle onPointerDown={handleResizePointerDown} />
      )}

      {/* Footer Status Bar */}
      <div className="px-4 py-2 bg-neutral-900/80 border-t border-neutral-800 flex items-center justify-between shrink-0">
        {diffResult?.detection && !isEmpty ? (
          <span className="text-neutral-500 text-[11px] font-mono flex items-center gap-1.5">
            <span className="text-neutral-400 font-semibold">
              {diffResult.detection.isMixed ? 'Mixed Content' : diffResult.detection.label}
            </span>
            <span className="text-neutral-700">·</span>
            <span>{diffResult.detection.modeLabel}</span>
            {wrapLines && <span className="text-neutral-400">(wrapped)</span>}
            {ignoreWhitespace && <span className="text-neutral-400">(no-whitespace)</span>}
            {ignoreCase && <span className="text-neutral-400">(case-insensitive)</span>}
          </span>
        ) : (
          <span className="text-neutral-600 text-[11px] font-mono">Client-Side Diff Engine</span>
        )}
        <span className="text-neutral-500 text-[11px] font-mono flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-neutral-600" />
          Local browser processing · No data sent to any server
        </span>
      </div>
    </div>
  );
};
