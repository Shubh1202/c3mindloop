'use client';

import React from 'react';
import { GraphEdge as GraphEdgeType, GraphNode } from './graphTypes';

interface GraphEdgeProps {
  edge: GraphEdgeType;
  sourceNode: GraphNode;
  targetNode: GraphNode;
}

export const GraphEdgeComponent: React.FC<GraphEdgeProps> = ({
  edge,
  sourceNode,
  targetNode,
}) => {
  const x1 = sourceNode.x + sourceNode.width;
  const y1 = sourceNode.y + sourceNode.height / 2;
  const x2 = targetNode.x;
  const y2 = targetNode.y + targetNode.height / 2;

  const cx1 = x1 + (x2 - x1) / 2;
  const cy1 = y1;
  const cx2 = x1 + (x2 - x1) / 2;
  const cy2 = y2;

  const arrowSize = 6;
  // Arrowhead pointing right at (x2, y2)
  const arrowPath = `M ${x2} ${y2} L ${x2 - arrowSize} ${y2 - arrowSize / 1.5} L ${x2 - arrowSize} ${y2 + arrowSize / 1.5} Z`;

  return (
    <g key={edge.id}>
      <path
        className="graph-edge-line"
        d={`M ${x1} ${y1} C ${cx1} ${cy1} ${cx2} ${cy2} ${x2 - arrowSize} ${y2}`}
        stroke="#404040"
        strokeWidth={1.5}
        fill="none"
      />
      <path
        className="graph-edge-arrow"
        d={arrowPath}
        fill="#404040"
        stroke="none"
      />
    </g>
  );
};
