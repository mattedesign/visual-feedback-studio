
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

    console.log('🚀 Executing RAG-enhanced analysis with configuration:', {
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
        // Enable RAG by default for enhanced analysis
        ragEnhanced: true,
        researchSourceCount: ragMetadata?.researchSourceCount || 0,
      };

      console.log('📤 Sending RAG-enhanced analysis request:', {
        analysisId: analysisRequest.analysisId,
        imageCount: analysisRequest.imageUrls.length,
        promptPreview: enhancedPrompt.substring(0, 200) + '...',
        ragEnhanced: analysisRequest.ragEnhanced
      });

      // Use the actual analysis service with RAG enabled
      const response = await analysisService.analyzeDesign(analysisRequest);

      if (response.success && response.annotations) {
        console.log('✅ RAG-enhanced analysis completed successfully:', {
          annotationCount: response.annotations.length,
          categories: [...new Set(response.annotations.map(a => a.category))],
          researchEnhanced: response.researchEnhanced || false,
          knowledgeSourcesUsed: response.knowledgeSourcesUsed || 0
        });

        setAnnotations(response.annotations);
        
        const successMessage = response.researchEnhanced 
          ? `Analysis complete! Found ${response.annotations.length} insights backed by ${response.knowledgeSourcesUsed} research sources.`
          : `Analysis complete! Found ${response.annotations.length} design insights.`;
        
        toast.success(successMessage);
      } else {
        throw new Error(response.error || 'Analysis failed to return valid results');
      }
    } catch (error) {
      console.error('❌ RAG-enhanced analysis execution failed:', error);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentAnalysis, setIsAnalyzing, setAnnotations]);

  return {
    executeAnalysis,
  };
};
