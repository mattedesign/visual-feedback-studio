
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AmazonCard } from '@/components/ui/AmazonCard';
import { AmazonButton } from '@/components/ui/AmazonButton';
import { AmazonForm, AmazonFormField } from '@/components/forms/AmazonForm';
import { toast } from 'sonner';
import { AlertTriangle, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const AmazonAuth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const navigate = useNavigate();
  
  const { user, session } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (session && user) {
      navigate('/dashboard');
    }
  }, [session, user, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        });

        if (error) throw error;
        
        if (data.session) {
          toast.success('Account created and signed in successfully!');
          navigate('/dashboard');
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
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      let errorMessage = 'An error occurred during authentication';
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.message.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
        setIsSignUp(false);
      } else if (error.message.includes('Password should be at least 6 characters')) {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link before signing in.';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setErrors({ email: 'Please enter your email address first' });
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
      
      toast.success('Check your email for the magic link!');
    } catch (error: any) {
      console.error('Magic link error:', error);
      const errorMessage = error.message || 'Failed to send magic link';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-orange-400 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-32 right-20 w-32 h-32 bg-blue-500 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-32 w-24 h-24 bg-purple-500 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-3xl font-bold cursor-pointer hover:opacity-80 transition-opacity mb-4"
          >
            <span className="text-orange-400">Figmant</span>.ai
          </button>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {isSignUp ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {isSignUp 
              ? 'Sign up to start analyzing your designs with AI' 
              : 'Sign in to continue your design analysis journey'
            }
          </p>
        </div>

        <AmazonCard>
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-800 font-medium">Authentication Error</h4>
                <p className="text-red-600 text-sm mt-1">{errors.general}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleAuth} className="space-y-6">
            <AmazonFormField
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
              }}
              error={errors.email}
              required
            />

            <div className="amazon-form-group">
              <label className="amazon-label">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isSignUp ? 'Create a password (min 6 characters)' : 'Enter your password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  className={`amazon-input pr-12 ${errors.password ? 'border-red-500' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <div className="amazon-form-error">
                  <span>⚠️</span>
                  {errors.password}
                </div>
              )}
            </div>

            <AmazonButton
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
              icon={loading ? undefined : (isSignUp ? <Mail className="w-4 h-4" /> : <Lock className="w-4 h-4" />)}
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </AmazonButton>
          </form>
          
          {!isSignUp && (
            <div className="mt-4">
              <AmazonButton
                onClick={handleMagicLink}
                loading={loading}
                variant="secondary"
                className="w-full"
                icon={<Mail className="w-4 h-4" />}
              >
                Send Magic Link
              </AmazonButton>
            </div>
          )}
          
          <hr className="amazon-divider" />
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
              }}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </AmazonCard>

        {/* Trust Signals */}
        <div className="mt-8 text-center">
          <div className="flex justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Free Forever Plan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
              <span>No Credit Card</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmazonAuth;
