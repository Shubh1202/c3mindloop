'use client';

import React, { useState } from 'react';
import { Cpu, LayoutGrid, CloudLightning, FileCode, Layers, Zap, FlaskConical, ArrowUpRight, Terminal } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { PRODUCTS_LIST } from '../lib/constants';
import { SEOHead } from '../components/layout/SEOHead';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Product } from '../types';
import { CTASection } from '../components/sections/CTASection';
import { VSCodeExtensionCard } from '../components/sections/VSCodeExtensionCard';
import { JsonFormatterTool } from '../components/tools/JsonFormatterTool';
import { Link } from '../lib/router-compat';

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
  };

  const categories = ['all', 'extensions', 'json', 'encoders', 'auth', 'crypto', 'utilities'];

  const filteredProducts = PRODUCTS_LIST.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category === selectedCategory;
  });

  return (
    <>
      <SEOHead
        title="Developer Utilities & VS Code Extension — C³ MindLoop"
        description="Explore C³ MindLoop Developer Tools: Office Editor VS Code Extension, JSON Formatter, Base64 Encoder, JWT Inspector, Hash Generator, and Regex Tester."
        canonical="/tools"
      />

      <div className="pt-16 pb-20 bg-app text-theme-main relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Page Header */}
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-[#1D9BF0] font-semibold block">
              Developer Platform
            </span>
            <h1 className="text-display text-theme-main">
              Featured Tools & Extension
            </h1>
            <p className="text-body-large text-theme-muted max-w-2xl mx-auto">
              Fast, privacy-focused browser utilities and developer tools built for daily engineering workflows.
            </p>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-medium uppercase tracking-wider transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#1D9BF0] text-white'
                      : 'bg-surface border border-theme-subtle text-theme-muted hover:text-theme-main'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Extension Card */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-theme-muted">
              Featured Extension
            </h2>
            <VSCodeExtensionCard />
          </div>

          {/* Editorial Structural List Layout */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-theme-muted">
              Browser Utilities
            </h2>
            <div className="divide-y divide-theme-subtle border-t border-b border-theme-subtle">
              {filteredProducts.map((prod, idx) => {
                const Icon = iconMap[prod.icon] || Cpu;
                const name = t(prod.nameKey, prod.id);
                const desc = t(prod.descKey, '');
                const toolRoutes: Record<string, string> = {
                  'json-formatter': '/tools/json-formatter',
                  'jwt-inspector': '/tools/jwt-inspector',
                  'base64-encoder': '/tools/base64-encoder',
                  'curl-converter': '/tools/curl-converter',
                };
                const toolHref = toolRoutes[prod.id];

                return (
                    <Link
                      key={prod.id}
                      href={toolHref ?? '/tools'}
                      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                        if (!toolHref) {
                          e.preventDefault();
                          setSelectedProduct(prod);
                        }
                      }}
                      className="py-8 px-2 sm:px-4 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-surface/50 transition-colors cursor-pointer group"
                    >
                    {/* Left: Index + Icon + Details */}
                    <div className="flex items-start gap-5 max-w-3xl">
                      <span className="text-xs font-mono text-theme-muted pt-1 w-6 shrink-0">
                        0{idx + 1}
                      </span>
                      <div className="p-2.5 rounded-md bg-[#1D9BF0]/10 text-[#1D9BF0] shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-h3 text-theme-main group-hover:text-[#1D9BF0] transition-colors flex items-center gap-2">
                          <span>{name}</span>
                          <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#1D9BF0]" />
                        </h3>
                        <p className="text-body-small text-theme-muted mt-1 leading-relaxed">
                          {desc}
                        </p>
                      </div>
                    </div>

                    {/* Right: Tech Stack */}
                    <div className="flex flex-wrap items-center gap-2 md:justify-end shrink-0 pl-11 md:pl-0">
                      {prod.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 rounded bg-app border border-theme-subtle text-code text-theme-muted"
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
