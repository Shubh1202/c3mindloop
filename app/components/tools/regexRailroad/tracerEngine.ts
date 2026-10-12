export interface TraceStep {
  stepIndex: number;
  charIndex: number;
  char: string;
  tokenIndex: number;
  tokenLabel: string;
  tokenRaw: string;
  matched: boolean;
  status: 'advance' | 'match' | 'fail' | 'complete';
  explanation: string;
}

export interface TraceResult {
  steps: TraceStep[];
  isMatch: boolean;
  matchedText: string;
  matchIndex: number;
  failCharIndex: number | null;
  totalTokens: number;
}

interface SimpleToken {
  kind: string;
  raw: string;
  label: string;
}

/**
 * Builds a simulation trace of the regex engine executing against the test string.
 * Maps character progress in testString to active railroad diagram nodes.
 */
export function buildMatchTrace(
  pattern: string,
  testString: string,
  tokens: SimpleToken[]
): TraceResult {
  if (!pattern || tokens.length === 0) {
    return {
      steps: [],
      isMatch: false,
      matchedText: '',
      matchIndex: -1,
      failCharIndex: null,
      totalTokens: 0,
    };
  }

  let rx: RegExp;
  try {
    rx = new RegExp(pattern);
  } catch {
    return {
      steps: [],
      isMatch: false,
      matchedText: '',
      matchIndex: -1,
      failCharIndex: null,
      totalTokens: tokens.length,
    };
  }

  const match = rx.exec(testString);
  const isMatch = match !== null;
  const matchedText = match ? match[0] : '';
  const matchIndex = match ? match.index : -1;

  const steps: TraceStep[] = [];
  let sIndex = 0;

  if (!testString) {
    return {
      steps: [],
      isMatch,
      matchedText,
      matchIndex,
      failCharIndex: null,
      totalTokens: tokens.length,
    };
  }

  // Filter out structural tokens (parentheses) to focus on matching nodes
  const matchableIndices: number[] = [];
  tokens.forEach((t, idx) => {
    if (
      t.kind !== 'GROUP_OPEN' &&
      t.kind !== 'GROUP_CLOSE' &&
      t.kind !== 'NON_CAPTURE_OPEN' &&
      t.kind !== 'LOOKAHEAD_POS_OPEN' &&
      t.kind !== 'LOOKAHEAD_NEG_OPEN' &&
      t.kind !== 'LOOKBEHIND_POS_OPEN' &&
      t.kind !== 'LOOKBEHIND_NEG_OPEN' &&
      t.kind !== 'NAMED_GROUP_OPEN'
    ) {
      matchableIndices.push(idx);
    }
  });

  let curTokenListIdx = 0;
  let charIdx = 0;

  while (charIdx < testString.length && curTokenListIdx < matchableIndices.length) {
    const tIdx = matchableIndices[curTokenListIdx];
    const token = tokens[tIdx];
    const ch = testString[charIdx];

    // Check anchor start
    if (token.kind === 'ANCHOR_START') {
      steps.push({
        stepIndex: sIndex++,
        charIndex: 0,
        char: '^',
        tokenIndex: tIdx,
        tokenLabel: token.label,
        tokenRaw: token.raw,
        matched: charIdx === 0,
        status: charIdx === 0 ? 'match' : 'fail',
        explanation: charIdx === 0 ? 'Start anchor (^) confirmed at index 0' : 'Start anchor failed: not at index 0',
      });
      curTokenListIdx++;
      continue;
    }

    // Check anchor end
    if (token.kind === 'ANCHOR_END') {
      const atEnd = charIdx >= testString.length;
      steps.push({
        stepIndex: sIndex++,
        charIndex: charIdx,
        char: '$',
        tokenIndex: tIdx,
        tokenLabel: token.label,
        tokenRaw: token.raw,
        matched: atEnd,
        status: atEnd ? 'match' : 'fail',
        explanation: atEnd ? 'End anchor ($) satisfied at end of input' : 'End anchor ($) failed: unconsumed characters remain',
      });
      curTokenListIdx++;
      continue;
    }

    // Quantifier step
    if (token.kind === 'QUANTIFIER') {
      steps.push({
        stepIndex: sIndex++,
        charIndex: charIdx,
        char: ch,
        tokenIndex: tIdx,
        tokenLabel: token.label,
        tokenRaw: token.raw,
        matched: true,
        status: 'advance',
        explanation: `Quantifier ${token.raw}: evaluated repetition rule`,
      });
      curTokenListIdx++;
      continue;
    }

    // Test individual character
    let nodeMatches = false;
    try {
      let testRxStr = token.raw;
      if (token.kind === 'LITERAL' && !testRxStr.startsWith('\\')) {
        testRxStr = testRxStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }
      const nodeRx = new RegExp(testRxStr);
      nodeMatches = nodeRx.test(ch);
    } catch {
      nodeMatches = token.raw.includes(ch);
    }

    if (nodeMatches) {
      steps.push({
        stepIndex: sIndex++,
        charIndex: charIdx,
        char: ch,
        tokenIndex: tIdx,
        tokenLabel: token.label,
        tokenRaw: token.raw,
        matched: true,
        status: 'match',
        explanation: `Character '${ch}' [idx ${charIdx}] matched node "${token.raw}" (${token.label})`,
      });
      charIdx++;
      // If the next token is not a quantifier or alternation, advance node
      const nextToken = tokens[tIdx + 1];
      if (!nextToken || nextToken.kind !== 'QUANTIFIER') {
        curTokenListIdx++;
      }
    } else {
      steps.push({
        stepIndex: sIndex++,
        charIndex: charIdx,
        char: ch,
        tokenIndex: tIdx,
        tokenLabel: token.label,
        tokenRaw: token.raw,
        matched: false,
        status: 'fail',
        explanation: `Character '${ch}' [idx ${charIdx}] does not match node "${token.raw}". Branch backtrack / test next token.`,
      });
      curTokenListIdx++;
    }

    // Limit step count to prevent runaway on huge strings
    if (sIndex > 40) break;
  }

  // Final summary step
  if (isMatch) {
    steps.push({
      stepIndex: sIndex++,
      charIndex: Math.min(charIdx, testString.length - 1),
      char: '✓',
      tokenIndex: tokens.length - 1,
      tokenLabel: 'Match Complete',
      tokenRaw: matchedText,
      matched: true,
      status: 'complete',
      explanation: `Full match resolved! Matched segment: "${matchedText}" at index ${matchIndex}.`,
    });
  }

  const failStep = steps.find(s => !s.matched);

  return {
    steps,
    isMatch,
    matchedText,
    matchIndex,
    failCharIndex: failStep ? failStep.charIndex : null,
    totalTokens: tokens.length,
  };
}
