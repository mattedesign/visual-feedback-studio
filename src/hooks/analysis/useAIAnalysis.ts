
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
      const errorMsg = !imagesToAnalyze.length ? 'No images selected' : 'No analysis session found';
      console.error('Analysis validation failed:', errorMsg);
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    const isMultiImage = imagesToAnalyze.length > 1;
    setIsAnalyzing(true);
    
    try {
      console.log('=== AI Analysis Hook Started ===');
      console.log('Analysis configuration:', { 
        imageCount: imagesToAnalyze.length,
        analysisId: currentAnalysis.id,
        isComparative: isComparative || isMultiImage,
        hasImageAnnotations: !!imageAnnotations,
        hasCustomPrompt: !!customPrompt?.trim(),
        userAnnotationsCount: imageAnnotations?.reduce((total, ia) => total + ia.annotations.length, 0) || 0
      });
      
      // Update analysis status to indicate it's being processed
      await updateAnalysisStatus(currentAnalysis.id, 'analyzing');
      
      // Build enhanced analysis prompt
      let enhancedPrompt = customPrompt || 'Analyze for UX, accessibility, and conversion optimization opportunities.';
      
      if (isMultiImage || isComparative) {
        enhancedPrompt = `COMPARATIVE ANALYSIS REQUEST: Perform comparative analysis across ${imagesToAnalyze.length} design images. `;
        enhancedPrompt += 'This is a multi-image comparative analysis - please analyze each image individually and then provide comparative insights identifying similarities, differences, and cross-design recommendations.\n\n';
      }
      
      // Add image-specific annotations if provided
      if (imageAnnotations && imageAnnotations.length > 0) {
        enhancedPrompt += 'USER-HIGHLIGHTED AREAS:\n';
        imageAnnotations.forEach((imageAnnotation, imageIndex) => {
          if (imageAnnotation.annotations.length > 0) {
            enhancedPrompt += `Image ${imageIndex + 1} - Specific concerns:\n`;
            imageAnnotation.annotations.forEach((annotation, index) => {
              enhancedPrompt += `${index + 1}. At position ${annotation.x.toFixed(1)}%, ${annotation.y.toFixed(1)}%: ${annotation.comment}\n`;
            });
            enhancedPrompt += '\n';
          }
        });
      }
      
      if (customPrompt && customPrompt.trim()) {
        enhancedPrompt += `\nADDITIONAL CONTEXT: ${customPrompt}\n\n`;
      }
      
      if (isMultiImage || isComparative) {
        enhancedPrompt += 'COMPARATIVE ANALYSIS REQUIREMENTS:\n';
        enhancedPrompt += '- Analyze each image individually first\n';
        enhancedPrompt += '- Identify patterns and inconsistencies across designs\n';
        enhancedPrompt += '- Provide specific recommendations for improving consistency\n';
        enhancedPrompt += '- Highlight which approaches work better and why\n';
        enhancedPrompt += '- Use imageIndex field (0-based) to specify which image each annotation applies to\n';
      } else {
        enhancedPrompt += 'Please provide specific feedback addressing these concerns and identify any additional UX, accessibility, or conversion optimization opportunities.';
      }
      
      console.log('Enhanced prompt created:', {
        promptLength: enhancedPrompt.length,
        includesComparativeInstructions: enhancedPrompt.includes('COMPARATIVE ANALYSIS'),
        includesUserAnnotations: enhancedPrompt.includes('USER-HIGHLIGHTED AREAS')
      });
      
      // Update analysis context with enhanced info
      await updateAnalysisContext(currentAnalysis.id, {
        analysis_prompt: enhancedPrompt,
        ai_model_used: 'gpt-4.1-2025-04-14'
      });

      console.log('Calling analyze-design edge function...');
      
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
        console.error('=== Edge Function Error ===');
        console.error('Error details:', error);
        console.error('Error message:', error.message);
        throw new Error(error.message || 'AI analysis failed');
      }

      console.log('=== Edge Function Response ===');
      console.log('Response data:', data);

      if (data?.success && data?.annotations) {
        console.log('Analysis successful, loading fresh annotations...');
        
        // Load the fresh annotations from the database
        const freshAnnotations = await getAnnotationsForAnalysis(currentAnalysis.id);
        console.log('Fresh annotations loaded:', freshAnnotations.length);
        
        setAnnotations(freshAnnotations);
        
        const imageText = imagesToAnalyze.length > 1 ? `${imagesToAnalyze.length} images` : 'image';
        const analysisType = isComparative || isMultiImage ? 'Comparative analysis' : 'Analysis';
        
        toast.success(`${analysisType} complete! Found ${data.totalAnnotations || freshAnnotations.length} insights across ${imageText}.`, {
          duration: 4000,
        });
        
        console.log('=== Analysis Hook Completed Successfully ===');
      } else {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response from AI analysis');
      }
      
    } catch (error) {
      console.error('=== Analysis Hook Error ===');
      console.error('Error name:', error?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      
      // Update analysis status to failed
      try {
        await updateAnalysisStatus(currentAnalysis.id, 'failed');
      } catch (statusError) {
        console.error('Failed to update analysis status:', statusError);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Final error message:', errorMessage);
      
      // Re-throw to allow retry logic in AnalyzingStep
      throw error;
    } finally {
      setIsAnalyzing(false);
    }
  }, [imageUrl, imageUrls, currentAnalysis, setIsAnalyzing, setAnnotations, isComparative]);

  return {
    handleAnalyze,
  };
};
