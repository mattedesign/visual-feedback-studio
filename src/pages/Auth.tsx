
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const navigate = useNavigate();
  
  const { user, session, error: authError } = useAuth();
  const { 
    canCreateAnalysis, 
    isActiveSubscriber, 
    isTrialUser, 
    needsSubscription,
    loading: subscriptionLoading,
    refetch: refetchSubscription 
  } = useSubscription();

  // Handle subscription check after successful authentication
  useEffect(() => {
    const handlePostAuthSubscriptionCheck = async () => {
      if (session && user && !subscriptionLoading) {
        console.log('🔍 Starting post-auth subscription check for:', user.email);
        setCheckingSubscription(true);
        
        try {
          // Refresh subscription data
          await refetchSubscription();
          
          // Small delay to ensure subscription state is updated
          setTimeout(() => {
            const canAnalyze = canCreateAnalysis();
            const needsSub = needsSubscription();
            
            console.log('📊 Subscription check results:', {
              canAnalyze,
              needsSub,
              isActive: isActiveSubscriber(),
              isTrial: isTrialUser(),
              userEmail: user.email
            });

            if (canAnalyze) {
              console.log('✅ User can create analysis, redirecting to /analysis');
              toast.success('Welcome! Redirecting to analysis...');
              navigate('/analysis');
            } else if (needsSub) {
              console.log('❌ User needs subscription, showing upgrade modal');
              toast.info('Please upgrade to continue analyzing designs');
              setShowUpgradeModal(true);
            }
            
            setCheckingSubscription(false);
          }, 1000);
          
        } catch (error) {
          console.error('Error checking subscription:', error);
          setCheckingSubscription(false);
          toast.error('Error checking subscription status');
        }
      }
    };

    // Only run if we have a session and user, and not already checking
    if (session && user && !checkingSubscription) {
      handlePostAuthSubscriptionCheck();
    }
  }, [session, user, subscriptionLoading, canCreateAnalysis, needsSubscription, isActiveSubscriber, isTrialUser, navigate, refetchSubscription, checkingSubscription]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/analysis`
          }
        });

        if (error) throw error;
        
        if (data.session) {
          toast.success('Account created and signed in successfully!');
          // Subscription check will be handled by useEffect
        } else if (data.user && !data.user.email_confirmed_at) {
          toast.success('Account created! Please check your email to confirm your account.');
        } else {
          toast.success('Account created successfully! Please sign in.');
          setIsSignUp(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast.success('Welcome back!');
        // Subscription check will be handled by useEffect
      }
    } catch (error: any) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please check your credentials and try again.');
      } else if (error.message.includes('User already registered')) {
        toast.error('An account with this email already exists. Please sign in instead.');
        setIsSignUp(false);
      } else if (error.message.includes('Password should be at least 6 characters')) {
        toast.error('Password should be at least 6 characters long.');
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Please check your email and click the confirmation link before signing in.');
      } else {
        toast.error(error.message || 'An error occurred during authentication');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/analysis`
        }
      });

      if (error) throw error;
      
      toast.success('Check your email for the magic link!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state during subscription check
  if (checkingSubscription || (session && user && subscriptionLoading)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-white mb-2">Checking Your Subscription</h3>
            <p className="text-slate-400">Please wait while we verify your account status...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {isSignUp 
              ? 'Sign up to start analyzing your designs' 
              : 'Sign in to your account'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {authError && (
            <Alert className="mb-4" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {authError}
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>
          </form>
          
          {!isSignUp && (
            <div className="mt-4">
              <Button
                onClick={handleMagicLink}
                disabled={loading}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Send Magic Link
              </Button>
            </div>
          )}
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Modal - shown when user needs subscription */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </div>
  );
};

export default Auth;
