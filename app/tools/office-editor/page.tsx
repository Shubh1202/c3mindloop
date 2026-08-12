import type { Metadata } from 'next';
import { OfficeEditorPage } from '@/app/views/OfficeEditorPage';
import { seoConfig, officeEditorSchema } from '@/app/config/seo.config';

const { officeEditor } = seoConfig;

export const metadata: Metadata = {
  title: officeEditor.title,
  description: officeEditor.description,
  keywords: [...officeEditor.keywords],
  alternates: { canonical: officeEditor.canonical },
  openGraph: officeEditor.openGraph,
  twitter: { card: 'summary_large_image', ...officeEditor.twitter },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(officeEditorSchema) }}
      />
      <OfficeEditorPage />
    </>
  );
}
