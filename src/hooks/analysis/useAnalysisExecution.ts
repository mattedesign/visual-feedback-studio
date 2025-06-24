
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { AnalysisWithFiles, updateAnalysisStatus, updateAnalysisContext } from '@/services/analysisDataService';
import { getAnnotationsForAnalysis } from '@/services/annotationsService';
import { supabase } from '@/integrations/supabase/client';
import { Annotation } from '@/types/analysis';
import { AIProvider } from '@/types/aiProvider';

interface UseAnalysisExecutionProps {
  currentAnalysis: AnalysisWithFiles | null;
  setIsAnalyzing: (analyzing: boolean) => void;
  setAnnotations: (annotations: Annotation[]) => void;
}

interface RAGContext {
  retrievedKnowledge: {
    relevantPatterns: Array<{
      id: string;
      title: string;
      content: string;
      category: string;
      source: string;
    }>;
    competitorInsights: any[];
  };
  enhancedPrompt: string;
  researchCitations: string[];
  industryContext: string;
}

export const useAnalysisExecution = ({
  currentAnalysis,
  setIsAnalyzing,
  setAnnotations,
}: UseAnalysisExecutionProps) => {
  
  const [ragContext, setRagContext] = useState<RAGContext | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  
  const executeAnalysis = useCallback(async (
    imagesToAnalyze: string[],
    userAnalysisPrompt: string,
    isComparative: boolean,
    aiProvider?: AIProvider
  ) => {
    console.log('=== Analysis Started (Simplified Mode) ===');
    console.log('Analysis configuration:', { 
      imageCount: imagesToAnalyze.length,
      analysisId: currentAnalysis?.id,
      isComparative,
      userPromptLength: userAnalysisPrompt.length,
      aiProvider: aiProvider || 'auto',
      ragEnabled: false // Temporarily disabled for debugging
    });
    
    // Update analysis status
    if (currentAnalysis) {
      await updateAnalysisStatus(currentAnalysis.id, 'analyzing');
      await updateAnalysisContext(currentAnalysis.id, {
        ai_model_used: aiProvider || 'auto-selected'
      });
    }

    // TEMPORARILY DISABLE RAG CONTEXT BUILDING
    console.log('⚠️  RAG context temporarily disabled for API key debugging');
    console.log('🚀 Executing simplified analysis...');
    
    // Call analyze-design WITHOUT RAG context for now
    const { data, error } = await supabase.functions.invoke('analyze-design', {
      body: {
        imageUrls: imagesToAnalyze,
        imageUrl: imagesToAnalyze[0],
        analysisId: currentAnalysis?.id,
        analysisPrompt: userAnalysisPrompt, // Use original prompt without RAG enhancement
        designType: currentAnalysis?.design_type || 'web',
        isComparative,
        aiProvider,
        // RAG enhancement fields disabled
        ragEnabled: false,
        ragContext: null,
        researchCitations: []
      }
    });

    if (error) {
      console.error('=== Analysis Error ===');
      console.error('Error details:', error);
      throw new Error(error.message || 'Analysis failed');
    }

    console.log('=== Analysis Response ===');
    console.log('Response data:', data);

    if (data?.success && data?.annotations) {
      console.log('✅ Analysis successful!');
      
      const freshAnnotations = await getAnnotationsForAnalysis(currentAnalysis!.id);
      console.log('📋 Annotations loaded:', freshAnnotations.length);
      
      setAnnotations(freshAnnotations);
      
      const imageText = imagesToAnalyze.length > 1 ? 
        `${imagesToAnalyze.length} images` : 'image';
      const analysisType = isComparative ? 'Comparative analysis' : 'Analysis';
      const providerText = aiProvider ? ` using ${aiProvider.toUpperCase()}` : ' with smart provider selection';
      
      toast.success(`${analysisType} complete${providerText}! Found ${data.totalAnnotations || freshAnnotations.length} insights across ${imageText}.`, {
        duration: 4000,
      });
      
      console.log('=== Analysis Completed Successfully ===');
    } else {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response from analysis service');
    }
  }, [currentAnalysis, setAnnotations]);

  return {
    executeAnalysis,
    ragContext,
    isBuilding
  };
};
