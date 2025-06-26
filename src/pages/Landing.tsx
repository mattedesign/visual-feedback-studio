
import React from 'react';
import { ContextualGradientLayout } from '@/components/ui/ContextualGradientLayout';
import { ParticleSystem } from '@/components/ui/ParticleSystem';
import { ModernHeader } from '@/components/ui/ModernHeader';
import { ContextualHeroSection } from '@/components/sections/ContextualHeroSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { CTASection } from '@/components/sections/CTASection';
import { PricingCards } from '@/components/subscription/PricingCards';

const Landing = () => {
  // Debug logging to verify component renders
  React.useEffect(() => {
    console.log('Contextual Landing component rendered');
  }, []);

  return (
    <ContextualGradientLayout>
      <div className="relative min-h-screen overflow-hidden">
        {/* Particle System Background */}
        <ParticleSystem particleCount={30} />
        
        {/* Modern Header */}
        <ModernHeader />
        
        {/* Contextual Hero Section */}
        <ContextualHeroSection />
        
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
    </ContextualGradientLayout>
  );
};

export default Landing;
