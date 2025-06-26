
import React from 'react';
import { Check } from 'lucide-react';
import { PricingBadge } from './PricingBadge';
import { PricingFeatures } from './PricingFeatures';
import { PricingButton } from './PricingButton';
import type { PricingPlan } from '@/config/pricingPlans';

interface PricingCardProps {
  plan: PricingPlan;
  loading: string | null;
  isCurrentPlan: boolean;
  onSubscribe: (plan: PricingPlan) => void;
}

export const PricingCard = ({ plan, loading, isCurrentPlan, onSubscribe }: PricingCardProps) => {
  return (
    <div className={`pricing-card ${plan.popular ? 'popular-card' : ''}`}>
      <PricingBadge
        text={plan.badge.text}
        variant={plan.badge.variant}
        icon={plan.badge.icon}
        popular={plan.popular}
      />

      <div className="p-8 pt-12">
        {/* Plan Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {plan.name}
          </h3>
          <div className="mb-3">
            <span className={`text-5xl font-bold ${
              plan.popular ? 'gradient-text' : 'text-gray-900'
            }`}>
              {plan.price}
            </span>
          </div>
          <p className="text-lg text-gray-600 mb-2">{plan.period}</p>
          {plan.id === 'annual' && (
            <p className="text-green-600 text-sm font-semibold inline-flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
              <Check className="h-3 w-3" />
              Save 17% compared to monthly
            </p>
          )}
        </div>

        <PricingFeatures features={plan.features} />

        <PricingButton
          planId={plan.id}
          planName={plan.name}
          popular={plan.popular}
          loading={loading}
          isCurrentPlan={isCurrentPlan}
          onSubscribe={() => onSubscribe(plan)}
        />
      </div>
    </div>
  );
};
