'use client';

import React from 'react';

export const AiPromptBuilderDocs: React.FC = () => {
  return (
    <div className="space-y-10 text-theme-main">
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">
          Structured Prompt Engineering & Context Window Budgeting
        </h2>
        <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
          Large language models (LLMs) perform best when given clear separation between system instructions, contextual variables, constraints, and user input using XML markup delimiters:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="font-semibold text-theme-main text-xs text-blue-400">1. Role & Identity</h3>
            <p className="text-theme-muted">
              Define the AI model&apos;s persona, seniority level, and behavioral guardrails clearly in the system prompt.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="font-semibold text-theme-main text-xs text-green-400">2. XML Tag Context</h3>
            <p className="text-theme-muted">
              Wrap references inside <code className="bg-neutral-900 px-1 rounded">&lt;context&gt;</code> and <code className="bg-neutral-900 px-1 rounded">&lt;rules&gt;</code> tags to eliminate prompt injection risks.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
            <h3 className="font-semibold text-theme-main text-xs text-purple-400">3. Output Schema</h3>
            <p className="text-theme-muted">
              Specify exact JSON schemas or Markdown output constraints to avoid conversational filler.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
