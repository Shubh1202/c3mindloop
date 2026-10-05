import type { Metadata } from 'next';
import { QrCodeGeneratorPage } from '@/app/views/QrCodeGeneratorPage';
import { seoConfig, qrCodeGeneratorSchema } from '../../config/seo.config';

const { qrCodeGenerator } = seoConfig;

const qrCodeGeneratorFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is my data sent to a server when generating a QR code?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. All QR code generation happens 100% in your browser using the qrcode npm library. No data is transmitted to any server — your URLs, text, Wi-Fi passwords, or contact information never leave your device.',
      },
    },
    {
      '@type': 'Question',
      name: 'What types of QR codes can I generate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can generate QR codes for URLs, plain text, email addresses (mailto:), phone numbers (tel:), Wi-Fi networks (WPA/WEP), and vCard contact cards. Each type auto-formats the QR content correctly.',
      },
    },
    {
      '@type': 'Question',
      name: 'What export formats are available?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can download your QR code as PNG (lossless raster), WebP (compressed raster), or SVG (infinitely scalable vector). You can also copy the image to clipboard directly or copy the SVG markup.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is Error Correction Level?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Error correction allows the QR code to remain scannable even when partially damaged. Levels range from L (7% recovery, smallest size) to H (30% recovery, most robust). Use H when you plan to overlay a logo on the QR code.',
      },
    },
  ],
};

export const metadata: Metadata = {
  title: 'QR Code Generator — Free Online Tool | URL, Wi-Fi, vCard | C³ MindLoop',
  description: 'Free, 100% private QR code generator. Create QR codes for URLs, text, email, phone, Wi-Fi, and vCard contacts. Export as PNG, WebP, or SVG. Custom colors & error correction. All client-side.',
  keywords: qrCodeGenerator.keywords,
  alternates: { canonical: qrCodeGenerator.canonical },
  openGraph: {
    ...qrCodeGenerator.openGraph,
    title: 'QR Code Generator — Free Online Tool | URL, Wi-Fi, vCard | C³ MindLoop',
    description: 'Free, 100% private QR code generator. Create QR codes for URLs, text, email, phone, Wi-Fi, and vCard contacts. Export as PNG, WebP, or SVG.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR Code Generator — Free Online Tool | C³ MindLoop',
    description: 'Free QR code generator for URLs, Wi-Fi, vCard, email, phone. PNG/SVG export. 100% client-side.',
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(qrCodeGeneratorSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(qrCodeGeneratorFaqSchema) }}
      />
      <QrCodeGeneratorPage />
    </>
  );
}
