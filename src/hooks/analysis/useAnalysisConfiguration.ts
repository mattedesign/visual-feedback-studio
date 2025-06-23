
import { useCallback } from 'react';
import { AnalysisWithFiles } from '@/services/analysisDataService';

interface UseAnalysisConfigurationProps {
  imageUrl?: string | null;
  imageUrls?: string[];
  currentAnalysis: AnalysisWithFiles | null;
  isComparative?: boolean;
}

export const useAnalysisConfiguration = ({
  imageUrl,
  imageUrls,
  currentAnalysis,
  isComparative = false,
}: UseAnalysisConfigurationProps) => {
  
  const prepareAnalysisConfiguration = useCallback((
    customPrompt?: string,
    imageAnnotations?: Array<{
      imageUrl: string; 
      annotations: Array<{x: number; y: number; comment: string; id: string}>
    }>
  ) => {
    // Determine which images to analyze
    const imagesToAnalyze = imageUrls && imageUrls.length > 0 ? imageUrls : (imageUrl ? [imageUrl] : []);
    const isMultiImage = imagesToAnalyze.length > 1;
    const finalIsComparative = isComparative || isMultiImage;
    
    console.log('=== Enhanced AI Analysis Started ===');
    console.log('Analysis configuration:', { 
      imageCount: imagesToAnalyze.length,
      analysisId: currentAnalysis?.id,
      isComparative: finalIsComparative,
      hasImageAnnotations: !!imageAnnotations,
      hasCustomPrompt: !!customPrompt?.trim(),
      userAnnotationsCount: imageAnnotations?.reduce((total, ia) => total + ia.annotations.length, 0) || 0
    });

    return {
      imagesToAnalyze,
      isMultiImage,
      finalIsComparative,
    };
  }, [imageUrl, imageUrls, currentAnalysis, isComparative]);

  return {
    prepareAnalysisConfiguration,
  };
};
