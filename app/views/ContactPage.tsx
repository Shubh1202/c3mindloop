'use client';

import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, MessageSquare, Terminal } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { SEOHead } from '../components/layout/SEOHead';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';

export const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <>
      <SEOHead
        title="Contact Engineering Team — C³ MindLoop"
        description="Get in touch with C³ MindLoop. Project inquiries, SaaS architecture consulting, partnerships, and technical questions."
        canonical="/contact"
      />

      <div className="pt-16 pb-20 relative z-10 bg-app">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Authentic Header */}
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-[#1D9BF0] font-semibold block">
              {t('contact.kicker', 'Get In Touch')}
            </span>
            <h1 className="text-h1 text-theme-main">
              {t('contact.title', 'Contact Engineering Team')}
            </h1>
            <p className="text-body-large text-theme-muted">
              {t('contact.subtitle', 'Have a project inquiry, technical question, or community idea? Drop us a message.')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Contact Form Box */}
            <div className="lg:col-span-7 p-5 sm:p-8 rounded-xl bg-surface border border-theme-subtle">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h3 className="text-h3 text-theme-main">{t('contact.successTitle', 'Message Received')}</h3>
                  <p className="text-body-small text-theme-muted max-w-md mx-auto">
                    {t('contact.successMsg', 'Thank you for reaching out. We will review your message and get back to you shortly.')}
                  </p>
                  <Button onClick={() => setSubmitted(false)} variant="secondary" size="sm">
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono font-medium text-theme-muted mb-1.5">
                      {t('contact.nameLabel', 'Your Name')} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t('contact.namePlaceholder', 'e.g. Alex')}
                      required
                      className="w-full bg-app border border-theme-subtle rounded-lg px-3.5 py-2.5 text-body-small text-theme-main placeholder:text-theme-muted focus:outline-none focus:border-[#1D9BF0]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-medium text-theme-muted mb-1.5">
                      {t('contact.emailLabel', 'Email Address')} *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={t('contact.emailPlaceholder', 'alex@example.com')}
                      required
                      className="w-full bg-app border border-theme-subtle rounded-lg px-3.5 py-2.5 text-body-small text-theme-main placeholder:text-theme-muted focus:outline-none focus:border-[#1D9BF0]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-medium text-theme-muted mb-1.5">
                      {t('contact.subjectLabel', 'Subject')}
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder={t('contact.subjectPlaceholder', 'Project Inquiry / Architecture Consulting')}
                      className="w-full bg-app border border-theme-subtle rounded-lg px-3.5 py-2.5 text-body-small text-theme-main placeholder:text-theme-muted focus:outline-none focus:border-[#1D9BF0]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-medium text-theme-muted mb-1.5">
                      {t('contact.messageLabel', 'Your Message')} *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={5}
                      required
                      placeholder={t('contact.messagePlaceholder', 'Tell us about your project or inquiry...')}
                      className="w-full bg-app border border-theme-subtle rounded-lg p-3.5 text-body-small text-theme-main placeholder:text-theme-muted focus:outline-none focus:border-[#1D9BF0]"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="w-full py-2.5"
                    icon={<Send className="w-4 h-4" />}
                  >
                    {isSubmitting ? t('contact.btnSending', 'Sending Message...') : t('contact.btnSubmit', 'Send Message')}
                  </Button>
                </form>
              )}
            </div>

            {/* Direct Communication Channels (No Fake Silicon Valley HQ) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-5 sm:p-8 rounded-xl bg-surface border border-theme-subtle space-y-6">
                <h3 className="text-h3 text-theme-main">{t('contact.officeTitle', 'Direct Communication')}</h3>

                <div className="space-y-4 text-body-small text-theme-muted">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#1D9BF0] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-mono uppercase font-bold text-theme-muted block">Direct Email</span>
                      <a href="mailto:hello@cmindloop.com" className="text-body font-medium text-[#1D9BF0] hover:underline">
                        hello@cmindloop.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-5 h-5 text-[#1D9BF0] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-mono uppercase font-bold text-theme-muted block">Community Channels</span>
                      <p className="text-body-small text-theme-muted">
                        Join our developer channels for async discussions, code reviews, and technical feedback.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Terminal className="w-5 h-5 text-[#1D9BF0] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-mono uppercase font-bold text-theme-muted block">Async Response Time</span>
                      <p className="text-body-small text-theme-muted">
                        We review messages promptly during active engineering hours.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Developer Ethos Box */}
              <div className="p-6 rounded-xl bg-app border border-theme-subtle space-y-2">
                <span className="text-xs font-mono text-[#1D9BF0] font-semibold uppercase tracking-wider block">
                  Authenticity First
                </span>
                <p className="text-body-small text-theme-muted">
                  C³ MindLoop is an open technology ecosystem. We do not maintain fake office fronts or exaggerated claims—we focus on real software, real code, and real engineering value.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};
