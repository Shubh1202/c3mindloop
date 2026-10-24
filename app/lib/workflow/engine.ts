import {
  WorkflowSchemaV1,
  WorkflowNode,
  WorkflowEdge,
  WorkflowExecutionReport,
  NodeExecutionState,
  ExecutionLogEntry,
} from './types';
import { getNodeDefinition } from './registry';

export interface GraphValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  topologicalOrder: string[];
  cyclePath?: string[];
}

/**
 * Validates the graph topology, detects cycles, and calculates topological execution order.
 */
export function validateGraphTopology(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): GraphValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const nodeMap = new Map<string, WorkflowNode>(nodes.map((n) => [n.id, n]));

  // 1. Verify edges point to existent nodes
  edges.forEach((edge) => {
    if (!nodeMap.has(edge.sourceNodeId)) {
      errors.push(`Edge connects from non-existent node "${edge.sourceNodeId}".`);
    }
    if (!nodeMap.has(edge.targetNodeId)) {
      errors.push(`Edge connects to non-existent node "${edge.targetNodeId}".`);
    }
  });

  if (errors.length > 0) {
    return { valid: false, errors, warnings, topologicalOrder: [] };
  }

  // 2. Build adjacency list and in-degree map for Kahn's algorithm
  const adj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  nodes.forEach((n) => {
    adj.set(n.id, []);
    inDegree.set(n.id, 0);
  });

  edges.forEach((e) => {
    adj.get(e.sourceNodeId)?.push(e.targetNodeId);
    inDegree.set(e.targetNodeId, (inDegree.get(e.targetNodeId) || 0) + 1);
  });

  // Check for orphan transform/output nodes (warning)
  nodes.forEach((n) => {
    const hasIncoming = (inDegree.get(n.id) || 0) > 0;
    const hasOutgoing = (adj.get(n.id) || []).length > 0;
    if (n.type !== 'json-input' && !hasIncoming) {
      warnings.push(`Node "${n.label}" (${n.id}) has no incoming inputs.`);
    }
    if (n.type !== 'output-sink' && !hasOutgoing) {
      warnings.push(`Node "${n.label}" (${n.id}) has no outgoing connections.`);
    }
  });

  // Kahn's algorithm for topological sorting and cycle detection
  const queue: string[] = [];
  inDegree.forEach((deg, id) => {
    if (deg === 0) queue.push(id);
  });

  const topologicalOrder: string[] = [];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    topologicalOrder.push(curr);

    const neighbors = adj.get(curr) || [];
    for (const neighbor of neighbors) {
      const newDeg = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, newDeg);
      if (newDeg === 0) {
        queue.push(neighbor);
      }
    }
  }

  // If topologicalOrder count does not match node count, there is at least one cycle!
  if (topologicalOrder.length < nodes.length) {
    const cycleCandidates = nodes
      .filter((n) => (inDegree.get(n.id) || 0) > 0)
      .map((n) => n.id);

    errors.push(
      `Cycle detected in graph! Workflow execution requires a Directed Acyclic Graph (DAG). Nodes involved in cycle: ${cycleCandidates.join(', ')}`
    );

    return {
      valid: false,
      errors,
      warnings,
      topologicalOrder: [],
      cyclePath: cycleCandidates,
    };
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    topologicalOrder,
  };
}

export interface RunWorkflowOptions {
  onStepUpdate?: (nodeId: string, state: NodeExecutionState) => void;
  signal?: AbortSignal;
}

/**
 * Pure client-side execution engine for declarative DAG workflows.
 */
export async function executeWorkflow(
  schema: WorkflowSchemaV1,
  options?: RunWorkflowOptions
): Promise<WorkflowExecutionReport> {
  const startTime = performance.now();
  const nodeStates: Record<string, NodeExecutionState> = {};
  const logs: ExecutionLogEntry[] = [];
  const finalOutputs: Record<string, unknown> = {};

  const nodeMap = new Map<string, WorkflowNode>(schema.nodes.map((n) => [n.id, n]));

  // Initialise all node states
  schema.nodes.forEach((n) => {
    nodeStates[n.id] = { status: 'idle' };
  });

  // 1. Validate graph topology and compute execution order
  const validation = validateGraphTopology(schema.nodes, schema.edges);
  if (!validation.valid) {
    const errorMsg = validation.errors.join(' ');
    schema.nodes.forEach((n) => {
      nodeStates[n.id] = { status: 'error', errorMessage: errorMsg };
    });

    return {
      pipelineId: schema.pipeline_id,
      success: false,
      totalDurationMs: Math.round(performance.now() - startTime),
      nodeStates,
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: Date.now(),
          nodeId: 'pipeline',
          nodeLabel: 'Pipeline Validation',
          nodeType: 'json-input',
          status: 'error',
          durationMs: 0,
          error: errorMsg,
        },
      ],
      finalOutputs: {},
      error: errorMsg,
    };
  }

  // Pre-index incoming edges per target node
  const incomingEdges = new Map<string, WorkflowEdge[]>();
  schema.edges.forEach((e) => {
    if (!incomingEdges.has(e.targetNodeId)) {
      incomingEdges.set(e.targetNodeId, []);
    }
    incomingEdges.get(e.targetNodeId)!.push(e);
  });

  // Storage for values produced at ports: key = `${nodeId}:${portId}`
  const portData = new Map<string, unknown>();

  let hasFatalError = false;

  // 2. Iterate nodes in topological order
  for (const nodeId of validation.topologicalOrder) {
    if (options?.signal?.aborted) {
      nodeStates[nodeId] = { status: 'skipped', errorMessage: 'Execution aborted by user.' };
      continue;
    }

    const node = nodeMap.get(nodeId);
    if (!node) continue;

    const inEdges = incomingEdges.get(nodeId) || [];

    // Check upstream status
    let upstreamFailed = false;
    let upstreamSkipped = false;
    let allInputsUndefined = inEdges.length > 0;

    for (const edge of inEdges) {
      const srcState = nodeStates[edge.sourceNodeId];
      if (srcState?.status === 'error') {
        upstreamFailed = true;
      }
      if (srcState?.status === 'skipped') {
        upstreamSkipped = true;
      }

      const portVal = portData.get(`${edge.sourceNodeId}:${edge.sourcePortId}`);
      if (portVal !== undefined) {
        allInputsUndefined = false;
      }
    }

    // Skip node if upstream failed, skipped, or all inputs are undefined from untaken condition branches
    if (upstreamFailed) {
      const state: NodeExecutionState = {
        status: 'skipped',
        errorMessage: 'Skipped: Upstream dependency failed.',
      };
      nodeStates[nodeId] = state;
      options?.onStepUpdate?.(nodeId, state);
      logs.push({
        id: `log-${nodeId}-${Date.now()}`,
        timestamp: Date.now(),
        nodeId,
        nodeLabel: node.label,
        nodeType: node.type,
        status: 'skipped',
        durationMs: 0,
        error: 'Skipped: Upstream dependency failed.',
      });
      continue;
    }

    if (upstreamSkipped || (inEdges.length > 0 && allInputsUndefined)) {
      const state: NodeExecutionState = {
        status: 'skipped',
        errorMessage: 'Skipped: Inactive conditional branch.',
      };
      nodeStates[nodeId] = state;
      options?.onStepUpdate?.(nodeId, state);
      logs.push({
        id: `log-${nodeId}-${Date.now()}`,
        timestamp: Date.now(),
        nodeId,
        nodeLabel: node.label,
        nodeType: node.type,
        status: 'skipped',
        durationMs: 0,
      });
      continue;
    }

    if (hasFatalError && schema.execution_settings.stop_on_error) {
      const state: NodeExecutionState = {
        status: 'skipped',
        errorMessage: 'Skipped: Pipeline halted due to error.',
      };
      nodeStates[nodeId] = state;
      options?.onStepUpdate?.(nodeId, state);
      continue;
    }

    // Gather input values for this node
    const inputValues: Record<string, unknown> = {};
    inEdges.forEach((edge) => {
      const val = portData.get(`${edge.sourceNodeId}:${edge.sourcePortId}`);
      inputValues[edge.targetPortId] = val;
    });

    // Notify node running
    options?.onStepUpdate?.(nodeId, {
      status: 'running',
      inputData: inputValues,
    });

    const stepStart = performance.now();
    try {
      const nodeDef = getNodeDefinition(node.type);
      const outputValues = await nodeDef.execute(node, inputValues, {
        signal: options?.signal,
      });

      const durationMs = Math.round(performance.now() - stepStart);

      // Save port data
      Object.entries(outputValues).forEach(([portId, val]) => {
        portData.set(`${nodeId}:${portId}`, val);
      });

      if (node.type === 'output-sink') {
        finalOutputs[nodeId] = outputValues.capturedData;
      }

      const state: NodeExecutionState = {
        status: 'success',
        inputData: inputValues,
        outputData: outputValues,
        durationMs,
        executedAt: Date.now(),
      };
      nodeStates[nodeId] = state;
      options?.onStepUpdate?.(nodeId, state);

      logs.push({
        id: `log-${nodeId}-${Date.now()}`,
        timestamp: Date.now(),
        nodeId,
        nodeLabel: node.label,
        nodeType: node.type,
        status: 'success',
        durationMs,
        inputSummary: summarizeData(inputValues),
        outputSummary: summarizeData(outputValues),
      });
    } catch (e) {
      const durationMs = Math.round(performance.now() - stepStart);
      const errorMsg = e instanceof Error ? e.message : 'Step processing failed.';
      hasFatalError = true;

      const state: NodeExecutionState = {
        status: 'error',
        inputData: inputValues,
        errorMessage: errorMsg,
        durationMs,
        executedAt: Date.now(),
      };
      nodeStates[nodeId] = state;
      options?.onStepUpdate?.(nodeId, state);

      logs.push({
        id: `log-${nodeId}-${Date.now()}`,
        timestamp: Date.now(),
        nodeId,
        nodeLabel: node.label,
        nodeType: node.type,
        status: 'error',
        durationMs,
        inputSummary: summarizeData(inputValues),
        error: errorMsg,
      });
    }
  }

  const totalDurationMs = Math.round(performance.now() - startTime);

  return {
    pipelineId: schema.pipeline_id,
    success: !hasFatalError,
    totalDurationMs,
    nodeStates,
    logs,
    finalOutputs,
    error: hasFatalError ? 'Workflow execution encountered errors.' : undefined,
  };
}

function summarizeData(data: unknown): string {
  if (data === undefined || data === null) return '';
  if (typeof data === 'string') {
    return data.length > 80 ? data.slice(0, 80) + '…' : data;
  }
  try {
    const s = JSON.stringify(data);
    return s.length > 80 ? s.slice(0, 80) + '…' : s;
  } catch {
    return String(data);
  }
}
