import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bot, Sparkles, RefreshCw, Code2, Cpu, Wrench } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';

export const AIPlatformDemo: React.FC = () => {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState(`// Unoptimized Express Route
app.get('/api/users/:id', async (req, res) => {
  const user = await db.query('SELECT * FROM users WHERE id = ' + req.params.id); // SQL Injection!
  const posts = await db.query('SELECT * FROM posts WHERE user_id = ' + req.params.id);
  res.json({ user, posts });
});`);

  const [mode, setMode] = useState<'optimize' | 'explain' | 'fix'>('optimize');
  const [isThinking, setIsThinking] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const sampleResponses = {
    optimize: `// ⚡ MINDLOOP CODE OPTIMIZATION
// 1. Replaced unsafe SQL string concatenation with parameterized queries.
// 2. Converted sequential async queries into parallel execution via Promise.all().
// 3. Added input validation & explicit field selection.

import { z } from 'zod';

const UserIdSchema = z.string().uuid();

app.get('/api/users/:id', async (req, res) => {
  const userId = UserIdSchema.parse(req.params.id);

  const [userResult, postsResult] = await Promise.all([
    db.query('SELECT id, name, email FROM users WHERE id = $1', [userId]),
    db.query('SELECT id, title, created_at FROM posts WHERE user_id = $1', [userId])
  ]);

  res.setHeader('Cache-Control', 'private, max-age=60');
  res.json({ user: userResult.rows[0], posts: postsResult.rows });
});`,
    explain: `// 🧠 ARCHITECTURE & SECURITY ANALYSIS
1. VULNERABILITY: Direct string concatenation enables SQL Injection.
2. LATENCY: Sequential 'await' calls double request resolution time.
3. SECURITY RISK: 'SELECT *' exposes sensitive or internal table columns.

RECOMMENDED REFACTOR: Parameterized queries + Promise.all() + Input validation.`,
    fix: `// 🛠️ AUTOMATED BUG & SECURITY REPAIR
- Input Sanitization: Wrapped parameter with schema check.
- Query Execution: Replaced raw string concatenation with SQL parameter bindings ($1).
- Performance: Batched database calls to execute concurrently.`
  };

  const handleRunAI = (selectedMode: 'optimize' | 'explain' | 'fix') => {
    setMode(selectedMode);
    setIsThinking(true);
    setResponse(null);

    setTimeout(() => {
      setIsThinking(false);
      setResponse(sampleResponses[selectedMode]);
    }, 600);
  };

  return (
    <section className="py-16 lg:py-20 bg-app border-b border-theme-subtle relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="max-w-3xl mb-12 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#1D9BF0] font-normal block">
            {t('aiPlayground.title', 'MindLoop AI Playground')}
          </span>
          <h2 className="text-h1 text-theme-main font-bold">
            Interactive Code & Workflow Engine
          </h2>
          <p className="text-body-large text-theme-muted font-normal">
            {t('aiPlayground.subtitle', 'Test our AI engine directly in your browser. Choose an optimization or security mode to see real-time code transformations.')}
          </p>
        </div>

        {/* AI Playground Layout - Constrained max-w-4xl Container */}
        <div className="max-w-4xl mx-auto my-8 border border-theme-subtle p-6 sm:p-8 space-y-6 bg-surface">
          {/* Action Bar with Underline State Indicators */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-theme-subtle">
            <span className="text-xs font-mono text-theme-muted">
              {t('aiPlayground.promptLabel', 'Sample Code Input:')}
            </span>

            <div className="flex flex-wrap items-center gap-6">
              <button
                onClick={() => handleRunAI('optimize')}
                className={`text-xs font-mono uppercase tracking-wider pb-1 transition-all cursor-pointer ${
                  mode === 'optimize' ? 'text-theme-main border-b-2 border-[#1D9BF0] font-medium' : 'text-theme-muted hover:text-theme-main'
                }`}
              >
                {t('aiPlayground.btnOptimize', 'Optimize Code')}
              </button>
              <button
                onClick={() => handleRunAI('explain')}
                className={`text-xs font-mono uppercase tracking-wider pb-1 transition-all cursor-pointer ${
                  mode === 'explain' ? 'text-theme-main border-b-2 border-[#1D9BF0] font-medium' : 'text-theme-muted hover:text-theme-main'
                }`}
              >
                {t('aiPlayground.btnExplain', 'Explain Security')}
              </button>
              <button
                onClick={() => handleRunAI('fix')}
                className={`text-xs font-mono uppercase tracking-wider pb-1 transition-all cursor-pointer ${
                  mode === 'fix' ? 'text-theme-main border-b-2 border-[#1D9BF0] font-medium' : 'text-theme-muted hover:text-theme-main'
                }`}
              >
                {t('aiPlayground.btnFixBug', 'Fix Vulnerabilities')}
              </button>
            </div>
          </div>

          {/* Textarea Input */}
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            className="w-full bg-app border border-theme-subtle p-4 font-mono text-xs text-theme-main focus:outline-none focus:border-[#1D9BF0] leading-relaxed"
            placeholder={t('aiPlayground.placeholder', '// Paste code here...')}
          />

          {/* Output Console Area */}
          <div className="pt-4 border-t border-theme-subtle space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-theme-muted">
              <span>{t('aiPlayground.responseHeader', 'MindLoop AI Output')}</span>
            </div>

            {isThinking ? (
              <div className="p-6 bg-app border border-theme-subtle flex items-center justify-center gap-3 text-xs text-[#1D9BF0] font-mono">
                <RefreshCw className="w-4 h-4 animate-spin text-[#1D9BF0]" />
                <span>{t('aiPlayground.thinkingMsg', 'Analyzing code structure...')}</span>
              </div>
            ) : response ? (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-app border border-theme-subtle font-mono text-xs text-[#1D9BF0] overflow-x-auto leading-relaxed"
              >
                <pre>{response}</pre>
              </motion.div>
            ) : (
              <div className="p-4 bg-app border border-theme-subtle text-xs text-theme-muted font-mono italic">
                Select an AI action above to run analysis...
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
