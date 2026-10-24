import { WorkflowSchemaV1 } from './types';
import { getNodeDefinition } from './registry';

function createNode(id: string, type: any, label: string, x: number, y: number, customConfig?: Record<string, unknown>) {
  const def = getNodeDefinition(type);
  return {
    id,
    type,
    label,
    position: { x, y },
    config: { ...def.defaultConfig, ...(customConfig || {}) },
    inputs: def.inputs,
    outputs: def.outputs,
  };
}

export const WORKFLOW_PRESETS: { id: string; name: string; description: string; schema: WorkflowSchemaV1 }[] = [
  // 1. JSON Formatter & Validator
  {
    id: 'json-validator-formatter',
    name: 'JSON Validator & Formatter',
    description: 'Ingest raw JSON payload, validate syntax, format with 2-space indentation, and preview output.',
    schema: {
      pipeline_id: 'json-validator-formatter',
      version: '1.0.0',
      description: 'End-to-end JSON syntax validation and formatting pipeline',
      nodes: [
        createNode('node-input-1', 'json-input', 'Raw JSON Input', 80, 160, {
          rawJson: '{\n  "service": "mindloop-engine",\n  "status": "active",\n  "uptime": 99.98,\n  "features": ["zero-server", "wasm", "local-privacy"]\n}',
          validateJson: true,
        }),
        createNode('node-format-1', 'json-formatter', 'JSON Formatter', 420, 160, {
          indent: 2,
          minify: false,
        }),
        createNode('node-output-1', 'output-sink', 'Formatted Result', 760, 160, {
          label: 'Pretty JSON Result',
        }),
      ],
      edges: [
        {
          id: 'edge-1',
          sourceNodeId: 'node-input-1',
          sourcePortId: 'output',
          targetNodeId: 'node-format-1',
          targetPortId: 'input',
        },
        {
          id: 'edge-2',
          sourceNodeId: 'node-format-1',
          sourcePortId: 'output',
          targetNodeId: 'node-output-1',
          targetPortId: 'input',
        },
      ],
      execution_settings: {
        stop_on_error: true,
        max_execution_time_ms: 10000,
        log_level: 'info',
      },
      error_boundary: {
        action: 'halt',
        fallback_step_id: null,
      },
    },
  },

  // 2. Base64 Webhook Decoder
  {
    id: 'base64-webhook-pipeline',
    name: 'Base64 Webhook Decoder',
    description: 'Decode a Base64 encoded payload, format the inner JSON structure, and output clean claims.',
    schema: {
      pipeline_id: 'base64-webhook-pipeline',
      version: '1.0.0',
      description: 'Decode base64 payload into readable formatted JSON data',
      nodes: [
        createNode('node-b64-in', 'json-input', 'Base64 Encoded Input', 80, 160, {
          rawJson: '"eyJldmVudCI6ImRldmVsb3Blci5jcmFzaCIsInNldmVyaXR5IjoiQ1JJVElDQUwiLCJhdHRlbXB0cyI6M30="',
          validateJson: true,
        }),
        createNode('node-b64-dec', 'base64-decode', 'Base64 Decode', 420, 160),
        createNode('node-b64-fmt', 'json-formatter', 'JSON Formatter', 760, 160, { indent: 2 }),
        createNode('node-b64-out', 'output-sink', 'Decoded JSON Output', 1100, 160, { label: 'Decoded Payload' }),
      ],
      edges: [
        {
          id: 'edge-b1',
          sourceNodeId: 'node-b64-in',
          sourcePortId: 'output',
          targetNodeId: 'node-b64-dec',
          targetPortId: 'input',
        },
        {
          id: 'edge-b2',
          sourceNodeId: 'node-b64-dec',
          sourcePortId: 'output',
          targetNodeId: 'node-b64-fmt',
          targetPortId: 'input',
        },
        {
          id: 'edge-b3',
          sourceNodeId: 'node-b64-fmt',
          sourcePortId: 'output',
          targetNodeId: 'node-b64-out',
          targetPortId: 'input',
        },
      ],
      execution_settings: {
        stop_on_error: true,
        max_execution_time_ms: 10000,
        log_level: 'info',
      },
      error_boundary: {
        action: 'halt',
        fallback_step_id: null,
      },
    },
  },

  // 3. SHA-256 Digest
  {
    id: 'sha256-hasher-pipeline',
    name: 'SHA-256 Digest Generator',
    description: 'Minify a JSON object and calculate its deterministic SHA-256 cryptographic checksum locally.',
    schema: {
      pipeline_id: 'sha256-hasher-pipeline',
      version: '1.0.0',
      description: 'Generate SHA-256 checksum from JSON payload using Web Crypto API',
      nodes: [
        createNode('node-hash-in', 'json-input', 'Data Input', 80, 160, {
          rawJson: '{\n  "transactionId": "tx_99812",\n  "timestamp": 1729728000,\n  "amount": 2500\n}',
          validateJson: true,
        }),
        createNode('node-hash-fmt', 'json-formatter', 'JSON Minify', 420, 160, { minify: true }),
        createNode('node-hash-calc', 'hash-sha256', 'SHA-256 Hash', 760, 160, { outputFormat: 'hex' }),
        createNode('node-hash-out', 'output-sink', 'Digest Output', 1100, 160, { label: 'SHA-256 Hex' }),
      ],
      edges: [
        {
          id: 'edge-h1',
          sourceNodeId: 'node-hash-in',
          sourcePortId: 'output',
          targetNodeId: 'node-hash-fmt',
          targetPortId: 'input',
        },
        {
          id: 'edge-h2',
          sourceNodeId: 'node-hash-fmt',
          sourcePortId: 'output',
          targetNodeId: 'node-hash-calc',
          targetPortId: 'input',
        },
        {
          id: 'edge-h3',
          sourceNodeId: 'node-hash-calc',
          sourcePortId: 'output',
          targetNodeId: 'node-hash-out',
          targetPortId: 'input',
        },
      ],
      execution_settings: {
        stop_on_error: true,
        max_execution_time_ms: 10000,
        log_level: 'info',
      },
    },
  },

  // 4. Conditional Branch Routing
  {
    id: 'conditional-routing-pipeline',
    name: 'Conditional Branch Routing',
    description: 'Inspect incoming payload and route to True or False branches based on JSON property criteria.',
    schema: {
      pipeline_id: 'conditional-routing-pipeline',
      version: '1.0.0',
      description: 'Route execution down divergent paths based on payload condition',
      nodes: [
        createNode('node-cond-in', 'json-input', 'Audit Input', 80, 200, {
          rawJson: '{\n  "action": "PAYMENT_FAILED",\n  "severity": "CRITICAL",\n  "retryCount": 4\n}',
          validateJson: true,
        }),
        createNode('node-cond-branch', 'conditional-branch', 'Check Critical Severity', 440, 200, {
          conditionType: 'contains',
          conditionValue: 'CRITICAL',
        }),
        createNode('node-cond-true', 'output-sink', 'High Priority Alert', 820, 100, { label: 'Alert Triggered (True)' }),
        createNode('node-cond-false', 'output-sink', 'Standard Log (False)', 820, 300, { label: 'Normal Log (False)' }),
      ],
      edges: [
        {
          id: 'edge-c1',
          sourceNodeId: 'node-cond-in',
          sourcePortId: 'output',
          targetNodeId: 'node-cond-branch',
          targetPortId: 'input',
        },
        {
          id: 'edge-c2',
          sourceNodeId: 'node-cond-branch',
          sourcePortId: 'true_output',
          targetNodeId: 'node-cond-true',
          targetPortId: 'input',
        },
        {
          id: 'edge-c3',
          sourceNodeId: 'node-cond-branch',
          sourcePortId: 'false_output',
          targetNodeId: 'node-cond-false',
          targetPortId: 'input',
        },
      ],
      execution_settings: {
        stop_on_error: true,
        max_execution_time_ms: 10000,
        log_level: 'info',
      },
    },
  },
];
