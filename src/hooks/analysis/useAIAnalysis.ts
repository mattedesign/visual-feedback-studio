
import { useCallback, useMemo } from 'react';
import { AnalysisWithFiles } from '@/services/analysisDataService';
import { Annotation } from '@/types/analysis';
import { usePromptBuilder } from './usePromptBuilder';
import { useAnalysisExecution } from './useAnalysisExecution';
import { useAnalysisValidation } from './useAnalysisValidation';
import { useAnalysisConfiguration } from './useAnalysisConfiguration';
import { useAnalysisErrorHandler } from './useAnalysisErrorHandler';
import { toast } from 'sonner';

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
  // 🔄 LOOP DETECTION: Track hook renders
  console.log('🔄 HOOK RENDER:', new Date().toISOString(), {
    hookName: 'useAIAnalysis',
    renderCount: ++((window as any).useAIAnalysisRenderCount) || ((window as any).useAIAnalysisRenderCount = 1),
    currentAnalysisId: currentAnalysis?.id,
    imageUrl: imageUrl ? 'present' : 'null',
    imageUrls: imageUrls?.length || 0
  });

  const { buildIntelligentPrompt } = usePromptBuilder();
  
  // Updated to capture state from useAnalysisExecution (RAG context removed)
  const { executeAnalysis, isBuilding } = useAnalysisExecution({
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

  // Stable analysis ID for dependency tracking
  const currentAnalysisId = useMemo(() => currentAnalysis?.id, [currentAnalysis?.id]);

  const handleAnalyze = useCallback(async (
    customPrompt?: string, 
    imageAnnotations?: Array<{
      imageUrl: string; 
      annotations: Array<{x: number; y: number; comment: string; id: string}>
    }>
  ) => {
    // 🚨 LOOP DETECTION: Track analysis triggers
    console.log('🚨 ANALYSIS TRIGGERED FROM:', new Error().stack);
    console.log('🚨 ANALYSIS TRIGGER DETAILS:', {
      timestamp: new Date().toISOString(),
      triggerCount: ++((window as any).analysisTriggerCount) || ((window as any).analysisTriggerCount = 1),
      customPrompt: customPrompt ? 'present' : 'null',
      imageAnnotations: imageAnnotations?.length || 0,
      currentAnalysisId: currentAnalysisId
    });

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

      // Build intelligent prompt using hierarchy system (NO RAG)
      let intelligentPrompt = buildIntelligentPrompt(customPrompt, imageAnnotations, imageUrls);
      
      console.log('=== STANDARD ANALYSIS START ===');
      console.log('Standard prompt created:', {
        promptLength: intelligentPrompt.length,
        hasMainComment: !!(customPrompt && customPrompt.trim()),
        hasUserAnnotations: !!(imageAnnotations && imageAnnotations.some(ia => ia.annotations.length > 0)),
        isComparativeAnalysis: finalIsComparative,
        ragDisabled: true
      });

      // RAG DISABLED - Execute standard analysis directly
      console.log('=== ANALYSIS EXECUTION START ===');
      console.log('Final analysis configuration:', {
        promptType: 'standard',
        promptLength: intelligentPrompt.length,
        hasRAGContext: false,
        researchSourceCount: 0,
        isComparative: finalIsComparative,
        ragDisabled: true
      });
      
      // Execute the analysis with standard prompt (NO RAG)
      await executeAnalysis(imagesToAnalyze, intelligentPrompt, finalIsComparative);

      console.log('✅ Standard analysis completed successfully');
      console.log('📊 Analysis summary:', {
        researchSourcesUsed: 0,
        analysisType: finalIsComparative ? 'comparative' : 'single-image',
        ragDisabled: true
      });

      console.log('=== STANDARD ANALYSIS COMPLETE ===');
      
    } catch (error) {
      console.error('=== ANALYSIS FAILED ===');
      console.error('Analysis error:', error);
      
      await handleAnalysisError(error);
    }
  }, [
    imageUrl,
    imageUrls,
    currentAnalysisId, // Use stable ID instead of full object
    validateAnalysisInputs,
    prepareAnalysisConfiguration,
    buildIntelligentPrompt,
    executeAnalysis,
    handleAnalysisError,
    setIsAnalyzing
  ]);

  // Memoize return object to prevent unnecessary re-renders (RAG properties removed)
  return useMemo(() => ({
    handleAnalyze,
    isBuilding,
    hasResearchContext: false, // Always false - RAG disabled
    researchSourcesCount: 0,   // Always 0 - RAG disabled
  }), [
    handleAnalyze,
    isBuilding
  ]);
};
