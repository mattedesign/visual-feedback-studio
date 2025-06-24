
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
    console.log('=== RAG-Enhanced Analysis Started ===');
    console.log('Analysis configuration:', { 
      imageCount: imagesToAnalyze.length,
      analysisId: currentAnalysis?.id,
      isComparative,
      userPromptLength: userAnalysisPrompt.length,
      aiProvider: aiProvider || 'auto',
      ragEnabled: true
    });
    
    // Update analysis status
    if (currentAnalysis) {
      await updateAnalysisStatus(currentAnalysis.id, 'analyzing');
      await updateAnalysisContext(currentAnalysis.id, {
        ai_model_used: aiProvider || 'auto-selected'
      });
    }

    // Build RAG Context First
    setIsBuilding(true);
    console.log('🔍 Building research context...');
    
    let ragContextData: RAGContext | null = null;
    
    try {
      const { data: ragData, error: ragError } = await supabase.functions.invoke('build-rag-context', {
        body: {
          imageUrls: imagesToAnalyze,
          userPrompt: userAnalysisPrompt,
          analysisId: currentAnalysis?.id
        }
      });

      if (!ragError && ragData) {
        ragContextData = ragData;
        setRagContext(ragData);
        console.log('📚 Research context built:', {
          knowledgeEntries: ragData.retrievedKnowledge.relevantPatterns.length,
          citations: ragData.researchCitations.length,
          industry: ragData.industryContext
        });
      } else {
        console.warn('RAG context building failed, proceeding with standard analysis:', ragError);
      }
    } catch (error) {
      console.warn('RAG context error:', error);
    } finally {
      setIsBuilding(false);
    }

    console.log('🚀 Executing analysis with research context...');
    
    // Call analyze-design with RAG context
    const { data, error } = await supabase.functions.invoke('analyze-design', {
      body: {
        imageUrls: imagesToAnalyze,
        imageUrl: imagesToAnalyze[0],
        analysisId: currentAnalysis?.id,
        analysisPrompt: ragContextData?.enhancedPrompt || userAnalysisPrompt,
        designType: currentAnalysis?.design_type || 'web',
        isComparative,
        aiProvider,
        // RAG enhancement fields
        ragEnabled: !!ragContextData,
        ragContext: ragContextData,
        researchCitations: ragContextData?.researchCitations || []
      }
    });

    if (error) {
      console.error('=== Analysis Error ===');
      console.error('Error details:', error);
      throw new Error(error.message || 'RAG-enhanced analysis failed');
    }

    console.log('=== Analysis Response ===');
    console.log('Response data:', data);

    if (data?.success && data?.annotations) {
      console.log('✅ RAG-enhanced analysis successful!');
      
      const freshAnnotations = await getAnnotationsForAnalysis(currentAnalysis!.id);
      console.log('📋 Annotations loaded:', freshAnnotations.length);
      
      setAnnotations(freshAnnotations);
      
      // Enhanced success message
      const researchInfo = ragContextData 
        ? ` with ${ragContextData.retrievedKnowledge.relevantPatterns.length} research insights`
        : '';
      
      const imageText = imagesToAnalyze.length > 1 ? 
        `${imagesToAnalyze.length} images` : 'image';
      const analysisType = isComparative ? 'Enhanced comparative analysis' : 'Enhanced analysis';
      const providerText = aiProvider ? ` using ${aiProvider.toUpperCase()}` : ' with smart provider selection';
      
      toast.success(`${analysisType} complete${providerText}! Found ${data.totalAnnotations || freshAnnotations.length} comprehensive insights across ${imageText}${researchInfo}.`, {
        duration: 4000,
      });
      
      console.log('=== RAG-Enhanced Analysis Completed Successfully ===');
    } else {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response from RAG-enhanced analysis');
    }
  }, [currentAnalysis, setAnnotations]);

  return {
    executeAnalysis,
    ragContext,
    isBuilding
  };
};
