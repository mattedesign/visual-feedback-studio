import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// TypeScript interfaces
export interface StripeCustomer {
  id: string;
  email: string;
  created: number;
  metadata?: Record<string, string>;
}

export interface CheckoutSession {
  id: string;
  url: string | null;
  customer: string;
  payment_status: 'paid' | 'unpaid' | 'no_payment_required';
  status: 'open' | 'complete' | 'expired';
}

export interface SubscriptionStatus {
  id: string;
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid';
  current_period_start: number;
  current_period_end: number;
  customer: string;
  plan: {
    id: string;
    amount: number;
    currency: string;
    interval: 'month' | 'year';
  };
}

export interface CreateCheckoutSessionParams {
  customerId: string;
  planType: 'monthly' | 'yearly';
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

// Initialize Stripe client
const getStripe = async () => {
  const publishableKey = "pk_live_5lRaokhB0UJfRbf1HhcfxUHMYpa4dVIPDJ1WGAnUgULBKx6rsMbbIY2JIzMRgx3OqH7KokItSTfCizlzKFJ9IXCOKy00hWKp75Md";
  if (!publishableKey) {
    throw new Error('Stripe publishable key is not configured');
  }
  return await loadStripe(publishableKey);
};

// Stripe service functions
export const stripeService = {
  /**
   * Create a new Stripe customer
   */
  async createStripeCustomer(email: string, userId: string): Promise<StripeCustomer | null> {
    try {
      console.log('Creating Stripe customer for:', { email, userId });
      
      const { data, error } = await supabase.functions.invoke('create-stripe-customer', {
        body: {
          email,
          userId,
          metadata: {
            supabase_user_id: userId
          }
        }
      });

      if (error) {
        console.error('Error creating Stripe customer:', error);
        toast.error('Failed to create customer account');
        return null;
      }

      if (!data || !data.customer) {
        console.error('No customer data returned from Stripe');
        toast.error('Failed to create customer account');
        return null;
      }

      console.log('Stripe customer created successfully:', data.customer.id);
      return data.customer;
    } catch (error) {
      console.error('Error in createStripeCustomer:', error);
      toast.error('Failed to create customer account');
      return null;
    }
  },

  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CheckoutSession | null> {
    try {
      console.log('Creating checkout session with params:', params);
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          customerId: params.customerId,
          planType: params.planType,
          successUrl: params.successUrl,
          cancelUrl: params.cancelUrl,
          metadata: params.metadata || {}
        }
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        toast.error('Failed to create payment session');
        return null;
      }

      if (!data || !data.session) {
        console.error('No session data returned from Stripe');
        toast.error('Failed to create payment session');
        return null;
      }

      console.log('Checkout session created successfully:', data.session.id);
      return data.session;
    } catch (error) {
      console.error('Error in createCheckoutSession:', error);
      toast.error('Failed to create payment session');
      return null;
    }
  },

  /**
   * Get customer subscriptions
   */
  async getCustomerSubscriptions(customerId: string): Promise<SubscriptionStatus[] | null> {
    try {
      console.log('Fetching subscriptions for customer:', customerId);
      
      const { data, error } = await supabase.functions.invoke('get-customer-subscriptions', {
        body: { customerId }
      });

      if (error) {
        console.error('Error fetching customer subscriptions:', error);
        toast.error('Failed to fetch subscription data');
        return null;
      }

      if (!data || !data.subscriptions) {
        console.log('No subscriptions found for customer:', customerId);
        return [];
      }

      console.log('Subscriptions fetched successfully:', data.subscriptions.length);
      return data.subscriptions;
    } catch (error) {
      console.error('Error in getCustomerSubscriptions:', error);
      toast.error('Failed to fetch subscription data');
      return null;
    }
  },

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      console.log('Canceling subscription:', subscriptionId);
      
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { subscriptionId }
      });

      if (error) {
        console.error('Error canceling subscription:', error);
        toast.error('Failed to cancel subscription');
        return false;
      }

      if (!data || !data.success) {
        console.error('Subscription cancellation failed');
        toast.error('Failed to cancel subscription');
        return false;
      }

      console.log('Subscription canceled successfully');
      toast.success('Subscription canceled successfully');
      return true;
    } catch (error) {
      console.error('Error in cancelSubscription:', error);
      toast.error('Failed to cancel subscription');
      return false;
    }
  },

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(subscriptionId: string): Promise<SubscriptionStatus | null> {
    try {
      console.log('Fetching subscription status for:', subscriptionId);
      
      const { data, error } = await supabase.functions.invoke('get-subscription-status', {
        body: { subscriptionId }
      });

      if (error) {
        console.error('Error fetching subscription status:', error);
        toast.error('Failed to fetch subscription status');
        return null;
      }

      if (!data || !data.subscription) {
        console.error('No subscription data returned');
        toast.error('Subscription not found');
        return null;
      }

      console.log('Subscription status fetched successfully:', data.subscription.status);
      return data.subscription;
    } catch (error) {
      console.error('Error in getSubscriptionStatus:', error);
      toast.error('Failed to fetch subscription status');
      return null;
    }
  },

  /**
   * Redirect to checkout
   */
  async redirectToCheckout(sessionId: string): Promise<boolean> {
    try {
      const stripe = await getStripe();
      if (!stripe) {
        toast.error('Stripe failed to initialize');
        return false;
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        console.error('Stripe redirect error:', error);
        toast.error('Failed to redirect to checkout');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in redirectToCheckout:', error);
      toast.error('Failed to redirect to checkout');
      return false;
    }
  },

  /**
   * Get pricing configuration
   */
  getPricingConfig() {
    return {
      monthlyPriceId: "price_1RdxIAB0UJfBqFIHrJkzb238",
      yearlyPriceId: "price_1RdxIfB0UJfBqFIHMGtudpgk",
      monthlyAmount: 1999, // $19.99 in cents
      yearlyAmount: 19900, // $199.00 in cents
    };
  },

  /**
   * Validate Stripe configuration
   */
  validateConfiguration(): { isValid: boolean; missingKeys: string[] } {
    const config = this.getPricingConfig();
    const missingKeys: string[] = [];
    
    if (!config.monthlyPriceId) missingKeys.push('monthlyPriceId');
    if (!config.yearlyPriceId) missingKeys.push('yearlyPriceId');
    
    return {
      isValid: missingKeys.length === 0,
      missingKeys
    };
  },

  /**
   * Create customer portal session
   */
  async createCustomerPortalSession(customerId: string, returnUrl: string): Promise<string | null> {
    try {
      console.log('Creating customer portal session for:', customerId);
      
      const { data, error } = await supabase.functions.invoke('create-customer-portal', {
        body: {
          customerId,
          returnUrl
        }
      });

      if (error) {
        console.error('Error creating customer portal session:', error);
        toast.error('Failed to access customer portal');
        return null;
      }

      if (!data || !data.url) {
        console.error('No portal URL returned');
        toast.error('Failed to access customer portal');
        return null;
      }

      console.log('Customer portal session created successfully');
      return data.url;
    } catch (error) {
      console.error('Error in createCustomerPortalSession:', error);
      toast.error('Failed to access customer portal');
      return null;
    }
  }
};

// Helper function to format subscription status for display
export const formatSubscriptionStatus = (status: string): string => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'canceled':
      return 'Canceled';
    case 'incomplete':
      return 'Incomplete';
    case 'incomplete_expired':
      return 'Incomplete (Expired)';
    case 'past_due':
      return 'Past Due';
    case 'trialing':
      return 'Trial';
    case 'unpaid':
      return 'Unpaid';
    default:
      return 'Unknown';
  }
};

// Helper function to format currency amounts
export const formatCurrency = (amount: number, currency: string = 'usd'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

// Helper function to get plan name from price ID
export const getPlanName = (priceId: string): string => {
  const config = stripeService.getPricingConfig();
  if (priceId === config.monthlyPriceId) {
    return 'Pro Monthly';
  } else if (priceId === config.yearlyPriceId) {
    return 'Enterprise Yearly';
  }
  return 'Unknown Plan';
};
