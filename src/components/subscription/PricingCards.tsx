
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
      <style>{`
        :root {
          --rg-gradient-angle: 96deg;
          --rg-gradient-a: linear-gradient(var(--rg-gradient-angle, 96deg), #d1fbff 0%, #75cfff 29.13%, #978aff 70.56%);
          --rg-gradient-a-75: linear-gradient(var(--rg-gradient-angle, 96deg), rgba(209, 251, 255, .75) 0%, rgba(117, 207, 255, .75) 29.13%, rgba(151, 138, 255, .75) 70.56%);
          --rg-gradient-a-50: linear-gradient(var(--rg-gradient-angle, 96deg), rgba(209, 251, 255, .5) 0%, rgba(117, 207, 255, .5) 29.13%, rgba(151, 138, 255, .5) 70.56%);
          --rg-gradient-a-25: linear-gradient(var(--rg-gradient-angle, 96deg), rgba(209, 251, 255, .25) 0%, rgba(117, 207, 255, .25) 29.13%, rgba(151, 138, 255, .25) 70.56%);
          --rg-gradient-a-pressed: linear-gradient(var(--rg-gradient-angle, 96deg), rgba(209, 251, 255, .5) 0%, rgba(117, 207, 255, .75) 29.13%, #978aff 70.56%);
        }

        .pricing-card {
          position: relative;
          background: white;
          border-radius: 16px;
          border: 2px solid #e2e8f0;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .pricing-card:hover {
          transform: translateY(-8px);
          border: 2px solid transparent;
          background-image: linear-gradient(white, white), var(--rg-gradient-a);
          background-origin: border-box;
          background-clip: padding-box, border-box;
          box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.1), 
            0 10px 10px -5px rgba(0, 0, 0, 0.04),
            0 0 0 1px rgba(209, 251, 255, 0.3);
        }

        .pricing-card:active {
          background-image: linear-gradient(white, white), var(--rg-gradient-a-pressed);
        }

        .gradient-text {
          background: var(--rg-gradient-a);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }

        .gradient-badge {
          background: var(--rg-gradient-a-25);
          border: 1px solid rgba(209, 251, 255, 0.4);
        }

        .gradient-button {
          background: var(--rg-gradient-a);
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .gradient-button:hover {
          background: var(--rg-gradient-a-75);
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .gradient-button:active {
          background: var(--rg-gradient-a-pressed);
          transform: translateY(0);
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .popular-card {
          border: 2px solid rgba(151, 138, 255, 0.3);
          background-image: linear-gradient(white, white), var(--rg-gradient-a-25);
          background-origin: border-box;
          background-clip: padding-box, border-box;
        }

        .popular-card:hover {
          background-image: linear-gradient(white, white), var(--rg-gradient-a);
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
          <div
            key={plan.id}
            className={`pricing-card ${plan.popular ? 'popular-card' : ''}`}
          >
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <Badge 
                className={`px-4 py-2 text-sm font-semibold ${
                  plan.popular ? 'gradient-badge text-purple-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  {plan.badge.icon}
                  {plan.badge.text}
                </span>
              </Badge>
            </div>

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

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-600" />
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
                  w-full py-4 text-lg font-semibold border-0 text-white
                  ${plan.popular 
                    ? 'gradient-button' 
                    : 'bg-gray-900 hover:bg-gray-800 active:bg-gray-900'
                  }
                  ${isCurrentPlan(plan.id) 
                    ? '!bg-green-600 hover:!bg-green-600 cursor-default' 
                    : ''
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                  focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                `}
              >
                {loading === plan.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </span>
                ) : isCurrentPlan(plan.id) ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="h-5 w-5" />
                    Current Plan
                  </span>
                ) : (
                  'Get Started'
                )}
              </Button>

              {isCurrentPlan(plan.id) && (
                <p className="text-center text-sm text-gray-500 mt-3">
                  You're currently subscribed to this plan
                </p>
              )}
            </div>
          </div>
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
