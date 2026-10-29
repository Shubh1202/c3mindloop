'use client';

import React from 'react';
import { Hero } from '../components/sections/Hero';
import { CollaborationShowcase } from '../components/sections/CollaborationShowcase';
import { BrandPhilosophySection } from '../components/sections/BrandPhilosophySection';
import { FeaturesSection } from '../components/sections/FeaturesSection';
import { ProductsPreviewSection } from '../components/sections/ProductsPreviewSection';
import { CommunitySection } from '../components/sections/CommunitySection';
import { RoadmapSection } from '../components/sections/RoadmapSection';
import { FAQSection } from '../components/sections/FAQSection';
import { ReviewSection } from '../components/ui/ReviewSection';
import { CTASection } from '../components/sections/CTASection';

export const HomePage: React.FC = () => {
  return (
    <div>
      {/* LCP section — render immediately, no content-visibility deferral */}
      <Hero />

      {/* First below-fold section: still near viewport, not deferred */}
      <CollaborationShowcase />

      {/* Remaining sections are well below the fold — defer layout/paint
          with content-visibility:auto to free main-thread time during LCP. */}
      <div className="cv-auto">
        <BrandPhilosophySection />
      </div>
      <div className="cv-auto">
        <FeaturesSection />
      </div>
      <div className="cv-auto">
        <ProductsPreviewSection />
      </div>
      <div className="cv-auto">
        <CommunitySection />
      </div>
      <div className="cv-auto">
        <ReviewSection limit={3} showViewAllLink={true} />
      </div>
      <div className="cv-auto">
        <RoadmapSection />
      </div>
      <div className="cv-auto">
        <FAQSection />
      </div>
      <div className="cv-auto">
        <CTASection />
      </div>
    </div>
  );
};
