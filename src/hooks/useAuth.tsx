
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/profiles';
import { ProfileService } from '@/services/profileService';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    error: null
  });

  // Helper function to safely update auth state - moved outside useEffect for reusability
  const updateAuthState = (updates: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  };

  // Helper function to fetch profile - moved outside useEffect for reusability
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const profile = await ProfileService.getProfile(userId);
      return profile;
    } catch (error) {
      console.warn('Profile fetch failed:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    let profileFetchAbortController: AbortController | null = null;
    let debounceTimer: NodeJS.Timeout | null = null;
    let lastSessionId: string | null = null;
    let initializationComplete = false;

    // Internal fetch with abort signal for useEffect
    const fetchProfileWithAbort = async (userId: string): Promise<UserProfile | null> => {
      if (profileFetchAbortController) {
        profileFetchAbortController.abort();
      }
      
      profileFetchAbortController = new AbortController();
      
      try {
        const profile = await ProfileService.getProfile(userId);
        return profileFetchAbortController.signal.aborted ? null : profile;
      } catch (error) {
        if (profileFetchAbortController.signal.aborted) {
          return null;
        }
        console.warn('Profile fetch failed:', error);
        return null;
      }
    };

    // Helper function to safely update auth state within useEffect
    const safeUpdateAuthState = (updates: Partial<AuthState>) => {
      if (mounted) {
        setAuthState(prev => ({ ...prev, ...updates }));
      }
    };

    // Debounced auth state handler to prevent rapid oscillations
    const handleAuthStateChange = (event: string, session: any) => {
      if (!mounted) return;
      
      // Check if session actually changed to prevent duplicate updates
      const newSessionId = session?.user?.id || null;
      const sessionChanged = newSessionId !== lastSessionId;
      
      if (!sessionChanged && initializationComplete) {
        return; // Skip duplicate session updates
      }
      
      lastSessionId = newSessionId;
      
      // Clear previous debounce timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      // Debounce auth state changes to prevent rapid oscillations
      debounceTimer = setTimeout(() => {
        if (!mounted) return;
        
        console.log('🔐 Auth state change:', { event, hasSession: !!session, hasUser: !!session?.user });
        
        if (session?.user) {
          // Update auth state immediately (synchronously)
          safeUpdateAuthState({
            session,
            user: session.user,
            loading: false,
            error: null
          });
          
          // Fetch profile asynchronously without blocking
          setTimeout(async () => {
            const profile = await fetchProfileWithAbort(session.user.id);
            if (mounted && profile) {
              safeUpdateAuthState({ profile });
            }
          }, 0);
        } else {
          // Clear auth state immediately
          safeUpdateAuthState({
            session: null,
            user: null,
            profile: null,
            loading: false,
            error: null
          });
        }
      }, 100); // 100ms debounce to prevent rapid state changes
    };

    // Initialize session check FIRST, then set up listener
    const initialize = async () => {
      if (!mounted) return;
      
      try {
        console.log('🚀 Initializing auth state...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('❌ Session check error:', error);
          safeUpdateAuthState({
            error: error.message,
            loading: false
          });
        } else if (session?.user) {
          console.log('✅ Found existing session');
          lastSessionId = session.user.id;
          
          // Set basic auth state first
          safeUpdateAuthState({
            session,
            user: session.user,
            loading: false,
            error: null
          });
          
          // Fetch profile separately to avoid blocking
          const profile = await fetchProfileWithAbort(session.user.id);
          if (mounted && profile) {
            safeUpdateAuthState({ profile });
          }
        } else {
          console.log('📭 No existing session');
          safeUpdateAuthState({
            session: null,
            user: null,
            profile: null,
            loading: false,
            error: null
          });
        }
        
        initializationComplete = true;
      } catch (err) {
        console.error('❌ Auth initialization error:', err);
        if (mounted) {
          safeUpdateAuthState({
            error: err instanceof Error ? err.message : 'Session check failed',
            loading: false
          });
        }
        initializationComplete = true;
      }
    };

    // Set up auth state listener AFTER initialization
    const setupListener = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
      return subscription;
    };

    // Initialize first, then set up listener
    let subscription: any;
    initialize().then(() => {
      if (mounted) {
        subscription = setupListener();
      }
    });

    return () => {
      mounted = false;
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      if (profileFetchAbortController) {
        profileFetchAbortController.abort();
      }
      if (subscription) {
        subscription.unsubscribe();
      }
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

  const refreshProfile = async () => {
    if (!authState.user?.id) return;
    
    try {
      const profile = await fetchProfile(authState.user.id);
      if (profile) {
        updateAuthState({ profile });
      }
    } catch (error) {
      console.error('Profile refresh failed:', error);
    }
  };

  return { 
    ...authState,
    signOut,
    refreshProfile
  };
};
