
import { useCallback } from 'react';
import { CoordinateAccuratePrompting } from '../../utils/coordinateAccuratePrompting';

interface ImageAnnotation {
  imageUrl: string;
  annotations: Array<{
    x: number;
    y: number;
    comment: string;
    id: string;
  }>;
}

export const usePromptBuilder = () => {
  const buildIntelligentPrompt = useCallback((
    customPrompt?: string,
    imageAnnotations?: ImageAnnotation[],
    imageUrls?: string[]
  ) => {
    // Use the enhanced coordinate-accurate prompting system
    return CoordinateAccuratePrompting.buildEnhancedAnalysisPrompt(
      customPrompt,
      imageAnnotations,
      imageUrls
    );
  }, []);

  return {
    buildIntelligentPrompt,
  };
};
