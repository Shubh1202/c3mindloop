// NOTE: Regex/heuristic analysis -  not a full AST parser.
// High accuracy for standard patterns; edge cases (template literals with braces,
// complex TypeScript generics) may produce minor inaccuracies.

import type {
  SupportedLanguage,
  RiskLevel,
  FunctionResult,
  AnalysisResult,
  RefactorSuggestion,
} from './complexityTypes';

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface FunctionBoundary {
  name: string;
  startLine: number; // 1-indexed
  endLine: number;   // 1-indexed
}

// ---------------------------------------------------------------------------
// String stripping utility
// ---------------------------------------------------------------------------

/**
 * Strip string literals from a line to avoid counting keywords inside strings.
 * Handles single-quoted, double-quoted, and template literal strings.
 */
function stripStrings(line: string): string {
  return line
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/`(?:[^`\\]|\\.)*`/g, '``');
}

// ---------------------------------------------------------------------------
// Brace-counting helpers
// ---------------------------------------------------------------------------

/**
 * Find the 0-indexed line number of the closing brace that matches the opening
 * brace found at or after (openLineIdx, openColIdx).
 */
function findClosingBrace(
  lines: string[],
  openLineIdx: number,
  openColIdx: number
): number {
  let depth = 0;
  for (let i = openLineIdx; i < lines.length; i++) {
    const start = i === openLineIdx ? openColIdx : 0;
    for (let j = start; j < lines[i].length; j++) {
      if (lines[i][j] === '{') depth++;
      else if (lines[i][j] === '}') {
        depth--;
        if (depth === 0) return i;
      }
    }
  }
  return lines.length - 1; // fallback: end of file
}

/**
 * Starting from startLineIdx, scan forward until we find the first '{'.
 * Returns [lineIdx, colIdx] (0-indexed) or null if not found.
 */
function findOpenBrace(
  lines: string[],
  startLineIdx: number
): [number, number] | null {
  for (let i = startLineIdx; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
      if (line[j] === '{') return [i, j];
    }
    // Stop searching if we pass an empty line or reach another function-like line
    // (allow a couple of lines for opening brace)
    if (i > startLineIdx + 3) break;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Part 1: Function Detection -  JS/TS
// ---------------------------------------------------------------------------

function detectJsTs(lines: string[]): FunctionBoundary[] {
  const boundaries: FunctionBoundary[] = [];

  // Named function declaration: function foo( or async function foo(
  const namedFnDecl =
    /^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+(\w+)\s*[(<]/;

  // Named function expression: const/let/var foo = function( or async function(
  const namedFnExpr =
    /^\s*(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?function\s*[(*(<]/;

  // Named arrow function: const foo = (...) => ...
  const namedArrow =
    /^\s*(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(?[^=]*?\)?\s*=>/;

  // Getter/setter: get foo() / set foo(
  const getterSetter =
    /^\s*(?:(?:public|private|protected|static)\s+)*(?:get|set)\s+(\w+)\s*\(/;

  // Class method: methodName( { -  must not be a keyword line
  const classMethod =
    /^\s*(?:(?:public|private|protected|static|abstract|override|readonly|async)\s+)*(\w+)\s*\([^)]*\)\s*(?::\s*[\w<>\[\]|&,\s?]+)?\s*\{/;

  // Keywords that look like methods but aren't
  const keywords =
    /^\s*(?:if|else|for|while|switch|try|catch|finally|do|return|new)\b/;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const lineNum = i + 1; // 1-indexed
    let matchedName: string | null = null;
    let expressionBodyArrow = false;

    // 1. Named function declaration
    const m1 = namedFnDecl.exec(line);
    if (m1) matchedName = m1[1];

    // 2. Named function expression
    if (!matchedName) {
      const m2 = namedFnExpr.exec(line);
      if (m2) matchedName = m2[1];
    }

    // 3. Named arrow function
    if (!matchedName) {
      const m3 = namedArrow.exec(line);
      if (m3) {
        matchedName = m3[1];
        const arrowIdx = line.indexOf('=>');
        if (arrowIdx !== -1) {
          const afterArrow = line.slice(arrowIdx + 2).trim();
          if (!afterArrow.startsWith('{')) {
            expressionBodyArrow = true;
          }
        }
      }
    }

    // 4. Getter/setter
    if (!matchedName) {
      const m4 = getterSetter.exec(line);
      if (m4) matchedName = m4[1];
    }

    // 5. Class method (only if not a keyword line and not already matched)
    if (!matchedName && !keywords.test(line)) {
      const m5 = classMethod.exec(line);
      if (m5 && !namedFnDecl.test(line) && !namedFnExpr.test(line)) {
        matchedName = m5[1];
      }
    }

    if (matchedName) {
      if (expressionBodyArrow) {
        // Single-line expression arrow: spans exactly one line
        boundaries.push({ name: matchedName, startLine: lineNum, endLine: lineNum });
        i++;
        continue;
      }

      // Find the opening brace (may be on same line or next line)
      const bracePos = findOpenBrace(lines, i);
      if (bracePos) {
        const [openLineIdx, openColIdx] = bracePos;
        const closingLineIdx = findClosingBrace(lines, openLineIdx, openColIdx);
        boundaries.push({
          name: matchedName,
          startLine: lineNum,
          endLine: closingLineIdx + 1, // convert to 1-indexed
        });
        i = closingLineIdx + 1;
        continue;
      }
    }

    i++;
  }

  return boundaries;
}

// ---------------------------------------------------------------------------
// Part 1: Function Detection -  Python (indentation-based)
// ---------------------------------------------------------------------------

function detectPython(lines: string[]): FunctionBoundary[] {
  const boundaries: FunctionBoundary[] = [];
  const defPat = /^(\s*)def\s+(\w+)\s*\(/;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const m = defPat.exec(line);

    if (m) {
      const baseIndent = m[1].length;
      const name = m[2];
      const startLine = i + 1; // 1-indexed
      let endLine = startLine;

      let j = i + 1;
      while (j < lines.length) {
        const nextLine = lines[j];
        const trimmed = nextLine.trimStart();

        // Skip blank lines and comments when determining end
        if (trimmed === '' || trimmed.startsWith('#')) {
          j++;
          continue;
        }

        const indent = nextLine.length - trimmed.length;
        if (indent <= baseIndent) {
          // Back to same or less indentation -  function ended on previous line
          endLine = j; // 1-indexed line number of last body line
          break;
        }

        endLine = j + 1; // 1-indexed
        j++;
      }

      if (j >= lines.length) {
        endLine = lines.length;
      }

      boundaries.push({ name, startLine, endLine });
    }

    i++;
  }

  return boundaries;
}

// ---------------------------------------------------------------------------
// Part 1: Function Detection -  Java
// ---------------------------------------------------------------------------

function detectJava(lines: string[]): FunctionBoundary[] {
  const boundaries: FunctionBoundary[] = [];

  // Skip control-flow keywords
  const skipPat =
    /^\s*(?:if|else|for|while|switch|try|catch|finally|do|class|interface|enum|new)\b/;

  // Constructor: public/private/protected ClassName(
  const constructorPat =
    /^\s*(?:public|private|protected)\s+([A-Z]\w*)\s*\(/;

  // Method: optional modifiers + return type + methodName(
  const methodPat =
    /^\s*(?:(?:public|private|protected|static|final|abstract|synchronized|native|strictfp|default|override)\s+)*(?:[\w<>\[\].,?\s]+\s+)?(\w+)\s*\([^;]*$/;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (skipPat.test(line)) {
      i++;
      continue;
    }

    let matchedName: string | null = null;

    const mc = constructorPat.exec(line);
    if (mc) matchedName = mc[1];

    if (!matchedName) {
      const mm = methodPat.exec(line);
      if (mm && line.includes('(') && !line.trim().endsWith(';')) {
        matchedName = mm[1];
      }
    }

    if (matchedName) {
      const bracePos = findOpenBrace(lines, i);
      if (bracePos) {
        const [openLineIdx, openColIdx] = bracePos;
        const closingLineIdx = findClosingBrace(lines, openLineIdx, openColIdx);
        boundaries.push({
          name: matchedName,
          startLine: i + 1,
          endLine: closingLineIdx + 1,
        });
        i = closingLineIdx + 1;
        continue;
      }
    }

    i++;
  }

  return boundaries;
}

// ---------------------------------------------------------------------------
// Part 1: Function Detection -  Go
// ---------------------------------------------------------------------------

function detectGo(lines: string[]): FunctionBoundary[] {
  const boundaries: FunctionBoundary[] = [];
  // func foo( or func (receiver Type) foo(
  const funcPat = /^\s*func\s+(?:\([^)]*\)\s+)?(\w+)\s*\(/;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const m = funcPat.exec(line);
    if (m) {
      const bracePos = findOpenBrace(lines, i);
      if (bracePos) {
        const [openLineIdx, openColIdx] = bracePos;
        const closingLineIdx = findClosingBrace(lines, openLineIdx, openColIdx);
        boundaries.push({
          name: m[1],
          startLine: i + 1,
          endLine: closingLineIdx + 1,
        });
        i = closingLineIdx + 1;
        continue;
      }
    }
    i++;
  }

  return boundaries;
}

// ---------------------------------------------------------------------------
// Part 1: Function Detection -  C / C++
// ---------------------------------------------------------------------------

function detectC(lines: string[]): FunctionBoundary[] {
  const boundaries: FunctionBoundary[] = [];

  // Skip lines that are obviously not function declarations
  const skipPat =
    /^\s*(?:if|else|for|while|switch|do|return|case|break|continue|#|\/\/|\/\*|\*)/;

  // C/C++ function: [modifiers] returnType [Class::]name(
  const funcPat =
    /^\s*(?:(?:static|inline|extern|virtual|explicit|constexpr|override|const)\s+)*[\w:*&<>\[\]\s]+\s+(?:(\w+)::)?(\w+)\s*\([^;]*$/;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (skipPat.test(line) || line.trim() === '' || line.trim().endsWith(';')) {
      i++;
      continue;
    }

    const m = funcPat.exec(line);
    if (m && line.includes('(')) {
      const className = m[1];
      const fnName = m[2];
      const name = className ? `${className}::${fnName}` : fnName;

      const bracePos = findOpenBrace(lines, i);
      if (bracePos) {
        const [openLineIdx, openColIdx] = bracePos;
        const closingLineIdx = findClosingBrace(lines, openLineIdx, openColIdx);
        boundaries.push({
          name,
          startLine: i + 1,
          endLine: closingLineIdx + 1,
        });
        i = closingLineIdx + 1;
        continue;
      }
    }

    i++;
  }

  return boundaries;
}

// ---------------------------------------------------------------------------
// Part 1: Dispatch
// ---------------------------------------------------------------------------

function detectFunctions(lines: string[], language: SupportedLanguage): FunctionBoundary[] {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return detectJsTs(lines);
    case 'python':
      return detectPython(lines);
    case 'java':
      return detectJava(lines);
    case 'go':
      return detectGo(lines);
    case 'c':
    case 'cpp':
      return detectC(lines);
  }
}

// ---------------------------------------------------------------------------
// Part 2: Cyclomatic Complexity
// ---------------------------------------------------------------------------

/**
 * Count occurrences of a whole-word keyword in a cleaned line.
 */
function countKeyword(line: string, keyword: string): number {
  const re = new RegExp(`\\b${keyword}\\b`, 'g');
  return (line.match(re) ?? []).length;
}

/**
 * Count ternary `?` operators, excluding optional chaining `?.`,
 * nullish coalescing `??`, and TypeScript type-annotation `?:`.
 */
function countTernary(line: string, language: SupportedLanguage): number {
  // Remove ?. (optional chaining) and ?? (nullish coalescing) first
  let cleaned = line.replace(/\?\./g, '__OC__').replace(/\?\?/g, '__NC__');

  if (language === 'typescript') {
    // Remove ?: in type positions: word?: type
    cleaned = cleaned.replace(/\w\?:/g, '');
    // Remove remaining standalone ?:
    cleaned = cleaned.replace(/\?:/g, '');
  }

  return (cleaned.match(/\?/g) ?? []).length;
}

/**
 * Count cyclomatic complexity increments on a single line.
 */
function cyclomaticIncrementsOnLine(line: string, language: SupportedLanguage): number {
  const cleaned = stripStrings(line);
  let count = 0;

  // Each `if` (includes else-if -  both count as branch points)
  count += countKeyword(cleaned, 'if');

  // Python elif (not caught by `if` above since it's a different word)
  if (language === 'python') {
    count += countKeyword(cleaned, 'elif');
  }

  count += countKeyword(cleaned, 'for');
  count += countKeyword(cleaned, 'while');
  count += countKeyword(cleaned, 'do');

  // case label: `case X:`
  count += (cleaned.match(/\bcase\b[^:]*:/g) ?? []).length;

  count += countKeyword(cleaned, 'catch');

  // Logical operators
  count += (cleaned.match(/&&/g) ?? []).length;
  count += (cleaned.match(/\|\|/g) ?? []).length;

  // Ternary
  count += countTernary(cleaned, language);

  return count;
}

// ---------------------------------------------------------------------------
// Part 3: Cognitive Complexity
// ---------------------------------------------------------------------------

/**
 * Count "runs" of logical operators (&&, ||) on a line.
 * Each uninterrupted sequence of the same operator = 1 run.
 * Operator type changes = new run.
 * Example: a && b && c → 1 run; a && b || c → 2 runs.
 */
function countLogicalSequences(line: string): number {
  const operators: string[] = [];
  const opPattern = /&&|\|\|/g;
  let match: RegExpExecArray | null;

  while ((match = opPattern.exec(line)) !== null) {
    operators.push(match[0]);
  }

  if (operators.length === 0) return 0;

  let runs = 1;
  for (let i = 1; i < operators.length; i++) {
    if (operators[i] !== operators[i - 1]) runs++;
  }

  return runs;
}

interface CognitiveState {
  score: number;
  nestingDepth: number;
}

/**
 * Process a single line for cognitive complexity.
 *
 * Rules:
 * - Structural constructs (if, else if/elif, for, while, do, switch, catch,
 *   break-label, continue-label, goto): score += 1 + nestingDepth, then depth++
 * - else: score += 1 (no depth change)
 * - Ternary `?`: score += 1 + nestingDepth, depth++ (treated same as structural)
 * - Logical operator runs: score += count of runs (no depth penalty)
 * - Closing `}` on a line (with no structural construct): depth--
 */
function processCognitiveLine(
  line: string,
  state: CognitiveState,
  language: SupportedLanguage
): CognitiveState {
  const cleaned = stripStrings(line);
  let { score, nestingDepth } = state;

  let structuralOpened = 0;
  let hasElse = false;

  // ---- else if / elif (counts as structural, single +1+depth) ----
  if (/\belse\s+if\b/.test(cleaned)) {
    score += 1 + nestingDepth;
    nestingDepth++;
    structuralOpened++;
  } else if (language === 'python' && /\belif\b/.test(cleaned)) {
    score += 1 + nestingDepth;
    nestingDepth++;
    structuralOpened++;
  } else {
    // ---- standalone else (no nesting) ----
    if (/\belse\b/.test(cleaned)) {
      score += 1;
      hasElse = true;
    }

    // ---- standalone if (not part of else if) ----
    const ifCount = (cleaned.match(/\bif\b/g) ?? []).length;
    for (let n = 0; n < ifCount; n++) {
      score += 1 + nestingDepth;
      nestingDepth++;
      structuralOpened++;
    }
  }

  // ---- for, while, do, switch, catch ----
  const nestingKeywords = ['for', 'while', 'do', 'switch', 'catch'] as const;
  for (const kw of nestingKeywords) {
    const kwCount = countKeyword(cleaned, kw);
    for (let n = 0; n < kwCount; n++) {
      score += 1 + nestingDepth;
      nestingDepth++;
      structuralOpened++;
    }
  }

  // ---- break/continue with label, goto ----
  if (
    /\bbreak\s+\w+/.test(cleaned) ||
    /\bcontinue\s+\w+/.test(cleaned) ||
    /\bgoto\b/.test(cleaned)
  ) {
    score += 1 + nestingDepth;
    // These don't open blocks so no depth increment
  }

  // ---- Ternary (treated as structural, adds depth) ----
  const ternaryCount = countTernary(cleaned, language);
  for (let t = 0; t < ternaryCount; t++) {
    score += 1 + nestingDepth;
    nestingDepth++;
    structuralOpened++;
  }

  // ---- Logical operator runs (flat, no nesting penalty) ----
  score += countLogicalSequences(cleaned);

  // ---- Closing braces reduce depth (only when no structural opened) ----
  // For simplified line-by-line tracking: each `}` on a line where we didn't
  // open a structural construct decrements depth
  if (structuralOpened === 0 && !hasElse) {
    const closingCount = (cleaned.match(/\}/g) ?? []).length;
    nestingDepth = Math.max(0, nestingDepth - closingCount);
  }

  return { score, nestingDepth };
}

// ---------------------------------------------------------------------------
// Part 4: Metric computation with nested-function exclusion
// ---------------------------------------------------------------------------

function buildExcludedSet(nestedFunctions: FunctionBoundary[]): Set<number> {
  const excluded = new Set<number>();
  for (const nested of nestedFunctions) {
    for (let l = nested.startLine; l <= nested.endLine; l++) {
      excluded.add(l);
    }
  }
  return excluded;
}

function computeCyclomatic(
  lines: string[],
  fn: FunctionBoundary,
  nestedFunctions: FunctionBoundary[],
  language: SupportedLanguage
): number {
  let count = 1; // base value
  const excluded = buildExcludedSet(nestedFunctions);

  for (let lineNum = fn.startLine; lineNum <= fn.endLine; lineNum++) {
    if (excluded.has(lineNum)) continue;
    count += cyclomaticIncrementsOnLine(lines[lineNum - 1], language);
  }

  return count;
}

function computeCognitive(
  lines: string[],
  fn: FunctionBoundary,
  nestedFunctions: FunctionBoundary[],
  language: SupportedLanguage
): number {
  const excluded = buildExcludedSet(nestedFunctions);
  let state: CognitiveState = { score: 0, nestingDepth: 0 };

  for (let lineNum = fn.startLine; lineNum <= fn.endLine; lineNum++) {
    if (excluded.has(lineNum)) continue;
    state = processCognitiveLine(lines[lineNum - 1], state, language);
  }

  return state.score;
}

function computeMaxNestingDepth(
  lines: string[],
  fn: FunctionBoundary,
  nestedFunctions: FunctionBoundary[],
  language: SupportedLanguage
): number {
  const excluded = buildExcludedSet(nestedFunctions);

  if (language === 'python') {
    let baseIndent = -1;
    let maxDepth = 0;
    for (let lineNum = fn.startLine; lineNum <= fn.endLine; lineNum++) {
      if (excluded.has(lineNum)) continue;
      const line = lines[lineNum - 1];
      const trimmed = line.trimStart();
      if (trimmed === '' || trimmed.startsWith('#')) continue;
      const indent = line.length - trimmed.length;
      if (baseIndent === -1) baseIndent = indent;
      const depth = Math.max(0, Math.floor((indent - baseIndent) / 4));
      if (depth > maxDepth) maxDepth = depth;
    }
    return maxDepth;
  }

  // Brace-based languages
  let depth = 0;
  let maxDepth = 0;
  let bodyStarted = false;
  let outerBraceCount = 0;

  for (let lineNum = fn.startLine; lineNum <= fn.endLine; lineNum++) {
    if (excluded.has(lineNum)) continue;
    const line = lines[lineNum - 1];

    for (let c = 0; c < line.length; c++) {
      if (line[c] === '{') {
        if (!bodyStarted) {
          bodyStarted = true;
          outerBraceCount = 1;
          depth = 0;
        } else {
          depth++;
          outerBraceCount++;
          if (depth > maxDepth) maxDepth = depth;
        }
      } else if (line[c] === '}' && outerBraceCount > 0) {
        outerBraceCount--;
        if (depth > 0) depth--;
      }
    }
  }

  return maxDepth;
}

function countIfBranches(
  lines: string[],
  fn: FunctionBoundary,
  nestedFunctions: FunctionBoundary[],
  language: SupportedLanguage
): number {
  const excluded = buildExcludedSet(nestedFunctions);
  let count = 0;

  for (let lineNum = fn.startLine; lineNum <= fn.endLine; lineNum++) {
    if (excluded.has(lineNum)) continue;
    const cleaned = stripStrings(lines[lineNum - 1]);
    count += countKeyword(cleaned, 'if');
    if (language === 'python') {
      count += countKeyword(cleaned, 'elif');
    }
  }

  return count;
}

function countTotalLogicalSequences(
  lines: string[],
  fn: FunctionBoundary,
  nestedFunctions: FunctionBoundary[]
): number {
  const excluded = buildExcludedSet(nestedFunctions);
  let total = 0;

  for (let lineNum = fn.startLine; lineNum <= fn.endLine; lineNum++) {
    if (excluded.has(lineNum)) continue;
    total += countLogicalSequences(stripStrings(lines[lineNum - 1]));
  }

  return total;
}

// ---------------------------------------------------------------------------
// Part 5: Risk Level
// ---------------------------------------------------------------------------

export function computeRiskLevel(cyclomatic: number, cognitive: number): RiskLevel {
  if (cyclomatic > 20 || cognitive > 24) return 'Critical';
  if (cyclomatic > 10 || cognitive > 15) return 'High';
  if (cyclomatic > 5  || cognitive > 7)  return 'Medium';
  return 'Low';
}

// ---------------------------------------------------------------------------
// Part 6: Refactor Suggestions
// ---------------------------------------------------------------------------

function generateSuggestions(
  cyclomatic: number,
  cognitive: number,
  riskLevel: RiskLevel,
  maxNestingDepth: number,
  ifBranchCount: number,
  logicalSequenceCount: number,
  lineCount: number
): RefactorSuggestion[] {
  if (riskLevel === 'Low') return [];

  const suggestions: RefactorSuggestion[] = [];

  if (maxNestingDepth > 3) {
    suggestions.push({
      text: 'Extract deeply nested blocks into named helper functions to reduce nesting depth.',
      scoreContribution: maxNestingDepth * 3,
    });
  }

  if (ifBranchCount > 4) {
    suggestions.push({
      text: 'Replace the long if/else chain with a lookup table or strategy pattern.',
      scoreContribution: ifBranchCount * 2,
    });
  }

  if (cognitive > 15 && logicalSequenceCount > 1) {
    suggestions.push({
      text: 'Extract complex boolean expressions into named predicate functions.',
      scoreContribution: logicalSequenceCount * 2,
    });
  }

  if (lineCount > 50) {
    suggestions.push({
      text: 'Split this function by responsibility -  it spans too many lines.',
      scoreContribution: Math.floor(lineCount / 10),
    });
  }

  if (cyclomatic > 10) {
    suggestions.push({
      text: 'Add unit tests to cover all independent paths -  this function has high cyclomatic complexity.',
      scoreContribution: cyclomatic,
    });
  }

  // Sort by scoreContribution descending
  suggestions.sort((a, b) => b.scoreContribution - a.scoreContribution);

  // If no specific rule triggered, add generic fallback
  if (suggestions.length === 0) {
    suggestions.push({
      text: 'Consider breaking this function into smaller, focused helper functions.',
      scoreContribution: 0,
    });
  }

  return suggestions;
}

// ---------------------------------------------------------------------------
// Part 7: Main exported analysis function
// ---------------------------------------------------------------------------

export function analyzeCode(code: string, language: SupportedLanguage): AnalysisResult {
  const results: FunctionResult[] = [];
  let partial = false;
  let errorMessage: string | undefined;

  try {
    const lines = code.split('\n');
    const allFunctions = detectFunctions(lines, language);

    for (const fn of allFunctions) {
      try {
        // Nested functions are those strictly inside this function's range
        const nestedFunctions = allFunctions.filter(
          (other) =>
            other !== fn &&
            other.startLine > fn.startLine &&
            other.endLine <= fn.endLine
        );

        const lineCount = fn.endLine - fn.startLine + 1;
        const cyclomatic = computeCyclomatic(lines, fn, nestedFunctions, language);
        const cognitive  = computeCognitive(lines, fn, nestedFunctions, language);
        const riskLevel  = computeRiskLevel(cyclomatic, cognitive);

        const nestingDepth       = computeMaxNestingDepth(lines, fn, nestedFunctions, language);
        const ifBranchCount      = countIfBranches(lines, fn, nestedFunctions, language);
        const logicalSeqCount    = countTotalLogicalSequences(lines, fn, nestedFunctions);

        const suggestions = generateSuggestions(
          cyclomatic,
          cognitive,
          riskLevel,
          nestingDepth,
          ifBranchCount,
          logicalSeqCount,
          lineCount
        );

        results.push({
          name:        fn.name,
          startLine:   fn.startLine,
          endLine:     fn.endLine,
          cyclomatic,
          cognitive,
          riskLevel,
          suggestions,
        });
      } catch (fnErr: unknown) {
        partial = true;
        errorMessage = `Analysis partially failed at function "${fn.name}": ${
          fnErr instanceof Error ? fnErr.message : String(fnErr)
        }`;
      }
    }
  } catch (err: unknown) {
    partial = true;
    errorMessage = `Analysis failed: ${err instanceof Error ? err.message : String(err)}`;
  }

  return { results, partial, errorMessage };
}
