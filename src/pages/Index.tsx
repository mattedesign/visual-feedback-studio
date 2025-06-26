
import { Header } from '@/components/layout/Header';
import { DirectRAGTestSimple } from '@/components/analysis/DirectRAGTestSimple';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const { canCreateAnalysis, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleGetStarted = () => {
    // Step 3a: Check if user is logged in first
    if (!user) {
      console.log('User not logged in, navigating to auth page');
      navigate('/auth');
      return;
    }

    // Step 3b: User is logged in, now check subscription status
    if (canCreateAnalysis()) {
      console.log('User has credits, navigating to analysis page');
      navigate('/analysis');
    } else {
      console.log('User has no credits, navigating to subscription page');
      navigate('/subscription');
    }
  };

  if (loading || subscriptionLoading) {
    return <LoadingSpinner />;
  }

  // Remove the AuthGuard check - we want to show the home page to everyone
  // The authentication check happens in handleGetStarted instead

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
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              Start Analyzing Now
            </Button>
          </div>
        </div>
        
        {/* Direct RAG Test Component - only show to logged in users */}
        {user && (
          <div className="mt-12">
            <DirectRAGTestSimple />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
