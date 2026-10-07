'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  GitBranch as GitBranchIcon,
  GitCommit as GitCommitIcon,
  GitMerge,
  RotateCcw,
  Terminal,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Plus,
  Send,
  HelpCircle,
  Sparkles,
  Layers,
  Info
} from 'lucide-react';
import { useTranslation } from '../../lib/i18n';
import { GIT_PRESETS } from './gitVisualizer/presets';
import { GitSimulationEngine } from './gitVisualizer/engine';
import { GitGraphState } from './gitVisualizer/types';

export const GitVisualizerTool: React.FC = () => {
  const { t } = useTranslation();

  const [mounted, setMounted] = useState(false);
  const [engine] = useState(() => new GitSimulationEngine());
  const [selectedPreset, setSelectedPreset] = useState('feature-merge');
  const [gitState, setGitState] = useState<GitGraphState>(() => engine.getState());
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedCommitId, setSelectedCommitId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const graphContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Load preset on mount or selection
  const loadPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    engine.reset();
    const preset = GIT_PRESETS.find(p => p.id === presetId);
    if (preset) {
      for (const cmd of preset.initialCommands) {
        engine.execute(cmd);
      }
    }
    setGitState(engine.getState());
    setSelectedCommitId(null);
  };

  useEffect(() => {
    loadPreset('feature-merge');
  }, []);

  // Handle command submission
  const handleRunCommand = (e?: React.FormEvent, customCmd?: string) => {
    if (e) e.preventDefault();
    let cmd = (customCmd !== undefined ? customCmd : commandInput).trim();
    
    // If empty when clicking Run, create a commit so user gets instant visual graph action
    if (!cmd) {
      cmd = 'git commit -m "New commit"';
    }

    // Auto-prefix with 'git ' if user only typed sub-command (e.g. 'commit', 'checkout -b feat')
    if (!cmd.startsWith('git ') && !cmd.startsWith('git')) {
      cmd = `git ${cmd}`;
    }

    engine.execute(cmd);
    setGitState(engine.getState());
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    setCommandInput('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Keyboard navigation for terminal history (Up / Down arrows)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setCommandInput(commandHistory[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setCommandInput('');
      } else {
        setHistoryIndex(nextIndex);
        setCommandInput(commandHistory[nextIndex]);
      }
    }
  };

  // Quick Action Buttons
  const runQuickAction = (template: string, autoExecute: boolean = true) => {
    if (autoExecute) {
      handleRunCommand(undefined, template);
    } else {
      setCommandInput(template);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [gitState.logs]);

  // Lock body scroll and handle Escape key for fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isFullscreen]);

  const { nodes, links, bounds } = engine.calculateDAGLayout();
  const selectedCommit = selectedCommitId ? gitState.commits[selectedCommitId] : null;

  const content = (
    <div
      className={`transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-[99999] bg-neutral-950 flex flex-col h-screen w-screen overflow-hidden p-2 sm:p-4'
          : 'rounded-lg border border-theme-subtle bg-surface overflow-hidden shadow-2xl'
      }`}
    >
      {/* 1. Action Toolbar Row - Single Heading Policy Compliant (Starts directly with Toolbar) */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 border-b border-theme-subtle bg-neutral-950/90 backdrop-blur-md shrink-0">
        
        {/* Left Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Preset Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline">Scenario:</span>
            <select
              value={selectedPreset}
              onChange={e => loadPreset(e.target.value)}
              className="px-2.5 py-1 text-xs font-mono bg-neutral-900 border border-theme-subtle text-neutral-200 rounded focus:border-[#1D9BF0] focus:outline-none transition-colors"
            >
              {GIT_PRESETS.map(preset => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Actions Shortcuts */}
          <div className="hidden md:flex items-center gap-1 text-[11px] font-mono">
            <button
              onClick={() => runQuickAction('git commit -m "Update code"', true)}
              title="Execute a new commit on active branch"
              className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded border border-theme-subtle flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3 text-emerald-400" />
              commit
            </button>
            <button
              onClick={() => runQuickAction(`git checkout -b feat/v${Math.floor(10 + Math.random() * 90)}`, true)}
              title="Create and switch to a new branch"
              className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded border border-theme-subtle flex items-center gap-1 transition-colors"
            >
              <GitBranchIcon className="w-3 h-3 text-[#1D9BF0]" />
              branch
            </button>
            <button
              onClick={() => {
                const branchNames = Object.keys(gitState.branches);
                const current = gitState.head.type === 'branch' ? gitState.head.name : '';
                const target = branchNames.find(b => b !== current) || 'main';
                runQuickAction(`git merge ${target}`, true);
              }}
              title="Merge branches"
              className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded border border-theme-subtle flex items-center gap-1 transition-colors"
            >
              <GitMerge className="w-3 h-3 text-purple-400" />
              merge
            </button>
            <button
              onClick={() => runQuickAction('git rebase main', true)}
              title="Rebase active branch onto main"
              className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded border border-theme-subtle flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              rebase
            </button>
          </div>

          <button
            onClick={() => loadPreset(selectedPreset)}
            title="Reset to scenario"
            className="px-2.5 py-1 text-xs font-mono border border-theme-subtle text-neutral-400 hover:text-white rounded flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Right Toolbar Controls */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Active HEAD indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 border border-theme-subtle rounded text-[11px] font-mono">
            <span className="text-neutral-500">HEAD:</span>
            <span className="text-[#1D9BF0] font-bold">
              {gitState.head.type === 'branch' ? gitState.head.name : `@${gitState.head.name}`}
            </span>
          </div>

          <button
            onClick={() => setShowHelpModal(true)}
            title="Git Command Help"
            className="px-2 py-1 text-xs font-mono border border-theme-subtle text-neutral-400 hover:text-white rounded flex items-center gap-1 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Commands</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(prev => !prev)}
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Enter Fullscreen'}
            className="px-2.5 py-1 text-xs font-mono border border-theme-subtle text-neutral-400 rounded hover:text-white hover:border-neutral-600 flex items-center gap-1 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-[#1D9BF0]" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Visualizer Workspace */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-theme-subtle overflow-y-auto ${isFullscreen ? 'flex-1 min-h-0' : ''}`}>
        
        {/* Left / Top Section (7 cols): Interactive SVG DAG Graph */}
        <div className="lg:col-span-7 flex flex-col bg-neutral-950/60 min-h-[380px] lg:min-h-[480px]">
          
          {/* Graph Header */}
          <div className="px-3 py-1.5 bg-neutral-950 border-b border-theme-subtle flex items-center justify-between text-[11px] font-mono text-neutral-400 shrink-0">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#1D9BF0]" />
              Interactive Git Commit DAG Graph
            </span>
            <span className="text-[10px] text-neutral-500">
              {nodes.length} commits • {Object.keys(gitState.branches).length} branches
            </span>
          </div>

          {/* SVG Canvas Area */}
          <div
            ref={graphContainerRef}
            className="flex-1 overflow-auto p-4 bg-[#0a0c10] relative flex items-center justify-start min-h-[320px]"
          >
            {nodes.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs font-mono text-neutral-500 italic">
                Empty Git repository. Run &apos;git commit -m &quot;Initial commit&quot;&apos; to start.
              </div>
            ) : (
              <svg
                width={bounds.width}
                height={bounds.height}
                className="overflow-visible select-none"
              >
                <defs>
                  {/* Arrowhead marker */}
                  <marker
                    id="arrow"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#4b5563" />
                  </marker>
                </defs>

                {/* 1. Connecting Bezier Links */}
                {links.map((link) => {
                  const dx = link.to.x - link.from.x;
                  const dy = link.to.y - link.from.y;
                  const curve = Math.min(Math.abs(dx) * 0.5, 60);

                  const pathD =
                    dy === 0
                      ? `M ${link.from.x} ${link.from.y} L ${link.to.x} ${link.to.y}`
                      : `M ${link.from.x} ${link.from.y} C ${link.from.x + curve} ${link.from.y}, ${link.to.x - curve} ${link.to.y}, ${link.to.x} ${link.to.y}`;

                  return (
                    <path
                      key={link.id}
                      d={pathD}
                      fill="none"
                      stroke={link.color}
                      strokeWidth="2.5"
                      strokeOpacity="0.8"
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* 2. Commit Nodes */}
                {nodes.map((node) => {
                  const isSelected = selectedCommitId === node.id;
                  const nodeColor = node.color || '#1D9BF0';

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      className="cursor-pointer group"
                      onClick={() => setSelectedCommitId(node.id)}
                    >
                      {/* Outer Ring on HEAD / Selected */}
                      {node.isHead && (
                        <circle
                          r="18"
                          fill="none"
                          stroke={nodeColor}
                          strokeWidth="2"
                          strokeDasharray="3 3"
                          className="animate-spin-slow opacity-80"
                        />
                      )}

                      {isSelected && (
                        <circle
                          r="16"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                      )}

                      {/* Main Commit Circle */}
                      <circle
                        r="11"
                        fill={nodeColor}
                        stroke="#0a0c10"
                        strokeWidth="3"
                        className="transition-transform group-hover:scale-125"
                      />

                      {/* Short Hash Label */}
                      <text
                        y="-18"
                        textAnchor="middle"
                        className="text-[10px] font-mono fill-neutral-300 font-semibold select-none pointer-events-none"
                      >
                        {node.shortHash}
                      </text>

                      {/* Commit Message Snippet */}
                      <text
                        y="28"
                        textAnchor="middle"
                        className="text-[10px] font-mono fill-neutral-400 select-none pointer-events-none max-w-[120px] truncate"
                      >
                        {node.message.length > 18 ? `${node.message.slice(0, 16)}…` : node.message}
                      </text>

                      {/* Branch Tags Pill Overlay */}
                      {node.branchesHere.length > 0 && (
                        <g transform={`translate(0, -32)`}>
                          {node.branchesHere.map((bName, bIdx) => (
                            <g key={bName} transform={`translate(0, ${-bIdx * 18})`}>
                              <rect
                                x={-(bName.length * 4.2 + 8)}
                                y="-12"
                                width={bName.length * 8.4 + 16}
                                height="15"
                                rx="4"
                                fill={node.isHead && gitState.head.name === bName ? '#1D9BF0' : '#1e293b'}
                                stroke={node.isHead && gitState.head.name === bName ? '#60a5fa' : '#475569'}
                                strokeWidth="1"
                              />
                              <text
                                y="-1"
                                textAnchor="middle"
                                className={`text-[9px] font-mono font-bold select-none pointer-events-none ${
                                  node.isHead && gitState.head.name === bName ? 'fill-white' : 'fill-neutral-300'
                                }`}
                              >
                                {node.isHead && gitState.head.name === bName ? `HEAD -> ${bName}` : bName}
                              </text>
                            </g>
                          ))}
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            )}
          </div>

          {/* Commit Inspector Drawer if selected */}
          {selectedCommit && (
            <div className="p-3 bg-neutral-900 border-t border-theme-subtle text-xs font-mono flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-neutral-200">
                  <span className="text-emerald-400 font-bold">{selectedCommit.shortHash}</span>
                  <span>•</span>
                  <span className="font-semibold text-neutral-100">{selectedCommit.message}</span>
                </div>
                <div className="text-[10px] text-neutral-400 flex items-center gap-3">
                  <span>Branch: <span className="text-[#1D9BF0]">{selectedCommit.branch}</span></span>
                  <span>Parents: {selectedCommit.parents.join(', ') || 'root'}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCommitId(null)}
                className="text-[10px] text-neutral-400 hover:text-white px-2 py-0.5 rounded border border-neutral-700"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Right / Bottom Section (5 cols): Interactive Git Terminal */}
        <div className="lg:col-span-5 flex flex-col bg-[#121316] divide-y divide-theme-subtle min-h-[340px]">
          
          {/* Terminal Header */}
          <div className="px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></span>
            </div>
            <span className="text-[11px] font-mono text-neutral-400 font-medium flex items-center gap-1">
              <Terminal className="w-3 h-3 text-emerald-400" />
              Git Terminal Console
            </span>
            <span className="w-8"></span>
          </div>

          {/* Terminal Output Log Stream */}
          <div className="p-3 font-mono text-xs space-y-2 flex-1 max-h-[340px] overflow-y-auto text-neutral-200">
            <div className="text-[11px] text-neutral-500 pb-1 border-b border-neutral-800">
              C³ MindLoop Git Engine (v2.45.0-wasm) • Type &apos;git help&apos; for commands
            </div>

            {gitState.logs.length === 0 ? (
              <div className="text-neutral-500 italic text-[11px] pt-1">
                (No commands run yet)
              </div>
            ) : (
              gitState.logs.map((log) => (
                <div key={log.id} className="space-y-0.5">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="text-emerald-400">&gt;</span>
                    <span className="text-neutral-200 font-semibold">{log.command}</span>
                    <span className="text-[9px] text-neutral-600 ml-auto">{log.timestamp}</span>
                  </div>
                  {log.output && (
                    <pre
                      className={`text-[11px] pl-4 whitespace-pre-wrap ${
                        log.type === 'error'
                          ? 'text-red-400'
                          : log.type === 'info'
                          ? 'text-cyan-300'
                          : 'text-neutral-300'
                      }`}
                    >
                      {log.output}
                    </pre>
                  )}
                </div>
              ))
            )}
            <div ref={terminalEndRef} />
          </div>

          {/* Terminal Command Input Bar */}
          <form
            onSubmit={handleRunCommand}
            className="p-2 bg-neutral-900 flex items-center gap-2 shrink-0 border-t border-neutral-800"
          >
            <span className="text-emerald-400 font-mono text-xs pl-1">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={commandInput}
              onChange={e => setCommandInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. git commit -m 'new feature', git checkout -b feature"
              spellCheck={false}
              className="flex-1 bg-transparent text-neutral-100 font-mono text-xs outline-none placeholder:text-neutral-600"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-mono flex items-center gap-1 transition-colors"
            >
              <Send className="w-3 h-3" />
              <span>Run</span>
            </button>
          </form>
        </div>

      </div>

      {/* 3. Footer Bar - Standard C³ MindLoop Footer */}
      <div className="px-3.5 py-2 border-t border-theme-subtle bg-neutral-950 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] font-mono text-neutral-500">
          {t('tools.gitVisualizer.privacyNote') || 'Local browser processing — 100% Client-Side Git Simulation Engine'}
        </span>
        <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
          Zero Server Dependencies
        </span>
      </div>

      {/* Commands Reference Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-lg max-w-lg w-full p-5 space-y-4 font-mono text-xs text-neutral-300 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h3 className="font-bold text-neutral-100 text-sm flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Git Interactive Visualizer Commands
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-neutral-400 hover:text-white px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-neutral-300 leading-relaxed max-h-[320px] overflow-y-auto pr-1">
              <div className="p-2 bg-neutral-950 rounded border border-neutral-800">
                <code className="text-emerald-400 font-bold">git commit -m &quot;message&quot;</code>
                <p className="text-[11px] text-neutral-400 mt-0.5">Creates a new commit node on the active branch.</p>
              </div>

              <div className="p-2 bg-neutral-950 rounded border border-neutral-800">
                <code className="text-[#1D9BF0] font-bold">git branch &lt;branch-name&gt;</code>
                <p className="text-[11px] text-neutral-400 mt-0.5">Creates a new branch pointing to current HEAD.</p>
              </div>

              <div className="p-2 bg-neutral-950 rounded border border-neutral-800">
                <code className="text-purple-400 font-bold">git checkout &lt;branch&gt; | git checkout -b &lt;new-branch&gt;</code>
                <p className="text-[11px] text-neutral-400 mt-0.5">Switches the HEAD pointer or creates a new branch and checks it out.</p>
              </div>

              <div className="p-2 bg-neutral-950 rounded border border-neutral-800">
                <code className="text-amber-400 font-bold">git merge &lt;target-branch&gt; [-m &quot;message&quot;]</code>
                <p className="text-[11px] text-neutral-400 mt-0.5">Creates a 3-way merge commit joining two branch lineages.</p>
              </div>

              <div className="p-2 bg-neutral-950 rounded border border-neutral-800">
                <code className="text-pink-400 font-bold">git rebase &lt;upstream-branch&gt;</code>
                <p className="text-[11px] text-neutral-400 mt-0.5">Replays commits from the current branch on top of the upstream branch.</p>
              </div>

              <div className="p-2 bg-neutral-950 rounded border border-neutral-800">
                <code className="text-cyan-400 font-bold">git cherry-pick &lt;commit-hash&gt;</code>
                <p className="text-[11px] text-neutral-400 mt-0.5">Applies a specific commit from another branch onto current HEAD.</p>
              </div>

              <div className="p-2 bg-neutral-950 rounded border border-neutral-800">
                <code className="text-orange-400 font-bold">git reset [--hard|--soft] &lt;commit-hash&gt;</code>
                <p className="text-[11px] text-neutral-400 mt-0.5">Moves the current branch pointer back to an earlier commit.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition-colors"
              >
                Got it
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
