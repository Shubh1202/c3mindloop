'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Copy, Check, Trash2, Upload, ArrowLeftRight,
  Info, AlertCircle, Maximize2, Minimize2, Columns2,
  AlignLeft, ChevronUp, ChevronDown,
} from 'lucide-react';
import { computeDiff, toUnifiedDiff, type DiffResult, type DiffLine, type CharSpan } from './diffEngine';

type ViewMode = 'split' | 'inline';

// ── Resize constants ──────────────────────────────────────────────────────────
const MIN_H = 300;
const MAX_H_VH = 0.88; // 88 vh
const DEFAULT_H_VH = 0.65; // 65 vh

// ── Samples ───────────────────────────────────────────────────────────────────
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

// ── Visual constants ──────────────────────────────────────────────────────────
const ROW_BG = {
  added:     '#0e2318',
  removed:   '#2b0f0f',
  empty:     '#141414',
  unchanged: 'transparent',
} as const;

const CHAR_HL = {
  added:   '#166534',
  removed: '#7f1d1d',
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

// ── Span renderer ─────────────────────────────────────────────────────────────
function renderSpans(spans: CharSpan[], side: 'added' | 'removed'): React.ReactNode {
  const color = CHAR_HL[side];
  return spans.map((span, i) =>
    span.changed
      ? <span key={i} style={{ backgroundColor: color, borderRadius: 2, padding: '0 1px' }}>{span.text}</span>
      : <React.Fragment key={i}>{span.text}</React.Fragment>
  );
}

// ── Hunk helpers ──────────────────────────────────────────────────────────────
interface HunkIndex { rowIdx: number }

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

// ── Split row builder ─────────────────────────────────────────────────────────
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

// ── Content cell ──────────────────────────────────────────────────────────────
function ContentCell({ text, type, spans }: {
  text:  string;
  type:  'removed' | 'added' | 'unchanged' | 'empty';
  spans: CharSpan[] | undefined;
}) {
  const bg      = ROW_BG[type] ?? 'transparent';
  const textCls = type === 'unchanged' ? TEXT_DIM : TEXT_FULL;
  const inner   = (() => {
    if (type === 'empty')                    return <>&zwj;</>;
    if (spans && spans.length > 0)           return renderSpans(spans, type as 'added' | 'removed');
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

// ── Split View ────────────────────────────────────────────────────────────────
// Single unified table: both sides share the same <tr>, so vertical alignment
// is guaranteed. One scroll container = vertically synchronized by construction.
// Each content <td> has its own overflow-x:auto → horizontal scroll is independent.

interface SplitViewProps {
  diffResult:      DiffResult;
  scrollRef:       React.RefObject<HTMLDivElement | null>;
  rowRefs:         React.MutableRefObject<(HTMLTableRowElement | null)[]>;
  viewportH:       number;   // px - controlled by resize handle
  isFullScreen:    boolean;
  origFileError:   string | null;
  modFileError:    string | null;
  origFileRef:     React.RefObject<HTMLInputElement | null>;
  modFileRef:      React.RefObject<HTMLInputElement | null>;
  handleFileUpload:(e: React.ChangeEvent<HTMLInputElement>, panel: 'orig' | 'mod') => void;
}

const SplitView: React.FC<SplitViewProps> = ({
  diffResult, scrollRef, rowRefs, viewportH, isFullScreen,
  origFileError, modFileError, origFileRef, modFileRef, handleFileUpload,
}) => {
  const rows = buildSplitRows(diffResult.lines);
  // In fullscreen, fill remaining height; otherwise use the resizable viewportH
  const scrollH = isFullScreen ? 'calc(100vh - 7rem)' : `${viewportH}px`;

  return (
    <div className="flex flex-col">
      {/* Column headers */}
      <div className="grid grid-cols-2 border-b border-neutral-800 divide-x divide-neutral-800">
        {(['orig', 'mod'] as const).map((panel) => {
          const label   = panel === 'orig' ? 'Original' : 'Modified';
          const fileRef = panel === 'orig' ? origFileRef : modFileRef;
          const fileErr = panel === 'orig' ? origFileError : modFileError;
          return (
            <div key={panel} className="flex items-center justify-between px-3 py-1.5 bg-neutral-900 text-xs font-mono">
              <span className="font-semibold text-neutral-300">{label}</span>
              <div className="flex items-center gap-2">
                {fileErr && <span className="text-red-400 text-[11px] truncate max-w-[130px]">{fileErr}</span>}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer text-xs"
                >
                  <Upload className="w-3 h-3" /><span>Upload</span>
                </button>
                <input ref={fileRef} type="file" className="hidden" onChange={(e) => handleFileUpload(e, panel)} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Unified scroll container - single div, single table → rows are inherently aligned */}
      <div
        ref={scrollRef}
        className="overflow-auto overscroll-none"
        style={{ height: scrollH }}
      >
        {rows.length === 0 ? (
          <NoDiffState />
        ) : (
          <table className="border-collapse" style={{ width: '100%', minWidth: '100%', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: 44 }} />
              <col style={{ width: 20 }} />
              <col style={{ width: '50%' }} />
              <col style={{ width: 1 }} />
              <col style={{ width: 44 }} />
              <col style={{ width: 20 }} />
              <col />
            </colgroup>
            <tbody>
              {rows.map((row, idx) => {
                const origBg       = ROW_BG[row.origType];
                const modBg        = ROW_BG[row.modType];
                const origGutCls   = GUTTER_CLS[row.origGutter] ?? 'text-neutral-700';
                const modGutCls    = GUTTER_CLS[row.modGutter]  ?? 'text-neutral-700';
                return (
                  <tr key={idx} ref={(el) => { rowRefs.current[idx] = el; }} style={{ height: ROW_H }}>
                    {/* orig line no */}
                    <td style={{ backgroundColor: origBg, whiteSpace: 'nowrap' }}
                      className={`text-right pr-1.5 pl-1 text-neutral-600 font-mono text-[11px] select-none align-top border-r border-neutral-800/50 ${ROW_H_CLS} ${LEAD_CLS}`}>
                      {row.origLineNo ?? ''}
                    </td>
                    {/* orig gutter */}
                    <td style={{ backgroundColor: origBg, whiteSpace: 'nowrap' }}
                      className={`text-center font-mono text-xs font-bold select-none align-top ${ROW_H_CLS} ${LEAD_CLS} ${origGutCls}`}>
                      {row.origGutter}
                    </td>
                    {/* orig content */}
                    <ContentCell text={row.origText} type={row.origType} spans={row.origSpans} />
                    {/* centre divider */}
                    <td style={{ backgroundColor: '#262626', padding: 0, width: 1 }} />
                    {/* mod line no */}
                    <td style={{ backgroundColor: modBg, whiteSpace: 'nowrap' }}
                      className={`text-right pr-1.5 pl-1 text-neutral-600 font-mono text-[11px] select-none align-top border-r border-neutral-800/50 ${ROW_H_CLS} ${LEAD_CLS}`}>
                      {row.modLineNo ?? ''}
                    </td>
                    {/* mod gutter */}
                    <td style={{ backgroundColor: modBg, whiteSpace: 'nowrap' }}
                      className={`text-center font-mono text-xs font-bold select-none align-top ${ROW_H_CLS} ${LEAD_CLS} ${modGutCls}`}>
                      {row.modGutter}
                    </td>
                    {/* mod content */}
                    <ContentCell text={row.modText} type={row.modType} spans={row.modSpans} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ── Inline View ───────────────────────────────────────────────────────────────
const InlineView: React.FC<{
  diffResult:   DiffResult;
  scrollRef:    React.RefObject<HTMLDivElement | null>;
  rowRefs:      React.MutableRefObject<(HTMLTableRowElement | null)[]>;
  viewportH:    number;
  isFullScreen: boolean;
}> = ({ diffResult, scrollRef, rowRefs, viewportH, isFullScreen }) => {
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
                      {spans && spans.length > 0
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

// ── Input panels ──────────────────────────────────────────────────────────────
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

  const Header = ({ label, fileRef, panel, fileError }: {
    label: string; fileRef: React.RefObject<HTMLInputElement | null>;
    panel: 'orig' | 'mod'; fileError: string | null;
  }) => (
    <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 text-xs font-mono">
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800">
      <div className="flex flex-col">
        <Header label="Original" fileRef={origFileRef} panel="orig" fileError={origFileError} />
        <textarea value={original} onChange={(e) => setOriginal(e.target.value)}
          placeholder="Paste original text or code here…"
          spellCheck={false}
          style={{ height: h, resize: 'none' }}
          className="p-3 font-mono text-xs bg-[#111] text-neutral-200 border-none focus:outline-none leading-[22px] placeholder-neutral-700"
        />
      </div>
      <div className="flex flex-col">
        <Header label="Modified" fileRef={modFileRef} panel="mod" fileError={modFileError} />
        <textarea value={modified} onChange={(e) => setModified(e.target.value)}
          placeholder="Paste modified text or code here…"
          spellCheck={false}
          style={{ height: h, resize: 'none' }}
          className="p-3 font-mono text-xs bg-[#111] text-neutral-200 border-none focus:outline-none leading-[22px] placeholder-neutral-700"
        />
      </div>
    </div>
  );
};

// ── No-diff state ─────────────────────────────────────────────────────────────
const NoDiffState: React.FC = () => (
  <div className="flex flex-col items-center gap-2 py-10 px-6 text-center">
    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
      <Check className="w-4 h-4 text-emerald-400" />
    </div>
    <p className="font-mono text-sm font-semibold text-neutral-300">Files are identical</p>
    <p className="font-mono text-xs text-neutral-600">No differences found.</p>
  </div>
);

// ── Hunk nav ──────────────────────────────────────────────────────────────────
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

// ── Resize handle ─────────────────────────────────────────────────────────────
const ResizeHandle: React.FC<{ onPointerDown: (e: React.PointerEvent) => void }> = ({ onPointerDown }) => (
  <div
    onPointerDown={onPointerDown}
    className="h-3 flex items-center justify-center bg-neutral-900 border-t border-neutral-800 cursor-row-resize select-none group shrink-0"
    title="Drag to resize"
    aria-label="Drag to resize diff area"
  >
    {/* Three-dot drag indicator */}
    <div className="flex items-center gap-0.5 opacity-40 group-hover:opacity-80 transition-opacity">
      <div className="w-1 h-1 rounded-full bg-neutral-500" />
      <div className="w-1 h-1 rounded-full bg-neutral-500" />
      <div className="w-1 h-1 rounded-full bg-neutral-500" />
      <div className="w-1 h-1 rounded-full bg-neutral-500" />
      <div className="w-1 h-1 rounded-full bg-neutral-500" />
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export const DiffCheckerTool: React.FC = () => {
  const [original, setOriginal]           = useState('');
  const [modified, setModified]           = useState('');
  const [diffResult, setDiffResult]       = useState<DiffResult | null>(null);
  const [viewMode, setViewMode]           = useState<ViewMode>('split');
  const [mode, setMode]                   = useState<'input' | 'diff'>('input');
  const [copied, setCopied]               = useState(false);
  const [copyError, setCopyError]         = useState(false);
  const [isFullScreen, setIsFullScreen]   = useState(false);
  const [origFileError, setOrigFileError] = useState<string | null>(null);
  const [modFileError,  setModFileError]  = useState<string | null>(null);
  const [activeHunk, setActiveHunk]       = useState(0);

  // Resizable viewport height - initialised lazily on first client render
  const [viewportH, setViewportH] = useState<number>(500); // SSR safe fallback
  const didInitH = useRef(false);
  useEffect(() => {
    if (!didInitH.current) {
      setViewportH(Math.round(window.innerHeight * DEFAULT_H_VH));
      didInitH.current = true;
    }
  }, []);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef   = useRef<HTMLDivElement | null>(null);
  const rowRefs     = useRef<(HTMLTableRowElement | null)[]>([]);
  const origFileRef = useRef<HTMLInputElement | null>(null);
  const modFileRef  = useRef<HTMLInputElement | null>(null);

  // ── Debounced diff ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDiffResult(computeDiff(original, modified));
      setActiveHunk(0);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [original, modified]);

  // ── Fullscreen ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsFullScreen(false); };
    const nav   = document.querySelector('header') as HTMLElement | null;
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
      if (nav) nav.style.display = 'none';
      window.addEventListener('keydown', onKey);
    } else {
      document.body.style.overflow = '';
      if (nav) nav.style.display = '';
    }
    return () => {
      document.body.style.overflow = '';
      const n = document.querySelector('header') as HTMLElement | null;
      if (n) n.style.display = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isFullScreen]);

  // ── Resize drag ────────────────────────────────────────────────────────────
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
      const delta  = ev.clientY - dragStartY.current;
      const maxH   = Math.round(window.innerHeight * MAX_H_VH);
      const newH   = Math.min(maxH, Math.max(MIN_H, dragStartH.current + delta));
      setViewportH(newH);
    };

    const onUp = () => {
      isDragging.current = false;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup',   onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup',   onUp);
  }, [viewportH]);

  // ── Hunk navigation ────────────────────────────────────────────────────────
  const splitRows   = diffResult ? buildSplitRows(diffResult.lines) : [];
  const inlineLines = diffResult ? diffResult.lines : [];
  const hunks = viewMode === 'split'
    ? findHunkStarts(splitRows)
    : findInlineHunkStarts(inlineLines);

  const scrollToHunk = useCallback((idx: number) => {
    if (!scrollRef.current || idx < 0 || idx >= hunks.length) return;
    const rowEl = rowRefs.current[hunks[idx].rowIdx];
    if (!rowEl) return;
    scrollRef.current.scrollTo({ top: Math.max(0, rowEl.offsetTop - 60), behavior: 'smooth' });
  }, [hunks]);

  const handlePrevHunk = () => { const n = Math.max(0, activeHunk - 1); setActiveHunk(n); scrollToHunk(n); };
  const handleNextHunk = () => { const n = Math.min(hunks.length - 1, activeHunk + 1); setActiveHunk(n); scrollToHunk(n); };

  // ── File upload ────────────────────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, panel: 'orig' | 'mod') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload  = (ev) => {
      const content = ev.target?.result as string;
      if (panel === 'orig') { setOriginal(content); setOrigFileError(null); }
      else                  { setModified(content); setModFileError(null); }
    };
    reader.onerror = () => {
      const msg = 'Cannot read file - binary files are not supported.';
      if (panel === 'orig') setOrigFileError(msg); else setModFileError(msg);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── Toolbar actions ────────────────────────────────────────────────────────
  const handleSwap        = () => { setOriginal(modified); setModified(original); setOrigFileError(null); setModFileError(null); };
  const handleLoadSample  = () => { setOriginal(SAMPLE_ORIGINAL); setModified(SAMPLE_MODIFIED); setOrigFileError(null); setModFileError(null); setMode('diff'); };
  const handleClear       = () => { setOriginal(''); setModified(''); setDiffResult(null); setActiveHunk(0); setOrigFileError(null); setModFileError(null); setMode('input'); };
  const handleCompare     = () => { setDiffResult(computeDiff(original, modified)); setActiveHunk(0); setMode('diff'); };
  const handleCopyDiff    = async () => {
    if (!diffResult) return;
    const text = toUnifiedDiff(original, modified, diffResult);
    try   { await navigator.clipboard.writeText(text || '(no differences)'); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { setCopyError(true); setTimeout(() => setCopyError(false), 2000); }
  };

  useEffect(() => { rowRefs.current = []; }, [diffResult, viewMode]);

  const isEmpty  = original === '' && modified === '';
  const hasDiff  = diffResult !== null;
  const noChange = hasDiff && diffResult.addedCount === 0 && diffResult.removedCount === 0 && !isEmpty;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={`bg-neutral-950 border border-neutral-800 text-neutral-100 flex flex-col ${
      isFullScreen ? 'fixed inset-0 z-[9999]' : 'w-full rounded-lg overflow-hidden shadow-xl'
    }`}>

      {/* Toolbar */}
      <div className={`px-3 py-2 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center gap-2 text-xs font-mono shrink-0 ${
        isFullScreen ? 'sticky top-0 z-[10000]' : ''
      }`}>
        {/* Edit / Compare */}
        <div className="flex items-center rounded border border-neutral-700 overflow-hidden shrink-0">
          <button onClick={() => setMode('input')}
            className={`px-3 py-1.5 transition-colors cursor-pointer ${mode === 'input' ? 'bg-[#1D9BF0] text-white font-semibold' : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'}`}>
            Edit
          </button>
          <button onClick={handleCompare}
            className={`px-3 py-1.5 transition-colors cursor-pointer ${mode === 'diff' ? 'bg-[#1D9BF0] text-white font-semibold' : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'}`}>
            Compare
          </button>
        </div>

        {/* Split / Inline */}
        {mode === 'diff' && (
          <div className="flex items-center rounded border border-neutral-700 overflow-hidden shrink-0">
            <button onClick={() => { setViewMode('split'); setActiveHunk(0); }}
              className={`px-2.5 py-1.5 flex items-center gap-1 transition-colors cursor-pointer ${viewMode === 'split' ? 'bg-[#1D9BF0]/20 text-[#1D9BF0]' : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'}`}>
              <Columns2 className="w-3.5 h-3.5" /><span>Split</span>
            </button>
            <button onClick={() => { setViewMode('inline'); setActiveHunk(0); }}
              className={`px-2.5 py-1.5 flex items-center gap-1 transition-colors cursor-pointer ${viewMode === 'inline' ? 'bg-[#1D9BF0]/20 text-[#1D9BF0]' : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'}`}>
              <AlignLeft className="w-3.5 h-3.5" /><span>Inline</span>
            </button>
          </div>
        )}

        <button onClick={handleSwap} disabled={isEmpty}
          className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
          <ArrowLeftRight className="w-3.5 h-3.5" /><span>Swap</span>
        </button>
        <button onClick={handleLoadSample}
          className="px-2.5 py-1.5 rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 cursor-pointer transition-colors">
          Sample
        </button>
        <button onClick={handleClear} disabled={isEmpty}
          className="px-2.5 py-1.5 rounded bg-neutral-800/80 hover:bg-red-950 hover:text-red-300 text-neutral-400 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
          <Trash2 className="w-3.5 h-3.5" /><span>Clear</span>
        </button>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {mode === 'diff' && !noChange && hunks.length > 0 && (
            <HunkNav total={hunks.length} current={activeHunk + 1} onPrev={handlePrevHunk} onNext={handleNextHunk} />
          )}
          {hasDiff && !isEmpty && (
            <div className="flex items-center gap-1 font-mono text-[11px] px-2 py-1 rounded bg-neutral-800/60 border border-neutral-700/50 select-none">
              <span className="text-emerald-400 font-semibold">+{diffResult.addedCount}</span>
              <span className="text-neutral-600 mx-0.5">/</span>
              <span className="text-red-400 font-semibold">-{diffResult.removedCount}</span>
              {noChange && <span className="text-neutral-500 ml-1.5">identical</span>}
            </div>
          )}
          <button onClick={handleCopyDiff} disabled={!hasDiff || isEmpty}
            className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
            {copied
              ? <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Copied!</span></>
              : copyError
              ? <><AlertCircle className="w-3.5 h-3.5 text-red-400" /><span className="text-red-400">Error</span></>
              : <><Copy className="w-3.5 h-3.5" /><span>Copy Diff</span></>}
          </button>
          <button onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
            title={isFullScreen ? 'Exit full screen' : 'Full screen'}>
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

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
          diffResult={diffResult!}
          scrollRef={scrollRef} rowRefs={rowRefs}
          viewportH={viewportH} isFullScreen={isFullScreen}
          origFileError={origFileError} modFileError={modFileError}
          origFileRef={origFileRef} modFileRef={modFileRef}
          handleFileUpload={handleFileUpload}
        />
      ) : (
        <InlineView
          diffResult={diffResult!}
          scrollRef={scrollRef} rowRefs={rowRefs}
          viewportH={viewportH} isFullScreen={isFullScreen}
        />
      )}

      {/* Resize handle - hidden in fullscreen */}
      {!isFullScreen && (
        <ResizeHandle onPointerDown={handleResizePointerDown} />
      )}

      {/* Footer */}
      <div className="px-4 py-2 bg-neutral-900/80 border-t border-neutral-800 flex items-center justify-end shrink-0">
        <span className="text-neutral-500 text-[11px] font-mono flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-neutral-600" />
          Local browser processing · No data sent to any server
        </span>
      </div>
    </div>
  );
};
