/**
 * workflow-engine.test.ts
 *
 * Tests for the C³ MindLoop Visual Workflow Builder engine:
 * - Schema validation (valid, malformed, unknown node types, cycles, missing edges)
 * - Graph topology validation (DAG validation, cycle detection, execution order)
 * - Node registry (all 8 node types execute correctly, type-correct output)
 * - Pipeline execution (success, deliberate failure, conditional routing, skipped nodes)
 * - JSON import validation
 *
 * Run with: npx jest app/lib/workflow/__tests__/workflow-engine.test.ts
 */

import { validateWorkflowSchema } from '../schema';
import { validateGraphTopology, executeWorkflow } from '../engine';
import { NODE_DEFINITIONS, getNodeDefinition } from '../registry';
import { WorkflowSchemaV1, WorkflowNode, WorkflowEdge, WorkflowNodeType } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeNode(id: string, type: WorkflowNodeType, overrides: Partial<WorkflowNode> = {}): WorkflowNode {
  const def = NODE_DEFINITIONS[type];
  return {
    id,
    type,
    label: def?.label ?? type,
    position: { x: 0, y: 0 },
    config: { ...def?.defaultConfig },
    inputs: def?.inputs ?? [],
    outputs: def?.outputs ?? [],
    ...overrides,
  };
}

function makeEdge(id: string, src: string, srcPort: string, tgt: string, tgtPort: string): WorkflowEdge {
  return { id, sourceNodeId: src, sourcePortId: srcPort, targetNodeId: tgt, targetPortId: tgtPort };
}

function baseSchema(nodes: WorkflowNode[], edges: WorkflowEdge[], extraConfig?: Partial<WorkflowSchemaV1>): WorkflowSchemaV1 {
  return {
    pipeline_id: 'test-pipeline',
    version: '1.0.0',
    description: 'Test pipeline',
    nodes,
    edges,
    execution_settings: { stop_on_error: true, max_execution_time_ms: 5000, log_level: 'info' },
    ...extraConfig,
  };
}

// ── 1. Schema Validation ──────────────────────────────────────────────────────

describe('Schema Validation', () => {
  test('accepts a valid minimal schema', () => {
    const schema = {
      pipeline_id: 'my-pipeline',
      version: '1.0.0',
      nodes: [makeNode('n1', 'json-input')],
      edges: [],
      execution_settings: { stop_on_error: true, max_execution_time_ms: 5000, log_level: 'info' },
    };
    const result = validateWorkflowSchema(schema);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.schema).toBeDefined();
  });

  test('rejects non-object input (null)', () => {
    const result = validateWorkflowSchema(null);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/JSON object/);
  });

  test('rejects non-object input (array)', () => {
    const result = validateWorkflowSchema([1, 2, 3]);
    expect(result.valid).toBe(false);
  });

  test('rejects missing version field', () => {
    const result = validateWorkflowSchema({ pipeline_id: 'test', nodes: [], edges: {} });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('version'))).toBe(true);
  });

  test('rejects unsupported version', () => {
    const result = validateWorkflowSchema({ pipeline_id: 'test', version: '2.0.0', nodes: [], edges: [] });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Unsupported schema version'))).toBe(true);
  });

  test('rejects missing pipeline_id', () => {
    const result = validateWorkflowSchema({ version: '1.0.0', nodes: [], edges: [] });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('pipeline_id'))).toBe(true);
  });

  test('rejects unknown node type', () => {
    const result = validateWorkflowSchema({
      pipeline_id: 'test',
      version: '1.0.0',
      nodes: [{ id: 'n1', type: 'llm-magic-node', position: { x: 0, y: 0 }, config: {}, inputs: [], outputs: [] }],
      edges: [],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('unknown type'))).toBe(true);
  });

  test('rejects duplicate node IDs', () => {
    const result = validateWorkflowSchema({
      pipeline_id: 'test',
      version: '1.0.0',
      nodes: [
        { id: 'n1', type: 'json-input', position: { x: 0, y: 0 }, config: {}, inputs: [], outputs: [] },
        { id: 'n1', type: 'output-sink', position: { x: 0, y: 0 }, config: {}, inputs: [], outputs: [] },
      ],
      edges: [],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Duplicate node id'))).toBe(true);
  });

  test('rejects edge pointing to non-existent node', () => {
    const result = validateWorkflowSchema({
      pipeline_id: 'test',
      version: '1.0.0',
      nodes: [{ id: 'n1', type: 'json-input', position: { x: 0, y: 0 }, config: {}, inputs: [], outputs: [] }],
      edges: [{ id: 'e1', sourceNodeId: 'n1', sourcePortId: 'output', targetNodeId: 'n-ghost', targetPortId: 'input' }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('non-existent'))).toBe(true);
  });

  test('normalizes missing optional fields in schema', () => {
    const schema = {
      pipeline_id: 'minimal',
      version: '1.0.0',
      nodes: [],
      edges: [],
    };
    const result = validateWorkflowSchema(schema);
    expect(result.valid).toBe(true);
    expect(result.schema?.execution_settings?.stop_on_error).toBe(true);
    expect(result.schema?.description).toBe('');
  });
});

// ── 2. Graph Topology Validation ──────────────────────────────────────────────

describe('Graph Topology Validation', () => {
  test('accepts linear DAG and returns correct order', () => {
    const n1 = makeNode('n1', 'json-input');
    const n2 = makeNode('n2', 'json-formatter');
    const n3 = makeNode('n3', 'output-sink');
    const edges = [
      makeEdge('e1', 'n1', 'output', 'n2', 'input'),
      makeEdge('e2', 'n2', 'output', 'n3', 'input'),
    ];
    const result = validateGraphTopology([n1, n2, n3], edges);
    expect(result.valid).toBe(true);
    expect(result.topologicalOrder).toEqual(['n1', 'n2', 'n3']);
  });

  test('detects a cycle: n1 -> n2 -> n1', () => {
    const n1 = makeNode('n1', 'json-input');
    const n2 = makeNode('n2', 'json-formatter');
    const edges = [
      makeEdge('e1', 'n1', 'output', 'n2', 'input'),
      makeEdge('e2', 'n2', 'output', 'n1', 'input'),
    ];
    const result = validateGraphTopology([n1, n2], edges);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Cycle detected'))).toBe(true);
  });

  test('rejects edge to non-existent node', () => {
    const n1 = makeNode('n1', 'json-input');
    const edges = [makeEdge('e1', 'n1', 'output', 'ghost', 'input')];
    const result = validateGraphTopology([n1], edges);
    expect(result.valid).toBe(false);
  });

  test('issues warning for orphan transform node', () => {
    const n1 = makeNode('n1', 'json-input');
    const n2 = makeNode('n2', 'json-formatter');
    const result = validateGraphTopology([n1, n2], []);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.valid).toBe(true); // still valid topologically
  });

  test('handles empty graph gracefully', () => {
    const result = validateGraphTopology([], []);
    expect(result.valid).toBe(true);
    expect(result.topologicalOrder).toHaveLength(0);
  });
});

// ── 3. Node Registry ──────────────────────────────────────────────────────────

describe('Node Registry', () => {
  test('all 8 node types are registered', () => {
    const expectedTypes = [
      'json-input', 'json-formatter', 'base64-encode', 'base64-decode',
      'regex-match', 'hash-sha256', 'conditional-branch', 'output-sink',
    ];
    for (const type of expectedTypes) {
      expect(() => getNodeDefinition(type as any)).not.toThrow();
    }
  });

  test('getNodeDefinition throws for unknown type', () => {
    expect(() => getNodeDefinition('magic-ai-node' as any)).toThrow(/Unregistered workflow node type/);
  });

  test('json-input: valid JSON passes through as parsed object', async () => {
    const node = makeNode('n1', 'json-input', { config: { rawJson: '{"key": "value"}', validateJson: true } });
    const def = getNodeDefinition('json-input');
    const result = await def.execute(node, {}, {});
    expect(result.output).toEqual({ key: 'value' });
  });

  test('json-input: invalid JSON throws informative error', async () => {
    const node = makeNode('n1', 'json-input', { config: { rawJson: '{ invalid json }}', validateJson: true } });
    const def = getNodeDefinition('json-input');
    await expect(def.execute(node, {}, {})).rejects.toThrow(/Invalid JSON syntax/);
  });

  test('json-formatter: pretty-prints object', async () => {
    const node = makeNode('n2', 'json-formatter', { config: { indent: 2, minify: false } });
    const def = getNodeDefinition('json-formatter');
    const result = await def.execute(node, { input: { hello: 'world' } }, {});
    expect(result.output).toBe(JSON.stringify({ hello: 'world' }, null, 2));
  });

  test('json-formatter: minify mode produces compact JSON', async () => {
    const node = makeNode('n2', 'json-formatter', { config: { indent: 2, minify: true } });
    const def = getNodeDefinition('json-formatter');
    const result = await def.execute(node, { input: '{"a": 1, "b": 2}' }, {});
    expect(result.output).toBe('{"a":1,"b":2}');
  });

  test('json-formatter: rejects invalid JSON string input', async () => {
    const node = makeNode('n2', 'json-formatter', { config: { indent: 2 } });
    const def = getNodeDefinition('json-formatter');
    await expect(def.execute(node, { input: '{bad json' }, {})).rejects.toThrow(/invalid JSON string/);
  });

  test('base64-encode: encodes ASCII string correctly', async () => {
    const node = makeNode('n3', 'base64-encode', { config: { urlSafe: false } });
    const def = getNodeDefinition('base64-encode');
    const result = await def.execute(node, { input: 'hello world' }, {});
    expect(result.output).toBe('aGVsbG8gd29ybGQ=');
  });

  test('base64-decode: decodes a valid base64 string', async () => {
    const node = makeNode('n4', 'base64-decode', { config: {} });
    const def = getNodeDefinition('base64-decode');
    const result = await def.execute(node, { input: 'aGVsbG8gd29ybGQ=' }, {});
    expect(result.output).toBe('hello world');
  });

  test('base64-decode: throws on invalid base64 characters', async () => {
    const node = makeNode('n4', 'base64-decode', { config: {} });
    const def = getNodeDefinition('base64-decode');
    await expect(def.execute(node, { input: '!!!not base64 at all ~~~' }, {})).rejects.toThrow();
  });

  test('regex-match: extract mode returns matching strings', async () => {
    const node = makeNode('n5', 'regex-match', { config: { pattern: '\\d+', flags: 'g', mode: 'extract_matches' } });
    const def = getNodeDefinition('regex-match');
    const result = await def.execute(node, { input: 'foo 123 bar 456' }, {});
    expect(result.output).toEqual(['123', '456']);
  });

  test('regex-match: filter_lines mode keeps only matching lines', async () => {
    const node = makeNode('n5', 'regex-match', { config: { pattern: 'ERROR', flags: 'i', mode: 'filter_lines' } });
    const def = getNodeDefinition('regex-match');
    const result = await def.execute(node, { input: 'INFO: started\nERROR: crashed\nINFO: done' }, {});
    expect(result.output).toContain('ERROR: crashed');
    expect(result.output).not.toContain('INFO: started');
  });

  test('regex-match: test mode returns boolean', async () => {
    const node = makeNode('n5', 'regex-match', { config: { pattern: '^\\d{4}$', flags: '', mode: 'test' } });
    const def = getNodeDefinition('regex-match');
    const resultTrue = await def.execute(node, { input: '2024' }, {});
    expect(resultTrue.output).toBe(true);
    const resultFalse = await def.execute(node, { input: 'not-a-year' }, {});
    expect(resultFalse.output).toBe(false);
  });

  test('regex-match: throws on empty pattern', async () => {
    const node = makeNode('n5', 'regex-match', { config: { pattern: '', flags: 'g', mode: 'extract_matches' } });
    const def = getNodeDefinition('regex-match');
    await expect(def.execute(node, { input: 'hello' }, {})).rejects.toThrow(/pattern is empty/);
  });

  test('hash-sha256: produces 64-char hex string for non-empty input', async () => {
    const node = makeNode('n6', 'hash-sha256', { config: { outputFormat: 'hex' } });
    const def = getNodeDefinition('hash-sha256');
    const result = await def.execute(node, { input: 'test-data' }, {});
    expect(typeof result.output).toBe('string');
    expect((result.output as string).length).toBe(64);
    expect(/^[0-9a-f]{64}$/.test(result.output as string)).toBe(true);
  });

  test('hash-sha256: deterministic (same input => same hash)', async () => {
    const node = makeNode('n6', 'hash-sha256', { config: { outputFormat: 'hex' } });
    const def = getNodeDefinition('hash-sha256');
    const r1 = await def.execute(node, { input: 'deterministic-string' }, {});
    const r2 = await def.execute(node, { input: 'deterministic-string' }, {});
    expect(r1.output).toBe(r2.output);
  });

  test('conditional-branch: contains condition routes to true_output', async () => {
    const node = makeNode('n7', 'conditional-branch', { config: { conditionType: 'contains', conditionValue: 'CRITICAL' } });
    const def = getNodeDefinition('conditional-branch');
    const result = await def.execute(node, { input: '{"severity": "CRITICAL", "msg": "crash"}' }, {});
    expect(result.true_output).toBeDefined();
    expect(result.false_output).toBeUndefined();
    expect(result.__branchTaken).toBe('true');
  });

  test('conditional-branch: contains condition routes to false_output when not matched', async () => {
    const node = makeNode('n7', 'conditional-branch', { config: { conditionType: 'contains', conditionValue: 'CRITICAL' } });
    const def = getNodeDefinition('conditional-branch');
    const result = await def.execute(node, { input: '{"severity": "INFO", "msg": "ok"}' }, {});
    expect(result.false_output).toBeDefined();
    expect(result.true_output).toBeUndefined();
    expect(result.__branchTaken).toBe('false');
  });

  test('conditional-branch: json_key_exists routes correctly', async () => {
    const node = makeNode('n7', 'conditional-branch', { config: { conditionType: 'json_key_exists', conditionValue: 'userId' } });
    const def = getNodeDefinition('conditional-branch');
    const withKey = await def.execute(node, { input: { userId: 'abc', name: 'Test' } }, {});
    expect(withKey.__branchTaken).toBe('true');
    const withoutKey = await def.execute(node, { input: { name: 'Test' } }, {});
    expect(withoutKey.__branchTaken).toBe('false');
  });

  test('output-sink: captures input data', async () => {
    const node = makeNode('n8', 'output-sink', { config: { label: 'Result' } });
    const def = getNodeDefinition('output-sink');
    const result = await def.execute(node, { input: { processed: true } }, {});
    expect(result.capturedData).toEqual({ processed: true });
    expect(typeof result.byteSize).toBe('number');
  });

  test('output-sink: throws when no input provided', async () => {
    const node = makeNode('n8', 'output-sink', { config: {} });
    const def = getNodeDefinition('output-sink');
    await expect(def.execute(node, {}, {})).rejects.toThrow(/no input data/);
  });
});

// ── 4. Pipeline Execution ─────────────────────────────────────────────────────

describe('Pipeline Execution', () => {
  test('simple JSON input -> formatter -> output succeeds end-to-end', async () => {
    const n1 = makeNode('n1', 'json-input', { config: { rawJson: '{"key": 42}', validateJson: true } });
    const n2 = makeNode('n2', 'json-formatter', { config: { indent: 2, minify: false } });
    const n3 = makeNode('n3', 'output-sink', { config: { label: 'Result' } });
    const edges = [
      makeEdge('e1', 'n1', 'output', 'n2', 'input'),
      makeEdge('e2', 'n2', 'output', 'n3', 'input'),
    ];
    const schema = baseSchema([n1, n2, n3], edges);
    const report = await executeWorkflow(schema);

    expect(report.success).toBe(true);
    expect(report.nodeStates['n1'].status).toBe('success');
    expect(report.nodeStates['n2'].status).toBe('success');
    expect(report.nodeStates['n3'].status).toBe('success');
    expect(report.finalOutputs['n3']).toEqual(JSON.stringify({ key: 42 }, null, 2));
    expect(report.logs.length).toBeGreaterThan(0);
  });

  test('invalid JSON input causes error at n1 and skips downstream', async () => {
    const n1 = makeNode('n1', 'json-input', { config: { rawJson: '{ broken json!!', validateJson: true } });
    const n2 = makeNode('n2', 'json-formatter', { config: { indent: 2 } });
    const n3 = makeNode('n3', 'output-sink', { config: {} });
    const edges = [
      makeEdge('e1', 'n1', 'output', 'n2', 'input'),
      makeEdge('e2', 'n2', 'output', 'n3', 'input'),
    ];
    const schema = baseSchema([n1, n2, n3], edges);
    const report = await executeWorkflow(schema);

    expect(report.success).toBe(false);
    expect(report.nodeStates['n1'].status).toBe('error');
    expect(report.nodeStates['n1'].errorMessage).toMatch(/Invalid JSON/);
    expect(report.nodeStates['n2'].status).toBe('skipped');
    expect(report.nodeStates['n3'].status).toBe('skipped');
  });

  test('base64 encode then decode roundtrip produces original input', async () => {
    const n1 = makeNode('n1', 'json-input', { config: { rawJson: '"developer-data"', validateJson: true } });
    const n2 = makeNode('n2', 'base64-encode', { config: { urlSafe: false } });
    const n3 = makeNode('n3', 'base64-decode', { config: {} });
    const n4 = makeNode('n4', 'output-sink', { config: {} });
    const edges = [
      makeEdge('e1', 'n1', 'output', 'n2', 'input'),
      makeEdge('e2', 'n2', 'output', 'n3', 'input'),
      makeEdge('e3', 'n3', 'output', 'n4', 'input'),
    ];
    const schema = baseSchema([n1, n2, n3, n4], edges);
    const report = await executeWorkflow(schema);

    expect(report.success).toBe(true);
    expect(report.nodeStates['n3'].status).toBe('success');
    expect(report.finalOutputs['n4']).toBe('developer-data');
  });

  test('conditional branch - only true_output branch runs', async () => {
    const n1 = makeNode('n1', 'json-input', { config: { rawJson: '{"status": "CRITICAL"}', validateJson: true } });
    const n2 = makeNode('n2', 'conditional-branch', { config: { conditionType: 'contains', conditionValue: 'CRITICAL' } });
    const n3 = makeNode('n3', 'output-sink', { config: { label: 'True Sink' } });
    const n4 = makeNode('n4', 'output-sink', { config: { label: 'False Sink' } });
    const edges = [
      makeEdge('e1', 'n1', 'output', 'n2', 'input'),
      makeEdge('e2', 'n2', 'true_output', 'n3', 'input'),
      makeEdge('e3', 'n2', 'false_output', 'n4', 'input'),
    ];
    const schema = baseSchema([n1, n2, n3, n4], edges);
    const report = await executeWorkflow(schema);

    expect(report.success).toBe(true);
    expect(report.nodeStates['n3'].status).toBe('success');
    expect(report.nodeStates['n4'].status).toBe('skipped');
    expect(report.finalOutputs['n3']).toBeDefined();
  });

  test('conditional branch - false branch routes when condition not met', async () => {
    const n1 = makeNode('n1', 'json-input', { config: { rawJson: '{"status": "OK"}', validateJson: true } });
    const n2 = makeNode('n2', 'conditional-branch', { config: { conditionType: 'contains', conditionValue: 'CRITICAL' } });
    const n3 = makeNode('n3', 'output-sink', { config: { label: 'True Sink' } });
    const n4 = makeNode('n4', 'output-sink', { config: { label: 'False Sink' } });
    const edges = [
      makeEdge('e1', 'n1', 'output', 'n2', 'input'),
      makeEdge('e2', 'n2', 'true_output', 'n3', 'input'),
      makeEdge('e3', 'n2', 'false_output', 'n4', 'input'),
    ];
    const schema = baseSchema([n1, n2, n3, n4], edges);
    const report = await executeWorkflow(schema);

    expect(report.success).toBe(true);
    expect(report.nodeStates['n3'].status).toBe('skipped');
    expect(report.nodeStates['n4'].status).toBe('success');
  });

  test('sha256 hash pipeline produces 64-char hex digest', async () => {
    const n1 = makeNode('n1', 'json-input', { config: { rawJson: '{"tx": "abc123"}', validateJson: true } });
    const n2 = makeNode('n2', 'json-formatter', { config: { minify: true } });
    const n3 = makeNode('n3', 'hash-sha256', { config: { outputFormat: 'hex' } });
    const n4 = makeNode('n4', 'output-sink', { config: {} });
    const edges = [
      makeEdge('e1', 'n1', 'output', 'n2', 'input'),
      makeEdge('e2', 'n2', 'output', 'n3', 'input'),
      makeEdge('e3', 'n3', 'output', 'n4', 'input'),
    ];
    const schema = baseSchema([n1, n2, n3, n4], edges);
    const report = await executeWorkflow(schema);

    expect(report.success).toBe(true);
    const digest = report.finalOutputs['n4'] as string;
    expect(typeof digest).toBe('string');
    expect(digest.length).toBe(64);
  });

  test('cycle in graph causes execution to fail at validation', async () => {
    const n1 = makeNode('n1', 'json-formatter');
    const n2 = makeNode('n2', 'json-formatter');
    const edges = [
      makeEdge('e1', 'n1', 'output', 'n2', 'input'),
      makeEdge('e2', 'n2', 'output', 'n1', 'input'),
    ];
    const schema = baseSchema([n1, n2], edges);
    const report = await executeWorkflow(schema);

    expect(report.success).toBe(false);
    expect(report.error).toMatch(/Cycle detected/);
  });

  test('execution log has entries for each step', async () => {
    const n1 = makeNode('n1', 'json-input', { config: { rawJson: '"hello"', validateJson: true } });
    const n2 = makeNode('n2', 'output-sink', { config: {} });
    const schema = baseSchema([n1, n2], [makeEdge('e1', 'n1', 'output', 'n2', 'input')]);
    const report = await executeWorkflow(schema);

    expect(report.logs.length).toBe(2);
    expect(report.logs[0].nodeId).toBe('n1');
    expect(report.logs[1].nodeId).toBe('n2');
    expect(report.logs[0].status).toBe('success');
    expect(report.logs[0].durationMs).toBeGreaterThanOrEqual(0);
  });
});

// ── 5. JSON Import Validation ─────────────────────────────────────────────────

describe('JSON Import Validation', () => {
  test('valid workflow schema is accepted and schema is returned', () => {
    const validInput = {
      pipeline_id: 'imported-pipeline',
      version: '1.0.0',
      description: 'Test import',
      nodes: [
        { id: 'n1', type: 'json-input', label: 'Input', position: { x: 0, y: 0 }, config: { rawJson: '{}' }, inputs: [], outputs: [] },
      ],
      edges: [],
      execution_settings: { stop_on_error: true, max_execution_time_ms: 5000, log_level: 'info' },
    };
    const result = validateWorkflowSchema(validInput);
    expect(result.valid).toBe(true);
    expect(result.schema?.pipeline_id).toBe('imported-pipeline');
  });

  test('rejects completely malformed JSON object', () => {
    const result = validateWorkflowSchema({ garbage: true, what: 'is this?' });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('flags all errors for a multi-error schema simultaneously', () => {
    const result = validateWorkflowSchema({
      version: '1.0.0',
      // no pipeline_id
      nodes: [
        { id: '', type: 'invalid-type', position: null },
      ],
      edges: [{ id: 'e1', sourceNodeId: 'nonexistent', targetNodeId: 'also-nonexistent' }],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(2);
  });
});
