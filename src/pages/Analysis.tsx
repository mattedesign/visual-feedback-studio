
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { AnalysisWorkflow } from '@/components/analysis/AnalysisWorkflow';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useEffect } from 'react';

const Analysis = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const subscriptionData = useSubscription();
  const navigate = useNavigate();

  // Debug: Log subscription data to help troubleshoot
  useEffect(() => {
    if (user && !subscriptionData.loading) {
      console.log('🔍 SUBSCRIPTION DEBUG DATA:', {
        subscription: subscriptionData.subscription,
        canCreateAnalysis: subscriptionData.canCreateAnalysis(),
        isActiveSubscriber: subscriptionData.isActiveSubscriber(),
        isTrialUser: subscriptionData.isTrialUser(),
        needsSubscription: subscriptionData.needsSubscription(),
        loading: subscriptionData.loading,
        error: subscriptionData.error,
        userEmail: user.email,
        userId: user.id
      });
    }
  }, [user, subscriptionData]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Only redirect if user is not authenticated - NO subscription checks
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('User not authenticated, redirecting to /auth');
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Show loading while checking authentication only
  if (authLoading) {
    return <LoadingSpinner />;
  }

  // If no user, don't render anything (redirect will happen)
  if (!user) {
    return null;
  }

  // User is authenticated - show the analysis workflow (NO subscription checks)
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header user={user} onSignOut={handleSignOut} />
      <AnalysisWorkflow />
    </div>
  );
};

export default Analysis;
