'use client';

import React, { useState } from 'react';
import { MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { SEOHead } from '../components/layout/SEOHead';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { CTASection } from '../components/sections/CTASection';

export const CareersPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<any | null>(null);
  const [applied, setApplied] = useState(false);

  const jobs = [
    { id: 'j1', title: 'Senior Rust & Systems Engineer', team: 'MindLoop Engine', location: 'Remote / US & EU', type: 'Full-time', salary: '$180k - $230k' },
    { id: 'j2', title: 'Lead AI & AST Reflection Researcher', team: 'MindLoop AI', location: 'Silicon Valley / Hybrid', type: 'Full-time', salary: '$210k - $270k' },
    { id: 'j3', title: 'Principal Frontend Architect (React/Vite)', team: 'MindLoop Studio', location: 'Remote', type: 'Full-time', salary: '$170k - $220k' },
    { id: 'j4', title: 'Senior Developer Advocate & Community Lead', team: 'Developer Experience', location: 'Remote Global', type: 'Full-time', salary: '$150k - $190k' }
  ];

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplied(true);
    setTimeout(() => {
      setSelectedRole(null);
      setApplied(false);
    }, 1800);
  };

  return (
    <>
      <SEOHead
        title="Careers - Join C³ MindLoop Engineering"
        description="Build the future of developer tools, AI engines, and SaaS products. View open engineering positions at C³ MindLoop."
        canonical="/careers"
      />

      <div className="pt-16 pb-20 bg-app text-theme-main relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#1D9BF0] block">
              {t('careers.kicker', 'We Are Hiring')}
            </span>
            <h1 className="text-h1 text-theme-main">
              {t('careers.title', 'Shape the Next Generation of Developer Tools')}
            </h1>
            <p className="text-body-large text-theme-muted max-w-2xl mx-auto">
              {t('careers.subtitle', 'We are looking for ambitious engineers, researchers, and creators who care deeply about craft, speed, and developer empowerment.')}
            </p>
          </div>

          {/* Clean Editorial Job List (No Card Wrappers) */}
          <div className="divide-y divide-theme-subtle border-t border-b border-theme-subtle">
            {jobs.map((job) => (
              <div key={job.id} className="py-8 px-2 sm:px-4 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-surface/50 transition-colors group">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider">
                    <span className="text-[#1D9BF0]">{job.team}</span>
                    <span className="text-theme-muted">•</span>
                    <span className="text-theme-muted font-normal">{job.salary}</span>
                  </div>
                  <h3 className="text-h3 text-theme-main group-hover:text-[#1D9BF0] transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-theme-muted">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#1D9BF0]" />{job.location}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#1D9BF0]" />{job.type}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedRole(job)}
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Apply for Position
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <CTASection />
        </div>
      </div>

      {/* Application Modal */}
      <Modal isOpen={!!selectedRole} onClose={() => setSelectedRole(null)} title={selectedRole ? `Apply: ${selectedRole.title}` : ''}>
        {applied ? (
          <div className="p-6 text-center text-emerald-500 space-y-2">
            <CheckCircle2 className="w-12 h-12 mx-auto" />
            <h3 className="text-lg font-bold">Application Received!</h3>
            <p className="text-xs text-theme-muted">Our engineering leads will review your GitHub & resume shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-muted mb-1.5">Full Name</label>
              <input required type="text" placeholder="John Doe" className="w-full bg-app border border-theme-subtle rounded-md p-2.5 text-xs text-theme-main focus:outline-none focus:border-[#1D9BF0]" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-muted mb-1.5">Email</label>
              <input required type="email" placeholder="john@domain.com" className="w-full bg-app border border-theme-subtle rounded-md p-2.5 text-xs text-theme-main focus:outline-none focus:border-[#1D9BF0]" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-muted mb-1.5">GitHub / Portfolio Link</label>
              <input required type="url" placeholder="https://github.com/username" className="w-full bg-app border border-theme-subtle rounded-md p-2.5 text-xs text-theme-main focus:outline-none focus:border-[#1D9BF0]" />
            </div>
            <Button type="submit" variant="primary" className="w-full">
              Submit Application
            </Button>
          </form>
        )}
      </Modal>
    </>
  );
};
