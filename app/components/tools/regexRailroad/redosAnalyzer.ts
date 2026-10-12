export type ReDoSRiskLevel = 'SAFE' | 'MODERATE' | 'CRITICAL';

export interface ReDoSAnalysis {
  level: ReDoSRiskLevel;
  score: number; // 0 (safest) - 100 (catastrophic)
  title: string;
  summary: string;
  culprits: string[];
  suggestions: string[];
}

/**
 * Client-side static analyzer for Regular Expression Denial of Service (ReDoS)
 * and catastrophic exponential backtracking vulnerabilities.
 */
export function analyzeReDoS(pattern: string): ReDoSAnalysis {
  if (!pattern || pattern.trim().length === 0) {
    return {
      level: 'SAFE',
      score: 0,
      title: 'Empty Pattern',
      summary: 'No pattern provided to analyze.',
      culprits: [],
      suggestions: [],
    };
  }

  const culprits: string[] = [];
  const suggestions: string[] = [];
  let score = 5; // baseline

  // 1. Critical: Nested quantifiers like (a+)+, (a*)*, ([0-9]+)+, (a+)*, (a{2,})*
  const nestedQuantifierRegex = /\((?:[^()]*[+*]|\{[0-9]+,[0-9]*\})[^()]*\)[+*]|\((?:[^()]*[+*]|\{[0-9]+,[0-9]*\})[^()]*\)\{[0-9]+,[0-9]*\}/g;
  let match: RegExpExecArray | null;
  while ((match = nestedQuantifierRegex.exec(pattern)) !== null) {
    culprits.push(`Nested quantifier: "${match[0]}"`);
    score += 55;
  }

  // 2. Critical: Alternation inside quantifier with overlapping branches, e.g., (a|a)+ or (a|ab)+
  const alternationQuantifierRegex = /\(([^()|]+\|[^()|]+)\)[+*]/g;
  while ((match = alternationQuantifierRegex.exec(pattern)) !== null) {
    const branches = match[1].split('|');
    // Check if branches share common prefixes or identical characters
    const hasOverlap = branches.some((b1, i) =>
      branches.some((b2, j) => i !== j && (b1.startsWith(b2) || b2.startsWith(b1) || b1 === b2))
    );
    if (hasOverlap) {
      culprits.push(`Overlapping alternation with quantifier: "${match[0]}"`);
      score += 45;
    }
  }

  // 3. Moderate: Multiple adjacent unbounded wildcards e.g. .*.* or .+[a-z]+.*
  if (/(\.\*|\.\+){2,}/.test(pattern)) {
    culprits.push('Consecutive unconstrained wildcards: ".*.*" or ".+.+"');
    score += 30;
    suggestions.push('Replace consecutive wildcards with more specific character classes (e.g., [^\\s]+).');
  }

  // 4. Moderate: Greedy quantifiers on both sides of flexible class without delimiters e.g. .*[a-z]+.*
  if (/(?:\.\*|\.\+)[^\\^$]*(?:[+*])[^\\^$]*(?:\.\*|\.\+)/.test(pattern)) {
    culprits.push('Multiple greedy wildcards surrounding quantified tokens');
    score += 20;
    suggestions.push('Consider anchoring with ^ and $ or making quantifiers lazy (*?, +?).');
  }

  // 5. Check if pattern has anchors
  const hasStartAnchor = pattern.startsWith('^');
  const hasEndAnchor = pattern.endsWith('$');
  if (!hasStartAnchor && !hasEndAnchor && pattern.length > 15) {
    score += 10;
    suggestions.push('Consider adding ^ and $ anchors if matching entire strings to prevent sliding window scan overhead.');
  }

  score = Math.min(100, Math.max(0, score));

  if (score >= 60 || culprits.some(c => c.startsWith('Nested') || c.startsWith('Overlapping'))) {
    return {
      level: 'CRITICAL',
      score,
      title: 'High ReDoS Risk (Catastrophic Backtracking)',
      summary: 'Pattern contains nested quantifiers or overlapping alternations that can trigger O(2ⁿ) exponential execution time on crafted non-matching input.',
      culprits,
      suggestions: [
        'Atomic grouping or possessive quantifiers (e.g. *+, ++) if supported.',
        'Refactor nested groups: replace ((a+)+) with a single quantified class like (a+).',
        'Use strict character class boundaries instead of overlapping alternations.',
        ...suggestions,
      ],
    };
  }

  if (score >= 25 || culprits.length > 0) {
    return {
      level: 'MODERATE',
      score,
      title: 'Moderate Complexity (Polynomial Backtracking)',
      summary: 'Pattern contains unbounded greedy wildcards that may experience higher execution times on long inputs.',
      culprits,
      suggestions: [
        'Use lazy quantifiers (*?, +?) when matching minimal substrings.',
        'Constrain dot matches to specific sets like [^\\n\\r"] instead of unconstrained .*.',
        ...suggestions,
      ],
    };
  }

  return {
    level: 'SAFE',
    score,
    title: 'Safe / Linear Execution',
    summary: 'No exponential backtracking constructs detected. The pattern evaluates linearly or near-linearly across typical inputs.',
    culprits: [],
    suggestions: suggestions.length > 0 ? suggestions : ['Pattern structure is clean and poses minimal ReDoS risk.'],
  };
}
