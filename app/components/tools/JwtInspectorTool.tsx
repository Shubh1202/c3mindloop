'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { trackEvent, GA_EVENTS } from '../../lib/analytics';
import { Copy, Check, Trash2, ShieldCheck, ShieldAlert, ShieldOff, Clock, Info, AlertCircle, Maximize2, Minimize2, Columns2, Rows2, Key, HelpCircle, ChevronUp, ChevronDown } from 'lucide-react';
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

interface SecurityWarning {
  level: 'critical' | 'warning';
  title: string;
  message: string;
}

export interface SecurityFact {
  title: string;
  message: string;
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

function getCountdownText(expiresAt: Date): { text: string; isExpired: boolean } {
  const diff = expiresAt.getTime() - Date.now();
  const absDiff = Math.abs(diff);
  const secs = Math.floor((absDiff / 1000) % 60);
  const mins = Math.floor((absDiff / (1000 * 60)) % 60);
  const hours = Math.floor((absDiff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));

  let timeStr = '';
  if (days > 0) timeStr += `${days}d `;
  if (hours > 0 || days > 0) timeStr += `${hours.toString().padStart(2, '0')}h : `;
  timeStr += `${mins.toString().padStart(2, '0')}m : ${secs.toString().padStart(2, '0')}s`;

  if (diff < 0) {
    let agoStr = '';
    if (days > 0) agoStr = `${days} day${days > 1 ? 's' : ''}`;
    else if (hours > 0) agoStr = `${hours} hour${hours > 1 ? 's' : ''}`;
    else if (mins > 0) agoStr = `${mins} minute${mins > 1 ? 's' : ''}`;
    else agoStr = `${secs} second${secs > 1 ? 's' : ''}`;
    return { text: `Expired (${agoStr} ago)`, isExpired: true };
  }
  return { text: `Expires in: ${timeStr}`, isExpired: false };
}

export function scanJwtSecurity(header: any, payload: any, rawToken: string, secret?: string) {
  const warnings: string[] = [];
  const facts: SecurityFact[] = [];

  // Facts
  if (header?.alg) facts.push({ title: "Algorithm", message: `Token uses ${header.alg}` });
  if (header?.typ) facts.push({ title: "Token Type", message: `Declared as ${header.typ}` });
  if (payload?.iss) facts.push({ title: "Issuer", message: `Issuer (iss) is present` });
  if (payload?.aud) facts.push({ title: "Audience", message: `Audience (aud) is present` });
  if (payload?.iat) facts.push({ title: "Issued At", message: `Token has issuance timestamp` });

  // Warnings
  if (!header?.alg || header.alg.toLowerCase() === 'none') {
    warnings.push("CRITICAL: alg:none is present. Verify that your server rejects unsigned tokens.");
  }

  if (!payload?.exp) {
    warnings.push("WARNING: Token lacks an 'exp' (Expiration Time) claim. It will never expire automatically.");
  }

  if (payload?.nbf && (new Date(payload.nbf * 1000) > new Date())) {
    warnings.push("WARNING: Token is not active yet (nbf claim is in the future).");
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload?.exp && payload.exp < now) {
    warnings.push("WARNING: Token is expired.");
  }

  return { warnings, facts };
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
  
  // Real-time countdown
  const [countdown, setCountdown] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // Client-Side signature verification state
  const [signatureSecret, setSignatureSecret] = useState('');
  const [signatureValid, setSignatureValid] = useState<boolean | null>(null);

  // Security Scanner Alerts
  const [warnings, setWarnings] = useState<SecurityWarning[]>([]);
  const [facts, setFacts] = useState<SecurityFact[]>([]);
  
  // Auth Checklist
  const [showChecklist, setShowChecklist] = useState(false);

  // Expiry Countdown Interval Hook
  useEffect(() => {
    if (!decoded || !decoded.expiresAt) {
      setCountdown(null);
      setIsExpired(false);
      return;
    }
    const updateCountdown = () => {
      const { text, isExpired: exp } = getCountdownText(decoded.expiresAt!);
      setCountdown(text);
      setIsExpired(exp);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [decoded]);

  // Client-Side signature verification hook
  useEffect(() => {
    const verifySignature = async () => {
      if (!token.trim() || !decoded || !signatureSecret.trim()) {
        setSignatureValid(null);
        return;
      }
      
      const alg = decoded.header.alg;
      if (!alg || !alg.startsWith('HS')) {
        setSignatureValid(null);
        return;
      }

      try {
        const parts = token.trim().split('.');
        const dataStr = `${parts[0]}.${parts[1]}`;
        const encoder = new TextEncoder();
        const keyData = encoder.encode(signatureSecret);
        const data = encoder.encode(dataStr);
        
        let hashName = '';
        if (alg === 'HS256') hashName = 'SHA-256';
        else if (alg === 'HS384') hashName = 'SHA-384';
        else if (alg === 'HS512') hashName = 'SHA-512';
        else {
          setSignatureValid(null);
          return;
        }

        const cryptoKey = await window.crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: hashName },
          false,
          ['verify']
        );

        const sigBase64 = parts[2].replace(/-/g, '+').replace(/_/g, '/');
        const sigPadded = sigBase64.padEnd(sigBase64.length + ((4 - (sigBase64.length % 4)) % 4), '=');
        const sigBinary = atob(sigPadded);
        const sigBytes = new Uint8Array(sigBinary.length);
        for (let i = 0; i < sigBinary.length; i++) sigBytes[i] = sigBinary.charCodeAt(i);

        const isOk = await window.crypto.subtle.verify(
          'HMAC',
          cryptoKey,
          sigBytes,
          data
        );
        setSignatureValid(isOk);
      } catch {
        setSignatureValid(false);
      }
    };

    verifySignature();
  }, [token, signatureSecret, decoded]);

  // Security Scanner logic hook
  useEffect(() => {
    if (!decoded) {
      setWarnings([]);
      setFacts([]);
      return;
    }
    const scanner = scanJwtSecurity(decoded.header, decoded.payload, token, signatureSecret);
    const list: SecurityWarning[] = scanner.warnings.map(msg => {
      const isCritical = msg.startsWith("CRITICAL");
      return {
        level: isCritical ? 'critical' : 'warning',
        title: isCritical ? 'Critical Security Flaw' : 'Security Warning',
        message: msg.replace(/^(CRITICAL|WARNING):\s*/, ''),
      };
    });

    const alg = decoded.header.alg;
    if (alg && !alg.startsWith('HS') && alg.toLowerCase() !== 'none' && signatureSecret.trim().length > 0) {
      list.push({
        level: 'warning',
        title: 'Asymmetric Key Algorithm Used',
        message: `Token signature algorithm uses ${alg} (RSA/ECDSA). Local HS Verification tool only supports HMAC signatures.`,
      });
    }

    setWarnings(list);
    setFacts(scanner.facts);
  }, [decoded, signatureSecret, token]);



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
      setSignatureValid(null);
      return;
    }
    const parts = value.trim().split('.');
    if (parts.length !== 3) {
      setDecoded(null);
      setError(t('tools.jwtInspector.errorInvalid'));
      setSignatureValid(null);
      return;
    }
    const result = decodeJWT(value);
    if (!result) {
      setDecoded(null);
      setError(t('tools.jwtInspector.errorDecode'));
      setSignatureValid(null);
      return;
    }
    setDecoded(result);
    setError(null);
    trackEvent(GA_EVENTS.TOOL_USED, { tool_name: 'jwt_inspector' });
  }, [t]);

  const handleCopy = (text: string, type: 'header' | 'payload') => {
    navigator.clipboard.writeText(text);
    trackEvent(GA_EVENTS.COPY_OUTPUT, { tool_name: 'jwt_inspector', section: type });
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
    empty: { icon: ShieldOff, color: 'text-neutral-500', bg: 'bg-neutral-800/50 border-neutral-700', label: '-' },
  };

  const status = decoded ? decoded.status : (error ? 'invalid' : 'empty');
  const { icon: StatusIcon, color: statusColor, bg: statusBg, label: statusLabel } = statusConfig[status];

  return (
    <div className={`developer-tool-container bg-neutral-950 border border-neutral-800 font-sans text-neutral-100 flex flex-col ${isFullScreen ? 'fixed inset-0 z-[9999] overflow-hidden' : 'w-full rounded-lg shadow-2xl'}`}>

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
          <button onClick={() => { setToken(''); setDecoded(null); setError(null); setSignatureValid(null); setSignatureSecret(''); }} className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-red-950 hover:text-red-300 text-neutral-400 transition-colors flex items-center gap-1 cursor-pointer">
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
      <div className={`${isSideBySide
        ? 'grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800'
        : 'flex flex-col'
        } ${isFullScreen ? 'flex-1 overflow-hidden' : ''}`}>

        {/* Left Input & verification settings */}
        <div className={`flex flex-col p-3 sm:p-4 space-y-4 ${isFullScreen && isSideBySide ? 'overflow-y-auto' : ''}`}>
          <div className="flex flex-col space-y-2">
            <div className="text-xs font-mono text-neutral-400 pb-1 border-b border-neutral-900">
              <span className="font-semibold text-neutral-300">Encoded JWT Token</span>
            </div>
            <textarea
              value={token}
              onChange={(e) => handleDecode(e.target.value)}
              placeholder={t('tools.jwtInspector.inputPlaceholder')}
              spellCheck={false}
              className={`w-full p-3 font-mono text-xs bg-neutral-900/90 text-neutral-100 border border-neutral-800 rounded focus:border-[#1D9BF0] focus:outline-none resize-y leading-relaxed transition-colors placeholder-neutral-600 ${isSideBySide ? 'min-h-[160px]' : 'min-h-[80px]'}`}
            />
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-950/40 border border-red-900/80 rounded text-xs text-red-300 font-mono">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Client-Side HMAC Signature Verification */}
          {decoded && decoded.header.alg && decoded.header.alg.startsWith('HS') && (
            <div className="p-3 bg-neutral-900/40 border border-neutral-800 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-neutral-300">
                <Key className="w-3.5 h-3.5 text-[#1D9BF0]" />
                <span>Verify HMAC Signature ({decoded.header.alg})</span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono leading-normal">
                HMAC verification occurs entirely in your browser via the Web Crypto API. Your secret key is never sent over the network.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  placeholder="HMAC Secret Key (e.g. your-256-bit-secret)"
                  value={signatureSecret}
                  onChange={(e) => setSignatureSecret(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-xs font-mono text-neutral-200 focus:outline-none focus:border-[#1D9BF0]"
                />
                {signatureSecret.trim() && (
                  <div className={`px-2.5 py-1.5 rounded border text-[11px] font-mono font-bold shrink-0 ${
                    signatureValid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    {signatureValid ? 'Signature Verified âœ“' : 'Invalid Signature âœ—'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Facts vs Warnings Panel */}
          {decoded && (
            <div className="p-3 bg-neutral-900/40 border border-neutral-800 rounded-lg space-y-4">
              <div>
                <div className="text-xs font-mono font-semibold text-neutral-300 flex items-center gap-1.5 mb-2">
                  <Info className="w-3.5 h-3.5 text-[#1D9BF0]" />
                  <span>Token Facts</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  {facts.map((f, i) => (
                    <div key={i} className="p-1.5 bg-neutral-950 border border-neutral-800 rounded text-neutral-400">
                      <span className="font-semibold text-neutral-300 block mb-0.5">{f.title}</span>
                      {f.message}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-mono font-semibold text-neutral-300 flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Security Warnings</span>
                </div>
                {warnings.length === 0 ? (
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>No structural vulnerabilities detected.</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {warnings.map((w, i) => (
                      <div key={i} className={`p-2.5 rounded border flex items-start gap-2 text-[11px] font-mono ${
                        w.level === 'critical' ? 'bg-red-950/20 border-red-900/40 text-red-300' : 'bg-amber-950/15 border-amber-900/30 text-amber-300'
                      }`}>
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold mb-0.5">{w.title}</div>
                          <div className="text-neutral-400 leading-relaxed">{w.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Auth Failure Checklist */}
          {decoded && (
            <div className="p-3 bg-neutral-900/40 border border-neutral-800 rounded-lg space-y-3">
              <div className="text-xs font-mono font-semibold text-neutral-300 flex items-center justify-between cursor-pointer" onClick={() => setShowChecklist(!showChecklist)}>
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#1D9BF0]" />
                  <span>Auth Failure Checklist (Possible causes)</span>
                </div>
                {showChecklist ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </div>
              {showChecklist && (
                <div className="space-y-2 text-[11px] font-mono">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-1">
                    <span className="text-neutral-400">Clock Skew (NTP out of sync)</span>
                    <span className="text-amber-400">Not Checked</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-1">
                    <span className="text-neutral-400">Issuer (iss) Mismatch</span>
                    <span className={decoded.payload.iss ? 'text-emerald-400' : 'text-neutral-500'}>{decoded.payload.iss ? 'Checked (Present)' : 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-1">
                    <span className="text-neutral-400">Audience (aud) Mismatch</span>
                    <span className={decoded.payload.aud ? 'text-emerald-400' : 'text-neutral-500'}>{decoded.payload.aud ? 'Checked (Present)' : 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-1">
                    <span className="text-neutral-400">Algorithm Mismatch</span>
                    <span className="text-emerald-400">Checked ({decoded.header.alg || 'N/A'})</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-neutral-400">Missing Expected Claims</span>
                    <span className="text-amber-400">Not Checked</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Output pane */}
        <div className={`${isSideBySide
          ? 'flex flex-col divide-y divide-neutral-800'
          : 'grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800'
          } ${isFullScreen && isSideBySide ? 'overflow-y-auto' : ''} ${!isSideBySide ? 'min-h-[320px]' : ''}`}>

          {/* Header Panel */}
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
            <div className="flex-1 bg-neutral-900/90 border border-neutral-800 rounded min-h-[160px] flex flex-col overflow-hidden">
              {decoded ? (
                <pre className="font-mono text-xs p-3 leading-relaxed text-neutral-200 whitespace-pre-wrap break-words [word-break:break-word] overflow-y-auto flex-1" dangerouslySetInnerHTML={{ __html: highlightJson(decoded.header) }} />
              ) : (
                <div className="p-4 text-xs text-neutral-600 font-mono italic">{token ? '...' : 'Awaiting token input'}</div>
              )}
            </div>
          </div>

          {/* Payload Panel */}
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
            <div className="flex-1 bg-neutral-900/90 border border-neutral-800 rounded min-h-[160px] flex flex-col overflow-hidden">
              {decoded ? (
                <pre className="font-mono text-xs p-3 leading-relaxed text-neutral-200 whitespace-pre-wrap break-words [word-break:break-word] overflow-y-auto flex-1" dangerouslySetInnerHTML={{ __html: highlightJson(decoded.payload) }} />
              ) : (
                <div className="p-4 text-xs text-neutral-600 font-mono italic">{token ? '...' : 'Awaiting token input'}</div>
              )}
            </div>

            {/* Countdown and Timestamps */}
            {decoded && (
              <div className="space-y-1.5 pt-1.5 text-[11px] font-mono border-t border-neutral-900">
                {countdown && (
                  <div className={`flex items-center gap-2 px-2 py-1 rounded-md text-[10px] font-bold ${
                    isExpired ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>{countdown}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-1 text-neutral-400 pl-1 pt-0.5">
                  {decoded.issuedAt && (
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500">{t('tools.jwtInspector.issuedAt')}:</span>
                      <span>{formatDate(decoded.issuedAt)}</span>
                    </div>
                  )}
                  {decoded.expiresAt && (
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500">{t('tools.jwtInspector.expiresAt')}:</span>
                      <span>{formatDate(decoded.expiresAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Signature Panel */}
          <div className={`flex flex-col p-3 sm:p-4 space-y-2 ${isFullScreen && !isSideBySide ? 'overflow-y-auto' : ''}`}>
            <div className="text-xs font-mono pb-1 border-b border-neutral-900">
              <span className="font-semibold text-[#1D9BF0]">{t('tools.jwtInspector.signatureLabel')}</span>
            </div>
            <div className="flex-1 bg-neutral-900/90 border border-neutral-800 rounded min-h-[160px] flex flex-col items-center justify-center p-4 text-center space-y-3">
              {signatureSecret.trim() && signatureValid !== null ? (
                signatureValid ? (
                  <>
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    <p className="text-xs font-semibold text-emerald-400 font-mono">HMAC Signature Valid âœ“</p>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-8 h-8 text-red-400" />
                    <p className="text-xs font-semibold text-red-400 font-mono">Invalid HMAC Signature âœ—</p>
                  </>
                )
              ) : (
                <>
                  <ShieldOff className="w-8 h-8 text-neutral-600" />
                  <p className="text-xs text-neutral-500 font-mono leading-relaxed">{t('tools.jwtInspector.signatureNote')}</p>
                  <p className="text-[10px] text-amber-400 font-mono mt-1 font-semibold">Signature verification not performed.</p>
                </>
              )}
              {decoded && token.split('.')[2] && (
                <div className="w-full mt-2 p-2 bg-neutral-950 border border-neutral-800 rounded">
                  <p className="text-[10px] font-mono text-neutral-600 break-all whitespace-pre-wrap">{token.split('.')[2]}</p>
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
