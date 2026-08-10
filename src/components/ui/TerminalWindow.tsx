import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, Play, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';

export const TerminalWindow: React.FC = () => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState<0 | 1 | 2 | 3>(0);
  const [copied, setCopied] = useState(false);

  const steps = [
    {
      name: t('philosophySection.fourSteps.step1Title', '1. Think'),
      code: `// PHASE 1: THINK & ARCHITECT
const systemIntent = {
  problem: "Eliminate repetitive boilerplate & slow async queues",
  architecture: "Micro-SaaS Edge Gateway + AST Code Optimizer",
  philosophy: "MindLoop Continuous Cycle"
};`
    },
    {
      name: t('philosophySection.fourSteps.step2Title', '2. Build'),
      code: `// PHASE 2: BUILD & SHIP
import { MindLoopEngine } from '@cmindloop/core';

export async function deployProductionSaaS() {
  const app = new MindLoopEngine({ env: 'production' });
  await app.compile({ target: 'wasm-edge' });
  return app.listen(3000);
}`
    },
    {
      name: t('philosophySection.fourSteps.step3Title', '3. Learn'),
      code: `// PHASE 3: LEARN & EXTRACT WISDOM
app.on('uncaughtException', (bug) => {
  const learningInsight = mindloopAI.diagnoseRootCause(bug);
  mindloopAI.storeInsightInKnowledgeGraph(learningInsight);
});`
    },
    {
      name: t('philosophySection.fourSteps.step4Title', '4. Repeat'),
      code: `// PHASE 4: REPEAT & EVOLVE
async function mindLoopCycle() {
  while (developerMind.isThinking()) {
    await think();
    await build();
    await learn();
  }
}`
    }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(steps[activeStep].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-xl bg-surface border border-theme-subtle p-6 space-y-4">
      {/* Editorial Header & Step Selectors */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-theme-subtle pb-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {steps.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setActiveStep(idx as any)}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-all cursor-pointer ${
                activeStep === idx
                  ? 'bg-[#1D9BF0] text-white font-semibold'
                  : 'bg-app text-theme-muted hover:text-theme-main border border-theme-subtle'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-theme-muted hover:text-theme-main rounded-md bg-app border border-theme-subtle transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy Code'}</span>
        </button>
      </div>

      {/* Raw Code Block Without Mac Chrome */}
      <div className="p-4 rounded-lg bg-app border border-theme-subtle font-mono text-xs sm:text-sm text-theme-main leading-relaxed overflow-x-auto">
        <AnimatePresence mode="wait">
          <motion.pre
            key={activeStep}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <code>{steps[activeStep].code}</code>
          </motion.pre>
        </AnimatePresence>
      </div>
    </div>
  );
};
