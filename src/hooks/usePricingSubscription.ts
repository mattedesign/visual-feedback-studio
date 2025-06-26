
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { stripeService } from '@/services/stripeService';
import { toast } from 'sonner';
import type { PricingPlan } from '@/config/pricingPlans';

export const usePricingSubscription = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);

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

  return {
    loading,
    handleSubscribe,
    isCurrentPlan
  };
};
