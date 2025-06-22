
import { useCallback } from 'react';
import { toast } from 'sonner';
import { getUserAnalyses, AnalysisWithFiles } from '@/services/analysisDataService';
import { getAnnotationsForAnalysis } from '@/services/annotationsService';
import { Annotation } from '@/types/analysis';

interface UseImageUploadHandlerProps {
  setIsUploadInProgress: (inProgress: boolean) => void;
  setImageUrl: (url: string | null) => void;
  setAnalyses: (analyses: AnalysisWithFiles[]) => void;
  setCurrentAnalysis: (analysis: AnalysisWithFiles | null) => void;
  setAnnotations: (annotations: Annotation[]) => void;
}

export const useImageUploadHandler = ({
  setIsUploadInProgress,
  setImageUrl,
  setAnalyses,
  setCurrentAnalysis,
  setAnnotations,
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
      
      setImageUrl(uploadedImageUrl);
      
      // Refresh analyses list to include the new upload
      const userAnalyses = await getUserAnalyses();
      setAnalyses(userAnalyses);
      
      // Set the most recent analysis as current and clear previous annotations
      if (userAnalyses.length > 0) {
        const latestAnalysis = userAnalyses[0];
        setCurrentAnalysis(latestAnalysis);
        
        // Load annotations for the new analysis
        const existingAnnotations = await getAnnotationsForAnalysis(latestAnalysis.id);
        setAnnotations(existingAnnotations);
        
        console.log('Current analysis set to:', latestAnalysis.id);
      }
      
      toast.success('Design uploaded successfully!');
    } catch (error) {
      console.error('Error handling image upload:', error);
      toast.error(`Upload verification failed: ${error.message}`);
      setImageUrl(null);
    } finally {
      setIsUploadInProgress(false);
    }
  }, [setIsUploadInProgress, setImageUrl, setAnalyses, setCurrentAnalysis, setAnnotations]);

  return {
    handleImageUpload,
  };
};
