
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { AnalysisWorkflow } from '@/components/analysis/AnalysisWorkflow';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

const Analysis = () => {
  // 🔄 LOOP DETECTION: Track component renders
  console.log('🔄 COMPONENT RENDER:', new Date().toISOString(), {
    componentName: 'Analysis',
    renderCount: ++((window as any).analysisPageRenderCount) || ((window as any).analysisPageRenderCount = 1)
  });

  const { user, loading: authLoading, signOut } = useAuth();
  const { 
    canCreateAnalysis, 
    needsSubscription, 
    loading: subscriptionLoading 
  } = useSubscription();
  const navigate = useNavigate();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Show loading while either auth or subscription is loading
  if (authLoading || subscriptionLoading) {
    return <LoadingSpinner />;
  }

  // If user is not authenticated, show auth guard
  if (!user) {
    return <AuthGuard />;
  }

  // User is authenticated - check subscription status
  const canAnalyze = canCreateAnalysis();
  const needsSub = needsSubscription();

  // If user needs subscription, show upgrade modal
  if (needsSub && !canAnalyze) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Header user={user} onSignOut={handleSignOut} />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Ready to Continue?</h1>
          <p className="text-slate-300 mb-8">
            Upgrade your account to access unlimited design analyses
          </p>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg"
          >
            View Plans
          </button>
        </div>
        <UpgradeModal 
          isOpen={showUpgradeModal} 
          onClose={() => setShowUpgradeModal(false)} 
        />
      </div>
    );
  }

  // User can create analysis - show the workflow
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header user={user} onSignOut={handleSignOut} />
      <AnalysisWorkflow />
    </div>
  );
};

export default Analysis;
