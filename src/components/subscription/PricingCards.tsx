
import React from 'react';
import { pricingPlans } from '@/config/pricingPlans';
import { usePricingSubscription } from '@/hooks/usePricingSubscription';
import { PricingCard } from './PricingCard';
import { PricingStyles } from './PricingStyles';
import { PricingFooter } from './PricingFooter';
import { GradientLayout } from '@/components/ui/GradientLayout';

export const PricingCards = () => {
  const { loading, handleSubscribe, isCurrentPlan } = usePricingSubscription();

  return (
    <GradientLayout variant="purple" intensity="medium" speed="normal">
      <div className="w-full max-w-5xl mx-auto p-6 bg-white/95 backdrop-blur-sm rounded-lg">
        <PricingStyles />

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upgrade to unlock unlimited design analyses and premium features
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              loading={loading}
              isCurrentPlan={isCurrentPlan(plan.id)}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>

        <PricingFooter />
      </div>
    </GradientLayout>
  );
};
