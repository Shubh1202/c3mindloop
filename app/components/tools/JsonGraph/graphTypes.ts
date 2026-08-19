export interface GraphNode {
  id: string;
  label: string;
  type: 'object' | 'array' | 'scalar_container';
  rows: GraphRow[];
  childEdges: string[];
  depth: number;
  collapsed: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  parentId: string | null;
  /** Full dot/bracket path, e.g. "root.address.city" or "root.products[0].name" */
  path: string;
}

export interface GraphRow {
  key: string;
  valueType: 'string' | 'number' | 'boolean' | 'null' | 'object_ref' | 'array_ref';
  displayValue: string;
  /** Full dot/bracket path to this specific row value */
  path: string;
}

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
}

export interface GraphTransform {
  x: number;
  y: number;
  scale: number;
}

export interface GraphStats {
  totalKeys: number;
  maxDepth: number;
  objectCount: number;
  arrayCount: number;
  nullCount: number;
}
