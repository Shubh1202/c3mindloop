'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  StepForward, 
  Copy, 
  Check, 
  Info, 
  Layers, 
  Clock, 
  Sparkles, 
  Zap, 
  Activity, 
  Gauge, 
  Code2,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useTranslation } from '../../lib/i18n';
import { PRESETS } from './nodeVisualizer/presets';
import { EventLoopEngine } from './nodeVisualizer/engine';
import { SimulationStep, EventLoopPhase, MicrotaskSubPhase } from './nodeVisualizer/types';

export const NodeEventLoopVisualizerTool: React.FC = () => {
  const { t } = useTranslation();

  const [mounted, setMounted] = useState(false);
  // State
  const [selectedPreset, setSelectedPreset] = useState('default');
  const [isESM, setIsESM] = useState(false);
  const [code, setCode] = useState(PRESETS[0].codeCJS);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [steps, setSteps] = useState<SimulationStep[]>(() => {
    const initialEngine = new EventLoopEngine(PRESETS[0].codeCJS, false);
    const res = initialEngine.simulate();
    return res.steps || [];
  });
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1); // 0.5x, 1x, 2x
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeInfoModal, setActiveInfoModal] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const terminalLogsContainerRef = useRef<HTMLDivElement | null>(null);

  // Load preset on change or format switch
  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const found = PRESETS.find(p => p.id === presetId);
    if (found) {
      setCode(isESM ? found.codeESM : found.codeCJS);
      setIsPlaying(false);
      setError(null);
    }
  };

  const handleToggleModuleFormat = (esm: boolean) => {
    setIsESM(esm);
    const found = PRESETS.find(p => p.id === selectedPreset);
    if (found) {
      setCode(esm ? found.codeESM : found.codeCJS);
    }
    setIsPlaying(false);
  };

  // Run simulation & generate steps
  const runSimulation = () => {
    setError(null);
    try {
      const engine = new EventLoopEngine(code, isESM);
      const res = engine.simulate();

      if (res.error) {
        setError(res.error);
        return;
      }

      setSteps(res.steps);
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to simulate event loop.');
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentStepIndex(0);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // Autoplay ticker
  useEffect(() => {
    if (isPlaying && steps.length > 0) {
      const intervalMs = Math.max(300, 1000 / speed);
      timerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, steps.length]);

  // Lock body scroll and handle Escape key to exit fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  // Auto-scroll terminal strictly within its own container without window scrolling
  useEffect(() => {
    if (terminalLogsContainerRef.current) {
      terminalLogsContainerRef.current.scrollTop = terminalLogsContainerRef.current.scrollHeight;
    }
  }, [currentStepIndex]);

  const currentStep = steps[currentStepIndex] || {
    stepIndex: 0,
    description: 'Ready to run.',
    callStack: [],
    macrotaskQueue: [],
    microtaskQueue: [],
    nextTickQueue: [],
    phase: 'start' as EventLoopPhase,
    microPhase: 'idle' as MicrotaskSubPhase,
    terminalLogs: [],
    metrics: { loopCount: 0, events: 0, eventsWaiting: 0 },
  };

  const EVENT_LOOP_PHASES: { id: EventLoopPhase; label: string; desc: string }[] = [
    { id: 'start', label: 'Start', desc: 'Main sync script execution' },
    { id: 'timers', label: 'Timers', desc: 'setTimeout & setInterval callbacks' },
    { id: 'pending', label: 'Pending Callbacks', desc: 'I/O callbacks deferred to the next loop iteration' },
    { id: 'idle_prepare', label: 'Idle - Prepare', desc: 'Internal libuv kernel polling operations' },
    { id: 'poll', label: 'Poll', desc: 'Retrieve new I/O events; execute I/O callbacks' },
    { id: 'check', label: 'Check', desc: 'setImmediate() callbacks' },
    { id: 'close', label: 'Close Callbacks', desc: 'socket.on("close") and cleanup handlers' },
    { id: 'finish', label: 'Finish', desc: 'All queues drained; process exit' },
  ];

  const TICKS_PHASES: { id: MicrotaskSubPhase; label: string; desc: string }[] = [
    { id: 'start', label: 'Start', desc: 'Microtask checkpoint entry' },
    { id: 'next_tick', label: 'Next Tick', desc: 'process.nextTick() queue (Highest priority)' },
    { id: 'micro_tasks', label: 'Micro Tasks', desc: 'Promises (.then), queueMicrotask, async/await' },
    { id: 'finish', label: 'Finish', desc: 'Microtask checkpoint complete' },
  ];

  const content = (
    <div
      className={`transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-[99999] bg-neutral-950 flex flex-col h-screen w-screen overflow-hidden p-2 sm:p-4'
          : 'rounded-lg border border-theme-subtle bg-surface overflow-hidden shadow-2xl'
      }`}
    >
      {/* 1. Action Toolbar Row - Toolbar First Rule */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 border-b border-theme-subtle bg-neutral-950/90 backdrop-blur-md shrink-0">
        {/* Left Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Preset Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline">Preset:</span>
            <select
              value={selectedPreset}
              onChange={e => handlePresetChange(e.target.value)}
              className="px-2.5 py-1 text-xs font-mono bg-neutral-900 border border-theme-subtle text-neutral-200 rounded focus:border-[#1D9BF0] focus:outline-none transition-colors"
            >
              {PRESETS.map(preset => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          {/* Module Mode Selector (CommonJS / ESModules) */}
          <div className="flex items-center bg-neutral-900 p-0.5 rounded border border-theme-subtle text-[11px] font-mono">
            <button
              onClick={() => handleToggleModuleFormat(false)}
              className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                !isESM ? 'bg-[#1D9BF0] text-white font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${!isESM ? 'bg-white' : 'bg-neutral-600'}`}></span>
              CommonJS
            </button>
            <button
              onClick={() => handleToggleModuleFormat(true)}
              className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                isESM ? 'bg-[#1D9BF0] text-white font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isESM ? 'bg-white' : 'bg-neutral-600'}`}></span>
              ESModules
            </button>
          </div>

          {/* Run / Pause / Step Controls */}
          <div className="flex items-center gap-1">
            {!isPlaying ? (
              <button
                onClick={runSimulation}
                className="px-3 py-1.5 text-xs font-mono font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run</span>
              </button>
            ) : (
              <button
                onClick={() => setIsPlaying(false)}
                className="px-3 py-1.5 text-xs font-mono font-medium bg-amber-600 hover:bg-amber-500 text-white rounded flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={handleStepForward}
              disabled={steps.length === 0 || currentStepIndex >= steps.length - 1}
              title="Next Step"
              className="px-2.5 py-1.5 text-xs font-mono border border-theme-subtle text-neutral-300 rounded hover:text-white hover:border-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <StepForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleReset}
              title="Reset Visualizer"
              className="px-2.5 py-1.5 text-xs font-mono border border-theme-subtle text-neutral-400 rounded hover:text-neutral-200 hover:border-neutral-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Toolbar Controls (Speed + Copy + Fullscreen) */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Speed Pill Selector */}
          <div className="flex items-center bg-neutral-900 border border-theme-subtle rounded p-0.5 text-[10px] font-mono">
            {[0.5, 1, 2].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  speed === s ? 'bg-neutral-800 text-[#1D9BF0] font-bold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={handleCopyCode}
            className="px-2.5 py-1.5 text-xs font-mono border border-theme-subtle text-neutral-400 rounded hover:text-white hover:border-neutral-600 flex items-center gap-1 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Fullscreen Toggle Button */}
          <button
            onClick={() => setIsFullscreen(prev => !prev)}
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen'}
            className="px-2.5 py-1.5 text-xs font-mono border border-theme-subtle text-neutral-400 rounded hover:text-white hover:border-neutral-600 flex items-center gap-1 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-[#1D9BF0]" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Step Description Status Banner */}
      <div className="px-3.5 py-2 bg-neutral-900/60 border-b border-theme-subtle flex flex-wrap items-center justify-between gap-2 text-xs font-mono shrink-0">
        <div className="flex items-center gap-2 text-neutral-300">
          <Activity className="w-3.5 h-3.5 text-[#1D9BF0] animate-pulse" />
          <span className="text-neutral-500">Step {steps.length > 0 ? currentStepIndex + 1 : 0} of {steps.length}:</span>
          <span className="text-neutral-200 font-medium truncate max-w-xl">{currentStep.description}</span>
        </div>
        {steps.length > 0 && (
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={steps.length - 1}
              value={currentStepIndex}
              onChange={e => {
                setIsPlaying(false);
                setCurrentStepIndex(Number(e.target.value));
              }}
              className="w-24 sm:w-36 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#1D9BF0]"
            />
          </div>
        )}
      </div>

      {/* Error Message if any */}
      {error && (
        <div className="px-4 py-2 bg-red-950/40 border-b border-red-900/50 text-red-400 text-xs font-mono shrink-0">
          ⚠️ {error}
        </div>
      )}

      {/* 2. Main Visualizer Grid (Matching Image Architecture) */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-theme-subtle overflow-y-auto ${isFullscreen ? 'flex-1 min-h-0' : ''}`}>
        {/* Left Section (5 cols): Code Editor + Terminal */}
        <div className="lg:col-span-5 flex flex-col divide-y divide-theme-subtle bg-neutral-950/50 min-h-0">
          {/* Code Editor Header */}
          <div className="px-3 py-1.5 bg-neutral-950 border-b border-theme-subtle flex items-center justify-between text-[11px] font-mono text-neutral-400 shrink-0">
            <span className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-[#1D9BF0]" />
              JavaScript / Node.js Engine
            </span>
            <span className="text-[10px] text-neutral-500">Editable Code</span>
          </div>

          {/* Interactive Code Editor with line highlights */}
          <div className={`relative p-2 flex-1 overflow-auto font-mono text-xs bg-neutral-950/70 ${isFullscreen ? 'min-h-[220px]' : 'min-h-[260px] max-h-[340px]'}`}>
            <textarea
              value={code}
              onChange={e => {
                setCode(e.target.value);
                setIsPlaying(false);
              }}
              spellCheck={false}
              className="w-full h-full min-h-[200px] bg-transparent text-neutral-200 font-mono text-xs resize-none outline-none leading-relaxed selection:bg-[#1D9BF0]/30"
              placeholder="// Write your Node.js code here..."
            />
          </div>

          {/* Terminal Window (Ubuntu / macOS styled) */}
          <div className={`flex flex-col bg-[#1e1322] border-t border-theme-subtle ${isFullscreen ? 'h-[220px] shrink-0' : 'min-h-[220px]'}`}>
            {/* Terminal Window Header */}
            <div className="px-3 py-1.5 bg-[#2d1b33] border-b border-neutral-900 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></span>
              </div>
              <span className="text-[11px] font-mono text-neutral-300 font-medium">user@desktop:~</span>
              <span className="w-8"></span>
            </div>

            {/* Terminal Logs View (ref on container for isolated scroll) */}
            <div
              ref={terminalLogsContainerRef}
              className="p-3 font-mono text-xs space-y-1.5 flex-1 max-h-[200px] overflow-y-auto text-neutral-200"
            >
              <div className="text-[11px] text-neutral-500 pb-1 border-b border-neutral-800">
                $ node script.js
              </div>
              {currentStep.terminalLogs.length === 0 ? (
                <div className="text-neutral-500 italic text-[11px] pt-1">
                  (No console output generated yet)
                </div>
              ) : (
                currentStep.terminalLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-emerald-400 shrink-0">&gt;</span>
                    <span
                      className={`break-all ${
                        log.type === 'error'
                          ? 'text-red-400'
                          : log.type === 'warn'
                          ? 'text-amber-300'
                          : 'text-neutral-100'
                      }`}
                    >
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Section (7 cols): Event Loop Simulation Panels */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-theme-subtle bg-neutral-950/30">
          
          {/* Column 1: Call Stack & Macrotask / Microtask Queues */}
          <div className="flex flex-col divide-y divide-theme-subtle">
            {/* Macrotask Queue Card */}
            <div className="p-3 flex flex-col h-[180px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Macrotask Queue
                </span>
                <button
                  onClick={() => setActiveInfoModal('macrotask')}
                  className="text-[10px] font-mono text-neutral-400 hover:text-[#1D9BF0] flex items-center gap-0.5 transition-colors"
                >
                  <Info className="w-3 h-3" />
                  About
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {currentStep.macrotaskQueue.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[11px] font-mono text-neutral-600 border border-dashed border-neutral-800 rounded">
                    Empty Queue
                  </div>
                ) : (
                  currentStep.macrotaskQueue.map((task) => (
                    <div
                      key={task.id}
                      className="p-1.5 bg-neutral-900 border border-amber-900/40 rounded text-[11px] font-mono flex items-center justify-between text-amber-200 animate-fadeIn"
                    >
                      <span className="truncate">{task.name}</span>
                      {task.details && (
                        <span className="text-[9px] bg-amber-950 text-amber-400 px-1 py-0.5 rounded border border-amber-800/50 shrink-0 ml-1">
                          {task.details}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Microtask Queue Card */}
            <div className="p-3 flex flex-col h-[180px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Microtask Queue
                </span>
                <button
                  onClick={() => setActiveInfoModal('microtask')}
                  className="text-[10px] font-mono text-neutral-400 hover:text-[#1D9BF0] flex items-center gap-0.5 transition-colors"
                >
                  <Info className="w-3 h-3" />
                  About
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {currentStep.microtaskQueue.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[11px] font-mono text-neutral-600 border border-dashed border-neutral-800 rounded">
                    Empty Queue
                  </div>
                ) : (
                  currentStep.microtaskQueue.map((task) => (
                    <div
                      key={task.id}
                      className="p-1.5 bg-neutral-900 border border-purple-900/40 rounded text-[11px] font-mono flex items-center justify-between text-purple-200 animate-fadeIn"
                    >
                      <span className="truncate">{task.name}</span>
                      <span className="text-[9px] bg-purple-950 text-purple-300 px-1 py-0.5 rounded border border-purple-800/50 shrink-0 ml-1">
                        Promise
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Call Stack Card */}
            <div className="p-3 flex flex-col flex-1 min-h-[190px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#1D9BF0]" />
                  Call Stack
                </span>
                <button
                  onClick={() => setActiveInfoModal('callstack')}
                  className="text-[10px] font-mono text-neutral-400 hover:text-[#1D9BF0] flex items-center gap-0.5 transition-colors"
                >
                  <Info className="w-3 h-3" />
                  About
                </button>
              </div>

              <div className="flex-1 overflow-y-auto flex flex-col-reverse justify-start gap-1.5 pr-1">
                {currentStep.callStack.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-[11px] font-mono text-neutral-600 border border-dashed border-neutral-800 rounded">
                    Stack Idle
                  </div>
                ) : (
                  currentStep.callStack.map((frame, idx) => (
                    <div
                      key={frame.id}
                      className={`p-2 rounded text-xs font-mono flex items-center justify-between border transition-all ${
                        idx === currentStep.callStack.length - 1
                          ? 'bg-[#1D9BF0]/15 border-[#1D9BF0] text-neutral-100 shadow-[0_0_12px_rgba(29,155,240,0.25)]'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      <span className="font-semibold">{frame.name}</span>
                      {frame.location && (
                        <span className="text-[10px] text-neutral-400">{frame.location}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Event Loop Phases Diagram */}
          <div className="p-3 flex flex-col divide-y divide-transparent">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                Event Loop
              </span>
              <button
                onClick={() => setActiveInfoModal('eventloop')}
                className="text-[10px] font-mono text-neutral-400 hover:text-[#1D9BF0] flex items-center gap-0.5 transition-colors"
              >
                <Info className="w-3 h-3" />
                About
              </button>
            </div>

            {/* Event Loop Phases Vertical Stepper */}
            <div className="space-y-1.5 flex-1">
              {EVENT_LOOP_PHASES.map((phase, pIdx) => {
                const phaseOrder: Record<EventLoopPhase, number> = {
                  start: 0,
                  timers: 1,
                  pending: 2,
                  idle_prepare: 3,
                  poll: 4,
                  check: 5,
                  close: 6,
                  finish: 7,
                };
                const currentPhaseIdx = phaseOrder[currentStep.phase] ?? 0;
                const isActive = currentStep.phase === phase.id;
                const isCompleted = pIdx < currentPhaseIdx || currentStep.phase === 'finish';

                return (
                  <div
                    key={phase.id}
                    className={`flex items-center gap-2.5 p-1.5 rounded text-xs font-mono transition-all ${
                      isActive
                        ? 'bg-emerald-950/40 border border-emerald-500/80 text-emerald-300 font-semibold shadow-sm'
                        : isCompleted
                        ? 'bg-neutral-900/60 border border-neutral-800 text-neutral-300'
                        : 'bg-neutral-900/30 border border-neutral-800/30 text-neutral-500'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'border-emerald-400 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                          : isCompleted
                          ? 'border-emerald-700/60 bg-emerald-950/60 text-emerald-400'
                          : 'border-neutral-700 bg-neutral-800'
                      }`}
                    >
                      {isActive ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      ) : isCompleted ? (
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      ) : null}
                    </div>
                    <div className="truncate flex-1 flex items-center justify-between">
                      <span>{phase.label}</span>
                      {isActive && (
                        <span className="text-[9px] uppercase tracking-wider bg-emerald-900/60 text-emerald-300 px-1 py-0.2 rounded border border-emerald-700/50">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 3: Metrics & Ticks / Rejections */}
          <div className="flex flex-col divide-y divide-theme-subtle">
            {/* Metrics Card */}
            <div className="p-3 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-[#1D9BF0]" />
                  Metrics
                </span>
                <button
                  onClick={() => setActiveInfoModal('metrics')}
                  className="text-[10px] font-mono text-neutral-400 hover:text-[#1D9BF0] flex items-center gap-0.5 transition-colors"
                >
                  <Info className="w-3 h-3" />
                  About
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 py-1 text-center font-mono">
                <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                  <div className="text-[10px] text-neutral-400">Loop Count</div>
                  <div className="text-lg font-bold text-neutral-100 mt-0.5">
                    {currentStep.metrics.loopCount}
                  </div>
                </div>
                <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                  <div className="text-[10px] text-neutral-400">Events</div>
                  <div className="text-lg font-bold text-[#1D9BF0] mt-0.5">
                    {currentStep.metrics.events}
                  </div>
                </div>
                <div className="p-2 bg-neutral-900 rounded border border-neutral-800">
                  <div className="text-[10px] text-neutral-400">Waiting</div>
                  <div className="text-lg font-bold text-amber-400 mt-0.5">
                    {currentStep.metrics.eventsWaiting}
                  </div>
                </div>
              </div>
            </div>

            {/* Ticks & Rejections Card */}
            <div className="p-3 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Ticks & Rejections
                </span>
                <button
                  onClick={() => setActiveInfoModal('ticks')}
                  className="text-[10px] font-mono text-neutral-400 hover:text-[#1D9BF0] flex items-center gap-0.5 transition-colors"
                >
                  <Info className="w-3 h-3" />
                  About
                </button>
              </div>

              {/* Ticks sub-phases */}
              <div className="space-y-1.5 flex-1">
                {TICKS_PHASES.map((sub, sIdx) => {
                  const microPhaseOrder: Record<MicrotaskSubPhase, number> = {
                    idle: 0,
                    start: 1,
                    next_tick: 2,
                    micro_tasks: 3,
                    finish: 4,
                  };
                  const currentMicroIdx = microPhaseOrder[currentStep.microPhase] ?? 0;
                  const isActive = currentStep.microPhase === sub.id;
                  const isCompleted = currentMicroIdx > 0 && (sIdx + 1 < currentMicroIdx || currentStep.microPhase === 'finish');

                  return (
                    <div
                      key={sub.id}
                      className={`flex items-center gap-2 p-1.5 rounded text-xs font-mono transition-all ${
                        isActive
                          ? 'bg-cyan-950/40 border border-cyan-500/80 text-cyan-300 font-semibold shadow-sm'
                          : isCompleted
                          ? 'bg-neutral-900/60 border border-neutral-800 text-neutral-300'
                          : 'bg-neutral-900/30 border border-neutral-800/30 text-neutral-500'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'border-cyan-400 bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.6)]'
                            : isCompleted
                            ? 'border-cyan-700/60 bg-cyan-950/60 text-cyan-400'
                            : 'border-neutral-700 bg-neutral-800'
                        }`}
                      >
                        {isActive ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        ) : isCompleted ? (
                          <Check className="w-2 h-2 stroke-[3]" />
                        ) : null}
                      </div>
                      <span className="flex-1">{sub.label}</span>
                      {isActive && (
                        <span className="text-[9px] uppercase tracking-wider bg-cyan-900/60 text-cyan-300 px-1 py-0.2 rounded border border-cyan-700/50">
                          Active
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Active nextTick items count */}
              <div className="mt-2 pt-2 border-t border-neutral-800 text-[10px] font-mono text-neutral-400 flex items-center justify-between">
                <span>process.nextTick queue:</span>
                <span className="text-cyan-300 font-bold">{currentStep.nextTickQueue.length} pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Footer Bar - Standard C3 MindLoop Footer */}
      <div className="px-3.5 py-2 border-t border-theme-subtle bg-neutral-950 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] font-mono text-neutral-500">
          {t('tools.nodeEventLoopVisualizer.privacyNote') || 'Local browser processing - No data sent to any server'}
        </span>
        <span className="text-[10px] font-mono text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
          100% Client-Side Engine
        </span>
      </div>

      {/* About Modal Dialog */}
      {activeInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg max-w-md w-full p-5 space-y-3 font-mono text-xs text-neutral-300 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h3 className="font-bold text-neutral-100 text-sm">
                {activeInfoModal === 'macrotask' && 'About Macrotask Queue'}
                {activeInfoModal === 'microtask' && 'About Microtask Queue'}
                {activeInfoModal === 'callstack' && 'About Call Stack'}
                {activeInfoModal === 'eventloop' && 'About Node.js Event Loop Phases'}
                {activeInfoModal === 'metrics' && 'About Event Loop Metrics'}
                {activeInfoModal === 'ticks' && 'About Ticks & Rejections'}
              </h3>
              <button
                onClick={() => setActiveInfoModal(null)}
                className="text-neutral-400 hover:text-white px-2 py-0.5 text-xs rounded bg-neutral-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-neutral-300 leading-relaxed">
              {activeInfoModal === 'macrotask' && (
                <p>
                  The Macrotask queue holds timer callbacks (from <code className="text-amber-300">setTimeout</code>, <code className="text-amber-300">setInterval</code>), check callbacks (<code className="text-amber-300">setImmediate</code>), and I/O callbacks. One macrotask is processed per phase iteration, followed immediately by microtask queue flushing.
                </p>
              )}
              {activeInfoModal === 'microtask' && (
                <p>
                  The Microtask queue contains callbacks registered via <code className="text-purple-300">Promise.resolve().then()</code>, <code className="text-purple-300">queueMicrotask()</code>, and async/await continuations. Microtasks are completely drained before the event loop advances to the next phase.
                </p>
              )}
              {activeInfoModal === 'callstack' && (
                <p>
                  The Call Stack is V8&apos;s single-threaded execution context. Synchronous functions are pushed onto the top of the stack and popped off as they return. The Event Loop only pushes new callbacks when the Call Stack is completely empty.
                </p>
              )}
              {activeInfoModal === 'eventloop' && (
                <p>
                  Node.js event loop runs via libuv across distinct phases: <code className="text-emerald-300">Timers</code> &rarr; <code className="text-emerald-300">Pending Callbacks</code> &rarr; <code className="text-emerald-300">Idle/Prepare</code> &rarr; <code className="text-emerald-300">Poll</code> &rarr; <code className="text-emerald-300">Check</code> &rarr; <code className="text-emerald-300">Close</code>.
                </p>
              )}
              {activeInfoModal === 'ticks' && (
                <p>
                  <code className="text-cyan-300">process.nextTick()</code> is not technically part of the event loop. Instead, the nextTick queue is processed immediately after the current operation completes, regardless of the current phase of the event loop, before Promise microtasks.
                </p>
              )}
              {activeInfoModal === 'metrics' && (
                <p>
                  Live counters tracking the total number of complete Event Loop revolutions (<code className="text-neutral-200">Loop Count</code>), total processed execution events (<code className="text-neutral-200">Events</code>), and items waiting across all queues.
                </p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveInfoModal(null)}
                className="px-3 py-1 bg-[#1D9BF0] text-white text-xs font-mono rounded hover:bg-[#1a8cd8]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isFullscreen && mounted && typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }

  return content;
};
