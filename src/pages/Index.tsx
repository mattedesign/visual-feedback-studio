
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { Zap, Plus, Settings, ArrowRight, Sparkles, Target, TrendingUp } from 'lucide-react';

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
    <div className="min-h-screen gradient-bedrock text-white overflow-hidden">
      {/* Background overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
      
      <div className="relative z-10">
        <Header user={user} onSignOut={handleSignOut} />
        
        <div className="container-modern section-padding">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="fade-in">
                <h1 className="heading-xl text-gradient-primary mb-6">
                  Welcome to Figmant.AI
                </h1>
                <p className="body-lg text-white/90 max-w-3xl mx-auto mb-8">
                  Empowering UX designers to evolve from pixel pushers to solution architects. 
                  Leverage AI to focus on user needs, drive business revenue, and work smarter.
                </p>
                <div className="inline-flex items-center gap-2 text-white/70 body-md">
                  <Sparkles className="w-5 h-5" />
                  <span>AI won't replace you, but someone who knows how to use it will</span>
                </div>
              </div>
            </div>

            {/* Main Action Cards */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              <Card className="glass-card-dark border-white/10 slide-up">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl text-white">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                      <Plus className="h-5 w-5" />
                    </div>
                    Start New Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white/80 body-md">
                    Upload your designs and get AI-powered insights that drive real business impact.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      <span>User-focused insights</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Revenue optimization</span>
                    </div>
                  </div>
                  <Button 
                    onClick={handleStartAnalysis} 
                    className="btn-gradient-primary w-full group"
                  >
                    Create Analysis
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card-dark border-white/10 slide-up" style={{ animationDelay: '0.1s' }}>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl text-white">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-pink-600">
                      <Settings className="h-5 w-5" />
                    </div>
                    Manage Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {subscription ? (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        {subscription.plan_type === 'freemium' ? (
                          <Zap className="h-5 w-5 text-yellow-400" />
                        ) : (
                          <Sparkles className="h-5 w-5 text-purple-400" />
                        )}
                        <span className="capitalize font-medium text-white">
                          {subscription.plan_type} Plan
                        </span>
                      </div>
                      <p className="text-white/80 body-md mb-4">
                        {subscription.analyses_used} / {subscription.analyses_limit} analyses used
                      </p>
                      <Button 
                        onClick={handleManageSubscription} 
                        className="btn-gradient-orange w-full group"
                      >
                        {subscription.plan_type === 'freemium' ? 'Upgrade Plan' : 'Manage Subscription'}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-white/80 body-md mb-4">
                        Manage your subscription and unlock advanced AI capabilities.
                      </p>
                      <Button 
                        onClick={handleManageSubscription} 
                        className="btn-gradient-orange w-full group"
                      >
                        View Subscription
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Upgrade Prompt for Freemium Users */}
            {subscription && subscription.plan_type === 'freemium' && (
              <Card className="glass-card border-white/20 scale-in" style={{ animationDelay: '0.3s' }}>
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-semibold text-white">
                        Ready to unlock your design potential?
                      </h3>
                      <p className="text-white/80 body-md max-w-2xl">
                        Upgrade to Pro and transform how you approach UX design with unlimited AI-powered analyses, 
                        advanced insights, and business impact metrics.
                      </p>
                    </div>
                    <div className="ml-8 flex-shrink-0">
                      <Button 
                        onClick={handleManageSubscription} 
                        className="btn-gradient-primary px-8 py-4 text-lg group"
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Upgrade Now
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Value Proposition Section */}
            <div className="mt-20 text-center">
              <div className="max-w-4xl mx-auto space-y-6 fade-in" style={{ animationDelay: '0.5s' }}>
                <h2 className="heading-md text-white/90">
                  Stop being a pixel pusher. Start being a solution architect.
                </h2>
                <p className="body-lg text-white/70 max-w-2xl mx-auto">
                  Too long have we been artists making pretty pictures. With AI, focus on what matters: 
                  delivering user needs, driving business revenue, and working smarter, not harder.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating geometric elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-white/5 rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-1/3 right-20 w-16 h-16 bg-white/5 rounded-lg animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-white/5 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
    </div>
  );
};

export default Index;
