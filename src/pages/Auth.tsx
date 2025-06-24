
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/analysis');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/analysis');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        
        // Since email confirmations are disabled, users are immediately confirmed and signed in
        if (data.session) {
          toast.success('Account created and signed in successfully!');
          // Navigation will be handled by the auth state change listener
        } else {
          toast.success('Account created successfully! Please sign in.');
          setIsSignUp(false); // Switch to sign in mode
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast.success('Welcome back!');
        // Navigation will be handled by the auth state change listener
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Provide more specific error messages
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please check your credentials and try again.');
      } else if (error.message.includes('User already registered')) {
        toast.error('An account with this email already exists. Please sign in instead.');
        setIsSignUp(false);
      } else if (error.message.includes('Password should be at least 6 characters')) {
        toast.error('Password should be at least 6 characters long.');
      } else {
        toast.error(error.message || 'An error occurred during authentication');
      }
    } finally {
      setLoading(false);
    }
  };

  // Simplified magic link handler (optional feature)
  const handleMagicLink = async () => {
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });

      if (error) throw error;
      
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
              className="w-full bg-blue-600 hover:bg-blue-700"
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
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-slate-700 rounded text-sm text-slate-300">
              <p className="font-medium">Development Mode:</p>
              <p>Email confirmations are disabled for faster testing.</p>
              <p>Users are automatically signed in after registration.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
