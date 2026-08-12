'use client';

import React, { useState } from 'react';
import { useTranslation } from '../../lib/i18n';
import { AccordionItem } from '../ui/Accordion';

interface ToolFaqAccordionProps {
  toolKey: string;
}

export const ToolFaqAccordion: React.FC<ToolFaqAccordionProps> = ({ toolKey }) => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: { q: string; a: string }[] = [];
  for (let i = 1; i <= 10; i++) {
    const qKey = `tools.${toolKey}.faq.q${i}`;
    const aKey = `tools.${toolKey}.faq.a${i}`;
    const q = t(qKey);
    const a = t(aKey);
    if (q && q !== qKey && a && a !== aKey) {
      faqs.push({ q, a });
    } else {
      break;
    }
  }

  if (faqs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto pt-6">
      <h2 className="text-lg font-bold text-theme-main text-center">
        {t('faq.title', 'Frequently Asked Questions')}
      </h2>
      <div className="border-t border-b border-theme-subtle divide-y divide-theme-subtle">
        {faqs.map((faq, index) => (
          <AccordionItem
            key={index}
            id={`tool-faq-${index}`}
            title={faq.q}
            content={faq.a}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </div>
  );
};
