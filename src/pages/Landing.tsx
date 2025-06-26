
import React from 'react';
import { GradientLayout } from '@/components/ui/GradientLayout';
import { ParticleSystem } from '@/components/ui/ParticleSystem';
import { ModernHeader } from '@/components/ui/ModernHeader';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { CTASection } from '@/components/sections/CTASection';
import { PricingCards } from '@/components/subscription/PricingCards';

const Landing = () => {
  // Debug logging to verify component renders
  React.useEffect(() => {
    console.log('Modern Landing component rendered');
  }, []);

  return (
    <GradientLayout variant="purple" intensity="subtle" speed="slow" orbCount={8}>
      <div className="relative min-h-screen overflow-hidden">
        {/* Particle System Background */}
        <ParticleSystem particleCount={30} />
        
        {/* Modern Header */}
        <ModernHeader />
        
        {/* Hero Section */}
        <HeroSection />
        
        {/* Features Section */}
        <FeaturesSection />
        
        {/* Testimonials Section */}
        <TestimonialsSection />
        
        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-4 bg-gray-50/50">
          <PricingCards />
        </section>
        
        {/* CTA Section */}
        <CTASection />
      </div>
    </GradientLayout>
  );
};

export default Landing;
