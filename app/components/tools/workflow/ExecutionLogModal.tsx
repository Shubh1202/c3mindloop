'use client';

import React, { useState } from 'react';
import { WorkflowExecutionReport } from '../../../lib/workflow/types';
import {
  X,
  Copy,
  Check,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  MinusCircle,
} from 'lucide-react';

interface ExecutionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: WorkflowExecutionReport | null;
}

export const ExecutionLogModal: React.FC<ExecutionLogModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !report) return null;

  const handleCopyReport = () => {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownloadReport = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindloop-execution-${report.pipelineId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl rounded-lg border border-theme-subtle bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[85vh] font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-neutral-950 border-b border-theme-subtle select-none">
          <div className="flex items-center gap-3">
            <Layers className="w-4 h-4 text-[#1D9BF0]" />
            <h2 className="text-sm font-semibold text-theme-main">
              Execution Log & Audit Trace
            </h2>
            <span
              className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                report.success
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-red-950 text-red-400 border border-red-800'
              }`}
            >
              {report.success ? 'Success' : 'Pipeline Failed'}
            </span>
            <span className="text-neutral-500 text-[11px]">
              Total Time: {report.totalDurationMs}ms
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-theme-main transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Error Banner if failed */}
        {report.error && (
          <div className="px-4 py-2 bg-red-950/60 border-b border-red-800/60 text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{report.error}</span>
          </div>
        )}

        {/* Log Entries Table */}
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-theme-subtle text-neutral-500 text-[10px] uppercase tracking-wider">
                <th className="pb-2 pl-2">Step / Node</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Duration</th>
                <th className="pb-2">Input / Output Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle/40">
              {report.logs.map((log, idx) => (
                <tr key={log.id} className="hover:bg-neutral-900/40">
                  <td className="py-2.5 pl-2 font-semibold text-theme-main">
                    <div className="truncate max-w-[140px]">{log.nodeLabel}</div>
                    <div className="text-[10px] text-neutral-500">{log.nodeId}</div>
                  </td>
                  <td className="py-2.5 text-neutral-400">{log.nodeType}</td>
                  <td className="py-2.5">
                    {log.status === 'success' && (
                      <span className="inline-flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Success</span>
                      </span>
                    )}
                    {log.status === 'error' && (
                      <span className="inline-flex items-center gap-1 text-red-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Cracked</span>
                      </span>
                    )}
                    {log.status === 'skipped' && (
                      <span className="inline-flex items-center gap-1 text-neutral-500">
                        <MinusCircle className="w-3.5 h-3.5" />
                        <span>Skipped</span>
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-neutral-400">{log.durationMs}ms</td>
                  <td className="py-2.5 text-neutral-300">
                    {log.error ? (
                      <div className="text-red-400 font-semibold">{log.error}</div>
                    ) : (
                      <div className="space-y-0.5 text-[11px]">
                        {log.outputSummary && (
                          <div className="truncate max-w-xs text-emerald-300">
                            → {log.outputSummary}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-2.5 bg-neutral-950 border-t border-theme-subtle flex items-center justify-between text-neutral-400">
          <span>{report.logs.length} step(s) recorded in browser memory.</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyReport}
              className="px-2.5 py-1 rounded border border-theme-subtle hover:text-theme-main transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadReport}
              className="px-2.5 py-1 rounded bg-[#1D9BF0] text-white hover:bg-[#1a8cd8] transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Log</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
