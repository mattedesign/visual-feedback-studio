
import { useCallback } from 'react';
import { toast } from 'sonner';
import { AnalysisWithFiles, updateAnalysisStatus, updateAnalysisContext } from '@/services/analysisDataService';
import { getAnnotationsForAnalysis } from '@/services/annotationsService';
import { supabase } from '@/integrations/supabase/client';
import { Annotation } from '@/types/analysis';

interface UseAIAnalysisProps {
  imageUrl: string | null;
  currentAnalysis: AnalysisWithFiles | null;
  setIsAnalyzing: (analyzing: boolean) => void;
  setAnnotations: (annotations: Annotation[]) => void;
}

export const useAIAnalysis = ({
  imageUrl,
  currentAnalysis,
  setIsAnalyzing,
  setAnnotations,
}: UseAIAnalysisProps) => {
  const handleAnalyze = useCallback(async () => {
    if (!imageUrl || !currentAnalysis) {
      toast.error('No design or analysis selected');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('Starting AI analysis for:', { imageUrl, analysisId: currentAnalysis.id });
      
      // Update analysis status to indicate it's being processed
      await updateAnalysisStatus(currentAnalysis.id, 'analyzing');
      
      // Update analysis context with basic info
      await updateAnalysisContext(currentAnalysis.id, {
        analysis_prompt: 'AI-powered design analysis focusing on UX, accessibility, and conversion optimization',
        ai_model_used: 'claude-3-5-sonnet-20241022'
      });

      // Call the AI analysis edge function
      const { data, error } = await supabase.functions.invoke('analyze-design', {
        body: {
          imageUrl,
          analysisId: currentAnalysis.id,
          analysisPrompt: 'Analyze this design for UX, accessibility, and conversion optimization opportunities. Focus on critical issues that impact user experience and business goals.',
          designType: currentAnalysis.design_type || 'web'
        }
      });

      if (error) {
        console.error('AI analysis error:', error);
        throw new Error(error.message || 'AI analysis failed');
      }

      console.log('AI analysis completed:', data);

      if (data.success && data.annotations) {
        // Load the fresh annotations from the database
        const freshAnnotations = await getAnnotationsForAnalysis(currentAnalysis.id);
        setAnnotations(freshAnnotations);
        
        toast.success(`AI analysis complete! Found ${data.totalAnnotations} insights.`, {
          duration: 4000,
        });
      } else {
        throw new Error('Invalid response from AI analysis');
      }
      
    } catch (error) {
      console.error('Error during analysis:', error);
      
      // Update analysis status to failed
      await updateAnalysisStatus(currentAnalysis.id, 'failed');
      
      toast.error(`Analysis failed: ${error.message}`, {
        duration: 5000,
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [imageUrl, currentAnalysis, setIsAnalyzing, setAnnotations]);

  return {
    handleAnalyze,
  };
};
