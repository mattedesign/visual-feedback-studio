
import { useEnhancedAuth } from './useEnhancedAuth';

// Export the enhanced auth hook with the same interface for backward compatibility
export const useAuth = () => {
  const enhancedAuth = useEnhancedAuth();
  
  // Return the same interface as the original useAuth hook
  return {
    user: enhancedAuth.user,
    session: enhancedAuth.session,
    loading: enhancedAuth.loading,
    error: enhancedAuth.error,
    signOut: enhancedAuth.signOut
  };
};
