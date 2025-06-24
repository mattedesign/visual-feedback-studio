
import { useCallback, useState } from 'react';
import { useAnalysisExecution } from './useAnalysisExecution';
import { AnalysisWithFiles } from '@/services/analysisDataService';
import { Annotation } from '@/types/analysis';
import { AIProvider } from '@/types/aiProvider';

interface UseAIAnalysisEnhancedProps {
  imageUrls: string[];
  currentAnalysis: AnalysisWithFiles | null;
  setIsAnalyzing: (analyzing: boolean) => void;
  setAnnotations: (annotations: Annotation[]) => void;
  isComparative: boolean;
}

export const useAIAnalysisEnhanced = ({
  imageUrls,
  currentAnalysis,
  setIsAnalyzing,
  setAnnotations,
  isComparative
}: UseAIAnalysisEnhancedProps) => {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('claude');
  
  const { executeAnalysis, ragContext, isBuilding } = useAnalysisExecution({
    currentAnalysis,
    setIsAnalyzing,
    setAnnotations,
  });

  const handleAnalyze = useCallback(async (
    analysisPrompt: string = '',
    imageAnnotations?: any[]
  ) => {
    if (!currentAnalysis || imageUrls.length === 0) {
      throw new Error('Missing analysis session or images');
    }

    console.log('🚀 Starting RAG-enhanced analysis:', {
      analysisId: currentAnalysis.id,
      imageCount: imageUrls.length,
      isComparative,
      provider: selectedProvider,
      hasAnnotations: !!imageAnnotations?.length,
      promptLength: analysisPrompt.length
    });

    setIsAnalyzing(true);

    try {
      await executeAnalysis(
        imageUrls,
        analysisPrompt,
        isComparative,
        selectedProvider,
        imageAnnotations
      );
    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [imageUrls, currentAnalysis, isComparative, selectedProvider, executeAnalysis, setIsAnalyzing]);

  // Calculate research context info for UI
  const hasResearchContext = !!ragContext?.retrievedKnowledge?.relevantPatterns?.length;
  const researchSourcesCount = ragContext?.retrievedKnowledge?.relevantPatterns?.length || 0;

  return {
    handleAnalyze,
    selectedProvider,
    setSelectedProvider,
    ragContext,
    isBuilding,
    hasResearchContext,
    researchSourcesCount,
  };
};
