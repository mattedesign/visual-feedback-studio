
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { AnalysisWorkflow } from '@/components/analysis/AnalysisWorkflow';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';

const Analysis = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthGuard />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header user={user} onSignOut={handleSignOut} />
      <AnalysisWorkflow />
    </div>
  );
};

export default Analysis;
