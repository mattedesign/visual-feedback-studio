
import { useState, useCallback } from 'react';
import { analysisService } from '@/services/analysisService';
import { Annotation } from '@/types/analysis';
import { toast } from 'sonner';

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
  deviceType: 'desktop' | 'tablet' | 'mobile';
}

interface AnalyzeImagesResult {
  annotations?: Annotation[];
  analysis?: any;
  success: boolean;
}

export const useAIAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeImages = useCallback(async (params: AnalyzeImagesParams): Promise<AnalyzeImagesResult> => {
    console.log('🚀 Starting AI Analysis with params:', params);
    
    setIsAnalyzing(true);
    
    try {
      // Create analysis session if needed
      const analysisId = await analysisService.createAnalysis();
      if (!analysisId) {
        throw new Error('Failed to create analysis session');
      }

      // Build enhanced prompt with user annotations
      let enhancedPrompt = params.analysisPrompt;
      
      if (params.userAnnotations.length > 0) {
        const annotationContext = params.userAnnotations
          .map(ann => `User highlighted area at (${ann.x}%, ${ann.y}%): "${ann.comment}"`)
          .join('; ');
        enhancedPrompt += `\n\nUser has highlighted these specific areas: ${annotationContext}`;
      }
      
      enhancedPrompt += `\n\nPlease analyze this ${params.deviceType} design and provide actionable insights.`;

      console.log('📝 Enhanced prompt:', enhancedPrompt);

      // Call the analysis service
      const result = await analysisService.analyzeDesign({
        imageUrls: params.imageUrls,
        analysisId,
        analysisPrompt: enhancedPrompt,
        isComparative: params.imageUrls.length > 1,
        ragEnhanced: true
      });

      if (result.success) {
        console.log('✅ Analysis successful:', {
          annotationCount: result.annotations?.length || 0,
          researchEnhanced: result.researchEnhanced
        });
        
        return {
          annotations: result.annotations,
          analysis: { id: analysisId },
          success: true
        };
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
      
    } catch (error) {
      console.error('❌ AI Analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Analysis failed: ${errorMessage}`);
      
      return {
        success: false
      };
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    analyzeImages,
    isAnalyzing
  };
};
