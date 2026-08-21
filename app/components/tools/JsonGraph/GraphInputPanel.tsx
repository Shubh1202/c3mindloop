'use client';

import React from 'react';
import { GRAPH_EXAMPLES } from './graphExamples';

interface GraphInputPanelProps {
  value: string;
  onChange: (value: string) => void;
  hasError: boolean;
  errorMessage: string;
  /** Whether the example picker dropdown is currently open (controlled by toolbar) */
  showExamples: boolean;
  /** Called when user selects an example -  lets parent close the dropdown */
  onExampleSelect: () => void;
}

export const GraphInputPanel: React.FC<GraphInputPanelProps> = ({
  value,
  onChange,
  hasError,
  errorMessage,
  showExamples,
  onExampleSelect,
}) => {
  return (
    <div className="flex flex-col h-full">

      {/* ── Header bar -  label only, actions live in main toolbar ── */}
      <div className="flex items-center px-3 py-2 border-b border-neutral-800 bg-neutral-900/50 shrink-0">
        <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
          JSON Input
        </span>
      </div>

      {/* Example picker dropdown -  toggled from toolbar Examples button */}
      {showExamples && (
        <div className="shrink-0 border-b border-neutral-800 bg-neutral-900/80 px-3 py-2 space-y-1">
          <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1.5">
            Load Example
          </p>
          {GRAPH_EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => {
                onChange(ex.value);
                onExampleSelect();
              }}
              className="w-full text-left px-2.5 py-1.5 rounded text-xs font-mono text-neutral-300 bg-neutral-800/60 hover:bg-[#1D9BF0]/10 hover:text-[#1D9BF0] border border-neutral-700/50 hover:border-[#1D9BF0]/30 transition-all cursor-pointer"
            >
              {ex.label}
            </button>
          ))}
        </div>
      )}

      {/* Textarea */}
      <div className="relative flex-1 min-h-0">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Paste JSON here…\n\nOr click Upload to load\na .json file from disk.\n\nOr click Examples for\npre-built samples.`}
          spellCheck={false}
          aria-label="JSON input"
          className={`w-full h-full resize-none bg-transparent font-mono text-xs text-neutral-100 placeholder-neutral-600 p-3 outline-none focus:outline-none transition-colors ${
            hasError && value.trim() !== ''
              ? 'border-2 border-red-500/70'
              : 'border-0'
          }`}
          style={{ lineHeight: 1.6 }}
        />
      </div>

      {/* JSON parse error */}
      {hasError && value.trim() !== '' && (
        <div className="shrink-0 px-3 py-2 border-t border-red-500/30 bg-red-950/20">
          <p className="text-xs font-mono text-red-400 break-all">{errorMessage}</p>
        </div>
      )}
    </div>
  );
};
