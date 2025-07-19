import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SubscriptionData {
  tier: 'trial' | 'starter' | 'pro' | 'enterprise';
  subscribed: boolean;
  analysesUsed: number;
  analysesLimit: number;
  subscriptionEnd: string | null;
  canAnalyze: boolean;
}

interface SubscriptionContextType {
  subscription: SubscriptionData | null;
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔄 Refreshing subscription data...');
      
      const { data, error } = await supabase.functions.invoke('figmant-check-subscription');
      
      if (error) {
        console.error('Subscription check failed:', error);
        throw error;
      }

      if (data?.success) {
        setSubscription(data.subscription);
        console.log('✅ Subscription updated:', data.subscription);
      } else {
        throw new Error(data?.error || 'Failed to check subscription');
      }
    } catch (error) {
      console.error('❌ Failed to refresh subscription:', error);
      // Set default trial data on error
      setSubscription({
        tier: 'trial',
        subscribed: false,
        analysesUsed: 0,
        analysesLimit: 3,
        subscriptionEnd: null,
        canAnalyze: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSubscription();
  }, [user]);

  return (
    <SubscriptionContext.Provider value={{ subscription, isLoading, refreshSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}