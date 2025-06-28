STEP 3: Update useAIAnalysis Hook - Ensure Proper Integration
File Location: src/hooks/analysis/useAIAnalysis.ts
Check if this file exists and has the right interface. If it doesn't exist or needs updates:
tsx// CREATE OR UPDATE: src/hooks/analysis/useAIAnalysis.ts

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Annotation } from '@/types/analysis';
import { AnalysisWithFiles } from '@/services/analysisDataService';

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
  analysis: AnalysisWithFiles;
  ragContext?: any;
}

export const useAIAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeImages = async (params: AnalyzeImagesParams): Promise<AnalyzeImagesResult> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      console.log('🔍 Starting AI Analysis with params:', params);

      // Call your existing analyze-design function
      const { data, error: analysisError } = await supabase.functions.invoke('analyze-design', {
        body: {
          imageUrls: params.imageUrls,
          userAnnotations: params.userAnnotations,
          analysisPrompt: params.analysisPrompt,
          deviceType: params.deviceType || 'desktop'
        }
      });

      if (analysisError) {
        throw new Error(analysisError.message || 'Analysis failed');
      }

      console.log('✅ AI Analysis Response:', data);

      // Transform the response to match expected format
      const result: AnalyzeImagesResult = {
        annotations: data.annotations || [],
        analysis: data.analysis || null,
        ragContext: data.ragContext
      };

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      console.error('❌ AI Analysis Error:', err);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeImages,
    isAnalyzing,
    error
  };
};