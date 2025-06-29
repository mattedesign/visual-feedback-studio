

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

export const useAnalysisExecution = ({
  currentAnalysis,
  setIsAnalyzing,
  setAnnotations,
}: UseAnalysisExecutionProps) => {
  // 🔄 LOOP DETECTION: Track hook renders
  console.log('🔄 HOOK RENDER:', new Date().toISOString(), {
    hookName: 'useAnalysisExecution',
    renderCount: ++((window as any).useAnalysisExecutionRenderCount) || ((window as any).useAnalysisExecutionRenderCount = 1),
    currentAnalysisId: currentAnalysis?.id
  });
  
  const executeAnalysis = useCallback(async (
    imagesToAnalyze: string[],
    userAnalysisPrompt: string,
    isComparative: boolean,
    aiProvider?: AIProvider
  ) => {
    // 🚨 LOOP DETECTION: Track execution calls
    console.log('🚨 EXECUTE ANALYSIS CALLED:', {
      timestamp: new Date().toISOString(),
      executionCount: ++((window as any).executeAnalysisCount) || ((window as any).executeAnalysisCount = 1),
      stackTrace: new Error().stack,
      imagesToAnalyze: imagesToAnalyze.length,
      promptLength: userAnalysisPrompt.length,
      isComparative,
      aiProvider,
      currentAnalysisId: currentAnalysis?.id
    });

    console.log('=== Analysis Started (RAG DISABLED) ===');
    console.log('Analysis configuration:', { 
      imageCount: imagesToAnalyze.length,
      analysisId: currentAnalysis?.id,
      isComparative,
      userPromptLength: userAnalysisPrompt.length,
      aiProvider: aiProvider || 'auto',
      ragEnabled: false // PERMANENTLY DISABLED
    });
    
    // Update analysis status
    if (currentAnalysis) {
      await updateAnalysisStatus(currentAnalysis.id, 'analyzing');
      await updateAnalysisContext(currentAnalysis.id, {
        ai_model_used: aiProvider || 'auto-selected'
      });
    }

    console.log('⚠️ RAG system permanently disabled to prevent loops');
    console.log('🚀 Executing standard analysis without RAG...');
    
    // Call analyze-design WITHOUT any RAG context
    const { data, error } = await supabase.functions.invoke('analyze-design', {
      body: {
        imageUrls: imagesToAnalyze,
        imageUrl: imagesToAnalyze[0],
        analysisId: currentAnalysis?.id,
        analysisPrompt: userAnalysisPrompt,
        designType: currentAnalysis?.design_type || 'web',
        isComparative,
        aiProvider,
        // RAG completely disabled
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
      
      console.log('=== Analysis Completed Successfully (RAG DISABLED) ===');
    } else {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response from analysis service');
    }
  }, [currentAnalysis, setAnnotations]);

  return {
    executeAnalysis,
    ragContext: null, // Always null
    isBuilding: false // Always false
  };
};
