'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Play, Trash2, Copy, Download, Check, ChevronDown, ChevronUp, ChevronRight, ArrowUpDown, Maximize2, Minimize2 } from 'lucide-react';
import { analyzeCode } from './complexityAnalyzer/complexityEngine';
import { detectFromExtension, detectFromCode } from './complexityAnalyzer/languageDetector';
import {
  ACCEPTED_EXTENSIONS, LANGUAGE_DISPLAY_NAMES, RISK_BADGE_CLASSES,
  MAX_FILE_SIZE_BYTES, SAMPLE_CODE
} from './complexityAnalyzer/complexityConstants';
import type {
  SupportedLanguage, FunctionResult, AnalysisResult,
  SortColumn, SortDirection
} from './complexityAnalyzer/complexityTypes';
import { trackEvent, GA_EVENTS } from '../../lib/analytics';

// ── Risk badge ────────────────────────────────────────────────────────────────
function RiskBadge({ riskLevel }: { riskLevel: FunctionResult['riskLevel'] }) {
  const classes = RISK_BADGE_CLASSES[riskLevel];
  if (!classes) {
    return <span className="text-neutral-300 font-mono text-xs">{riskLevel}</span>;
  }
  return (
    <span className={`${classes} font-mono text-xs px-2 py-0.5 rounded`}>
      {riskLevel}
    </span>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getSummary(results: FunctionResult[]) {
  const counts: Record<FunctionResult['riskLevel'], number> = { Low: 0, Medium: 0, High: 0, Critical: 0 };
  let highestCyclomatic = results[0];
  for (const r of results) {
    counts[r.riskLevel]++;
    if (r.cyclomatic > highestCyclomatic.cyclomatic) highestCyclomatic = r;
  }
  return { counts, highestCyclomatic };
}

function getSortedResults(results: FunctionResult[], sortColumn: SortColumn | null, sortDirection: SortDirection): FunctionResult[] {
  if (!sortColumn) return results;
  return [...results].sort((a, b) => {
    let cmp = 0;
    if (sortColumn === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortColumn === 'cyclomatic') cmp = a.cyclomatic - b.cyclomatic;
    else if (sortColumn === 'cognitive') cmp = a.cognitive - b.cognitive;
    else if (sortColumn === 'risk') {
      const order: Record<FunctionResult['riskLevel'], number> = { Low: 0, Medium: 1, High: 2, Critical: 3 };
      cmp = order[a.riskLevel] - order[b.riskLevel];
    }
    return sortDirection === 'asc' ? cmp : -cmp;
  });
}

// ── Sort icon ────────────────────────────────────────────────────────────────
function SortIcon({ col, sortColumn, sortDirection }: { col: SortColumn; sortColumn: SortColumn | null; sortDirection: SortDirection }) {
  if (sortColumn !== col) return <ArrowUpDown className="w-3 h-3 opacity-40" />;
  return sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
}

// ── Main component ─────────────────────────────────────────────────────────────
export const CodeComplexityAnalyzerTool: React.FC = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<SupportedLanguage>('javascript');
  const [languageAssumed, setLanguageAssumed] = useState(false);
  const [manualLanguage, setManualLanguage] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [copyErrorMsg, setCopyErrorMsg] = useState<string | null>(null);
  const [fallbackJson, setFallbackJson] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [isFullScreen, setIsFullScreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ── Fullscreen: Escape key + body scroll lock ────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsFullScreen(false); };
    const nav = document.querySelector('header') as HTMLElement | null;
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
      if (nav) nav.style.display = 'none';
      window.addEventListener('keydown', onKey);
    } else {
      document.body.style.overflow = '';
      if (nav) nav.style.display = '';
    }
    return () => {
      document.body.style.overflow = '';
      const n = document.querySelector('header') as HTMLElement | null;
      if (n) n.style.display = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isFullScreen]);

  // ── Code change / language detection ────────────────────────────────────────
  const handleCodeChange = (value: string) => {
    setCode(value);
    setUploadError(null);
    if (!manualLanguage) {
      const { language: detected, assumed } = detectFromCode(value);
      setLanguage(detected);
      setLanguageAssumed(assumed);
    }
  };

  // ── File upload ──────────────────────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setUploadError(`File type "${ext}" is not supported. Accepted: ${ACCEPTED_EXTENSIONS.join(', ')}`);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError(`File is too large (${(file.size / 1024).toFixed(0)} KB). Maximum allowed size is 500 KB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result;
      if (typeof content !== 'string') {
        setUploadError('Cannot read file — binary or unreadable encoding not supported.');
        return;
      }
      if (content.includes('\0')) {
        setUploadError('Cannot read file — binary files are not supported.');
        return;
      }
      setCode(content);
      setUploadError(null);
      const detectedLang = detectFromExtension(file.name);
      if (detectedLang) {
        setLanguage(detectedLang);
        setLanguageAssumed(false);
      }
    };
    reader.onerror = () => {
      setUploadError('Cannot read file — binary or unreadable encoding not supported.');
    };
    reader.readAsText(file);
  };

  // ── Analyze ──────────────────────────────────────────────────────────────────
  const runAnalysis = useCallback((codeInput: string, lang: SupportedLanguage) => {
    setAnalyzing(true);
    setAnalyzeError(null);
    setAnalysisResult(null);
    setExpandedRows(new Set());
    setSortColumn(null);
    setTimeout(() => {
      try {
        const result = analyzeCode(codeInput, lang);
        setAnalysisResult(result);
        if (result.partial && result.errorMessage) {
          setAnalyzeError(result.errorMessage);
        }
      } catch (err) {
        setAnalyzeError(err instanceof Error ? err.message : 'Analysis failed.');
      } finally {
        setAnalyzing(false);
      }
    }, 0);
  }, []);

  const handleAnalyze = useCallback(() => {
    if (!code.trim()) return;
    trackEvent(GA_EVENTS.TOOL_ACTION, { tool_name: 'code_complexity_analyzer', action: 'analyze' });
    runAnalysis(code, language);
  }, [code, language, runAnalysis]);

  // ── Language selector ────────────────────────────────────────────────────────
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    setManualLanguage(true);
    setLanguageAssumed(false);
    if (analysisResult !== null && code.trim()) {
      runAnalysis(code, newLang);
    }
  };

  // ── Load Sample ──────────────────────────────────────────────────────────────
  const handleLoadSample = () => {
    setCode(SAMPLE_CODE);
    setLanguage('javascript');
    setLanguageAssumed(false);
    setManualLanguage(false);
    setAnalysisResult(null);
    setUploadError(null);
    setAnalyzeError(null);
    setExpandedRows(new Set());
    setSortColumn(null);
    trackEvent(GA_EVENTS.TOOL_ACTION, { tool_name: 'code_complexity_analyzer', action: 'load_sample' });
  };

  // ── Clear ────────────────────────────────────────────────────────────────────
  const handleClear = () => {
    setCode('');
    setLanguage('javascript');
    setLanguageAssumed(false);
    setManualLanguage(false);
    setAnalysisResult(null);
    setUploadError(null);
    setAnalyzeError(null);
    setCopyState('idle');
    setCopyErrorMsg(null);
    setFallbackJson(null);
    setExpandedRows(new Set());
    setSortColumn(null);
    trackEvent(GA_EVENTS.TOOL_ACTION, { tool_name: 'code_complexity_analyzer', action: 'clear' });
  };

  // ── Sorting ──────────────────────────────────────────────────────────────────
  const handleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  // ── Copy JSON ────────────────────────────────────────────────────────────────
  const handleCopyJson = async () => {
    if (!analysisResult || analysisResult.results.length === 0) return;
    trackEvent(GA_EVENTS.TOOL_ACTION, { tool_name: 'code_complexity_analyzer', action: 'copy_json' });

    const json = JSON.stringify(analysisResult.results.map(r => ({
      name: r.name,
      startLine: r.startLine,
      endLine: r.endLine,
      cyclomatic: r.cyclomatic,
      cognitive: r.cognitive,
      riskLevel: r.riskLevel,
      suggestions: r.suggestions.map(s => s.text),
    })), null, 2);

    if (!navigator.clipboard) {
      setFallbackJson(json);
      return;
    }

    try {
      await navigator.clipboard.writeText(json);
      setCopyState('copied');
      setFallbackJson(null);
      setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setCopyState('error');
      setCopyErrorMsg('Copy failed. Use the text area below to copy manually.');
      setFallbackJson(json);
    }
  };

  // ── Download CSV ─────────────────────────────────────────────────────────────
  const handleDownloadCsv = () => {
    if (!analysisResult || analysisResult.results.length === 0) return;
    trackEvent(GA_EVENTS.TOOL_ACTION, { tool_name: 'code_complexity_analyzer', action: 'download_csv' });

    const headers = ['Function Name', 'Start Line', 'End Line', 'Cyclomatic', 'Cognitive', 'Risk Level', 'Suggestions'];
    const escape = (val: string | number) => {
      const s = String(val);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const rows = analysisResult.results.map(r => [
      escape(r.name),
      escape(r.startLine),
      escape(r.endLine),
      escape(r.cyclomatic),
      escape(r.cognitive),
      escape(r.riskLevel),
      escape(r.suggestions.map(s => s.text).join('; ')),
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const ts = new Date().toISOString().replace(/[-:]/g, '').replace('T', 'T').slice(0, 15);
    const filename = `complexity-report-${ts}.csv`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Suggestions toggle ───────────────────────────────────────────────────────
  const toggleRow = (idx: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  // ── Derived state ─────────────────────────────────────────────────────────────
  const hasResults = analysisResult !== null;
  const results = analysisResult?.results ?? [];
  const sortedResults = getSortedResults(results, sortColumn, sortDirection);
  const hasNoFunctions = hasResults && results.length === 0;
  const canExport = hasResults && results.length > 0;

  // ── Sort header helper — component defined above to satisfy lint ─────────────

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className={`bg-neutral-950 border border-neutral-800 text-neutral-100 flex flex-col ${
      isFullScreen
        ? 'fixed inset-0 z-[9999] rounded-none overflow-hidden'
        : 'w-full rounded-lg overflow-hidden shadow-xl'
    }`}>

      {/* ── TOOLBAR (FIRST ELEMENT) ── */}
      <div className={`px-3 py-2 bg-neutral-900 border-b border-neutral-800 flex flex-wrap items-center gap-2 text-xs font-mono shrink-0 ${
        isFullScreen ? 'sticky top-0 z-[10000]' : ''
      }`}>

        {/* Analyze */}
        <button
          onClick={handleAnalyze}
          disabled={!code.trim() || analyzing}
          className="px-3 py-1.5 rounded bg-[#1D9BF0] hover:bg-[#1a8cd8] text-white font-semibold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Analyze code complexity"
        >
          {analyzing ? (
            <span className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full" />
          ) : (
            <Play className="w-3 h-3" />
          )}
          <span>{analyzing ? 'Analyzing…' : 'Analyze'}</span>
        </button>

        {/* Language selector */}
        <div className="flex items-center gap-1.5">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
            className="px-2 py-1.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-mono focus:outline-none focus:border-neutral-500 cursor-pointer"
            aria-label="Select programming language"
          >
            {(Object.entries(LANGUAGE_DISPLAY_NAMES) as [SupportedLanguage, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          {languageAssumed && !manualLanguage && (
            <span className="text-neutral-500 text-[11px] font-mono italic">(assumed)</span>
          )}
        </div>

        {/* Upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          aria-label="Upload a source file"
        >
          <Upload className="w-3.5 h-3.5" /><span>Upload</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          onChange={handleFileUpload}
          aria-hidden="true"
        />

        {/* Load Sample */}
        <button
          onClick={handleLoadSample}
          className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          aria-label="Load sample code"
        >
          <span>Load Sample</span>
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Copy JSON */}
        <button
          onClick={handleCopyJson}
          disabled={!canExport}
          className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Copy results as JSON"
        >
          {copyState === 'copied' ? (
            <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Copied ✓</span></>
          ) : (
            <><Copy className="w-3.5 h-3.5" /><span>Copy JSON</span></>
          )}
        </button>

        {/* Download CSV */}
        <button
          onClick={handleDownloadCsv}
          disabled={!canExport}
          className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Download results as CSV"
        >
          <Download className="w-3.5 h-3.5" /><span>Download CSV</span>
        </button>

        {/* Clear */}
        <button
          onClick={handleClear}
          disabled={!code && !hasResults}
          className="px-2.5 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Clear input and results"
        >
          <Trash2 className="w-3.5 h-3.5" /><span>Clear</span>
        </button>

        {/* Fullscreen toggle */}
        <button
          onClick={() => setIsFullScreen(f => !f)}
          className="px-2 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center transition-colors cursor-pointer ml-1"
          aria-label={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          title={isFullScreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
        >
          {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ── ERRORS ── */}
      {uploadError && (
        <div className="px-4 py-2 bg-red-950 border-b border-red-900 text-red-400 font-mono text-xs">
          {uploadError}
        </div>
      )}
      {analyzeError && (
        <div className="px-4 py-2 bg-amber-950 border-b border-amber-900 text-amber-400 font-mono text-xs">
          ⚠ Partial analysis: {analyzeError}
        </div>
      )}

      {/* ── CODE INPUT ── */}
      <div className={`border-b border-neutral-800 ${isFullScreen ? 'shrink-0' : ''}`}>
        <textarea
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          placeholder={`Paste source code here (.js .ts .jsx .tsx .py .java .go .c .cpp .h .hpp) or click Upload…`}
          spellCheck={false}
          style={{ height: isFullScreen ? '40vh' : '22rem' }}
          className="w-full p-4 font-mono text-xs bg-neutral-950 text-neutral-200 resize-none focus:outline-none placeholder-neutral-700 leading-[1.6]"
          aria-label="Source code input"
        />
      </div>

      {/* ── RESULTS AREA ── */}
      <div className={`p-4 bg-neutral-950 ${isFullScreen ? 'flex-1 overflow-y-auto' : ''}`}>

        {/* State 1: No analysis run yet */}
        {!hasResults && !analyzing && (
          <div className="py-10 text-center">
            <p className="font-mono text-sm text-neutral-600">Paste or upload code, then click Analyze.</p>
          </div>
        )}

        {/* Analyzing spinner */}
        {analyzing && (
          <div className="py-10 text-center">
            <div className="inline-flex items-center gap-2 font-mono text-sm text-neutral-400">
              <span className="animate-spin w-4 h-4 border border-neutral-400 border-t-transparent rounded-full" />
              Analyzing…
            </div>
          </div>
        )}

        {/* Results */}
        {hasResults && !analyzing && (
          <>
            {/* Summary bar */}
            {results.length > 0 && (() => {
              const { counts, highestCyclomatic } = getSummary(results);
              return (
                <div className="mb-3 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded text-xs font-mono text-neutral-400 flex flex-wrap gap-3 items-center">
                  <span className="text-neutral-200 font-semibold">{results.length} function{results.length !== 1 ? 's' : ''}</span>
                  {(['Low', 'Medium', 'High', 'Critical'] as const).map(level => counts[level] > 0 && (
                    <span key={level} className={`${RISK_BADGE_CLASSES[level]} px-1.5 py-0.5 rounded text-[11px]`}>
                      {level}: {counts[level]}
                    </span>
                  ))}
                  <span className="text-neutral-500">·</span>
                  <span>Highest: <span className="text-neutral-200">{highestCyclomatic.name}</span> (cyclomatic: <span className="font-mono text-neutral-200">{highestCyclomatic.cyclomatic}</span>)</span>
                </div>
              );
            })()}

            {/* Results table */}
            <div className="overflow-x-auto border border-neutral-800 rounded">
              <table className="w-full border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 text-left">
                    <th
                      className="px-3 py-2 cursor-pointer select-none hover:text-neutral-200 transition-colors whitespace-nowrap"
                      onClick={() => handleSort('name')}
                      aria-sort={sortColumn === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      <span className="flex items-center gap-1">Function Name <SortIcon col="name" sortColumn={sortColumn} sortDirection={sortDirection} /></span>
                    </th>
                    <th className="px-3 py-2 whitespace-nowrap text-neutral-500">Lines</th>
                    <th
                      className="px-3 py-2 cursor-pointer select-none hover:text-neutral-200 transition-colors whitespace-nowrap"
                      onClick={() => handleSort('cyclomatic')}
                      aria-sort={sortColumn === 'cyclomatic' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      <span className="flex items-center gap-1">Cyclomatic <SortIcon col="cyclomatic" sortColumn={sortColumn} sortDirection={sortDirection} /></span>
                    </th>
                    <th
                      className="px-3 py-2 cursor-pointer select-none hover:text-neutral-200 transition-colors whitespace-nowrap"
                      onClick={() => handleSort('cognitive')}
                      aria-sort={sortColumn === 'cognitive' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      <span className="flex items-center gap-1">Cognitive <SortIcon col="cognitive" sortColumn={sortColumn} sortDirection={sortDirection} /></span>
                    </th>
                    <th
                      className="px-3 py-2 cursor-pointer select-none hover:text-neutral-200 transition-colors whitespace-nowrap"
                      onClick={() => handleSort('risk')}
                      aria-sort={sortColumn === 'risk' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      <span className="flex items-center gap-1">Risk Level <SortIcon col="risk" sortColumn={sortColumn} sortDirection={sortDirection} /></span>
                    </th>
                    <th className="px-3 py-2 text-neutral-500">Suggestions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Zero-functions state */}
                  {hasNoFunctions && (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-neutral-500">
                        No functions detected. Check that the selected language matches your code.
                      </td>
                    </tr>
                  )}

                  {/* Result rows */}
                  {sortedResults.map((result, idx) => {
                    const isExpanded = expandedRows.has(idx);
                    return (
                      <React.Fragment key={`${result.name}-${result.startLine}`}>
                        <tr className="border-t border-neutral-800 bg-neutral-900 hover:bg-neutral-800 transition-colors">
                          <td className="px-3 py-2 text-neutral-200 max-w-[200px] truncate" title={result.name}>
                            {result.name}
                          </td>
                          <td className="px-3 py-2 font-mono text-neutral-400">
                            {result.startLine}–{result.endLine}
                          </td>
                          <td className="px-3 py-2 font-mono text-neutral-200 tabular-nums">
                            {result.cyclomatic}
                          </td>
                          <td className="px-3 py-2 font-mono text-neutral-200 tabular-nums">
                            {result.cognitive}
                          </td>
                          <td className="px-3 py-2">
                            <RiskBadge riskLevel={result.riskLevel} />
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => toggleRow(idx)}
                              className="flex items-center gap-1 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                              aria-expanded={isExpanded}
                              aria-label={`${isExpanded ? 'Collapse' : 'Expand'} suggestions for ${result.name}`}
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                              <span className="text-[11px]">{result.suggestions.length} suggestion{result.suggestions.length !== 1 ? 's' : ''}</span>
                            </button>
                          </td>
                        </tr>

                        {/* Suggestions row */}
                        {isExpanded && (
                          <tr className="border-t border-neutral-800 bg-neutral-950">
                            <td colSpan={6} className="px-4 py-2">
                              {result.suggestions.length === 0 ? (
                                <p className="text-neutral-600 text-[11px] font-mono italic">No suggestions</p>
                              ) : (
                                <ul className="space-y-1">
                                  {result.suggestions.map((s, si) => (
                                    <li key={si} className="flex items-start gap-2 text-[11px] font-mono text-neutral-300">
                                      <span className="text-neutral-600 shrink-0">→</span>
                                      <span>{s.text}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Clipboard error message */}
        {copyState === 'error' && copyErrorMsg && (
          <div className="mt-2 text-red-400 font-mono text-[11px]">{copyErrorMsg}</div>
        )}

        {/* Fallback JSON textarea */}
        {fallbackJson && (
          <div className="mt-3">
            <p className="text-neutral-500 font-mono text-[11px] mb-1">Copy JSON manually:</p>
            <textarea
              readOnly
              value={fallbackJson}
              rows={8}
              className="w-full p-3 font-mono text-xs bg-neutral-900 border border-neutral-800 text-neutral-300 rounded resize-none focus:outline-none"
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              aria-label="JSON output for manual copying"
            />
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="px-4 py-2 bg-neutral-900 border-t border-neutral-800 flex items-center justify-end">
        <span className="text-neutral-500 font-mono text-[11px]">Client-Side · No Upload</span>
      </div>

    </div>
  );
};
