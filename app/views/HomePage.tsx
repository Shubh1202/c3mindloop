'use client';

import React from 'react';
import { Hero } from '../components/sections/Hero';
import { BrandPhilosophySection } from '../components/sections/BrandPhilosophySection';
import { FeaturesSection } from '../components/sections/FeaturesSection';
import { ProductsPreviewSection } from '../components/sections/ProductsPreviewSection';
import { CommunitySection } from '../components/sections/CommunitySection';
import { RoadmapSection } from '../components/sections/RoadmapSection';
import { FAQSection } from '../components/sections/FAQSection';
import { CTASection } from '../components/sections/CTASection';
import { SEOHead } from '../components/layout/SEOHead';
import { generateOrganizationSchema, generateWebsiteSchema } from '../lib/seo';

export const HomePage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="C³ MindLoop - Developer Utility Platform & Engineering Resources"
        description="A practical developer-first platform offering fast, privacy-focused browser utilities, developer tools, and real-world engineering resources. Coding. Crashing. Crying."
        canonical="/"
        extraSchema={{
          '@context': 'https://schema.org',
          '@graph': [generateOrganizationSchema(), generateWebsiteSchema()]
        }}
      />

      <div>
        <Hero />
        <BrandPhilosophySection />
        <FeaturesSection />
        <ProductsPreviewSection />
        <CommunitySection />
        <RoadmapSection />
        <FAQSection />
        <CTASection />
      </div>
    </>
  );
};
