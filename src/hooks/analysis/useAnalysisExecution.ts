
import { useCallback } from 'react';
import { toast } from 'sonner';
import { AnalysisWithFiles, updateAnalysisStatus, updateAnalysisContext } from '@/services/analysisDataService';
import { getAnnotationsForAnalysis } from '@/services/annotationsService';
import { supabase } from '@/integrations/supabase/client';
import { Annotation } from '@/types/analysis';

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
  
  const executeAnalysis = useCallback(async (
    imagesToAnalyze: string[],
    intelligentPrompt: string,
    isComparative: boolean
  ) => {
    console.log('=== Enhanced AI Analysis Started ===');
    console.log('Analysis configuration:', { 
      imageCount: imagesToAnalyze.length,
      analysisId: currentAnalysis?.id,
      isComparative,
      promptLength: intelligentPrompt.length,
    });
    
    // Update analysis status to indicate it's being processed
    if (currentAnalysis) {
      await updateAnalysisStatus(currentAnalysis.id, 'analyzing');
      
      // Update analysis context with enhanced info
      await updateAnalysisContext(currentAnalysis.id, {
        analysis_prompt: intelligentPrompt,
        ai_model_used: 'gpt-4.1-2025-04-14'
      });
    }

    console.log('Calling enhanced analyze-design edge function...');
    
    // Call the AI analysis edge function with intelligent prompting
    const { data, error } = await supabase.functions.invoke('analyze-design', {
      body: {
        imageUrls: imagesToAnalyze,
        imageUrl: imagesToAnalyze[0], // Backward compatibility
        analysisId: currentAnalysis?.id,
        analysisPrompt: intelligentPrompt,
        designType: currentAnalysis?.design_type || 'web',
        isComparative
      }
    });

    if (error) {
      console.error('=== Edge Function Error ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      throw new Error(error.message || 'Enhanced AI analysis failed');
    }

    console.log('=== Edge Function Response ===');
    console.log('Response data:', data);

    if (data?.success && data?.annotations) {
      console.log('Enhanced analysis successful, loading fresh annotations...');
      
      // Load the fresh annotations from the database
      const freshAnnotations = await getAnnotationsForAnalysis(currentAnalysis!.id);
      console.log('Fresh annotations loaded:', freshAnnotations.length);
      
      setAnnotations(freshAnnotations);
      
      const imageText = imagesToAnalyze.length > 1 ? `${imagesToAnalyze.length} images` : 'image';
      const analysisType = isComparative ? 'Enhanced comparative analysis' : 'Enhanced analysis';
      
      toast.success(`${analysisType} complete! Found ${data.totalAnnotations || freshAnnotations.length} comprehensive insights across ${imageText}.`, {
        duration: 4000,
      });
      
      console.log('=== Enhanced Analysis Completed Successfully ===');
    } else {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response from enhanced AI analysis');
    }
  }, [currentAnalysis, setAnnotations]);

  return {
    executeAnalysis,
  };
};
