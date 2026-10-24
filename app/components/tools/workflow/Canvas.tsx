'use client';

import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  WorkflowNode,
  WorkflowEdge,
  NodeExecutionState,
} from '../../../lib/workflow/types';
import { WorkflowNodeComponent, WorkflowNodeData, NODE_WIDTH } from './WorkflowNodeComponent';
import { Layers } from 'lucide-react';

export { NODE_WIDTH };

interface CanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  nodeStates: Record<string, NodeExecutionState>;
  selectedNodeId: string | null;
  transform: { x: number; y: number; scale: number };
  onTransformChange: (t: { x: number; y: number; scale: number }) => void;
  onSelectNode: (id: string | null) => void;
  onNodesChange: (nodes: WorkflowNode[]) => void;
  onEdgesChange: (edges: WorkflowEdge[]) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
}

const nodeTypes = {
  workflowNode: WorkflowNodeComponent,
};

export const Canvas: React.FC<CanvasProps> = ({
  nodes,
  edges,
  nodeStates,
  selectedNodeId,
  transform,
  onTransformChange,
  onSelectNode,
  onNodesChange,
  onEdgesChange,
  onDeleteNode,
  onDuplicateNode,
}) => {
  // Convert our domain WorkflowNode[] to ReactFlow Node[]
  const rfNodes: Node[] = useMemo(() => {
    return nodes.map((node) => ({
      id: node.id,
      type: 'workflowNode',
      position: { x: node.position.x, y: node.position.y },
      selected: selectedNodeId === node.id,
      data: {
        node,
        state: nodeStates[node.id] || { status: 'idle' },
        isSelected: selectedNodeId === node.id,
        onSelectNode,
        onDeleteNode,
        onDuplicateNode,
      } as WorkflowNodeData,
    }));
  }, [nodes, nodeStates, selectedNodeId, onSelectNode, onDeleteNode, onDuplicateNode]);

  // Convert our domain WorkflowEdge[] to ReactFlow Edge[]
  const rfEdges: Edge[] = useMemo(() => {
    return edges.map((edge) => {
      const srcState = nodeStates[edge.sourceNodeId];
      const isError = srcState?.status === 'error';
      const isSuccess = srcState?.status === 'success';

      return {
        id: edge.id,
        source: edge.sourceNodeId,
        sourceHandle: edge.sourcePortId,
        target: edge.targetNodeId,
        targetHandle: edge.targetPortId,
        animated: srcState?.status === 'running',
        style: {
          stroke: isError ? '#f87171' : isSuccess ? '#10b981' : '#525252',
          strokeWidth: isSuccess ? 2.5 : 2,
        },
      };
    });
  }, [edges, nodeStates]);

  // Handle position changes and removals cleanly without infinite render thrashing
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      let hasPositionUpdates = false;
      let hasRemoveUpdates = false;
      const removeIds = new Set<string>();
      const positionUpdates = new Map<string, { x: number; y: number }>();

      for (const change of changes) {
        if (change.type === 'position' && change.position) {
          hasPositionUpdates = true;
          positionUpdates.set(change.id, {
            x: Math.round(change.position.x),
            y: Math.round(change.position.y),
          });
        } else if (change.type === 'remove') {
          hasRemoveUpdates = true;
          removeIds.add(change.id);
        }
      }

      if (hasRemoveUpdates) {
        onNodesChange(nodes.filter((n) => !removeIds.has(n.id)));
      } else if (hasPositionUpdates) {
        onNodesChange(
          nodes.map((node) => {
            const newPos = positionUpdates.get(node.id);
            if (newPos) {
              return { ...node, position: newPos };
            }
            return node;
          })
        );
      }
    },
    [nodes, onNodesChange]
  );

  // Handle edge removals from ReactFlow
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const removeIds = new Set<string>();
      for (const change of changes) {
        if (change.type === 'remove') {
          removeIds.add(change.id);
        }
      }
      if (removeIds.size > 0) {
        onEdgesChange(edges.filter((e) => !removeIds.has(e.id)));
      }
    },
    [edges, onEdgesChange]
  );

  // Handle connection drag-and-drop between handles
  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      if (connection.source === connection.target) return; // Disallow self-loops

      const exists = edges.some(
        (e) =>
          e.sourceNodeId === connection.source &&
          e.sourcePortId === connection.sourceHandle &&
          e.targetNodeId === connection.target &&
          e.targetPortId === connection.targetHandle
      );

      if (exists) return;

      const newEdge: WorkflowEdge = {
        id: `edge-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sourceNodeId: connection.source,
        sourcePortId: connection.sourceHandle || '',
        targetNodeId: connection.target,
        targetPortId: connection.targetHandle || '',
      };

      onEdgesChange([...edges, newEdge]);
    },
    [edges, onEdgesChange]
  );

  // Handle viewport changes to sync with parent transform
  const handleMoveEnd = useCallback(
    (_: MouseEvent | TouchEvent | null, viewport: { x: number; y: number; zoom: number }) => {
      onTransformChange({
        x: Math.round(viewport.x),
        y: Math.round(viewport.y),
        scale: viewport.zoom,
      });
    },
    [onTransformChange]
  );

  return (
    <div className="relative w-full h-full min-h-[580px] bg-neutral-950 border border-theme-subtle rounded-lg overflow-hidden select-none">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={(_, node) => onSelectNode(node.id)}
        onPaneClick={() => onSelectNode(null)}
        onMoveEnd={handleMoveEnd}
        defaultViewport={{ x: transform.x, y: transform.y, zoom: transform.scale }}
        minZoom={0.2}
        maxZoom={2.5}
        deleteKeyCode={['Backspace', 'Delete']}
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="rgba(255, 255, 255, 0.12)"
        />
        <Controls
          showInteractive={false}
          className="!bg-neutral-900 !border !border-neutral-800 !text-neutral-300 !rounded-md shadow-xl"
        />
        <MiniMap
          className="!bg-neutral-950/90 !border !border-neutral-800/80 !rounded-md overflow-hidden"
          nodeColor={(n) => (n.selected ? '#1D9BF0' : '#334155')}
          maskColor="rgba(0, 0, 0, 0.75)"
          zoomable
          pannable
        />
      </ReactFlow>

      {/* Canvas Empty State overlay */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none pointer-events-none z-10">
          <Layers className="w-12 h-12 text-neutral-600 mb-3 animate-pulse" />
          <h3 className="text-sm font-mono font-semibold text-neutral-400 mb-1">
            Canvas is Empty
          </h3>
          <p className="text-xs font-mono text-neutral-600 max-w-sm mb-4">
            Click &quot;Add Node&quot; to construct a pipeline, or choose a pre-configured template from the toolbar.
          </p>
        </div>
      )}
    </div>
  );
};
