import React from 'react';
import { HeroSection } from '@/components/features/hero-section';
import { FeaturesSection } from '@/components/features/features-section';
import { HowItWorksSection } from '@/components/sections/how-it-works';
import { PricingSection } from '@/components/sections/pricing';

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
    </div>
  );
}
