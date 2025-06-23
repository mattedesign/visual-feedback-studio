
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
  const buildIntelligentPrompt = useCallback((
    customPrompt?: string, 
    imageAnnotations?: Array<{imageUrl: string; annotations: Array<{x: number; y: number; comment: string; id: string}>}>
  ) => {
    // Start with base analysis request
    let intelligentPrompt = '';
    
    // HIERARCHY LEVEL 1: Main comment as primary directive
    if (customPrompt && customPrompt.trim()) {
      intelligentPrompt += `PRIMARY ANALYSIS REQUEST:\n${customPrompt.trim()}\n\n`;
    }
    
    // HIERARCHY LEVEL 2: User annotations as supporting evidence
    if (imageAnnotations && imageAnnotations.length > 0) {
      const hasUserAnnotations = imageAnnotations.some(ia => ia.annotations.length > 0);
      
      if (hasUserAnnotations) {
        intelligentPrompt += `USER-HIGHLIGHTED AREAS FOR FOCUSED ANALYSIS:\n`;
        intelligentPrompt += `The user has specifically highlighted the following areas that need attention:\n\n`;
        
        imageAnnotations.forEach((imageAnnotation, imageIndex) => {
          if (imageAnnotation.annotations.length > 0) {
            intelligentPrompt += `Image ${imageIndex + 1} - Specific Areas of Interest:\n`;
            imageAnnotation.annotations.forEach((annotation, index) => {
              intelligentPrompt += `${index + 1}. Position (${annotation.x.toFixed(1)}%, ${annotation.y.toFixed(1)}%): ${annotation.comment}\n`;
            });
            intelligentPrompt += '\n';
          }
        });
        
        intelligentPrompt += `ANALYSIS INSTRUCTION: Use these highlighted areas as focal points for your analysis. `;
        intelligentPrompt += `Provide detailed feedback on these specific concerns while also performing comprehensive analysis of the entire design.\n\n`;
      }
    }
    
    // HIERARCHY LEVEL 3: Comprehensive baseline analysis instruction
    if (!customPrompt || customPrompt.trim().length < 20) {
      intelligentPrompt += `COMPREHENSIVE ANALYSIS REQUIRED:\n`;
      intelligentPrompt += `Since limited specific guidance was provided, perform a thorough analysis covering:\n`;
      intelligentPrompt += `• User Experience (UX) - navigation, usability, user flow optimization\n`;
      intelligentPrompt += `• Visual Design - typography, color usage, visual hierarchy, brand consistency\n`;
      intelligentPrompt += `• Accessibility - color contrast, readability, inclusive design principles\n`;
      intelligentPrompt += `• Conversion Optimization - CTAs, forms, trust signals, friction points\n`;
      intelligentPrompt += `• Business Impact - professional appearance, credibility, competitive positioning\n\n`;
    }
    
    // Add contextual instructions based on analysis type
    if (imageUrls && imageUrls.length > 1) {
      intelligentPrompt += `MULTI-IMAGE COMPARATIVE ANALYSIS:\n`;
      intelligentPrompt += `This is a comparative analysis of ${imageUrls.length} design images. `;
      intelligentPrompt += `Analyze each image individually and then provide comparative insights:\n`;
      intelligentPrompt += `• Identify patterns and inconsistencies across designs\n`;
      intelligentPrompt += `• Determine which design approaches are most effective\n`;
      intelligentPrompt += `• Provide recommendations for improving consistency\n`;
      intelligentPrompt += `• Consider user journey implications across different designs\n`;
      intelligentPrompt += `• Use the imageIndex field (0-based) to specify which image each annotation applies to\n\n`;
    }
    
    // Add quality and completeness requirements
    intelligentPrompt += `ANALYSIS QUALITY REQUIREMENTS:\n`;
    intelligentPrompt += `• Provide specific, actionable feedback with clear reasoning\n`;
    intelligentPrompt += `• Balance critical issues with enhancement opportunities\n`;
    intelligentPrompt += `• Include both quick wins and strategic improvements\n`;
    intelligentPrompt += `• Ensure each annotation provides clear value and implementation guidance\n`;
    intelligentPrompt += `• Focus on user experience impact and business value\n\n`;
    
    return intelligentPrompt;
  }, [imageUrls]);

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
      console.log('=== Enhanced AI Analysis Started ===');
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
      
      // Build intelligent prompt using hierarchy system
      const intelligentPrompt = buildIntelligentPrompt(customPrompt, imageAnnotations);
      
      console.log('Intelligent prompt created:', {
        promptLength: intelligentPrompt.length,
        hasMainComment: !!(customPrompt && customPrompt.trim()),
        hasUserAnnotations: !!(imageAnnotations && imageAnnotations.some(ia => ia.annotations.length > 0)),
        isComparativeAnalysis: isComparative || isMultiImage,
        followsHierarchy: true
      });
      
      // Update analysis context with enhanced info
      await updateAnalysisContext(currentAnalysis.id, {
        analysis_prompt: intelligentPrompt,
        ai_model_used: 'gpt-4.1-2025-04-14'
      });

      console.log('Calling enhanced analyze-design edge function...');
      
      // Call the AI analysis edge function with intelligent prompting
      const { data, error } = await supabase.functions.invoke('analyze-design', {
        body: {
          imageUrls: imagesToAnalyze,
          imageUrl: imagesToAnalyze[0], // Backward compatibility
          analysisId: currentAnalysis.id,
          analysisPrompt: intelligentPrompt,
          designType: currentAnalysis.design_type || 'web',
          isComparative: isComparative || isMultiImage
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
        const freshAnnotations = await getAnnotationsForAnalysis(currentAnalysis.id);
        console.log('Fresh annotations loaded:', freshAnnotations.length);
        
        setAnnotations(freshAnnotations);
        
        const imageText = imagesToAnalyze.length > 1 ? `${imagesToAnalyze.length} images` : 'image';
        const analysisType = isComparative || isMultiImage ? 'Enhanced comparative analysis' : 'Enhanced analysis';
        
        toast.success(`${analysisType} complete! Found ${data.totalAnnotations || freshAnnotations.length} comprehensive insights across ${imageText}.`, {
          duration: 4000,
        });
        
        console.log('=== Enhanced Analysis Completed Successfully ===');
      } else {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response from enhanced AI analysis');
      }
      
    } catch (error) {
      console.error('=== Enhanced Analysis Error ===');
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
  }, [imageUrl, imageUrls, currentAnalysis, setIsAnalyzing, setAnnotations, isComparative, buildIntelligentPrompt]);

  return {
    handleAnalyze,
  };
};
