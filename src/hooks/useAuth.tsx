
import { useState, useEffect, useRef } from 'react';
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
    loading: true, // Start with true to prevent premature access
    error: null
  });

  const initializedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    // Prevent multiple initialization
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;

    console.log('useAuth: Initializing auth state (single instance)');
    
    let authSubscription: any = null;

    const initializeAuth = async () => {
      try {
        // Set up auth state listener first
        authSubscription = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('useAuth: Auth state changed', { event, hasSession: !!session });
            
            if (!mountedRef.current) return;
            
            setAuthState(prev => ({
              ...prev,
              session,
              user: session?.user ?? null,
              loading: false,
              error: null
            }));
          }
        );

        // Then check for existing session
        console.log('useAuth: Checking for existing session');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('useAuth: Session check result', { hasSession: !!session, error });
        
        if (mountedRef.current) {
          if (error) {
            console.error('useAuth: Session error:', error);
            setAuthState(prev => ({
              ...prev,
              session: null,
              user: null,
              loading: false,
              error: error.message
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
        if (mountedRef.current) {
          setAuthState(prev => ({
            ...prev,
            session: null,
            user: null,
            loading: false,
            error: err instanceof Error ? err.message : 'Authentication error'
          }));
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('useAuth: Cleaning up');
      mountedRef.current = false;
      if (authSubscription?.data?.subscription) {
        authSubscription.data.subscription.unsubscribe();
      }
    };
  }, []); // Empty dependency array to run only once

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
