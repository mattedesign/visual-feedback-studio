
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const navigate = useNavigate();

  // Check Supabase connection and configuration on component mount
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      console.log('=== Checking Supabase Connection ===');
      
      try {
        // Check environment variables
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "http://127.0.0.1:54321";
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key";
        
        console.log('Supabase URL:', supabaseUrl);
        console.log('Supabase Key exists:', !!supabaseKey);
        console.log('Using local development:', supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost'));
        
        // Test basic connection
        const { data, error } = await supabase.from('analyses').select('count').limit(1);
        
        if (error) {
          console.error('Connection test failed:', error);
          setConnectionStatus('error');
          setDebugInfo({
            error: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            supabaseUrl,
            timestamp: new Date().toISOString()
          });
        } else {
          console.log('Connection test successful');
          setConnectionStatus('connected');
        }
      } catch (err) {
        console.error('Connection check failed:', err);
        setConnectionStatus('error');
        setDebugInfo({
          error: 'Failed to connect to Supabase',
          details: err instanceof Error ? err.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    };

    checkSupabaseConnection();
  }, []);

  useEffect(() => {
    // Check if user is already signed in
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session check error:', error);
        return;
      }
      
      if (session) {
        console.log('User already authenticated, redirecting...');
        navigate('/analysis');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      if (session) {
        navigate('/analysis');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setDebugInfo(null);

    console.log('=== Starting Authentication ===');
    console.log('Email:', email);
    console.log('Is Sign Up:', isSignUp);
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
      
      // Store debug information
      setDebugInfo({
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        networkOnline: navigator.onLine,
        timestamp: new Date().toISOString(),
        operation: isSignUp ? 'signUp' : 'signIn',
        email: email
      });
      
      // Provide specific error messages
      if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
        toast.error('Connection failed. Please check your internet connection and try again.');
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

  const renderConnectionStatus = () => {
    if (connectionStatus === 'checking') {
      return (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Checking Supabase connection...
          </AlertDescription>
        </Alert>
      );
    }

    if (connectionStatus === 'error') {
      return (
        <Alert className="mb-4" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Connection to Supabase failed. Please check if your local Supabase instance is running.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert className="mb-4 border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Connected to Supabase successfully
        </AlertDescription>
      </Alert>
    );
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
          {renderConnectionStatus()}
          
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
              disabled={loading || connectionStatus === 'error'}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Button>
          </form>
          
          {!isSignUp && (
            <div className="mt-4">
              <Button
                onClick={handleMagicLink}
                disabled={loading || connectionStatus === 'error'}
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
              <p>Local Supabase should be running on port 54321</p>
              <p>Email confirmations may be disabled for faster testing</p>
              <p>Check console for detailed debugging information</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
