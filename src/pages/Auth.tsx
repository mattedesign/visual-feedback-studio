// src/pages/Auth.tsx
// Safe fix to redirect logged-in users to analysis page

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertTriangle, ArrowRight, Users, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { UserRole, ROLE_OPTIONS } from '@/types/profiles';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const { user, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // 🚀 SAFE REDIRECT FIX: Automatically redirect logged-in users
  useEffect(() => {
    // Only redirect if we have both user and session, and auth is not loading
    if (!authLoading && user && session) {
      console.log('✅ User already authenticated, redirecting to dashboard...');
      
      // Use replace to avoid adding to browser history (prevents back button loops)
      navigate('/', { replace: true });
    }
  }, [user, session, authLoading, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');

    // Validation for sign-up
    if (isSignUp) {
      if (!fullName.trim()) {
        setAuthError('Please enter your full name.');
        setLoading(false);
        return;
      }
      if (!selectedRole) {
        setAuthError('Please select your role to personalize your experience.');
        setLoading(false);
        return;
      }
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
              role: selectedRole
            }
          }
        });
        if (error) throw error;
        toast.success('Check your email to confirm your account!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        
        // Success! The useEffect above will handle the redirect
        toast.success('Signed in successfully!');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      if (error.message.includes('Invalid login credentials')) {
        setAuthError('Invalid email or password. Please check your credentials and try again.');
      } else if (error.message.includes('User already registered')) {
        toast.error('An account with this email already exists. Please sign in instead.');
        setIsSignUp(false);
      } else if (error.message.includes('Password should be at least 6 characters')) {
        setAuthError('Password should be at least 6 characters long.');
      } else if (error.message.includes('Email not confirmed')) {
        setAuthError('Please check your email and click the confirmation link before signing in.');
      } else {
        setAuthError(error.message || 'An error occurred during authentication');
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
          emailRedirectTo: `${window.location.origin}/`
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

  // Show loading spinner while checking auth state
  if (authLoading) {
    return <LoadingSpinner />;
  }

  // 🚨 IMPORTANT: If user is authenticated, don't render the form
  // The useEffect will handle the redirect
  if (user && session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-600 mt-4">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // Only show auth form for non-authenticated users
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-gray-200 shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">UX Analysis Studio</span>
          </div>
          <CardTitle className="text-2xl text-gray-900">
            {isSignUp ? 'Join Our Community' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {isSignUp 
              ? 'Get personalized UX insights tailored to your role' 
              : 'Sign in to continue your UX analysis journey'
            }
          </CardDescription>
          {isSignUp && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-blue-50 p-2 rounded-lg mt-3">
              <Users className="w-4 h-4" />
              <span>We'll customize your experience based on your role</span>
            </div>
          )}
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
            {isSignUp && (
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="mt-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}
            
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
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
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {isSignUp && (
              <div>
                <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                  What's your role?
                </Label>
                <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
                  <SelectTrigger className="mt-1 bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select your primary role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{role.label}</span>
                          <span className="text-xs text-gray-500">{role.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  This helps us personalize your UX analysis experience
                </p>
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </form>

          <div className="mt-4">
            <Button
              onClick={handleMagicLink}
              disabled={loading}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </Button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setAuthError('');
                setFullName('');
                setSelectedRole('');
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;