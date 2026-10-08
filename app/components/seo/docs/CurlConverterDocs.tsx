'use client';

import React from 'react';

export const CurlConverterDocs: React.FC = () => {
  return (
    <div className="space-y-10 text-theme-main">
      {/* Target Language Mapping Table */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          Supported Target Languages & HTTP Libraries
        </h2>
        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
          Convert raw terminal <code className="text-xs font-mono bg-neutral-900 px-1.5 py-0.5 rounded border border-theme-subtle">curl</code> commands copied from Chrome/Firefox DevTools, Postman, or API documentation into ready-to-run client code:
        </p>

        <div className="overflow-x-auto rounded-lg border border-theme-subtle bg-surface">
          <table className="w-full text-left text-xs sm:text-sm font-mono divide-y divide-theme-subtle">
            <thead className="bg-neutral-900/60 text-theme-muted text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Target Language</th>
                <th className="px-4 py-2.5 font-semibold">Library / Standard</th>
                <th className="px-4 py-2.5 font-semibold">Primary Use Case</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-subtle text-theme-muted">
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-theme-main">JavaScript</td>
                <td className="px-4 py-2.5 text-blue-400">Fetch API / Axios</td>
                <td className="px-4 py-2.5">Modern web frontend, React, Vue, Next.js API calls</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-theme-main">Node.js</td>
                <td className="px-4 py-2.5 text-green-400">node-fetch / native fetch</td>
                <td className="px-4 py-2.5">Backend services, Express.js, serverless lambdas</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-theme-main">Python</td>
                <td className="px-4 py-2.5 text-yellow-400">requests / httpx</td>
                <td className="px-4 py-2.5">Data scraping, automation scripts, Django, FastAPI</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-theme-main">PHP</td>
                <td className="px-4 py-2.5 text-purple-400">curl_init / Guzzle</td>
                <td className="px-4 py-2.5">WordPress plugins, Laravel controllers, legacy integrations</td>
              </tr>
              <tr className="hover:bg-neutral-900/40">
                <td className="px-4 py-2.5 font-medium text-theme-main">Go (Golang)</td>
                <td className="px-4 py-2.5 text-cyan-400">net/http</td>
                <td className="px-4 py-2.5">Microservices, high-performance CLI tools, background workers</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Code Examples: Python & JavaScript */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          Common Conversion Examples
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
          {/* Example 1 */}
          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2.5">
            <h3 className="font-semibold text-sm text-theme-main flex items-center justify-between">
              <span>cURL POST to Python Requests</span>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-theme-subtle">Python</span>
            </h3>
            <p className="text-theme-muted text-xs">
              Converts <code className="bg-neutral-900 px-1 rounded">-X POST</code> with JSON headers and <code className="bg-neutral-900 px-1 rounded">-d</code> payload into a clean <code className="text-yellow-400">requests.post()</code> dictionary:
            </p>
            <div className="p-3 bg-neutral-950 rounded border border-theme-subtle font-mono text-[11px] overflow-x-auto text-neutral-300 space-y-1">
              <p><span className="text-purple-400">import</span> requests</p>
              <p>headers = &#123;<span className="text-green-300">&quot;Authorization&quot;</span>: <span className="text-green-300">&quot;Bearer YOUR_TOKEN&quot;</span>&#125;</p>
              <p>payload = &#123;<span className="text-green-300">&quot;query&quot;</span>: <span className="text-green-300">&quot;data&quot;</span>&#125;</p>
              <p>res = requests.post(<span className="text-green-300">&quot;https://api.example.com/v1&quot;</span>, json=payload, headers=headers)</p>
            </div>
          </div>

          {/* Example 2 */}
          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2.5">
            <h3 className="font-semibold text-sm text-theme-main flex items-center justify-between">
              <span>cURL to JavaScript Fetch / Axios</span>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-theme-subtle">JavaScript</span>
            </h3>
            <p className="text-theme-muted text-xs">
              Handles URL query parameters, async/await wrappers, error handling, and JSON serialization:
            </p>
            <div className="p-3 bg-neutral-950 rounded border border-theme-subtle font-mono text-[11px] overflow-x-auto text-neutral-300 space-y-1">
              <p><span className="text-purple-400">const</span> response = <span className="text-purple-400">await</span> fetch(<span className="text-green-300">&apos;https://api.example.com/v1&apos;</span>, &#123;</p>
              <p>&nbsp;&nbsp;method: <span className="text-green-300">&apos;POST&apos;</span>,</p>
              <p>&nbsp;&nbsp;headers: &#123; <span className="text-green-300">&apos;Content-Type&apos;</span>: <span className="text-green-300">&apos;application/json&apos;</span> &#125;,</p>
              <p>&nbsp;&nbsp;body: JSON.stringify(&#123; query: <span className="text-green-300">&apos;data&apos;</span> &#125;)</p>
              <p>&#125;);</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical FAQ specific to query intents */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          cURL Conversion Reference & FAQ
        </h2>
        
        <div className="space-y-3 text-xs sm:text-sm text-theme-muted">
          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-1.5">
            <h3 className="font-semibold text-theme-main">How does client-side cURL parsing preserve API key security?</h3>
            <p className="leading-relaxed">
              When copying cURL commands from browser DevTools, the command string frequently contains production Bearer tokens, session cookies, and private API keys. Unlike cloud-based converters that transmit your raw command over HTTP, C³ MindLoop tokenizes and transforms your cURL strings 100% locally in your browser memory via WebAssembly/JavaScript. No credentials ever touch a remote server.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-1.5">
            <h3 className="font-semibold text-theme-main">Which cURL command flags are supported?</h3>
            <p className="leading-relaxed">
              The converter supports all standard HTTP flags: <code className="font-mono bg-neutral-900 px-1 py-0.5 rounded">-X / --request</code> (GET, POST, PUT, PATCH, DELETE), <code className="font-mono bg-neutral-900 px-1 py-0.5 rounded">-H / --header</code>, <code className="font-mono bg-neutral-900 px-1 py-0.5 rounded">-d / --data / --data-raw / --data-binary</code>, <code className="font-mono bg-neutral-900 px-1 py-0.5 rounded">-u / --user</code> (Basic Authentication), and URL query parameters.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
