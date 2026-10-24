import { WorkflowSchemaV1, WorkflowNodeType } from './types';

export const SUPPORTED_NODE_TYPES: WorkflowNodeType[] = [
  'json-input',
  'json-formatter',
  'base64-encode',
  'base64-decode',
  'regex-match',
  'hash-sha256',
  'conditional-branch',
  'output-sink',
];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  schema?: WorkflowSchemaV1;
}

/**
 * Validates a workflow JSON object against the versioned WorkflowSchemaV1.
 */
export function validateWorkflowSchema(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      valid: false,
      errors: ['Schema payload must be a JSON object.'],
      warnings: [],
    };
  }

  const obj = data as Record<string, unknown>;

  // Check version
  if (!obj.version || typeof obj.version !== 'string') {
    errors.push('Missing or invalid "version" field. Expected "1.0.0".');
  } else if (obj.version !== '1.0.0') {
    errors.push(`Unsupported schema version "${obj.version}". Supported versions: "1.0.0".`);
  }

  // Check pipeline_id
  if (!obj.pipeline_id || typeof obj.pipeline_id !== 'string') {
    errors.push('Missing or invalid "pipeline_id". Must be a non-empty string identifier.');
  }

  // Check description
  if (obj.description !== undefined && typeof obj.description !== 'string') {
    warnings.push('"description" should be a string.');
  }

  // Check nodes
  if (!Array.isArray(obj.nodes)) {
    errors.push('Missing or invalid "nodes" array.');
  }

  // Check edges
  if (!Array.isArray(obj.edges)) {
    errors.push('Missing or invalid "edges" array.');
  }

  const nodeIds = new Set<string>();

  if (Array.isArray(obj.nodes)) {
    obj.nodes.forEach((node, idx) => {
      if (!node || typeof node !== 'object') {
        errors.push(`Node at index ${idx} is not an object.`);
        return;
      }

      const n = node as Record<string, unknown>;

      if (!n.id || typeof n.id !== 'string') {
        errors.push(`Node at index ${idx} is missing a valid "id".`);
      } else {
        if (nodeIds.has(n.id)) {
          errors.push(`Duplicate node id "${n.id}" found.`);
        }
        nodeIds.add(n.id);
      }

      if (!n.type || typeof n.type !== 'string') {
        errors.push(`Node "${n.id || idx}" has no "type" specified.`);
      } else if (!SUPPORTED_NODE_TYPES.includes(n.type as WorkflowNodeType)) {
        errors.push(
          `Node "${n.id || idx}" has unknown type "${n.type}". Supported types: ${SUPPORTED_NODE_TYPES.join(', ')}.`
        );
      }

      if (!n.position || typeof n.position !== 'object') {
        warnings.push(`Node "${n.id || idx}" has missing or invalid position coordinates. Defaulting to (0,0).`);
      }
    });
  }

  if (Array.isArray(obj.edges)) {
    obj.edges.forEach((edge, idx) => {
      if (!edge || typeof edge !== 'object') {
        errors.push(`Edge at index ${idx} is not an object.`);
        return;
      }

      const e = edge as Record<string, unknown>;

      if (!e.id || typeof e.id !== 'string') {
        errors.push(`Edge at index ${idx} is missing a valid "id".`);
      }

      if (!e.sourceNodeId || typeof e.sourceNodeId !== 'string') {
        errors.push(`Edge at index ${idx} is missing "sourceNodeId".`);
      } else if (!nodeIds.has(e.sourceNodeId)) {
        errors.push(`Edge "${e.id || idx}" references non-existent source node "${e.sourceNodeId}".`);
      }

      if (!e.targetNodeId || typeof e.targetNodeId !== 'string') {
        errors.push(`Edge at index ${idx} is missing "targetNodeId".`);
      } else if (!nodeIds.has(e.targetNodeId)) {
        errors.push(`Edge "${e.id || idx}" references non-existent target node "${e.targetNodeId}".`);
      }
    });
  }

  // Execution settings defaults
  const execSettings = (obj.execution_settings && typeof obj.execution_settings === 'object')
    ? (obj.execution_settings as Record<string, unknown>)
    : {};

  const cleanSchema: WorkflowSchemaV1 = {
    pipeline_id: String(obj.pipeline_id || 'workflow-pipeline'),
    version: '1.0.0',
    description: typeof obj.description === 'string' ? obj.description : '',
    nodes: Array.isArray(obj.nodes)
      ? obj.nodes.map((node, i) => {
          const n = node as Record<string, unknown>;
          return {
            id: String(n.id || `node-${i + 1}`),
            type: (n.type as WorkflowNodeType) || 'json-input',
            label: typeof n.label === 'string' ? n.label : String(n.type || 'Node'),
            position: {
              x: typeof (n.position as any)?.x === 'number' ? (n.position as any).x : 100 + i * 260,
              y: typeof (n.position as any)?.y === 'number' ? (n.position as any).y : 120,
            },
            config: (n.config && typeof n.config === 'object' && !Array.isArray(n.config)) ? (n.config as Record<string, unknown>) : {},
            inputs: Array.isArray(n.inputs) ? (n.inputs as any) : [],
            outputs: Array.isArray(n.outputs) ? (n.outputs as any) : [],
          };
        })
      : [],
    edges: Array.isArray(obj.edges)
      ? obj.edges.map((edge, i) => {
          const e = edge as Record<string, unknown>;
          return {
            id: String(e.id || `edge-${i + 1}`),
            sourceNodeId: String(e.sourceNodeId),
            sourcePortId: String(e.sourcePortId || 'output'),
            targetNodeId: String(e.targetNodeId),
            targetPortId: String(e.targetPortId || 'input'),
          };
        })
      : [],
    execution_settings: {
      stop_on_error: typeof execSettings.stop_on_error === 'boolean' ? execSettings.stop_on_error : true,
      max_execution_time_ms: typeof execSettings.max_execution_time_ms === 'number' ? execSettings.max_execution_time_ms : 10000,
      log_level: execSettings.log_level === 'error' || execSettings.log_level === 'verbose' ? execSettings.log_level : 'info',
    },
    error_boundary: (obj.error_boundary && typeof obj.error_boundary === 'object')
      ? (obj.error_boundary as any)
      : { action: 'halt', fallback_step_id: null },
    created_at: typeof obj.created_at === 'string' ? obj.created_at : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    schema: errors.length === 0 ? cleanSchema : undefined,
  };
}
