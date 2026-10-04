// diffEngine.ts - Industry-Standard Diff Engine powered by 'diff' (jsdiff).
// Pure TypeScript engine: 100% client-side, zero server dependencies.

import * as Diff from 'diff';

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
   * Inline highlight spans for the REMOVED side of a modified pair.
   */
  origCharSpans?: CharSpan[];
  /**
   * Inline highlight spans for the ADDED side of a modified pair.
   */
  modCharSpans?: CharSpan[];
}

export interface DiffResult {
  lines: DiffLine[];
  addedCount: number;
  removedCount: number;
  unchangedCount?: number;
}

export interface DiffOptions {
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
  granularity?: 'chars' | 'words' | 'lines';
}

// ── Inline span highlighter (Word or Char level) ──────────────────────────────
export function computeInlineSpans(
  a: string,
  b: string,
  granularity: 'chars' | 'words' | 'lines' = 'words',
  ignoreCase = false
): { aSpans: CharSpan[]; bSpans: CharSpan[] } {
  if (granularity === 'lines' || a === b) {
    return {
      aSpans: [{ text: a, changed: false }],
      bSpans: [{ text: b, changed: false }],
    };
  }

  const diffParts: Diff.Change[] =
    (granularity === 'chars'
      ? Diff.diffChars(a, b, { ignoreCase })
      : Diff.diffWordsWithSpace(a, b, { ignoreCase })) ?? [];

  const aSpans: CharSpan[] = [];
  const bSpans: CharSpan[] = [];

  for (const part of diffParts) {
    if (part.added) {
      bSpans.push({ text: part.value, changed: true });
    } else if (part.removed) {
      aSpans.push({ text: part.value, changed: true });
    } else {
      aSpans.push({ text: part.value, changed: false });
      bSpans.push({ text: part.value, changed: false });
    }
  }

  return { aSpans, bSpans };
}

// ── Main computeDiff ─────────────────────────────────────────────────────────
export function computeDiff(
  original: string,
  modified: string,
  options: DiffOptions = {}
): DiffResult {
  const { ignoreWhitespace = false, ignoreCase = false, granularity = 'words' } = options;

  if (original === '' && modified === '') {
    return { lines: [], addedCount: 0, removedCount: 0, unchangedCount: 0 };
  }

  // Use jsdiff line-based diffing with industry-standard options
  const diffChanges: Diff.Change[] = Diff.diffLines(original, modified, {
    ignoreWhitespace,
  }) ?? [];

  const lines: DiffLine[] = [];
  let origCounter = 1;
  let modCounter = 1;
  let addedCount = 0;
  let removedCount = 0;
  let unchangedCount = 0;

  let i = 0;
  while (i < diffChanges.length) {
    const change = diffChanges[i];

    // Split value into lines, stripping the single trailing newline from diffLines chunk if present
    let rawLines = change.value.split('\n');
    if (rawLines.length > 0 && rawLines[rawLines.length - 1] === '') {
      rawLines.pop();
    }

    if (!change.added && !change.removed) {
      // Unchanged lines
      for (const text of rawLines) {
        lines.push({
          type: 'unchanged',
          text,
          origLineNo: origCounter++,
          modLineNo: modCounter++,
        });
        unchangedCount++;
      }
      i++;
      continue;
    }

    // Contiguous hunk of added/removed changes
    const deletedTexts: string[] = [];
    const insertedTexts: string[] = [];

    while (i < diffChanges.length && (diffChanges[i].added || diffChanges[i].removed)) {
      const currentChange = diffChanges[i];
      let hunkLines = currentChange.value.split('\n');
      if (hunkLines.length > 0 && hunkLines[hunkLines.length - 1] === '') {
        hunkLines.pop();
      }

      if (currentChange.removed) {
        deletedTexts.push(...hunkLines);
      } else if (currentChange.added) {
        insertedTexts.push(...hunkLines);
      }
      i++;
    }

    // Pair corresponding lines for character/word-level highlight
    const pairCount = Math.min(deletedTexts.length, insertedTexts.length);
    const spanPairs: Array<{ aSpans: CharSpan[]; bSpans: CharSpan[] }> = [];

    for (let p = 0; p < pairCount; p++) {
      spanPairs.push(computeInlineSpans(deletedTexts[p], insertedTexts[p], granularity, ignoreCase));
    }

    // Emit removed lines
    for (let p = 0; p < deletedTexts.length; p++) {
      const pair = spanPairs[p];
      lines.push({
        type: 'removed',
        text: deletedTexts[p],
        origLineNo: origCounter++,
        modLineNo: null,
        origCharSpans: pair?.aSpans,
        modCharSpans: pair?.bSpans,
      });
      removedCount++;
    }

    // Emit added lines
    for (let p = 0; p < insertedTexts.length; p++) {
      const pair = spanPairs[p];
      lines.push({
        type: 'added',
        text: insertedTexts[p],
        origLineNo: null,
        modLineNo: modCounter++,
        origCharSpans: pair?.aSpans,
        modCharSpans: pair?.bSpans,
      });
      addedCount++;
    }
  }

  return { lines, addedCount, removedCount, unchangedCount };
}

// ── Apply patch (for verification or merge) ──────────────────────────────────
export function applyPatch(original: string, result: DiffResult): string {
  return result.lines
    .filter((l) => l.type !== 'removed')
    .map((l) => l.text)
    .join('\n');
}

// ── Standard Unified Diff (.patch / .diff format) ────────────────────────────
export function toUnifiedDiff(
  original: string,
  modified: string,
  result?: DiffResult,
  origFileName = 'a/original',
  modFileName = 'b/modified'
): string {
  if (!original && !modified) return '';

  return Diff.createTwoFilesPatch(
    origFileName,
    modFileName,
    original,
    modified,
    '',
    '',
    { context: 3 }
  );
}
