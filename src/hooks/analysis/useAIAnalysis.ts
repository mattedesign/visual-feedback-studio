
import { useState, useCallback } from 'react';
import { directRAGAnalysisService } from '@/services/analysis/directRAGAnalysis';
import { Annotation } from '@/types/analysis';
import { toast } from 'sonner';

interface UseAIAnalysisProps {
  imageUrls: string[];
  currentAnalysis: any;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setAnnotations: (annotations: Annotation[]) => void;
  isComparative?: boolean;
}

export const useAIAnalysis = ({
  imageUrls,
  currentAnalysis,
  setIsAnalyzing,
  setAnnotations,
  isComparative = false
}: UseAIAnalysisProps) => {
  const [isBuilding, setIsBuilding] = useState(false);
  const [hasResearchContext, setHasResearchContext] = useState(false);
  const [researchSourcesCount, setResearchSourcesCount] = useState(0);

  const handleAnalyze = useCallback(async (
    analysisContext?: string,
    imageAnnotations?: any[]
  ) => {
    if (!imageUrls || imageUrls.length === 0) {
      toast.error('No images available for analysis');
      return;
    }

    if (!currentAnalysis) {
      toast.error('No analysis session found');
      return;
    }

    // Get OpenAI API key from environment or prompt user
    const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!openaiApiKey) {
      toast.error('OpenAI API key not configured. Please contact support.');
      return;
    }

    setIsAnalyzing(true);
    setIsBuilding(false);
    setHasResearchContext(false);
    setResearchSourcesCount(0);

    try {
      console.log('🚀 Starting Direct RAG Analysis');
      
      // Build analysis prompt
      let analysisPrompt = 'Analyze this design for UX improvements';
      
      if (analysisContext) {
        analysisPrompt = `${analysisContext}\n\nFocus on UX improvements, accessibility, and conversion optimization.`;
      }

      if (imageAnnotations && imageAnnotations.length > 0) {
        const userFeedback = imageAnnotations
          .map(ia => ia.annotations.map(ann => `"${ann.comment}"`).join(', '))
          .filter(feedback => feedback.length > 0)
          .join('; ');
        
        if (userFeedback) {
          analysisPrompt += `\n\nUser has highlighted these specific areas: ${userFeedback}`;
        }
      }

      if (isComparative && imageUrls.length > 1) {
        analysisPrompt += '\n\nThis is a comparative analysis. Please compare the designs and provide insights on their differences and relative strengths.';
      }

      // Use the first image for now (direct RAG service currently supports single image)
      const result = await directRAGAnalysisService.analyzeWithRAG({
        imageUrl: imageUrls[0],
        analysisPrompt,
        openaiApiKey
      });

      if (result.success) {
        setAnnotations(result.annotations);
        setHasResearchContext(result.researchEnhanced);
        setResearchSourcesCount(result.knowledgeSourcesUsed);

        if (result.researchEnhanced) {
          toast.success(`Analysis complete! Enhanced with ${result.knowledgeSourcesUsed} research sources.`);
        } else {
          toast.success('Analysis complete!');
        }
      } else {
        throw new Error(result.error || 'Analysis failed');
      }

    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [imageUrls, currentAnalysis, setIsAnalyzing, setAnnotations, isComparative]);

  return {
    handleAnalyze,
    isBuilding,
    hasResearchContext,
    researchSourcesCount
  };
};
