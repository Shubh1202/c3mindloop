import { GraphNode, GraphEdge } from './graphTypes';

const NODE_MIN_WIDTH = 180;
const NODE_MAX_WIDTH = 320;
const CHAR_PX = 7; // approximate px per character in the label/value
const HEADER_HEIGHT = 36;
const ROW_HEIGHT = 24;
const NODE_PADDING = 16;
const HORIZONTAL_GAP = 60;
const VERTICAL_GAP = 24;

function computeNodeDimensions(node: GraphNode): { width: number; height: number } {
  // Width: based on longest content line
  let maxLineLen = node.label.length + 4; // header label
  for (const row of node.rows) {
    const lineLen = row.key.length + row.displayValue.length + 4;
    if (lineLen > maxLineLen) maxLineLen = lineLen;
  }
  const contentWidth = maxLineLen * CHAR_PX + NODE_PADDING * 2;
  const width = Math.max(NODE_MIN_WIDTH, Math.min(NODE_MAX_WIDTH, contentWidth));

  // Height: header + rows
  const height = HEADER_HEIGHT + node.rows.length * ROW_HEIGHT + NODE_PADDING;
  return { width, height };
}

export function computeLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  collapsedNodes: Set<string>
): GraphNode[] {
  if (nodes.length === 0) return [];

  // Build parent → children map using edges
  const childrenMap = new Map<string, string[]>();
  for (const node of nodes) {
    childrenMap.set(node.id, []);
  }
  for (const edge of edges) {
    const children = childrenMap.get(edge.sourceId);
    if (children) {
      children.push(edge.targetId);
    }
  }

  // Find root(s): nodes with no parent
  const hasParent = new Set(edges.map((e) => e.targetId));
  const roots = nodes.filter((n) => !hasParent.has(n.id));

  // Compute dimensions for each node
  const dimensionMap = new Map<string, { width: number; height: number }>();
  for (const node of nodes) {
    dimensionMap.set(node.id, computeNodeDimensions(node));
  }

  // Build a node map for quick lookup
  const nodeMap = new Map<string, GraphNode>();
  for (const node of nodes) {
    nodeMap.set(node.id, node);
  }

  // Iterative layout: BFS level by level
  // We assign x based on depth, y based on subtree position
  const updatedNodes = new Map<string, GraphNode>();

  // Compute subtree height for vertical distribution
  // subtreeHeight = sum of all visible leaf-level heights + gaps
  function getVisibleChildren(nodeId: string): string[] {
    const node = nodeMap.get(nodeId);
    if (!node) return [];
    if (collapsedNodes.has(nodeId)) return [];
    return childrenMap.get(nodeId) ?? [];
  }

  // Recursively compute the "layout height" of a subtree
  const subtreeHeightCache = new Map<string, number>();
  function computeSubtreeHeight(nodeId: string): number {
    if (subtreeHeightCache.has(nodeId)) return subtreeHeightCache.get(nodeId)!;
    const dim = dimensionMap.get(nodeId) ?? { width: NODE_MIN_WIDTH, height: 60 };
    const visChildren = getVisibleChildren(nodeId);
    if (visChildren.length === 0) {
      subtreeHeightCache.set(nodeId, dim.height);
      return dim.height;
    }
    // Sum of children subtree heights + gaps between them
    let total = 0;
    for (let i = 0; i < visChildren.length; i++) {
      total += computeSubtreeHeight(visChildren[i]);
      if (i < visChildren.length - 1) total += VERTICAL_GAP;
    }
    const result = Math.max(dim.height, total);
    subtreeHeightCache.set(nodeId, result);
    return result;
  }

  // Iterative DFS layout using a stack to avoid recursion depth issues
  interface LayoutTask {
    nodeId: string;
    x: number;
    centerY: number;
  }

  const stack: LayoutTask[] = [];

  for (const root of roots) {
    stack.push({ nodeId: root.id, x: 0, centerY: 0 });
  }

  // If multiple roots, stack them vertically
  if (roots.length > 1) {
    let currentY = 0;
    stack.length = 0;
    for (const root of roots) {
      const h = computeSubtreeHeight(root.id);
      stack.push({ nodeId: root.id, x: 0, centerY: currentY + h / 2 });
      currentY += h + VERTICAL_GAP;
    }
  }

  const visited = new Set<string>();

  // Process stack iteratively
  while (stack.length > 0) {
    const task = stack.pop()!;
    const { nodeId, x, centerY } = task;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    const dim = dimensionMap.get(nodeId) ?? { width: NODE_MIN_WIDTH, height: 60 };
    const nodeX = x;
    const nodeY = centerY - dim.height / 2;

    const original = nodeMap.get(nodeId)!;
    updatedNodes.set(nodeId, {
      ...original,
      x: nodeX,
      y: nodeY,
      width: dim.width,
      height: dim.height,
    });

    const visChildren = getVisibleChildren(nodeId);
    if (visChildren.length === 0) continue;

    const childX = nodeX + dim.width + HORIZONTAL_GAP;

    // Compute total subtree height for all children
    const childSubtreeHeights = visChildren.map((cid) => computeSubtreeHeight(cid));
    const totalChildHeight =
      childSubtreeHeights.reduce((a, b) => a + b, 0) + VERTICAL_GAP * (visChildren.length - 1);

    // Push children in reverse order so the first child is processed first (LIFO)
    for (let i = visChildren.length - 1; i >= 0; i--) {
      const childId = visChildren[i];

      // Compute this child's center Y by summing all preceding children heights
      let accY = centerY - totalChildHeight / 2;
      for (let j = 0; j < i; j++) {
        accY += childSubtreeHeights[j] + VERTICAL_GAP;
      }
      const childCenterY = accY + childSubtreeHeights[i] / 2;

      stack.push({ nodeId: childId, x: childX, centerY: childCenterY });
    }
  }

  // Return updated nodes array preserving original order
  return nodes.map((n) => updatedNodes.get(n.id) ?? n);
}
