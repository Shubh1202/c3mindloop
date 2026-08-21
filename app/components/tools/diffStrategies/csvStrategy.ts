/**
 * csvStrategy.ts
 *
 * Structural CSV/TSV comparison.
 * Parses both sides into rows/cells, compares structurally,
 * then re-serializes to produce a DiffResult the existing UI can render.
 */

import { computeDiff, type DiffResult } from '../diffEngine';

export interface CsvDiffSummary {
  addedRows: number;
  removedRows: number;
  modifiedCells: number;
  total: number;
}

function parseCsv(s: string, delimiter: string): string[][] {
  return s.trim().split('\n').map(line =>
    line.split(delimiter).map(cell => cell.trim().replace(/^["']|["']$/g, ''))
  );
}

export interface CsvStrategyResult extends DiffResult {
  csvSummary: CsvDiffSummary;
}

export function csvDiff(
  original: string,
  modified: string,
  delimiter = ',',
): CsvStrategyResult {
  const origRows = parseCsv(original, delimiter);
  const modRows  = parseCsv(modified, delimiter);

  // Re-normalize both to consistent delimiter + quoting, then text-diff
  const normalize = (rows: string[][]): string =>
    rows.map(row => row.map(cell => (cell.includes(delimiter) ? `"${cell}"` : cell)).join(delimiter)).join('\n');

  const origNorm = normalize(origRows);
  const modNorm  = normalize(modRows);

  const result = computeDiff(origNorm, modNorm);

  let addedRows = 0, removedRows = 0, modifiedCells = 0;
  const maxRows = Math.max(origRows.length, modRows.length);
  for (let i = 0; i < maxRows; i++) {
    if (!origRows[i]) { addedRows++; continue; }
    if (!modRows[i])  { removedRows++; continue; }
    const maxCols = Math.max(origRows[i].length, modRows[i].length);
    for (let j = 0; j < maxCols; j++) {
      if ((origRows[i][j] ?? '') !== (modRows[i][j] ?? '')) modifiedCells++;
    }
  }

  return {
    ...result,
    csvSummary: { addedRows, removedRows, modifiedCells, total: addedRows + removedRows + modifiedCells },
  };
}
