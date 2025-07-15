
import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [isInitializing, setIsInitializing] = useState(false);
  const initializationRef = useRef(false);
  
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

  const initialize = useCallback(async () => {
    // Prevent multiple concurrent initializations
    if (isInitializing || initializationRef.current) {
      console.log('🔒 Auth initialization already in progress, skipping');
      return;
    }

    setIsInitializing(true);
    initializationRef.current = true;
    
    try {
      console.log('🚀 Initializing auth state...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Session error:', error);
        // Clear corrupted session
        await supabase.auth.signOut();
        updateAuthState({ user: null, loading: false });
        return;
      }
      
      if (session?.user) {
        console.log('✅ Found existing session');
        updateAuthState({ user: session.user, loading: false });
      } else {
        console.log('📭 No existing session');
        updateAuthState({ user: null, loading: false });
      }
    } catch (error) {
      console.error('🚨 Auth initialization error:', error);
      updateAuthState({ user: null, loading: false });
    } finally {
      setIsInitializing(false);
      initializationRef.current = false;
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', { event, hasSession: !!session });
        
        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            updateAuthState({ user: session?.user ?? null, loading: false });
            break;
          case 'SIGNED_OUT':
            updateAuthState({ user: null, loading: false });
            break;
          case 'TOKEN_REFRESHED':
            updateAuthState({ user: session?.user ?? null });
            break;
          case 'PASSWORD_RECOVERY':
          case 'USER_UPDATED':
            updateAuthState({ user: session?.user ?? null });
            break;
          default:
            // Don't reinitialize on unknown events
            break;
        }
      }
    );

    // Initialize only once
    if (!initializationRef.current) {
      initialize();
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [initialize]);

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
