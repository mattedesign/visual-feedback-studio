
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
          error: null
        }));
      }
    );

    // Initialize session check
    const initialize = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (error) {
            setAuthState(prev => ({
              ...prev,
              error: error.message,
              loading: false
            }));
          } else {
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
          setAuthState(prev => ({
            ...prev,
            error: err instanceof Error ? err.message : 'Session check failed',
            loading: false
          }));
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, error: null }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message }));
        throw error;
      }
    } catch (err) {
      throw err;
    }
  };

  return { 
    ...authState,
    signOut
  };
};
