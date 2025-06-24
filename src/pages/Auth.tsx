
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { AlertTriangle, Info } from 'lucide-react';
import { ConnectionStatus } from '@/components/auth/ConnectionStatus';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const navigate = useNavigate();
  
  const { user, session, isConnected, error: authError, clearError } = useEnhancedAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (session && user) {
      console.log('User already authenticated, redirecting...');
      navigate('/analysis');
    }
  }, [session, user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Cannot authenticate: No connection to Supabase. Please check if Supabase is running locally.');
      return;
    }
    
    setLoading(true);
    setDebugInfo(null);
    clearError();

    console.log('=== Starting Enhanced Authentication ===');
    console.log('Email:', email);
    console.log('Is Sign Up:', isSignUp);
    console.log('Connection Status:', isConnected);
    console.log('Timestamp:', new Date().toISOString());

    try {
      if (isSignUp) {
        console.log('Attempting sign up...');
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/analysis`
          }
        });

        console.log('Sign up response:', { data, error });

        if (error) throw error;
        
        if (data.session) {
          console.log('Sign up successful with immediate session');
          toast.success('Account created and signed in successfully!');
        } else if (data.user && !data.user.email_confirmed_at) {
          console.log('Sign up successful, email confirmation required');
          toast.success('Account created! Please check your email to confirm your account.');
        } else {
          console.log('Sign up successful, switching to sign in');
          toast.success('Account created successfully! Please sign in.');
          setIsSignUp(false);
        }
      } else {
        console.log('Attempting sign in...');
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log('Sign in response:', { data, error });

        if (error) throw error;
        
        console.log('Sign in successful');
        toast.success('Welcome back!');
      }
    } catch (error: any) {
      console.error('=== Authentication Error ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Network status:', navigator.onLine ? 'Online' : 'Offline');
      console.error('Connection status:', isConnected);
      
      // Store debug information
      setDebugInfo({
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        networkOnline: navigator.onLine,
        supabaseConnected: isConnected,
        timestamp: new Date().toISOString(),
        operation: isSignUp ? 'signUp' : 'signIn',
        email: email
      });
      
      // Provide specific error messages
      if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
        toast.error('Connection failed. Please ensure Supabase is running locally on port 54321.');
      } else if (error.message.includes('Invalid login credentials')) {
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

    if (!isConnected) {
      toast.error('Cannot send magic link: No connection to Supabase');
      return;
    }

    setLoading(true);
    console.log('Sending magic link to:', email);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/analysis`
        }
      });

      if (error) throw error;
      
      console.log('Magic link sent successfully');
      toast.success('Check your email for the magic link!');
    } catch (error: any) {
      console.error('Magic link error:', error);
      toast.error(error.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

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
          <ConnectionStatus />
          
          {authError && (
            <Alert className="mb-4" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Authentication Error: {authError}
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
              disabled={loading || !isConnected}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>
          </form>
          
          {!isSignUp && (
            <div className="mt-4">
              <Button
                onClick={handleMagicLink}
                disabled={loading || !isConnected}
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
          
          {debugInfo && (
            <div className="mt-4 p-3 bg-slate-700 rounded text-xs text-slate-300">
              <p className="font-medium text-red-400 mb-2">Debug Information:</p>
              <pre className="whitespace-pre-wrap overflow-auto max-h-48">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-slate-700 rounded text-sm text-slate-300">
              <p className="font-medium">Development Mode:</p>
              <p>• Supabase should be running: <code>supabase start</code></p>
              <p>• Local instance: http://127.0.0.1:54321</p>
              <p>• Connection status: {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>
              <p>• Check console for detailed debugging information</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
