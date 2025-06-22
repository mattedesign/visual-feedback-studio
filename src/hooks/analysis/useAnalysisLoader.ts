
import { useCallback } from 'react';
import { toast } from 'sonner';
import { 
  getUserAnalyses, 
  getAnalysisById, 
  getFileUrl, 
  AnalysisWithFiles 
} from '@/services/analysisDataService';
import { getAnnotationsForAnalysis } from '@/services/annotationsService';
import { Annotation } from '@/types/analysis';

interface UseAnalysisLoaderProps {
  setCurrentAnalysis: (analysis: AnalysisWithFiles | null) => void;
  setImageUrl: (url: string | null) => void;
  setAnnotations: (annotations: Annotation[]) => void;
  setAnalyses: (analyses: AnalysisWithFiles[]) => void;
  setIsLoadingAnalyses: (loading: boolean) => void;
  isUploadInProgress: boolean;
  currentAnalysis: AnalysisWithFiles | null;
}

export const useAnalysisLoader = ({
  setCurrentAnalysis,
  setImageUrl,
  setAnnotations,
  setAnalyses,
  setIsLoadingAnalyses,
  isUploadInProgress,
  currentAnalysis,
}: UseAnalysisLoaderProps) => {
  const loadAnalyses = useCallback(async () => {
    setIsLoadingAnalyses(true);
    try {
      const userAnalyses = await getUserAnalyses();
      setAnalyses(userAnalyses);
      
      // Only auto-load if there's no upload in progress and no current analysis
      if (!isUploadInProgress && !currentAnalysis && userAnalyses.length > 0) {
        const recentAnalysis = userAnalyses[0];
        if (recentAnalysis && recentAnalysis.files.length > 0) {
          await loadAnalysis(recentAnalysis.id);
        }
      }
    } catch (error) {
      console.error('Error loading analyses:', error);
      toast.error('Failed to load previous analyses');
    } finally {
      setIsLoadingAnalyses(false);
    }
  }, [isUploadInProgress, currentAnalysis, setAnalyses, setIsLoadingAnalyses, setCurrentAnalysis]);

  const loadAnalysis = useCallback(async (analysisId: string) => {
    try {
      console.log('Loading analysis:', analysisId);
      const analysis = await getAnalysisById(analysisId);
      
      if (!analysis) {
        console.error('Analysis not found');
        toast.error('Analysis not found');
        return;
      }

      if (analysis.files.length === 0) {
        console.error('Analysis has no files');
        toast.error('Analysis has no files');
        return;
      }

      setCurrentAnalysis(analysis);
      
      // Get the first file URL
      const firstFile = analysis.files[0];
      const fileUrl = getFileUrl(firstFile);
      
      console.log('File URL for analysis:', fileUrl);
      
      if (!fileUrl) {
        console.error('No valid file URL found for analysis');
        toast.error('No valid file URL found for this analysis');
        setImageUrl(null);
        return;
      }

      // Verify the URL is accessible before setting it
      try {
        const response = await fetch(fileUrl, { method: 'HEAD' });
        if (response.ok) {
          setImageUrl(fileUrl);
          
          // Load existing annotations for this analysis
          const existingAnnotations = await getAnnotationsForAnalysis(analysisId);
          setAnnotations(existingAnnotations);
          
          console.log('Analysis loaded successfully with', existingAnnotations.length, 'annotations');
          toast.success(`Loaded analysis: ${analysis.title}`);
        } else {
          throw new Error(`File not accessible: ${response.status} ${response.statusText}`);
        }
      } catch (urlError) {
        console.error('Error verifying file URL:', urlError);
        toast.error('File is not accessible. Please try uploading again.');
        setImageUrl(null);
      }
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
