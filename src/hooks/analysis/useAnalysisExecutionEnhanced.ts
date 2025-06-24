
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

    console.log('🚀 Executing analysis with configuration:', {
      imageCount: imagesToAnalyze.length,
      isComparative,
      promptLength: enhancedPrompt.length,
      hasRAGEnhancement: ragMetadata?.hasRAGContext || false,
      researchSources: ragMetadata?.researchSourceCount || 0
    });

    try {
      const analysisRequest = {
        imageUrls: imagesToAnalyze,
        analysisId: currentAnalysis.id,
        analysisPrompt: enhancedPrompt,
        designType: currentAnalysis.design_type,
        isComparative,
        // Include RAG metadata for tracking
        ragEnhanced: ragMetadata?.hasRAGContext || false,
        researchSourceCount: ragMetadata?.researchSourceCount || 0,
      };

      console.log('📤 Sending analysis request:', {
        analysisId: analysisRequest.analysisId,
        imageCount: analysisRequest.imageUrls.length,
        promptPreview: enhancedPrompt.substring(0, 200) + '...',
        ragEnhanced: analysisRequest.ragEnhanced
      });

      // Use the actual analysis service
      const response = await analysisService.analyzeDesign(analysisRequest);

      if (response.success && response.annotations) {
        console.log('✅ Analysis completed successfully:', {
          annotationCount: response.annotations.length,
          categories: [...new Set(response.annotations.map(a => a.category))],
          ragEnhanced: ragMetadata?.hasRAGContext || false
        });

        setAnnotations(response.annotations);
        
        const successMessage = ragMetadata?.hasRAGContext 
          ? `Analysis complete! Found ${response.annotations.length} insights backed by ${ragMetadata.researchSourceCount} research sources.`
          : `Analysis complete! Found ${response.annotations.length} design insights.`;
        
        toast.success(successMessage);
      } else {
        throw new Error(response.error || 'Analysis failed to return valid results');
      }
    } catch (error) {
      console.error('❌ Analysis execution failed:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentAnalysis, setIsAnalyzing, setAnnotations]);

  return {
    executeAnalysis,
  };
};
