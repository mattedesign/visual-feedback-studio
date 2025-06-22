
import { useCallback } from 'react';
import { AnalysisWithFiles, getFileUrl } from '@/services/analysisDataService';
import { getAnnotationsForAnalysis } from '@/services/annotationsService';
import { Annotation } from '@/types/analysis';
import { toast } from 'sonner';

interface UseUploadConfirmationActionsProps {
  uploadedAnalysis: AnalysisWithFiles | null;
  setCurrentAnalysis: (analysis: AnalysisWithFiles | null) => void;
  setImageUrl: (url: string | null) => void;
  setAnnotations: (annotations: Annotation[]) => void;
  setActiveAnnotation: (id: string | null) => void;
  setShowUploadConfirmation: (show: boolean) => void;
  setUploadedAnalysis: (analysis: AnalysisWithFiles | null) => void;
  setHasPendingConfirmation: (pending: boolean) => void;
}

export const useUploadConfirmationActions = ({
  uploadedAnalysis,
  setCurrentAnalysis,
  setImageUrl,
  setAnnotations,
  setActiveAnnotation,
  setShowUploadConfirmation,
  setUploadedAnalysis,
  setHasPendingConfirmation,
}: UseUploadConfirmationActionsProps) => {
  const handleViewLatestAnalysis = useCallback(async () => {
    if (!uploadedAnalysis) return;

    try {
      // Clear confirmation dialog and pending state FIRST
      setHasPendingConfirmation(false);
      setShowUploadConfirmation(false);
      setUploadedAnalysis(null);

      // Get the first file URL from the uploaded analysis
      const firstFile = uploadedAnalysis.files[0];
      const fileUrl = getFileUrl(firstFile);
      
      if (!fileUrl) {
        toast.error('No valid file URL found for this analysis');
        return;
      }

      // Verify the URL is accessible
      const response = await fetch(fileUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`File not accessible: ${response.status} ${response.statusText}`);
      }

      // Set the analysis as current and load its data
      setCurrentAnalysis(uploadedAnalysis);
      setImageUrl(fileUrl);
      
      // Load existing annotations for this analysis
      const existingAnnotations = await getAnnotationsForAnalysis(uploadedAnalysis.id);
      setAnnotations(existingAnnotations);
      setActiveAnnotation(null);
      
      toast.success(`Loaded analysis: ${uploadedAnalysis.title}`);
    } catch (error) {
      console.error('Error loading uploaded analysis:', error);
      toast.error('Failed to load the uploaded analysis');
    }
  }, [uploadedAnalysis, setCurrentAnalysis, setImageUrl, setAnnotations, setActiveAnnotation, setShowUploadConfirmation, setUploadedAnalysis, setHasPendingConfirmation]);

  const handleUploadAnother = useCallback(() => {
    // Clear all confirmation-related state
    setHasPendingConfirmation(false);
    setShowUploadConfirmation(false);
    setUploadedAnalysis(null);
    toast.success('Ready for another upload!');
  }, [setShowUploadConfirmation, setUploadedAnalysis, setHasPendingConfirmation]);

  const handleDismissConfirmation = useCallback(() => {
    // Clear all confirmation-related state
    setHasPendingConfirmation(false);
    setShowUploadConfirmation(false);
    setUploadedAnalysis(null);
  }, [setShowUploadConfirmation, setUploadedAnalysis, setHasPendingConfirmation]);

  return {
    handleViewLatestAnalysis,
    handleUploadAnother,
    handleDismissConfirmation,
  };
};
