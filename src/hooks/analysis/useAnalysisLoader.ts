
import { useCallback } from 'react';
import { getUserAnalyses, getAnalysisById, getFileUrl, AnalysisWithFiles } from '@/services/analysisDataService';
import { getAnnotationsForAnalysis } from '@/services/annotationsService';
import { Annotation } from '@/types/analysis';
import { toast } from 'sonner';

interface UseAnalysisLoaderProps {
  setCurrentAnalysis: (analysis: AnalysisWithFiles | null) => void;
  setImageUrl: (url: string | null) => void;
  setAnnotations: (annotations: Annotation[]) => void;
  setAnalyses: (analyses: AnalysisWithFiles[]) => void;
  setIsLoadingAnalyses: (loading: boolean) => void;
  isUploadInProgress: boolean;
  hasPendingConfirmation: boolean;
  currentAnalysis: AnalysisWithFiles | null;
}

export const useAnalysisLoader = ({
  setCurrentAnalysis,
  setImageUrl,
  setAnnotations,
  setAnalyses,
  setIsLoadingAnalyses,
  isUploadInProgress,
  hasPendingConfirmation,
  currentAnalysis,
}: UseAnalysisLoaderProps) => {
  const loadAnalyses = useCallback(async () => {
    console.log('loadAnalyses called, isUploadInProgress:', isUploadInProgress, 'hasPendingConfirmation:', hasPendingConfirmation);
    
    try {
      setIsLoadingAnalyses(true);
      const userAnalyses = await getUserAnalyses();
      setAnalyses(userAnalyses);
      
      // CRITICAL: Do not auto-load any analysis if upload is in progress OR has pending confirmation
      if (isUploadInProgress || hasPendingConfirmation) {
        console.log('Upload in progress or pending confirmation, skipping auto-load of recent analysis');
        return;
      }

      // Only auto-load the most recent analysis if no current analysis is set
      // and we have no existing image loaded
      if (!currentAnalysis && userAnalyses.length > 0) {
        console.log('No current analysis, attempting to load most recent');
        await loadAnalysis(userAnalyses[0].id);
      }
    } catch (error) {
      console.error('Error loading analyses:', error);
      toast.error('Failed to load analyses');
    } finally {
      setIsLoadingAnalyses(false);
    }
  }, [setAnalyses, setIsLoadingAnalyses, isUploadInProgress, hasPendingConfirmation, currentAnalysis]);

  const loadAnalysis = useCallback(async (analysisId: string) => {
    console.log('Loading analysis:', analysisId);
    
    try {
      const analysis = await getAnalysisById(analysisId);
      if (!analysis) {
        toast.error('Analysis not found');
        return;
      }

      // Get the first file URL from the analysis
      const firstFile = analysis.files[0];
      const fileUrl = getFileUrl(firstFile);
      
      if (!fileUrl) {
        toast.error('No valid file URL found for this analysis');
        return;
      }

      console.log('File URL for analysis:', fileUrl);

      // Verify the URL is accessible
      const response = await fetch(fileUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`File not accessible: ${response.status} ${response.statusText}`);
      }

      // Set the analysis as current and load its data
      setCurrentAnalysis(analysis);
      setImageUrl(fileUrl);
      
      // Load existing annotations for this analysis
      const existingAnnotations = await getAnnotationsForAnalysis(analysis.id);
      setAnnotations(existingAnnotations);
      
      console.log(`Analysis loaded successfully with ${existingAnnotations.length} annotations`);
      toast.success(`Loaded analysis: ${analysis.title}`);
    } catch (error) {
      console.error('Error loading analysis:', error);
      toast.error('Failed to load analysis');
    }
  }, [setCurrentAnalysis, setImageUrl, setAnnotations]);

  return {
    loadAnalyses,
    loadAnalysis,
  };
};
