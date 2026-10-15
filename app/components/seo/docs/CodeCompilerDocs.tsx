'use client';

import React from 'react';

export const CodeCompilerDocs: React.FC = () => {
  return (
    <div className="space-y-10 text-theme-main">
      {/* Language Support & Runtimes */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          Supported Programming Languages & Sandboxed Execution
        </h2>
        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
          The C³ MindLoop Online Code Compiler runs a multi-language hybrid execution engine. High-performance runtimes compile and execute your source code in an isolated environment with zero software installation required on your computer:
        </p>

        <div className="overflow-x-auto rounded-lg border border-theme-subtle bg-surface">
          <table className="w-full text-left text-xs sm:text-sm font-mono divide-y divide-theme-subtle">
            <thead className="bg-neutral-100 dark:bg-neutral-900/60 text-neutral-700 dark:text-theme-muted text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Language</th>
                <th className="px-4 py-2.5 font-semibold">Runtime / Compiler</th>
                <th className="px-4 py-2.5 font-semibold">Execution Mode</th>
                <th className="px-4 py-2.5 font-semibold">Default Entry Point</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle text-theme-muted">
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-blue-600 dark:text-blue-400">Python</td>
                <td className="px-4 py-2.5 text-theme-main">CPython 3.12 / 3.14</td>
                <td className="px-4 py-2.5">Native / Isolated Sandbox</td>
                <td className="px-4 py-2.5"><code className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800">main.py</code></td>
              </tr>
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-amber-600 dark:text-amber-400">JavaScript</td>
                <td className="px-4 py-2.5 text-theme-main">Node.js v20+ (V8 Engine)</td>
                <td className="px-4 py-2.5">High-Speed Local Runner</td>
                <td className="px-4 py-2.5"><code className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800">main.js</code></td>
              </tr>
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-red-600 dark:text-red-400">Java</td>
                <td className="px-4 py-2.5 text-theme-main">OpenJDK 21 LTS</td>
                <td className="px-4 py-2.5">Javac + JVM Container</td>
                <td className="px-4 py-2.5"><code className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800">Main.java</code></td>
              </tr>
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-purple-600 dark:text-purple-400">C</td>
                <td className="px-4 py-2.5 text-theme-main">GCC 13 / 14 (-lm)</td>
                <td className="px-4 py-2.5">Compiled Native Binary</td>
                <td className="px-4 py-2.5"><code className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800">main.c</code></td>
              </tr>
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-cyan-600 dark:text-cyan-400">C++</td>
                <td className="px-4 py-2.5 text-theme-main">G++ 14 (-std=c++17)</td>
                <td className="px-4 py-2.5">Compiled Native Binary</td>
                <td className="px-4 py-2.5"><code className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800">main.cpp</code></td>
              </tr>
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-indigo-600 dark:text-indigo-400">PHP</td>
                <td className="px-4 py-2.5 text-theme-main">PHP 8.3 (Zend Engine)</td>
                <td className="px-4 py-2.5">CLI / Isolated Sandbox</td>
                <td className="px-4 py-2.5"><code className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800">main.php</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Editor Features & Keyboard Shortcuts */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          Keyboard Shortcuts & IDE Productivity Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="font-semibold text-theme-main text-xs flex items-center justify-between">
              <span>Execute Code</span>
              <kbd className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-mono text-[10px] shadow-xs">
                Ctrl + Enter
              </kbd>
            </h3>
            <p className="text-theme-muted">
              Trigger instant code compilation and execution directly from the code editor without touching the mouse.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="font-semibold text-theme-main text-xs flex items-center justify-between">
              <span>Fullscreen Mode</span>
              <kbd className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-mono text-[10px] shadow-xs">
                Esc (Exit)
              </kbd>
            </h3>
            <p className="text-theme-muted">
              Expand the compiler into a distraction-free full-screen IDE experience. Press the Fullscreen button or hit Esc to return.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="font-semibold text-theme-main text-xs flex items-center justify-between">
              <span>Smart Indentation</span>
              <kbd className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-mono text-[10px] shadow-xs">
                Tab
              </kbd>
            </h3>
            <p className="text-theme-muted">
              Inserts a standard 2-space tab character instead of shifting focus away from the code editor area.
            </p>
          </div>
        </div>
      </section>

      {/* Standard Input & Terminal Architecture */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          Interactive Standard Input (stdin) & Terminal Streams
        </h2>
        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
          Interactive programs expecting user input (e.g. Python <code className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-300 border border-neutral-200 dark:border-neutral-800">input()</code>, C <code className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded text-purple-600 dark:text-purple-300 border border-neutral-200 dark:border-neutral-800">scanf()</code>, C++ <code className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded text-cyan-600 dark:text-cyan-300 border border-neutral-200 dark:border-neutral-800">cin</code>, Java <code className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded text-red-600 dark:text-red-300 border border-neutral-200 dark:border-neutral-800">Scanner</code>, or PHP <code className="bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-300 border border-neutral-200 dark:border-neutral-800">fgets(STDIN)</code>) are fully supported via the <strong>stdin</strong> toggle panel.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="font-semibold text-emerald-400 text-xs">Standard Output (stdout)</h3>
            <p className="text-theme-muted">
              Successful output is captured and rendered with clean green syntax highlighting in the terminal window, including runtime execution duration in milliseconds.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="font-semibold text-red-400 text-xs">Standard Error & Diagnostics (stderr)</h3>
            <p className="text-theme-muted">
              Syntax errors, compiler diagnostics, and uncaught runtime exceptions are isolated in a dedicated error panel with non-zero exit codes to make debugging effortless.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
