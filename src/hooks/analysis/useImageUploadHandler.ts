
import { useCallback } from 'react';
import { toast } from 'sonner';
import { getUserAnalyses, AnalysisWithFiles } from '@/services/analysisDataService';
import { Annotation } from '@/types/analysis';

interface UseImageUploadHandlerProps {
  setIsUploadInProgress: (inProgress: boolean) => void;
  setImageUrl: (url: string | null) => void;
  setAnalyses: (analyses: AnalysisWithFiles[]) => void;
  setCurrentAnalysis: (analysis: AnalysisWithFiles | null) => void;
  setAnnotations: (annotations: Annotation[]) => void;
  setUploadedAnalysis: (analysis: AnalysisWithFiles | null) => void;
  setShowUploadConfirmation: (show: boolean) => void;
}

export const useImageUploadHandler = ({
  setIsUploadInProgress,
  setImageUrl,
  setAnalyses,
  setCurrentAnalysis,
  setAnnotations,
  setUploadedAnalysis,
  setShowUploadConfirmation,
}: UseImageUploadHandlerProps) => {
  const handleImageUpload = useCallback(async (uploadedImageUrl: string) => {
    console.log('Handling image upload with URL:', uploadedImageUrl);
    
    // Set upload in progress to prevent auto-loading
    setIsUploadInProgress(true);
    
    try {
      // Verify the uploaded URL is accessible
      const response = await fetch(uploadedImageUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Uploaded file not accessible: ${response.status} ${response.statusText}`);
      }
      
      // Refresh analyses list to include the new upload
      const userAnalyses = await getUserAnalyses();
      setAnalyses(userAnalyses);
      
      // Store the uploaded analysis for confirmation but don't auto-load it
      if (userAnalyses.length > 0) {
        const latestAnalysis = userAnalyses[0];
        setUploadedAnalysis(latestAnalysis);
        setShowUploadConfirmation(true);
        
        console.log('Upload completed, analysis ready for confirmation:', latestAnalysis.id);
      }
      
      toast.success('Design uploaded successfully! Choose an action below.');
    } catch (error) {
      console.error('Error handling image upload:', error);
      toast.error(`Upload verification failed: ${error.message}`);
    } finally {
      setIsUploadInProgress(false);
    }
  }, [setIsUploadInProgress, setAnalyses, setUploadedAnalysis, setShowUploadConfirmation]);

  return {
    handleImageUpload,
  };
};
