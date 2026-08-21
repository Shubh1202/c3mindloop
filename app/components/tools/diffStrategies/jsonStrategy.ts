/**
 * jsonStrategy.ts
 *
 * Structural JSON comparison.
 * Parses both sides, compares the object trees recursively,
 * and produces a DiffResult whose lines correspond to the
 * formatted (2-space indented) JSON so the existing Split/Inline
 * UI can render them without modification.
 *
 * Key property: formatting-only differences do NOT appear as changes.
 * Only semantic differences (added/removed/changed keys or values) appear.
 */

import { computeDiff, type DiffResult, type DiffLine } from '../diffEngine';

// ── JSON path helpers ────────────────────────────────────────────────────────

type JsonPath = (string | number)[];

function pathString(path: JsonPath): string {
  if (path.length === 0) return '$';
  return '$' + path.map(p => (typeof p === 'number' ? `[${p}]` : `.${p}`)).join('');
}

// ── Semantic diff model ───────────────────────────────────────────────────────

type ChangeKind = 'modified' | 'added' | 'removed';

interface SemanticChange {
  kind: ChangeKind;
  path: JsonPath;
  origValue?: unknown;
  modValue?: unknown;
}

// ── Deep structural comparison ────────────────────────────────────────────────

function compareValues(
  orig: unknown,
  mod: unknown,
  path: JsonPath,
  changes: SemanticChange[],
): void {
  // Both null / primitives
  if (orig === mod) return;

  const origNull = orig === null;
  const modNull  = mod  === null;
  const origType = origNull ? 'null' : typeof orig;
  const modType  = modNull  ? 'null' : typeof mod;

  // Different types or primitives that differ
  if (origType !== modType || origType !== 'object') {
    changes.push({ kind: 'modified', path, origValue: orig, modValue: mod });
    return;
  }

  // Both are non-null objects -  check array vs object
  if (Array.isArray(orig) !== Array.isArray(mod)) {
    changes.push({ kind: 'modified', path, origValue: orig, modValue: mod });
    return;
  }

  if (Array.isArray(orig) && Array.isArray(mod)) {
    compareArrays(orig, mod, path, changes);
    return;
  }

  // Both plain objects
  compareObjects(
    orig as Record<string, unknown>,
    mod  as Record<string, unknown>,
    path,
    changes,
  );
}

function compareObjects(
  orig: Record<string, unknown>,
  mod:  Record<string, unknown>,
  path: JsonPath,
  changes: SemanticChange[],
): void {
  const allKeys = new Set([...Object.keys(orig), ...Object.keys(mod)]);
  for (const key of allKeys) {
    const childPath: JsonPath = [...path, key];
    if (!(key in orig)) {
      changes.push({ kind: 'added', path: childPath, modValue: mod[key] });
    } else if (!(key in mod)) {
      changes.push({ kind: 'removed', path: childPath, origValue: orig[key] });
    } else {
      compareValues(orig[key], mod[key], childPath, changes);
    }
  }
}

function compareArrays(
  orig: unknown[],
  mod:  unknown[],
  path: JsonPath,
  changes: SemanticChange[],
): void {
  const len = Math.max(orig.length, mod.length);
  for (let i = 0; i < len; i++) {
    const childPath: JsonPath = [...path, i];
    if (i >= orig.length) {
      changes.push({ kind: 'added', path: childPath, modValue: mod[i] });
    } else if (i >= mod.length) {
      changes.push({ kind: 'removed', path: childPath, origValue: orig[i] });
    } else {
      compareValues(orig[i], mod[i], childPath, changes);
    }
  }
}

// ── Diff summary ─────────────────────────────────────────────────────────────

export interface JsonDiffSummary {
  added: number;
  removed: number;
  modified: number;
  total: number;
  changes: Array<{ label: string; kind: ChangeKind; from?: string; to?: string }>;
}

function summarize(changes: SemanticChange[]): JsonDiffSummary {
  let added = 0, removed = 0, modified = 0;
  const details: JsonDiffSummary['changes'] = [];

  for (const c of changes) {
    const label = pathString(c.path);
    if (c.kind === 'added')    { added++;    details.push({ label, kind: 'added',    to:   JSON.stringify(c.modValue)  }); }
    if (c.kind === 'removed')  { removed++;  details.push({ label, kind: 'removed',  from: JSON.stringify(c.origValue) }); }
    if (c.kind === 'modified') { modified++; details.push({ label, kind: 'modified', from: JSON.stringify(c.origValue), to: JSON.stringify(c.modValue) }); }
  }

  return { added, removed, modified, total: added + removed + modified, changes: details };
}

// ── Build DiffResult from formatted lines ─────────────────────────────────────
//
// Strategy:
// 1. Format both parsed objects with consistent 2-space indentation.
// 2. Walk both formatted outputs line-by-line.
// 3. For each line, determine if the path it belongs to was changed.
// 4. Emit DiffLine accordingly.
//
// This means we get EXACT line mapping from the re-formatted output,
// which the existing Split/Inline UI can render perfectly.

function formatJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

// Naive but effective: find all line indices in formatted JSON that carry
// a changed path (matched by key name + value presence).
// For simplicity we re-format and mark lines that contain changed paths.

function buildDiffLines(
  origParsed: unknown,
  modParsed:  unknown,
): { lines: DiffLine[]; addedCount: number; removedCount: number } {
  const origFormatted = formatJson(origParsed);
  const modFormatted  = formatJson(modParsed);

  // Import computeDiff -  used to diff the two re-formatted JSON strings.
  // This is the correct approach: normalise both sides to the same formatting
  // so only semantic differences remain, then text-diff the normalised forms.
  const result = computeDiff(origFormatted, modFormatted);

  return {
    lines:        result.lines,
    addedCount:   result.addedCount,
    removedCount: result.removedCount,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface JsonStrategyResult extends DiffResult {
  jsonSummary: JsonDiffSummary;
}

/**
 * Compare two JSON strings structurally.
 * Returns a DiffResult (compatible with existing UI) plus a semantic summary.
 * If either string is invalid JSON, returns null (caller should fall back to text diff).
 */
export function jsonDiff(original: string, modified: string): JsonStrategyResult | null {
  let origParsed: unknown;
  let modParsed:  unknown;

  try { origParsed = JSON.parse(original.trim()); } catch { return null; }
  try { modParsed  = JSON.parse(modified.trim());  } catch { return null; }

  const changes: SemanticChange[] = [];
  compareValues(origParsed, modParsed, [], changes);

  const summary = summarize(changes);
  const { lines, addedCount, removedCount } = buildDiffLines(origParsed, modParsed);

  return {
    lines,
    addedCount,
    removedCount,
    jsonSummary: summary,
  };
}
