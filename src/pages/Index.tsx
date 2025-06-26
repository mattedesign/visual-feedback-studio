
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GradientLayout } from '@/components/ui/GradientLayout';
import { DirectRAGTestSimple } from '@/components/analysis/DirectRAGTestSimple';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Zap, Crown, Plus, Settings } from 'lucide-react';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading || subscriptionLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthGuard />;
  }

  const handleStartAnalysis = () => {
    navigate('/analysis');
  };

  const handleManageSubscription = () => {
    navigate('/subscription');
  };

  return (
    <GradientLayout variant="purple" intensity="medium" speed="normal">
      <div className="min-h-screen bg-slate-900/80 text-white backdrop-blur-sm">
        <Header user={user} onSignOut={handleSignOut} />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section with Gradient Title */}
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent animate-glow">
                Design Analysis Tool
              </h1>
              <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
                Upload your designs and get AI-powered feedback on UX, accessibility, and conversion optimization
              </p>
              
              {/* Main CTA Button */}
              <Button 
                onClick={handleStartAnalysis} 
                className="enhanced-button-primary text-lg px-8 py-4 mb-8 animate-pulse"
                size="lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Start Analyzing Now
              </Button>
            </div>

            {/* Dashboard Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="bg-slate-800/70 border-slate-700 backdrop-blur-sm hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    New Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 mb-4">
                    Upload your designs and get AI-powered insights and recommendations.
                  </p>
                  <Button onClick={handleStartAnalysis} className="enhanced-button-primary w-full">
                    Create Analysis
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/70 border-slate-700 backdrop-blur-sm hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {subscription ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {subscription.plan_type === 'freemium' ? (
                          <Zap className="h-4 w-4" />
                        ) : (
                          <Crown className="h-4 w-4" />
                        )}
                        <span className="capitalize font-medium">
                          {subscription.plan_type} Plan
                        </span>
                      </div>
                      <p className="text-slate-300 mb-4">
                        {subscription.analyses_used} / {subscription.analyses_limit} analyses used
                      </p>
                      <Button onClick={handleManageSubscription} variant="outline" className="enhanced-button-secondary w-full">
                        {subscription.plan_type === 'freemium' ? 'Upgrade Plan' : 'Manage Subscription'}
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-slate-300 mb-4">
                        Manage your subscription and billing settings.
                      </p>
                      <Button onClick={handleManageSubscription} variant="outline" className="enhanced-button-secondary w-full">
                        View Subscription
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Upgrade Prompt for Freemium Users */}
            {subscription && subscription.plan_type === 'freemium' && (
              <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/50 backdrop-blur-sm mb-12 hover-glow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Upgrade to Pro</h3>
                      <p className="text-slate-300">
                        Get unlimited analyses and advanced features
                      </p>
                    </div>
                    <Button onClick={handleManageSubscription} className="enhanced-button-primary bg-purple-600 hover:bg-purple-700">
                      Upgrade Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* RAG Test Component */}
            <div className="mt-12">
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-center">AI Analysis Testing</CardTitle>
                </CardHeader>
                <CardContent>
                  <DirectRAGTestSimple />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </GradientLayout>
  );
};

export default Index;
