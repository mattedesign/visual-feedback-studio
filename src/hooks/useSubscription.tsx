import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Subscription {
  id: string;
  plan_type: 'trial' | 'monthly' | 'yearly' | 'unlimited_admin';
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  analyses_used: number;
  analyses_limit: number;
  current_period_start?: string;
  current_period_end?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  product_id?: string;
  product?: {
    id: string;
    name: string;
    analyses_limit: number;
    price_monthly?: number;
    price_yearly?: number;
  };
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSubscription = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          products:product_id (
            id,
            name,
            analyses_limit,
            price_monthly,
            price_yearly
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No subscription found - initialize trial for new user
        const { data: newSub, error: initError } = await supabase
          .rpc('initialize_user_subscription', { p_user_id: user.id });
        
        if (!initError) {
          // Refetch after initialization
          await fetchSubscription();
          return;
        } else {
          console.error('useSubscription: Error initializing subscription:', initError);
        }
      }

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const subscriptionData: Subscription = {
          id: data.id,
          plan_type: data.plan_type as 'trial' | 'monthly' | 'yearly' | 'unlimited_admin',
          status: data.status as 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete',
          analyses_used: data.analyses_used,
          analyses_limit: data.analyses_limit,
          current_period_start: data.current_period_start,
          current_period_end: data.current_period_end,
          stripe_customer_id: data.stripe_customer_id,
          stripe_subscription_id: data.stripe_subscription_id,
          product_id: data.product_id,
          product: data.products ? {
            id: data.products.id,
            name: data.products.name,
            analyses_limit: data.products.analyses_limit,
            price_monthly: data.products.price_monthly,
            price_yearly: data.products.price_yearly,
          } : undefined,
        };
        
        setSubscription(subscriptionData);
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error('useSubscription: Error fetching subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is an active subscriber (monthly/yearly with active status)
  const isActiveSubscriber = () => {
    if (!subscription) return false;
    
    // Handle unlimited admin plan - they are always active
    if (subscription.plan_type === 'unlimited_admin') {
      return true;
    }
    
    return (subscription.plan_type === 'yearly' || subscription.plan_type === 'monthly') && 
           subscription.status === 'active';
  };

  // Check if user is on trial
  const isTrialUser = () => {
    if (!subscription) return false;
    return subscription.plan_type === 'trial';
  };

  // Check if user needs subscription (trial expired or no subscription)
  const needsSubscription = () => {
    if (!subscription) return true;
    
    // Unlimited admin users never need subscription upgrade
    if (subscription.plan_type === 'unlimited_admin') {
      return false;
    }
    
    if (isActiveSubscriber()) {
      return false;
    }
    
    if (isTrialUser()) {
      return subscription.analyses_used >= subscription.analyses_limit;
    }
    
    return true;
  };

  // Main function to check if user can create analysis
  const canCreateAnalysis = () => {
    if (!subscription) return false;
    
    // Unlimited admin users can always create analyses
    if (subscription.plan_type === 'unlimited_admin') {
      return true;
    }
    
    // Active yearly or monthly subscribers can always create analyses
    if ((subscription.plan_type === 'yearly' || subscription.plan_type === 'monthly') && 
        subscription.status === 'active') {
      return true;
    }
    
    // Trial users can create if they have analyses left
    if (subscription.plan_type === 'trial' && 
        subscription.analyses_used < subscription.analyses_limit) {
      return true;
    }
    
    return false;
  };

  const checkAnalysisLimit = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('check_analysis_limit', {
        p_user_id: user.id
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error checking analysis limit:', err);
      return false;
    }
  };

  const incrementAnalysisUsage = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('increment_analysis_usage', {
        p_user_id: user.id
      });

      if (error) throw error;
      
      // Refresh subscription data after incrementing
      if (data) {
        await fetchSubscription();
      }
      
      return data;
    } catch (err) {
      console.error('Error incrementing analysis usage:', err);
      return false;
    }
  };

  const getRemainingAnalyses = () => {
    if (!subscription) return 0;
    
    // Unlimited admin users have unlimited analyses
    if (subscription.plan_type === 'unlimited_admin') {
      return 999999; // Show a very high number
    }
    
    // Determine effective limit - prioritize product-based limit if available
    let effectiveLimit = subscription.analyses_limit;
    if (subscription.product?.analyses_limit) {
      effectiveLimit = subscription.product.analyses_limit;
    }
    
    // Active monthly/yearly subscribers use product or fallback limit
    if (isActiveSubscriber()) {
      return Math.max(0, effectiveLimit - subscription.analyses_used);
    }
    
    // Trial users have product-defined or default limit
    if (isTrialUser()) {
      return Math.max(0, effectiveLimit - subscription.analyses_used);
    }
    
    return 0;
  };

  const getUsagePercentage = () => {
    if (!subscription) return 0;
    
    // Unlimited admin users show 0% usage
    if (subscription.plan_type === 'unlimited_admin') {
      return 0;
    }
    
    // Determine effective limit - prioritize product-based limit if available
    let effectiveLimit = subscription.analyses_limit;
    if (subscription.product?.analyses_limit) {
      effectiveLimit = subscription.product.analyses_limit;
    }
    
    // All users (trial and paid) show actual percentage now
    if (effectiveLimit > 0) {
      return (subscription.analyses_used / effectiveLimit) * 100;
    }
    
    return 100; // No subscription = 100% used
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  return {
    subscription,
    loading,
    error,
    checkAnalysisLimit,
    incrementAnalysisUsage,
    canCreateAnalysis,
    isActiveSubscriber,
    isTrialUser,
    needsSubscription,
    getRemainingAnalyses,
    getUsagePercentage,
    refetch: fetchSubscription
  };
};
