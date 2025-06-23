
import { useCallback } from 'react';
import { AnalysisWithFiles, updateAnalysisStatus } from '@/services/analysisDataService';
import { Annotation } from '@/types/analysis';
import { usePromptBuilder } from './usePromptBuilder';
import { useAnalysisExecution } from './useAnalysisExecution';
import { useAnalysisValidation } from './useAnalysisValidation';

interface UseAIAnalysisProps {
  imageUrl?: string | null;
  imageUrls?: string[];
  currentAnalysis: AnalysisWithFiles | null;
  setIsAnalyzing: (analyzing: boolean) => void;
  setAnnotations: (annotations: Annotation[]) => void;
  isComparative?: boolean;
}

export const useAIAnalysis = ({
  imageUrl,
  imageUrls,
  currentAnalysis,
  setIsAnalyzing,
  setAnnotations,
  isComparative = false,
}: UseAIAnalysisProps) => {
  const { buildIntelligentPrompt } = usePromptBuilder();
  const { executeAnalysis } = useAnalysisExecution({
    currentAnalysis,
    setIsAnalyzing,
    setAnnotations,
  });
  const { validateAnalysisInputs } = useAnalysisValidation();

  const handleAnalyze = useCallback(async (
    customPrompt?: string, 
    imageAnnotations?: Array<{
      imageUrl: string; 
      annotations: Array<{x: number; y: number; comment: string; id: string}>
    }>
  ) => {
    setIsAnalyzing(true);
    
    try {
      // Validate inputs and get images to analyze
      const { imagesToAnalyze, isMultiImage } = validateAnalysisInputs(
        imageUrl, 
        imageUrls, 
        currentAnalysis
      );

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
      
      // Build intelligent prompt using hierarchy system
      const intelligentPrompt = buildIntelligentPrompt(customPrompt, imageAnnotations, imageUrls);
      
      console.log('Intelligent prompt created:', {
        promptLength: intelligentPrompt.length,
        hasMainComment: !!(customPrompt && customPrompt.trim()),
        hasUserAnnotations: !!(imageAnnotations && imageAnnotations.some(ia => ia.annotations.length > 0)),
        isComparativeAnalysis: finalIsComparative,
        followsHierarchy: true
      });
      
      // Execute the analysis
      await executeAnalysis(imagesToAnalyze, intelligentPrompt, finalIsComparative);
      
    } catch (error) {
      console.error('=== Enhanced Analysis Error ===');
      console.error('Error name:', error?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      
      // Update analysis status to failed
      try {
        if (currentAnalysis) {
          await updateAnalysisStatus(currentAnalysis.id, 'failed');
        }
      } catch (statusError) {
        console.error('Failed to update analysis status:', statusError);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Final error message:', errorMessage);
      
      // Re-throw to allow retry logic in AnalyzingStep
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    imageUrl, 
    imageUrls, 
    currentAnalysis, 
    setIsAnalyzing, 
    setAnnotations, 
    isComparative, 
    buildIntelligentPrompt, 
    executeAnalysis, 
    validateAnalysisInputs
  ]);

  return {
    handleAnalyze,
  };
};
