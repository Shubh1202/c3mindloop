'use client';

import React, { useState, useMemo } from 'react';
import { MessageSquare, Flame, AlertTriangle, Calendar, CheckCircle2, Github, ExternalLink, Coffee, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTranslation } from '../lib/i18n';
import { CRASH_STORIES } from '../lib/constants';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { CTASection } from '../components/sections/CTASection';

export const CommunityPage: React.FC = () => {
  const { t } = useTranslation();
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [storyForm, setStoryForm] = useState({ author: '', role: '', company: '', title: '', story: '', lesson: '' });
  const [stories, setStories] = useState(CRASH_STORIES);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyForm.title || !storyForm.story) return;

    const newStory = {
      id: `cs-${Date.now()}`,
      author: storyForm.author || 'Anonymous Dev',
      role: storyForm.role || 'Software Engineer',
      company: storyForm.company || 'Tech Company',
      title: storyForm.title,
      story: storyForm.story,
      lesson: storyForm.lesson || 'Always double check production configs.',
      upvotes: 1,
      tags: ['Community']
    };

    setStories([newStory, ...stories]);
    setSubmitted(true);
    confetti({ particleCount: 60, spread: 60 });
    setTimeout(() => {
      setIsSubmitOpen(false);
      setSubmitted(false);
      setStoryForm({ author: '', role: '', company: '', title: '', story: '', lesson: '' });
    }, 1500);
  };

  const events = [
    { title: 'System Design Masterclass: High Throughput Redis Queues', date: 'August 14, 2026', time: '18:00 UTC', host: 'C³ MindLoop Team' },
    { title: 'Live Hackathon: Build an AI Agent in 4 Hours', date: 'August 22, 2026', time: '15:00 UTC', host: 'C³ AI Team' },
    { title: 'Friday Night Crash Post-Mortem Stories', date: 'August 29, 2026', time: '21:00 UTC', host: 'C³ Dev Advocates' }
  ];

  const isPast = (dateStr: string) => {
    return new Date(dateStr) < new Date('2026-08-15');
  };

  const getCalendarUrl = (title: string, dateStr: string, timeStr: string) => {
    try {
      const start = new Date(`${dateStr} ${timeStr.replace(' UTC', '')} UTC`);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration default
      const formatTimeStr = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const dates = `${formatTimeStr(start)}/${formatTimeStr(end)}`;
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent('Live stream event from C³ MindLoop. Zero-data developer workshop.')}&location=Online+Stream`;
    } catch {
      return '#';
    }
  };

  return (
    <>
      <div className="pt-16 pb-20 bg-app text-theme-main relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">

          {/* Header */}
          <div className="text-center max-w-4xl mx-auto space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#1D9BF0] block">
              {t('community.kicker', 'Developer Movement')}
            </span>
            <h1 className="text-h1 text-theme-main">
              "{t('community.heroQuote', 'Coding. Crashing. Crying.')}"
            </h1>
            <p className="text-xs sm:text-sm text-[#1D9BF0] font-medium">
              {t('community.quoteSub', 'And then, suddenly... compilation succeeds. Welcome home.')}
            </p>
            <p className="text-body-large text-theme-muted max-w-2xl mx-auto">
              Discover practical developer tools, resources, and ideas from C³ MindLoop.
            </p>
          </div>

          {/* Editorial Community Hub Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-t border-b border-theme-subtle">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-md bg-[#1D9BF0]/10 text-[#1D9BF0]">
                  <Github className="w-5 h-5" />
                </div>
                <h2 className="text-h2 text-theme-main">Open Source Community</h2>
              </div>
              <p className="text-body text-theme-muted leading-relaxed">
                Join our open-source movement on GitHub. Star the repository, contribute new privacy-first developer tools, and collaborate with engineers worldwide.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://github.com/shubhamprajapati1202/c3mindloop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button size="md" variant="primary" icon={<Github className="w-4 h-4" />}>
                    Star on GitHub
                  </Button>
                </a>
                <a href="/tools" className="inline-block">
                  <Button size="md" variant="secondary">
                    Browse Tools
                  </Button>
                </a>
              </div>
            </div>

            <div className="space-y-6 md:border-l md:border-theme-subtle md:pl-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-md bg-[#1D9BF0]/10 text-[#1D9BF0]">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h2 className="text-h2 text-theme-main">{t('community.storiesTitle', 'Developer Crash Stories')}</h2>
              </div>
              <p className="text-body text-theme-muted leading-relaxed">
                Have you dropped a database or caused an outage? Share your story with the community and help others learn.
              </p>
              <Button
                size="md"
                variant="secondary"
                icon={<Flame className="w-4 h-4 text-[#1D9BF0]" />}
                onClick={() => setIsSubmitOpen(true)}
              >
                {t('community.submitStory', 'Share Your Crash Story')}
              </Button>
            </div>
          </div>

          {/* Support & Sponsorship Banner with QR */}
          <div className="border border-white/10 rounded-2xl p-6 sm:p-8 bg-neutral-900/60 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono">
                <Coffee className="w-3.5 h-3.5" />
                <span>Support Independent Open Source</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">Buy Me a Coffee & Keep C³ MindLoop Free</h3>
              <p className="text-xs sm:text-sm text-theme-muted leading-relaxed">
                C³ MindLoop is 100% free, ad-free, and open source. Your support keeps all 20+ utilities running with zero data tracking and serverless infrastructure.
              </p>
              <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start pt-2">
                <a
                  href="https://buymeacoffee.com/shubhamprajapati1202"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FFDD00] hover:bg-[#F5D300] text-black font-semibold text-xs transition-colors"
                >
                  <Coffee className="w-4 h-4 text-black" />
                  <span>Buy Me a Coffee</span>
                </a>
                <a
                  href="https://github.com/sponsors/shubhamprajapati1202"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium text-xs transition-colors"
                >
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>GitHub Sponsor</span>
                </a>
              </div>
            </div>

            <div className="flex flex-col items-center p-3 rounded-2xl bg-white shadow-2xl shrink-0">
              <img
                src="/bmc-qr.jpg"
                alt="Buy Me a Coffee QR Code"
                className="w-36 h-36 rounded-xl object-contain"
              />
              <span className="text-[10px] font-mono font-bold text-neutral-800 uppercase tracking-wider pt-2">
                Scan with Phone ☕
              </span>
            </div>
          </div>

          {/* Featured Developer Projects */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-theme-subtle pb-3">
              <h2 className="text-h2 text-theme-main">Featured Developer Projects</h2>
              <span className="text-xs font-mono text-theme-muted uppercase tracking-wider">Tools & Extensions</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Project 1 */}
              <div className="border border-white/10 rounded-xl p-6 bg-neutral-900/60 hover:bg-neutral-900/80 hover:border-[#1D9BF0]/30 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      VS Code Extension
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      14.4k+ Installs
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug">Office Editor VS Code Extension</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                    WYSIWYG document & spreadsheet editor directly inside VS Code supporting Docx and Xlsx parsing.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-2">
                  <a
                    href="https://marketplace.visualstudio.com/items?itemName=shubhamprajapati1202.office-editor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-[#007ACC] hover:bg-[#0062A3] text-white font-mono text-[10px] font-bold uppercase transition-all"
                  >
                    <span>Install</span>
                  </a>
                  <a
                    href="https://github.com/shubhamprajapati1202/office-editor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 font-mono text-[10px] font-bold uppercase transition-all"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>
                </div>
              </div>

              {/* Project 2 */}
              <div className="border border-white/10 rounded-xl p-6 bg-neutral-900/60 hover:bg-neutral-900/80 hover:border-[#1D9BF0]/30 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      Web Worker Module
                    </span>
                    <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                      WebCrypto
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug">Client-Side WebCrypto Hasher</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                    Pure client-side Web Worker file hashing module supporting SHA-256, SHA-512, MD5, and HMAC signatures.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-2">
                  <a
                    href="/tools/hash-generator"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white font-mono text-[10px] font-bold uppercase transition-all"
                  >
                    <span>Try Tool</span>
                  </a>
                </div>
              </div>

              {/* Project 3 */}
              <div className="border border-white/10 rounded-xl p-6 bg-neutral-900/60 hover:bg-neutral-900/80 hover:border-[#1D9BF0]/30 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      NPM Package
                    </span>
                    <span className="text-[10px] font-mono text-[#1D9BF0] bg-[#1D9BF0]/10 px-2 py-0.5 rounded border border-[#1D9BF0]/20">
                      AST Systems
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-snug">AST Code Synthesis Engine</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                    In-browser JavaScript/TypeScript AST parser and structural code transformer library.
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-2">
                  <a
                    href="/tools/regex-tester"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white font-mono text-[10px] font-bold uppercase transition-all"
                  >
                    <span>Try Tool</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Crash Stories Wall (Open List View with 1px Line Dividers, No Badges) */}
          <div className="space-y-8">
            <h2 className="text-h2 text-theme-main">Production Post-Mortems</h2>

            <div className="divide-y divide-theme-subtle border-t border-b border-theme-subtle">
              {stories.map((story, idx) => (
                <div key={story.id} className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-3 space-y-2">
                    <span className="text-xs font-mono text-theme-muted block">0{idx + 1}</span>
                    <span className="text-body-small font-semibold text-[#1D9BF0] block">{story.author}</span>
                    <span className="text-xs text-theme-muted block">{story.role}</span>
                  </div>

                  <div className="md:col-span-9 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-h3 text-theme-main">{story.title}</h3>
                    </div>
                    <p className="text-body text-theme-muted leading-relaxed">{story.story}</p>

                    <div className="pt-3 border-t border-theme-subtle text-xs text-theme-main space-y-1">
                      <span className="font-semibold uppercase tracking-wider text-[#1D9BF0] block">
                        KEY LESSON:
                      </span>
                      <p className="text-theme-muted">{story.lesson}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Events Schedule */}
          <div className="space-y-8">
            <h2 className="text-h2 text-theme-main flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#1D9BF0]" />
              <span>{t('community.eventsTitle', 'Upcoming Live Workshops & Hackathons')}</span>
            </h2>

            <div className="divide-y divide-theme-subtle border-t border-b border-theme-subtle">
              {events.map((ev) => {
                const past = isPast(ev.date);
                return (
                  <div key={ev.title} className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#1D9BF0]">
                          {ev.date} • {ev.time}
                        </span>
                        {past ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                            Past Event
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400">
                            Upcoming Live
                          </span>
                        )}
                      </div>
                      <h3 className="text-h3 text-theme-main">{ev.title}</h3>
                      <div className="text-xs text-theme-muted">
                        Host: <span className="text-theme-main font-medium">{ev.host}</span>
                      </div>
                    </div>

                    <div>
                      {past ? (
                        <a
                          href="https://www.youtube.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          <span>Watch Recording</span>
                        </a>
                      ) : (
                        <a
                          href={getCalendarUrl(ev.title, ev.date, ev.time)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded border border-neutral-700 hover:border-[#1D9BF0]/40 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-mono text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          <span>Add to Calendar</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FAQs Section */}
          <div className="space-y-8 pt-12 border-t border-theme-subtle">
            <h2 className="text-h2 text-theme-main">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 bg-neutral-900/50 border border-theme-subtle rounded-xl space-y-2">
                <h3 className="text-sm font-semibold text-[#1D9BF0]">{t('community.faq.q1', 'How can I submit my production crash story or post-mortem?')}</h3>
                <p className="text-xs text-theme-muted leading-relaxed">{t('community.faq.a1')}</p>
              </div>
              <div className="p-5 bg-neutral-900/50 border border-theme-subtle rounded-xl space-y-2">
                <h3 className="text-sm font-semibold text-[#1D9BF0]">{t('community.faq.q2', 'Are the workshops and masterclasses free to attend?')}</h3>
                <p className="text-xs text-theme-muted leading-relaxed">{t('community.faq.a2')}</p>
              </div>
              <div className="p-5 bg-neutral-900/50 border border-theme-subtle rounded-xl space-y-2">
                <h3 className="text-sm font-semibold text-[#1D9BF0]">What resources are available on C³ MindLoop?</h3>
                <p className="text-xs text-theme-muted leading-relaxed">{t('community.faq.a3')}</p>
              </div>
            </div>
          </div>

          <CTASection />
        </div>
      </div>

      {/* Submit Crash Story Modal */}
      <Modal isOpen={isSubmitOpen} onClose={() => setIsSubmitOpen(false)} title="Submit Production Post-Mortem Story">
        {submitted ? (
          <div className="p-6 text-center text-emerald-500 space-y-2">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
            <h3 className="text-lg font-bold">Story Submitted!</h3>
            <p className="text-xs text-theme-muted">Thank you for sharing your experience with the MindLoop community.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitStory} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-theme-muted mb-1 font-semibold uppercase tracking-wider">Your Name / Handle</label>
                <input
                  type="text"
                  value={storyForm.author}
                  onChange={(e) => setStoryForm({ ...storyForm, author: e.target.value })}
                  placeholder="e.g. Alex M."
                  className="w-full bg-app border border-theme-subtle rounded-md p-2.5 text-xs text-theme-main focus:outline-none focus:border-[#1D9BF0]"
                />
              </div>
              <div>
                <label className="block text-xs text-theme-muted mb-1 font-semibold uppercase tracking-wider">Role / Title</label>
                <input
                  type="text"
                  value={storyForm.role}
                  onChange={(e) => setStoryForm({ ...storyForm, role: e.target.value })}
                  placeholder="e.g. Senior DevOps"
                  className="w-full bg-app border border-theme-subtle rounded-md p-2.5 text-xs text-theme-main focus:outline-none focus:border-[#1D9BF0]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-theme-muted mb-1 font-semibold uppercase tracking-wider">Story Headline</label>
              <input
                type="text"
                value={storyForm.title}
                onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                placeholder="e.g. Dropped production DB at 5 PM on a Friday"
                required
                className="w-full bg-app border border-theme-subtle rounded-md p-2.5 text-xs text-theme-main focus:outline-none focus:border-[#1D9BF0]"
              />
            </div>

            <div>
              <label className="block text-xs text-theme-muted mb-1 font-semibold uppercase tracking-wider">What Happened?</label>
              <textarea
                value={storyForm.story}
                onChange={(e) => setStoryForm({ ...storyForm, story: e.target.value })}
                rows={4}
                required
                placeholder="Describe the bug, crash, or incident..."
                className="w-full bg-app border border-theme-subtle rounded-md p-2.5 text-xs text-theme-main focus:outline-none focus:border-[#1D9BF0]"
              />
            </div>

            <div>
              <label className="block text-xs text-theme-muted mb-1 font-semibold uppercase tracking-wider">Key Engineering Lesson</label>
              <input
                type="text"
                value={storyForm.lesson}
                onChange={(e) => setStoryForm({ ...storyForm, lesson: e.target.value })}
                placeholder="What did you learn from this incident?"
                className="w-full bg-app border border-theme-subtle rounded-md p-2.5 text-xs text-theme-main focus:outline-none focus:border-[#1D9BF0]"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Post to Story Wall
            </Button>
          </form>
        )}
      </Modal>
    </>
  );
};
