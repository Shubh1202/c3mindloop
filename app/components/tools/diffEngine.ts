// diffEngine.ts - Pure TypeScript diff engine. No React, no DOM, no side effects.
// Uses the Myers O(ND) algorithm for both line-level and character-level diffing.

export type DiffLineType = 'added' | 'removed' | 'unchanged';

export interface CharSpan {
  text: string;
  changed: boolean;
}

export interface DiffLine {
  type: DiffLineType;
  text: string;
  /** Original file line number (1-based). null for pure 'added' lines. */
  origLineNo: number | null;
  /** Modified file line number (1-based). null for pure 'removed' lines. */
  modLineNo: number | null;
  /**
   * Char-level spans for the REMOVED side of a pair.
   * Present on BOTH the 'removed' and 'added' lines of a paired hunk so
   * each side can render its own changed characters.
   */
  origCharSpans?: CharSpan[];
  /**
   * Char-level spans for the ADDED side of a pair.
   * Present on BOTH the 'removed' and 'added' lines of a paired hunk.
   */
  modCharSpans?: CharSpan[];
}

export interface DiffResult {
  lines: DiffLine[];
  addedCount: number;
  removedCount: number;
}

// ── Myers O(ND) diff ─────────────────────────────────────────────────────────

interface EditOp {
  op: 'equal' | 'insert' | 'delete';
  aIdx: number;
  bIdx: number;
}

function myersDiff<T>(
  a: T[],
  b: T[],
  eq: (x: T, y: T) => boolean = (x, y) => x === y
): EditOp[] {
  const n = a.length;
  const m = b.length;

  if (n === 0 && m === 0) return [];
  if (n === 0) return b.map((_, i) => ({ op: 'insert' as const, aIdx: 0, bIdx: i }));
  if (m === 0) return a.map((_, i) => ({ op: 'delete' as const, aIdx: i, bIdx: 0 }));

  const max = n + m;
  const V: number[] = new Array(2 * max + 1).fill(0);
  const trace: number[][] = [];

  outer: for (let d = 0; d <= max; d++) {
    trace.push([...V]);
    for (let k = -d; k <= d; k += 2) {
      const ki = k + max;
      let x: number;
      if (k === -d || (k !== d && V[ki - 1] < V[ki + 1])) {
        x = V[ki + 1];
      } else {
        x = V[ki - 1] + 1;
      }
      let y = x - k;
      while (x < n && y < m && eq(a[x], b[y])) { x++; y++; }
      V[ki] = x;
      if (x >= n && y >= m) break outer;
    }
  }

  const ops: EditOp[] = [];
  let x = n;
  let y = m;

  for (let d = trace.length - 1; d > 0; d--) {
    const prevV = trace[d - 1];
    const k = x - y;
    const ki = k + max;

    let prevK: number;
    if (k === -d || (k !== d && prevV[ki - 1] < prevV[ki + 1])) {
      prevK = k + 1;
    } else {
      prevK = k - 1;
    }

    const prevX = prevV[prevK + max];
    const prevY = prevX - prevK;

    while (x > prevX + (prevK === k - 1 ? 1 : 0) && y > prevY + (prevK === k + 1 ? 1 : 0)) {
      x--; y--;
      ops.push({ op: 'equal', aIdx: x, bIdx: y });
    }

    if (d > 0) {
      if (prevK === k - 1) {
        ops.push({ op: 'delete', aIdx: prevX, bIdx: prevY });
      } else {
        ops.push({ op: 'insert', aIdx: prevX, bIdx: prevY });
      }
      x = prevX;
      y = prevY;
    }
  }

  while (x > 0 && y > 0) { x--; y--; ops.push({ op: 'equal', aIdx: x, bIdx: y }); }

  return ops.reverse();
}

// ── Character-level diff ─────────────────────────────────────────────────────

function charDiff(a: string, b: string): { aSpans: CharSpan[]; bSpans: CharSpan[] } {
  const aChars = [...a];
  const bChars = [...b];
  const script = myersDiff(aChars, bChars);

  const aSpans: CharSpan[] = [];
  const bSpans: CharSpan[] = [];

  const pushA = (ch: string, changed: boolean) => {
    const last = aSpans[aSpans.length - 1];
    if (last && last.changed === changed) last.text += ch;
    else aSpans.push({ text: ch, changed });
  };
  const pushB = (ch: string, changed: boolean) => {
    const last = bSpans[bSpans.length - 1];
    if (last && last.changed === changed) last.text += ch;
    else bSpans.push({ text: ch, changed });
  };

  for (const op of script) {
    if (op.op === 'equal') {
      pushA(aChars[op.aIdx], false);
      pushB(bChars[op.bIdx], false);
    } else if (op.op === 'delete') {
      pushA(aChars[op.aIdx], true);
    } else {
      pushB(bChars[op.bIdx], true);
    }
  }

  return { aSpans, bSpans };
}

// ── Main computeDiff ─────────────────────────────────────────────────────────

export function computeDiff(original: string, modified: string): DiffResult {
  if (original === '' && modified === '') {
    return { lines: [], addedCount: 0, removedCount: 0 };
  }

  const origLines = original === '' ? [] : original.split('\n');
  const modLines  = modified  === '' ? [] : modified.split('\n');

  const script = myersDiff(origLines, modLines);

  const lines: DiffLine[] = [];
  let origCounter = 1;
  let modCounter  = 1;
  let addedCount  = 0;
  let removedCount = 0;

  let i = 0;
  while (i < script.length) {
    const op = script[i];

    if (op.op === 'equal') {
      lines.push({
        type: 'unchanged',
        text: origLines[op.aIdx],
        origLineNo: origCounter++,
        modLineNo:  modCounter++,
      });
      i++;
      continue;
    }

    // Collect the full contiguous hunk of deletes + inserts
    const deletedTexts: string[] = [];
    const insertedTexts: string[] = [];

    while (i < script.length && script[i].op !== 'equal') {
      if (script[i].op === 'delete') deletedTexts.push(origLines[script[i].aIdx]);
      else                           insertedTexts.push(modLines[script[i].bIdx]);
      i++;
    }

    // ── Pair lines for character-level diff ──────────────────────────────
    // Compute spans for all pairs up-front, BEFORE pushing to lines[].
    // This avoids the back-reference index bug in the previous version.
    const pairCount = Math.min(deletedTexts.length, insertedTexts.length);

    // Precompute all span pairs
    const spanPairs: Array<{ aSpans: CharSpan[]; bSpans: CharSpan[] }> = [];
    for (let p = 0; p < pairCount; p++) {
      spanPairs.push(charDiff(deletedTexts[p], insertedTexts[p]));
    }

    // Emit removed lines (paired first, then unpaired)
    for (let p = 0; p < deletedTexts.length; p++) {
      const pair = spanPairs[p]; // undefined for unpaired
      lines.push({
        type: 'removed',
        text: deletedTexts[p],
        origLineNo: origCounter++,
        modLineNo: null,
        origCharSpans: pair?.aSpans,
        modCharSpans:  pair?.bSpans,
      });
      removedCount++;
    }

    // Emit added lines (paired first, then unpaired)
    for (let p = 0; p < insertedTexts.length; p++) {
      const pair = spanPairs[p]; // undefined for unpaired
      lines.push({
        type: 'added',
        text: insertedTexts[p],
        origLineNo: null,
        modLineNo: modCounter++,
        origCharSpans: pair?.aSpans,
        modCharSpans:  pair?.bSpans,
      });
      addedCount++;
    }
  }

  return { lines, addedCount, removedCount };
}

// ── applyPatch - used for round-trip testing ─────────────────────────────────

export function applyPatch(original: string, result: DiffResult): string {
  return result.lines
    .filter(l => l.type !== 'removed')
    .map(l => l.text)
    .join('\n');
}

// ── toUnifiedDiff ────────────────────────────────────────────────────────────

export function toUnifiedDiff(
  original: string,
  modified: string,
  result: DiffResult
): string {
  if (result.lines.length === 0) return '';

  const CONTEXT = 3;
  const lines = result.lines;

  const changedIndices = new Set<number>();
  lines.forEach((l, idx) => { if (l.type !== 'unchanged') changedIndices.add(idx); });
  if (changedIndices.size === 0) return '';

  const inContext = new Set<number>();
  changedIndices.forEach(ci => {
    for (let c = Math.max(0, ci - CONTEXT); c <= Math.min(lines.length - 1, ci + CONTEXT); c++) {
      inContext.add(c);
    }
  });

  let output = '--- a\n+++ b\n';
  let rangeLines: string[] = [];
  let origLine = 1;
  let modLine  = 1;
  let prevInContext = false;

  const flushRange = () => {
    if (rangeLines.length === 0) return;
    output += rangeLines.join('\n') + '\n';
    rangeLines = [];
  };

  for (let idx = 0; idx < lines.length; idx++) {
    const inCtx = inContext.has(idx);
    const line  = lines[idx];

    if (!inCtx) {
      if (prevInContext) flushRange();
      if (line.origLineNo !== null) origLine++;
      if (line.modLineNo  !== null) modLine++;
      prevInContext = false;
      continue;
    }

    if (!prevInContext) {
      const hunkOrigStart = line.origLineNo ?? origLine;
      const hunkModStart  = line.modLineNo  ?? modLine;
      rangeLines.push(`@@ -${hunkOrigStart} +${hunkModStart} @@`);
    }

    if (line.type === 'removed') {
      rangeLines.push(`-${line.text}`); origLine++;
    } else if (line.type === 'added') {
      rangeLines.push(`+${line.text}`); modLine++;
    } else {
      rangeLines.push(` ${line.text}`); origLine++; modLine++;
    }

    prevInContext = true;
  }

  flushRange();
  return output;
}
