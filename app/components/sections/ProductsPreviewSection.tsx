'use client';

import React, { useState } from 'react';
import { Cpu, LayoutGrid, CloudLightning, FileCode, Layers, Zap, FlaskConical, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from '../../lib/router-compat';
import { useTranslation } from '../../lib/i18n';
import { PRODUCTS_LIST } from '../../lib/constants';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Product } from '../../types';
import { WatermarkBrandLayer } from '../ui/WatermarkBrandLayer';
import { VSCodeExtensionCard } from './VSCodeExtensionCard';

export const ProductsPreviewSection: React.FC = () => {
  const { t } = useTranslation();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const iconMap: Record<string, any> = {
    Cpu,
    LayoutGrid,
    CloudLightning,
    FileCode,
    Layers,
    Zap,
    FlaskConical
  };

  return (
    <section className="py-16 lg:py-20 bg-app border-b border-theme-subtle relative overflow-hidden">
      {/* Watermark Brand Layer */}
      <WatermarkBrandLayer position="bottom-right" size={460} opacityClass="opacity-20" className="right-0 bottom-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Editorial Section Header */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-theme-muted">
            <span>Featured Project & Utilities</span>
            <span>•</span>
            <span>Developer Tools</span>
          </div>
          <h2 className="text-h1 text-theme-main font-bold">
            Developer Utilities & Tools
          </h2>
          <p className="text-body-large text-theme-muted font-normal">
            Fast, browser-based utilities and developer tools for daily software engineering workflows.
          </p>
        </div>

        {/* Featured VS Code Extension Card */}
        <VSCodeExtensionCard />

        {/* Browser Utilities Suite - Sleek Card Grid */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-theme-subtle pb-3">
            <div>
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#1D9BF0] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D9BF0]" />
                Browser Utilities Suite
              </h3>
              <p className="text-xs text-theme-muted mt-1">
                Zero network requests • Processed 100% inside your local browser sandbox
              </p>
            </div>
            <Link
              to="/tools"
              className="text-xs font-mono text-theme-muted hover:text-[#1D9BF0] transition-colors hidden sm:flex items-center gap-1"
            >
              View all 15+ tools <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {PRODUCTS_LIST.map((prod) => {
              const name = t(prod.nameKey, prod.nameKey);
              const desc = t(prod.descKey, prod.descKey);
              const toolRoutes: Record<string, string> = {
                'json-formatter': '/tools/json-formatter',
                'jwt-inspector': '/tools/jwt-inspector',
                'base64-encoder': '/tools/base64-encoder',
                'curl-converter': '/tools/curl-converter',
                'cron-visualizer': '/tools/cron-visualizer',
                'regex-tester': '/tools/regex-tester',
                'sql-to-json': '/tools/sql-to-json',
                'hash-generator': '/tools/hash-generator',
                'ats-resume-generator': '/tools/ats-resume-generator',
                'pdf-suite': '/tools/pdf-suite',
                'edit-pdf': '/tools/edit-pdf',
                'ai-prompt-builder': '/tools/ai-prompt-builder',
                'diff-checker': '/tools/diff-checker',
                'json-graph': '/tools/json-graph',
                'code-complexity-analyzer': '/tools/code-complexity-analyzer',
              };
              const toolHref = toolRoutes[prod.id] || '/tools';
              const IconComponent = iconMap[prod.icon] || Cpu;

              return (
                <Link
                  key={prod.id}
                  to={toolHref}
                  className="p-5 rounded-xl bg-neutral-900/60 border border-white/10 hover:border-[#1D9BF0]/40 hover:bg-neutral-900/90 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-lg relative overflow-hidden"
                >
                  <div>
                    {/* Card Top: Icon + Name */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="p-2.5 rounded-lg bg-neutral-800/80 text-neutral-300 group-hover:bg-[#1D9BF0]/20 group-hover:text-[#1D9BF0] transition-colors shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-neutral-400 bg-white/5 px-2 py-0.5 rounded border border-white/10 shrink-0">
                        Client-Side
                      </span>
                    </div>

                    <h4 className="text-base font-semibold text-white group-hover:text-[#1D9BF0] transition-colors flex items-center justify-between gap-1 leading-snug">
                      <span>{name}</span>
                      <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-[#1D9BF0] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                    </h4>

                    <p className="text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors mt-2 line-clamp-2 leading-relaxed font-normal">
                      {desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    {/* Tech stack badge */}
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      {prod.techStack.slice(0, 2).map((tech) => (
                        <span key={tech} className="text-[10px] font-mono text-neutral-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded truncate">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <span className="text-xs font-mono text-neutral-400 group-hover:text-[#1D9BF0] transition-colors font-medium shrink-0 flex items-center gap-1">
                      Launch →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Link to Full Suite */}
        <div className="mt-10 text-center sm:text-left">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-neutral-900 border border-white/10 hover:border-[#1D9BF0]/40 text-sm font-mono font-medium text-white hover:text-[#1D9BF0] transition-all group cursor-pointer shadow-md hover:shadow-xl"
          >
            <span>Explore All 15+ Developer Utilities</span>
            <ArrowRight className="w-4 h-4 text-[#1D9BF0] group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title={selectedProduct ? t(selectedProduct.nameKey, selectedProduct.id) : ''}
      >
        {selectedProduct && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-theme-subtle pb-3">
              <span className="text-xs font-mono font-medium text-[#1D9BF0] uppercase tracking-wider">
                Category: {selectedProduct.category}
              </span>
            </div>

            <p className="text-body text-theme-muted">
              {t(selectedProduct.descKey, '')}
            </p>

            {selectedProduct.demoCode && (
              <div className="p-4 rounded-lg bg-app font-mono text-code text-[#1D9BF0] border border-theme-subtle overflow-x-auto">
                <pre>{selectedProduct.demoCode}</pre>
              </div>
            )}

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-theme-muted font-bold block">
                Tech Stack
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.techStack.map((tech) => (
                  <span key={tech} className="px-2.5 py-1 rounded bg-surface border border-theme-subtle text-code text-theme-main">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-theme-subtle flex justify-end gap-3">
              <Button size="sm" variant="secondary" onClick={() => setSelectedProduct(null)}>
                Close
              </Button>
              <Link to="/contact" onClick={() => setSelectedProduct(null)}>
                <Button size="sm" variant="primary">
                  Inquire / Contact
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
};
