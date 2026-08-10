import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from '../../lib/i18n';

export const TestimonialsSection: React.FC = () => {
  const { t } = useTranslation();

  const testimonials = [
    {
      id: 't1',
      quote: t('testimonials.t1Quote', 'MindLoop AI cut our refactoring cycles in half. The focus on real developer workflows rather than superficial gimmicks makes it an essential tool.'),
      name: t('testimonials.t1Name', 'Alex Rivera'),
      role: t('testimonials.t1Role', 'Principal Architect'),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 't2',
      quote: t('testimonials.t2Quote', 'The "Coding, Crashing, Crying" ethos captures engineering reality. MindLoop system design walkthroughs are top notch.'),
      name: t('testimonials.t2Name', 'Sarah Chen'),
      role: t('testimonials.t2Role', 'Engineering Lead'),
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80'
    },
    {
      id: 't3',
      quote: t('testimonials.t3Quote', 'MindLoop Studio converted our complex distributed cloud architecture directly into clean, type-safe Next.js boilerplate in seconds.'),
      name: t('testimonials.t3Name', 'Marcus Vance'),
      role: t('testimonials.t3Role', 'Co-founder & Full-Stack Engineer'),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
    }
  ];

  return (
    <section className="py-16 lg:py-20 bg-app border-b border-theme-subtle relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="max-w-3xl mb-12 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#1D9BF0] font-normal block">
            {t('testimonials.kicker', 'Developer Perspectives')}
          </span>
          <h2 className="text-h1 text-theme-main font-bold">
            {t('testimonials.title', 'What Engineers Say About C³ MindLoop')}
          </h2>
          <p className="text-body-large text-theme-muted font-normal">
            {t('testimonials.subtitle', 'Feedback from developers, architects, and creators using our tools.')}
          </p>
        </div>

        {/* Editorial Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-theme-subtle pt-10">
          {testimonials.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="border-l border-theme-subtle pl-6 flex flex-col justify-between space-y-6"
            >
              <p className="text-sm font-normal text-theme-main leading-relaxed italic">
                "{item.quote}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-theme-subtle">
                <img
                  src={item.avatar}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-theme-subtle"
                />
                <div>
                  <div className="text-xs font-medium text-theme-main">{item.name}</div>
                  <div className="text-xs text-theme-muted font-mono">{item.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

