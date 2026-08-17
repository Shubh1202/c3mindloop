'use client';

import React, { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { AccordionItem } from '../ui/Accordion';

export const FAQSection: React.FC = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: t('faq.q1', 'What does C³ MindLoop stand for?'),
      a: t('faq.a1', 'C³ represents our three core pillars: Community, Creation, and Continuation. MindLoop is the continuous cycle of thinking, building, learning, and repeating.')
    },
    {
      q: t('faq.q2', 'What kind of tools does C³ MindLoop offer?'),
      a: 'We offer browser-based developer tools and practical resources for common workflows.'
    },
    {
      q: t('faq.q3', 'How can I try MindLoop AI tools?'),
      a: t('faq.a3', 'You can try our browser AI playground directly on the homepage or test code snippets in our Products section.')
    },
    {
      q: 'Are C³ MindLoop developer tools free to use?',
      a: 'Yes. The browser-based tools are free to use without an account.'
    },
    {
      q: t('faq.q5', 'How can I get involved in the community?'),
      a: 'You can contact C³ MindLoop with feedback or questions about the available tools and resources.'
    }
  ];

  return (
    <section className="py-16 lg:py-20 bg-app border-b border-theme-subtle relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="max-w-3xl mb-12 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#1D9BF0] font-normal block">
            {t('faq.kicker', 'Clear Answers')}
          </span>
          <h2 className="text-h1 text-theme-main font-bold">
            {t('faq.title', 'Frequently Asked Questions')}
          </h2>
          <p className="text-body-large text-theme-muted font-normal">
            {t('faq.subtitle', 'Everything you need to know about C³ MindLoop, our products, and community.')}
          </p>
        </div>

        {/* Accordion Container - Spans max-w-3xl with Clean Border Row Separators */}
        <div className="max-w-3xl border-t border-b border-theme-subtle divide-y divide-theme-subtle">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              id={`faq-${index}`}
              title={faq.q}
              content={faq.a}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
