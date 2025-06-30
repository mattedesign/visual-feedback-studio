
import { Header } from '@/components/layout/Header';
import { AnalysisStudio } from '@/components/analysis/AnalysisStudio';
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

  // User is authenticated - show the analysis studio (NO subscription checks)
  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col overflow-hidden">
      <Header user={user} onSignOut={handleSignOut} />
      <div className="flex-1 min-h-0">
        <AnalysisStudio />
      </div>
    </div>
  );
};

export default Analysis;
