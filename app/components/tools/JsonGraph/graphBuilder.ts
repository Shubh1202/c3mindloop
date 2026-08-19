import { GraphNode, GraphRow, GraphEdge, GraphStats } from './graphTypes';

const MAX_NODES = 200;
const MAX_STRING_LENGTH = 100;

function truncateString(s: string): string {
  return s.length > MAX_STRING_LENGTH ? s.slice(0, MAX_STRING_LENGTH) + '…' : s;
}

function buildPath(parentPath: string, key: string, isArrayIndex: boolean): string {
  if (parentPath === '') return key;
  if (isArrayIndex) return `${parentPath}[${key}]`;
  // use dot notation unless key has special chars
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
    ? `${parentPath}.${key}`
    : `${parentPath}["${key}"]`;
}

function scalarRow(key: string, value: unknown, rowPath: string): GraphRow {
  if (value === null) return { key, valueType: 'null', displayValue: 'null', path: rowPath };
  if (typeof value === 'boolean') return { key, valueType: 'boolean', displayValue: String(value), path: rowPath };
  if (typeof value === 'number') return { key, valueType: 'number', displayValue: String(value), path: rowPath };
  if (typeof value === 'string') return { key, valueType: 'string', displayValue: truncateString(value), path: rowPath };
  return { key, valueType: 'string', displayValue: truncateString(String(value)), path: rowPath };
}

export interface BuildResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  truncated: boolean;
  stats: GraphStats;
}

export function buildGraph(parsedJSON: unknown): BuildResult {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  let nodeCounter = 0;
  let truncated = false;

  // Stats counters
  let totalKeys = 0;
  let maxDepth = 0;
  let objectCount = 0;
  let arrayCount = 0;
  let nullCount = 0;

  interface QueueItem {
    value: unknown;
    parentId: string | null;
    label: string;
    depth: number;
    ancestorRefs: Set<object>;
    edgeId?: string;
    parentPath: string;
    isArrayIndex: boolean;
  }

  const queue: QueueItem[] = [{
    value: parsedJSON,
    parentId: null,
    label: 'root',
    depth: 0,
    ancestorRefs: new Set<object>(),
    parentPath: '',
    isArrayIndex: false,
  }];

  while (queue.length > 0) {
    if (nodes.length >= MAX_NODES) { truncated = true; break; }

    const item = queue.shift()!;
    const { value, parentId, label, depth, ancestorRefs, parentPath, isArrayIndex } = item;

    const nodeId = `node-${nodeCounter++}`;
    const nodePath = buildPath(parentPath, label, isArrayIndex);
    if (depth > maxDepth) maxDepth = depth;

    // Circular reference check
    if (value !== null && typeof value === 'object') {
      const objValue = value as object;
      if (ancestorRefs.has(objValue)) {
        const circularNode: GraphNode = {
          id: nodeId, label, type: 'scalar_container',
          rows: [{ key: '', valueType: 'string', displayValue: '[Circular]', path: nodePath }],
          childEdges: [], depth, collapsed: false,
          x: 0, y: 0, width: 180, height: 60,
          parentId, path: nodePath,
        };
        nodes.push(circularNode);
        if (item.edgeId && parentId) edges.push({ id: item.edgeId, sourceId: parentId, targetId: nodeId });
        continue;
      }
    }

    const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
    const isArray = Array.isArray(value);
    const nodeType = isArray ? 'array' : isObject ? 'object' : 'scalar_container';
    const rows: GraphRow[] = [];
    const childEdges: string[] = [];

    if (isObject) objectCount++;
    if (isArray) arrayCount++;

    const node: GraphNode = {
      id: nodeId, label, type: nodeType, rows, childEdges, depth,
      collapsed: depth >= 2, x: 0, y: 0, width: 180, height: 60,
      parentId, path: nodePath,
    };
    nodes.push(node);

    if (item.edgeId && parentId) edges.push({ id: item.edgeId, sourceId: parentId, targetId: nodeId });

    if (isObject || isArray) {
      const entries: [string, unknown][] = isArray
        ? (value as unknown[]).map((v, i) => [String(i), v])
        : Object.entries(value as Record<string, unknown>);

      const newAncestorRefs = new Set(ancestorRefs);
      newAncestorRefs.add(value as object);

      for (const [k, v] of entries) {
        totalKeys++;
        const childPath = buildPath(nodePath, k, isArray);

        if (v === null) nullCount++;

        if (v !== null && typeof v === 'object') {
          const isChildArray = Array.isArray(v);
          rows.push({
            key: k,
            valueType: isChildArray ? 'array_ref' : 'object_ref',
            displayValue: isChildArray ? '[ … ]' : '{ … }',
            path: childPath,
          });
          const childEdgeId = `edge-${nodeId}-${k}`;
          childEdges.push(childEdgeId);
          queue.push({
            value: v, parentId: nodeId, label: k,
            depth: depth + 1, ancestorRefs: newAncestorRefs,
            edgeId: childEdgeId, parentPath: nodePath, isArrayIndex: isArray,
          });
        } else {
          rows.push(scalarRow(k, v, childPath));
        }
      }
    }
  }

  return {
    nodes, edges, truncated,
    stats: { totalKeys, maxDepth, objectCount, arrayCount, nullCount },
  };
}
