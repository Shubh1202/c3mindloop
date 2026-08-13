import type { Metadata } from 'next';
import { AtsResumePage } from '@/app/views/AtsResumePage';
import { seoConfig, atsResumeSchema } from '@/app/config/seo.config';

const { atsResume } = seoConfig;

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
      <AtsResumePage />
    </>
  );
}
