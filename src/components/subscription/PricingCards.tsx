
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Crown, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { stripeService } from '@/services/stripeService';
import { toast } from 'sonner';

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
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-lg text-gray-600">
          Upgrade to unlock unlimited design analyses and premium features
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 md:gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`
              relative bg-white rounded-2xl border transition-all duration-[400ms] cubic-bezier(0.25, 0.46, 0.45, 0.94)
              hover:shadow-[0_20px_40px_-12px_rgba(209,251,255,0.4),0_15px_30px_-8px_rgba(117,207,255,0.3),0_10px_20px_-4px_rgba(151,138,255,0.25)]
              hover:-translate-y-2 hover:border-purple-200
              ${plan.popular ? 'border-purple-200 shadow-lg' : 'border-gray-200 shadow-sm'}
              ${isCurrentPlan(plan.id) ? 'ring-2 ring-purple-500 ring-opacity-20' : ''}
            `}
          >
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge 
                variant={plan.badge.variant}
                className={`
                  px-4 py-2 text-sm font-medium transition-all duration-300
                  hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white
                  ${plan.popular ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}
                `}
              >
                <span className="flex items-center gap-1">
                  {plan.badge.icon}
                  {plan.badge.text}
                </span>
              </Badge>
            </div>

            <div className="p-8 pt-12">
              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className={`
                    text-5xl font-bold transition-all duration-300
                    hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:bg-clip-text hover:text-transparent
                    ${plan.popular ? 'text-purple-600' : 'text-gray-900'}
                  `}>
                    {plan.price}
                  </span>
                </div>
                <p className="text-gray-500 text-lg">{plan.period}</p>
                {plan.id === 'annual' && (
                  <p className="text-green-600 text-sm font-medium mt-1">
                    Save 31% compared to monthly
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => handleSubscribe(plan)}
                disabled={!!loading || isCurrentPlan(plan.id)}
                className={`
                  w-full py-4 text-lg font-semibold transition-all duration-300
                  ${plan.popular 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                    : 'bg-gray-900 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600'
                  }
                  ${isCurrentPlan(plan.id) 
                    ? 'bg-green-600 hover:bg-green-600 cursor-default' 
                    : ''
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {loading === plan.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </span>
                ) : isCurrentPlan(plan.id) ? (
                  'Current Plan'
                ) : (
                  'Get Started'
                )}
              </Button>

              {isCurrentPlan(plan.id) && (
                <p className="text-center text-sm text-gray-500 mt-3">
                  You're currently on this plan
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="text-center mt-12 space-y-2">
        <p className="text-gray-600">
          30-day money-back guarantee • Cancel anytime
        </p>
        <p className="text-sm text-gray-500">
          All plans include SSL security and 99.9% uptime guarantee
        </p>
      </div>
    </div>
  );
};
