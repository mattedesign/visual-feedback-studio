
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { GradientLayout } from '@/components/ui/GradientLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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
      <GradientLayout variant="purple" intensity="medium">
        <LoadingSpinner />
      </GradientLayout>
    );
  }

  // Show auth error state with retry option
  if (error) {
    console.log('Auth error state:', error);
    return (
      <GradientLayout variant="red" intensity="medium">
        <div className="min-h-screen flex items-center justify-center px-4">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="text-2xl font-bold mb-4 text-red-600">⚠️ Authentication Error</div>
              <div className="text-lg mb-6 text-gray-700">{error}</div>
              <div className="space-y-3">
                <Button 
                  onClick={handleRetry}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Retry
                </Button>
                <Button 
                  onClick={() => navigate('/auth')} 
                  variant="outline"
                  className="w-full"
                >
                  Go to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </GradientLayout>
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
    <GradientLayout variant="green" intensity="medium">
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl max-w-2xl w-full">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                🎉 Welcome to Figmant.ai
              </div>
              
              <div className="text-left bg-slate-50 p-6 rounded-lg mb-6">
                <div className="text-lg font-semibold mb-3 text-gray-800">User Info:</div>
                <div className="space-y-2 text-gray-700">
                  <div>📧 Email: {user.email}</div>
                  <div>🆔 ID: {user.id}</div>
                  <div>📅 Created: {new Date(user.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              {subscription && (
                <div className="text-left bg-slate-50 p-6 rounded-lg mb-6">
                  <div className="text-lg font-semibold mb-3 text-gray-800">Subscription Info:</div>
                  <div className="space-y-2 text-gray-700">
                    <div>📋 Plan: {subscription.plan_type}</div>
                    <div>📊 Analyses: {subscription.analyses_used} / {subscription.analyses_limit}</div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <Button 
                  onClick={() => navigate('/analysis')} 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start Analysis
                </Button>
                <Button 
                  onClick={handleSignOut} 
                  variant="outline"
                  className="ml-4 px-6 py-3 text-lg font-semibold"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </GradientLayout>
  );
};

export default Index;
