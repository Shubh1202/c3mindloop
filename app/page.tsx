import type { Metadata } from 'next';
import { HomePage } from '@/app/views/HomePage';
import { seoConfig } from './config/seo.config';

const { home } = seoConfig;

export const metadata: Metadata = {
  // Use title.absolute so the root layout's titleTemplate ('%s | C³ MindLoop')
  // is not applied — the home title already starts with the brand name.
  title: { absolute: home.title },
  description: home.description,
  keywords: [...home.keywords],
  alternates: { canonical: home.canonical },
  openGraph: home.openGraph,
  twitter: { card: 'summary_large_image', ...home.twitter },
};

const homepageFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What does C³ MindLoop stand for?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'C³ stands for Coding, Crashing, Crying - the actual loop every developer lives through daily. You write code, it breaks, you debug it, you ship. The superscript ³ is the honest shorthand for that cycle. MindLoop is the mental process that never fully switches off - you\'re in the shower thinking about a race condition, or waking up at 3am knowing why the null check failed. This platform is built around that developer reality, not a polished version of it.',
      },
    },
    {
      '@type': 'Question',
      name: 'What kind of tools does C³ MindLoop offer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All tools run 100% locally in your browser - no account, no backend, no data collection. The current lineup: JSON Formatter, JWT Inspector, Base64 Encoder, Regex Tester, Cron Visualizer, cURL Converter, SQL to JSON Converter, Hash Generator, and ATS Resume Generator. There\'s also an Office Editor VS Code extension with 14,400+ marketplace installs. Every tool processes your data inside your browser tab. Nothing leaves your machine.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I get started with the tools?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Go to the Tools page and pick one. No signup, no install, no waiting. Paste your JSON, JWT, Base64 string, or regex pattern directly into the editor and results appear instantly. Each tool is a standalone browser utility you can bookmark and return to anytime. The JSON Formatter and JWT Inspector are the most used. The ATS Resume Generator is useful if you are actively job hunting as a developer.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are C³ MindLoop developer tools free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes - the browser tools are free to use with no paywalls or usage limits. The Office Editor VS Code extension is also available through the Visual Studio Marketplace.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can I get involved in the community?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can reach out through the contact page with feedback or questions about C³ MindLoop tools and resources.',
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageFaqSchema) }}
      />
      <HomePage />
    </>
  );
}
