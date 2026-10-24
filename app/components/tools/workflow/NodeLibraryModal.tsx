'use client';

import React from 'react';
import { WorkflowNodeType } from '../../../lib/workflow/types';
import { NODE_DEFINITIONS } from '../../../lib/workflow/registry';
import {
  X,
  Plus,
  Database,
  Code2,
  Zap,
  FileCode,
  ShieldCheck,
  GitBranch,
  Layers,
  Sparkles,
} from 'lucide-react';

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

interface NodeLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (type: WorkflowNodeType) => void;
}

export const NodeLibraryModal: React.FC<NodeLibraryModalProps> = ({
  isOpen,
  onClose,
  onAddNode,
}) => {
  if (!isOpen) return null;

  const categories: Array<{ id: string; label: string; types: WorkflowNodeType[] }> = [
    {
      id: 'input',
      label: 'Input Nodes',
      types: ['json-input'],
    },
    {
      id: 'transform',
      label: 'Data Transformers',
      types: ['json-formatter', 'base64-encode', 'base64-decode', 'regex-match'],
    },
    {
      id: 'logic',
      label: 'Flow & Routing',
      types: ['conditional-branch'],
    },
    {
      id: 'security',
      label: 'Security & Hashes',
      types: ['hash-sha256'],
    },
    {
      id: 'output',
      label: 'Sinks & Output',
      types: ['output-sink'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-lg border border-theme-subtle bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-950 border-b border-theme-subtle select-none">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#1D9BF0]" />
            <h2 className="text-sm font-mono font-semibold text-theme-main">
              Node Library
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-theme-main transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories & Node Cards */}
        <div className="p-4 overflow-y-auto space-y-6">
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-2.5">
              <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-semibold border-b border-theme-subtle pb-1">
                {cat.label}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {cat.types.map((type) => {
                  const def = NODE_DEFINITIONS[type];
                  const Icon = ICON_MAP[def.icon] || Database;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        onAddNode(type);
                        onClose();
                      }}
                      className="flex items-start gap-3 p-3 text-left rounded-lg border border-theme-subtle bg-app/50 hover:bg-neutral-900 hover:border-[#1D9BF0] transition-all group cursor-pointer"
                    >
                      <div className="p-2 rounded bg-neutral-900 border border-theme-subtle group-hover:border-[#1D9BF0] group-hover:text-[#1D9BF0] transition-colors shrink-0">
                        <Icon className="w-4 h-4 text-theme-muted group-hover:text-[#1D9BF0]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono font-semibold text-theme-main group-hover:text-[#1D9BF0] transition-colors truncate">
                          {def.label}
                        </div>
                        <p className="text-[11px] font-mono text-neutral-400 line-clamp-2 mt-0.5 leading-relaxed">
                          {def.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-neutral-950 border-t border-theme-subtle flex items-center justify-between text-xs font-mono text-neutral-500">
          <span>Click any node to place it on the canvas.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded border border-theme-subtle hover:text-theme-main transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
