import type { Metadata } from 'next';
import { JsonFormatterPage } from './../../views/JsonFormatterPage';
import { seoConfig, jsonFormatterSchema } from './../../config/seo.config';

const { jsonFormatter } = seoConfig;

export const metadata: Metadata = {
  title: jsonFormatter.title,
  description: jsonFormatter.description,
  keywords: [...jsonFormatter.keywords],
  alternates: { canonical: jsonFormatter.canonical },
  openGraph: jsonFormatter.openGraph,
  twitter: { card: 'summary_large_image', ...jsonFormatter.twitter },
};

const faqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': [
    {
      '@type': 'Question',
      'name': 'What is a JSON Formatter and why is it used?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'A JSON Formatter is a developer utility designed to parse raw, minified JSON text and restructure it with consistent indentation and line breaks, transforming dense strings into highly readable text. This process is commonly referred to as beautifying or pretty-printing. Developers use it to debug complex API payloads, inspect structured config files, locate nesting anomalies, and communicate structural state information clearly to team members. Additionally, our formatter acts as a validator, alerting you to broken JSON structures or mismatched brackets before your application code parses them.'
      }
    },
    {
      '@type': 'Question',
      'name': 'Is this JSON Formatter secure for sensitive corporate configs and API keys?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'Absolutely. The core security advantage of our platform is that all operations run 100% locally inside your browser context using client-side JavaScript. Unlike conventional online formatters that transmit your data to backend servers-exposing sensitive credentials, private keys, or customer records to potential database logging and third-party monitoring-our formatter runs offline. Your JSON payload never traverses the internet, assuring strict compliance with corporate data protection policies, SOC 2 protocols, and general privacy requirements.'
      }
    },
    {
      '@type': 'Question',
      'name': 'How does the built-in syntax error detector work?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'When you enter a JSON string, the tool processes it using your browser\'s native V8 JavaScript parser. If the structure violates RFC 8259 guidelines (for instance, if there is a trailing comma, a missing quotation mark, or unmatched brackets), the parser throws a syntax error. Our application catches this error, extracts the character position and context, and maps it to a human-readable line and column indicator. This live error feedback helps you troubleshoot and correct structural mistakes instantly without guessing.'
      }
    },
    {
      '@type': 'Question',
      'name': 'Can I use this JSON tool without an active internet connection?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'Yes. Because the formatting, tree rendering, and validation algorithms are implemented purely in client-side code and do not require server-side execution, you can load the page once and run it offline. It is fully functional in low-connectivity environments, inside restricted enterprise intranets, or when working on local dev servers with no external network routes.'
      }
    },
    {
      '@type': 'Question',
      'name': 'Why should I choose client-side tools over cloud-based formatters?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'Cloud-based formatters require sending your payloads over the wire to their servers, where your data could be cached, logged, or intercepted. A local client-side formatter guarantees that your data stays on your machine. This eliminates security risks, reduces bandwidth latency, and guarantees instantaneous performance regardless of your network connection speed. It is the professional engineering standard for working with production database dumps and secure configuration files.'
      }
    }
  ]
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonFormatterSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />
      <JsonFormatterPage />
    </>
  );
}
