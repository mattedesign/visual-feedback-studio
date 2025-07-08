
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

  useEffect(() => {
    let mounted = true;
    let profileFetchAbortController: AbortController | null = null;

    // Helper function to safely update auth state
    const updateAuthState = (updates: Partial<AuthState>) => {
      if (mounted) {
        setAuthState(prev => ({ ...prev, ...updates }));
      }
    };

    // Helper function to fetch profile with abort signal
    const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
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

    // Set up auth state listener - FIXED: No async callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('🔐 Auth state change:', { event, hasSession: !!session, hasUser: !!session?.user });
        
        if (session?.user) {
          // Update auth state immediately (synchronously)
          updateAuthState({
            session,
            user: session.user,
            loading: false,
            error: null
          });
          
          // Fetch profile asynchronously without blocking
          setTimeout(async () => {
            const profile = await fetchProfile(session.user.id);
            if (mounted && profile) {
              updateAuthState({ profile });
            }
          }, 0);
        } else {
          // Clear auth state immediately
          updateAuthState({
            session: null,
            user: null,
            profile: null,
            loading: false,
            error: null
          });
        }
      }
    );

    // Initialize session check - FIXED: Prevent duplicate profile fetches
    const initialize = async () => {
      if (!mounted) return;
      
      try {
        console.log('🚀 Initializing auth state...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('❌ Session check error:', error);
          updateAuthState({
            error: error.message,
            loading: false
          });
        } else if (session?.user) {
          console.log('✅ Found existing session');
          // Set basic auth state first
          updateAuthState({
            session,
            user: session.user,
            loading: false,
            error: null
          });
          
          // Fetch profile separately to avoid blocking
          const profile = await fetchProfile(session.user.id);
          if (mounted && profile) {
            updateAuthState({ profile });
          }
        } else {
          console.log('📭 No existing session');
          updateAuthState({
            session: null,
            user: null,
            profile: null,
            loading: false,
            error: null
          });
        }
      } catch (err) {
        console.error('❌ Auth initialization error:', err);
        if (mounted) {
          updateAuthState({
            error: err instanceof Error ? err.message : 'Session check failed',
            loading: false
          });
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
      if (profileFetchAbortController) {
        profileFetchAbortController.abort();
      }
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
