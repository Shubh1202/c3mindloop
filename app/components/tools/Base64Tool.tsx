'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Copy, Check, Trash2, Upload, ArrowLeftRight, Info, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';

type Mode = 'encode' | 'decode';

function encodeBase64(text: string, urlSafe: boolean): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  let b64 = btoa(binary);
  if (urlSafe) b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return b64;
}

function decodeBase64(b64: string): string {
  const normalized = b64.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

const SAMPLE_ENCODE = '{"user": "C3MindLoop", "role": "developer", "status": "active"}';
const SAMPLE_DECODE = 'eyJ1c2VyIjogIkMzTWluZExvb3AiLCAicm9sZSI6ICJkZXZlbG9wZXIiLCAic3RhdHVzIjogImFjdGl2ZSJ9';

export const Base64Tool: React.FC = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [fileInfo, setFileInfo] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && isFullScreen) setIsFullScreen(false); };
    const navbar = document.querySelector('header') as HTMLElement | null;
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
      if (navbar) navbar.style.display = 'none';
      window.addEventListener('keydown', handleKey);
    } else {
      document.body.style.overflow = '';
      if (navbar) navbar.style.display = '';
    }
    return () => {
      document.body.style.overflow = '';
      if (navbar) navbar.style.display = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [isFullScreen]);

  const process = useCallback(
    (value: string, currentMode: Mode, currentUrlSafe: boolean) => {
      setError(null);
      setFileInfo(null);
      if (!value.trim()) { setOutput(''); return; }
      try {
        if (currentMode === 'encode') {
          setOutput(encodeBase64(value, currentUrlSafe));
        } else {
          setOutput(decodeBase64(value.trim()));
        }
      } catch {
        setOutput('');
        setError(t('tools.base64Encoder.errorDecode'));
      }
    },
    [t]
  );

  const handleInput = (val: string) => {
    setInput(val);
    process(val, mode, urlSafe);
  };

  const handleModeSwitch = () => {
    const next: Mode = mode === 'encode' ? 'decode' : 'encode';
    const newInput = output;
    setMode(next);
    setInput(newInput);
    process(newInput, next, urlSafe);
  };

  const handleUrlSafe = (val: boolean) => {
    setUrlSafe(val);
    process(input, mode, val);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      setMode('encode');
      setInput('');
      setOutput(dataUri);
      setFileInfo(`${file.name} • ${(file.size / 1024).toFixed(1)} KB • ${file.type || 'unknown'}`);
      setError(null);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput(''); setOutput(''); setError(null); setFileInfo(null);
  };

  const handleSample = () => {
    const sample = mode === 'encode' ? SAMPLE_ENCODE : SAMPLE_DECODE;
    setInput(sample);
    process(sample, mode, urlSafe);
  };

  return (
    <div className={`bg-neutral-950 border border-neutral-800 font-sans text-neutral-100 flex flex-col ${isFullScreen ? 'fixed inset-0 z-[9999] overflow-hidden' : 'w-full rounded-lg shadow-2xl'}`}>

      {/* Toolbar */}
      <div className={`p-3 sm:p-4 border-b border-neutral-800 flex flex-wrap items-center gap-2 ${isFullScreen ? 'sticky top-0 z-[10000] bg-neutral-950' : ''}`}>
        {/* Mode toggle */}
        <div className="flex items-center rounded-md border border-neutral-700 overflow-hidden text-xs font-mono shrink-0">
          <button
            onClick={() => { setMode('encode'); process(input, 'encode', urlSafe); }}
            className={`px-3 py-1.5 transition-colors cursor-pointer ${mode === 'encode' ? 'bg-[#1D9BF0] text-white' : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'}`}
          >
            {t('tools.base64Encoder.modeEncode')}
          </button>
          <button
            onClick={() => { setMode('decode'); process(input, 'decode', urlSafe); }}
            className={`px-3 py-1.5 transition-colors cursor-pointer ${mode === 'decode' ? 'bg-[#1D9BF0] text-white' : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'}`}
          >
            {t('tools.base64Encoder.modeDecode')}
          </button>
        </div>

        {/* URL-Safe toggle */}
        <label className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 cursor-pointer select-none shrink-0">
          <input
            type="checkbox"
            checked={urlSafe}
            onChange={(e) => handleUrlSafe(e.target.checked)}
            className="accent-[#1D9BF0] cursor-pointer"
          />
          {t('tools.base64Encoder.urlSafe')}
        </label>

        <div className="flex-1" />

        {/* Swap */}
        <button
          onClick={handleModeSwitch}
          disabled={!output}
          title={t('tools.base64Encoder.swap')}
          className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors flex items-center gap-1.5 text-xs font-mono disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          {t('tools.base64Encoder.swap')}
        </button>

        {/* File upload */}
        <button
          onClick={() => fileRef.current?.click()}
          className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          {t('tools.base64Encoder.fileUpload')}
        </button>
        <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />

        {/* Copy */}
        <button
          onClick={handleCopy}
          disabled={!output}
          className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors flex items-center gap-1.5 text-xs font-mono disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? t('tools.base64Encoder.copied') : t('tools.base64Encoder.copy')}
        </button>

        {/* Sample Data */}
        <button
          onClick={handleSample}
          className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors text-xs font-mono cursor-pointer"
        >
          {t('tools.base64Encoder.sampleData')}
        </button>

        {/* Clear */}
        <button
          onClick={handleClear}
          className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-red-950 hover:text-red-300 text-neutral-400 transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {t('tools.base64Encoder.clear')}
        </button>

        {/* Fullscreen */}
        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
          className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
        >
          {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Panels */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800 ${isFullScreen ? 'flex-1 overflow-hidden' : ''}`}>

        {/* Input */}
        <div className={`flex flex-col p-3 sm:p-4 space-y-2 ${isFullScreen ? 'overflow-y-auto' : ''}`}>
          <span className="text-xs font-mono font-semibold text-neutral-300">
            {mode === 'encode' ? t('tools.base64Encoder.inputLabelEncode') : t('tools.base64Encoder.inputLabelDecode')}
          </span>
          <textarea
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder={mode === 'encode' ? t('tools.base64Encoder.placeholderEncode') : t('tools.base64Encoder.placeholderDecode')}
            spellCheck={false}
            className={`w-full p-3 font-mono text-xs bg-neutral-900/90 text-neutral-100 border border-neutral-800 rounded focus:border-[#1D9BF0] focus:outline-none resize-y leading-relaxed transition-colors placeholder-neutral-600 min-h-[250px] max-h-[800px] overflow-y-auto ${isFullScreen ? 'h-[calc(100vh-120px)] max-h-none resize-none' : ''}`}
          />
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-950/40 border border-red-900/80 rounded text-xs text-red-300 font-mono">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Output */}
        <div className={`flex flex-col p-3 sm:p-4 space-y-2 ${isFullScreen ? 'overflow-y-auto' : ''}`}>
          <span className="text-xs font-mono font-semibold text-neutral-300">
            {mode === 'encode' ? t('tools.base64Encoder.outputLabelEncode') : t('tools.base64Encoder.outputLabelDecode')}
          </span>
          {fileInfo && (
            <div className="text-[11px] font-mono text-neutral-500 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5">
              {t('tools.base64Encoder.fileLabel')}: {fileInfo}
            </div>
          )}
          <textarea
            value={output}
            readOnly
            placeholder={t('tools.base64Encoder.outputPlaceholder')}
            className={`w-full p-3 font-mono text-xs bg-neutral-900/50 text-emerald-300 border border-neutral-800 rounded resize-y leading-relaxed placeholder-neutral-700 focus:outline-none min-h-[250px] max-h-[800px] overflow-y-auto ${isFullScreen ? 'h-[calc(100vh-120px)] max-h-none resize-none' : ''}`}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-neutral-900/80 border-t border-neutral-800 flex items-center justify-end text-xs font-mono">
        <div className="text-neutral-400 text-[11px] flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-neutral-500" />
          <span>{t('tools.base64Encoder.privacyNote')}</span>
        </div>
      </div>
    </div>
  );
};
