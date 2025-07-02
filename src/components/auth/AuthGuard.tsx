
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export const AuthGuard = ({ children, requireAuth = true }: AuthGuardProps) => {
  const { user, session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  const isAuthenticated = !!(user && session);

  // If auth is required but user is not authenticated, redirect to auth page
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If auth is not required but user is authenticated, allow access
  // If auth is required and user is authenticated, allow access
  return <>{children}</>;
};
