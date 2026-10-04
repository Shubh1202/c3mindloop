/**
 * smartDiff.ts
 *
 * Orchestrates content detection → strategy selection → diff computation.
 * Returns a SmartDiffResult that extends DiffResult with detection metadata
 * and an optional semantic summary.
 */

import { computeDiff, type DiffResult, type DiffOptions } from './diffEngine';
import { detectContent, type DetectionResult, type ContentType } from './diffDetector';
import { jsonDiff, type JsonDiffSummary } from './diffStrategies/jsonStrategy';
import { csvDiff, type CsvDiffSummary } from './diffStrategies/csvStrategy';

// ── Extended result type ──────────────────────────────────────────────────────

export interface SmartDiffSummary {
  /** Short human-readable description, e.g. "2 changes (1 modified, 1 added)" */
  text: string;
  /** Individual counts */
  added: number;
  removed: number;
  modified: number;
}

export interface SmartDiffResult extends DiffResult {
  detection: DetectionResult;
  /** Present when a semantic summary is available (JSON, CSV, etc.) */
  smartSummary?: SmartDiffSummary;
  /** Raw JSON summary if JSON strategy was used */
  jsonSummary?: JsonDiffSummary;
  /** Raw CSV summary if CSV strategy was used */
  csvSummary?: CsvDiffSummary;
}

// ── Strategy dispatcher ───────────────────────────────────────────────────────

function applyStrategy(
  original: string,
  modified: string,
  type: ContentType,
  options?: DiffOptions,
): { result: DiffResult; jsonSummary?: JsonDiffSummary; csvSummary?: CsvDiffSummary } {
  switch (type) {
    case 'json': {
      const r = jsonDiff(original, modified);
      if (r) return { result: r, jsonSummary: r.jsonSummary };
      // Fall through to text diff if JSON parse fails
      break;
    }
    case 'csv': {
      const r = csvDiff(original, modified, ',');
      return { result: r, csvSummary: r.csvSummary };
    }
    case 'tsv': {
      const r = csvDiff(original, modified, '\t');
      return { result: r, csvSummary: r.csvSummary };
    }
    default:
      break;
  }
  // Generic text diff for all other types (YAML, XML, Markdown, code, plain text)
  return { result: computeDiff(original, modified, options) };
}

function buildSmartSummary(
  base: DiffResult,
  jsonSummary?: JsonDiffSummary,
  csvSummary?: CsvDiffSummary,
): SmartDiffSummary | undefined {
  if (jsonSummary) {
    const { added, removed, modified, total } = jsonSummary;
    if (total === 0) return undefined;
    const parts: string[] = [];
    if (modified) parts.push(`${modified} modified`);
    if (added)    parts.push(`${added} added`);
    if (removed)  parts.push(`${removed} removed`);
    return {
      text: `${total} ${total === 1 ? 'change' : 'changes'} (${parts.join(', ')})`,
      added,
      removed,
      modified,
    };
  }
  if (csvSummary) {
    const { addedRows, removedRows, modifiedCells, total } = csvSummary;
    if (total === 0) return undefined;
    const parts: string[] = [];
    if (modifiedCells) parts.push(`${modifiedCells} cell${modifiedCells > 1 ? 's' : ''} changed`);
    if (addedRows)     parts.push(`${addedRows} row${addedRows > 1 ? 's' : ''} added`);
    if (removedRows)   parts.push(`${removedRows} row${removedRows > 1 ? 's' : ''} removed`);
    return {
      text: parts.join(', '),
      added: addedRows,
      removed: removedRows,
      modified: modifiedCells,
    };
  }
  return undefined;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Smart diff - detects content type and applies the best comparison strategy.
 * Fully backward-compatible: the returned object is a valid DiffResult.
 *
 * @param original    Left-side text
 * @param modified    Right-side text
 * @param forceText   When true, skips detection and uses plain text diff (user override)
 * @param origExt     File extension hint for original (e.g. 'json')
 * @param modExt      File extension hint for modified
 * @param options     Diff options (ignoreWhitespace, ignoreCase, granularity)
 */
export function smartDiff(
  original: string,
  modified: string,
  forceText = false,
  origExt?: string,
  modExt?: string,
  options?: DiffOptions,
): SmartDiffResult {
  if (original === '' && modified === '') {
    const detection = detectContent('', '', origExt, modExt);
    return { lines: [], addedCount: 0, removedCount: 0, unchangedCount: 0, detection };
  }

  const detection = detectContent(original, modified, origExt, modExt);

  const effectiveType: ContentType = forceText ? 'text' : detection.type;

  const { result, jsonSummary, csvSummary } = applyStrategy(original, modified, effectiveType, options);

  const smartSummary = buildSmartSummary(result, jsonSummary, csvSummary);

  return {
    ...result,
    detection: forceText
      ? { ...detection, type: 'text', label: 'Plain Text', modeLabel: 'Line + Character', mode: 'text' }
      : detection,
    smartSummary,
    jsonSummary,
    csvSummary,
  };
}
