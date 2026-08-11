'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Copy, Check, Trash2, ShieldCheck, ShieldAlert, ShieldOff, Clock, Info, AlertCircle, Maximize2, Minimize2, Columns2, Rows2 } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';

const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfMTIzNDU2IiwibmFtZSI6IkFsZXggUml2ZXJhIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjk5OTk5OTk5OTl9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

type TokenStatus = 'active' | 'expired' | 'no-exp' | 'invalid' | 'empty';

interface DecodedJWT {
  header: Record<string, any>;
  payload: Record<string, any>;
  status: TokenStatus;
  expiresAt: Date | null;
  issuedAt: Date | null;
}

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function decodeJWT(token: string): DecodedJWT | null {
  const parts = token.trim().split('.');
  if (parts.length !== 3) return null;
  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = payload.exp ? new Date(payload.exp * 1000) : null;
    const issuedAt = payload.iat ? new Date(payload.iat * 1000) : null;
    let status: TokenStatus = 'no-exp';
    if (payload.exp !== undefined) {
      status = payload.exp > now ? 'active' : 'expired';
    }
    return { header, payload, status, expiresAt, issuedAt };
  } catch {
    return null;
  }
}

function highlightJson(obj: Record<string, any>): string {
  const json = JSON.stringify(obj, null, 2);
  const escaped = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped.replace(
    /(\"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*\"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        if (/:$/.test(match)) return `<span class="text-sky-400 font-semibold">${match}</span>`;
        return `<span class="text-emerald-400">${match}</span>`;
      }
      if (/true|false/.test(match)) return `<span class="text-purple-400 font-semibold">${match}</span>`;
      if (/null/.test(match)) return `<span class="text-neutral-500 italic">${match}</span>`;
      return `<span class="text-amber-400">${match}</span>`;
    }
  );
}

function formatDate(date: Date): string {
  return date.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export const JwtInspectorTool: React.FC = () => {
  const { t } = useTranslation();
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedHeader, setCopiedHeader] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSideBySide, setIsSideBySide] = useState(true);

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

  const handleDecode = useCallback((value: string) => {
    setToken(value);
    if (!value.trim()) {
      setDecoded(null);
      setError(null);
      return;
    }
    const parts = value.trim().split('.');
    if (parts.length !== 3) {
      setDecoded(null);
      setError(t('tools.jwtInspector.errorInvalid'));
      return;
    }
    const result = decodeJWT(value);
    if (!result) {
      setDecoded(null);
      setError(t('tools.jwtInspector.errorDecode'));
      return;
    }
    setDecoded(result);
    setError(null);
  }, [t]);

  const handleCopy = (text: string, type: 'header' | 'payload') => {
    navigator.clipboard.writeText(text);
    if (type === 'header') {
      setCopiedHeader(true);
      setTimeout(() => setCopiedHeader(false), 2000);
    } else {
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    }
  };

  const statusConfig = {
    active: { icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', label: t('tools.jwtInspector.statusActive') },
    expired: { icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', label: t('tools.jwtInspector.statusExpired') },
    'no-exp': { icon: ShieldOff, color: 'text-neutral-400', bg: 'bg-neutral-500/10 border-neutral-500/30', label: t('tools.jwtInspector.statusNoExp') },
    invalid: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', label: t('tools.jwtInspector.statusInvalid') },
    empty: { icon: ShieldOff, color: 'text-neutral-500', bg: 'bg-neutral-800/50 border-neutral-700', label: '—' },
  };

  const status = decoded ? decoded.status : (error ? 'invalid' : 'empty');
  const { icon: StatusIcon, color: statusColor, bg: statusBg, label: statusLabel } = statusConfig[status];

  return (
    <div className={`bg-neutral-950 border border-neutral-800 font-sans text-neutral-100 flex flex-col ${isFullScreen ? 'fixed inset-0 z-[9999] overflow-hidden' : 'w-full rounded-lg shadow-2xl'}`}>

      {/* Toolbar */}
      <div className={`px-3 py-2.5 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono ${isFullScreen ? 'sticky top-0 z-[10000]' : ''}`}>
        <span className="font-semibold text-neutral-300">{t('tools.jwtInspector.inputLabel')}</span>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-mono font-semibold ${statusBg} ${statusColor}`}>
            <StatusIcon className="w-3 h-3" />
            <span>{statusLabel}</span>
          </div>
          <button onClick={() => handleDecode(SAMPLE_JWT)} className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer">
            {t('tools.jwtInspector.inputSample')}
          </button>
          <button onClick={() => { setToken(''); setDecoded(null); setError(null); }} className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-red-950 hover:text-red-300 text-neutral-400 transition-colors flex items-center gap-1 cursor-pointer">
            <Trash2 className="w-3 h-3" />
            {t('tools.jwtInspector.inputClear')}
          </button>

          {/* Layout toggle - desktop only */}
          <div className="hidden lg:flex items-center bg-neutral-950 p-1 rounded border border-neutral-800">
            <button
              onClick={() => setIsSideBySide(true)}
              title="Side-by-Side View"
              className={`p-1 rounded transition-colors cursor-pointer ${isSideBySide ? 'bg-[#1D9BF0] text-white' : 'text-neutral-400 hover:text-white'}`}
            >
              <Columns2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsSideBySide(false)}
              title="Stacked View"
              className={`p-1 rounded transition-colors cursor-pointer ${!isSideBySide ? 'bg-[#1D9BF0] text-white' : 'text-neutral-400 hover:text-white'}`}
            >
              <Rows2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
          >
            {isFullScreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Main layout: side-by-side or stacked */}
      <div className={`${
        isSideBySide
          ? 'grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800'
          : 'flex flex-col'
      } ${isFullScreen ? 'flex-1 overflow-hidden' : ''}`}>

        {/* Input pane */}
        <div className={`flex flex-col p-3 sm:p-4 space-y-2 ${
          isFullScreen && isSideBySide ? 'overflow-y-auto' : ''
        }`}>
          <div className="text-xs font-mono text-neutral-400 pb-1 border-b border-neutral-900">
            <span className="font-semibold text-neutral-300">Encoded JWT Token</span>
          </div>
          <textarea
            value={token}
            onChange={(e) => handleDecode(e.target.value)}
            placeholder={t('tools.jwtInspector.inputPlaceholder')}
            spellCheck={false}
            className={`w-full p-3 font-mono text-xs bg-neutral-900/90 text-neutral-100 border border-neutral-800 rounded focus:border-[#1D9BF0] focus:outline-none resize-y leading-relaxed transition-colors placeholder-neutral-600 ${
              isSideBySide ? 'min-h-[300px]' : 'min-h-[80px] max-h-[300px]'
            }`}
          />
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-950/40 border border-red-900/80 rounded text-xs text-red-300 font-mono">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Output pane: 3 panels */}
        <div className={`${
          isSideBySide
            ? 'flex flex-col divide-y divide-neutral-800'
            : 'grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800'
        } ${isFullScreen && isSideBySide ? 'overflow-y-auto' : ''} ${
          !isSideBySide ? 'min-h-[320px]' : ''
        }`}>

          {/* Panel 1: Header */}
          <div className={`flex flex-col p-3 sm:p-4 space-y-2 ${isFullScreen && !isSideBySide ? 'overflow-y-auto' : ''}`}>
            <div className="flex items-center justify-between text-xs font-mono pb-1 border-b border-neutral-900">
              <span className="font-semibold text-[#1D9BF0]">{t('tools.jwtInspector.headerLabel')}</span>
              {decoded && (
                <button onClick={() => handleCopy(JSON.stringify(decoded.header, null, 2), 'header')} className="flex items-center gap-1 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer">
                  {copiedHeader ? <Check className="w-3 h-3 text-sky-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHeader ? t('tools.jwtInspector.copied') : t('tools.jwtInspector.copyHeader')}</span>
                </button>
              )}
            </div>
            <div className="flex-1 bg-neutral-900/90 border border-neutral-800 rounded overflow-auto min-h-[160px]">
              {decoded ? (
                <pre className="font-mono text-xs p-3 leading-relaxed text-neutral-200" dangerouslySetInnerHTML={{ __html: highlightJson(decoded.header) }} />
              ) : (
                <div className="p-4 text-xs text-neutral-600 font-mono italic">{token ? '...' : 'Awaiting token input'}</div>
              )}
            </div>
          </div>

          {/* Panel 2: Payload */}
          <div className={`flex flex-col p-3 sm:p-4 space-y-2 ${isFullScreen && !isSideBySide ? 'overflow-y-auto' : ''}`}>
            <div className="flex items-center justify-between text-xs font-mono pb-1 border-b border-neutral-900">
              <span className="font-semibold text-[#1D9BF0]">{t('tools.jwtInspector.payloadLabel')}</span>
              {decoded && (
                <button onClick={() => handleCopy(JSON.stringify(decoded.payload, null, 2), 'payload')} className="flex items-center gap-1 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer">
                  {copiedPayload ? <Check className="w-3 h-3 text-sky-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPayload ? t('tools.jwtInspector.copied') : t('tools.jwtInspector.copyPayload')}</span>
                </button>
              )}
            </div>
            <div className="flex-1 bg-neutral-900/90 border border-neutral-800 rounded overflow-auto min-h-[160px]">
              {decoded ? (
                <pre className="font-mono text-xs p-3 leading-relaxed text-neutral-200" dangerouslySetInnerHTML={{ __html: highlightJson(decoded.payload) }} />
              ) : (
                <div className="p-4 text-xs text-neutral-600 font-mono italic">{token ? '...' : 'Awaiting token input'}</div>
              )}
            </div>
            {decoded && (decoded.expiresAt || decoded.issuedAt) && (
              <div className="space-y-1.5 pt-1 text-[11px] font-mono">
                {decoded.issuedAt && (
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span className="text-neutral-500">{t('tools.jwtInspector.issuedAt')}:</span>
                    <span>{formatDate(decoded.issuedAt)}</span>
                  </div>
                )}
                {decoded.expiresAt && (
                  <div className={`flex items-center gap-2 ${decoded.status === 'expired' ? 'text-red-400' : 'text-emerald-400'}`}>
                    <Clock className="w-3 h-3 shrink-0" />
                    <span className="text-neutral-500">{t('tools.jwtInspector.expiresAt')}:</span>
                    <span>{formatDate(decoded.expiresAt)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Panel 3: Signature */}
          <div className={`flex flex-col p-3 sm:p-4 space-y-2 ${isFullScreen && !isSideBySide ? 'overflow-y-auto' : ''}`}>
            <div className="text-xs font-mono pb-1 border-b border-neutral-900">
              <span className="font-semibold text-[#1D9BF0]">{t('tools.jwtInspector.signatureLabel')}</span>
            </div>
            <div className="flex-1 bg-neutral-900/90 border border-neutral-800 rounded min-h-[160px] flex flex-col items-center justify-center p-4 text-center space-y-3">
              <ShieldOff className="w-8 h-8 text-neutral-600" />
              <p className="text-xs text-neutral-500 font-mono leading-relaxed">{t('tools.jwtInspector.signatureNote')}</p>
              {decoded && token.split('.')[2] && (
                <div className="w-full mt-2 p-2 bg-neutral-950 border border-neutral-800 rounded">
                  <p className="text-[10px] font-mono text-neutral-600 break-all">{token.split('.')[2]}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-neutral-900/80 border-t border-neutral-800 flex items-center justify-end text-xs font-mono">
        <div className="text-neutral-400 text-[11px] flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-neutral-500" />
          <span>{t('tools.jwtInspector.privacyNote')}</span>
        </div>
      </div>
    </div>
  );
};
