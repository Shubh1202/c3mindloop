import type { Metadata } from 'next';
import { AtsResumePage } from '@/app/views/AtsResumePage';
import { seoConfig, atsResumeSchema } from '@/app/config/seo.config';

const { atsResume } = seoConfig;

const atsFaqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is this ATS Resume Generator really free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, fully free — no account, no premium tier, no watermarks, no character limits. Everything runs locally in your browser. You fill in the form, see a live preview, and export to PDF directly from your browser\'s print dialog. There\'s no SaaS subscription hiding behind a free trial. The source code is open and the tool will stay free.',
      },
    },
    {
      '@type': 'Question',
      name: 'What makes a resume \'ATS-compliant\'?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ATS systems like Workday, Lever, and Greenhouse parse resumes as plain text, not as visually formatted documents. That means multi-column layouts, icons, colored headers, progress bars, and embedded tables all break the parser. An ATS-compliant resume uses a single-column linear layout, standard section headings (Experience, Education, Skills), readable fonts like Arial or Helvetica, and no decorative graphics. This tool\'s output template is built specifically around those constraints.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I download my resume as a PDF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Click the \'Export PDF\' button in the top toolbar. This triggers your browser\'s built-in print dialog. In the destination dropdown, choose \'Save as PDF\'. Make sure headers and footers are turned off in the print options — those add browser chrome (URLs, page numbers) that don\'t belong on a resume. The output is a vector PDF, not a screenshot, so text remains selectable and parseable.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are my personal details sent to your servers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nothing leaves your browser. The entire tool runs as client-side JavaScript — there\'s no backend, no database, and no analytics capturing form input. Your name, email, employment history, and GitHub handle stay inside your browser tab. If you close the page, the data is gone. Use the Save JSON button to download a local backup of your progress that you can reload anytime.',
      },
    },
  ],
};

export const metadata: Metadata = {
  title: atsResume.title,
  description: atsResume.description,
  keywords: atsResume.keywords,
  alternates: { canonical: atsResume.canonical },
  openGraph: atsResume.openGraph,
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(atsResumeSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(atsFaqPageSchema) }}
      />
      <AtsResumePage />
    </>
  );
}
