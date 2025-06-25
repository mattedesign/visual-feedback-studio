
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Subscription {
  id: string;
  plan_type: 'freemium' | 'monthly' | 'yearly';
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  analyses_used: number;
  analyses_limit: number;
  current_period_start?: string;
  current_period_end?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
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
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      // Type-safe assignment with proper plan_type casting
      if (data) {
        const subscriptionData: Subscription = {
          id: data.id,
          plan_type: data.plan_type as 'freemium' | 'monthly' | 'yearly',
          status: data.status as 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete',
          analyses_used: data.analyses_used,
          analyses_limit: data.analyses_limit,
          current_period_start: data.current_period_start,
          current_period_end: data.current_period_end,
          stripe_customer_id: data.stripe_customer_id,
          stripe_subscription_id: data.stripe_subscription_id,
        };
        setSubscription(subscriptionData);
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
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

  const canCreateAnalysis = () => {
    if (!subscription) return false;
    return subscription.status === 'active' && subscription.analyses_used < subscription.analyses_limit;
  };

  const getRemainingAnalyses = () => {
    if (!subscription) return 0;
    return Math.max(0, subscription.analyses_limit - subscription.analyses_used);
  };

  const getUsagePercentage = () => {
    if (!subscription || subscription.analyses_limit === 0) return 0;
    return (subscription.analyses_used / subscription.analyses_limit) * 100;
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
    getRemainingAnalyses,
    getUsagePercentage,
    refetch: fetchSubscription
  };
};
