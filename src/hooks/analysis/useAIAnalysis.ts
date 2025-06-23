
import { useCallback } from 'react';
import { toast } from 'sonner';
import { AnalysisWithFiles, updateAnalysisStatus, updateAnalysisContext } from '@/services/analysisDataService';
import { getAnnotationsForAnalysis } from '@/services/annotationsService';
import { supabase } from '@/integrations/supabase/client';
import { Annotation } from '@/types/analysis';

interface UseAIAnalysisProps {
  imageUrl?: string | null;
  imageUrls?: string[];
  currentAnalysis: AnalysisWithFiles | null;
  setIsAnalyzing: (analyzing: boolean) => void;
  setAnnotations: (annotations: Annotation[]) => void;
  isComparative?: boolean;
}

export const useAIAnalysis = ({
  imageUrl,
  imageUrls,
  currentAnalysis,
  setIsAnalyzing,
  setAnnotations,
  isComparative = false,
}: UseAIAnalysisProps) => {
  const handleAnalyze = useCallback(async (customPrompt?: string) => {
    // Determine which images to analyze
    const imagesToAnalyze = imageUrls && imageUrls.length > 0 ? imageUrls : (imageUrl ? [imageUrl] : []);
    
    if (imagesToAnalyze.length === 0 || !currentAnalysis) {
      toast.error('No design or analysis selected');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('Starting AI analysis for:', { 
        imageCount: imagesToAnalyze.length,
        analysisId: currentAnalysis.id,
        isComparative 
      });
      
      // Update analysis status to indicate it's being processed
      await updateAnalysisStatus(currentAnalysis.id, 'analyzing');
      
      // Update analysis context with basic info
      await updateAnalysisContext(currentAnalysis.id, {
        analysis_prompt: customPrompt || 'AI-powered design analysis focusing on UX, accessibility, and conversion optimization',
        ai_model_used: 'gpt-4o'
      });

      // Call the AI analysis edge function with multiple images
      const { data, error } = await supabase.functions.invoke('analyze-design', {
        body: {
          imageUrls: imagesToAnalyze,
          imageUrl: imagesToAnalyze[0], // Backward compatibility
          analysisId: currentAnalysis.id,
          analysisPrompt: customPrompt || 'Analyze this design for UX, accessibility, and conversion optimization opportunities. Focus on critical issues that impact user experience and business goals.',
          designType: currentAnalysis.design_type || 'web',
          isComparative: isComparative || imagesToAnalyze.length > 1
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
        
        const imageText = imagesToAnalyze.length > 1 ? `${imagesToAnalyze.length} images` : 'image';
        const analysisType = isComparative || imagesToAnalyze.length > 1 ? 'Comparative analysis' : 'Analysis';
        
        toast.success(`${analysisType} complete! Found ${data.totalAnnotations} insights across ${imageText}.`, {
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
  }, [imageUrl, imageUrls, currentAnalysis, setIsAnalyzing, setAnnotations, isComparative]);

  return {
    handleAnalyze,
  };
};
