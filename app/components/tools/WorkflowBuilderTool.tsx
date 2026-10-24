'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  WorkflowSchemaV1,
  WorkflowNode,
  WorkflowEdge,
  WorkflowNodeType,
  NodeExecutionState,
  WorkflowExecutionReport,
} from '../../lib/workflow/types';
import { validateWorkflowSchema } from '../../lib/workflow/schema';
import { getNodeDefinition } from '../../lib/workflow/registry';
import { executeWorkflow } from '../../lib/workflow/engine';
import { WORKFLOW_PRESETS } from '../../lib/workflow/presets';
import { Canvas, NODE_WIDTH } from './workflow/Canvas';
import { ConfigPanel } from './workflow/ConfigPanel';
import { NodeLibraryModal } from './workflow/NodeLibraryModal';
import { ExecutionLogModal } from './workflow/ExecutionLogModal';
import { useTranslation } from '../../lib/i18n';
import {
  Play,
  Plus,
  RotateCcw,
  Download,
  Upload,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileCode,
  Layers,
  Save,
  Loader2,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

const STORAGE_KEY = 'c3mindloop_saved_workflows';
const ACTIVE_WORKFLOW_KEY = 'c3mindloop_active_workflow';

export const WorkflowBuilderTool: React.FC = () => {
  const { t } = useTranslation();

  // Load default preset initially
  const [currentSchema, setCurrentSchema] = useState<WorkflowSchemaV1>(() => {
    return WORKFLOW_PRESETS[0].schema;
  });

  const [nodeStates, setNodeStates] = useState<Record<string, NodeExecutionState>>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [executionReport, setExecutionReport] = useState<WorkflowExecutionReport | null>(null);

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [transform, setTransform] = useState<{ x: number; y: number; scale: number }>({
    x: 40,
    y: 40,
    scale: 0.95,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Restore saved active workflow from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_WORKFLOW_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const val = validateWorkflowSchema(parsed);
        if (val.valid && val.schema && val.schema.nodes.length > 0) {
          setCurrentSchema(val.schema);
        }
      }
    } catch {
      // Fallback to default
    }
  }, []);

  // Autosave to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_WORKFLOW_KEY, JSON.stringify(currentSchema));
    } catch {
      // Ignore quota errors
    }
  }, [currentSchema]);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 2500);
  };

  // ── Node & Edge Operations ─────────────────────────────────────────────────
  const handleNodesChange = useCallback((newNodes: WorkflowNode[]) => {
    setCurrentSchema((prev) => ({
      ...prev,
      nodes: newNodes,
      updated_at: new Date().toISOString(),
    }));
  }, []);

  const handleEdgesChange = useCallback((newEdges: WorkflowEdge[]) => {
    setCurrentSchema((prev) => ({
      ...prev,
      edges: newEdges,
      updated_at: new Date().toISOString(),
    }));
  }, []);

  const handleAddNode = useCallback((type: WorkflowNodeType) => {
    const def = getNodeDefinition(type);
    const newId = `node-${type.slice(0, 4)}-${Date.now().toString(36).substring(4, 8)}`;

    // Place node near the center of the current canvas view
    const posX = Math.round((200 - transform.x) / transform.scale);
    const posY = Math.round((180 - transform.y) / transform.scale);

    const newNode: WorkflowNode = {
      id: newId,
      type,
      label: def.label,
      position: { x: Math.max(20, posX), y: Math.max(20, posY) },
      config: { ...def.defaultConfig },
      inputs: def.inputs,
      outputs: def.outputs,
    };

    setCurrentSchema((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      updated_at: new Date().toISOString(),
    }));

    setSelectedNodeId(newId);
    showStatus(`Added "${def.label}" node`);
  }, [transform]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setCurrentSchema((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => n.id !== nodeId),
      edges: prev.edges.filter((e) => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId),
      updated_at: new Date().toISOString(),
    }));

    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
    showStatus('Node removed');
  }, [selectedNodeId]);

  const handleDuplicateNode = useCallback((nodeId: string) => {
    const original = currentSchema.nodes.find((n) => n.id === nodeId);
    if (!original) return;

    const newId = `node-${original.type.slice(0, 4)}-${Date.now().toString(36).substring(4, 8)}`;
    const duplicate: WorkflowNode = {
      ...original,
      id: newId,
      label: `${original.label} (Copy)`,
      position: {
        x: original.position.x + 30,
        y: original.position.y + 30,
      },
      config: JSON.parse(JSON.stringify(original.config)),
    };

    setCurrentSchema((prev) => ({
      ...prev,
      nodes: [...prev.nodes, duplicate],
      updated_at: new Date().toISOString(),
    }));

    setSelectedNodeId(newId);
    showStatus(`Duplicated "${original.label}"`);
  }, [currentSchema.nodes]);

  const handleUpdateConfig = useCallback((nodeId: string, newConfig: Record<string, unknown>, newLabel?: string) => {
    setCurrentSchema((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            config: newConfig,
            label: newLabel !== undefined ? newLabel : n.label,
          };
        }
        return n;
      }),
      updated_at: new Date().toISOString(),
    }));
  }, []);

  // ── Execution ──────────────────────────────────────────────────────────────
  const handleRunWorkflow = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setNodeStates({});

    try {
      const report = await executeWorkflow(currentSchema, {
        onStepUpdate: (nodeId, state) => {
          setNodeStates((prev) => ({
            ...prev,
            [nodeId]: state,
          }));
        },
      });

      setExecutionReport(report);
      if (report.success) {
        showStatus(`Workflow executed successfully in ${report.totalDurationMs}ms`);
      } else {
        showStatus('Workflow execution encountered an error.');
      }
    } catch (e) {
      showStatus(`Execution failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  // ── Zoom / Fit-To-View ─────────────────────────────────────────────────────
  const handleZoom = (delta: number) => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(2.5, Math.max(0.25, prev.scale + delta)),
    }));
  };

  const handleFitToView = () => {
    if (currentSchema.nodes.length === 0) {
      setTransform({ x: 40, y: 40, scale: 1 });
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    currentSchema.nodes.forEach((n) => {
      minX = Math.min(minX, n.position.x);
      minY = Math.min(minY, n.position.y);
      maxX = Math.max(maxX, n.position.x + NODE_WIDTH);
      maxY = Math.max(maxY, n.position.y + 160);
    });

    const padding = 60;
    const graphWidth = maxX - minX + padding * 2;
    const graphHeight = maxY - minY + padding * 2;

    const scale = Math.min(1.2, Math.max(0.4, Math.min(900 / graphWidth, 500 / graphHeight)));
    setTransform({
      x: -minX * scale + padding * scale,
      y: -minY * scale + padding * scale,
      scale,
    });
  };

  // ── Import / Export ────────────────────────────────────────────────────────
  const handleExportJson = () => {
    const dataStr = JSON.stringify(currentSchema, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindloop-${currentSchema.pipeline_id || 'workflow'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showStatus('Workflow schema exported as JSON');
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const result = validateWorkflowSchema(parsed);

        if (!result.valid || !result.schema) {
          alert(`Import Rejected: Malformed schema.\n\n${result.errors.join('\n')}`);
          return;
        }

        setCurrentSchema(result.schema);
        setNodeStates({});
        setSelectedNodeId(null);
        showStatus(`Imported pipeline "${result.schema.pipeline_id}"`);
      } catch (err) {
        alert(`Failed to parse JSON file: ${err instanceof Error ? err.message : 'Invalid JSON'}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = WORKFLOW_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setCurrentSchema(JSON.parse(JSON.stringify(preset.schema)));
    setNodeStates({});
    setSelectedNodeId(null);
    showStatus(`Loaded template: "${preset.name}"`);
  };

  const handleClearCanvas = () => {
    if (currentSchema.nodes.length > 0 && !window.confirm('Clear all nodes from the canvas?')) {
      return;
    }
    setCurrentSchema({
      pipeline_id: 'custom-pipeline',
      version: '1.0.0',
      description: 'Custom client-side workflow',
      nodes: [],
      edges: [],
      execution_settings: {
        stop_on_error: true,
        max_execution_time_ms: 10000,
        log_level: 'info',
      },
    });
    setNodeStates({});
    setSelectedNodeId(null);
    showStatus('Canvas cleared');
  };

  const selectedNode = currentSchema.nodes.find((n) => n.id === selectedNodeId) || null;
  const selectedNodeState = selectedNodeId ? nodeStates[selectedNodeId] : undefined;

  return (
    <div className="rounded-lg border border-theme-subtle bg-surface overflow-hidden shadow-2xl flex flex-col font-mono">
      {/* 1. ACTION TOOLBAR (Required as FIRST element per rules) */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-theme-subtle bg-neutral-950 select-none">
        {/* Left: Core Pipeline Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Run Workflow Button */}
          <button
            type="button"
            onClick={handleRunWorkflow}
            disabled={isRunning || currentSchema.nodes.length === 0}
            className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-all shadow-md ${
              isRunning || currentSchema.nodes.length === 0
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-[#1D9BF0] text-white hover:bg-[#1a8cd8] active:scale-95'
            }`}
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{isRunning ? 'Running...' : 'Run Workflow'}</span>
          </button>

          {/* Add Node Button */}
          <button
            type="button"
            onClick={() => setIsLibraryOpen(true)}
            className="px-3 py-1.5 text-xs border border-theme-subtle text-theme-main bg-app/60 rounded hover:border-[#1D9BF0] hover:text-[#1D9BF0] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Node</span>
          </button>

          {/* Preset Selector */}
          <div className="flex items-center gap-1 pl-1">
            <span className="text-[10px] text-neutral-500 uppercase">Preset:</span>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) handleLoadPreset(e.target.value);
              }}
              className="px-2 py-1 text-xs rounded bg-app border border-theme-subtle text-theme-main outline-none cursor-pointer"
            >
              <option value="" disabled>
                Select Template...
              </option>
              {WORKFLOW_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center / Status Toast */}
        {statusMessage && (
          <div className="text-[11px] text-[#1D9BF0] animate-pulse truncate max-w-xs">
            {statusMessage}
          </div>
        )}

        {/* Right: Canvas & File Utilities */}
        <div className="flex items-center gap-1.5">
          {/* Zoom Controls */}
          <div className="flex items-center border border-theme-subtle rounded overflow-hidden">
            <button
              type="button"
              title="Zoom In"
              onClick={() => handleZoom(0.15)}
              className="p-1.5 hover:bg-neutral-900 text-neutral-400 hover:text-theme-main transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Zoom Out"
              onClick={() => handleZoom(-0.15)}
              className="p-1.5 hover:bg-neutral-900 text-neutral-400 hover:text-theme-main transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              title="Fit to View"
              onClick={handleFitToView}
              className="p-1.5 hover:bg-neutral-900 text-neutral-400 hover:text-theme-main transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Audit / Execution Log */}
          {executionReport && (
            <button
              type="button"
              onClick={() => setIsLogModalOpen(true)}
              className="px-2.5 py-1 text-xs border border-theme-subtle rounded hover:text-theme-main transition-colors flex items-center gap-1 text-neutral-300"
            >
              <Layers className="w-3.5 h-3.5 text-[#1D9BF0]" />
              <span>Trace ({executionReport.logs.length})</span>
            </button>
          )}

          {/* Import JSON */}
          <button
            type="button"
            title="Import Workflow JSON"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 border border-theme-subtle rounded hover:text-theme-main transition-colors text-neutral-400"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportJsonFile}
            className="hidden"
          />

          {/* Export JSON */}
          <button
            type="button"
            title="Export Workflow JSON"
            onClick={handleExportJson}
            className="p-1.5 border border-theme-subtle rounded hover:text-theme-main transition-colors text-neutral-400"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Clear Canvas */}
          <button
            type="button"
            title="Clear Canvas"
            onClick={handleClearCanvas}
            className="p-1.5 border border-theme-subtle rounded hover:text-red-400 transition-colors text-neutral-400"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. EDITOR / CANVAS AREA */}
      <div className="relative flex-1 flex flex-col lg:flex-row min-h-[580px] bg-neutral-950 overflow-hidden">
        {/* Canvas Engine */}
        <div className="flex-1 relative">
          <Canvas
            nodes={currentSchema.nodes}
            edges={currentSchema.edges}
            nodeStates={nodeStates}
            selectedNodeId={selectedNodeId}
            transform={transform}
            onTransformChange={setTransform}
            onSelectNode={setSelectedNodeId}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onDeleteNode={handleDeleteNode}
            onDuplicateNode={handleDuplicateNode}
          />
        </div>

        {/* Configuration / Intermediate Inspector Drawer */}
        {selectedNode && (
          <ConfigPanel
            node={selectedNode}
            nodeState={selectedNodeState}
            onClose={() => setSelectedNodeId(null)}
            onUpdateConfig={handleUpdateConfig}
          />
        )}
      </div>

      {/* 3. TOOLBAR FOOTER BAR (Required by AGENT_RULES.md) */}
      <div className="px-3 py-2 border-t border-theme-subtle flex items-center justify-between bg-neutral-950 text-xs">
        <span className="text-[10px] font-mono text-neutral-500">
          Local browser processing - No data sent to any server
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-neutral-400">
            {currentSchema.nodes.length} nodes · {currentSchema.edges.length} edges
          </span>
          <span className="text-[10px] font-mono text-neutral-500 bg-surface px-2 py-0.5 rounded border border-theme-subtle">
            Client-Side
          </span>
        </div>
      </div>

      {/* Node Library Modal */}
      <NodeLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onAddNode={handleAddNode}
      />

      {/* Execution Log / Audit Modal */}
      <ExecutionLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        report={executionReport}
      />
    </div>
  );
};
