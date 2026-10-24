'use client';

import React from 'react';
import { Link } from '../../../lib/router-compat';
import { ArrowRight, BookOpen } from 'lucide-react';

export const CronVisualizerDocs: React.FC = () => {
  return (
    <div className="space-y-10 text-theme-main">
      {/* Contextual Companion Guide */}
      <section className="p-4 sm:p-5 rounded-lg bg-surface border border-theme-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#1D9BF0] font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Companion Engineering Guide</span>
          </div>
          <h3 className="text-sm font-semibold text-theme-main">
            How to Check a Cron Expression Before You Schedule It
          </h3>
          <p className="text-xs text-theme-muted leading-relaxed">
            Practical reference for parsing Standard and Quartz cron expressions, verifying calculated runtimes, and checking timezone assumptions.
          </p>
        </div>
        <Link
          href="/guides/check-cron-expressions-before-scheduling"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#1D9BF0]/10 hover:bg-[#1D9BF0]/20 text-[#1D9BF0] border border-[#1D9BF0]/30 text-xs font-mono font-medium transition-colors shrink-0 self-start sm:self-auto"
        >
          <span>Read Guide</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          Standard 5-Field Cron Expression Cheatsheet
        </h2>
        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
          Cron schedules use five space-separated fields representing execution times:
        </p>

        <div className="overflow-x-auto rounded-lg border border-theme-subtle bg-surface">
          <table className="w-full text-left text-xs sm:text-sm font-mono divide-y divide-theme-subtle">
            <thead className="bg-neutral-900/60 text-theme-muted text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Field Position</th>
                <th className="px-4 py-2.5 font-semibold">Field Name</th>
                <th className="px-4 py-2.5 font-semibold">Allowed Values</th>
                <th className="px-4 py-2.5 font-semibold">Special Characters</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle text-theme-muted">
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-blue-400">1</td>
                <td className="px-4 py-2.5 text-theme-main">Minute</td>
                <td className="px-4 py-2.5">0 – 59</td>
                <td className="px-4 py-2.5">* , - /</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-blue-400">2</td>
                <td className="px-4 py-2.5 text-theme-main">Hour</td>
                <td className="px-4 py-2.5">0 – 23</td>
                <td className="px-4 py-2.5">* , - /</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-blue-400">3</td>
                <td className="px-4 py-2.5 text-theme-main">Day of Month</td>
                <td className="px-4 py-2.5">1 – 31</td>
                <td className="px-4 py-2.5">* , - / ? L W</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-blue-400">4</td>
                <td className="px-4 py-2.5 text-theme-main">Month</td>
                <td className="px-4 py-2.5">1 – 12 (or JAN – DEC)</td>
                <td className="px-4 py-2.5">* , - /</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-blue-400">5</td>
                <td className="px-4 py-2.5 text-theme-main">Day of Week</td>
                <td className="px-4 py-2.5">0 – 7 (0 or 7 = Sunday)</td>
                <td className="px-4 py-2.5">* , - / ? L #</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          Common Real-World Cron Schedule Presets
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-surface border border-theme-subtle space-y-1.5">
            <h3 className="font-semibold text-theme-main text-xs">Every 15 Minutes</h3>
            <p className="font-mono text-[11px] text-blue-400 bg-neutral-950 p-2 rounded border border-theme-subtle">
              */15 * * * *
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-surface border border-theme-subtle space-y-1.5">
            <h3 className="font-semibold text-theme-main text-xs">Every Midnight (00:00)</h3>
            <p className="font-mono text-[11px] text-green-400 bg-neutral-950 p-2 rounded border border-theme-subtle">
              0 0 * * *
            </p>
          </div>
          <div className="p-3.5 rounded-lg bg-surface border border-theme-subtle space-y-1.5">
            <h3 className="font-semibold text-theme-main text-xs">Every Monday at 9 AM</h3>
            <p className="font-mono text-[11px] text-yellow-400 bg-neutral-950 p-2 rounded border border-theme-subtle">
              0 9 * * 1
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
