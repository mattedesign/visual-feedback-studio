
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { WelcomeSection } from '@/components/analysis/WelcomeSection';
import { AnalysisLayout } from '@/components/analysis/AnalysisLayout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useAnalysis } from '@/hooks/useAnalysis';
import { toast } from 'sonner';

const Analysis = () => {
  const { user, loading, signOut } = useAuth();
  const {
    imageUrl,
    annotations,
    activeAnnotation,
    isAnalyzing,
    handleImageUpload,
    handleAreaClick,
    handleAnalyze,
    handleNewAnalysis,
    setActiveAnnotation,
  } = useAnalysis();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleImageUploadWithAuth = async (uploadedImageUrl: string) => {
    if (!user) {
      toast.error('Please sign in to upload files');
      return;
    }
    handleImageUpload(uploadedImageUrl);
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
        {!imageUrl ? (
          <WelcomeSection onImageUpload={handleImageUploadWithAuth} />
        ) : (
          <AnalysisLayout
            imageUrl={imageUrl}
            annotations={annotations}
            onAreaClick={handleAreaClick}
            onAnalyzeClick={handleAnalyze}
            isAnalyzing={isAnalyzing}
            activeAnnotation={activeAnnotation}
            onAnnotationClick={setActiveAnnotation}
            onNewAnalysis={handleNewAnalysis}
          />
        )}
      </main>
    </div>
  );
};

export default Analysis;
