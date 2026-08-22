'use client';

import React, { useState, useEffect } from 'react';
import {
  KeyRound, Shuffle, Copy, Check, Trash2,
  Maximize2, Minimize2, Info, ShieldCheck, RotateCcw,
} from 'lucide-react';

// ── Pure utility functions ────────────────────────────────────────────────────

/** Rejection-sampling based unbiased random index (0 to max-1) */
function cryptoRandomIndex(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  let val: number;
  do {
    crypto.getRandomValues(buf);
    val = buf[0];
  } while (val >= limit);
  return val % max;
}

function buildCharset(
  upper: boolean,
  lower: boolean,
  digits: boolean,
  symbols: boolean,
  excludeAmbiguous: boolean,
): string {
  let charset = '';
  if (upper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lower) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (digits) charset += '0123456789';
  if (symbols) charset += '$#@!^*';
  if (excludeAmbiguous) {
    charset = charset.split('').filter(c => !['0', 'O', 'l', '1', 'I'].includes(c)).join('');
  }
  return charset;
}

function generatePassword(
  upper: boolean,
  lower: boolean,
  digits: boolean,
  symbols: boolean,
  excludeAmbiguous: boolean,
  length: number,
): string {
  const charset = buildCharset(upper, lower, digits, symbols, excludeAmbiguous);
  if (charset.length === 0) return '';

  // Build per-category pools for guaranteed inclusion
  const pools: string[] = [];
  if (upper) {
    let p = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (excludeAmbiguous) p = p.split('').filter(c => !['O', 'I'].includes(c)).join('');
    if (p.length > 0) pools.push(p);
  }
  if (lower) {
    let p = 'abcdefghijklmnopqrstuvwxyz';
    if (excludeAmbiguous) p = p.split('').filter(c => c !== 'l').join('');
    if (p.length > 0) pools.push(p);
  }
  if (digits) {
    let p = '0123456789';
    if (excludeAmbiguous) p = p.split('').filter(c => !['0', '1'].includes(c)).join('');
    if (p.length > 0) pools.push(p);
  }
  if (symbols) {
    const p = '$#@!^*';
    if (p.length > 0) pools.push(p);
  }

  // Generate full-length password using rejection sampling
  const chars: string[] = Array.from({ length }, () => charset[cryptoRandomIndex(charset.length)]);

  // Guaranteed inclusion: replace random positions with one char from each required pool
  // Shuffle positions array using Fisher-Yates so guaranteed chars land at random spots
  const positions = Array.from({ length }, (_, i) => i);
  for (let i = positions.length - 1; i > 0; i--) {
    const j = cryptoRandomIndex(i + 1);
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }
  pools.forEach((pool, idx) => {
    chars[positions[idx]] = pool[cryptoRandomIndex(pool.length)];
  });

  return chars.join('');
}

function computeEntropy(charsetSize: number, length: number): number {
  if (charsetSize === 0) return 0;
  return Math.floor(length * Math.log2(charsetSize));
}

function strengthLabel(entropy: number): { label: string; colorClass: string } {
  if (entropy < 40) return { label: 'Weak', colorClass: 'text-red-400' };
  if (entropy < 60) return { label: 'Fair', colorClass: 'text-amber-400' };
  if (entropy < 80) return { label: 'Strong', colorClass: 'text-sky-400' };
  return { label: 'Very Strong', colorClass: 'text-emerald-400' };
}

function fisherYatesShuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = cryptoRandomIndex(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffleText(input: string): { result: string; error: string } {
  const lines = input.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) {
    return { result: '', error: 'Enter at least one item to shuffle' };
  }
  if (lines.length === 1) {
    const chars = lines[0].split('');
    const shuffled = fisherYatesShuffle(chars);
    return { result: shuffled.join(''), error: '' };
  }
  const shuffled = fisherYatesShuffle(lines);
  return { result: shuffled.join('\n'), error: '' };
}

// ── Component ─────────────────────────────────────────────────────────────────

export const PasswordShuffleGeneratorTool: React.FC = () => {
  // Mode
  const [mode, setMode] = useState<'password' | 'shuffle'>('password');
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Password state
  const [pwLength, setPwLength] = useState(16);
  const [pwUpper, setPwUpper] = useState(true);
  const [pwLower, setPwLower] = useState(true);
  const [pwDigits, setPwDigits] = useState(true);
  const [pwSymbols, setPwSymbols] = useState(true);
  const [pwExcludeAmbiguous, setPwExcludeAmbiguous] = useState(false);
  const [pwOutput, setPwOutput] = useState('');
  const [pwCopied, setPwCopied] = useState(false);
  const [pwCopyError, setPwCopyError] = useState('');

  // Shuffle state
  const [shuffleInput, setShuffleInput] = useState('');
  const [shuffleOutput, setShuffleOutput] = useState('');
  const [shuffleCopied, setShuffleCopied] = useState(false);
  const [shuffleCopyError, setShuffleCopyError] = useState('');
  const [shuffleError, setShuffleError] = useState('');

  // Crypto availability
  const [cryptoError, setCryptoError] = useState(false);

  // ── On mount: check crypto availability ──────────────────────────────────────
  useEffect(() => {
    if (typeof crypto === 'undefined' || typeof crypto.getRandomValues !== 'function') {
      setCryptoError(true);
    }
  }, []);

  // ── Fullscreen effect (identical to HashGeneratorTool) ───────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) setIsFullScreen(false);
    };
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

  // ── Auto-generate password whenever any config option changes ───────────────
  useEffect(() => {
    if (cryptoError) return;
    if (!pwUpper && !pwLower && !pwDigits && !pwSymbols) return; // nothing selected
    const pw = generatePassword(pwUpper, pwLower, pwDigits, pwSymbols, pwExcludeAmbiguous, pwLength);
    setPwOutput(pw);
  }, [pwLength, pwUpper, pwLower, pwDigits, pwSymbols, pwExcludeAmbiguous, cryptoError]);
  const noTypesSelected = !pwUpper && !pwLower && !pwDigits && !pwSymbols;
  const charsetSize = buildCharset(pwUpper, pwLower, pwDigits, pwSymbols, pwExcludeAmbiguous).length;
  const entropy = computeEntropy(charsetSize, pwLength);
  const strength = strengthLabel(entropy);

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleRegenerate = () => {
    if (noTypesSelected || cryptoError) return;
    const pw = generatePassword(pwUpper, pwLower, pwDigits, pwSymbols, pwExcludeAmbiguous, pwLength);
    setPwOutput(pw);
  };

  const handleLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseInt(e.target.value, 10);
    if (isNaN(raw)) return;
    const clamped = Math.min(128, Math.max(8, raw));
    setPwLength(clamped);
  };

  const handleShuffle = () => {
    if (cryptoError) return;
    const { result, error } = shuffleText(shuffleInput);
    setShuffleOutput(result);
    setShuffleError(error);
  };

  const handleShuffleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setShuffleInput(e.target.value);
    if (shuffleOutput) {
      setShuffleOutput('');
      setShuffleError('');
    }
  };

  const handleCopy = async (
    text: string,
    setCopied: (v: boolean) => void,
    setCopyError: (v: string) => void,
  ) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError('Copy failed — select text manually');
      setTimeout(() => setCopyError(''), 3000);
    }
  };

  const handleLoadSample = () => {
    if (mode === 'password') {
      setPwLength(16);
      setPwUpper(true);
      setPwLower(true);
      setPwDigits(true);
      setPwSymbols(true);
      setPwExcludeAmbiguous(false);
      if (!cryptoError) {
        const pw = generatePassword(true, true, true, true, false, 16);
        setPwOutput(pw);
      }
    } else {
      const sample = 'alpha\nbeta\ngamma\ndelta\nepsilon';
      setShuffleInput(sample);
      if (!cryptoError) {
        const { result, error } = shuffleText(sample);
        setShuffleOutput(result);
        setShuffleError(error);
      }
    }
  };

  const handleClear = () => {
    setPwOutput('');
    setPwCopyError('');
    setShuffleInput('');
    setShuffleOutput('');
    setShuffleError('');
    setShuffleCopyError('');
  };

  // ── Toggle button classes ─────────────────────────────────────────────────────
  const charToggleClass = (active: boolean) =>
    `px-2 py-1 rounded border text-[11px] font-sans transition-colors cursor-pointer ${
      active
        ? 'bg-[#1D9BF0]/20 border-[#1D9BF0]/50 text-[#1D9BF0]'
        : 'bg-neutral-800/60 border-neutral-700 text-neutral-400 hover:text-neutral-200'
    }`;

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div
      className={`developer-tool-container bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-100 flex flex-col ${
        isFullScreen ? 'fixed inset-0 z-[9999] overflow-hidden' : 'w-full rounded-lg shadow-2xl'
      }`}
    >
      {/* Crypto error banner */}
      {cryptoError && (
        <div className="px-4 py-3 bg-red-950/60 border-b border-red-900/50 text-red-300 text-xs font-mono">
          Cryptographic API not available in this browser
        </div>
      )}

      {/* Toolbar */}
      <div className="px-3 py-2.5 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2">
        {/* Left group */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode toggle */}
          <div className="flex items-center bg-neutral-950 p-1 rounded border border-neutral-800 text-[11px] font-sans">
            <button
              onClick={() => setMode('password')}
              className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'password'
                  ? 'bg-[#1D9BF0] text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3 h-3" />
              <span>Password</span>
            </button>
            <button
              onClick={() => setMode('shuffle')}
              className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'shuffle'
                  ? 'bg-[#1D9BF0] text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Shuffle className="w-3 h-3" />
              <span>Shuffle</span>
            </button>
          </div>

          {/* Load Sample */}
          <button
            onClick={handleLoadSample}
            className="px-2.5 py-1.5 rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-[11px] font-sans flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Load Sample</span>
          </button>

          {/* Clear */}
          <button
            onClick={handleClear}
            className="px-2.5 py-1.5 rounded bg-neutral-800/80 hover:bg-red-950 hover:text-red-300 text-neutral-400 text-[11px] font-sans flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

        {/* Right group: fullscreen */}
        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
          className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
        >
          {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Scrollable content area */}
      <div className={`flex-1 flex flex-col ${isFullScreen ? 'overflow-y-auto' : ''}`}>

        {/* ── Password Panel ── */}
        {mode === 'password' && (
          <div className="p-4 space-y-4">

            {/* Length slider row */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-neutral-400 text-[11px] font-sans">Length</span>
                <input
                  type="number"
                  min={8}
                  max={128}
                  value={pwLength}
                  onChange={handleLengthChange}
                  className="w-14 px-1.5 py-0.5 bg-neutral-900/90 border border-neutral-800 rounded text-neutral-100 text-xs font-mono focus:border-[#1D9BF0] focus:outline-none text-center"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-neutral-600">8</span>
                <input
                  type="range"
                  min={8}
                  max={128}
                  step={1}
                  value={pwLength}
                  onChange={handleLengthChange}
                  className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer bg-neutral-800 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1D9BF0] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-neutral-950 [&::-webkit-slider-runnable-track]:rounded-full"
                  style={{
                    background: `linear-gradient(to right, #1D9BF0 ${((pwLength - 8) / (128 - 8)) * 100}%, #262626 ${((pwLength - 8) / (128 - 8)) * 100}%)`,
                  }}
                />
                <span className="text-[10px] font-mono text-neutral-600">128</span>
              </div>
            </div>

            {/* Char type toggles row */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setPwUpper(v => !v)}
                className={charToggleClass(pwUpper)}
                title="Uppercase A–Z"
              >
                A–Z
              </button>
              <button
                onClick={() => setPwLower(v => !v)}
                className={charToggleClass(pwLower)}
                title="Lowercase a–z"
              >
                a–z
              </button>
              <button
                onClick={() => setPwDigits(v => !v)}
                className={charToggleClass(pwDigits)}
                title="Digits 0–9"
              >
                0–9
              </button>
              <button
                onClick={() => setPwSymbols(v => !v)}
                className={charToggleClass(pwSymbols)}
                title="Symbols"
              >
                !@#
              </button>

              {/* Exclude Ambiguous */}
              <button
                onClick={() => setPwExcludeAmbiguous(v => !v)}
                className={charToggleClass(pwExcludeAmbiguous)}
                title="Exclude ambiguous characters (0, O, l, 1, I)"
              >
                No Ambig
              </button>
            </div>

            {/* Entropy row */}
            {!noTypesSelected && (
              <div className="flex items-center gap-1.5 text-[11px] font-sans text-neutral-400">
                <span>Entropy:</span>
                <span className="text-neutral-200 font-mono">{entropy} bits</span>
                <span className="text-neutral-600">·</span>
                <span className={strength.colorClass}>{strength.label}</span>
              </div>
            )}

            {/* No types selected warning */}
            {noTypesSelected && (
              <p className="text-xs text-amber-400 font-mono">Select at least one character type</p>
            )}

            {/* Password output */}
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={pwOutput}
                placeholder="Click Regenerate to generate a password…"
                className="flex-1 px-3 py-2 bg-neutral-900/90 border border-neutral-800 rounded font-mono text-xs text-sky-300 focus:border-[#1D9BF0] focus:outline-none placeholder:text-neutral-600"
              />
            </div>

            {/* Copy error */}
            {pwCopyError && (
              <p className="text-xs text-amber-400 font-mono">{pwCopyError}</p>
            )}

            {/* Action buttons row: Regenerate + Copy */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleRegenerate}
                disabled={noTypesSelected || cryptoError}
                className="px-4 py-2 rounded bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white text-[11px] font-sans font-semibold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>
              <button
                onClick={() => handleCopy(pwOutput, setPwCopied, setPwCopyError)}
                disabled={!pwOutput}
                title="Copy password"
                className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-sans font-semibold flex items-center gap-1.5 disabled:opacity-40 transition-colors cursor-pointer"
              >
                {pwCopied ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{pwCopied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Shuffle Panel ── */}
        {mode === 'shuffle' && (
          <div className="p-4 space-y-3">

            {/* Input textarea */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-neutral-400 font-sans">
                Input — one item per line (or paste a single string to shuffle characters)
              </label>
              <textarea
                value={shuffleInput}
                onChange={handleShuffleInputChange}
                placeholder="alpha&#10;beta&#10;gamma&#10;delta&#10;epsilon"
                spellCheck={false}
                className="min-h-[160px] w-full p-3 bg-neutral-900/90 border border-neutral-800 rounded font-mono text-xs text-neutral-100 focus:border-[#1D9BF0] focus:outline-none resize-y transition-colors"
              />
            </div>

            {/* Shuffle button */}
            <button
              onClick={handleShuffle}
              disabled={cryptoError}
              className="px-4 py-2 rounded bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white text-[11px] font-sans font-semibold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Shuffle</span>
            </button>

            {/* Shuffle error */}
            {shuffleError && (
              <p className="text-xs text-amber-400 font-mono">{shuffleError}</p>
            )}

            {/* Output */}
            {shuffleOutput && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-neutral-400 font-sans">Output</label>
                  <button
                    onClick={() => handleCopy(shuffleOutput, setShuffleCopied, setShuffleCopyError)}
                    disabled={!shuffleOutput}
                    className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-sans flex items-center gap-1.5 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    {shuffleCopied
                      ? <Check className="w-3.5 h-3.5 text-sky-400" />
                      : <Copy className="w-3.5 h-3.5" />}
                    <span>{shuffleCopied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  value={shuffleOutput}
                  className="min-h-[160px] w-full p-3 bg-neutral-900/90 border border-neutral-800 rounded font-mono text-xs text-emerald-300 focus:border-[#1D9BF0] focus:outline-none resize-y"
                />
                {shuffleCopyError && (
                  <p className="text-xs text-amber-400 font-mono">{shuffleCopyError}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-neutral-900/80 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-neutral-400">
          <Info className="w-3.5 h-3.5 text-neutral-500" />
          <span>Client-Side · No data sent to any server</span>
        </div>
        <div className="flex items-center gap-1.5 text-neutral-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
          <span>crypto.getRandomValues</span>
        </div>
      </div>
    </div>
  );
};
