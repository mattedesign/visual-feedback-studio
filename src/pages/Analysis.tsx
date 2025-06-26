
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { AnalysisWorkflow } from '@/components/analysis/AnalysisWorkflow';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useEffect } from 'react';

const Analysis = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { canCreateAnalysis, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Redirect to auth if user doesn't have valid subscription
  useEffect(() => {
    if (!authLoading && !subscriptionLoading) {
      if (!user || !canCreateAnalysis()) {
        console.log('User lacks valid subscription, redirecting to /auth');
        navigate('/auth');
      }
    }
  }, [user, canCreateAnalysis, authLoading, subscriptionLoading, navigate]);

  // Show loading while checking auth/subscription
  if (authLoading || subscriptionLoading) {
    return <LoadingSpinner />;
  }

  // If no user or can't create analysis, don't render anything (redirect will happen)
  if (!user || !canCreateAnalysis()) {
    return null;
  }

  // User has valid subscription - show the analysis workflow
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header user={user} onSignOut={handleSignOut} />
      <AnalysisWorkflow />
    </div>
  );
};

export default Analysis;
