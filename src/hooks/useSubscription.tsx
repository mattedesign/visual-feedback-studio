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

  // Add useEffect to log when subscription changes
  useEffect(() => {
    console.log('useSubscription: Subscription state changed to:', subscription);
  }, [subscription]);

  const fetchSubscription = async () => {
    if (!user) {
      console.log('useSubscription: No user found, setting loading to false');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('useSubscription: Fetching subscription for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('useSubscription: Raw database response:', { data, error });

      if (error && error.code === 'PGRST116') {
        // No subscription found - initialize trial for new user
        console.log('useSubscription: No subscription found, initializing trial');
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
          plan_type: data.plan_type as 'trial' | 'monthly' | 'yearly',
          status: data.status as 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete',
          analyses_used: data.analyses_used,
          analyses_limit: data.analyses_limit,
          current_period_start: data.current_period_start,
          current_period_end: data.current_period_end,
          stripe_customer_id: data.stripe_customer_id,
          stripe_subscription_id: data.stripe_subscription_id,
        };
        
        console.log('useSubscription: Processed subscription data:', subscriptionData);
        setSubscription(subscriptionData);
        console.log('useSubscription: Setting subscription state to:', subscriptionData);
        console.log('useSubscription: State should now be updated');
      } else {
        console.log('useSubscription: No subscription data returned');
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
    if (!subscription) {
      console.log('useSubscription.isActiveSubscriber: No subscription object');
      return false;
    }
    
    const isActive = (subscription.plan_type === 'yearly' || subscription.plan_type === 'monthly') && 
                     subscription.status === 'active';
    
    console.log('useSubscription.isActiveSubscriber:', {
      plan_type: subscription.plan_type,
      status: subscription.status,
      isActive
    });
    
    return isActive;
  };

  // Check if user is on trial
  const isTrialUser = () => {
    if (!subscription) return false;
    return subscription.plan_type === 'trial';
  };

  // Check if user needs subscription (trial expired or no subscription)
  const needsSubscription = () => {
    if (!subscription) {
      console.log('useSubscription.needsSubscription: No subscription, needs subscription');
      return true;
    }
    
    if (isActiveSubscriber()) {
      console.log('useSubscription.needsSubscription: Active subscriber, no subscription needed');
      return false;
    }
    
    if (isTrialUser()) {
      const needsSub = subscription.analyses_used >= subscription.analyses_limit;
      console.log('useSubscription.needsSubscription: Trial user check:', {
        analyses_used: subscription.analyses_used,
        analyses_limit: subscription.analyses_limit,
        needsSubscription: needsSub
      });
      return needsSub;
    }
    
    console.log('useSubscription.needsSubscription: Default case, needs subscription');
    return true;
  };

  // Main function to check if user can create analysis
  const canCreateAnalysis = () => {
    if (!subscription) {
      console.log('useSubscription.canCreateAnalysis: No subscription object found');
      return false;
    }
    
    console.log('useSubscription.canCreateAnalysis: Checking with subscription:', {
      plan_type: subscription.plan_type,
      status: subscription.status,
      analyses_used: subscription.analyses_used,
      analyses_limit: subscription.analyses_limit
    });
    
    // Active yearly or monthly subscribers can always create analyses
    if ((subscription.plan_type === 'yearly' || subscription.plan_type === 'monthly') && 
        subscription.status === 'active') {
      console.log('useSubscription.canCreateAnalysis: Active subscriber, returning true');
      return true;
    }
    
    // Trial users can create if they have analyses left
    if (subscription.plan_type === 'trial' && 
        subscription.analyses_used < subscription.analyses_limit) {
      console.log('useSubscription.canCreateAnalysis: Trial user with analyses remaining, returning true');
      return true;
    }
    
    console.log('useSubscription.canCreateAnalysis: No valid subscription found, returning false');
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
    
    // Active subscribers have unlimited
    if (isActiveSubscriber()) return 999999;
    
    // Trial users have limited
    if (isTrialUser()) {
      return Math.max(0, subscription.analyses_limit - subscription.analyses_used);
    }
    
    return 0;
  };

  const getUsagePercentage = () => {
    if (!subscription) return 0;
    
    // Active subscribers show 0% (unlimited)
    if (isActiveSubscriber()) return 0;
    
    // Trial users show actual percentage
    if (isTrialUser() && subscription.analyses_limit > 0) {
      return (subscription.analyses_used / subscription.analyses_limit) * 100;
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
