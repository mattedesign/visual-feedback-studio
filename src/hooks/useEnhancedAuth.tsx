
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isConnected: boolean;
}

export const useEnhancedAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
    isConnected: false
  });

  useEffect(() => {
    console.log('=== Enhanced useAuth Hook Initialization (Hosted) ===');
    
    let mounted = true;
    
    // Test connection to hosted instance
    const testConnection = async () => {
      try {
        const { error } = await supabase.from('analyses').select('count').limit(1);
        if (mounted) {
          setAuthState(prev => ({ 
            ...prev, 
            isConnected: !error,
            error: error ? `Connection failed: ${error.message}` : null 
          }));
        }
        return !error;
      } catch (err) {
        if (mounted) {
          setAuthState(prev => ({ 
            ...prev, 
            isConnected: false,
            error: err instanceof Error ? err.message : 'Connection test failed'
          }));
        }
        return false;
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Enhanced auth state change (hosted):', event, session?.user?.email);
        
        if (!mounted) return;
        
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
          error: null
        }));
        
        // Log auth events for debugging
        if (event === 'SIGNED_IN') {
          console.log('User signed in successfully (hosted)');
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out (hosted)');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Auth token refreshed (hosted)');
        } else if (event === 'USER_UPDATED') {
          console.log('User data updated (hosted)');
        }
      }
    );

    // Initialize connection and session check
    const initialize = async () => {
      const isConnected = await testConnection();
      
      if (isConnected && mounted) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (mounted) {
            if (error) {
              console.error('Session check error (hosted):', error);
              setAuthState(prev => ({
                ...prev,
                error: error.message,
                loading: false
              }));
            } else {
              console.log('Initial session check (hosted):', session?.user?.email);
              setAuthState(prev => ({
                ...prev,
                session,
                user: session?.user ?? null,
                loading: false,
                error: null
              }));
            }
          }
        } catch (err) {
          if (mounted) {
            console.error('Session initialization failed (hosted):', err);
            setAuthState(prev => ({
              ...prev,
              error: err instanceof Error ? err.message : 'Session check failed',
              loading: false
            }));
          }
        }
      } else if (mounted) {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    initialize();

    return () => {
      mounted = false;
      console.log('Cleaning up enhanced auth subscription (hosted)');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('Enhanced sign out initiated (hosted)...');
    
    try {
      setAuthState(prev => ({ ...prev, error: null }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error (hosted):', error);
        setAuthState(prev => ({ ...prev, error: error.message }));
        throw error;
      }
      
      console.log('Sign out successful (hosted)');
    } catch (err) {
      console.error('Sign out failed (hosted):', err);
      throw err;
    }
  };

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  return { 
    ...authState,
    signOut,
    clearError
  };
};
