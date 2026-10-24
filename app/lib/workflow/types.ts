export type PortDataType = 'any' | 'string' | 'json' | 'binary_base64' | 'boolean';

export type WorkflowNodeType =
  | 'json-input'
  | 'json-formatter'
  | 'base64-encode'
  | 'base64-decode'
  | 'regex-match'
  | 'hash-sha256'
  | 'conditional-branch'
  | 'output-sink';

export interface WorkflowPort {
  id: string;
  name: string;
  type: PortDataType;
  description?: string;
}

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  position: { x: number; y: number };
  config: Record<string, unknown>;
  inputs: WorkflowPort[];
  outputs: WorkflowPort[];
}

export interface WorkflowEdge {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
}

export interface ExecutionSettings {
  stop_on_error: boolean;
  max_execution_time_ms: number;
  log_level: 'verbose' | 'info' | 'error';
}

export interface ErrorBoundaryConfig {
  action: 'halt' | 'fallback_node';
  fallback_step_id?: string | null;
}

export interface WorkflowSchemaV1 {
  pipeline_id: string;
  version: '1.0.0';
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  execution_settings: ExecutionSettings;
  error_boundary?: ErrorBoundaryConfig;
  created_at?: string;
  updated_at?: string;
}

export type NodeExecutionStatus = 'idle' | 'running' | 'success' | 'error' | 'skipped';

export interface NodeExecutionState {
  status: NodeExecutionStatus;
  inputData?: unknown;
  outputData?: unknown;
  errorMessage?: string;
  durationMs?: number;
  executedAt?: number;
}

export interface ExecutionLogEntry {
  id: string;
  timestamp: number;
  nodeId: string;
  nodeLabel: string;
  nodeType: WorkflowNodeType;
  status: NodeExecutionStatus;
  durationMs: number;
  inputSummary?: string;
  outputSummary?: string;
  error?: string;
}

export interface WorkflowExecutionReport {
  pipelineId: string;
  success: boolean;
  totalDurationMs: number;
  nodeStates: Record<string, NodeExecutionState>;
  logs: ExecutionLogEntry[];
  finalOutputs: Record<string, unknown>;
  error?: string;
}

export interface NodeDefinition {
  type: WorkflowNodeType;
  label: string;
  category: 'input' | 'transform' | 'logic' | 'security' | 'output';
  description: string;
  icon: string;
  defaultConfig: Record<string, unknown>;
  inputs: WorkflowPort[];
  outputs: WorkflowPort[];
  execute: (
    node: WorkflowNode,
    inputs: Record<string, unknown>,
    context: { signal?: AbortSignal }
  ) => Promise<Record<string, unknown>>;
}
