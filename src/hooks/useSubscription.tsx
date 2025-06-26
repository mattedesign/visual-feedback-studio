import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Subscription {
  id: string;
  plan_type: 'trial' | 'monthly' | 'yearly';
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
      console.log('🔍 useSubscription: No user found, setting loading to false');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 useSubscription: Fetching subscription for user:', user.id, user.email);
      setError(null);
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('🔍 useSubscription: Raw database response:', { data, error });

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('🔍 useSubscription: Database error:', error);
        throw error;
      }

      // Type-safe assignment with proper plan_type casting
      if (data) {
        const subscriptionData: Subscription = {
          id: data.id,
          plan_type: data.plan_type as 'trial' | 'monthly' | 'yearly',
          status: data.status as 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete',
          analyses_used: data.analyses_used,
          analyses_limit: data.analyses_limit,
          current_period_start: data.current_period_start,
          current_period_end: data.current_period_end,
          stripe_customer_id: data.stripe_customer_id,
          stripe_subscription_id: data.stripe_subscription_id,
        };
        
        console.log('🔍 useSubscription: Processed subscription data:', {
          plan_type: subscriptionData.plan_type,
          status: subscriptionData.status,
          analyses_used: subscriptionData.analyses_used,
          analyses_limit: subscriptionData.analyses_limit,
          raw_plan_type: data.plan_type,
          raw_status: data.status
        });
        
        setSubscription(subscriptionData);
      } else {
        console.log('🔍 useSubscription: No subscription found in database');
        setSubscription(null);
      }
    } catch (err) {
      console.error('🔍 useSubscription: Error fetching subscription:', err);
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

  // Helper function: Check if user is an active subscriber (monthly/yearly with active status)
  const isActiveSubscriber = (): boolean => {
    console.log('🔍 useSubscription.isActiveSubscriber: Checking with subscription:', subscription);
    
    if (!subscription) {
      console.log('🔍 useSubscription.isActiveSubscriber: No subscription, returning false');
      return false;
    }
    
    const isYearlyOrMonthly = subscription.plan_type === 'monthly' || subscription.plan_type === 'yearly';
    const isActive = subscription.status === 'active';
    const result = isYearlyOrMonthly && isActive;
    
    console.log('🔍 useSubscription.isActiveSubscriber:', {
      plan_type: subscription.plan_type,
      status: subscription.status,
      isYearlyOrMonthly,
      isActive,
      result
    });
    
    return result;
  };

  // Helper function: Check if user is on trial
  const isTrialUser = (): boolean => {
    console.log('🔍 useSubscription.isTrialUser: Checking with subscription:', subscription);
    
    if (!subscription) {
      console.log('🔍 useSubscription.isTrialUser: No subscription, returning false');
      return false;
    }
    
    const result = subscription.plan_type === 'trial';
    console.log('🔍 useSubscription.isTrialUser:', { plan_type: subscription.plan_type, result });
    
    return result;
  };

  // Helper function: Check if user needs a subscription
  const needsSubscription = (): boolean => {
    console.log('🔍 useSubscription.needsSubscription: Checking with subscription:', subscription);
    
    if (!subscription) {
      console.log('🔍 useSubscription.needsSubscription: No subscription, returning true');
      return true;
    }
    
    // If user is an active subscriber, they don't need a subscription
    if (isActiveSubscriber()) {
      console.log('🔍 useSubscription.needsSubscription: User is active subscriber, returning false');
      return false;
    }
    
    // If user is on trial and has remaining analyses, they don't need subscription yet
    if (isTrialUser() && subscription.analyses_used < subscription.analyses_limit) {
      console.log('🔍 useSubscription.needsSubscription: User is on trial with remaining analyses, returning false');
      return false;
    }
    
    // Otherwise, they need a subscription
    console.log('🔍 useSubscription.needsSubscription: User needs subscription, returning true');
    return true;
  };

  // Main function: Check if user can create analysis
  const canCreateAnalysis = (): boolean => {
    console.log('🔍 useSubscription.canCreateAnalysis: Checking with subscription:', subscription);
    
    if (!subscription) {
      console.log('🔍 useSubscription.canCreateAnalysis: No subscription, returning false');
      return false;
    }
    
    // Active subscribers (monthly/yearly with active status) get unlimited analyses
    if (isActiveSubscriber()) {
      console.log('🔍 useSubscription.canCreateAnalysis: User is active subscriber, returning true');
      return true;
    }
    
    // Trial users can create analyses if they haven't exceeded their limit
    if (isTrialUser() && subscription.status === 'active') {
      const canAnalyze = subscription.analyses_used < subscription.analyses_limit;
      console.log('🔍 useSubscription.canCreateAnalysis: Trial user check:', {
        analyses_used: subscription.analyses_used,
        analyses_limit: subscription.analyses_limit,
        canAnalyze
      });
      return canAnalyze;
    }
    
    // All other cases: cannot create analysis
    console.log('🔍 useSubscription.canCreateAnalysis: Other case, returning false');
    return false;
  };

  const getRemainingAnalyses = (): number => {
    if (!subscription) return 0;
    
    // Active subscribers have unlimited analyses
    if (isActiveSubscriber()) {
      return 999; // Return a high number to indicate unlimited
    }
    
    // Trial users have limited analyses
    if (isTrialUser()) {
      return Math.max(0, subscription.analyses_limit - subscription.analyses_used);
    }
    
    return 0;
  };

  const getUsagePercentage = (): number => {
    if (!subscription) return 0;
    
    // Active subscribers don't have usage limitations
    if (isActiveSubscriber()) return 0;
    
    // Trial users have usage limitations
    if (isTrialUser() && subscription.analyses_limit > 0) {
      return (subscription.analyses_used / subscription.analyses_limit) * 100;
    }
    
    return 100; // If no valid subscription, consider it fully used
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
    refetch: fetchSubscription,
    // New helper functions
    isActiveSubscriber,
    isTrialUser,
    needsSubscription
  };
};
