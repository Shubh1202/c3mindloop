'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  WorkflowNode,
  NodeExecutionState,
  PortDataType,
} from '../../../lib/workflow/types';
import { NODE_DEFINITIONS } from '../../../lib/workflow/registry';
import {
  Copy,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MinusCircle,
  Database,
  Code2,
  Zap,
  FileCode,
  ShieldCheck,
  GitBranch,
  Layers,
  Sparkles,
} from 'lucide-react';

export const NODE_WIDTH = 260;

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Database,
  Code2,
  Zap,
  FileCode,
  ShieldCheck,
  GitBranch,
  Layers,
  Sparkles,
};

const CATEGORY_STYLES: Record<string, { border: string; badge: string; text: string }> = {
  input: { border: 'border-blue-500/40', badge: 'bg-blue-950/70 text-blue-400 border-blue-800/60', text: 'text-blue-400' },
  transform: { border: 'border-emerald-500/40', badge: 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60', text: 'text-emerald-400' },
  logic: { border: 'border-amber-500/40', badge: 'bg-amber-950/70 text-amber-400 border-amber-800/60', text: 'text-amber-400' },
  security: { border: 'border-purple-500/40', badge: 'bg-purple-950/70 text-purple-400 border-purple-800/60', text: 'text-purple-400' },
  output: { border: 'border-cyan-500/40', badge: 'bg-cyan-950/70 text-cyan-400 border-cyan-800/60', text: 'text-cyan-400' },
};

export interface WorkflowNodeData {
  node: WorkflowNode;
  state?: NodeExecutionState;
  isSelected?: boolean;
  onSelectNode: (id: string | null) => void;
  onDeleteNode: (id: string) => void;
  onDuplicateNode: (id: string) => void;
  [key: string]: unknown;
}

export const WorkflowNodeComponent: React.FC<NodeProps> = memo(({ id, data, selected }) => {
  const nodeData = data as unknown as WorkflowNodeData;
  const { node, state = { status: 'idle' }, onSelectNode, onDeleteNode, onDuplicateNode } = nodeData;

  if (!node) return null;

  const def = NODE_DEFINITIONS[node.type] || NODE_DEFINITIONS['json-input'];
  const Icon = ICON_MAP[def.icon] || Database;
  const catStyle = CATEGORY_STYLES[def.category] || CATEGORY_STYLES.transform;
  const isCurrentlySelected = selected || nodeData.isSelected;

  return (
    <div
      style={{ width: `${NODE_WIDTH}px` }}
      onClick={() => onSelectNode(id)}
      className={`rounded-lg border bg-surface/95 backdrop-blur-md shadow-xl transition-all select-none text-left ${catStyle.border} ${
        isCurrentlySelected
          ? 'ring-2 ring-[#1D9BF0] shadow-blue-900/40 border-[#1D9BF0]'
          : 'hover:border-neutral-500'
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-neutral-900/90 border-b border-theme-subtle rounded-t-lg">
        <Icon className={`w-4 h-4 shrink-0 ${catStyle.text}`} />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-mono font-semibold text-theme-main truncate">
            {node.label}
          </div>
          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
            {def.category}
          </div>
        </div>

        {/* Status indicator */}
        <div className="shrink-0 flex items-center">
          {state.status === 'running' && (
            <Loader2 className="w-3.5 h-3.5 text-[#1D9BF0] animate-spin" />
          )}
          {state.status === 'success' && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {state.durationMs !== undefined && <span>{state.durationMs}ms</span>}
            </span>
          )}
          {state.status === 'error' && (
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
          )}
          {state.status === 'skipped' && (
            <MinusCircle className="w-3.5 h-3.5 text-neutral-500" />
          )}
        </div>

        {/* Quick actions */}
        <button
          type="button"
          title="Duplicate Node"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicateNode(id);
          }}
          className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          type="button"
          title="Delete Node"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteNode(id);
          }}
          className="p-1 text-neutral-400 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Node Body with Ports */}
      <div className="p-2.5 space-y-2 text-xs font-mono relative">
        <div className="flex justify-between items-start gap-2">
          {/* Inputs */}
          <div className="space-y-3 flex-1">
            {node.inputs.map((port) => (
              <div key={port.id} className="relative flex items-center gap-2 text-[11px] text-neutral-400 h-5">
                <Handle
                  type="target"
                  position={Position.Left}
                  id={port.id}
                  className="!w-3 !h-3 !-left-4 !bg-neutral-600 !border-2 !border-neutral-900 hover:!scale-150 hover:!bg-[#1D9BF0] transition-transform"
                />
                <span className="truncate">{port.name}</span>
              </div>
            ))}
          </div>

          {/* Outputs */}
          <div className="space-y-3 flex-1 text-right">
            {node.outputs.map((port) => (
              <div key={port.id} className="relative flex items-center justify-end gap-2 text-[11px] text-neutral-400 h-5">
                <span className="truncate">{port.name}</span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={port.id}
                  className="!w-3 !h-3 !-right-4 !bg-emerald-500 !border-2 !border-neutral-900 hover:!scale-150 hover:!bg-emerald-300 transition-transform cursor-crosshair"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Inline Status / Output Preview */}
        {state.errorMessage ? (
          <div className="mt-2 p-1.5 rounded bg-red-950/40 border border-red-800/40 text-[10px] text-red-300 truncate">
            {state.errorMessage}
          </div>
        ) : state.outputData ? (
          <div className="mt-2 p-1.5 rounded bg-neutral-900/60 border border-theme-subtle text-[10px] text-neutral-400 truncate">
            {typeof state.outputData === 'string'
              ? state.outputData.slice(0, 40)
              : JSON.stringify(state.outputData).slice(0, 40)}
          </div>
        ) : null}
      </div>
    </div>
  );
});

WorkflowNodeComponent.displayName = 'WorkflowNodeComponent';
