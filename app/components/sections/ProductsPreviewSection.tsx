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

        {/* Editorial Structural Line List for Browser Tools */}
        <div className="space-y-4 pt-4">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-theme-muted">
            Browser Utilities Suite
          </h3>
          <div className="divide-y divide-theme-subtle border-t border-b border-theme-subtle">
            {PRODUCTS_LIST.map((prod, idx) => {
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
              const toolHref = toolRoutes[prod.id];

              return (
                <Link
                  key={prod.id}
                  to={toolHref ?? '/tools'}
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    if (!toolHref) {
                      e.preventDefault();
                      setSelectedProduct(prod);
                    }
                  }}
                  className="py-6 sm:py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover-bg-surface transition-colors cursor-pointer group"
                >
                  {/* Left: Index + Title + Desc */}
                  <div className="flex items-start gap-6 max-w-3xl">
                    <span className="text-xs font-mono text-theme-muted pt-1 shrink-0">
                      0{idx + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-theme-main group-hover:text-[#1D9BF0] transition-colors flex items-center gap-2">
                        <span>{name}</span>
                        <ArrowUpRight className="w-4 h-4 text-theme-muted group-hover:text-[#1D9BF0] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </h3>
                      <p className="text-xs text-theme-muted font-normal mt-1 leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </div>

                  {/* Right: Tech Stack */}
                  <div className="flex flex-wrap items-center gap-3 md:justify-end shrink-0">
                    {prod.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs font-mono text-theme-muted border-l border-theme-subtle pl-2"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Link to Full Suite */}
        <div className="mt-12 text-left">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 text-sm font-medium text-theme-main hover:text-[#1D9BF0] transition-colors group cursor-pointer"
          >
            <span>Explore All Developer Utilities</span>
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
