'use client';

import React, { useState } from 'react';
import { Cpu, LayoutGrid, CloudLightning, FileCode, Layers, Zap, FlaskConical, ArrowUpRight, Terminal, Code2, ShieldCheck, Database, Sparkles, Columns2, GitBranch } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { PRODUCTS_LIST } from '../lib/constants';
import { Modal } from '../components/ui/Modal';
import { Product } from '../types';
import { CTASection } from '../components/sections/CTASection';
import { VSCodeExtensionCard } from '../components/sections/VSCodeExtensionCard';
import { JsonFormatterTool } from '../components/tools/JsonFormatterTool';
import { ToolCard } from '../components/ui/ToolCard';
import { Link } from '../lib/router-compat';
import { isCollaborativeTool } from '../lib/collaboration';

export const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const iconMap: Record<string, any> = {
    Cpu,
    LayoutGrid,
    CloudLightning,
    FileCode,
    Layers,
    Zap,
    FlaskConical,
    Terminal,
    Code2,
    ShieldCheck,
    Database,
    Sparkles,
    Columns2,
    GitBranch,
  };

  const categories = ['all', 'collaborative', 'json', 'encoders', 'auth', 'crypto', 'utilities', 'resume'];

  const filteredProducts = PRODUCTS_LIST.filter((p) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'collaborative') return isCollaborativeTool(p.id);
    return p.category === selectedCategory;
  });

  return (
    <>
      <div className="pt-16 pb-20 bg-app text-theme-main relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          {/* Page Header */}
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-[#1D9BF0] font-semibold block">
              Developer Platform
            </span>
            <h1 className="text-h1 text-theme-main">
              Featured Tools &amp; Extension
            </h1>
            <p className="text-body-large text-theme-muted max-w-2xl mx-auto">
              Fast, privacy-focused browser utilities built for daily engineering workflows. Five core tools support real-time peer-to-peer collaboration for live payload and code debugging.
            </p>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                const isCollabCat = cat === 'collaborative';
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-medium uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? isCollabCat
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-[#1D9BF0] text-white'
                        : isCollabCat
                          ? 'bg-surface border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
                          : 'bg-surface border border-theme-subtle text-theme-muted hover:text-theme-main'
                    }`}
                  >
                    {isCollabCat && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />}
                    <span>{isCollabCat ? 'Live Collab (5)' : cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editorial Structural List Layout */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-theme-muted">
              Browser Utilities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredProducts.map((prod, idx) => {
                const Icon = iconMap[prod.icon] || Cpu;
                const name = t(prod.nameKey, prod.nameKey);
                const desc = t(prod.descKey, '');
                const toolRoutes: Record<string, string> = {
                  'json-formatter': '/tools/json-formatter',
                  'jwt-inspector': '/tools/jwt-inspector',
                  'base64-encoder': '/tools/base64-encoder',
                  'curl-converter': '/tools/curl-converter',
                  'cron-visualizer': '/tools/cron-visualizer',
                  'regex-tester': '/tools/regex-tester',
                  'regex-railroad': '/tools/regex-railroad-generator',
                  'sql-to-json': '/tools/sql-to-json',
                  'hash-generator': '/tools/hash-generator',
                  'password-shuffle-generator': '/tools/password-shuffle-generator',
                  'ats-resume-generator': '/tools/ats-resume-generator',
                  'ai-prompt-builder': '/tools/ai-prompt-builder',
                  'diff-checker': '/tools/diff-checker',
                  'pdf-suite': '/tools/pdf-suite',
                  'edit-pdf': '/tools/edit-pdf',
                  'json-graph': '/tools/json-graph',
                  'code-complexity-analyzer': '/tools/code-complexity-analyzer',
                  'pipeline': '/tools/pipeline',
                  'node-event-loop-visualizer': '/tools/node-event-loop-visualizer',
                  'js-event-loop-visualizer': '/tools/js-event-loop-visualizer',
                  'git-visualizer': '/tools/git-visualizer',
                  'qr-code-generator': '/tools/qr-code-generator',
                  'workflow-builder': '/tools/workflow-builder',
                };
                const toolHref = toolRoutes[prod.id];

                return (
                  <ToolCard
                    key={prod.id}
                    prod={prod}
                    idx={idx}
                    name={name}
                    desc={desc}
                    toolHref={toolHref}
                    Icon={Icon}
                    onClick={setSelectedProduct}
                  />
                );
              })}
            </div>
          </div>

          {/* IDE & VS Code Extensions */}
          <div className="space-y-4 pt-4">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-theme-muted">
              IDE & VS Code Extensions
            </h2>
            <VSCodeExtensionCard />
          </div>

          <CTASection />
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct ? t(selectedProduct.nameKey, selectedProduct.id) : ''}
      >
        {selectedProduct && (
          <div className="space-y-5">
            {selectedProduct.id === 'json-formatter' ? (
              <div className="space-y-4">
                <JsonFormatterTool />
                <div className="text-right pt-2">
                  <Link
                    to="/tools/json-formatter"
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-[#1D9BF0] hover:underline"
                  >
                    <span>Open in Standalone Page</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <p className="text-body text-theme-muted leading-relaxed">
                  {t(selectedProduct.descKey, '')}
                </p>

                {selectedProduct.demoCode && (
                  <div className="p-4 rounded-lg bg-app font-mono text-code text-[#1D9BF0] border border-theme-subtle overflow-x-auto">
                    <pre>{selectedProduct.demoCode}</pre>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-theme-muted">Tech Specs</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProduct.techStack.map((tech) => (
                      <span key={tech} className="px-2.5 py-1 rounded bg-app border border-theme-subtle text-xs text-[#1D9BF0] font-mono font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};
