
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
    console.log('=== Analysis Started (RAG-Enhanced Mode) ===');
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

    try {
      // Step 1: Build RAG context
      console.log('🔍 Building RAG context for enhanced analysis...');
      setIsBuilding(true);
      
      const { data: ragData, error: ragError } = await supabase.functions.invoke('build-rag-context', {
        body: {
          imageUrls: imagesToAnalyze,
          userPrompt: userAnalysisPrompt,
          imageAnnotations: [],
          analysisId: currentAnalysis?.id
        }
      });

      if (ragError) {
        console.warn('RAG context building failed, proceeding without research enhancement:', ragError);
        setRagContext(null);
      } else if (ragData) {
        console.log('✅ RAG context built successfully:', {
          knowledgeEntries: ragData.retrievedKnowledge?.relevantPatterns?.length || 0,
          citations: ragData.researchCitations?.length || 0,
          industry: ragData.industryContext,
          enhancedPromptLength: ragData.enhancedPrompt?.length || 0
        });
        setRagContext(ragData);
      }
      
      setIsBuilding(false);

      // Step 2: Execute analysis with RAG enhancement
      console.log('🚀 Executing RAG-enhanced analysis...');
      
      // CRITICAL FIX: Use the enhanced prompt when RAG context is available
      const promptToUse = ragData?.enhancedPrompt || userAnalysisPrompt;
      console.log('Prompt decision:', {
        hasRAGContext: !!ragData,
        usingEnhancedPrompt: !!ragData?.enhancedPrompt,
        originalPromptLength: userAnalysisPrompt.length,
        finalPromptLength: promptToUse.length
      });
      
      const { data, error } = await supabase.functions.invoke('analyze-design', {
        body: {
          imageUrls: imagesToAnalyze,
          imageUrl: imagesToAnalyze[0], // Keep for backward compatibility
          analysisId: currentAnalysis?.id,
          analysisPrompt: promptToUse, // Use enhanced prompt here instead of original
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
        const providerText = aiProvider ? ` using ${aiProvider.toUpperCase()}` : '';
        
        // Enhanced success message with RAG info
        const ragInfo = data.researchEnhanced 
          ? ` Enhanced with ${data.knowledgeSourcesUsed || 0} research sources.`
          : '';
        
        toast.success(`${analysisType} complete${providerText}! Found ${data.totalAnnotations || freshAnnotations.length} insights across ${imageText}.${ragInfo}`, {
          duration: 4000,
        });
        
        console.log('=== RAG-Enhanced Analysis Completed Successfully ===');
        console.log('Research enhancement details:', {
          researchEnhanced: data.researchEnhanced,
          knowledgeSourcesUsed: data.knowledgeSourcesUsed,
          citationsCount: data.researchCitations?.length || 0,
          industryContext: data.industryContext,
          promptUsed: promptToUse.length > 500 ? 'Enhanced' : 'Original'
        });
      } else {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response from analysis service');
      }
    } catch (error) {
      console.error('❌ Analysis execution failed:', error);
      throw error;
    } finally {
      setIsBuilding(false);
      setIsAnalyzing(false);
    }
  }, [currentAnalysis, setAnnotations, setIsAnalyzing]);

  return {
    executeAnalysis,
    ragContext,
    isBuilding,
    hasResearchContext: ragContext !== null,
    researchSourcesCount: ragContext?.retrievedKnowledge?.relevantPatterns?.length || 0
  };
};
