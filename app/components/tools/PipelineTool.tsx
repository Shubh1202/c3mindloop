'use client';

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useDeferredValue,
} from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Play,
  Trash2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  GripVertical,
  X,
  Share2,
  Link,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Download,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { ADAPTERS, ADAPTER_MAP } from '../../lib/pipeline/adapters';
import type { ToolAdapter } from '../../lib/pipeline/adapters';
import type { PipelineStep, AdapterId, AdapterConfig } from '../../lib/pipeline/types';
import {
  runPipeline,
  serializePipeline,
  deserializePipeline,
} from '../../lib/pipeline/engine';

// ── Utility ──────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function defaultConfig(adapter: ToolAdapter): AdapterConfig {
  const config: AdapterConfig = {};
  for (const field of adapter.configFields) {
    (config as any)[field.key] = field.defaultValue;
  }
  return config;
}

const CATEGORY_COLORS: Record<string, string> = {
  encoding: 'text-amber-400',
  json:     'text-emerald-400',
  auth:     'text-blue-400',
  text:     'text-violet-400',
  crypto:   'text-rose-400',
  data:     'text-cyan-400',
};

// ── Step Card ────────────────────────────────────────────────────────────────

interface StepCardProps {
  step: PipelineStep;
  index: number;
  total: number;
  output: string;
  error: string | null;
  durationMs?: number;
  isRunning: boolean;
  onRemove: (id: string) => void;
  onConfigChange: (id: string, config: AdapterConfig) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDrop: (e: React.DragEvent, id: string) => void;
}

const StepCard: React.FC<StepCardProps> = ({
  step,
  index,
  total,
  output,
  error,
  durationMs,
  isRunning,
  onRemove,
  onConfigChange,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const adapter = ADAPTER_MAP[step.adapterId];
  const [expanded, setExpanded] = useState(false);
  const [copiedStep, setCopiedStep] = useState(false);

  const catColor = CATEGORY_COLORS[adapter?.category ?? 'text'] ?? 'text-neutral-400';
  const hasOutput = output && output.length > 0;
  const preview = hasOutput ? output.slice(0, 120) + (output.length > 120 ? '…' : '') : '';

  const copyStepOutput = () => {
    navigator.clipboard.writeText(output).then(() => {
      setCopiedStep(true);
      setTimeout(() => setCopiedStep(false), 1800);
    });
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, step.id)}
      onDragOver={(e) => onDragOver(e, step.id)}
      onDrop={(e) => onDrop(e, step.id)}
      className="rounded-lg border border-theme-subtle bg-surface overflow-hidden transition-shadow hover:shadow-md hover:shadow-black/20"
    >
      {/* Step header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-neutral-950 border-b border-theme-subtle select-none">
        {/* Drag handle */}
        <GripVertical className="w-3.5 h-3.5 text-neutral-600 cursor-grab active:cursor-grabbing shrink-0" />

        {/* Step number */}
        <span className="text-[10px] font-mono text-neutral-600 shrink-0 w-5 text-center">
          {index + 1}
        </span>

        {/* Connector arrow for all but first */}
        {index > 0 && (
          <span className="text-neutral-700 text-[10px] font-mono shrink-0">→</span>
        )}

        {/* Adapter label */}
        <span className={`text-xs font-mono font-semibold ${catColor} truncate`}>
          {adapter?.label ?? step.adapterId}
        </span>
        <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider shrink-0">
          {adapter?.category}
        </span>

        <div className="flex-1" />

        {/* Status indicator */}
        {isRunning ? (
          <Loader2 className="w-3.5 h-3.5 text-neutral-500 animate-spin shrink-0" />
        ) : error ? (
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
        ) : hasOutput ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        ) : null}

        {/* Duration */}
        {durationMs !== undefined && !error && (
          <span className="text-[10px] font-mono text-neutral-600 shrink-0 flex items-center gap-0.5">
            <Clock className="w-3 h-3" />
            {durationMs}ms
          </span>
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="p-0.5 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
          title={expanded ? 'Collapse step output' : 'Expand full step output (resizable)'}
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {/* Remove */}
        <button
          onClick={() => onRemove(step.id)}
          className="p-0.5 text-neutral-600 hover:text-red-400 transition-colors cursor-pointer"
          title="Remove step"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Config area + output preview */}
      <div className="px-3 py-2 space-y-2">
        {/* Config fields */}
        {adapter?.configFields.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            {adapter.configFields.map((field) => {
              const val = (step.config as any)[field.key];
              if (field.type === 'boolean') {
                // For pattern / flags (text inputs in regex-filter) we use a text input
                const isText = field.key === 'pattern' || field.key === 'flags';
                if (isText) {
                  return (
                    <label key={field.key} className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                        {field.label}
                      </span>
                      <input
                        type="text"
                        value={val as string}
                        placeholder={field.key === 'pattern' ? '/pattern/' : 'gm'}
                        onChange={(e) =>
                          onConfigChange(step.id, { ...step.config, [field.key]: e.target.value })
                        }
                        className="bg-transparent border border-theme-subtle rounded px-2 py-0.5 text-xs font-mono text-theme-main outline-none w-32 focus:border-neutral-600"
                      />
                    </label>
                  );
                }
                return (
                  <label key={field.key} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!val}
                      onChange={(e) =>
                        onConfigChange(step.id, { ...step.config, [field.key]: e.target.checked })
                      }
                      className="accent-[#1D9BF0]"
                    />
                    <span className="text-[10px] font-mono text-neutral-400">{field.label}</span>
                  </label>
                );
              }
              if (field.type === 'select') {
                return (
                  <label key={field.key} className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                      {field.label}
                    </span>
                    <select
                      value={val as string}
                      onChange={(e) =>
                        onConfigChange(step.id, {
                          ...step.config,
                          [field.key]: isNaN(Number(e.target.value))
                            ? e.target.value
                            : Number(e.target.value),
                        })
                      }
                      className="bg-neutral-950 border border-theme-subtle rounded px-2 py-0.5 text-xs font-mono text-theme-main outline-none cursor-pointer"
                    >
                      {field.options?.map((opt) => (
                        <option key={String(opt.value)} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              }
              return null;
            })}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-400 text-[11px] font-mono bg-red-400/5 border border-red-400/20 rounded px-2 py-1">
            {error}
          </p>
        )}

        {/* Output preview (always shown) */}
        {hasOutput && !error && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider">
                Output
              </span>
              <div className="flex items-center gap-2">
                {!expanded && (
                  <button
                    onClick={() => setExpanded(true)}
                    className="flex items-center gap-1 text-[10px] font-mono text-neutral-600 hover:text-[#1D9BF0] transition-colors cursor-pointer"
                    title="Expand full output"
                  >
                    <ChevronDown className="w-3 h-3" />
                    Expand
                  </button>
                )}
                <button
                  onClick={copyStepOutput}
                  className="flex items-center gap-1 text-[10px] font-mono text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                >
                  {copiedStep ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedStep ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <pre className="text-[11px] font-mono text-neutral-400 bg-neutral-950 rounded px-2 py-1.5 overflow-x-auto overflow-y-auto whitespace-pre-wrap break-all max-h-[120px]">
              {preview}
            </pre>
          </div>
        )}

        {/* Full output (expanded) */}
        {expanded && hasOutput && !error && (
          <pre className="text-[11px] font-mono text-theme-main bg-neutral-950 rounded px-2 py-1.5 overflow-auto max-h-[350px] min-h-[120px] resize-y whitespace-pre-wrap break-all border border-theme-subtle">
            {output}
          </pre>
        )}
      </div>
    </div>
  );
};

// ── Add Step Dropdown ─────────────────────────────────────────────────────────

interface AddStepDropdownProps {
  onAdd: (adapterId: AdapterId) => void;
}

const AddStepDropdown: React.FC<AddStepDropdownProps> = ({ onAdd }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const categories = Array.from(new Set(ADAPTERS.map((a) => a.category)));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        id="pipeline-add-step-btn"
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-[#1D9BF0] text-white rounded hover:bg-[#1a8cd8] transition-colors cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Step
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-56 rounded-lg border border-theme-subtle bg-neutral-950 shadow-xl shadow-black/40 overflow-hidden">
          {categories.map((cat) => (
            <div key={cat}>
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-neutral-600 bg-neutral-950 border-b border-theme-subtle sticky top-0">
                {cat}
              </div>
              {ADAPTERS.filter((a) => a.category === cat).map((adapter) => (
                <button
                  key={adapter.id}
                  onClick={() => {
                    onAdd(adapter.id);
                    setOpen(false);
                  }}
                  className="w-full flex flex-col px-3 py-2 hover:bg-neutral-900 transition-colors text-left cursor-pointer border-b border-theme-subtle last:border-0"
                >
                  <span className={`text-xs font-mono font-semibold ${CATEGORY_COLORS[cat] ?? 'text-theme-main'}`}>
                    {adapter.label}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-600 leading-tight mt-0.5">
                    {adapter.description}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main PipelineTool Component ───────────────────────────────────────────────

export const PipelineTool: React.FC = () => {
  const [steps, setSteps] = useState<PipelineStep[]>([]);
  const [input, setInput] = useState('');
  const [results, setResults] = useState<Record<string, { output: string; error: string | null; durationMs: number }>>({});
  const [finalOutput, setFinalOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [hasRunOnce, setHasRunOnce] = useState(false);
  const [urlRestored, setUrlRestored] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle escape key to exit full screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  // Set mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);

  const dragId = useRef<string | null>(null);

  // ── Restore from URL hash on mount ──────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace('#p=', '');
    if (!hash) return;
    const parsed = deserializePipeline(hash);
    if (!parsed) return;
    const restored: PipelineStep[] = parsed.steps.map((s) => ({
      id: uid(),
      adapterId: s.a,
      config: s.c,
    }));
    setSteps(restored);
    setInput(parsed.input);
    setUrlRestored(true);
  }, []);

  // ── Auto-run when steps or input change (debounced) ──────────────────────
  const runTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerRun = useCallback(
    (stepsToRun: PipelineStep[], inputToRun: string) => {
      if (runTimeout.current) clearTimeout(runTimeout.current);
      if (stepsToRun.length === 0) return;
      runTimeout.current = setTimeout(async () => {
        setIsRunning(true);
        const pipeResult = await runPipeline(stepsToRun, inputToRun);
        const newResults: typeof results = {};
        pipeResult.steps.forEach((sr) => {
          newResults[sr.stepId] = { output: sr.output, error: sr.error, durationMs: sr.durationMs };
        });
        setResults(newResults);
        setFinalOutput(pipeResult.finalOutput);
        setHasRunOnce(true);
        setIsRunning(false);
      }, 350);
    },
    []
  );

  useEffect(() => {
    triggerRun(steps, input);
  }, [steps, input, triggerRun]);

  // Auto-run after URL restore
  useEffect(() => {
    if (urlRestored && steps.length > 0) {
      triggerRun(steps, input);
      setUrlRestored(false);
    }
  }, [urlRestored, steps, input, triggerRun]);

  // ── Step management ──────────────────────────────────────────────────────
  const addStep = (adapterId: AdapterId) => {
    const adapter = ADAPTER_MAP[adapterId];
    if (!adapter) return;
    setSteps((prev) => [
      ...prev,
      { id: uid(), adapterId, config: defaultConfig(adapter) },
    ]);
  };

  const removeStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
    setResults((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updateConfig = (id: string, config: AdapterConfig) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, config } : s)));
  };

  const clearAll = () => {
    setSteps([]);
    setResults({});
    setFinalOutput('');
    setInput('');
    setHasRunOnce(false);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const loadSampleData = () => {
    setSteps([
      { id: uid(), adapterId: 'base64-decode', config: {} },
      { id: uid(), adapterId: 'json-format', config: { indent: 2 } },
    ]);
    setInput('eyJ1c2VyIjogIkFsZXggUml2ZXJhIiwgInJvbGUiOiAiRGV2ZWxvcGVyIiwgInN0YXR1cyI6ICJhY3RpdmUifQ==');
  };

  // ── Drag & drop reorder ──────────────────────────────────────────────────
  const handleDragStart = (_e: React.DragEvent, id: string) => {
    dragId.current = id;
  };

  const handleDragOver = (e: React.DragEvent, _id: string) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId.current || dragId.current === targetId) return;
    setSteps((prev) => {
      const fromIdx = prev.findIndex((s) => s.id === dragId.current);
      const toIdx = prev.findIndex((s) => s.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
    dragId.current = null;
  };

  // ── Copy & share ─────────────────────────────────────────────────────────
  const copyOutput = () => {
    navigator.clipboard.writeText(finalOutput).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const downloadOutput = () => {
    const blob = new Blob([finalOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pipeline-output.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareLink = () => {
    const encoded = serializePipeline(steps, input);
    const url = `${window.location.origin}${window.location.pathname}#p=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      window.history.replaceState(null, '', `${window.location.pathname}#p=${encoded}`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const toolContent = (
    <div className={`rounded-lg border border-theme-subtle bg-surface overflow-hidden flex flex-col transition-all duration-200 ${isFullScreen ? 'fixed inset-0 z-[9999] rounded-none' : 'w-full'}`}>

      {/* ── Toolbar ── */}
      <div className={`flex flex-wrap items-center gap-2 px-3 py-2 border-b border-theme-subtle bg-neutral-950 shrink-0 ${isFullScreen ? 'sticky top-0 z-[10000]' : ''}`}>
        <AddStepDropdown onAdd={addStep} />

        {steps.length === 0 && (
          <button
            id="pipeline-load-sample-btn"
            onClick={loadSampleData}
            className="px-3 py-1.5 text-xs font-mono border border-theme-subtle text-theme-muted rounded hover:text-theme-main hover:border-neutral-600 transition-colors cursor-pointer"
          >
            Load Sample
          </button>
        )}

        <button
          id="pipeline-run-btn"
          onClick={() => triggerRun(steps, input)}
          disabled={steps.length === 0 || isRunning}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-theme-subtle text-theme-muted rounded hover:text-theme-main hover:border-neutral-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isRunning ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
          Run
        </button>

        {steps.length > 0 && (
          <button
            id="pipeline-share-btn"
            onClick={shareLink}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-theme-subtle text-theme-muted rounded hover:text-theme-main hover:border-neutral-600 transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link className="w-3.5 h-3.5" />}
            {copiedLink ? 'Link Copied!' : 'Share'}
          </button>
        )}

        {steps.length > 0 && (
          <button
            id="pipeline-clear-btn"
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-theme-subtle text-theme-muted rounded hover:text-red-400 hover:border-red-400/40 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>
        )}

        <div className="flex-1" />

        {steps.length > 0 && (
          <span className="text-[10px] font-mono text-neutral-600">
            {steps.length} step{steps.length !== 1 ? 's' : ''}
            {hasRunOnce && !isRunning && (
              <span className="ml-1.5 text-emerald-500">• ran</span>
            )}
          </span>
        )}

        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
          className="p-1.5 rounded border border-theme-subtle text-neutral-400 hover:text-theme-main hover:border-neutral-600 transition-colors cursor-pointer"
        >
          {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ── Body ── */}
      <div className={`p-3 space-y-3 ${isFullScreen ? 'flex-1 overflow-hidden flex flex-col' : ''}`}>

        {/* Empty state */}
        {steps.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 text-center gap-3">
            <div className="text-[32px]">⛓</div>
            <p className="text-sm font-mono text-neutral-500 max-w-xs leading-relaxed">
              Add steps to build your pipeline. Each step's output feeds into the next step automatically.
            </p>
            <button
              id="pipeline-load-demo-btn"
              onClick={loadSampleData}
              className="mt-1 px-4 py-2 text-xs font-mono bg-neutral-900 border border-theme-subtle text-theme-main rounded hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Load Demo Pipeline (Base64 Decode → JSON Format)
            </button>
            <div className="text-[11px] font-mono text-neutral-700 space-y-1 mt-2">
              <p>100% local - nothing leaves your browser tab.</p>
            </div>
          </div>
        )}

        {/* Steps + Input */}
        {steps.length > 0 && (
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-3 ${isFullScreen ? 'flex-1 min-h-0' : ''}`}>

            {/* Left: Input + Steps */}
            <div className={`space-y-2 ${isFullScreen ? 'h-full overflow-y-auto pr-1' : ''}`}>
              {/* Input area */}
              <div className="rounded-lg border border-theme-subtle overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-950 border-b border-theme-subtle">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                    Initial Input
                  </span>
                  <span className="text-[10px] font-mono text-neutral-700">Step 0</span>
                </div>
                <textarea
                  id="pipeline-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste your initial input here..."
                  className="w-full min-h-[160px] bg-transparent text-xs font-mono text-theme-main resize-y outline-none p-3 placeholder:text-neutral-700"
                />
              </div>

              {/* Step cards */}
              <div className="space-y-2">
                {steps.map((step, i) => {
                  const r = results[step.id];
                  return (
                    <StepCard
                      key={step.id}
                      step={step}
                      index={i}
                      total={steps.length}
                      output={r?.output ?? ''}
                      error={r?.error ?? null}
                      durationMs={r?.durationMs}
                      isRunning={isRunning}
                      onRemove={removeStep}
                      onConfigChange={updateConfig}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    />
                  );
                })}
              </div>
            </div>

            {/* Right: Final Output */}
            <div className={`rounded-lg border border-theme-subtle overflow-hidden flex flex-col ${isFullScreen ? 'h-full' : ''}`}>
              <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-950 border-b border-theme-subtle shrink-0">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                  Final Output
                </span>
                <div className="flex items-center gap-2">
                  {finalOutput && (
                    <>
                      <button
                        id="pipeline-download-btn"
                        onClick={downloadOutput}
                        className="flex items-center gap-1 text-[10px] font-mono text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        .txt
                      </button>
                      <button
                        id="pipeline-copy-output-btn"
                        onClick={copyOutput}
                        className="flex items-center gap-1 text-[10px] font-mono text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                      >
                        {copied ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex-1 relative flex flex-col min-h-[350px]">
                {isRunning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-surface/60 z-10">
                    <Loader2 className="w-5 h-5 text-neutral-500 animate-spin" />
                  </div>
                )}
                {!finalOutput && hasRunOnce && !isRunning && (
                  <div className="flex-1 flex items-center justify-center min-h-[200px]">
                    <span className="text-xs font-mono text-neutral-600">
                      Pipeline produced no output (check step errors above)
                    </span>
                  </div>
                )}
                {!hasRunOnce && !isRunning && (
                  <div className="flex-1 flex items-center justify-center min-h-[200px]">
                    <span className="text-xs font-mono text-neutral-700">
                      Output appears here after pipeline runs
                    </span>
                  </div>
                )}
                {finalOutput && !isRunning && (
                  <pre className="flex-1 w-full h-full min-h-[280px] text-xs font-mono text-theme-main p-3 overflow-auto whitespace-pre-wrap break-all resize-y">
                    {finalOutput}
                  </pre>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Pipeline flow diagram (text) */}
        {steps.length > 1 && (
          <div className="border-t border-theme-subtle pt-2 overflow-x-auto">
            <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-600 whitespace-nowrap">
              <span className="text-neutral-700">INPUT</span>
              {steps.map((step, i) => (
                <React.Fragment key={step.id}>
                  <span className="text-neutral-800 mx-0.5">→</span>
                  <span
                    className={`${CATEGORY_COLORS[ADAPTER_MAP[step.adapterId]?.category ?? ''] ?? 'text-neutral-400'}`}
                  >
                    {ADAPTER_MAP[step.adapterId]?.label ?? step.adapterId}
                  </span>
                </React.Fragment>
              ))}
              <span className="text-neutral-800 mx-0.5">→</span>
              <span className="text-emerald-600">OUTPUT</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-3 py-2 border-t border-theme-subtle flex items-center justify-between">
        <span className="text-[10px] font-mono text-neutral-500">
          Local browser processing - No data sent to any server
        </span>
        <span className="text-[10px] font-mono text-neutral-600">Client-Side</span>
      </div>
    </div>
  );

  if (isFullScreen && mounted && typeof document !== 'undefined') {
    return createPortal(toolContent, document.body);
  }

  return toolContent;
};
