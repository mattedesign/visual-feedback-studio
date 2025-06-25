
import React, { useState } from 'react';
import { Check, Zap, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { stripeService } from '@/services/stripeService';
import { toast } from 'sonner';
import { PricingCard } from './PricingCard';

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  priceId: string;
  badge: {
    text: string;
    variant: 'default' | 'secondary';
    icon: React.ReactNode;
  };
  features: string[];
  popular?: boolean;
}

export const PricingCards = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);

  const plans: PricingPlan[] = [
    {
      id: 'monthly',
      name: 'Pro Monthly',
      price: '$19.99',
      period: 'per month',
      priceId: stripeService.getPricingConfig().monthlyPriceId,
      badge: {
        text: 'Most Popular',
        variant: 'default',
        icon: <Zap className="h-3 w-3" />
      },
      features: [
        'Unlimited analyses',
        'Priority support',
        'Advanced insights',
        'Export capabilities'
      ],
      popular: true
    },
    {
      id: 'annual',
      name: 'Pro Annual',
      price: '$199.99',
      period: 'per year',
      priceId: stripeService.getPricingConfig().yearlyPriceId,
      badge: {
        text: 'Best Value',
        variant: 'secondary',
        icon: <Crown className="h-3 w-3" />
      },
      features: [
        'Unlimited analyses',
        'Priority support',
        'Advanced insights',
        'Export capabilities',
        '2 months free',
        'Early access features'
      ]
    }
  ];

  const handleSubscribe = async (plan: PricingPlan) => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    setLoading(plan.id);
    
    try {
      // Create or get Stripe customer
      const customer = await stripeService.createStripeCustomer(user.email!, user.id);
      if (!customer) {
        throw new Error('Failed to create customer');
      }

      // Create checkout session
      const session = await stripeService.createCheckoutSession({
        customerId: customer.id,
        priceId: plan.priceId,
        successUrl: `${window.location.origin}/subscription?success=true`,
        cancelUrl: `${window.location.origin}/subscription?canceled=true`,
        metadata: {
          plan_name: plan.name,
          user_id: user.id
        }
      });

      if (!session?.url) {
        throw new Error('Failed to create checkout session');
      }

      // Open Stripe checkout in a new tab
      window.open(session.url, '_blank');
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to start subscription process');
    } finally {
      setLoading(null);
    }
  };

  const isCurrentPlan = (planId: string) => {
    if (!subscription) return false;
    return (planId === 'monthly' && subscription.plan_type === 'monthly') ||
           (planId === 'annual' && subscription.plan_type === 'yearly');
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <style>{`
        .pricing-card {
          position: relative;
          background: white;
          border-radius: 16px;
          border: 2px solid #e2e8f0;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .pricing-card:hover {
          border-color: transparent;
          background: linear-gradient(white, white) padding-box,
                     linear-gradient(135deg, #d1fbff, #75cfff, #978aff) border-box;
          box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.1),
                     0 0 0 1px rgba(209, 251, 255, 0.3);
        }

        .popular-card {
          border-color: rgba(151, 138, 255, 0.3);
          background: linear-gradient(white, white) padding-box,
                     linear-gradient(135deg, rgba(209, 251, 255, 0.3), rgba(117, 207, 255, 0.3), rgba(151, 138, 255, 0.3)) border-box;
        }

        .popular-card:hover {
          background: linear-gradient(white, white) padding-box,
                     linear-gradient(135deg, #d1fbff, #75cfff, #978aff) border-box;
          box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.15),
                     0 0 0 1px rgba(209, 251, 255, 0.5);
        }

        .gradient-text {
          background: linear-gradient(135deg, #d1fbff, #75cfff, #978aff);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .gradient-badge {
          background: linear-gradient(135deg, rgba(209, 251, 255, 0.3), rgba(117, 207, 255, 0.3), rgba(151, 138, 255, 0.3));
          border: 1px solid rgba(209, 251, 255, 0.4);
        }

        .gradient-button {
          background: linear-gradient(135deg, #d1fbff, #75cfff, #978aff);
          transition: all 0.3s ease;
        }

        .gradient-button:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      `}</style>

      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Upgrade to unlock unlimited design analyses and premium features
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            loading={loading}
            isCurrentPlan={isCurrentPlan(plan.id)}
            onSubscribe={handleSubscribe}
          />
        ))}
      </div>

      {/* Additional Info */}
      <div className="text-center mt-16 space-y-3">
        <div className="flex items-center justify-center gap-6 text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>30-day money-back guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>Cancel anytime</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          All plans include SSL security, 99.9% uptime guarantee, and priority customer support
        </p>
      </div>
    </div>
  );
};
