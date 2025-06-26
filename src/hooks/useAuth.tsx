
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
    console.log('useAuth: Setting up auth state listener');
    let mounted = true;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuth: Auth state changed', { event, hasSession: !!session });
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

    // Initialize session check with improved timeout and retry logic
    const initialize = async () => {
      try {
        console.log('useAuth: Checking for existing session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('useAuth: Session check result', { hasSession: !!session, error });
        
        if (mounted) {
          if (error) {
            console.error('useAuth: Session error:', error);
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
        console.error('useAuth: Initialize error:', err);
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            error: err instanceof Error ? err.message : 'Session check failed',
            loading: false
          }));
        }
      }
    };

    // Reduced timeout from 15 seconds to 5 seconds to prevent blocking UI
    const timeoutId = setTimeout(() => {
      console.warn('useAuth: Timeout reached, forcing loading to false');
      if (mounted) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: null // Don't show error on timeout, just stop loading
        }));
      }
    }, 5000); // Reduced to 5 seconds

    initialize();

    return () => {
      console.log('useAuth: Cleaning up');
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('useAuth: Signing out');
      setAuthState(prev => ({ ...prev, error: null }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('useAuth: Sign out error:', error);
        setAuthState(prev => ({ ...prev, error: error.message }));
        throw error;
      }
    } catch (err) {
      console.error('useAuth: Sign out exception:', err);
      throw err;
    }
  };

  return { 
    ...authState,
    signOut
  };
};
