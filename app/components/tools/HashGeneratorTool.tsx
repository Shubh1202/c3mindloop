'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { trackEvent, GA_EVENTS } from '../../lib/analytics';
import {
  Copy, Check, Trash2, Upload, Download, Info,
  ShieldCheck, Maximize2, Minimize2, FileText, RotateCcw, KeyRound,
} from 'lucide-react';

// â”€â”€ Tiny pure-JS MD5 (no external dep needed) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function md5(input: string): string {
  function safeAdd(x: number, y: number) { const lsw = (x & 0xffff) + (y & 0xffff); return ((x >> 16) + (y >> 16) + (lsw >> 16)) << 16 | lsw & 0xffff; }
  function bitRotateLeft(num: number, cnt: number) { return num << cnt | num >>> 32 - cnt; }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b); }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(b & c | ~b & d, a, b, x, s, t); }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(b & d | c & ~d, a, b, x, s, t); }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(b ^ c ^ d, a, b, x, s, t); }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(c ^ (b | ~d), a, b, x, s, t); }
  function md5blk(s: string) {
    const md5blks: number[] = [];
    for (let i = 0; i < 64; i += 4) md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
    return md5blks;
  }
  const str = unescape(encodeURIComponent(input));
  const length = str.length;
  const s: number[] = [];
  for (let i = 0; i < length; i++) s[i] = str.charCodeAt(i);
  s[length] = 0x80;
  for (let i = length + 1; i < (((length + 8) >> 6) + 1) * 64 - 4; i++) s[i] = 0;
  s[(((length + 8) >> 6) + 1) * 64 - 8] = length * 8 & 0xff;
  s[(((length + 8) >> 6) + 1) * 64 - 7] = (length * 8 >>> 8) & 0xff;
  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  for (let i = 0; i < s.length; i += 16) {
    const [aa, bb, cc, dd] = [a, b, c, d];
    const m = s.slice(i, i + 16) as any;
    a = md5ff(a, b, c, d, m[0], 7, -680876936); d = md5ff(d, a, b, c, m[1], 12, -389564586); c = md5ff(c, d, a, b, m[2], 17, 606105819); b = md5ff(b, c, d, a, m[3], 22, -1044525330);
    a = md5ff(a, b, c, d, m[4], 7, -176418897); d = md5ff(d, a, b, c, m[5], 12, 1200080426); c = md5ff(c, d, a, b, m[6], 17, -1473231341); b = md5ff(b, c, d, a, m[7], 22, -45705983);
    a = md5ff(a, b, c, d, m[8], 7, 1770035416); d = md5ff(d, a, b, c, m[9], 12, -1958414417); c = md5ff(c, d, a, b, m[10], 17, -42063); b = md5ff(b, c, d, a, m[11], 22, -1990404162);
    a = md5ff(a, b, c, d, m[12], 7, 1804603682); d = md5ff(d, a, b, c, m[13], 12, -40341101); c = md5ff(c, d, a, b, m[14], 17, -1502002290); b = md5ff(b, c, d, a, m[15], 22, 1236535329);
    a = md5gg(a, b, c, d, m[1], 5, -165796510); d = md5gg(d, a, b, c, m[6], 9, -1069501632); c = md5gg(c, d, a, b, m[11], 14, 643717713); b = md5gg(b, c, d, a, m[0], 20, -373897302);
    a = md5gg(a, b, c, d, m[5], 5, -701558691); d = md5gg(d, a, b, c, m[10], 9, 38016083); c = md5gg(c, d, a, b, m[15], 14, -660478335); b = md5gg(b, c, d, a, m[4], 20, -405537848);
    a = md5gg(a, b, c, d, m[9], 5, 568446438); d = md5gg(d, a, b, c, m[14], 9, -1019803690); c = md5gg(c, d, a, b, m[3], 14, -187363961); b = md5gg(b, c, d, a, m[8], 20, 1163531501);
    a = md5gg(a, b, c, d, m[13], 5, -1444681467); d = md5gg(d, a, b, c, m[2], 9, -51403784); c = md5gg(c, d, a, b, m[7], 14, 1735328473); b = md5gg(b, c, d, a, m[12], 20, -1926607734);
    a = md5hh(a, b, c, d, m[5], 4, -378558); d = md5hh(d, a, b, c, m[8], 11, -2022574463); c = md5hh(c, d, a, b, m[11], 16, 1839030562); b = md5hh(b, c, d, a, m[14], 23, -35309556);
    a = md5hh(a, b, c, d, m[1], 4, -1530992060); d = md5hh(d, a, b, c, m[4], 11, 1272893353); c = md5hh(c, d, a, b, m[7], 16, -155497632); b = md5hh(b, c, d, a, m[10], 23, -1094730640);
    a = md5hh(a, b, c, d, m[13], 4, 681279174); d = md5hh(d, a, b, c, m[0], 11, -358537222); c = md5hh(c, d, a, b, m[3], 16, -722521979); b = md5hh(b, c, d, a, m[6], 23, 76029189);
    a = md5hh(a, b, c, d, m[9], 4, -640364487); d = md5hh(d, a, b, c, m[12], 11, -421815835); c = md5hh(c, d, a, b, m[15], 16, 530742520); b = md5hh(b, c, d, a, m[2], 23, -995338651);
    a = md5ii(a, b, c, d, m[0], 6, -198630844); d = md5ii(d, a, b, c, m[7], 10, 1126891415); c = md5ii(c, d, a, b, m[14], 15, -1416354905); b = md5ii(b, c, d, a, m[5], 21, -57434055);
    a = md5ii(a, b, c, d, m[12], 6, 1700485571); d = md5ii(d, a, b, c, m[3], 10, -1894986606); c = md5ii(c, d, a, b, m[10], 15, -1051523); b = md5ii(b, c, d, a, m[1], 21, -2054922799);
    a = md5ii(a, b, c, d, m[8], 6, 1873313359); d = md5ii(d, a, b, c, m[15], 10, -30611744); c = md5ii(c, d, a, b, m[6], 15, -1560198380); b = md5ii(b, c, d, a, m[13], 21, 1309151649);
    a = md5ii(a, b, c, d, m[4], 6, -145523070); d = md5ii(d, a, b, c, m[11], 10, -1120210379); c = md5ii(c, d, a, b, m[2], 15, 718787259); b = md5ii(b, c, d, a, m[9], 21, -343485551);
    a = safeAdd(a, aa); b = safeAdd(b, bb); c = safeAdd(c, cc); d = safeAdd(d, dd);
  }
  const x = [a, b, c, d];
  const hex: string[] = [];
  for (let i = 0; i < 32; i++) {
    hex.push((x[i >> 3] >>> (i % 8 * 4) & 0xf).toString(16));
  }
  return hex.join('');
}

// â”€â”€ WebCrypto helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function sha(algorithm: string, data: BufferSource): Promise<string> {
  const hashBuf = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function computeHashes(text: string): Promise<Record<string, string>> {
  const encoder = new TextEncoder();
  const buf = encoder.encode(text);
  const [sha1, sha256, sha512] = await Promise.all([
    sha('SHA-1', buf),
    sha('SHA-256', buf),
    sha('SHA-512', buf),
  ]);
  return { md5: md5(text), sha1, sha256, sha512 };
}

async function computeFileHashes(file: File): Promise<Record<string, string>> {
  const buf = await file.arrayBuffer();
  const textDecoder = new TextDecoder('utf-8', { fatal: false });
  const text = textDecoder.decode(buf);
  const [sha1, sha256, sha512] = await Promise.all([
    sha('SHA-1', buf),
    sha('SHA-256', buf),
    sha('SHA-512', buf),
  ]);
  return { md5: md5(text), sha1, sha256, sha512 };
}

// â”€â”€ HMAC helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function generateHMAC(key: string, message: string, algo: 'SHA-256' | 'SHA-512'): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: algo },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const ALGO_LABELS: Record<string, string> = {
  md5: 'MD5',
  sha1: 'SHA-1',
  sha256: 'SHA-256',
  sha512: 'SHA-512',
};

const SAMPLE_TEXT = 'CÂ³ MindLoop - Coding. Crashing. Crying.\nhello@c3mindloop.com | https://www.c3mindloop.com';

type InputMode = 'text' | 'file';

export const HashGeneratorTool: React.FC = () => {
  const [mode, setMode] = useState<InputMode>('text');
  const [text, setText] = useState(SAMPLE_TEXT);
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [isComputing, setIsComputing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [compareValue, setCompareValue] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // HMAC states
  const [hmacKey, setHmacKey] = useState('');
  const [hmacSig256, setHmacSig256] = useState('');
  const [hmacSig512, setHmacSig512] = useState('');
  const [isComputingHmac, setIsComputingHmac] = useState(false);
  const [showHmac, setShowHmac] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hmacDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fullscreen
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && isFullScreen) setIsFullScreen(false); };
    const navbar = document.querySelector('header') as HTMLElement | null;
    if (isFullScreen) { document.body.style.overflow = 'hidden'; if (navbar) navbar.style.display = 'none'; window.addEventListener('keydown', handleKey); }
    else { document.body.style.overflow = ''; if (navbar) navbar.style.display = ''; }
    return () => { document.body.style.overflow = ''; if (navbar) navbar.style.display = ''; window.removeEventListener('keydown', handleKey); };
  }, [isFullScreen]);

  // Debounced text hashing
  useEffect(() => {
    if (mode !== 'text') return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) { setHashes({}); return; }
    debounceRef.current = setTimeout(async () => {
      setIsComputing(true);
      const result = await computeHashes(text);
      setHashes(result);
      setIsComputing(false);
      trackEvent(GA_EVENTS.TOOL_USED, { tool_name: 'hash_generator', mode: 'text' });
    }, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [text, mode]);

  // HMAC: recompute when key or text changes
  useEffect(() => {
    if (!hmacKey.trim() || !text.trim()) {
      setHmacSig256('');
      setHmacSig512('');
      return;
    }
    if (hmacDebounceRef.current) clearTimeout(hmacDebounceRef.current);
    hmacDebounceRef.current = setTimeout(async () => {
      setIsComputingHmac(true);
      try {
        const [sig256, sig512] = await Promise.all([
          generateHMAC(hmacKey, text, 'SHA-256'),
          generateHMAC(hmacKey, text, 'SHA-512'),
        ]);
        setHmacSig256(sig256);
        setHmacSig512(sig512);
      } catch {
        setHmacSig256('Error: invalid key or message');
        setHmacSig512('Error: invalid key or message');
      }
      setIsComputingHmac(false);
    }, 300);
    return () => { if (hmacDebounceRef.current) clearTimeout(hmacDebounceRef.current); };
  }, [hmacKey, text]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFileSize(file.size);
    setIsComputing(true);
    const result = await computeFileHashes(file);
    setHashes(result);
    setIsComputing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleCopy = (key: string) => {
    if (!hashes[key]) return;
    navigator.clipboard.writeText(hashes[key]);
    trackEvent(GA_EVENTS.COPY_OUTPUT, { tool_name: 'hash_generator', algorithm: key });
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleCopyHmac = (which: '256' | '512') => {
    const val = which === '256' ? hmacSig256 : hmacSig512;
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopiedKey(`hmac${which}`);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleCopyAll = () => {
    const stdHashes = Object.entries(ALGO_LABELS)
      .filter(([k]) => hashes[k])
      .map(([k, label]) => `${label}: ${hashes[k]}`)
      .join('\n');
    const hmacPart = hmacKey && hmacSig256
      ? `\nHMAC-SHA-256: ${hmacSig256}\nHMAC-SHA-512: ${hmacSig512}`
      : '';
    navigator.clipboard.writeText(stdHashes + hmacPart);
    setCopiedKey('all');
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleDownload = () => {
    const stdHashes = Object.entries(ALGO_LABELS)
      .filter(([k]) => hashes[k])
      .map(([k, label]) => `${label}: ${hashes[k]}`)
      .join('\n');
    const hmacPart = hmacKey && hmacSig256
      ? `\nHMAC-SHA-256: ${hmacSig256}\nHMAC-SHA-512: ${hmacSig512}`
      : '';
    const all = stdHashes + hmacPart;
    if (!all) return;
    const blob = new Blob([all], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hashes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setText('');
    setHashes({});
    setFileName('');
    setFileSize(0);
    setCompareValue('');
    setHmacKey('');
    setHmacSig256('');
    setHmacSig512('');
  };

  const compareMatch = compareValue.trim()
    ? Object.values(hashes).some((h) => h.toLowerCase() === compareValue.trim().toLowerCase()) ||
      (hmacSig256 && hmacSig256.toLowerCase() === compareValue.trim().toLowerCase()) ||
      (hmacSig512 && hmacSig512.toLowerCase() === compareValue.trim().toLowerCase())
    : null;

  return (
    <div className={`developer-tool-container bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-100 flex flex-col ${isFullScreen ? 'fixed inset-0 z-[9999] overflow-hidden' : 'w-full rounded-lg shadow-2xl'}`}>

      {/* Toolbar */}
      <div className={`px-3 py-2.5 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2 ${isFullScreen ? 'sticky top-0 z-[10000]' : ''}`}>
        {/* Left: Mode + Sample + Clear */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-neutral-950 p-1 rounded border border-neutral-800 text-[11px] font-sans">
            <button
              onClick={() => { setMode('text'); setFileName(''); setHashes({}); }}
              className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${mode === 'text' ? 'bg-[#1D9BF0] text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
            >
              <FileText className="w-3 h-3" />
              <span>Text</span>
            </button>
            <button
              onClick={() => { setMode('file'); setText(''); setHashes({}); }}
              className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${mode === 'file' ? 'bg-[#1D9BF0] text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
            >
              <Upload className="w-3 h-3" />
              <span>File</span>
            </button>
          </div>

          {mode === 'text' && (
            <button
              onClick={() => setText(SAMPLE_TEXT)}
              className="px-2.5 py-1.5 rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-[11px] font-sans flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Load Sample</span>
            </button>
          )}

          {mode === 'file' && (
            <>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white text-[11px] font-sans font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>
            </>
          )}

          {/* HMAC toggle */}
          <button
            onClick={() => setShowHmac(!showHmac)}
            className={`px-2.5 py-1.5 rounded border text-[11px] font-sans flex items-center gap-1 transition-colors cursor-pointer ${showHmac ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-neutral-800/80 border-neutral-700 text-neutral-400 hover:text-white'}`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>HMAC</span>
          </button>

          <button
            onClick={handleClear}
            className="px-2.5 py-1.5 rounded bg-neutral-800/80 hover:bg-red-950 hover:text-red-300 text-neutral-400 text-[11px] font-sans flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

        {/* Right: Copy All + Download + Fullscreen */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAll}
            disabled={Object.keys(hashes).length === 0}
            className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-sans font-medium flex items-center gap-1.5 disabled:opacity-40 transition-colors cursor-pointer"
          >
            {copiedKey === 'all' ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'all' ? 'Copied!' : 'Copy All'}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={Object.keys(hashes).length === 0}
            className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-sans flex items-center gap-1 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* HMAC Key Input Panel */}
      {showHmac && (
        <div className="px-4 py-3 bg-amber-950/20 border-b border-amber-900/40 space-y-1.5">
          <label className="text-[11px] font-sans font-semibold text-amber-400 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" />
            HMAC Secret Key
            {isComputingHmac && <span className="text-amber-300/60 animate-pulse ml-2">Computing...</span>}
          </label>
          <input
            type="text"
            value={hmacKey}
            onChange={(e) => setHmacKey(e.target.value)}
            placeholder="Enter your HMAC secret key to compute HMAC-SHA-256 and HMAC-SHA-512..."
            className="w-full p-2.5 bg-neutral-900 border border-amber-900/50 rounded text-neutral-200 text-xs font-mono focus:outline-none focus:border-amber-500/60 transition-colors"
          />
          <p className="text-[10px] text-neutral-600 font-sans">Signatures are computed locally via <code className="text-amber-600">crypto.subtle.sign</code> - key never transmitted.</p>
        </div>
      )}

      {/* Main Layout */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800 ${isFullScreen ? 'flex-1 overflow-hidden' : 'min-h-[400px]'}`}>

        {/* Left: Input */}
        <div className={`flex flex-col p-4 space-y-3 ${isFullScreen ? 'overflow-y-auto' : ''}`}>
          <div className="flex items-center justify-between text-xs text-neutral-400 pb-1 border-b border-neutral-900">
            <span className="font-semibold text-neutral-300">
              {mode === 'text' ? 'Text Input' : 'File Upload'}
            </span>
            {mode === 'text' && <span className="text-[11px]">{new Blob([text]).size} bytes</span>}
            {mode === 'file' && fileName && <span className="text-[11px] text-sky-400 truncate max-w-[200px]">{fileName} ({(fileSize / 1024).toFixed(1)} KB)</span>}
          </div>

          {mode === 'text' ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste any text to compute its cryptographic hashes..."
              spellCheck={false}
              className="w-full flex-1 min-h-[280px] p-3 font-mono text-xs bg-neutral-900/90 text-neutral-100 border border-neutral-800 rounded focus:border-[#1D9BF0] focus:outline-none resize-y leading-relaxed transition-colors"
            />
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 min-h-[280px] border-2 border-dashed border-neutral-800 rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#1D9BF0]/50 hover:bg-neutral-900/40 transition-all"
            >
              <Upload className="w-10 h-10 text-neutral-600" />
              <p className="text-neutral-500 text-[11px] font-sans text-center px-4">
                Click to upload a file for SHA-256 / MD5 checksum verification.<br />
                <span className="text-neutral-600">Files are read locally - never uploaded.</span>
              </p>
              {fileName && (
                <div className="mt-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-sky-400 text-[11px]">
                  âœ“ {fileName}
                </div>
              )}
            </div>
          )}

          {/* Checksum Compare */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-neutral-500 font-sans">Compare expected hash (optional)</label>
            <div className="relative">
              <input
                type="text"
                value={compareValue}
                onChange={(e) => setCompareValue(e.target.value)}
                placeholder="Paste expected hash to verify..."
                className="w-full p-2.5 bg-neutral-900 border border-neutral-800 rounded text-neutral-200 text-xs font-mono focus:outline-none focus:border-sky-500 transition-colors pr-24"
              />
              {compareValue.trim() && compareMatch !== null && (
                <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold font-sans px-2 py-0.5 rounded ${compareMatch ? 'text-emerald-400 bg-emerald-950/60' : 'text-red-400 bg-red-950/60'}`}>
                  {compareMatch ? 'âœ“ Match' : 'âœ— No match'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Hash Outputs */}
        <div className={`flex flex-col p-4 space-y-3 ${isFullScreen ? 'overflow-y-auto' : ''}`}>
          <div className="flex items-center justify-between text-xs text-neutral-400 pb-1 border-b border-neutral-900">
            <span className="font-semibold text-neutral-300">Hash Outputs</span>
            {isComputing && <span className="text-[11px] text-sky-400 animate-pulse">Computing...</span>}
          </div>

          <div className="space-y-3 flex-1">
            {/* Standard hash cards */}
            {Object.entries(ALGO_LABELS).map(([key, label]) => {
              const hash = hashes[key];
              const isMatch = compareValue.trim() && hash
                ? hash.toLowerCase() === compareValue.trim().toLowerCase()
                : null;
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-sans font-semibold text-neutral-400 uppercase tracking-wider">{label}</span>
                    {isMatch === true && <span className="text-[10px] text-emerald-400 font-sans font-semibold">âœ“ Verified</span>}
                    {isMatch === false && <span className="text-[10px] text-red-400 font-sans">âœ— Mismatch</span>}
                  </div>
                  <div className={`flex items-start gap-2 p-2.5 rounded border bg-neutral-900/90 transition-colors ${isMatch === true ? 'border-emerald-800/60' : isMatch === false ? 'border-red-900/50' : 'border-neutral-800'}`}>
                    <code className={`flex-1 text-[11px] break-all whitespace-pre-wrap [word-break:break-all] leading-relaxed select-all ${hash ? 'text-sky-300' : 'text-neutral-700 italic'}`}>
                      {hash || (isComputing ? 'computing...' : '-')}
                    </code>
                    {hash && (
                      <button
                        onClick={() => handleCopy(key)}
                        className="shrink-0 p-1 text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer"
                        title={`Copy ${label}`}
                      >
                        {copiedKey === key ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* HMAC Signature Section */}
            {showHmac && (
              <div className="mt-2 pt-3 border-t border-amber-900/40 space-y-3">
                <span className="text-[11px] font-sans font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  HMAC Signatures
                </span>

                {(['256', '512'] as const).map((bits) => {
                  const label = `HMAC-SHA-${bits}`;
                  const sig = bits === '256' ? hmacSig256 : hmacSig512;
                  const isHmacMatch = compareValue.trim() && sig
                    ? sig.toLowerCase() === compareValue.trim().toLowerCase()
                    : null;
                  return (
                    <div key={bits} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-sans font-semibold text-amber-500/80 uppercase tracking-wider">{label}</span>
                        {isHmacMatch === true && <span className="text-[10px] text-emerald-400 font-sans font-semibold">âœ“ Verified</span>}
                        {isHmacMatch === false && <span className="text-[10px] text-red-400 font-sans">âœ— Mismatch</span>}
                      </div>
                      <div className={`flex items-start gap-2 p-2.5 rounded border bg-neutral-900/90 transition-colors ${isHmacMatch === true ? 'border-emerald-800/60' : 'border-amber-900/30'}`}>
                        <code className={`flex-1 text-[11px] break-all whitespace-pre-wrap [word-break:break-all] leading-relaxed select-all ${sig ? 'text-amber-300' : 'text-neutral-700 italic'}`}>
                          {!hmacKey.trim()
                            ? 'Enter a secret key above to compute HMAC...'
                            : isComputingHmac
                              ? 'computing...'
                              : sig || '-'}
                        </code>
                        {sig && (
                          <button
                            onClick={() => handleCopyHmac(bits)}
                            className="shrink-0 p-1 text-neutral-500 hover:text-neutral-200 transition-colors cursor-pointer"
                            title={`Copy ${label}`}
                          >
                            {copiedKey === `hmac${bits}` ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-neutral-900/80 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-neutral-400">
          <Info className="w-3.5 h-3.5 text-neutral-500" />
          <span>Local browser processing â€¢ No data sent to any server</span>
        </div>
        <div className="flex items-center gap-1.5 text-neutral-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
          <span>Web Crypto API (SHA + HMAC) + JS MD5</span>
        </div>
      </div>
    </div>
  );
};
