import type { Metadata } from 'next';
import { CronVisualizerPage } from '@/app/views/CronVisualizerPage';
import { seoConfig, cronVisualizerSchema } from './../../config/seo.config';

const { cronVisualizer } = seoConfig;

const cronFaqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is standard Cron syntax?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Standard cron syntax is a time-based job scheduling format consisting of 5 space-separated fields representing: Minute (0-59), Hour (0-23), Day of Month (1-31), Month (1-12), and Day of Week (0-6). Some advanced systems utilize a 6-part syntax that includes an additional seconds field at the beginning or a year field at the end.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I calculate future execution times in UTC?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, absolutely. The C³ MindLoop Cron engine automatically computes upcoming job execution schedules in real-time, displaying timestamps translated into both your native local browser timezone and synchronized Coordinated Universal Time (UTC) for seamless server alignment.',
      },
    },
  ],
};

export const metadata: Metadata = {
  title: 'Cron Expression Visualizer & Generator - Free Online Tool | 100% Private Client-Side',
  description: 'Free, 100% private client-side Cron Expression Visualizer & Generator. Parse, validate, and build standard 5-part and 6-part cron schedules locally in your browser with real-time UTC projection.',
  keywords: [...cronVisualizer.keywords],
  alternates: { canonical: cronVisualizer.canonical },
  openGraph: {
    ...cronVisualizer.openGraph,
    title: 'Cron Expression Visualizer & Generator - Free Online Tool | 100% Private Client-Side',
    description: 'Free, 100% private client-side Cron Expression Visualizer & Generator. Parse, validate, and build standard 5-part and 6-part cron schedules locally in your browser with real-time UTC projection.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cron Expression Visualizer & Generator - Free Online Tool | 100% Private Client-Side',
    description: 'Free, 100% private client-side Cron Expression Visualizer & Generator. Parse, validate, and build standard 5-part and 6-part cron schedules locally in your browser with real-time UTC projection.',
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cronVisualizerSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cronFaqPageSchema) }}
      />
      <CronVisualizerPage />
    </>
  );
}
