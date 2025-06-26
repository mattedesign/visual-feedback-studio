
import { Header } from '@/components/layout/Header';
import { DirectRAGTestSimple } from '@/components/analysis/DirectRAGTestSimple';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const { canCreateAnalysis, loading: subscriptionLoading, needsSubscription } = useSubscription();
  const navigate = useNavigate();
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleGetStarted = async () => {
    console.log('🚀 Start Analysis button clicked');
    
    // Step 1: Check if user is logged in first
    if (!user) {
      console.log('User not logged in, navigating to auth page');
      navigate('/auth');
      return;
    }

    console.log('User is logged in, checking subscription status...');
    setIsCheckingSubscription(true);

    try {
      // Wait for subscription loading to complete if still loading
      if (subscriptionLoading) {
        console.log('Waiting for subscription status...');
        // The useEffect below will handle routing once loading completes
        return;
      }

      // Step 2: Check subscription status
      const canAnalyze = canCreateAnalysis();
      const needsSub = needsSubscription();

      console.log('Subscription check results:', {
        canAnalyze,
        needsSub,
        userEmail: user.email
      });

      // UPDATED ROUTING LOGIC per user requirements:
      // If user can create analysis (active subscriber OR trial with remaining analyses)
      if (canAnalyze) {
        console.log('✅ User can create analysis, navigating to analysis page');
        navigate('/analysis');
      } 
      // If user cannot create analysis AND needs subscription (trial expired or no subscription)
      else if (needsSub) {
        console.log('❌ User needs subscription, navigating to subscription page');
        navigate('/subscription');
      } 
      // Fallback case - should rarely happen
      else {
        console.log('⚠️ Unexpected state, navigating to analysis page as fallback');
        navigate('/analysis');
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
      // Fallback to analysis page on error - let Analysis page handle subscription checks
      navigate('/analysis');
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  // Handle subscription loading completion
  useEffect(() => {
    if (isCheckingSubscription && !subscriptionLoading && user) {
      console.log('Subscription loading completed, rechecking status...');
      
      const canAnalyze = canCreateAnalysis();
      const needsSub = needsSubscription();

      // UPDATED ROUTING LOGIC (same as above)
      if (canAnalyze) {
        console.log('✅ User can create analysis, navigating to analysis page');
        navigate('/analysis');
        setIsCheckingSubscription(false);
      } else if (needsSub) {
        console.log('❌ User needs subscription, navigating to subscription page');
        navigate('/subscription');
        setIsCheckingSubscription(false);
      }
    }
  }, [subscriptionLoading, isCheckingSubscription, user, canCreateAnalysis, needsSubscription, navigate]);

  if (loading || subscriptionLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {user && <Header user={user} onSignOut={handleSignOut} />}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Design Analysis Tool
          </h1>
          <p className="text-xl text-slate-200 mb-8">
            Upload your design and get AI-powered feedback on UX, accessibility, and conversion optimization
          </p>
          
          <div className="max-w-2xl mx-auto space-y-6">
            <p className="text-lg text-slate-300">
              Get expert insights on your designs with our AI-powered analysis tool. 
              Improve user experience, accessibility, and conversion rates with actionable feedback.
            </p>
            
            <Button 
              onClick={handleGetStarted}
              disabled={isCheckingSubscription}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg disabled:opacity-50"
            >
              {isCheckingSubscription ? 'Checking subscription...' : 'Start Analyzing Now'}
            </Button>
            
            {isCheckingSubscription && (
              <p className="text-sm text-slate-400 mt-2">
                Please wait while we verify your subscription status...
              </p>
            )}
          </div>
        </div>
        
        {/* Direct RAG Test Component - only show to logged in users */}
        {user && (
          <div className="mt-12">
            <DirectRAGTestSimple />
          </div>
        )}
      </main>
      
      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </div>
  );
};

export default Index;
