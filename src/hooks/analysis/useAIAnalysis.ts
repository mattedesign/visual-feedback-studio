
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
  const handleAnalyze = useCallback(async (customPrompt?: string, imageAnnotations?: Array<{imageUrl: string; annotations: Array<{x: number; y: number; comment: string; id: string}>}>) => {
    // Determine which images to analyze
    const imagesToAnalyze = imageUrls && imageUrls.length > 0 ? imageUrls : (imageUrl ? [imageUrl] : []);
    
    if (imagesToAnalyze.length === 0 || !currentAnalysis) {
      toast.error('No design or analysis selected');
      return;
    }

    const isMultiImage = imagesToAnalyze.length > 1;
    setIsAnalyzing(true);
    
    try {
      console.log('Starting AI analysis for:', { 
        imageCount: imagesToAnalyze.length,
        analysisId: currentAnalysis.id,
        isComparative: isComparative || isMultiImage,
        hasImageAnnotations: !!imageAnnotations
      });
      
      // Update analysis status to indicate it's being processed
      await updateAnalysisStatus(currentAnalysis.id, 'analyzing');
      
      // Build enhanced analysis prompt
      let enhancedPrompt = customPrompt || 'Analyze for UX, accessibility, and conversion optimization opportunities.';
      
      if (isMultiImage || isComparative) {
        enhancedPrompt = `Perform comparative analysis across ${imagesToAnalyze.length} design images. `;
        enhancedPrompt += 'Analyze each image individually and then provide comparative insights.\n\n';
      }
      
      // Add image-specific annotations if provided
      if (imageAnnotations && imageAnnotations.length > 0) {
        imageAnnotations.forEach((imageAnnotation, imageIndex) => {
          if (imageAnnotation.annotations.length > 0) {
            enhancedPrompt += `Image ${imageIndex + 1} - User highlighted areas:\n`;
            imageAnnotation.annotations.forEach((annotation, index) => {
              enhancedPrompt += `${index + 1}. At position ${annotation.x.toFixed(1)}%, ${annotation.y.toFixed(1)}%: ${annotation.comment}\n`;
            });
            enhancedPrompt += '\n';
          }
        });
      }
      
      if (customPrompt && customPrompt.trim()) {
        enhancedPrompt += `\nAdditional context: ${customPrompt}\n\n`;
      }
      
      if (isMultiImage || isComparative) {
        enhancedPrompt += 'Please provide specific feedback for each image and highlight key differences, similarities, and recommendations for comparative improvements.';
      } else {
        enhancedPrompt += 'Please provide specific feedback addressing these concerns and identify any additional UX, accessibility, or conversion optimization opportunities.';
      }
      
      // Update analysis context with enhanced info
      await updateAnalysisContext(currentAnalysis.id, {
        analysis_prompt: enhancedPrompt,
        ai_model_used: 'gpt-4o'
      });

      // Call the AI analysis edge function with multiple images
      const { data, error } = await supabase.functions.invoke('analyze-design', {
        body: {
          imageUrls: imagesToAnalyze,
          imageUrl: imagesToAnalyze[0], // Backward compatibility
          analysisId: currentAnalysis.id,
          analysisPrompt: enhancedPrompt,
          designType: currentAnalysis.design_type || 'web',
          isComparative: isComparative || isMultiImage
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
        const analysisType = isComparative || isMultiImage ? 'Comparative analysis' : 'Analysis';
        
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
