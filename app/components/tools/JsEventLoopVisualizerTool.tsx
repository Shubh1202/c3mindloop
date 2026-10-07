'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Code2,
  Maximize2,
  Minimize2,
  Share2,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { useTranslation } from '../../lib/i18n';
import { JS_PRESETS } from './jsVisualizer/presets';
import { JsEventLoopEngine } from './jsVisualizer/engine';
import { SimulationStep, BrowserEventLoopPhase } from './jsVisualizer/types';

export const JsEventLoopVisualizerTool: React.FC = () => {
  const { t } = useTranslation();

  // State
  const [selectedPreset, setSelectedPreset] = useState('default');
  const [code, setCode] = useState(JS_PRESETS[0].code);
  const [steps, setSteps] = useState<SimulationStep[]>(() => {
    const engine = new JsEventLoopEngine(JS_PRESETS[0].code);
    const res = engine.simulate();
    return res.steps || [];
  });
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1); // 0.5x, 1x, 2x
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [activeInfoModal, setActiveInfoModal] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const terminalLogsContainerRef = useRef<HTMLDivElement | null>(null);

  // Load preset on change
  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const found = JS_PRESETS.find(p => p.id === presetId);
    if (found) {
      setCode(found.code);
      setIsPlaying(false);
      setError(null);
      const engine = new JsEventLoopEngine(found.code);
      const res = engine.simulate();
      if (res.steps) {
        setSteps(res.steps);
        setCurrentStepIndex(0);
      }
    }
  };

  // Run simulation & generate steps
  const runSimulation = () => {
    setError(null);
    try {
      const engine = new JsEventLoopEngine(code);
      const res = engine.simulate();

      if (res.error) {
        setError(res.error);
        return;
      }

      setSteps(res.steps);
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to simulate JS Event Loop.');
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

  const handleShare = async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : '';
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
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

  // Escape key for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Auto-scroll terminal container
  useEffect(() => {
    if (terminalLogsContainerRef.current) {
      terminalLogsContainerRef.current.scrollTop = terminalLogsContainerRef.current.scrollHeight;
    }
  }, [currentStepIndex]);

  const currentStep = steps[currentStepIndex] || {
    stepIndex: 0,
    description: 'Ready to run.',
    callStack: [],
    taskQueue: [],
    microtaskQueue: [],
    rafQueue: [],
    phase: 'idle' as BrowserEventLoopPhase,
    phaseStepIndex: 0,
    rerenderState: 'idle' as const,
    terminalLogs: [],
    metrics: { loopCycle: 0, tasksExecuted: 0, microtasksExecuted: 0, tasksWaiting: 0 },
  };

  const EVENT_LOOP_STAGES = [
    { number: 1, title: 'Evaluate Script', desc: 'Execute synchronous code on Call Stack' },
    { number: 2, title: 'Run a Task', desc: 'Pick oldest task from Task Queue (Macrotask)' },
    { number: 3, title: 'Run all Microtasks', desc: 'Drain all Promise & queueMicrotask callbacks' },
    { number: 4, title: 'Rerender', desc: 'Execute requestAnimationFrame & browser paint' },
  ];

  return (
    <div
      className={`transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-neutral-950 flex flex-col h-screen w-screen overflow-hidden p-2 sm:p-4'
          : 'rounded-lg border border-theme-subtle bg-surface overflow-hidden shadow-2xl'
      }`}
    >
      {/* 1. Action Toolbar Row - Single Heading Policy Compliant (Starts directly with Toolbar) */}
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
              {JS_PRESETS.map(preset => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
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

        {/* Right Toolbar Controls (Speed + Share + Copy + Fullscreen) */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Speed Selector */}
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
            onClick={handleShare}
            className="px-2.5 py-1.5 text-xs font-mono border border-theme-subtle text-neutral-400 rounded hover:text-white hover:border-neutral-600 flex items-center gap-1 transition-colors"
          >
            {shared ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{shared ? 'Copied Link' : 'Share'}</span>
          </button>

          <button
            onClick={handleCopyCode}
            className="px-2.5 py-1.5 text-xs font-mono border border-theme-subtle text-neutral-400 rounded hover:text-white hover:border-neutral-600 flex items-center gap-1 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(prev => !prev)}
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen'}
            className="px-2.5 py-1.5 text-xs font-mono border border-theme-subtle text-neutral-400 rounded hover:text-white hover:border-neutral-600 flex items-center gap-1 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-[#1D9BF0]" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
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

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-950/40 border-b border-red-900/50 text-red-400 text-xs font-mono shrink-0">
          ⚠️ {error}
        </div>
      )}

      {/* 2. Main Visualizer Grid (Matching JS Visualizer 9000 Layout) */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-theme-subtle overflow-y-auto ${isFullscreen ? 'flex-1 min-h-0' : ''}`}>
        
        {/* Left Area (5 cols): Code Editor + Console Log Terminal */}
        <div className="lg:col-span-5 flex flex-col divide-y divide-theme-subtle bg-neutral-950/50 min-h-0">
          
          {/* Code Editor Header */}
          <div className="px-3 py-1.5 bg-neutral-950 border-b border-theme-subtle flex items-center justify-between text-[11px] font-mono text-neutral-400 shrink-0">
            <span className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-[#f0db4f]" />
              JavaScript Code
            </span>
            <span className="text-[10px] text-neutral-500">Editable Editor</span>
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
              placeholder="// Write your JavaScript code here..."
            />
          </div>

          {/* Terminal Window (Console Output) */}
          <div className={`flex flex-col bg-[#121316] border-t border-theme-subtle ${isFullscreen ? 'h-[220px] shrink-0' : 'min-h-[200px]'}`}>
            {/* Terminal Window Header */}
            <div className="px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></span>
              </div>
              <span className="text-[11px] font-mono text-neutral-400 font-medium">Console Output</span>
              <span className="w-8"></span>
            </div>

            {/* Terminal Logs View */}
            <div
              ref={terminalLogsContainerRef}
              className="p-3 font-mono text-xs space-y-1.5 flex-1 max-h-[190px] overflow-y-auto text-neutral-200"
            >
              <div className="text-[11px] text-neutral-500 pb-1 border-b border-neutral-800">
                $ console.log stream:
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

        {/* Right Area (7 cols): JS Visualizer 9000 Grid (Task Queue, Microtask Queue, Call Stack, Event Loop) */}
        <div className="lg:col-span-7 flex flex-col divide-y divide-theme-subtle bg-neutral-950/30">
          
          {/* Top Panel: Task Queue (Macrotasks) */}
          <div className="p-3 flex flex-col min-h-[140px] bg-neutral-950/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Task Queue <span className="text-[10px] font-normal text-neutral-400">(Macrotasks: setTimeout, setInterval)</span>
              </span>
              <button
                onClick={() => setActiveInfoModal('taskqueue')}
                className="text-[10px] font-mono text-neutral-400 hover:text-[#1D9BF0] flex items-center gap-0.5 transition-colors"
              >
                <Info className="w-3 h-3" />
                ABOUT
              </button>
            </div>

            <div className="flex-1 flex flex-wrap items-center gap-2 overflow-x-auto p-1">
              {currentStep.taskQueue.length === 0 ? (
                <div className="w-full h-12 flex items-center justify-center text-[11px] font-mono text-neutral-600 border border-dashed border-neutral-800 rounded">
                  Empty Task Queue
                </div>
              ) : (
                currentStep.taskQueue.map((task) => (
                  <div
                    key={task.id}
                    className="p-2 bg-neutral-900 border border-amber-500/40 rounded text-xs font-mono text-amber-200 flex items-center gap-2 shadow-sm animate-fadeIn"
                  >
                    <span className="font-semibold">{task.name}</span>
                    {task.details && (
                      <span className="text-[9px] bg-amber-950/80 text-amber-400 px-1.5 py-0.5 rounded border border-amber-800/50">
                        {task.details}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Middle Panel: Microtask Queue */}
          <div className="p-3 flex flex-col min-h-[140px] bg-neutral-950/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Microtask Queue <span className="text-[10px] font-normal text-neutral-400">(Promise.then, queueMicrotask)</span>
              </span>
              <button
                onClick={() => setActiveInfoModal('microtask')}
                className="text-[10px] font-mono text-neutral-400 hover:text-[#1D9BF0] flex items-center gap-0.5 transition-colors"
              >
                <Info className="w-3 h-3" />
                ABOUT
              </button>
            </div>

            <div className="flex-1 flex flex-wrap items-center gap-2 overflow-x-auto p-1">
              {currentStep.microtaskQueue.length === 0 ? (
                <div className="w-full h-12 flex items-center justify-center text-[11px] font-mono text-neutral-600 border border-dashed border-neutral-800 rounded">
                  Empty Microtask Queue
                </div>
              ) : (
                currentStep.microtaskQueue.map((task) => (
                  <div
                    key={task.id}
                    className="p-2 bg-neutral-900 border border-purple-500/40 rounded text-xs font-mono text-purple-200 flex items-center gap-2 shadow-sm animate-fadeIn"
                  >
                    <span className="font-semibold">{task.name}</span>
                    <span className="text-[9px] bg-purple-950/80 text-purple-300 px-1.5 py-0.5 rounded border border-purple-800/50">
                      {task.details || 'Microtask'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom Split Row: Call Stack (Left) + Event Loop 4-Stage Wheel (Right) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-theme-subtle flex-1">
            
            {/* Call Stack Panel */}
            <div className="p-3 flex flex-col min-h-[220px]">
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
                  ABOUT
                </button>
              </div>

              <div className="flex-1 overflow-y-auto flex flex-col-reverse justify-start gap-1.5 pr-1">
                {currentStep.callStack.length === 0 ? (
                  <div className="h-full min-h-[140px] flex items-center justify-center text-[11px] font-mono text-neutral-600 border border-dashed border-neutral-800 rounded">
                    Stack Idle
                  </div>
                ) : (
                  currentStep.callStack.map((frame, idx) => (
                    <div
                      key={frame.id}
                      className={`p-2 rounded text-xs font-mono flex items-center justify-between border transition-all ${
                        idx === currentStep.callStack.length - 1
                          ? 'bg-[#1D9BF0]/15 border-[#1D9BF0] text-neutral-100 shadow-[0_0_12px_rgba(29,155,240,0.25)] font-bold'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      <span>{frame.name}</span>
                      {frame.location && (
                        <span className="text-[10px] text-neutral-400 font-normal">{frame.location}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Event Loop 4-Stage Stepper Panel */}
            <div className="p-3 flex flex-col min-h-[220px]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  Event Loop
                </span>
                <button
                  onClick={() => setActiveInfoModal('eventloop')}
                  className="text-[10px] font-mono text-neutral-400 hover:text-[#1D9BF0] flex items-center gap-0.5 transition-colors"
                >
                  <Info className="w-3 h-3" />
                  ABOUT
                </button>
              </div>

              {/* Connected 4-Step Vertical Timeline */}
              <div className="space-y-2 flex-1 flex flex-col justify-center">
                {EVENT_LOOP_STAGES.map((stage, sIdx) => {
                  const isActive = currentStep.phaseStepIndex === sIdx;
                  return (
                    <div
                      key={stage.number}
                      className={`flex items-center gap-2.5 p-2 rounded text-xs font-mono transition-all border ${
                        isActive
                          ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-300 font-semibold shadow-sm'
                          : 'bg-neutral-900/40 border-neutral-800/40 text-neutral-400'
                      }`}
                    >
                      {/* Step Number Circle */}
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                          isActive
                            ? 'border-emerald-400 bg-emerald-500 text-neutral-950 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                            : 'border-neutral-700 bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {stage.number}
                      </div>

                      <div className="flex-1 truncate flex items-center justify-between">
                        <span>{stage.title}</span>
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

          </div>
        </div>
      </div>

      {/* 3. Footer Bar - Standard C³ MindLoop Footer */}
      <div className="px-3.5 py-2 border-t border-theme-subtle bg-neutral-950 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] font-mono text-neutral-500">
          {t('tools.jsEventLoopVisualizer.privacyNote') || 'Local browser processing — No code or data sent to any server'}
        </span>
        <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
          100% Client-Side V8 Simulator
        </span>
      </div>

      {/* About Modal Dialogs */}
      {activeInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg max-w-md w-full p-5 space-y-3 font-mono text-xs text-neutral-300 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h3 className="font-bold text-neutral-100 text-sm">
                {activeInfoModal === 'taskqueue' && 'About Task Queue (Macrotasks)'}
                {activeInfoModal === 'microtask' && 'About Microtask Queue'}
                {activeInfoModal === 'callstack' && 'About Call Stack'}
                {activeInfoModal === 'eventloop' && 'About JavaScript Event Loop'}
              </h3>
              <button
                onClick={() => setActiveInfoModal(null)}
                className="text-neutral-400 hover:text-white px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-neutral-300 leading-relaxed">
              {activeInfoModal === 'taskqueue' && (
                <>
                  <p>
                    The <strong>Task Queue</strong> (also known as the <em>Macrotask Queue</em>) holds callbacks from Web APIs such as <code>setTimeout</code>, <code>setInterval</code>, and DOM event listeners.
                  </p>
                  <p>
                    The Event Loop takes only <strong>one task</strong> per tick before completely draining all microtasks!
                  </p>
                </>
              )}

              {activeInfoModal === 'microtask' && (
                <>
                  <p>
                    The <strong>Microtask Queue</strong> holds callbacks from <code>Promise.then()</code>, <code>queueMicrotask()</code>, and <code>await</code> expressions.
                  </p>
                  <p>
                    Microtasks have the <strong>highest asynchronous priority</strong>. The Event Loop drains all microtasks until empty before moving to the next task or rerendering!
                  </p>
                </>
              )}

              {activeInfoModal === 'callstack' && (
                <>
                  <p>
                    The <strong>Call Stack</strong> is a LIFO (Last In, First Out) stack that tracks function execution in JavaScript.
                  </p>
                  <p>
                    Because JavaScript is single-threaded, only the function at the top of the stack executes at any given moment.
                  </p>
                </>
              )}

              {activeInfoModal === 'eventloop' && (
                <>
                  <p>
                    The JavaScript Event Loop coordinates execution across 4 continuous stages:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li><strong>Evaluate Script:</strong> Run synchronous JavaScript.</li>
                    <li><strong>Run a Task:</strong> Pick oldest task from Task Queue.</li>
                    <li><strong>Run all Microtasks:</strong> Drain all pending microtasks.</li>
                    <li><strong>Rerender:</strong> Trigger layout, paint, and requestAnimationFrame.</li>
                  </ol>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveInfoModal(null)}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
