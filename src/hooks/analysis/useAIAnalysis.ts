
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Annotation } from '@/types/analysis';
import { toast } from 'sonner';
import { analysisService } from '@/services/analysisService';

interface AnalyzeImagesParams {
  imageUrls: string[];
  userAnnotations: Array<{
    imageUrl: string;
    x: number;
    y: number;
    comment: string;
    id: string;
  }>;
  analysisPrompt: string;
  deviceType?: 'desktop' | 'tablet' | 'mobile';
}

interface AnalyzeImagesResult {
  annotations: Annotation[];
  analysis: any;
  ragContext?: any;
  success: boolean;
}

export const useAIAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasResearchContext, setHasResearchContext] = useState(true);
  const [researchSourcesCount, setResearchSourcesCount] = useState(5);

  const analyzeImages = async (params: AnalyzeImagesParams): Promise<AnalyzeImagesResult> => {
    console.log('🚀 Starting AI Analysis with params:', params);
    
    setIsAnalyzing(true);
    setError(null);

    try {
      // Create analysis record first
      console.log('📝 Creating analysis record...');
      const analysisId = await analysisService.createAnalysis();
      
      if (!analysisId) {
        throw new Error('Failed to create analysis record');
      }

      console.log('✅ Analysis record created:', analysisId);

      // Build enhanced prompt with user annotations
      let enhancedPrompt = params.analysisPrompt;
      
      if (params.userAnnotations.length > 0) {
        const annotationContext = params.userAnnotations
          .map(ann => `User highlighted area at (${ann.x}%, ${ann.y}%): "${ann.comment}"`)
          .join('; ');
        enhancedPrompt += `\n\nUser has highlighted these specific areas: ${annotationContext}`;
      }
      
      enhancedPrompt += `\n\nPlease analyze this ${params.deviceType || 'desktop'} design and provide actionable insights.`;

      console.log('📝 Enhanced prompt:', enhancedPrompt);

      // Call the analyze-design edge function with the analysisId
      const { data, error: analysisError } = await supabase.functions.invoke('analyze-design', {
        body: {
          imageUrls: params.imageUrls,
          imageUrl: params.imageUrls[0], // Include both for compatibility
          analysisId: analysisId, // Now we have a valid analysisId
          analysisPrompt: enhancedPrompt,
          isComparative: params.imageUrls.length > 1,
          ragEnabled: true
        }
      });

      if (analysisError) {
        console.error('❌ Edge function error:', analysisError);
        throw new Error(analysisError.message || 'Analysis failed');
      }

      if (!data) {
        throw new Error('No data returned from analysis function');
      }

      console.log('✅ AI Analysis successful:', {
        annotationCount: data.annotations?.length || 0,
        ragEnhanced: data.ragEnhanced || false,
        knowledgeSourcesUsed: data.knowledgeSourcesUsed || 0
      });

      // Update research context state
      setHasResearchContext(data.ragEnhanced || false);
      setResearchSourcesCount(data.knowledgeSourcesUsed || 0);

      // Transform the response to match expected format
      const result: AnalyzeImagesResult = {
        annotations: data.annotations || [],
        analysis: data.analysis || null,
        ragContext: data.ragContext,
        success: data.success || true
      };

      if (data.ragEnhanced) {
        toast.success(`Analysis complete! Enhanced with ${data.knowledgeSourcesUsed || 0} research sources.`);
      } else {
        toast.success('Analysis complete!');
      }

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      console.error('❌ AI Analysis Error:', err);
      toast.error(`Analysis failed: ${errorMessage}`);
      
      return {
        annotations: [],
        analysis: null,
        ragContext: null,
        success: false
      };
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Legacy method for backward compatibility
  const handleAnalyze = async (analysisPrompt: string, imageAnnotations: any[]) => {
    // Convert legacy format to new format
    const userAnnotations = imageAnnotations.flatMap(imageAnnotation => 
      imageAnnotation.annotations.map((annotation: any) => ({
        imageUrl: imageAnnotation.imageUrl,
        x: annotation.x,
        y: annotation.y,
        comment: annotation.comment,
        id: annotation.id
      }))
    );

    const imageUrls = imageAnnotations.map(ia => ia.imageUrl);

    const result = await analyzeImages({
      imageUrls,
      userAnnotations,
      analysisPrompt,
      deviceType: 'desktop'
    });

    return result;
  };

  return {
    analyzeImages,
    handleAnalyze,
    isAnalyzing,
    isBuilding: isAnalyzing, // Alias for compatibility
    error,
    hasResearchContext,
    researchSourcesCount
  };
};
