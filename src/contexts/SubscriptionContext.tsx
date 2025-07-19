
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SubscriptionData {
  tier: 'trial' | 'pro' | 'enterprise';
  subscribed: boolean;
  analysesUsed: number;
  analysesLimit: number;
  analysesRemaining: number;
  canAnalyze: boolean;
}

interface SubscriptionContextType {
  subscription: SubscriptionData | null;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      // Try to get subscription from user_subscriptions first
      const { data: userSub, error: userSubError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (userSub && !userSubError) {
        const subscriptionData: SubscriptionData = {
          tier: userSub.plan_type as any || 'trial',
          subscribed: userSub.status === 'active',
          analysesUsed: userSub.analyses_used || 0,
          analysesLimit: userSub.analyses_limit || 3,
          analysesRemaining: Math.max(0, (userSub.analyses_limit || 3) - (userSub.analyses_used || 0)),
          canAnalyze: (userSub.analyses_used || 0) < (userSub.analyses_limit || 3)
        };
        setSubscription(subscriptionData);
        setLoading(false);
        return;
      }

      // Fallback to subscribers table
      const { data: subscriber, error: subscriberError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subscriber && !subscriberError) {
        const subscriptionData: SubscriptionData = {
          tier: subscriber.subscription_tier as any || 'trial',
          subscribed: subscriber.subscribed || false,
          analysesUsed: subscriber.analyses_used || 0,
          analysesLimit: subscriber.analyses_limit || 3,
          analysesRemaining: Math.max(0, (subscriber.analyses_limit || 3) - (subscriber.analyses_used || 0)),
          canAnalyze: (subscriber.analyses_used || 0) < (subscriber.analyses_limit || 3)
        };
        setSubscription(subscriptionData);
      } else {
        // Create default trial subscription
        const defaultSub: SubscriptionData = {
          tier: 'trial',
          subscribed: false,
          analysesUsed: 0,
          analysesLimit: 3,
          analysesRemaining: 3,
          canAnalyze: true
        };
        setSubscription(defaultSub);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      // Set default subscription on error
      const defaultSub: SubscriptionData = {
        tier: 'trial',
        subscribed: false,
        analysesUsed: 0,
        analysesLimit: 3,
        analysesRemaining: 3,
        canAnalyze: true
      };
      setSubscription(defaultSub);
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = async () => {
    await fetchSubscription();
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const value: SubscriptionContextType = {
    subscription,
    loading,
    refreshSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
