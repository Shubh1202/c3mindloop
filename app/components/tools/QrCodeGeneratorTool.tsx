'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import {
  Download,
  Copy,
  Check,
  RefreshCw,
  QrCode,
  Link,
  Mail,
  Phone,
  Wifi,
  Type,
  Settings2,
  Palette,
  ChevronDown,
  Image as ImageIcon,
  FileCode,
  Maximize2,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type QrType = 'url' | 'text' | 'email' | 'phone' | 'wifi' | 'vcard';
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
type OutputFormat = 'png' | 'svg' | 'webp';

interface WifiConfig {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
}

interface VCardConfig {
  name: string;
  phone: string;
  email: string;
  url: string;
  org: string;
}

const QR_TYPES: { id: QrType; label: string; icon: React.ElementType; placeholder: string }[] = [
  { id: 'url',   label: 'URL',    icon: Link,  placeholder: 'https://example.com' },
  { id: 'text',  label: 'Text',   icon: Type,  placeholder: 'Enter any text...' },
  { id: 'email', label: 'Email',  icon: Mail,  placeholder: 'user@example.com' },
  { id: 'phone', label: 'Phone',  icon: Phone, placeholder: '+91 98765 43210' },
  { id: 'wifi',  label: 'Wi-Fi',  icon: Wifi,  placeholder: 'Network SSID' },
  { id: 'vcard', label: 'vCard',  icon: QrCode, placeholder: 'Contact name' },
];

const EC_LEVELS: { value: ErrorCorrectionLevel; label: string; desc: string }[] = [
  { value: 'L', label: 'Low (7%)',       desc: 'Smallest size, least redundancy' },
  { value: 'M', label: 'Medium (15%)',   desc: 'Balanced — default' },
  { value: 'Q', label: 'Quartile (25%)', desc: 'Better error recovery' },
  { value: 'H', label: 'High (30%)',     desc: 'Most robust, largest size' },
];

const PRESETS = [
  { label: 'Classic Black', fg: '#000000', bg: '#FFFFFF' },
  { label: 'Midnight Blue', fg: '#1e3a5f', bg: '#f0f8ff' },
  { label: 'Forest Green',  fg: '#14532d', bg: '#f0fdf4' },
  { label: 'Deep Purple',   fg: '#4c1d95', bg: '#faf5ff' },
  { label: 'Crimson Red',   fg: '#7f1d1d', bg: '#fff1f2' },
  { label: 'Dark Mode',     fg: '#e2e8f0', bg: '#0f172a' },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildQrContent(type: QrType, text: string, wifi: WifiConfig, vcard: VCardConfig): string {
  switch (type) {
    case 'url':
      return text.trim() ? (text.startsWith('http') ? text : `https://${text}`) : '';
    case 'email':
      return text.trim() ? `mailto:${text.trim()}` : '';
    case 'phone':
      return text.trim() ? `tel:${text.replace(/\s/g, '')}` : '';
    case 'wifi':
      return wifi.ssid.trim()
        ? `WIFI:T:${wifi.encryption};S:${wifi.ssid};P:${wifi.password};;`
        : '';
    case 'vcard':
      return vcard.name.trim()
        ? `BEGIN:VCARD\nVERSION:3.0\nFN:${vcard.name}\nTEL:${vcard.phone}\nEMAIL:${vcard.email}\nURL:${vcard.url}\nORG:${vcard.org}\nEND:VCARD`
        : '';
    default:
      return text;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export const QrCodeGeneratorTool: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef    = useRef<HTMLDivElement>(null);

  const [qrType,  setQrType]  = useState<QrType>('url');
  const [text,    setText]    = useState('https://c3mindloop.dev');
  const [wifi,    setWifi]    = useState<WifiConfig>({ ssid: '', password: '', encryption: 'WPA' });
  const [vcard,   setVcard]   = useState<VCardConfig>({ name: '', phone: '', email: '', url: '', org: '' });

  const [ecLevel,       setEcLevel]       = useState<ErrorCorrectionLevel>('M');
  const [size,          setSize]          = useState(300);
  const [margin,        setMargin]        = useState(4);
  const [fgColor,       setFgColor]       = useState('#000000');
  const [bgColor,       setBgColor]       = useState('#FFFFFF');
  const [outputFormat,  setOutputFormat]  = useState<OutputFormat>('png');
  const [svgString,     setSvgString]     = useState('');

  const [copied,      setCopied]      = useState(false);
  const [copiedSvg,   setCopiedSvg]   = useState(false);
  const [error,       setError]       = useState('');
  const [isFullscreen,setIsFullscreen]= useState(false);
  const [dataUrl,     setDataUrl]     = useState('');
  const [showSettings,setShowSettings]= useState(false);

  const content = buildQrContent(qrType, text, wifi, vcard);

  const generateQr = useCallback(async () => {
    if (!content) { setDataUrl(''); setSvgString(''); return; }
    setError('');
    const opts = {
      errorCorrectionLevel: ecLevel,
      margin,
      color: { dark: fgColor, light: bgColor },
    };
    try {
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, content, { ...opts, width: size });
        const mime = outputFormat === 'webp' ? 'image/webp' : 'image/png';
        setDataUrl(canvasRef.current.toDataURL(mime, 0.95));
      }
      const svg = await QRCode.toString(content, { ...opts, type: 'svg', width: size });
      setSvgString(svg);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to generate QR code');
    }
  }, [content, ecLevel, margin, fgColor, bgColor, size, outputFormat]);

  useEffect(() => { generateQr(); }, [generateQr]);

  const handleDownload = () => {
    if (outputFormat === 'svg') {
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = 'qrcode.svg'; a.click();
      URL.revokeObjectURL(url);
    } else {
      const a = document.createElement('a');
      a.href = dataUrl; a.download = `qrcode.${outputFormat}`; a.click();
    }
  };

  const handleCopyImage = async () => {
    if (!dataUrl) return;
    try {
      const res  = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback silent */ }
  };

  const handleCopySvg = async () => {
    if (!svgString) return;
    await navigator.clipboard.writeText(svgString);
    setCopiedSvg(true);
    setTimeout(() => setCopiedSvg(false), 2000);
  };

  const applyPreset = (p: typeof PRESETS[number]) => {
    setFgColor(p.fg);
    setBgColor(p.bg);
  };

  return (
    <div className="flex flex-col gap-0 rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 border-b border-neutral-800 bg-neutral-900/60">
        {/* Type Tabs */}
        <div className="flex items-center gap-0.5 bg-neutral-950 border border-neutral-800 rounded-lg p-0.5 flex-wrap">
          {QR_TYPES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`qr-type-${id}`}
              onClick={() => { setQrType(id); setText(''); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                qrType === id
                  ? 'bg-[#1D9BF0] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Format selector */}
        <div className="relative">
          <select
            id="qr-output-format"
            value={outputFormat}
            onChange={e => setOutputFormat(e.target.value as OutputFormat)}
            className="appearance-none text-xs font-mono bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-md pl-2.5 pr-7 py-1.5 cursor-pointer focus:outline-none focus:border-[#1D9BF0]"
          >
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
            <option value="svg">SVG</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-500 pointer-events-none" />
        </div>

        <button
          id="qr-settings-toggle"
          onClick={() => setShowSettings(s => !s)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono border transition-all ${
            showSettings
              ? 'bg-neutral-800 border-neutral-700 text-neutral-200'
              : 'border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
          }`}
        >
          <Settings2 className="w-3.5 h-3.5" />
          Options
        </button>

        <span className="text-[11px] font-mono text-neutral-500 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded">
          Client-Side
        </span>
      </div>

      {/* ── Settings Panel ── */}
      {showSettings && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 py-4 border-b border-neutral-800 bg-neutral-900/30">

          {/* Size */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-neutral-400">
              Size: <span className="text-[#1D9BF0]">{size}px</span>
            </label>
            <input
              id="qr-size-slider"
              type="range" min="100" max="600" step="10"
              value={size}
              onChange={e => setSize(Number(e.target.value))}
              className="w-full h-1.5 accent-[#1D9BF0] cursor-pointer"
            />
          </div>

          {/* Margin */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-neutral-400">
              Margin: <span className="text-[#1D9BF0]">{margin}</span>
            </label>
            <input
              id="qr-margin-slider"
              type="range" min="0" max="10" step="1"
              value={margin}
              onChange={e => setMargin(Number(e.target.value))}
              className="w-full h-1.5 accent-[#1D9BF0] cursor-pointer"
            />
          </div>

          {/* Error Correction */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-neutral-400">Error Correction</label>
            <div className="grid grid-cols-2 gap-1">
              {EC_LEVELS.map(({ value, label, desc }) => (
                <button
                  key={value}
                  id={`qr-ec-${value.toLowerCase()}`}
                  title={desc}
                  onClick={() => setEcLevel(value)}
                  className={`text-xs font-mono px-2 py-1 rounded border transition-all ${
                    ecLevel === value
                      ? 'bg-[#1D9BF0]/10 border-[#1D9BF0] text-[#1D9BF0]'
                      : 'border-neutral-800 text-neutral-500 hover:border-neutral-700 hover:text-neutral-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-neutral-400 flex items-center gap-1">
              <Palette className="w-3 h-3" /> Colors
            </label>
            <div className="flex gap-2">
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-[10px] font-mono text-neutral-500">Foreground</span>
                <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded px-2 py-1">
                  <input
                    id="qr-fg-color"
                    type="color" value={fgColor}
                    onChange={e => setFgColor(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                  <span className="text-[10px] font-mono text-neutral-400">{fgColor}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-[10px] font-mono text-neutral-500">Background</span>
                <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded px-2 py-1">
                  <input
                    id="qr-bg-color"
                    type="color" value={bgColor}
                    onChange={e => setBgColor(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                  <span className="text-[10px] font-mono text-neutral-400">{bgColor}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  id={`qr-preset-${p.label.toLowerCase().replace(/\s+/g, '-')}`}
                  title={p.label}
                  onClick={() => applyPreset(p)}
                  className="w-5 h-5 rounded-full border-2 border-neutral-700 hover:border-[#1D9BF0] transition-colors"
                  style={{ backgroundColor: p.fg }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2">

        {/* ─ Input ─ */}
        <div className="p-4 border-b lg:border-b-0 lg:border-r border-neutral-800 space-y-4">

          {(qrType === 'url' || qrType === 'text' || qrType === 'email' || qrType === 'phone') && (
            <div className="space-y-2">
              <label className="text-xs font-mono text-neutral-400" htmlFor="qr-main-input">
                {qrType === 'url' ? 'URL' : qrType === 'text' ? 'Text Content' : qrType === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <textarea
                id="qr-main-input"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={QR_TYPES.find(t => t.id === qrType)?.placeholder}
                rows={qrType === 'text' ? 5 : 2}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm font-mono text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-[#1D9BF0] resize-none transition-colors"
              />
              {qrType === 'text' && (
                <div className="flex justify-end">
                  <span className="text-[10px] font-mono text-neutral-600">{text.length} chars</span>
                </div>
              )}
            </div>
          )}

          {qrType === 'wifi' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-neutral-400" htmlFor="qr-wifi-ssid">Network Name (SSID)</label>
                <input id="qr-wifi-ssid" type="text" value={wifi.ssid}
                  onChange={e => setWifi(w => ({ ...w, ssid: e.target.value }))}
                  placeholder="My Wi-Fi Network"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm font-mono text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-[#1D9BF0] transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-neutral-400" htmlFor="qr-wifi-password">Password</label>
                <input id="qr-wifi-password" type="text" value={wifi.password}
                  onChange={e => setWifi(w => ({ ...w, password: e.target.value }))}
                  placeholder="Wi-Fi password"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm font-mono text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-[#1D9BF0] transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-neutral-400">Encryption</label>
                <div className="flex gap-2">
                  {(['WPA', 'WEP', 'nopass'] as const).map(enc => (
                    <button key={enc} id={`qr-wifi-enc-${enc.toLowerCase()}`}
                      onClick={() => setWifi(w => ({ ...w, encryption: enc }))}
                      className={`flex-1 py-1.5 text-xs font-mono rounded-lg border transition-all ${
                        wifi.encryption === enc
                          ? 'bg-[#1D9BF0]/10 border-[#1D9BF0] text-[#1D9BF0]'
                          : 'border-neutral-800 text-neutral-500 hover:text-neutral-300'
                      }`}
                    >{enc}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {qrType === 'vcard' && (
            <div className="space-y-3">
              {[
                { id: 'qr-vcard-name',  key: 'name',  label: 'Full Name',    placeholder: 'John Doe' },
                { id: 'qr-vcard-phone', key: 'phone', label: 'Phone',        placeholder: '+91 98765 43210' },
                { id: 'qr-vcard-email', key: 'email', label: 'Email',        placeholder: 'john@example.com' },
                { id: 'qr-vcard-org',   key: 'org',   label: 'Organization', placeholder: 'Company Name' },
                { id: 'qr-vcard-url',   key: 'url',   label: 'Website',      placeholder: 'https://example.com' },
              ].map(({ id, key, label, placeholder }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs font-mono text-neutral-400" htmlFor={id}>{label}</label>
                  <input id={id} type="text"
                    value={vcard[key as keyof VCardConfig]}
                    onChange={e => setVcard(v => ({ ...v, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm font-mono text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-[#1D9BF0] transition-colors"
                  />
                </div>
              ))}
            </div>
          )}

          {content && (
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2">
              <p className="text-[10px] font-mono text-neutral-500 mb-1">QR Content Preview</p>
              <p className="text-xs font-mono text-neutral-400 break-all line-clamp-3">{content}</p>
            </div>
          )}
        </div>

        {/* ─ Preview ─ */}
        <div className="p-4 flex flex-col items-center justify-between gap-4">

          <div className={`relative group ${isFullscreen ? 'fixed inset-0 z-50 bg-neutral-950 flex items-center justify-center' : ''}`}>
            {isFullscreen && (
              <button
                id="qr-close-fullscreen"
                onClick={() => setIsFullscreen(false)}
                className="absolute top-4 right-4 z-10 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-full px-3 py-1.5 text-xs font-mono border border-neutral-700 transition-colors"
              >
                ✕ Close
              </button>
            )}

            {error ? (
              <div className="w-56 h-56 flex items-center justify-center border border-red-900/50 rounded-xl bg-red-950/20">
                <p className="text-xs font-mono text-red-400 text-center px-4">{error}</p>
              </div>
            ) : !content ? (
              <div className="w-56 h-56 flex flex-col items-center justify-center border border-neutral-800 rounded-xl bg-neutral-900/50 gap-3">
                <QrCode className="w-12 h-12 text-neutral-700" />
                <p className="text-xs font-mono text-neutral-600 text-center">Enter content to generate</p>
              </div>
            ) : outputFormat === 'svg' ? (
              <div
                ref={svgRef}
                className="rounded-xl overflow-hidden border border-neutral-800"
                style={{ width: Math.min(size, 320), height: Math.min(size, 320) }}
                dangerouslySetInnerHTML={{ __html: svgString }}
              />
            ) : (
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  className="rounded-xl border border-neutral-800 transition-all"
                  style={{ maxWidth: '100%', display: 'block', width: Math.min(size, 320), height: Math.min(size, 320) }}
                />
                {!isFullscreen && (
                  <button
                    id="qr-fullscreen-btn"
                    onClick={() => setIsFullscreen(true)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 rounded-md p-1.5 border border-neutral-700"
                    title="Fullscreen"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {content && (
            <div className="flex flex-wrap items-center justify-center gap-2 w-full">
              <button
                id="qr-download-btn"
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1D9BF0] hover:bg-[#1a8cd8] text-white text-sm font-mono font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Download .{outputFormat.toUpperCase()}
              </button>

              {outputFormat !== 'svg' ? (
                <button
                  id="qr-copy-image-btn"
                  onClick={handleCopyImage}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-700 hover:border-neutral-600 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-sm font-mono transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <ImageIcon className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Image'}
                </button>
              ) : (
                <button
                  id="qr-copy-svg-btn"
                  onClick={handleCopySvg}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-700 hover:border-neutral-600 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-sm font-mono transition-colors"
                >
                  {copiedSvg ? <Check className="w-4 h-4 text-emerald-400" /> : <FileCode className="w-4 h-4" />}
                  {copiedSvg ? 'Copied!' : 'Copy SVG'}
                </button>
              )}

              <button
                id="qr-regenerate-btn"
                onClick={generateQr}
                title="Regenerate"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-800 hover:border-neutral-700 bg-neutral-950 hover:bg-neutral-900 text-neutral-400 text-sm font-mono transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}

          {content && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-neutral-600 border-t border-neutral-800 pt-3 w-full">
              <span>Size: {size}×{size}px</span>
              <span>EC: {ecLevel}</span>
              <span>Format: {outputFormat.toUpperCase()}</span>
              <span>Data: {content.length} chars</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
