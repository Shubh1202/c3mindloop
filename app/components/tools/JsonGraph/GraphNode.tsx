'use client';

import React, { useState, useCallback } from 'react';
import { GraphNode as GraphNodeType } from './graphTypes';

const HEADER_HEIGHT = 36;
const ROW_HEIGHT = 24;
const NODE_PADDING = 16;

const VALUE_COLORS: Record<string, string> = {
  string: '#34d399',
  number: '#fbbf24',
  boolean: '#a78bfa',
  null: '#737373',
  object_ref: '#a1a1aa',
  array_ref: '#a1a1aa',
};

interface GraphNodeProps {
  node: GraphNodeType;
  isCollapsed: boolean;
  isSelected: boolean;
  onNodeClick: (id: string) => void;
  onCopyPath?: (path: string) => void;
  isSearchMatch?: boolean;
}

export const GraphNodeComponent: React.FC<GraphNodeProps> = ({
  node,
  isCollapsed,
  isSelected,
  onNodeClick,
  onCopyPath,
  isSearchMatch = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [stickyHover, setStickyHover] = useState(false);
  const [copiedRowPath, setCopiedRowPath] = useState<string | null>(null);

  // A node is a leaf if it has no child edges (no nested objects/arrays to expand)
  const isLeaf = node.childEdges.length === 0;

  const borderColor = isSearchMatch
    ? '#f59e0b'
    : isSelected
    ? '#1D9BF0'
    : stickyHover || isHovered
    ? '#525252'
    : '#262626';

  const borderWidth = isSelected || isSearchMatch ? 2 : 1;

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setStickyHover(true);
  }, []);

  // Header click — toggles collapse/expand, does NOT fire for leaf nodes
  const handleHeaderClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLeaf) return;
    onNodeClick(node.id);
    setStickyHover(false);
  }, [isLeaf, node.id, onNodeClick]);

  // Row click — copies the row's JSON path to clipboard
  const handleRowClick = useCallback((e: React.MouseEvent, path: string) => {
    e.stopPropagation(); // prevent node collapse toggle
    navigator.clipboard.writeText(path).then(() => {
      setCopiedRowPath(path);
      onCopyPath?.(path);
      setTimeout(() => setCopiedRowPath(null), 1500);
    }).catch(() => {
      // Clipboard API unavailable — silently ignore
    });
  }, [onCopyPath]);

  React.useEffect(() => {
    if (isSelected) setStickyHover(false);
  }, [isSelected]);

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Search match outer glow */}
      {isSearchMatch && (
        <rect
          x={-3} y={-3}
          width={node.width + 6} height={node.height + 6}
          rx={9} ry={9}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={1}
          strokeOpacity={0.35}
        />
      )}

      {/* Node background */}
      <rect
        x={0} y={0}
        width={node.width} height={node.height}
        rx={6} ry={6}
        fill="#171717"
        stroke={borderColor}
        strokeWidth={borderWidth}
      />

      {/* Header clickable area (expand/collapse) */}
      <rect
        x={0} y={0}
        width={node.width} height={HEADER_HEIGHT}
        rx={6} ry={6}
        fill="rgba(255,255,255,0.04)"
        onClick={handleHeaderClick}
        style={{ cursor: isLeaf ? 'default' : 'pointer' }}
        role={isLeaf ? undefined : 'button'}
        aria-label={isLeaf ? undefined : `${node.label} — ${isCollapsed ? 'expand' : 'collapse'}`}
        aria-expanded={isLeaf ? undefined : !isCollapsed}
      />
      {/* Flatten bottom-corner radius of header overlay */}
      <rect
        x={0} y={HEADER_HEIGHT / 2}
        width={node.width} height={HEADER_HEIGHT / 2}
        fill="rgba(255,255,255,0.04)"
        style={{ pointerEvents: 'none' }}
      />

      {/* Header separator */}
      <line
        x1={0} y1={HEADER_HEIGHT}
        x2={node.width} y2={HEADER_HEIGHT}
        stroke="#262626" strokeWidth={1}
        style={{ pointerEvents: 'none' }}
      />

      {/* Header label */}
      <text
        x={NODE_PADDING} y={HEADER_HEIGHT / 2 + 5}
        fill={isSearchMatch ? '#f59e0b' : '#f5f5f5'}
        fontSize={12} fontFamily='"JetBrains Mono", monospace'
        fontWeight="bold" dominantBaseline="middle" textAnchor="start"
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {node.label}
      </text>

      {/* Type badge */}
      <text
        x={node.width - NODE_PADDING} y={HEADER_HEIGHT / 2 + 5}
        fill="#404040" fontSize={10}
        fontFamily='"JetBrains Mono", monospace'
        dominantBaseline="middle" textAnchor="end"
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {node.type === 'array' ? '[]' : node.type === 'object' ? '{}' : ''}
      </text>

      {/* Expand/collapse chevron on non-leaf nodes */}
      {!isLeaf && (
        <text
          x={node.width - NODE_PADDING - (node.type !== 'scalar_container' ? 22 : 0)}
          y={HEADER_HEIGHT / 2 + 5}
          fill="#404040" fontSize={10}
          fontFamily='"JetBrains Mono", monospace'
          dominantBaseline="middle" textAnchor="end"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {isCollapsed ? '▸' : '▾'}
        </text>
      )}

      {/* Rows — each is clickable for copy-path */}
      {node.rows.map((row, i) => {
        const rowY = HEADER_HEIGHT + i * ROW_HEIGHT;
        const rowCenterY = rowY + ROW_HEIGHT / 2;
        const isCopied = copiedRowPath === row.path;

        return (
          <g
            key={`${node.id}-row-${i}`}
            onClick={(e) => handleRowClick(e, row.path)}
            style={{ cursor: 'copy' }}
          >
            {/* Transparent hit area for the full row */}
            <rect
              x={0} y={rowY}
              width={node.width} height={ROW_HEIGHT}
              fill="transparent"
            />

            {/* Row separator */}
            {i > 0 && (
              <line
                x1={NODE_PADDING / 2} y1={rowY}
                x2={node.width - NODE_PADDING / 2} y2={rowY}
                stroke="#1f1f1f" strokeWidth={0.5}
                style={{ pointerEvents: 'none' }}
              />
            )}

            {/* Copied flash background */}
            {isCopied && (
              <rect
                x={0} y={rowY}
                width={node.width} height={ROW_HEIGHT}
                fill="rgba(52,211,153,0.08)"
                style={{ pointerEvents: 'none' }}
              />
            )}

            {/* Key label */}
            {row.key !== '' && (
              <text
                x={NODE_PADDING} y={rowCenterY}
                fill={isCopied ? '#34d399' : '#38bdf8'}
                fontSize={11}
                fontFamily='"JetBrains Mono", monospace'
                dominantBaseline="middle" textAnchor="start"
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {row.key}:
              </text>
            )}

            {/* Value */}
            <text
              x={row.key !== '' ? NODE_PADDING + (row.key.length + 2) * 6.5 : NODE_PADDING}
              y={rowCenterY}
              fill={isCopied ? '#34d399' : (VALUE_COLORS[row.valueType] ?? '#f5f5f5')}
              fontSize={11}
              fontFamily='"JetBrains Mono", monospace'
              dominantBaseline="middle" textAnchor="start"
              fontStyle={row.valueType === 'null' ? 'italic' : 'normal'}
              style={{ userSelect: 'none', pointerEvents: 'none' }}
            >
              {isCopied ? '✓ path copied' : row.displayValue}
            </text>
          </g>
        );
      })}

      {/* Collapsed badge — intercepts clicks to expand (must NOT fall through to rows) */}
      {isCollapsed && node.childEdges.length > 0 && (
        <g
          onClick={handleHeaderClick}
          style={{ cursor: 'pointer' }}
          role="button"
          aria-label={`Expand ${node.childEdges.length} hidden children`}
        >
          <rect
            x={node.width - 28} y={node.height / 2 - 10}
            width={24} height={20} rx={4}
            fill="#1D9BF0"
          />
          <text
            x={node.width - 16} y={node.height / 2 + 1}
            fill="white" fontSize={9}
            fontFamily='"JetBrains Mono", monospace'
            fontWeight="bold" dominantBaseline="middle" textAnchor="middle"
            style={{ userSelect: 'none', pointerEvents: 'none' }}
          >
            +{node.childEdges.length}
          </text>
        </g>
      )}
    </g>
  );
};
