
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AmazonCard, AmazonCardContent } from '@/components/ui/AmazonCard';
import { AmazonButton } from '@/components/ui/AmazonButton';

const Index = () => {
  const { user, loading, signOut, error } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    console.log('Index component mounted');
    console.log('Auth state:', { 
      hasUser: !!user, 
      userEmail: user?.email,
      loading,
      error,
      subscriptionLoading
    });
  }, [user, loading, error, subscriptionLoading]);

  const handleSignOut = async () => {
    console.log('Sign out initiated');
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // Show loading state
  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show auth error state with retry option
  if (error) {
    console.log('Auth error state:', error);
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <AmazonCard className="max-w-md w-full text-center">
          <AmazonCardContent>
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-4 text-red-600">Authentication Error</h2>
            <p className="text-lg mb-6 text-gray-700">{error}</p>
            <div className="space-y-3">
              <AmazonButton 
                onClick={handleRetry}
                className="w-full"
              >
                Retry
              </AmazonButton>
              <AmazonButton 
                onClick={() => navigate('/auth')} 
                variant="secondary"
                className="w-full"
              >
                Go to Login
              </AmazonButton>
            </div>
          </AmazonCardContent>
        </AmazonCard>
      </div>
    );
  }

  // Show not authenticated state
  if (!user) {
    console.log('No user found, redirecting to home');
    navigate('/');
    return null;
  }

  console.log('User authenticated, rendering main dashboard');

  // Show success state for authenticated users
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <AmazonCard className="max-w-2xl w-full">
        <AmazonCardContent className="text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Welcome to Figmant.ai
          </h1>
          
          <div className="text-left bg-slate-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">User Info:</h3>
            <div className="space-y-2 text-gray-700">
              <div>📧 Email: {user.email}</div>
              <div>🆔 ID: {user.id}</div>
              <div>📅 Created: {new Date(user.created_at).toLocaleDateString()}</div>
            </div>
          </div>

          {subscription && (
            <div className="text-left bg-slate-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Subscription Info:</h3>
              <div className="space-y-2 text-gray-700">
                <div>📋 Plan: {subscription.plan_type}</div>
                <div>📊 Analyses: {subscription.analyses_used} / {subscription.analyses_limit}</div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <AmazonButton 
              onClick={() => navigate('/analysis')} 
              className="flex-1"
            >
              Start Analysis
            </AmazonButton>
            <AmazonButton 
              onClick={handleSignOut} 
              variant="secondary"
              className="flex-1"
            >
              Sign Out
            </AmazonButton>
          </div>
        </AmazonCardContent>
      </AmazonCard>
    </div>
  );
};

export default Index;
