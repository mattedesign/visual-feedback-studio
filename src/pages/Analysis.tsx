
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { WelcomeSection } from '@/components/analysis/WelcomeSection';
import { AnalysisLayout } from '@/components/analysis/AnalysisLayout';
import { UploadConfirmationDialog } from '@/components/upload/UploadConfirmationDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useAnalysis } from '@/hooks/useAnalysis';
import { toast } from 'sonner';

const Analysis = () => {
  const { user, loading, signOut } = useAuth();
  const {
    currentAnalysis,
    analyses,
    imageUrl,
    annotations,
    activeAnnotation,
    isAnalyzing,
    isLoadingAnalyses,
    isUploadInProgress,
    uploadedAnalysis,
    showUploadConfirmation,
    handleImageUpload,
    handleAreaClick,
    handleAnalyze,
    handleNewAnalysis,
    loadAnalysis,
    setActiveAnnotation,
    handleDeleteAnnotation,
    handleViewLatestAnalysis,
    handleUploadAnother,
    handleDismissConfirmation,
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
    await handleImageUpload(uploadedImageUrl);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthGuard />;
  }

  // Show welcome section if no image is loaded or upload is in progress (but not showing confirmation)
  const showWelcome = (!imageUrl || isUploadInProgress) && !showUploadConfirmation;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header user={user} onSignOut={handleSignOut} />
      
      <main className="container mx-auto px-4 py-8">
        {showWelcome ? (
          <WelcomeSection 
            onImageUpload={handleImageUploadWithAuth}
            analyses={analyses}
            onLoadAnalysis={loadAnalysis}
            isLoadingAnalyses={isLoadingAnalyses}
          />
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
            onDeleteAnnotation={handleDeleteAnnotation}
          />
        )}
      </main>

      <UploadConfirmationDialog
        open={showUploadConfirmation}
        uploadedAnalysis={uploadedAnalysis}
        onViewAnalysis={handleViewLatestAnalysis}
        onUploadAnother={handleUploadAnother}
        onDismiss={handleDismissConfirmation}
      />
    </div>
  );
};

export default Analysis;
