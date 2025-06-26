
import { Header } from '@/components/layout/Header';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useEffect } from 'react';

const Analysis = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const subscriptionData = useSubscription();

  // Console log subscription data for debugging
  useEffect(() => {
    console.log('🔍 ANALYSIS PAGE - Subscription Data:', {
      subscription: subscriptionData.subscription,
      loading: subscriptionData.loading,
      error: subscriptionData.error,
      canCreateAnalysis: subscriptionData.canCreateAnalysis(),
      isActiveSubscriber: subscriptionData.isActiveSubscriber(),
      isTrialUser: subscriptionData.isTrialUser(),
      needsSubscription: subscriptionData.needsSubscription(),
    });
  }, [subscriptionData]);

  const handleSignOut = async () => {
    await signOut();
    // Note: No redirect here - let the auth system handle it naturally
  };

  // Show loading while checking authentication
  if (authLoading) {
    return <LoadingSpinner />;
  }

  // If no user, show simple message (no redirects)
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <p className="text-slate-300">You need to be authenticated to access this page.</p>
        </div>
      </div>
    );
  }

  // User is authenticated - show simple success message
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header user={user} onSignOut={handleSignOut} />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-400 mb-4">
            🎉 Analysis Page - You made it!
          </h1>
          <p className="text-xl text-slate-300 mb-6">
            Welcome {user.email}! You successfully reached the analysis page.
          </p>
          <div className="bg-slate-800 p-6 rounded-lg max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold mb-2">Debug Info:</h2>
            <p className="text-sm text-slate-400">
              Check the console for subscription data details.
            </p>
            <p className="text-sm text-slate-400 mt-2">
              User ID: {user.id}
            </p>
            <p className="text-sm text-slate-400">
              Email: {user.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
