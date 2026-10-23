'use client';

import React from 'react';
import { Hero } from '../components/sections/Hero';
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
        <Hero />
        <BrandPhilosophySection />
        <FeaturesSection />
        <ProductsPreviewSection />
        <CommunitySection />
        <ReviewSection limit={3} showViewAllLink={true} />
        <RoadmapSection />
        <FAQSection />
        <CTASection />
      </div>
  );
};
