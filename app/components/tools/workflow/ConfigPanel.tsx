'use client';

import React, { useState } from 'react';
import { WorkflowNode, NodeExecutionState } from '../../../lib/workflow/types';
import { NODE_DEFINITIONS } from '../../../lib/workflow/registry';
import {
  X,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Code2,
} from 'lucide-react';

interface ConfigPanelProps {
  node: WorkflowNode | null;
  nodeState: NodeExecutionState | undefined;
  onClose: () => void;
  onUpdateConfig: (nodeId: string, config: Record<string, unknown>, label?: string) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  node,
  nodeState,
  onClose,
  onUpdateConfig,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!node) return null;

  const def = NODE_DEFINITIONS[node.type];
  const config = node.config || {};

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleFieldChange = (fieldKey: string, value: unknown) => {
    onUpdateConfig(node.id, {
      ...config,
      [fieldKey]: value,
    });
  };

  return (
    <div className="w-full lg:w-80 h-full border-t lg:border-t-0 lg:border-l border-theme-subtle bg-surface flex flex-col font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-neutral-950 border-b border-theme-subtle">
        <div className="flex items-center gap-2 truncate">
          <span className="text-[10px] uppercase font-semibold text-[#1D9BF0] tracking-wider">
            Inspector
          </span>
          <span className="text-neutral-500">/</span>
          <span className="text-theme-main font-semibold truncate">{node.label}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-neutral-400 hover:text-theme-main transition-colors"
          title="Close Inspector"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Node Label Renaming */}
        <div>
          <label className="text-[10px] uppercase tracking-wider text-neutral-500 block mb-1">
            Node Label
          </label>
          <input
            type="text"
            value={node.label}
            onChange={(e) => onUpdateConfig(node.id, config, e.target.value)}
            className="w-full px-2.5 py-1.5 rounded bg-app border border-theme-subtle text-theme-main focus:border-[#1D9BF0] outline-none"
          />
        </div>

        {/* Dynamic Node Specific Configurations */}
        <div className="space-y-3 pt-2 border-t border-theme-subtle">
          <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
            Parameters
          </div>

          {/* 1. JSON Input */}
          {node.type === 'json-input' && (
            <div className="space-y-2">
              <label className="text-[11px] text-neutral-400 block">Raw JSON Input Payload</label>
              <textarea
                value={String(config.rawJson ?? '')}
                onChange={(e) => handleFieldChange('rawJson', e.target.value)}
                rows={7}
                placeholder="Paste valid JSON here..."
                className="w-full p-2 rounded bg-app border border-theme-subtle text-theme-main font-mono text-[11px] resize-y outline-none focus:border-[#1D9BF0]"
              />
              <label className="flex items-center gap-2 text-[11px] text-neutral-400 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={config.validateJson !== false}
                  onChange={(e) => handleFieldChange('validateJson', e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-900"
                />
                <span>Validate JSON syntax on ingest</span>
              </label>
            </div>
          )}

          {/* 2. JSON Formatter */}
          {node.type === 'json-formatter' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Indentation</label>
                <select
                  value={Number(config.indent || 2)}
                  onChange={(e) => handleFieldChange('indent', Number(e.target.value))}
                  disabled={Boolean(config.minify)}
                  className="w-full px-2 py-1.5 rounded bg-app border border-theme-subtle text-theme-main outline-none"
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value={8}>8 spaces</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-[11px] text-neutral-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(config.minify)}
                  onChange={(e) => handleFieldChange('minify', e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-900"
                />
                <span>Minify output (strip whitespace)</span>
              </label>
            </div>
          )}

          {/* 3. Base64 Encode */}
          {node.type === 'base64-encode' && (
            <div>
              <label className="flex items-center gap-2 text-[11px] text-neutral-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(config.urlSafe)}
                  onChange={(e) => handleFieldChange('urlSafe', e.target.checked)}
                  className="rounded border-neutral-700 bg-neutral-900"
                />
                <span>URL-safe Base64 (- and _ without padding =)</span>
              </label>
            </div>
          )}

          {/* 4. Regex Match */}
          {node.type === 'regex-match' && (
            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Pattern</label>
                <input
                  type="text"
                  value={String(config.pattern || '')}
                  onChange={(e) => handleFieldChange('pattern', e.target.value)}
                  placeholder="e.g. \d+"
                  className="w-full px-2 py-1.5 rounded bg-app border border-theme-subtle text-theme-main outline-none focus:border-[#1D9BF0]"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Flags</label>
                <input
                  type="text"
                  value={String(config.flags || 'g')}
                  onChange={(e) => handleFieldChange('flags', e.target.value)}
                  placeholder="g, i, m"
                  className="w-full px-2 py-1.5 rounded bg-app border border-theme-subtle text-theme-main outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Execution Mode</label>
                <select
                  value={String(config.mode || 'extract_matches')}
                  onChange={(e) => handleFieldChange('mode', e.target.value)}
                  className="w-full px-2 py-1.5 rounded bg-app border border-theme-subtle text-theme-main outline-none"
                >
                  <option value="extract_matches">Extract Matches (JSON Array)</option>
                  <option value="filter_lines">Filter Lines (Keep Matching)</option>
                  <option value="test">Test Boolean (True / False)</option>
                </select>
              </div>
            </div>
          )}

          {/* 5. SHA-256 Hash */}
          {node.type === 'hash-sha256' && (
            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Digest Format</label>
              <select
                value={String(config.outputFormat || 'hex')}
                onChange={(e) => handleFieldChange('outputFormat', e.target.value)}
                className="w-full px-2 py-1.5 rounded bg-app border border-theme-subtle text-theme-main outline-none"
              >
                <option value="hex">Hexadecimal (lowercase)</option>
                <option value="base64">Base64 String</option>
              </select>
            </div>
          )}

          {/* 6. Conditional Branch */}
          {node.type === 'conditional-branch' && (
            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Condition Type</label>
                <select
                  value={String(config.conditionType || 'contains')}
                  onChange={(e) => handleFieldChange('conditionType', e.target.value)}
                  className="w-full px-2 py-1.5 rounded bg-app border border-theme-subtle text-theme-main outline-none"
                >
                  <option value="contains">Text Contains String</option>
                  <option value="json_key_exists">JSON Object Has Key</option>
                  <option value="regex">Matches Regular Expression</option>
                  <option value="is_truthy">Is Truthy Value</option>
                </select>
              </div>
              {config.conditionType !== 'is_truthy' && (
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Condition Value</label>
                  <input
                    type="text"
                    value={String(config.conditionValue || '')}
                    onChange={(e) => handleFieldChange('conditionValue', e.target.value)}
                    placeholder="Search string, regex, or key name"
                    className="w-full px-2 py-1.5 rounded bg-app border border-theme-subtle text-theme-main outline-none focus:border-[#1D9BF0]"
                  />
                </div>
              )}
            </div>
          )}

          {/* 7. Output Sink */}
          {node.type === 'output-sink' && (
            <div>
              <label className="text-[11px] text-neutral-400 block mb-1">Export Label</label>
              <input
                type="text"
                value={String(config.label || '')}
                onChange={(e) => handleFieldChange('label', e.target.value)}
                placeholder="Final Output"
                className="w-full px-2 py-1.5 rounded bg-app border border-theme-subtle text-theme-main outline-none"
              />
            </div>
          )}
        </div>

        {/* Live Intermediate Execution Inspector */}
        <div className="space-y-3 pt-3 border-t border-theme-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
              Live State & Data
            </span>
            {nodeState?.status && (
              <span
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                  nodeState.status === 'success'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : nodeState.status === 'error'
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : nodeState.status === 'running'
                    ? 'bg-blue-950 text-blue-400 border border-blue-800'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {nodeState.status}
              </span>
            )}
          </div>

          {/* Duration */}
          {nodeState?.durationMs !== undefined && (
            <div className="flex items-center gap-1.5 text-neutral-400 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              <span>Execution Time: {nodeState.durationMs}ms</span>
            </div>
          )}

          {/* Error Message */}
          {nodeState?.errorMessage && (
            <div className="p-2 rounded bg-red-950/50 border border-red-800 text-red-300 text-[11px] space-y-1">
              <div className="flex items-center gap-1 font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Execution Error</span>
              </div>
              <p className="break-all">{nodeState.errorMessage}</p>
            </div>
          )}

          {/* Intermediate Output Inspector */}
          {nodeState?.outputData !== undefined && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span>Output Data</span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      typeof nodeState.outputData === 'string'
                        ? nodeState.outputData
                        : JSON.stringify(nodeState.outputData, null, 2),
                      'output'
                    )
                  }
                  className="hover:text-theme-main transition-colors flex items-center gap-1"
                >
                  {copiedKey === 'output' ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedKey === 'output' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-2 rounded bg-app border border-theme-subtle text-[11px] text-theme-main max-h-40 overflow-auto font-mono">
                {typeof nodeState.outputData === 'string'
                  ? nodeState.outputData
                  : JSON.stringify(nodeState.outputData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
