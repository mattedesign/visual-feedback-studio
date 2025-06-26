
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { AnalysisWorkflow } from '@/components/analysis/AnalysisWorkflow';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

const Analysis = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Redirect to auth if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('User not authenticated, redirecting to /auth');
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Show loading while checking authentication
  if (authLoading) {
    return <LoadingSpinner />;
  }

  // If no user, don't render anything (redirect will happen)
  if (!user) {
    return null;
  }

  // User is authenticated - show the analysis workflow
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header user={user} onSignOut={handleSignOut} />
      <AnalysisWorkflow />
    </div>
  );
};

export default Analysis;
