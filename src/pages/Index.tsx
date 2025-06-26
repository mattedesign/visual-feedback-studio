
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useEffect } from 'react';

const Index = () => {
  console.log('🚀 Index component rendering - START');
  
  const { user, loading, signOut, error } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();

  // Debug logging
  useEffect(() => {
    console.log('🎯 Index component mounted');
    console.log('📊 Auth state:', { 
      hasUser: !!user, 
      userEmail: user?.email,
      loading,
      error,
      subscriptionLoading
    });
  }, [user, loading, error, subscriptionLoading]);

  const handleSignOut = async () => {
    console.log('🔐 Sign out initiated');
    try {
      await signOut();
      navigate('/auth');
    } catch (err) {
      console.error('❌ Sign out failed:', err);
    }
  };

  // Show loading state with bright red background
  if (loading || subscriptionLoading) {
    console.log('⏳ Still loading auth/subscription data');
    return (
      <div>
        {/* TEST ELEMENT - Remove this once CSS works */}
        <div className="test-css-working">
          🎉 CSS IS WORKING! You should see red background with yellow border.
        </div>
        
        <div className="min-h-screen bg-red-500 text-white flex items-center justify-center">
          <div className="text-center p-8 bg-red-600 rounded-lg">
            <div className="text-2xl font-bold mb-4">🔄 LOADING STATE</div>
            <div className="text-lg mb-2">Auth Loading: {loading ? 'YES' : 'NO'}</div>
            <div className="text-lg mb-2">Subscription Loading: {subscriptionLoading ? 'YES' : 'NO'}</div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show auth error state with bright orange background
  if (error) {
    console.log('❌ Auth error state:', error);
    return (
      <div>
        {/* TEST ELEMENT - Remove this once CSS works */}
        <div className="test-css-working">
          🎉 CSS IS WORKING! You should see red background with yellow border.
        </div>
        
        <div className="min-h-screen bg-orange-500 text-white flex items-center justify-center">
          <div className="text-center p-8 bg-orange-600 rounded-lg max-w-md">
            <div className="text-2xl font-bold mb-4">⚠️ AUTH ERROR</div>
            <div className="text-lg mb-4">{error}</div>
            <button 
              onClick={() => navigate('/auth')} 
              className="bg-white text-orange-600 px-4 py-2 rounded font-bold"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show not authenticated state with bright blue background
  if (!user) {
    console.log('🔒 No user found, showing not authenticated state');
    return (
      <div>
        {/* TEST ELEMENT - Remove this once CSS works */}
        <div className="test-css-working">
          🎉 CSS IS WORKING! You should see red background with yellow border.
        </div>
        
        <div className="min-h-screen bg-blue-500 text-white flex items-center justify-center">
          <div className="text-center p-8 bg-blue-600 rounded-lg">
            <div className="text-2xl font-bold mb-4">🔐 NOT LOGGED IN</div>
            <div className="text-lg mb-4">Redirecting to authentication...</div>
            <button 
              onClick={() => navigate('/auth')} 
              className="bg-white text-blue-600 px-6 py-3 rounded font-bold text-lg"
            >
              Go to Login Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ User authenticated, rendering main homepage');

  // Show success state with bright green background
  return (
    <div>
      {/* TEST ELEMENT - Remove this once CSS works */}
      <div className="test-css-working">
        🎉 CSS IS WORKING! You should see red background with yellow border.
      </div>
      
      <div className="min-h-screen bg-green-500 text-white flex items-center justify-center">
        <div className="text-center p-8 bg-green-600 rounded-lg max-w-2xl">
          <div className="text-3xl font-bold mb-6">🎉 SUCCESS! Homepage Loaded</div>
          
          <div className="text-left bg-green-700 p-4 rounded mb-6">
            <div className="text-lg font-semibold mb-2">User Info:</div>
            <div>📧 Email: {user.email}</div>
            <div>🆔 ID: {user.id}</div>
            <div>📅 Created: {new Date(user.created_at).toLocaleDateString()}</div>
          </div>

          {subscription && (
            <div className="text-left bg-green-700 p-4 rounded mb-6">
              <div className="text-lg font-semibold mb-2">Subscription Info:</div>
              <div>📋 Plan: {subscription.plan_type}</div>
              <div>📊 Analyses: {subscription.analyses_used} / {subscription.analyses_limit}</div>
            </div>
          )}

          <div className="space-y-4">
            <button 
              onClick={() => navigate('/analysis')} 
              className="bg-white text-green-600 px-6 py-3 rounded font-bold text-lg mr-4"
            >
              Go to Analysis
            </button>
            <button 
              onClick={handleSignOut} 
              className="bg-red-500 text-white px-6 py-3 rounded font-bold text-lg"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
