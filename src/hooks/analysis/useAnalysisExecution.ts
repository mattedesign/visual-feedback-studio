
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
      similarity?: number;
    }>;
    competitorInsights: any[];
  };
  enhancedPrompt: string;
  researchCitations: string[];
  industryContext: string;
  buildTimestamp?: string;
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
    aiProvider?: AIProvider,
    imageAnnotations?: any[]
  ) => {
    console.log('=== Enhanced RAG Analysis Started ===');
    console.log('Analysis configuration:', { 
      imageCount: imagesToAnalyze.length,
      analysisId: currentAnalysis?.id,
      isComparative,
      userPromptLength: userAnalysisPrompt.length,
      aiProvider: aiProvider || 'auto',
      ragEnabled: true,
      hasImageAnnotations: !!imageAnnotations?.length
    });
    
    setIsBuilding(true);
    
    try {
      // Update analysis status
      if (currentAnalysis) {
        await updateAnalysisStatus(currentAnalysis.id, 'analyzing');
        await updateAnalysisContext(currentAnalysis.id, {
          ai_model_used: aiProvider || 'auto-selected'
        });
      }

      console.log('🔍 Building RAG context...');
      
      // Build RAG context using the edge function
      const { data: ragData, error: ragError } = await supabase.functions.invoke('build-rag-context', {
        body: {
          imageUrls: imagesToAnalyze,
          userPrompt: userAnalysisPrompt,
          imageAnnotations: imageAnnotations || [],
          analysisId: currentAnalysis?.id
        }
      });

      if (ragError) {
        console.warn('RAG context building failed:', ragError);
        console.log('Proceeding with standard analysis...');
        setRagContext(null);
      } else if (ragData) {
        console.log('✅ RAG context built successfully:', {
          knowledgeEntries: ragData.retrievedKnowledge?.relevantPatterns?.length || 0,
          citations: ragData.researchCitations?.length || 0,
          industry: ragData.industryContext
        });
        setRagContext(ragData);
      }

      setIsBuilding(false);

      console.log('🚀 Executing enhanced analysis...');
      
      // Call analyze-design WITH RAG context
      const { data, error } = await supabase.functions.invoke('analyze-design', {
        body: {
          imageUrls: imagesToAnalyze,
          imageUrl: imagesToAnalyze[0],
          analysisId: currentAnalysis?.id,
          analysisPrompt: userAnalysisPrompt,
          designType: currentAnalysis?.design_type || 'web',
          isComparative,
          aiProvider,
          // RAG enhancement fields
          ragEnabled: true,
          ragContext: ragData,
          researchCitations: ragData?.researchCitations || []
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
        const ragText = ragData?.retrievedKnowledge?.relevantPatterns?.length 
          ? ` enhanced with ${ragData.retrievedKnowledge.relevantPatterns.length} research insights`
          : '';
        
        toast.success(`${analysisType} complete${providerText}${ragText}! Found ${data.totalAnnotations || freshAnnotations.length} insights across ${imageText}.`, {
          duration: 5000,
        });
        
        console.log('=== Analysis Completed Successfully ===');
      } else {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response from analysis service');
      }
    } catch (error) {
      console.error('Analysis execution failed:', error);
      setRagContext(null);
      throw error;
    } finally {
      setIsBuilding(false);
    }
  }, [currentAnalysis, setAnnotations]);

  return {
    executeAnalysis,
    ragContext,
    isBuilding
  };
};
