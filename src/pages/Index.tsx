
import { Header } from '@/components/layout/Header';
import { WelcomeSection } from '@/components/analysis/WelcomeSection';
import { DirectRAGTestSimple } from '@/components/analysis/DirectRAGTestSimple';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useAnalysis } from '@/hooks/useAnalysisHook';

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const { 
    handleImageUpload, 
    analyses, 
    loadAnalysis, 
    isLoadingAnalyses 
  } = useAnalysis();

  const handleSignOut = async () => {
    await signOut();
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
      <main className="container mx-auto px-4 py-8">
        <WelcomeSection 
          onImageUpload={handleImageUpload}
          analyses={analyses}
          onLoadAnalysis={loadAnalysis}
          isLoadingAnalyses={isLoadingAnalyses}
        />
        
        {/* Direct RAG Test Component */}
        <div className="mt-12">
          <DirectRAGTestSimple />
        </div>
      </main>
    </div>
  );
};

export default Index;
