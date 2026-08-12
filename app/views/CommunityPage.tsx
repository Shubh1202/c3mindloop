'use client';

import React, { useState } from 'react';
import { MessageSquare, Flame, AlertTriangle, Calendar, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTranslation } from '../lib/i18n';
import { CRASH_STORIES } from '../lib/constants';
import { SEOHead } from '../components/layout/SEOHead';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { CTASection } from '../components/sections/CTASection';
import { VSCodeExtensionCard } from '../components/sections/VSCodeExtensionCard';

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
    { title: 'System Design Masterclass: High Throughput Redis Queues', date: 'August 14, 2026', time: '18:00 UTC', host: 'Shubham Prajapati' },
    { title: 'Live Hackathon: Build an AI Agent in 4 Hours', date: 'August 22, 2026', time: '15:00 UTC', host: 'Elena Rostova' },
    { title: 'Friday Night Crash Post-Mortem Stories', date: 'August 29, 2026', time: '21:00 UTC', host: 'Marcus Vance' }
  ];

  return (
    <>
      <SEOHead
        title="Community - Coding. Crashing. Crying."
        description="Join 120,000+ developers in the C³ MindLoop community. Share production crash stories, contribute to open source, and attend live workshops."
        canonical="/community"
      />

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
              {t('community.subtitle', 'Join 120,000+ developers sharing real stories, debugging late at night, and building open-source together.')}
            </p>
          </div>

          {/* Editorial Community Hub Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-t border-b border-theme-subtle">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-md bg-[#1D9BF0]/10 text-[#1D9BF0]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h2 className="text-h2 text-theme-main">{t('community.discordTitle', 'Official Discord Hub')}</h2>
              </div>
              <p className="text-body text-theme-muted leading-relaxed">
                {t('community.discordDesc', '24/7 active voice rooms, code review channels, bug support, and async meme sharing.')}
              </p>
              <a href="https://discord.gg" target="_blank" rel="noreferrer" className="inline-block">
                <Button size="md" variant="primary" icon={<MessageSquare className="w-4 h-4" />}>
                  {t('community.joinBtn', 'Join Discord Server')}
                </Button>
              </a>
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

          {/* Featured Developer Project */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-theme-subtle pb-3">
              <h2 className="text-h2 text-theme-main">Featured Developer Projects</h2>
              <span className="text-xs font-mono text-theme-muted uppercase tracking-wider">VS Code Marketplace</span>
            </div>
            <VSCodeExtensionCard />
          </div>

          {/* Crash Stories Wall (Open List View with 1px Line Dividers, No Badges) */}
          <div className="space-y-8">
            <h2 className="text-h2 text-theme-main">Production Post-Mortems</h2>

            <div className="divide-y divide-theme-subtle border-t border-b border-theme-subtle">
              {stories.map((story, idx) => (
                <div key={story.id} className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-3 space-y-1">
                    <span className="text-xs font-mono text-theme-muted block">0{idx + 1}</span>
                    <span className="text-body-small font-semibold text-[#1D9BF0] block">{story.author}</span>
                    <span className="text-xs text-theme-muted block">{story.role}</span>
                  </div>

                  <div className="md:col-span-9 space-y-4">
                    <h3 className="text-h3 text-theme-main">{story.title}</h3>
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
              {events.map((ev) => (
                <div key={ev.title} className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#1D9BF0]">
                      {ev.date} • {ev.time}
                    </span>
                    <h3 className="text-h3 text-theme-main">{ev.title}</h3>
                  </div>
                  <div className="text-xs text-theme-muted">
                    Host: <span className="text-theme-main font-medium">{ev.host}</span>
                  </div>
                </div>
              ))}
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
