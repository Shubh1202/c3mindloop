'use client';

import React from 'react';

export const EventLoopDocs: React.FC = () => {
  return (
    <div className="space-y-10 text-theme-main">
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          JavaScript Event Loop: Task Queues & Execution Priority
        </h2>
        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
          The single-threaded JavaScript runtime coordinates synchronous execution and asynchronous callbacks using distinct task queues:
        </p>

        <div className="overflow-x-auto rounded-lg border border-theme-subtle bg-surface">
          <table className="w-full text-left text-xs sm:text-sm font-mono divide-y divide-theme-subtle">
            <thead className="bg-neutral-900/60 text-theme-muted text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Queue / Structure</th>
                <th className="px-4 py-2.5 font-semibold">Priority</th>
                <th className="px-4 py-2.5 font-semibold">Common APIs & Triggers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle text-theme-muted">
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-purple-400">Call Stack</td>
                <td className="px-4 py-2.5 text-purple-400 font-semibold">Immediate (Sync)</td>
                <td className="px-4 py-2.5">Synchronous function invocation, variable evaluations</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-green-400">Microtask Queue</td>
                <td className="px-4 py-2.5 text-green-400 font-semibold">Highest Async (Runs to completion)</td>
                <td className="px-4 py-2.5"><code className="text-neutral-300">Promise.then()</code>, <code className="text-neutral-300">async/await</code>, <code className="text-neutral-300">queueMicrotask()</code>, <code className="text-neutral-300">process.nextTick()</code></td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-blue-400">Macrotask (Task) Queue</td>
                <td className="px-4 py-2.5 text-blue-400 font-semibold">Standard Async (1 per loop tick)</td>
                <td className="px-4 py-2.5"><code className="text-neutral-300">setTimeout()</code>, <code className="text-neutral-300">setInterval()</code>, <code className="text-neutral-300">setImmediate()</code>, DOM I/O events</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
