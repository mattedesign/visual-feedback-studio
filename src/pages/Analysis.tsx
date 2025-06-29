
import { Header } from '@/components/layout/Header';
import { AnalysisStudio } from '@/components/analysis/AnalysisStudio';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

const Analysis = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const subscriptionData = useSubscription();

  const handleSignOut = async () => {
    await signOut();
  };

  // Show loading while checking authentication
  if (authLoading) {
    return <LoadingSpinner />;
  }

  // If no user, show simple message
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <p className="text-slate-300">You need to be authenticated to access this page.</p>
        </div>
      </div>
    );
  }

  // User is authenticated - show the analysis studio
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header user={user} onSignOut={handleSignOut} />
      <AnalysisStudio />
    </div>
  );
};

export default Analysis;
