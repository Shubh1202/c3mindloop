/**
 * smartDiff.test.ts
 *
 * Tests for the Smart Diff engine: detection, JSON strategy,
 * CSV strategy, and backward-compatible text diff.
 *
 * Run with: npx tsx app/components/tools/__tests__/smartDiff.test.ts
 * (No test framework needed -  pure assertion-based.)
 */

import { detectContent } from '../diffDetector';
import { jsonDiff }      from '../diffStrategies/jsonStrategy';
import { csvDiff }       from '../diffStrategies/csvStrategy';
import { smartDiff }     from '../smartDiff';
import { computeDiff }   from '../diffEngine';

// ── Mini test runner ──────────────────────────────────────────────────────────
export {};

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✓  ${name}`);
    passed++;
  } catch (e) {
    console.error(`  ✗  ${name}`);
    console.error(`       ${(e as Error).message}`);
    failed++;
  }
}

function expect(actual: unknown) {
  return {
    toBe(expected: unknown) {
      if (actual !== expected)
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toEqual(expected: unknown) {
      if (JSON.stringify(actual) !== JSON.stringify(expected))
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    },
    toBeTruthy() {
      if (!actual) throw new Error(`Expected truthy, got ${JSON.stringify(actual)}`);
    },
    toBeFalsy() {
      if (actual) throw new Error(`Expected falsy, got ${JSON.stringify(actual)}`);
    },
    toContain(sub: string) {
      if (typeof actual !== 'string' || !actual.includes(sub))
        throw new Error(`Expected "${actual}" to contain "${sub}"`);
    },
    toBeGreaterThan(n: number) {
      if (typeof actual !== 'number' || actual <= n)
        throw new Error(`Expected ${actual} > ${n}`);
    },
  };
}

// ── Detection tests ───────────────────────────────────────────────────────────

console.log('\nDetection');

test('detects JSON', () => {
  const r = detectContent('{"a":1}', '{"a":2}');
  expect(r.type).toBe('json');
  expect(r.isMixed).toBe(false);
});

test('detects JSON -  formatted vs compact', () => {
  const orig = '{"name":"C3","version":"1.0"}';
  const mod  = '{\n  "name": "C3",\n  "version": "1.0"\n}';
  const r = detectContent(orig, mod);
  expect(r.type).toBe('json');
  expect(r.isMixed).toBe(false);
});

test('detects CSV', () => {
  const r = detectContent('a,b,c\n1,2,3', 'a,b,c\n1,2,4');
  expect(r.type).toBe('csv');
});

test('detects TypeScript over JavaScript', () => {
  const ts = 'interface Foo { bar: string; }';
  const r = detectContent(ts, ts);
  expect(r.type).toBe('typescript');
});

test('detects Python', () => {
  const py = 'def greet(name):\n    print(f"Hello {name}")\n';
  const r = detectContent(py, py);
  expect(r.type).toBe('python');
});

test('detects Markdown', () => {
  const md = '# Heading\n\nSome **bold** text.\n\n- item 1\n- item 2\n';
  const r = detectContent(md, md);
  expect(r.type).toBe('markdown');
});

test('detects plain text fallback', () => {
  const r = detectContent('hello world', 'hello there');
  expect(r.type).toBe('text');
});

test('detects mixed content → text fallback', () => {
  const r = detectContent('{"a":1}', 'def foo(): pass');
  expect(r.type).toBe('text');
  expect(r.isMixed).toBe(true);
});

test('uses file extension hint -  json', () => {
  const r = detectContent('not quite json', 'also not', 'json', 'json');
  // Extension overrides heuristic
  expect(r.type).toBe('json');
});

test('uses file extension hint -  py', () => {
  const r = detectContent('x = 1', 'x = 2', 'py', 'py');
  expect(r.type).toBe('python');
});

// ── JSON strategy tests ───────────────────────────────────────────────────────

console.log('\nJSON Strategy');

test('identical JSON -  different formatting → no changes', () => {
  const orig = '{"name":"C3","version":"1.0"}';
  const mod  = '{\n  "name": "C3",\n  "version": "1.0"\n}';
  const r = jsonDiff(orig, mod)!;
  expect(r.jsonSummary.total).toBe(0);
  expect(r.addedCount).toBe(0);
  expect(r.removedCount).toBe(0);
});

test('one value changed', () => {
  const orig = '{"version":"1.0"}';
  const mod  = '{"version":"1.1"}';
  const r = jsonDiff(orig, mod)!;
  expect(r.jsonSummary.modified).toBe(1);
  expect(r.jsonSummary.total).toBe(1);
});

test('key added', () => {
  const orig = '{"name":"C3"}';
  const mod  = '{"name":"C3","sync":true}';
  const r = jsonDiff(orig, mod)!;
  expect(r.jsonSummary.added).toBe(1);
  expect(r.jsonSummary.removed).toBe(0);
});

test('key removed', () => {
  const orig = '{"name":"C3","sync":true}';
  const mod  = '{"name":"C3"}';
  const r = jsonDiff(orig, mod)!;
  expect(r.jsonSummary.removed).toBe(1);
});

test('nested value changed', () => {
  const orig = '{"a":{"b":{"c":1}}}';
  const mod  = '{"a":{"b":{"c":2}}}';
  const r = jsonDiff(orig, mod)!;
  expect(r.jsonSummary.modified).toBe(1);
});

test('array item added', () => {
  const orig = '{"items":[1,2,3]}';
  const mod  = '{"items":[1,2,3,4]}';
  const r = jsonDiff(orig, mod)!;
  expect(r.jsonSummary.added).toBe(1);
});

test('array item removed', () => {
  const orig = '{"items":[1,2,3]}';
  const mod  = '{"items":[1,2]}';
  const r = jsonDiff(orig, mod)!;
  expect(r.jsonSummary.removed).toBe(1);
});

test('invalid JSON returns null', () => {
  const r = jsonDiff('not json', '{"a":1}');
  expect(r).toBe(null);
});

test('large JSON -  only changed fields marked', () => {
  const orig: Record<string, unknown> = {};
  const mod:  Record<string, unknown> = {};
  for (let i = 0; i < 50; i++) { orig[`key${i}`] = i; mod[`key${i}`] = i; }
  mod['key25'] = 999; // one change
  const r = jsonDiff(JSON.stringify(orig), JSON.stringify(mod))!;
  expect(r.jsonSummary.modified).toBe(1);
  expect(r.jsonSummary.total).toBe(1);
});

// ── CSV strategy tests ────────────────────────────────────────────────────────

console.log('\nCSV Strategy');

test('cell changed', () => {
  const orig = 'a,b,c\n1,2,3';
  const mod  = 'a,b,c\n1,2,4';
  const r = csvDiff(orig, mod);
  expect(r.csvSummary.modifiedCells).toBeGreaterThan(0);
});

test('row added', () => {
  const orig = 'a,b\n1,2';
  const mod  = 'a,b\n1,2\n3,4';
  const r = csvDiff(orig, mod);
  expect(r.csvSummary.addedRows).toBe(1);
});

test('row removed', () => {
  const orig = 'a,b\n1,2\n3,4';
  const mod  = 'a,b\n1,2';
  const r = csvDiff(orig, mod);
  expect(r.csvSummary.removedRows).toBe(1);
});

test('identical CSV → no changes', () => {
  const csv = 'a,b,c\n1,2,3\n4,5,6';
  const r = csvDiff(csv, csv);
  expect(r.csvSummary.modifiedCells).toBe(0);
  expect(r.csvSummary.addedRows).toBe(0);
  expect(r.csvSummary.removedRows).toBe(0);
});

// ── Smart diff integration tests ──────────────────────────────────────────────

console.log('\nSmart Diff Integration');

test('smartDiff JSON -  formatting only → no smart summary (identical)', () => {
  const orig = '{"name":"C3","version":"1.0"}';
  const mod  = '{\n  "name": "C3",\n  "version": "1.0"\n}';
  const r = smartDiff(orig, mod);
  expect(r.detection.type).toBe('json');
  // No meaningful changes → smartSummary should be undefined
  expect(r.smartSummary).toBe(undefined);
});

test('smartDiff JSON -  one value changed → shows semantic summary', () => {
  const orig = '{"version":"1.0"}';
  const mod  = '{"version":"1.1"}';
  const r = smartDiff(orig, mod);
  expect(r.detection.type).toBe('json');
  expect(r.smartSummary?.text).toContain('1 change');
  expect(r.smartSummary?.text).toContain('modified');
});

test('smartDiff forceText → uses text strategy even for JSON', () => {
  const orig = '{"a":1}';
  const mod  = '{"a":2}';
  const r = smartDiff(orig, mod, true);
  expect(r.detection.type).toBe('text');
  expect(r.smartSummary).toBe(undefined);
  // Should still compute line diff
  expect(r.addedCount + r.removedCount).toBeGreaterThan(0);
});

test('smartDiff empty inputs', () => {
  const r = smartDiff('', '');
  expect(r.lines.length).toBe(0);
  expect(r.addedCount).toBe(0);
});

test('smartDiff plain text -  backward compatible', () => {
  const orig = 'line one\nline two\nline three';
  const mod  = 'line one\nline TWO\nline three';
  const r = smartDiff(orig, mod);
  expect(r.detection.type).toBe('text');
  expect(r.addedCount).toBe(1);
  expect(r.removedCount).toBe(1);
});

// ── Existing engine backward-compat ───────────────────────────────────────────

console.log('\nExisting engine backward compat');

test('computeDiff still works independently', () => {
  const r = computeDiff('a\nb\nc', 'a\nB\nc');
  expect(r.addedCount).toBe(1);
  expect(r.removedCount).toBe(1);
});

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(50)}`);
console.log(`  ${passed} passed  ${failed > 0 ? `\x1b[31m${failed} failed\x1b[0m` : '0 failed'}`);
console.log('');

if (failed > 0) process.exit(1);
