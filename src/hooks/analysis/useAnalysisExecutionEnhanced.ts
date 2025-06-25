
import { useCallback } from 'react';
import { AnalysisWithFiles } from '@/services/analysisDataService';
import { Annotation } from '@/types/analysis';
import { analysisService } from '@/services/analysisService';
import { toast } from 'sonner';

interface UseAnalysisExecutionEnhancedProps {
  currentAnalysis: AnalysisWithFiles | null;
  setIsAnalyzing: (analyzing: boolean) => void;
  setAnnotations: (annotations: Annotation[]) => void;
}

export const useAnalysisExecutionEnhanced = ({
  currentAnalysis,
  setIsAnalyzing,
  setAnnotations,
}: UseAnalysisExecutionEnhancedProps) => {
  const executeAnalysis = useCallback(async (
    imagesToAnalyze: string[],
    enhancedPrompt: string,
    isComparative: boolean,
    ragMetadata?: {
      hasRAGContext: boolean;
      researchSourceCount: number;
      categories: string[];
    }
  ) => {
    if (!currentAnalysis) {
      throw new Error('No analysis session found');
    }

    console.log('🚀 Main Analysis Execution: Using same edge function as test:', {
      imageCount: imagesToAnalyze.length,
      isComparative,
      promptLength: enhancedPrompt.length,
      ragEnabled: true, // Always enable RAG
      researchSources: ragMetadata?.researchSourceCount || 0
    });

    try {
      const analysisRequest = {
        imageUrls: imagesToAnalyze,
        analysisId: currentAnalysis.id,
        analysisPrompt: enhancedPrompt,
        designType: currentAnalysis.design_type,
        isComparative,
        ragEnhanced: true, // Force enable RAG
        researchSourceCount: ragMetadata?.researchSourceCount || 0,
      };

      console.log('📤 Main Analysis: Sending request to same edge function as test:', {
        analysisId: analysisRequest.analysisId,
        imageCount: analysisRequest.imageUrls.length,
        promptPreview: enhancedPrompt.substring(0, 200) + '...',
        ragEnabled: true
      });

      // Use the standard analysis service which now calls the same edge function as the test
      const response = await analysisService.analyzeDesign(analysisRequest);

      if (response.success && response.annotations) {
        console.log('✅ Main Analysis: Completed successfully with RAG enhancement:', {
          annotationCount: response.annotations.length,
          categories: [...new Set(response.annotations.map(a => a.category))],
          researchEnhanced: response.researchEnhanced || false,
          knowledgeSourcesUsed: response.knowledgeSourcesUsed || 0
        });

        setAnnotations(response.annotations);
        
        const successMessage = response.researchEnhanced 
          ? `Analysis complete! Enhanced with ${response.knowledgeSourcesUsed} research sources.`
          : `Analysis complete! Found ${response.annotations.length} design insights.`;
        
        toast.success(successMessage);
      } else {
        throw new Error(response.error || 'Analysis failed to return valid results');
      }
    } catch (error) {
      console.error('❌ Main Analysis: Execution failed:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentAnalysis, setIsAnalyzing, setAnnotations]);

  return {
    executeAnalysis,
  };
};
