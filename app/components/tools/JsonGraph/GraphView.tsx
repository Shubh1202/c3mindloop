'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { GraphNode as GraphNodeType, GraphEdge as GraphEdgeType, GraphTransform } from './graphTypes';
import { GraphNodeComponent } from './GraphNode';
import { GraphEdgeComponent } from './GraphEdge';

const MIN_SCALE = 0.1;
const MAX_SCALE = 3.0;
const ZOOM_STEP = 0.2;

interface GraphViewProps {
  nodes: GraphNodeType[];
  edges: GraphEdgeType[];
  transform: GraphTransform;
  onTransformChange: (t: GraphTransform) => void;
  collapsedNodes: Set<string>;
  selectedNode: string | null;
  onNodeClick: (id: string) => void;
  searchMatchIds?: Set<string>;
  onCopyPath?: (path: string) => void;
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

export const GraphView: React.FC<GraphViewProps> = ({
  nodes,
  edges,
  transform,
  onTransformChange,
  collapsedNodes,
  selectedNode,
  onNodeClick,
  searchMatchIds,
  onCopyPath,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const [viewportSize, setViewportSize] = useState({ w: 800, h: 600 });
  const [isPanningState, setIsPanningState] = useState(false);

  // Touch pinch state
  const touchState = useRef<{
    lastDist: number;
    lastMidX: number;
    lastMidY: number;
  } | null>(null);

  // Track which nodeIds are under pointer to prevent panning when dragging nodes
  const pointerOnNode = useRef(false);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setViewportSize({ w: width, h: height });
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Determine which nodes are currently visible (not hidden by collapsed ancestors)
  const visibleNodeIds = React.useMemo(() => {
    const parentMap = new Map<string, string>();
    for (const edge of edges) {
      parentMap.set(edge.targetId, edge.sourceId);
    }
    const hasParent = new Set(edges.map((e) => e.targetId));
    const roots = nodes.filter((n) => !hasParent.has(n.id));
    const visible = new Set<string>();
    const queue: string[] = roots.map((r) => r.id);

    // Build children map
    const childrenMap = new Map<string, string[]>();
    for (const n of nodes) childrenMap.set(n.id, []);
    for (const edge of edges) {
      const arr = childrenMap.get(edge.sourceId);
      if (arr) arr.push(edge.targetId);
    }

    while (queue.length > 0) {
      const id = queue.shift()!;
      visible.add(id);
      if (!collapsedNodes.has(id)) {
        const children = childrenMap.get(id) ?? [];
        queue.push(...children);
      }
    }
    return visible;
  }, [nodes, edges, collapsedNodes]);

  const visibleNodes = nodes.filter((n) => visibleNodeIds.has(n.id));
  const visibleEdges = edges.filter(
    (e) => visibleNodeIds.has(e.sourceId) && visibleNodeIds.has(e.targetId)
  );

  // Viewport culling: only render nodes whose bounding box intersects viewport
  const culledNodes = React.useMemo(() => {
    if (visibleNodes.length <= 100) return visibleNodes;

    const { x: tx, y: ty, scale } = transform;
    // Viewport in graph coordinates
    const vpLeft = -tx / scale;
    const vpTop = -ty / scale;
    const vpRight = vpLeft + viewportSize.w / scale;
    const vpBottom = vpTop + viewportSize.h / scale;

    return visibleNodes.filter((n) => {
      return (
        n.x < vpRight &&
        n.x + n.width > vpLeft &&
        n.y < vpBottom &&
        n.y + n.height > vpTop
      );
    });
  }, [visibleNodes, transform, viewportSize]);

  const culledNodeIds = new Set(culledNodes.map((n) => n.id));
  const culledEdges = visibleEdges.filter(
    (e) => culledNodeIds.has(e.sourceId) && culledNodeIds.has(e.targetId)
  );

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Mouse wheel zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      const newScale = clamp(transform.scale + delta, MIN_SCALE, MAX_SCALE);
      if (newScale === transform.scale) return;

      // Zoom centered on cursor
      const scaleRatio = newScale / transform.scale;
      const newTx = mouseX - scaleRatio * (mouseX - transform.x);
      const newTy = mouseY - scaleRatio * (mouseY - transform.y);

      onTransformChange({ x: newTx, y: newTy, scale: newScale });
    },
    [transform, onTransformChange]
  );

  // Attach wheel with non-passive listener to allow preventDefault
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.addEventListener('wheel', handleWheel, { passive: false });
    return () => svg.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Pointer down – start pan (only on empty areas)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (pointerOnNode.current) return;
      if (e.button !== 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      isPanning.current = true;
      setIsPanningState(true);
      panStart.current = {
        x: e.clientX,
        y: e.clientY,
        tx: transform.x,
        ty: transform.y,
      };
    },
    [transform]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!isPanning.current) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      onTransformChange({
        x: panStart.current.tx + dx,
        y: panStart.current.ty + dy,
        scale: transform.scale,
      });
    },
    [transform, onTransformChange]
  );

  const handlePointerUp = useCallback(() => {
    isPanning.current = false;
    setIsPanningState(false);
  }, []);

  // Touch pinch zoom
  const handleTouchStart = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 2) {
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      touchState.current = {
        lastDist: dist,
        lastMidX: (t0.clientX + t1.clientX) / 2,
        lastMidY: (t0.clientY + t1.clientY) / 2,
      };
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<SVGSVGElement>) => {
      if (e.touches.length !== 2 || !touchState.current) return;
      e.preventDefault();
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const midX = (t0.clientX + t1.clientX) / 2;
      const midY = (t0.clientY + t1.clientY) / 2;

      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const localMidX = midX - rect.left;
      const localMidY = midY - rect.top;

      const scaleDelta = dist / touchState.current.lastDist;
      const newScale = clamp(transform.scale * scaleDelta, MIN_SCALE, MAX_SCALE);
      const scaleRatio = newScale / transform.scale;
      const newTx = localMidX - scaleRatio * (localMidX - transform.x);
      const newTy = localMidY - scaleRatio * (localMidY - transform.y);

      touchState.current = { lastDist: dist, lastMidX: midX, lastMidY: midY };
      onTransformChange({ x: newTx, y: newTy, scale: newScale });
    },
    [transform, onTransformChange]
  );

  const handleTouchEnd = useCallback(() => {
    touchState.current = null;
  }, []);

  const isEmpty = visibleNodes.length === 0;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <svg
        ref={svgRef}
        className="w-full h-full"
        role="img"
        aria-label="JSON graph visualization"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: isPanningState ? 'grabbing' : 'grab', touchAction: 'none' }}
      >
        <defs>
          <pattern
            id="dot-grid"
            x={transform.x % 24}
            y={transform.y % 24}
            width={24}
            height={24}
            patternUnits="userSpaceOnUse"
          >
            <circle cx={0} cy={0} r={0.5} fill="#262626" />
          </pattern>
        </defs>

        {/* Background */}
        <rect width="100%" height="100%" fill="#0a0a0a" />
        <rect width="100%" height="100%" fill="url(#dot-grid)" />

        {/* Graph content */}
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {/* Edges first (below nodes) */}
          {culledEdges.map((edge) => {
            const src = nodeMap.get(edge.sourceId);
            const tgt = nodeMap.get(edge.targetId);
            if (!src || !tgt) return null;
            return (
              <GraphEdgeComponent
                key={edge.id}
                edge={edge}
                sourceNode={src}
                targetNode={tgt}
              />
            );
          })}

          {/* Nodes */}
          {culledNodes.map((node) => (
            <g
              key={node.id}
              onMouseEnter={() => { pointerOnNode.current = true; }}
              onMouseLeave={() => { pointerOnNode.current = false; }}
              onPointerDown={(e) => { e.stopPropagation(); }}
            >
              <GraphNodeComponent
                node={node}
                isCollapsed={collapsedNodes.has(node.id)}
                isSelected={selectedNode === node.id}
                isSearchMatch={searchMatchIds ? searchMatchIds.has(node.id) : false}
                onNodeClick={onNodeClick}
                onCopyPath={onCopyPath}
              />
            </g>
          ))}
        </g>

        {/* Empty state overlay */}
        {isEmpty && (
          <g>
            <text
              x="50%"
              y="45%"
              textAnchor="middle"
              fill="#404040"
              fontSize={14}
              fontFamily='"JetBrains Mono", monospace'
            >
              Paste JSON to visualize
            </text>
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              fill="#2a2a2a"
              fontSize={11}
              fontFamily='"JetBrains Mono", monospace'
            >
              Objects and arrays become interactive nodes
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
