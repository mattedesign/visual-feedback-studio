
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
  enableRAG?: boolean; // Add this property to fix the TypeScript error
}

export const useAIAnalysis = ({
  imageUrls,
  currentAnalysis,
  setIsAnalyzing,
  setAnnotations,
  isComparative = false,
  enableRAG = true // Default to true since we want RAG enabled by default
}: UseAIAnalysisProps) => {
  const [isBuilding, setIsBuilding] = useState(false);
  const [hasResearchContext, setHasResearchContext] = useState(false);
  const [researchSourcesCount, setResearchSourcesCount] = useState(0);

  const handleAnalyze = useCallback(async (
    analysisContext?: string,
    imageAnnotations?: any[]
  ) => {
    console.log('🚀 useAIAnalysis.handleAnalyze - Starting analysis');
    console.log('📊 Analysis parameters:', {
      imageUrls: imageUrls?.length || 0,
      currentAnalysis: currentAnalysis?.id || 'MISSING',
      analysisContext: analysisContext ? 'PROVIDED' : 'NONE',
      imageAnnotations: imageAnnotations?.length || 0,
      isComparative,
      enableRAG
    });

    if (!imageUrls || imageUrls.length === 0) {
      console.error('❌ No images available for analysis');
      toast.error('No images available for analysis');
      return;
    }

    if (!currentAnalysis) {
      console.error('❌ No analysis session found');
      toast.error('No analysis session found');
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

      console.log('📝 Final analysis prompt:', analysisPrompt.substring(0, 200) + '...');

      // Use the first image for now (direct RAG service currently supports single image)
      console.log('🖼️ Using image URL:', imageUrls[0]);
      
      const result = await directRAGAnalysisService.analyzeWithRAG({
        imageUrl: imageUrls[0],
        analysisPrompt
      });

      console.log('📋 Direct RAG service result:', {
        success: result.success,
        annotationsCount: result.annotations?.length || 0,
        totalAnnotations: result.totalAnnotations,
        researchEnhanced: result.researchEnhanced,
        knowledgeSourcesUsed: result.knowledgeSourcesUsed,
        error: result.error
      });

      if (result.success) {
        console.log('✅ Analysis successful, setting annotations:', result.annotations);
        console.log('🎯 Annotations to set:', result.annotations.map(a => ({
          id: a.id,
          category: a.category,
          severity: a.severity,
          feedback: a.feedback?.substring(0, 50) + '...'
        })));

        // Set annotations with detailed logging
        console.log('📍 About to call setAnnotations with:', result.annotations.length, 'annotations');
        setAnnotations(result.annotations);
        console.log('✅ setAnnotations called successfully');
        
        setHasResearchContext(result.researchEnhanced);
        setResearchSourcesCount(result.knowledgeSourcesUsed);

        if (result.researchEnhanced) {
          toast.success(`Analysis complete! Enhanced with ${result.knowledgeSourcesUsed} research sources.`);
        } else {
          toast.success('Analysis complete!');
        }
      } else {
        console.error('❌ Analysis failed:', result.error);
        throw new Error(result.error || 'Analysis failed');
      }

    } catch (error) {
      console.error('❌ useAIAnalysis.handleAnalyze - Analysis failed:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      toast.error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      console.log('🔚 useAIAnalysis.handleAnalyze - Setting isAnalyzing to false');
      setIsAnalyzing(false);
    }
  }, [imageUrls, currentAnalysis, setIsAnalyzing, setAnnotations, isComparative, enableRAG]);

  return {
    handleAnalyze,
    isBuilding,
    hasResearchContext,
    researchSourcesCount
  };
};
