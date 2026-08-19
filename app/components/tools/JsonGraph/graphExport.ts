import { GraphNode, GraphEdge } from './graphTypes';

const BG_COLOR = '#0a0a0a';
const NODE_BG = '#171717';
const NODE_BORDER = '#262626';
const NODE_TEXT = '#f5f5f5';
const KEY_COLOR = '#38bdf8';
const STRING_COLOR = '#34d399';
const NUMBER_COLOR = '#fbbf24';
const BOOL_COLOR = '#a78bfa';
const NULL_COLOR = '#737373';
const EDGE_COLOR = '#404040';
const HEADER_HEIGHT = 36;
const ROW_HEIGHT = 24;
const NODE_PADDING = 16;
const NORMAL_FONT = '11px "JetBrains Mono", monospace';
const BOLD_FONT = 'bold 12px "JetBrains Mono", monospace';

/** Safe rounded-rect helper — avoids ctx.roundRect browser compatibility issues */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.arcTo(x + w, y, x + w, y + rr, rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
  ctx.lineTo(x + rr, y + h);
  ctx.arcTo(x, y + h, x, y + h - rr, rr);
  ctx.lineTo(x, y + rr);
  ctx.arcTo(x, y, x + rr, y, rr);
  ctx.closePath();
}

function roundRectTop(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.arcTo(x + w, y, x + w, y + rr, rr);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + rr);
  ctx.arcTo(x, y, x + rr, y, rr);
  ctx.closePath();
}

export async function exportGraphAsPNG(
  nodes: GraphNode[],
  edges: GraphEdge[],
  collapsedNodes: Set<string>
): Promise<void> {
  if (nodes.length === 0) return;

  // Build children map and find visible nodes via BFS
  const childrenMap = new Map<string, string[]>();
  for (const n of nodes) childrenMap.set(n.id, []);
  for (const edge of edges) {
    const arr = childrenMap.get(edge.sourceId);
    if (arr) arr.push(edge.targetId);
  }
  const hasParent = new Set(edges.map((e) => e.targetId));
  const roots = nodes.filter((n) => !hasParent.has(n.id));

  const visibleNodeIds = new Set<string>();
  const queue: string[] = roots.map((r) => r.id);
  while (queue.length > 0) {
    const id = queue.shift()!;
    visibleNodeIds.add(id);
    if (!collapsedNodes.has(id)) {
      queue.push(...(childrenMap.get(id) ?? []));
    }
  }

  const visibleNodes = nodes.filter((n) => visibleNodeIds.has(n.id));
  if (visibleNodes.length === 0) return;

  // Bounding box of all visible nodes
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of visibleNodes) {
    if (n.x < minX) minX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.x + n.width > maxX) maxX = n.x + n.width;
    if (n.y + n.height > maxY) maxY = n.y + n.height;
  }

  const PADDING = 32;
  const offsetX = -minX + PADDING;
  const offsetY = -minY + PADDING;
  const canvasW = Math.ceil(maxX - minX + PADDING * 2);
  const canvasH = Math.ceil(maxY - minY + PADDING * 2);

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  // Background fill
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Dot-grid background
  ctx.fillStyle = '#1a1a1a';
  for (let gx = 0; gx < canvasW; gx += 24) {
    for (let gy = 0; gy < canvasH; gy += 24) {
      ctx.beginPath();
      ctx.arc(gx, gy, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw edges
  const visibleEdges = edges.filter(
    (e) => visibleNodeIds.has(e.sourceId) && visibleNodeIds.has(e.targetId)
  );
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  for (const edge of visibleEdges) {
    const src = nodeMap.get(edge.sourceId);
    const tgt = nodeMap.get(edge.targetId);
    if (!src || !tgt) continue;

    const x1 = src.x + src.width + offsetX;
    const y1 = src.y + src.height / 2 + offsetY;
    const x2 = tgt.x + offsetX;
    const y2 = tgt.y + tgt.height / 2 + offsetY;
    const midX = x1 + (x2 - x1) / 2;

    ctx.strokeStyle = EDGE_COLOR;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(midX, y1, midX, y2, x2 - 6, y2);
    ctx.stroke();

    // Arrowhead
    ctx.fillStyle = EDGE_COLOR;
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 7, y2 - 4);
    ctx.lineTo(x2 - 7, y2 + 4);
    ctx.closePath();
    ctx.fill();
  }

  // Draw nodes
  for (const node of visibleNodes) {
    const nx = node.x + offsetX;
    const ny = node.y + offsetY;
    const nw = node.width;
    const nh = node.height;

    // Node body
    ctx.fillStyle = NODE_BG;
    roundRect(ctx, nx, ny, nw, nh, 6);
    ctx.fill();
    ctx.strokeStyle = NODE_BORDER;
    ctx.lineWidth = 1;
    roundRect(ctx, nx, ny, nw, nh, 6);
    ctx.stroke();

    // Header tinted background
    ctx.fillStyle = 'rgba(255,255,255,0.035)';
    roundRectTop(ctx, nx, ny, nw, HEADER_HEIGHT, 6);
    ctx.fill();

    // Header separator
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(nx, ny + HEADER_HEIGHT);
    ctx.lineTo(nx + nw, ny + HEADER_HEIGHT);
    ctx.stroke();

    // Header label (bold)
    ctx.font = BOLD_FONT;
    ctx.fillStyle = NODE_TEXT;
    ctx.fillText(node.label, nx + NODE_PADDING, ny + HEADER_HEIGHT / 2 + 5, nw - NODE_PADDING * 3);

    // Type badge (normal font, dim)
    ctx.font = `10px "JetBrains Mono", monospace`;
    ctx.fillStyle = '#404040';
    const typeBadge = node.type === 'array' ? '[]' : node.type === 'object' ? '{}' : '';
    if (typeBadge) {
      const bw = ctx.measureText(typeBadge).width;
      ctx.fillText(typeBadge, nx + nw - NODE_PADDING - bw, ny + HEADER_HEIGHT / 2 + 5);
    }

    // Rows (normal font)
    ctx.font = NORMAL_FONT;
    for (let i = 0; i < node.rows.length; i++) {
      const row = node.rows[i];
      const rowY = ny + HEADER_HEIGHT + i * ROW_HEIGHT;
      const textY = rowY + ROW_HEIGHT / 2 + 4;

      // Row separator
      if (i > 0) {
        ctx.strokeStyle = '#1f1f1f';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(nx + NODE_PADDING / 2, rowY);
        ctx.lineTo(nx + nw - NODE_PADDING / 2, rowY);
        ctx.stroke();
      }

      let xCursor = nx + NODE_PADDING;

      if (row.key !== '') {
        ctx.fillStyle = KEY_COLOR;
        const keyText = row.key + ': ';
        ctx.fillText(keyText, xCursor, textY);
        xCursor += ctx.measureText(keyText).width;
      }

      // Value color
      switch (row.valueType) {
        case 'string': ctx.fillStyle = STRING_COLOR; break;
        case 'number': ctx.fillStyle = NUMBER_COLOR; break;
        case 'boolean': ctx.fillStyle = BOOL_COLOR; break;
        case 'null': ctx.fillStyle = NULL_COLOR; break;
        default: ctx.fillStyle = '#a1a1aa';
      }

      const maxValWidth = nx + nw - NODE_PADDING - xCursor;
      ctx.fillText(row.displayValue, xCursor, textY, Math.max(maxValWidth, 20));
    }

    // Collapsed badge
    if (collapsedNodes.has(node.id) && node.childEdges.length > 0) {
      const bx = nx + nw - 28;
      const by = ny + nh / 2 - 10;
      ctx.fillStyle = '#1D9BF0';
      roundRect(ctx, bx, by, 24, 20, 4);
      ctx.fill();
      ctx.font = `bold 9px monospace`;
      ctx.fillStyle = '#fff';
      const badgeText = `+${node.childEdges.length}`;
      ctx.fillText(badgeText, bx + 4, by + 14);
    }
  }

  // Trigger download
  return new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error('Canvas serialization failed')); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'json-graph.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      resolve();
    }, 'image/png');
  });
}
