
import { useCallback } from 'react';
import { toast } from 'sonner';
import { AnalysisWithFiles } from '@/services/analysisDataService';

export const useAnalysisValidation = () => {
  const validateAnalysisInputs = useCallback((
    imageUrl?: string | null,
    imageUrls?: string[],
    currentAnalysis?: AnalysisWithFiles | null
  ) => {
    // Determine which images to analyze
    const imagesToAnalyze = imageUrls && imageUrls.length > 0 ? imageUrls : (imageUrl ? [imageUrl] : []);
    
    if (imagesToAnalyze.length === 0 || !currentAnalysis) {
      const errorMsg = !imagesToAnalyze.length ? 'No images selected' : 'No analysis session found';
      console.error('Analysis validation failed:', errorMsg);
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    return {
      imagesToAnalyze,
      isMultiImage: imagesToAnalyze.length > 1
    };
  }, []);

  return {
    validateAnalysisInputs,
  };
};
