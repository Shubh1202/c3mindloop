export interface LintSuggestion {
  id: string;
  message: string;
  severity: 'info' | 'warning';
  original: string;
  replacement: string;
}

export function lintRegex(pattern: string): LintSuggestion[] {
  if (!pattern) return [];
  const suggestions: LintSuggestion[] = [];

  // 1. [0-9] -> \d
  if (/\[0-9\]/.test(pattern)) {
    suggestions.push({
      id: 'digit-shorthand',
      message: 'Replace "[0-9]" with shorthand "\\d" for cleaner readability.',
      severity: 'info',
      original: '[0-9]',
      replacement: '\\d',
    });
  }

  // 2. [^0-9] -> \D
  if (/\[\^0-9\]/.test(pattern)) {
    suggestions.push({
      id: 'non-digit-shorthand',
      message: 'Replace "[^0-9]" with shorthand "\\D".',
      severity: 'info',
      original: '[^0-9]',
      replacement: '\\D',
    });
  }

  // 3. [a-zA-Z0-9_] -> \w
  if (/\[a-zA-Z0-9_\]|\[0-9a-zA-Z_\]/.test(pattern)) {
    suggestions.push({
      id: 'word-shorthand',
      message: 'Replace "[a-zA-Z0-9_]" with shorthand "\\w".',
      severity: 'info',
      original: pattern.includes('[a-zA-Z0-9_]') ? '[a-zA-Z0-9_]' : '[0-9a-zA-Z_]',
      replacement: '\\w',
    });
  }

  // 4. Unnecessary forward slash escape: \/
  if (/\\\//.test(pattern)) {
    suggestions.push({
      id: 'unescaped-slash',
      message: 'Forward slash "\\/" does not need escaping inside string-based regex patterns in JS/modern engines.',
      severity: 'info',
      original: '\\/',
      replacement: '/',
    });
  }

  // 5. Redundant group around single token: (?:\w) or (?:[a-z])
  const redundantGroupMatch = /\(\?:(\\[dwWsS]|\[[^\]]+\])\)/.exec(pattern);
  if (redundantGroupMatch) {
    suggestions.push({
      id: 'redundant-non-capture',
      message: `Redundant non-capturing group "${redundantGroupMatch[0]}". Can be simplified to "${redundantGroupMatch[1]}".`,
      severity: 'warning',
      original: redundantGroupMatch[0],
      replacement: redundantGroupMatch[1],
    });
  }

  // 6. Greedy dots wrapped in parenthesis with no quantifiers: (.*)
  if (/\(\.\*\)/.test(pattern) && !pattern.includes('(?=')) {
    suggestions.push({
      id: 'greedy-dot-star',
      message: 'Unconstrained "(.*)" capture group captures entire line and may cause backtracking delays.',
      severity: 'warning',
      original: '(.*)',
      replacement: '([^\\n]+)',
    });
  }

  return suggestions;
}
