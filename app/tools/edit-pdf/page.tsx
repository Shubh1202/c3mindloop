import type { Metadata } from 'next';
import { EditPdfPage } from '@/app/views/EditPdfPage';
import { seoConfig, editPdfSchema } from '../../config/seo.config';

const { editPdf } = seoConfig;

export const metadata: Metadata = {
  title: editPdf.title,
  description: editPdf.description,
  keywords: [...editPdf.keywords],
  alternates: { canonical: editPdf.canonical },
  openGraph: {
    ...editPdf.openGraph,
    title: editPdf.title,
    description: editPdf.description,
  },
  twitter: {
    card: 'summary_large_image',
    ...editPdf.twitter,
    title: editPdf.title,
    description: editPdf.description,
  },
};

const editPdfFaqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  'mainEntity': [
    {
      '@type': 'Question',
      'name': 'Is my PDF secure when using the C³ MindLoop PDF Editor?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'Yes, completely. The PDF Editor runs 100% locally in your web browser. Your document is never uploaded to a server- all editing, annotation, and export operations happen inside your browser memory sandbox.'
      }
    },
    {
      '@type': 'Question',
      'name': 'What can I do with the PDF Editor?',
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': 'You can add text overlays, draw whiteout rectangles to cover content, place images and stamps, draw freehand signatures, fill AcroForm fields, and manage pages by rotating, deleting, or reordering them. Edited documents can be exported and downloaded as a PDF.'
      }
    }
  ]
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(editPdfSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(editPdfFaqPageSchema) }}
      />
      <EditPdfPage />
    </>
  );
}
