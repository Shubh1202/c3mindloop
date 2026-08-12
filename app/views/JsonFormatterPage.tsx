'use client';

import React, { useState } from 'react';
import { Link } from '../lib/router-compat';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { SEOHead } from '../components/layout/SEOHead';
import { JsonFormatterTool } from '../components/tools/JsonFormatterTool';
import { CTASection } from '../components/sections/CTASection';

const FAQ_ITEMS = [
  {
    question: "What is a JSON Formatter and why is it used?",
    answer: "A JSON Formatter is a developer utility designed to parse raw, minified JSON text and restructure it with consistent indentation and line breaks, transforming dense strings into highly readable text. This process is commonly referred to as beautifying or pretty-printing. Developers use it to debug complex API payloads, inspect structured config files, locate nesting anomalies, and communicate structural state information clearly to team members. Additionally, our formatter acts as a validator, alerting you to broken JSON structures or mismatched brackets before your application code parses them."
  },
  {
    question: "Is this JSON Formatter secure for sensitive corporate configs and API keys?",
    answer: "Absolutely. The core security advantage of our platform is that all operations run 100% locally inside your browser context using client-side JavaScript. Unlike conventional online formatters that transmit your data to backend servers—exposing sensitive credentials, private keys, or customer records to potential database logging and third-party monitoring—our formatter runs offline. Your JSON payload never traverses the internet, assuring strict compliance with corporate data protection policies, SOC 2 protocols, and general privacy requirements."
  },
  {
    question: "How does the built-in syntax error detector work?",
    answer: "When you enter a JSON string, the tool processes it using your browser's native V8 JavaScript parser. If the structure violates RFC 8259 guidelines (for instance, if there is a trailing comma, a missing quotation mark, or unmatched brackets), the parser throws a syntax error. Our application catches this error, extracts the character position and context, and maps it to a human-readable line and column indicator. This live error feedback helps you troubleshoot and correct structural mistakes instantly without guessing."
  },
  {
    question: "Can I use this JSON tool without an active internet connection?",
    answer: "Yes. Because the formatting, tree rendering, and validation algorithms are implemented purely in client-side code and do not require server-side execution, you can load the page once and run it offline. It is fully functional in low-connectivity environments, inside restricted enterprise intranets, or when working on local dev servers with no external network routes."
  },
  {
    question: "Why should I choose client-side tools over cloud-based formatters?",
    answer: "Cloud-based formatters require sending your payloads over the wire to their servers, where your data could be cached, logged, or intercepted. A local client-side formatter guarantees that your data stays on your machine. This eliminates security risks, reduces bandwidth latency, and guarantees instantaneous performance regardless of your network connection speed. It is the professional engineering standard for working with production database dumps and secure configuration files."
  }
];

export const JsonFormatterPage: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <>
      <SEOHead
        title="100% Private Client-Side JSON Formatter & Validator — C³ MindLoop"
        description="Free, ultra-fast client-side JSON formatter, validator, minifier, and interactive tree viewer. 100% browser-based with zero server retention."
        canonical="/tools/json-formatter"
      />

      <div className="pt-6 sm:pt-8 pb-16 bg-app text-theme-main relative z-10 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Breadcrumb Navigation & Compact Title */}
          <div className="space-y-1.5 border-b border-theme-subtle pb-3">
            <div className="flex items-center gap-2 text-xs font-mono text-theme-muted">
              <Link to="/tools" className="hover:text-theme-main transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Developer Tools</span>
              </Link>
              <span>/</span>
              <span className="text-[#1D9BF0] font-semibold">JSON Formatter</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-theme-main">
                100% Private Client-Side JSON Formatter & Validator
              </h1>
              <span className="text-[11px] font-mono text-neutral-400 bg-surface px-2.5 py-1 rounded border border-theme-subtle shrink-0">
                100% Client-Side • Local Browser Processing
              </span>
            </div>
          </div>

          {/* Interactive Tool Component */}
          <div>
            <JsonFormatterTool />
          </div>

          {/* Technical Workflow & Features Section */}
          <div className="pt-8 border-t border-theme-subtle grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono text-theme-muted">
            <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
              <h3 className="text-sm font-semibold text-theme-main font-sans">
                100% Client-Side Engine
              </h3>
              <p className="leading-relaxed">
                Your JSON data never leaves your device. All parsing and formatting operations execute in your browser's V8 engine.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
              <h3 className="text-sm font-semibold text-theme-main font-sans">
                Interactive Tree Inspection
              </h3>
              <p className="leading-relaxed">
                Toggle seamlessly between formatted code view and a collapsible node tree view to inspect deeply nested JSON objects.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-surface border border-theme-subtle space-y-2">
              <h3 className="text-sm font-semibold text-theme-main font-sans">
                Syntax Error Detection
              </h3>
              <p className="leading-relaxed">
                Real-time error location extraction identifies line numbers, missing brackets, or unexpected tokens immediately.
              </p>
            </div>
          </div>

          {/* On-Page Content Enrichment Section (SEO Deep-Dive) */}
          <div className="pt-10 border-t border-theme-subtle space-y-8">
            
            {/* Detailed Guide & Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-sm text-theme-muted leading-relaxed">
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-theme-main">
                  How the JSON Formatter Works
                </h2>
                <p>
                  Our interactive workspace provides immediate syntax formatting, validation, and tree-mapping capabilities for your JSON (JavaScript Object Notation) data files. Here is the step-by-step technical process of using the tool:
                </p>
                <ol className="list-decimal list-inside space-y-2 pl-2">
                  <li>
                    <strong>Input Paste/Load:</strong> Paste your raw, compressed, or unformatted JSON string into the left input panel, or click the sample button to load a standard structured dataset.
                  </li>
                  <li>
                    <strong>Lexical Parsing:</strong> The V8 JavaScript parser tokenizes the input, confirming characters comply with standard array, object, string, number, and boolean notations.
                  </li>
                  <li>
                    <strong>Validation Check:</strong> The engine validates structural integrity. If syntactical issues are discovered, the output panel automatically highlights the exact line location and description of the syntax mismatch.
                  </li>
                  <li>
                    <strong>Indentation & Tree Rendering:</strong> The formatted, pretty-printed result renders immediately on the right panel, with spacing customized to your preference. You can also view the tree visualization for collapsible data node exploration.
                  </li>
                </ol>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-bold text-theme-main">
                  The Privacy & Local Processing Advantage
                </h2>
                <p>
                  Many developers use common search-engine cloud tools to format their configuration files. However, this poses significant security threats. Standard SaaS validators require transporting your payloads over HTTP networks to be structured on remote servers. In contrast, C³ MindLoop guarantees absolute isolation:
                </p>
                <p>
                  <strong>Zero Network Overhead:</strong> Because all JSON beautifying, checking, and minification functions execute inside your local environment, no server calls are initiated. It works seamlessly when completely offline.
                </p>
                <p>
                  <strong>Private Configuration Auditing:</strong> Sensitive properties such as database environment credentials, REST API tokens, and secret parameters are kept entirely on your filesystem, eliminating risks of data breaches or logs extraction.
                </p>
              </div>
            </div>

            {/* Interactive FAQ Accordion UI */}
            <div className="space-y-4 max-w-4xl pt-6">
              <h2 className="text-lg font-bold text-theme-main">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {FAQ_ITEMS.map((item, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div 
                      key={index} 
                      className="border border-theme-subtle rounded-lg bg-surface overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFaq(index)}
                        className="w-full flex items-center justify-between p-4 text-left font-semibold text-theme-main hover:bg-neutral-900 transition-colors"
                      >
                        <span>{item.question}</span>
                        <ChevronDown 
                          className={`w-4 h-4 text-theme-muted transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
                        />
                      </button>
                      <div 
                        className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-80 border-t border-theme-subtle p-4 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                      >
                        <p className="text-sm text-theme-muted leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          <CTASection />
        </div>
      </div>
    </>
  );
};
