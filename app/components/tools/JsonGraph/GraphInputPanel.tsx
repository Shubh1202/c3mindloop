'use client';

import React, { useRef } from 'react';
import { FlaskConical, Upload } from 'lucide-react';
import { GRAPH_EXAMPLES } from './graphExamples';

interface GraphInputPanelProps {
  value: string;
  onChange: (value: string) => void;
  hasError: boolean;
  errorMessage: string;
}

export const GraphInputPanel: React.FC<GraphInputPanelProps> = ({
  value,
  onChange,
  hasError,
  errorMessage,
}) => {
  const [showExamples, setShowExamples] = React.useState(false);
  const [uploadError, setUploadError] = React.useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input so the same file can be re-selected
    e.target.value = '';

    // Only accept .json and plain text
    if (!file.name.endsWith('.json') && file.type !== 'application/json' && file.type !== 'text/plain') {
      setUploadError('Please upload a .json file');
      setTimeout(() => setUploadError(''), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        onChange(content);
        setUploadError('');
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read file');
      setTimeout(() => setUploadError(''), 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full">

      {/* ── Header bar ── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800 bg-neutral-900/50 shrink-0 gap-2">
        <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider shrink-0">
          JSON Input
        </span>

        <div className="flex items-center gap-1.5">
          {/* Upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 text-xs font-mono text-neutral-500 hover:text-[#1D9BF0] transition-colors cursor-pointer"
            aria-label="Upload JSON file"
            title="Upload .json file"
          >
            <Upload className="w-3 h-3" />
            <span>Upload</span>
          </button>

          <span className="text-neutral-700">|</span>

          {/* Examples button */}
          <button
            onClick={() => setShowExamples((s) => !s)}
            className="flex items-center gap-1 text-xs font-mono text-neutral-500 hover:text-[#1D9BF0] transition-colors cursor-pointer"
            aria-label="Load example data"
            title="Load example"
          >
            <FlaskConical className="w-3 h-3" />
            <span>Examples</span>
          </button>

          {value.trim() !== '' && (
            <>
              <span className="text-neutral-700">|</span>
              <button
                onClick={() => onChange('')}
                className="text-xs font-mono text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                aria-label="Clear input"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hidden file input — only .json and text accepted */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json,text/plain"
        onChange={handleFileUpload}
        className="hidden"
        aria-hidden="true"
      />

      {/* Upload error */}
      {uploadError && (
        <div className="shrink-0 px-3 py-1.5 border-b border-red-500/30 bg-red-950/20">
          <p className="text-xs font-mono text-red-400">{uploadError}</p>
        </div>
      )}

      {/* Example picker dropdown */}
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
                setShowExamples(false);
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
