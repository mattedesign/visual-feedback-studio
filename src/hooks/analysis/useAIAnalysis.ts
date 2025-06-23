
import { useCallback } from 'react';
import { AnalysisWithFiles } from '@/services/analysisDataService';
import { Annotation } from '@/types/analysis';
import { usePromptBuilder } from './usePromptBuilder';
import { useAnalysisExecution } from './useAnalysisExecution';
import { useAnalysisValidation } from './useAnalysisValidation';
import { useAnalysisConfiguration } from './useAnalysisConfiguration';
import { useAnalysisErrorHandler } from './useAnalysisErrorHandler';

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
  const { prepareAnalysisConfiguration } = useAnalysisConfiguration({
    imageUrl,
    imageUrls,
    currentAnalysis,
    isComparative,
  });
  const { handleAnalysisError } = useAnalysisErrorHandler({
    currentAnalysis,
    setIsAnalyzing,
  });

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
      const { imagesToAnalyze } = validateAnalysisInputs(
        imageUrl, 
        imageUrls, 
        currentAnalysis
      );

      // Prepare analysis configuration
      const { finalIsComparative } = prepareAnalysisConfiguration(
        customPrompt,
        imageAnnotations
      );
      
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
      await handleAnalysisError(error);
    }
  }, [
    imageUrl, 
    imageUrls, 
    currentAnalysis, 
    setIsAnalyzing, 
    setAnnotations, 
    buildIntelligentPrompt, 
    executeAnalysis, 
    validateAnalysisInputs,
    prepareAnalysisConfiguration,
    handleAnalysisError
  ]);

  return {
    handleAnalyze,
  };
};
