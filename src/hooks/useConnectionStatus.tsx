
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ConnectionStatus {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  retryCount: number;
}

export const useConnectionStatus = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isLoading: true,
    error: null,
    retryCount: 0
  });

  const testConnection = async (retryAttempt = 0) => {
    console.log(`Testing connection to hosted Supabase (attempt ${retryAttempt + 1})`);
    
    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Test basic connectivity to the hosted instance
      const { data, error } = await supabase
        .from('analyses')
        .select('count')
        .limit(1);
      
      if (error) {
        throw new Error(`Database query failed: ${error.message}`);
      }
      
      console.log('Connection to hosted Supabase successful');
      setStatus({
        isConnected: true,
        isLoading: false,
        error: null,
        retryCount: retryAttempt
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown connection error';
      console.error(`Connection test failed (attempt ${retryAttempt + 1}):`, errorMessage);
      
      setStatus({
        isConnected: false,
        isLoading: false,
        error: errorMessage,
        retryCount: retryAttempt
      });
      
      return false;
    }
  };

  const retryConnection = async () => {
    const success = await testConnection(status.retryCount + 1);
    
    if (!success && status.retryCount >= 2) {
      setStatus(prev => ({
        ...prev,
        error: `Connection failed after ${prev.retryCount + 1} attempts. Please check your internet connection and try again.`
      }));
    }
    
    return success;
  };

  useEffect(() => {
    testConnection(0);
  }, []);

  return {
    ...status,
    testConnection,
    retryConnection
  };
};
