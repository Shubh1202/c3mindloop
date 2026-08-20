/**
 * languageDetector.ts
 *
 * Pure, side-effect-free utilities for inferring programming language
 * from a file extension or from heuristic signals in source code.
 */

import type { SupportedLanguage } from './complexityTypes';
import { EXTENSION_LANGUAGE_MAP } from './complexityConstants';

// ---------------------------------------------------------------------------
// detectFromExtension
// ---------------------------------------------------------------------------

/**
 * Extracts the file extension from `filename` (case-insensitive) and returns
 * the matching SupportedLanguage from EXTENSION_LANGUAGE_MAP, or `null` if
 * the extension is absent or unrecognised.
 *
 * Examples:
 *   "foo.ts"        → 'typescript'
 *   "foo.test.ts"   → 'typescript'  (uses the last dot segment)
 *   "Makefile"      → null
 *   "SCRIPT.PY"     → 'python'
 */
export function detectFromExtension(filename: string): SupportedLanguage | null {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === filename.length - 1) {
    // No extension or trailing dot only
    return null;
  }
  const ext = filename.slice(lastDot).toLowerCase();
  return EXTENSION_LANGUAGE_MAP[ext] ?? null;
}

// ---------------------------------------------------------------------------
// detectFromCode — signal tables
// ---------------------------------------------------------------------------

type SignalTable = Record<SupportedLanguage, string[]>;

/**
 * Plain-string signals searched via String.prototype.includes (fast, no regex
 * overhead for the common case). Each match in the code adds +1 to the score
 * for that language.
 */
const SIGNALS: SignalTable = {
  python: [
    'def ',
    'elif ',
    'import ',
    'print(',
    'self.',
    '__init__',
  ],
  go: [
    'func ',
    'package ',
    'import "',
    ':= ',
    'go func',
    'goroutine',
    'chan ',
  ],
  java: [
    'public class',
    'private ',
    'protected ',
    'void ',
    'System.out',
    '@Override',
    'throws ',
    'extends ',
    'implements ',
  ],
  c: [
    '#include <',
    '#define ',
    'printf(',
    'malloc(',
    'free(',
    'int main(',
  ],
  cpp: [
    '#include <',
    'class ',
    'namespace ',
    '::',
    'cout <<',
    'cin >>',
    'template<',
    'std::',
  ],
  typescript: [
    ': string',
    ': number',
    ': boolean',
    'interface ',
    'type ',
    ': void',
    '<T>',
    'as ',
    ': any',
  ],
  javascript: [
    'const ',
    'let ',
    'var ',
    'function ',
    '=>',
    'require(',
    'module.exports',
    'console.log',
    'document.',
    'window.',
  ],
};

/**
 * Signals whose presence should subtract from the C score (they indicate C++
 * rather than plain C).
 */
const C_PENALTY_SIGNALS: string[] = ['class ', 'namespace ', '::'];

// ---------------------------------------------------------------------------
// detectFromCode
// ---------------------------------------------------------------------------

/**
 * Scores heuristic signals per language and returns the language with the
 * highest score, along with an `assumed` flag.
 *
 * - `assumed` is `true` only when every language scored 0 (pure fallback).
 * - On a tie the winner is always JavaScript.
 */
export function detectFromCode(code: string): { language: SupportedLanguage; assumed: boolean } {
  const languages = Object.keys(SIGNALS) as SupportedLanguage[];

  // Count raw occurrences of each signal string in the code.
  const countOccurrences = (haystack: string, needle: string): number => {
    let count = 0;
    let pos = 0;
    while ((pos = haystack.indexOf(needle, pos)) !== -1) {
      count++;
      pos += needle.length;
    }
    return count;
  };

  // Build a score map.
  const scores: Record<SupportedLanguage, number> = {} as Record<SupportedLanguage, number>;

  for (const lang of languages) {
    let score = 0;
    for (const signal of SIGNALS[lang]) {
      score += countOccurrences(code, signal);
    }

    // Penalise C score if C++-specific tokens are present.
    if (lang === 'c') {
      for (const penaltySignal of C_PENALTY_SIGNALS) {
        score -= countOccurrences(code, penaltySignal);
      }
      if (score < 0) score = 0;
    }

    scores[lang] = score;
  }

  // Check if any signal fired at all.
  const totalScore = languages.reduce((sum, lang) => sum + scores[lang], 0);
  if (totalScore === 0) {
    return { language: 'javascript', assumed: true };
  }

  // Find the maximum score; on a tie JavaScript wins.
  let winner: SupportedLanguage = 'javascript';
  let maxScore = -1;

  for (const lang of languages) {
    const s = scores[lang];
    // Strictly greater — ties keep whatever winner we already have.
    // We seed winner = 'javascript' so ties resolve to JavaScript automatically.
    if (s > maxScore) {
      maxScore = s;
      winner = lang;
    }
  }

  return { language: winner, assumed: false };
}
