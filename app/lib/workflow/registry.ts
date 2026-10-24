import { NodeDefinition, WorkflowNodeType, WorkflowPort } from './types';

const MAX_INPUT_BYTES = 5 * 1024 * 1024; // 5 MB safety limit

function enforceInputLimit(val: unknown): void {
  if (typeof val === 'string' && val.length > MAX_INPUT_BYTES) {
    throw new Error(`Input size exceeds the 5 MB safety limit (${Math.round(val.length / (1024 * 1024))} MB).`);
  }
}

// ── Node Definitions ─────────────────────────────────────────────────────────

export const NODE_DEFINITIONS: Record<WorkflowNodeType, NodeDefinition> = {
  // 1. JSON Input
  'json-input': {
    type: 'json-input',
    label: 'JSON Input',
    category: 'input',
    description: 'Provide raw or pre-structured JSON payload as the entrypoint for your workflow.',
    icon: 'Database',
    defaultConfig: {
      rawJson: '{\n  "event": "order.completed",\n  "userId": "usr_9482",\n  "amount": 149.50,\n  "currency": "USD",\n  "status": "success"\n}',
      validateJson: true,
    },
    inputs: [],
    outputs: [
      {
        id: 'output',
        name: 'JSON Data',
        type: 'json',
        description: 'Validated JSON object or array',
      },
    ],
    execute: async (node) => {
      const raw = String(node.config.rawJson ?? '').trim();
      enforceInputLimit(raw);

      if (!raw) {
        throw new Error('JSON Input is empty. Provide a valid JSON string or object.');
      }

      const shouldValidate = node.config.validateJson !== false;
      if (shouldValidate) {
        try {
          const parsed = JSON.parse(raw);
          return { output: parsed };
        } catch (e) {
          throw new Error(`Invalid JSON syntax in input: ${e instanceof Error ? e.message : 'Parse error'}`);
        }
      }

      return { output: raw };
    },
  },

  // 2. JSON Formatter & Validator
  'json-formatter': {
    type: 'json-formatter',
    label: 'JSON Formatter',
    category: 'transform',
    description: 'Validate, reformat, and pretty-print or minify JSON payloads.',
    icon: 'Code2',
    defaultConfig: {
      indent: 2,
      minify: false,
    },
    inputs: [
      {
        id: 'input',
        name: 'Input Data',
        type: 'any',
        description: 'Raw string or parsed JSON object',
      },
    ],
    outputs: [
      {
        id: 'output',
        name: 'Formatted JSON',
        type: 'string',
        description: 'Formatted or minified JSON string',
      },
    ],
    execute: async (node, inputs) => {
      const raw = inputs.input;
      if (raw === undefined || raw === null || (typeof raw === 'string' && !raw.trim())) {
        throw new Error('JSON Formatter received empty input.');
      }

      enforceInputLimit(raw);

      let parsed: unknown;
      if (typeof raw === 'string') {
        try {
          parsed = JSON.parse(raw.trim());
        } catch (e) {
          throw new Error(`JSON Formatter received invalid JSON string: ${e instanceof Error ? e.message : 'Syntax error'}`);
        }
      } else {
        parsed = raw;
      }

      const isMinify = Boolean(node.config.minify);
      const indent = isMinify ? 0 : Number(node.config.indent || 2);
      const outputStr = isMinify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent);

      return { output: outputStr };
    },
  },

  // 3. Base64 Encode
  'base64-encode': {
    type: 'base64-encode',
    label: 'Base64 Encode',
    category: 'transform',
    description: 'Encode text strings to UTF-8 Base64 or URL-safe Base64.',
    icon: 'Zap',
    defaultConfig: {
      urlSafe: false,
    },
    inputs: [
      {
        id: 'input',
        name: 'Plain Text',
        type: 'string',
        description: 'String to encode',
      },
    ],
    outputs: [
      {
        id: 'output',
        name: 'Base64 Output',
        type: 'binary_base64',
        description: 'Base64 encoded string',
      },
    ],
    execute: async (node, inputs) => {
      let rawInput = inputs.input;
      if (rawInput === undefined || rawInput === null) {
        throw new Error('Base64 Encode received no input.');
      }

      const raw: string = typeof rawInput === 'string' ? rawInput : JSON.stringify(rawInput);

      enforceInputLimit(raw);

      // UTF-8 bytes to binary string
      const bytes = new TextEncoder().encode(raw);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      let b64 = btoa(binary);

      if (node.config.urlSafe) {
        b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      }

      return { output: b64 };
    },
  },

  // 4. Base64 Decode
  'base64-decode': {
    type: 'base64-decode',
    label: 'Base64 Decode',
    category: 'transform',
    description: 'Decode Base64 strings (standard or URL-safe) back into UTF-8 text.',
    icon: 'Zap',
    defaultConfig: {},
    inputs: [
      {
        id: 'input',
        name: 'Base64 String',
        type: 'binary_base64',
        description: 'Base64 string to decode',
      },
    ],
    outputs: [
      {
        id: 'output',
        name: 'Decoded Text',
        type: 'string',
        description: 'Decoded UTF-8 string',
      },
    ],
    execute: async (_node, inputs) => {
      const raw = inputs.input;
      if (typeof raw !== 'string' || !raw.trim()) {
        throw new Error('Base64 Decode received invalid or empty input string.');
      }

      enforceInputLimit(raw);

      const normalized = raw.trim().replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');

      try {
        const binary = atob(padded);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const decoded = new TextDecoder().decode(bytes);
        return { output: decoded };
      } catch (e) {
        throw new Error(`Failed to decode Base64 string: ${e instanceof Error ? e.message : 'Invalid padding/characters'}`);
      }
    },
  },

  // 5. Regex Match & Filter
  'regex-match': {
    type: 'regex-match',
    label: 'Regex Matcher',
    category: 'transform',
    description: 'Test, extract, or filter lines using a Regular Expression pattern.',
    icon: 'FileCode',
    defaultConfig: {
      pattern: '([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})',
      flags: 'g',
      mode: 'extract_matches', // 'extract_matches' | 'filter_lines' | 'test'
    },
    inputs: [
      {
        id: 'input',
        name: 'Text Input',
        type: 'string',
        description: 'Text or stringified JSON to match against',
      },
    ],
    outputs: [
      {
        id: 'output',
        name: 'Matches / Result',
        type: 'any',
        description: 'Extracted matches (JSON array) or filtered lines',
      },
    ],
    execute: async (node, inputs) => {
      const rawText = inputs.input;
      if (rawText === undefined || rawText === null) {
        throw new Error('Regex Matcher received no input.');
      }
      const text: string = typeof rawText === 'string' ? rawText : JSON.stringify(rawText, null, 2);

      enforceInputLimit(text);

      const patternStr = String(node.config.pattern || '');
      if (!patternStr) {
        throw new Error('Regex pattern is empty.');
      }

      const flags = String(node.config.flags || 'g');
      let regex: RegExp;
      try {
        regex = new RegExp(patternStr, flags);
      } catch (e) {
        throw new Error(`Invalid Regular Expression syntax /${patternStr}/${flags}: ${e instanceof Error ? e.message : 'Invalid syntax'}`);
      }

      const mode = (node.config.mode as string) || 'extract_matches';

      if (mode === 'test') {
        const passed = regex.test(text);
        return { output: passed };
      }

      if (mode === 'filter_lines') {
        const lines = text.split('\n');
        const matched = lines.filter((l: string) => new RegExp(patternStr, flags.replace(/g/g, '')).test(l));
        return { output: matched.join('\n') };
      }

      // extract_matches default
      const matches: string[] = [];
      if (flags.includes('g')) {
        const all = text.match(regex);
        if (all) {
          all.forEach((m) => matches.push(m));
        }
      } else {
        const match = regex.exec(text);
        if (match) {
          matches.push(match[0]);
        }
      }

      return { output: matches };
    },
  },

  // 6. SHA-256 Hash
  'hash-sha256': {
    type: 'hash-sha256',
    label: 'SHA-256 Hash',
    category: 'security',
    description: 'Compute a cryptographic SHA-256 digest locally via Web Crypto API.',
    icon: 'ShieldCheck',
    defaultConfig: {
      outputFormat: 'hex', // 'hex' | 'base64'
    },
    inputs: [
      {
        id: 'input',
        name: 'Raw Data',
        type: 'string',
        description: 'Input data to hash',
      },
    ],
    outputs: [
      {
        id: 'output',
        name: 'SHA-256 Hash',
        type: 'string',
        description: 'Cryptographic digest',
      },
    ],
    execute: async (node, inputs) => {
      const rawData = inputs.input;
      if (rawData === undefined || rawData === null) {
        throw new Error('SHA-256 node received no input data.');
      }
      const data: string = typeof rawData === 'string' ? rawData : JSON.stringify(rawData);

      enforceInputLimit(data);

      const encoded = new TextEncoder().encode(data);
      let hashBuffer: ArrayBuffer;

      // Browser vs Node environment fallback (for Jest test execution)
      if (typeof window !== 'undefined' && window.crypto?.subtle) {
        hashBuffer = await window.crypto.subtle.digest('SHA-256', encoded);
      } else if (typeof globalThis !== 'undefined' && (globalThis as any).crypto?.subtle) {
        hashBuffer = await (globalThis as any).crypto.subtle.digest('SHA-256', encoded);
      } else {
        // Node.js crypto fallback
        const cryptoModule = await import('crypto');
        const hash = cryptoModule.createHash('sha256').update(encoded).digest();
        hashBuffer = hash.buffer.slice(hash.byteOffset, hash.byteOffset + hash.byteLength);
      }

      const hashArray = Array.from(new Uint8Array(hashBuffer));
      if (node.config.outputFormat === 'base64') {
        let binary = '';
        hashArray.forEach((b) => (binary += String.fromCharCode(b)));
        return { output: btoa(binary) };
      }

      const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      return { output: hex };
    },
  },

  // 7. Conditional Branch
  'conditional-branch': {
    type: 'conditional-branch',
    label: 'Conditional Branch',
    category: 'logic',
    description: 'Split the pipeline into True/False branches based on inspection criteria.',
    icon: 'GitBranch',
    defaultConfig: {
      conditionType: 'contains', // 'contains' | 'json_key_exists' | 'is_truthy' | 'regex'
      conditionValue: '',
    },
    inputs: [
      {
        id: 'input',
        name: 'Evaluation Input',
        type: 'any',
        description: 'Data to evaluate',
      },
    ],
    outputs: [
      {
        id: 'true_output',
        name: 'True Path',
        type: 'any',
        description: 'Routes payload when condition is met',
      },
      {
        id: 'false_output',
        name: 'False Path',
        type: 'any',
        description: 'Routes payload when condition fails',
      },
    ],
    execute: async (node, inputs) => {
      const data = inputs.input;
      if (data === undefined || data === null) {
        throw new Error('Conditional Branch received no input data to evaluate.');
      }

      const condType = String(node.config.conditionType || 'contains');
      const condVal = String(node.config.conditionValue || '');

      let passes = false;

      switch (condType) {
        case 'contains': {
          const str = typeof data === 'string' ? data : JSON.stringify(data);
          passes = str.includes(condVal);
          break;
        }
        case 'json_key_exists': {
          if (data && typeof data === 'object') {
            passes = condVal in (data as Record<string, unknown>);
          } else if (typeof data === 'string') {
            try {
              const parsed = JSON.parse(data);
              passes = parsed && typeof parsed === 'object' && condVal in parsed;
            } catch {
              passes = false;
            }
          }
          break;
        }
        case 'regex': {
          const str = typeof data === 'string' ? data : JSON.stringify(data);
          const re = new RegExp(condVal);
          passes = re.test(str);
          break;
        }
        case 'is_truthy':
        default: {
          passes = Boolean(data) && data !== 'false' && data !== '0';
          break;
        }
      }

      // Return both ports: the branch that passed gets the data,
      // the branch that did not gets undefined, causing the engine to skip downstream on that port
      if (passes) {
        return {
          true_output: data,
          false_output: undefined,
          __branchTaken: 'true',
        };
      } else {
        return {
          true_output: undefined,
          false_output: data,
          __branchTaken: 'false',
        };
      }
    },
  },

  // 8. Output Sink
  'output-sink': {
    type: 'output-sink',
    label: 'Output Preview',
    category: 'output',
    description: 'Capture, inspect, copy, and export final transformed pipeline data.',
    icon: 'Layers',
    defaultConfig: {
      label: 'Final Result',
    },
    inputs: [
      {
        id: 'input',
        name: 'Input Data',
        type: 'any',
        description: 'Data to preview and save',
      },
    ],
    outputs: [],
    execute: async (node, inputs) => {
      const data = inputs.input;
      if (data === undefined) {
        throw new Error('Output Sink received no input data.');
      }

      return {
        capturedData: data,
        byteSize: typeof data === 'string' ? data.length : JSON.stringify(data).length,
      };
    },
  },
};

export function getNodeDefinition(type: WorkflowNodeType): NodeDefinition {
  const def = NODE_DEFINITIONS[type];
  if (!def) {
    throw new Error(`Unregistered workflow node type: "${type}".`);
  }
  return def;
}
