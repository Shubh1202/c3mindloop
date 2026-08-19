'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Copy, Check, Trash2, RefreshCw, Info, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';

// ── Cron field metadata ──────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ── Parser ───────────────────────────────────────────────────────────────────

interface CronParts {
  second?: string;
  minute: string;
  hour: string;
  dom: string;
  month: string;
  dow: string;
}

function parseCron(expr: string, flavor: 'standard' | 'quartz'): CronParts | null {
  const parts = expr.trim().split(/\s+/);
  if (flavor === 'standard') {
    if (parts.length === 5) {
      const [minute, hour, dom, month, dow] = parts;
      return { minute, hour, dom, month, dow };
    }
  } else {
    if (parts.length === 6) {
      const [second, minute, hour, dom, month, dow] = parts;
      return { second, minute, hour, dom, month, dow };
    }
  }
  return null;
}

// ── Human-readable description ───────────────────────────────────────────────

function describeField(value: string, type: 'second' | 'minute' | 'hour' | 'dom' | 'month' | 'dow'): string {
  if (value === '*' || value === '?') return null as unknown as string;

  if (value.startsWith('*/')) {
    const step = value.slice(2);
    const unit = { second: 'second', minute: 'minute', hour: 'hour', dom: 'day', month: 'month', dow: 'day of week' }[type];
    return `every ${step} ${unit}s`;
  }

  if (value.includes('-')) {
    const [from, to] = value.split('-');
    if (type === 'month') return `${MONTHS[+from - 1]} through ${MONTHS[+to - 1]}`;
    if (type === 'dow') return `${DAYS[+from % 7]} through ${DAYS[+to % 7]}`;
    if (type === 'hour') return `${padHour(+from)} through ${padHour(+to)}`;
    return `${from} through ${to}`;
  }

  if (value.includes(',')) {
    const vals = value.split(',');
    if (type === 'month') return vals.map(v => MONTHS[+v - 1]).join(', ');
    if (type === 'dow') return vals.map(v => DAYS[+v % 7]).join(', ');
    if (type === 'hour') return vals.map(v => padHour(+v)).join(', ');
    return vals.join(', ');
  }

  if (type === 'month') return MONTHS[+value - 1] ?? value;
  if (type === 'dow') return DAYS[+value % 7] ?? value;
  if (type === 'hour') return padHour(+value);
  return value;
}

function padHour(h: number): string {
  if (isNaN(h)) return '12:00 AM';
  const suffix = h >= 12 ? 'PM' : 'AM';
  const display = h % 12 === 0 ? 12 : h % 12;
  return `${display}:00 ${suffix}`;
}

function describeHour(value: string): string {
  if (value === '*') return 'every hour';
  if (value.startsWith('*/')) {
    return `every ${value.slice(2)} hours`;
  }
  if (value.includes('-')) {
    const [from, to] = value.split('-').map(Number);
    if (!isNaN(from) && !isNaN(to)) {
      return `hours ${padHour(from)} through ${padHour(to)}`;
    }
  }
  if (value.includes(',')) {
    const vals = value.split(',').map(Number).filter(v => !isNaN(v));
    return `hours ${vals.map(padHour).join(', ')}`;
  }
  const single = Number(value);
  if (!isNaN(single)) return padHour(single);
  return value;
}

function describeMinute(value: string): string {
  if (value === '*') return 'every minute';
  if (value.startsWith('*/')) {
    return `every ${value.slice(2)} minutes`;
  }
  if (value.includes('-')) {
    const [from, to] = value.split('-').map(Number);
    if (!isNaN(from) && !isNaN(to)) {
      return `minutes ${from} through ${to}`;
    }
  }
  if (value.includes(',')) {
    return `minutes ${value}`;
  }
  return `minute ${value}`;
}

function buildDescription(parts: CronParts, flavor: 'standard' | 'quartz'): string {
  const { second, minute, hour, dom, month, dow } = parts;

  const domDesc    = describeField(dom, 'dom');
  const monthDesc  = describeField(month, 'month');
  const dowDesc    = describeField(dow, 'dow');

  let time = '';
  if (minute === '*' && hour === '*') {
    time = 'every minute';
  } else if (hour === '*') {
    if (minute.startsWith('*/')) {
      time = `${describeMinute(minute)}`;
    } else {
      time = `at ${describeMinute(minute)} of every hour`;
    }
  } else if (minute === '*') {
    time = `every minute of ${describeHour(hour)}`;
  } else {
    if (minute.startsWith('*/') || minute.includes(',') || minute.includes('-') ||
        hour.includes('-') || hour.includes(',') || hour.startsWith('*/')) {
      time = `at ${describeMinute(minute)} of ${describeHour(hour)}`;
    } else {
      const hrVal = Number(hour);
      const displayMin = minute.padStart(2, '0');
      const suffix = hrVal >= 12 ? 'PM' : 'AM';
      const displayHr = hrVal % 12 === 0 ? 12 : hrVal % 12;
      time = `at ${displayHr}:${displayMin} ${suffix}`;
    }
  }

  // Add seconds description if in Quartz mode and seconds is not '*' or '0'
  if (flavor === 'quartz' && second && second !== '*' && second !== '0') {
    const secDesc = describeField(second, 'second');
    if (second.startsWith('*/')) {
      time = `${time} (specifically ${secDesc})`;
    } else {
      time = `${time} (at second ${second})`;
    }
  }

  const parts2: string[] = [time];

  if (dow && dow !== '*' && dow !== '?') parts2.push(`on ${dowDesc}`);
  else if (dom && dom !== '*' && dom !== '?') parts2.push(`on day ${domDesc} of the month`);

  if (month && month !== '*') parts2.push(`in ${monthDesc}`);

  return parts2.join(', ');
}

// ── Next execution calculator ────────────────────────────────────────────────

function matchesField(value: string, current: number, min: number, max: number): boolean {
  if (value === '*' || value === '?') return true;
  if (value.startsWith('*/')) {
    const step = parseInt(value.slice(2), 10);
    return (current - min) % step === 0;
  }
  if (value.includes(',')) return value.split(',').map(Number).includes(current);
  if (value.includes('-')) {
    const [lo, hi] = value.split('-').map(Number);
    return current >= lo && current <= hi;
  }
  return parseInt(value, 10) === current;
}

function getNextExecutions(parts: CronParts, flavor: 'standard' | 'quartz', count = 5): { local: Date; utc: Date }[] {
  const results: { local: Date; utc: Date }[] = [];
  const now = new Date();
  const cursor = new Date(now.getTime() + (flavor === 'quartz' ? 1000 : 60_000));
  
  if (flavor === 'standard') {
    cursor.setSeconds(0, 0);
  } else {
    cursor.setMilliseconds(0);
  }

  let iterations = 0;
  while (results.length < count && iterations < 500_000) {
    iterations++;
    const sec   = cursor.getSeconds();
    const min   = cursor.getMinutes();
    const hr    = cursor.getHours();
    const dom   = cursor.getDate();
    const month = cursor.getMonth() + 1;
    const dow   = cursor.getDay();

    const secMatches = flavor === 'quartz' && parts.second 
      ? matchesField(parts.second, sec, 0, 59)
      : true;

    if (
      secMatches &&
      matchesField(parts.month, month, 1, 12) &&
      matchesField(parts.dom, dom, 1, 31) &&
      matchesField(parts.dow, dow, 0, 6) &&
      matchesField(parts.hour, hr, 0, 23) &&
      matchesField(parts.minute, min, 0, 59)
    ) {
      results.push({ local: new Date(cursor), utc: new Date(cursor) });
    }
    
    if (flavor === 'quartz') {
      cursor.setSeconds(cursor.getSeconds() + 1);
    } else {
      cursor.setMinutes(cursor.getMinutes() + 1);
    }
  }
  return results;
}

// ── Validation ──────────────────────────────────────────────────────────────

function validateCronParts(parts: CronParts, flavor: 'standard' | 'quartz'): string[] {
  const errors: string[] = [];
  const checkField = (val: string, min: number, max: number, name: string) => {
    if (val === '*' || val === '?') return;
    const nums = val.replace(/[*/,\-]/g, ' ').trim().split(/\s+/).map(Number).filter(n => !isNaN(n));
    for (const n of nums) {
      if (n < min || n > max) errors.push(`${name}: ${n} is out of range (${min}–${max})`);
    }
  };
  if (flavor === 'quartz' && parts.second) checkField(parts.second, 0, 59, 'Second');
  checkField(parts.minute, 0, 59, 'Minute');
  checkField(parts.hour, 0, 23, 'Hour');
  checkField(parts.dom, 1, 31, 'Day of Month');
  checkField(parts.month, 1, 12, 'Month');
  checkField(parts.dow, 0, 7, 'Day of Week');
  return errors;
}

function isHighFrequency(parts: CronParts, flavor: 'standard' | 'quartz'): boolean {
  if (flavor === 'quartz' && parts.second && parts.second === '*') return true;
  if (parts.minute === '*' && parts.hour === '*') return true;
  const stepMatch = parts.minute.match(/^\*\/(\d+)$/);
  if (stepMatch && parseInt(stepMatch[1], 10) <= 5) return true;
  return false;
}

// ── Builder state ────────────────────────────────────────────────────────────

interface BuilderState {
  second: string;
  minute: string;
  hour: string;
  dom: string;
  month: string;
  dow: string;
}

const DEFAULT_BUILDER: BuilderState = { second: '0', minute: '*', hour: '*', dom: '*', month: '*', dow: '*' };

function builderToCron(b: BuilderState, flavor: 'standard' | 'quartz'): string {
  if (flavor === 'quartz') {
    return `${b.second} ${b.minute} ${b.hour} ${b.dom} ${b.month} ${b.dow}`;
  }
  return `${b.minute} ${b.hour} ${b.dom} ${b.month} ${b.dow}`;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function FieldSelector({
  label,
  value,
  onChange,
  options,
  allowStar = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  allowStar?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-1.5 text-xs font-mono text-neutral-200 focus:border-[#1D9BF0] focus:outline-none cursor-pointer"
      >
        {allowStar && <option value="*">* (any)</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

const SAMPLE_CRON_STANDARD = '*/15 9-17 * * 1-5';
const SAMPLE_CRON_QUARTZ   = '0 */15 9-17 * * ?';

export const CronVisualizerTool: React.FC = () => {
  const { t } = useTranslation();
  const [flavor, setFlavor] = useState<'standard' | 'quartz'>('standard');
  const [input, setInput] = useState(SAMPLE_CRON_STANDARD);
  const [builder, setBuilder] = useState<BuilderState>({ second: '0', minute: '*/15', hour: '9-17', dom: '*', month: '*', dow: '1-5' });
  const [activeTab, setActiveTab] = useState<'input' | 'builder'>('input');
  const [copied, setCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

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

  // Handle flavor switch
  const handleFlavorChange = (nextFlavor: 'standard' | 'quartz') => {
    setFlavor(nextFlavor);
    if (nextFlavor === 'standard') {
      setInput(SAMPLE_CRON_STANDARD);
      setBuilder({ second: '0', minute: '*/15', hour: '9-17', dom: '*', month: '*', dow: '1-5' });
    } else {
      setInput(SAMPLE_CRON_QUARTZ);
      setBuilder({ second: '0', minute: '*/15', hour: '9-17', dom: '*', month: '*', dow: '?' });
    }
  };

  const cronExpr = activeTab === 'builder' ? builderToCron(builder, flavor) : input;

  const parsed = useMemo(() => {
    try { return parseCron(cronExpr, flavor); } catch { return null; }
  }, [cronExpr, flavor]);

  const description = useMemo(() => {
    if (!parsed) return null;
    try { return buildDescription(parsed, flavor); } catch { return null; }
  }, [parsed, flavor]);

  const nextRuns = useMemo(() => {
    if (!parsed) return [];
    try { return getNextExecutions(parsed, flavor, 10); } catch { return []; }
  }, [parsed, flavor]);

  const validationErrors = useMemo(() => {
    if (!parsed) return [];
    return validateCronParts(parsed, flavor);
  }, [parsed, flavor]);

  const highFreq = useMemo(() => {
    if (!parsed) return false;
    return isHighFrequency(parsed, flavor);
  }, [parsed, flavor]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(cronExpr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cronExpr]);

  const handleReset = useCallback(() => {
    if (flavor === 'standard') {
      setInput(SAMPLE_CRON_STANDARD);
      setBuilder({ second: '0', minute: '*/15', hour: '9-17', dom: '*', month: '*', dow: '1-5' });
    } else {
      setInput(SAMPLE_CRON_QUARTZ);
      setBuilder({ second: '0', minute: '*/15', hour: '9-17', dom: '*', month: '*', dow: '?' });
    }
  }, [flavor]);

  const syncBuilderFromInput = useCallback(() => {
    const p = parseCron(input, flavor);
    if (p) {
      setBuilder({
        second: p.second || '0',
        minute: p.minute,
        hour: p.hour,
        dom: p.dom,
        month: p.month,
        dow: p.dow
      });
      setActiveTab('builder');
    }
  }, [input, flavor]);

  const secondOpts = Array.from({ length: 60 }, (_, i) => ({ label: String(i).padStart(2, '0') + 's', value: String(i) }));
  secondOpts.unshift(...['*/5','*/10','*/15','*/30'].map(v => ({ label: v, value: v })));

  const minuteOpts = Array.from({ length: 60 }, (_, i) => ({ label: String(i).padStart(2, '0'), value: String(i) }));
  minuteOpts.unshift(...['*/5','*/10','*/15','*/30'].map(v => ({ label: v, value: v })));

  const hourOpts = Array.from({ length: 24 }, (_, i) => ({ label: padHour(i), value: String(i) }));
  hourOpts.unshift(...['9-17','0-5','18-23'].map(v => ({ label: v, value: v })));

  const domOpts = Array.from({ length: 31 }, (_, i) => ({ label: String(i + 1), value: String(i + 1) }));
  if (flavor === 'quartz') {
    domOpts.unshift({ label: '? (no specific value)', value: '?' });
  }

  const monthOpts = MONTHS.map((m, i) => ({ label: m, value: String(i + 1) }));

  const dowOpts = DAYS.map((d, i) => ({ label: d, value: String(i) }));
  if (flavor === 'quartz') {
    dowOpts.unshift({ label: '? (no specific value)', value: '?' });
  }
  dowOpts.unshift({ label: '1-5 (Mon-Fri)', value: '1-5' });
  dowOpts.unshift({ label: '0,6 (Weekends)', value: '0,6' });

  const isValid = !!parsed;

  return (
    <div className={`bg-neutral-950 border border-neutral-800 font-sans text-neutral-100 flex flex-col ${isFullScreen ? 'fixed inset-0 z-[9999] overflow-hidden' : 'w-full rounded-lg shadow-2xl'}`}>

      {/* Toolbar */}
      <div className={`px-3 py-2.5 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono ${isFullScreen ? 'sticky top-0 z-[10000]' : 'rounded-t-lg'}`}>
        
        {/* Left Toolbar Cluster: View Mode & Flavor Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-neutral-950 p-0.5 rounded border border-neutral-800">
            <button
              onClick={() => setActiveTab('input')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${activeTab === 'input' ? 'bg-[#1D9BF0] text-white' : 'text-neutral-400 hover:text-white'}`}
            >
              {t('tools.cronVisualizer.tabInput')}
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${activeTab === 'builder' ? 'bg-[#1D9BF0] text-white' : 'text-neutral-400 hover:text-white'}`}
            >
              {t('tools.cronVisualizer.tabBuilder')}
            </button>
          </div>

          <div className="flex items-center bg-neutral-950 p-0.5 rounded border border-neutral-800">
            <button
              onClick={() => handleFlavorChange('standard')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${flavor === 'standard' ? 'bg-[#1D9BF0]/20 text-[#1D9BF0] border border-[#1D9BF0]/30 font-semibold' : 'text-neutral-400 hover:text-white border border-transparent'}`}
            >
              5-Field (Standard)
            </button>
            <button
              onClick={() => handleFlavorChange('quartz')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${flavor === 'quartz' ? 'bg-[#1D9BF0]/20 text-[#1D9BF0] border border-[#1D9BF0]/30 font-semibold' : 'text-neutral-400 hover:text-white border border-transparent'}`}
            >
              6-Field (Quartz / AWS)
            </button>
          </div>
        </div>

        {/* Right Toolbar Cluster: Actions */}
        <div className="flex items-center gap-2">
          {activeTab === 'input' && isValid && (
            <button
              onClick={syncBuilderFromInput}
              className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors text-xs cursor-pointer"
            >
              {t('tools.cronVisualizer.openInBuilder')}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? t('tools.cronVisualizer.copied') : t('tools.cronVisualizer.copy')}</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-red-950 hover:text-red-300 text-neutral-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>{t('tools.cronVisualizer.clear')}</span>
          </button>
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
          >
            {isFullScreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Main layout: left + right */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800 ${isFullScreen ? 'flex-1 overflow-auto' : ''}`}>

        {/* LEFT: Input or Builder */}
        <div className="p-4 space-y-4">

          {activeTab === 'input' ? (
            <div className="space-y-2">
              <label className="text-xs font-mono text-neutral-400">
                {t('tools.cronVisualizer.inputLabel')} ({flavor === 'standard' ? '5-field format' : '6-field format'})
              </label>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={flavor === 'standard' ? 'e.g. */15 9-17 * * 1-5' : 'e.g. 0 */15 9-17 * * ?'}
                spellCheck={false}
                className="w-full px-3 py-2.5 font-mono text-sm bg-neutral-900 border border-neutral-800 rounded focus:border-[#1D9BF0] focus:outline-none text-neutral-100 placeholder-neutral-600 transition-colors"
              />
              {/* Field labels */}
              <div className={`grid ${flavor === 'standard' ? 'grid-cols-5' : 'grid-cols-6'} gap-1 text-[10px] font-mono text-neutral-500 text-center px-0.5`}>
                {flavor === 'standard' 
                  ? ['MIN','HOUR','DOM','MON','DOW'].map(f => (
                      <span key={f} className="bg-neutral-900 border border-neutral-800 rounded py-0.5">{f}</span>
                    ))
                  : ['SEC','MIN','HOUR','DOM','MON','DOW'].map(f => (
                      <span key={f} className="bg-neutral-900 border border-neutral-800 rounded py-0.5">{f}</span>
                    ))
                }
              </div>
              {!isValid && input.trim() && (
                <div className="flex items-center gap-2 p-2.5 bg-red-950/40 border border-red-900/60 rounded text-xs text-red-300 font-mono">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('tools.cronVisualizer.errorInvalid')}</span>
                </div>
              )}
              {/* Quick presets */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-mono text-neutral-500">{t('tools.cronVisualizer.presetsLabel')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(flavor === 'standard' ? PRESETS_STANDARD : PRESETS_QUARTZ).map(p => (
                    <button
                      key={p.value}
                      onClick={() => setInput(p.value)}
                      className="px-2 py-1 text-[11px] font-mono bg-neutral-900 border border-neutral-800 hover:border-[#1D9BF0] hover:text-[#1D9BF0] text-neutral-400 rounded transition-colors cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-mono text-neutral-400">{t('tools.cronVisualizer.builderLabel')}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {flavor === 'quartz' && (
                  <FieldSelector label="Second" value={builder.second} onChange={v => setBuilder(b => ({ ...b, second: v }))} options={secondOpts} allowStar={true} />
                )}
                <FieldSelector label="Minute" value={builder.minute} onChange={v => setBuilder(b => ({ ...b, minute: v }))} options={minuteOpts} />
                <FieldSelector label="Hour" value={builder.hour} onChange={v => setBuilder(b => ({ ...b, hour: v }))} options={hourOpts} />
                <FieldSelector label="Day of Month" value={builder.dom} onChange={v => setBuilder(b => ({ ...b, dom: v }))} options={domOpts} />
                <FieldSelector label="Month" value={builder.month} onChange={v => setBuilder(b => ({ ...b, month: v }))} options={monthOpts} />
                <FieldSelector label="Day of Week" value={builder.dow} onChange={v => setBuilder(b => ({ ...b, dow: v }))} options={dowOpts} />
              </div>
              {/* Generated expression display */}
              <div className="mt-2 p-3 bg-neutral-900 border border-neutral-800 rounded">
                <p className="text-[11px] font-mono text-neutral-500 mb-1">{t('tools.cronVisualizer.generatedLabel')}</p>
                <code className="text-sm font-mono text-[#1D9BF0] tracking-widest">{cronExpr}</code>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Description + Next runs */}
        <div className="p-4 space-y-4">

          {/* Human-readable */}
          <div className="space-y-2">
            <p className="text-xs font-mono text-neutral-400">{t('tools.cronVisualizer.descriptionLabel')}</p>
            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded min-h-[52px] flex items-center whitespace-pre-wrap break-words [word-break:break-word] overflow-x-hidden">
              {description ? (
                <p className="text-sm text-neutral-100 leading-relaxed capitalize">{description}</p>
              ) : (
                <p className="text-xs text-neutral-600 font-mono italic">
                  {input.trim() ? t('tools.cronVisualizer.errorInvalid') : t('tools.cronVisualizer.descriptionPlaceholder')}
                </p>
              )}
            </div>
          </div>

          {/* Warnings */}
          {highFreq && (
            <div className="flex items-start gap-2 p-2.5 bg-amber-950/50 border border-amber-800/70 rounded text-xs font-mono text-amber-300">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
              <span>⚠️ High Frequency Schedule — this expression runs very frequently and may cause high server load.</span>
            </div>
          )}
          {validationErrors.length > 0 && (
            <div className="p-2.5 bg-red-950/50 border border-red-800/70 rounded space-y-1">
              {validationErrors.map((e, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-mono text-red-300">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                  <span>{e}</span>
                </div>
              ))}
            </div>
          )}

          {/* Next 10 executions */}
          <div className="space-y-2">
            <p className="text-xs font-mono text-neutral-400">Next 10 Upcoming Executions (Local &amp; UTC)</p>
            {nextRuns.length > 0 ? (
              <div className="space-y-1.5">
                {nextRuns.map((run, i) => (
                  <div key={i} className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center p-2 bg-neutral-900 border border-neutral-800 rounded text-xs font-mono whitespace-pre-wrap break-words [word-break:break-word] overflow-x-hidden">
                    <span className="text-neutral-600 w-4 text-center">{i + 1}</span>
                    <div>
                      <p className="text-[10px] text-neutral-500 mb-0.5">{t('tools.cronVisualizer.localTime')}</p>
                      <p className="text-neutral-200" suppressHydrationWarning>
                        {run.local.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-500 mb-0.5">{t('tools.cronVisualizer.utcTime')}</p>
                      <p className="text-neutral-400" suppressHydrationWarning>
                        {run.utc.toUTCString().replace(' GMT', '')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded text-xs text-neutral-600 font-mono italic">
                {t('tools.cronVisualizer.nextRunsPlaceholder')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`px-4 py-2 bg-neutral-900/80 border-t border-neutral-800 flex items-center justify-between text-xs font-mono ${isFullScreen ? '' : 'rounded-b-lg'}`}>
        <div className="flex items-center gap-1.5 text-neutral-500">
          <RefreshCw className="w-3 h-3" />
          <span className="text-[10px]">{t('tools.cronVisualizer.supportNote')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-neutral-500">
          <Info className="w-3 h-3" />
          <span className="text-[10px]">{t('tools.cronVisualizer.privacyNote')}</span>
        </div>
      </div>
    </div>
  );
};

const PRESETS_STANDARD = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Daily midnight', value: '0 0 * * *' },
  { label: 'Every 15 min', value: '*/15 * * * *' },
  { label: 'Weekdays 9am', value: '0 9 * * 1-5' },
  { label: 'Every Sunday', value: '0 0 * * 0' },
];

const PRESETS_QUARTZ = [
  { label: 'Every second', value: '* * * * * *' },
  { label: 'Every 10 seconds', value: '*/10 * * * * *' },
  { label: 'Daily midnight', value: '0 0 0 * * ?' },
  { label: 'Every 15 min', value: '0 */15 * * * ?' },
  { label: 'Weekdays 9am', value: '0 0 9 * * 1-5' },
];
