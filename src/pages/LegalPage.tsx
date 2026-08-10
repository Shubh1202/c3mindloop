'use client';

import React from 'react';
import { useLocation } from '../lib/router-compat';
import { SEOHead } from '../components/layout/SEOHead';

export const LegalPage: React.FC = () => {
  const location = useLocation();
  const isTerms = location.pathname.includes('terms');

  return (
    <>
      <SEOHead
        title={isTerms ? 'Terms of Service — C³ MindLoop' : 'Privacy Policy — C³ MindLoop'}
        description="Legal policies and terms of service for C³ MindLoop products, API platform, and community services."
        canonical={location.pathname}
      />

      <div className="pt-32 pb-24 bg-app text-theme-main relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-[#1D9BF0] font-semibold block">
              Legal Compliance
            </span>
            <h1 className="text-display text-theme-main">
              {isTerms ? 'Terms of Service' : 'Privacy Policy'}
            </h1>
            <p className="text-xs font-mono text-theme-muted">Last updated: August 1, 2026</p>
          </div>

          <div className="p-8 sm:p-12 rounded-xl bg-surface border border-theme-subtle space-y-6 text-body-small text-theme-muted">
            {isTerms ? (
              <>
                <h2 className="text-h3 text-theme-main">1. Acceptance of Terms</h2>
                <p>By accessing C³ MindLoop services, APIs, or community platforms, you agree to comply with these terms.</p>
                <h2 className="text-h3 text-theme-main">2. Developer API Usage</h2>
                <p>API keys issued by C³ MindLoop must remain confidential. Rate limits apply to standard tier developer accounts.</p>
                <h2 className="text-h3 text-theme-main">3. Open Source Licenses</h2>
                <p>Open-source packages published by C³ MindLoop are distributed under Apache 2.0 or MIT licenses unless explicitly noted.</p>
              </>
            ) : (
              <>
                <h2 className="text-h3 text-theme-main">1. Data Minimization Commitment</h2>
                <p>C³ MindLoop respects developer privacy. We do NOT sell user code snippets, prompts, or personal data to third parties.</p>
                <h2 className="text-h3 text-theme-main">2. AI Model Telemetry</h2>
                <p>Telemetry collected in MindLoop AI tools is aggregated anonymously solely to optimize AST reflection accuracy and model latency.</p>
                <h2 className="text-h3 text-theme-main">3. Security Safeguards</h2>
                <p>All communication channels are encrypted with TLS 1.3. API secrets are encrypted at rest with AES-256 GCM.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
