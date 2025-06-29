
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Annotation } from '@/types/analysis';
import { toast } from 'sonner';

interface AnalyzeImagesParams {
  imageUrls: string[];
  userAnnotations: any[];
  analysisPrompt: string;
  deviceType: string;
  useEnhancedRag: boolean;
}

interface AnalysisResult {
  success: boolean;
  annotations: Annotation[];
  analysis: any;
  error?: string;
}

export const useAIAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildingStage, setBuildingStage] = useState<string>('');

  const analyzeImages = useCallback(async (params: AnalyzeImagesParams): Promise<AnalysisResult> => {
    console.log('🚀 ANALYSIS START:', {
      imageCount: params.imageUrls.length,
      userAnnotationsCount: params.userAnnotations.length,
      enhancedRagDisabled: true // Always disabled now
    });

    setIsAnalyzing(true);
    setIsBuilding(true);
    setBuildingStage('Preparing analysis...');

    try {
      // 🔥 DISABLE ENHANCED RAG - Always set to false
      const analysisParams = {
        imageUrls: params.imageUrls,
        userAnnotations: params.userAnnotations,
        analysisPrompt: params.analysisPrompt,
        deviceType: params.deviceType,
        useEnhancedRag: false, // ✅ DISABLED
        analysisId: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      console.log('📝 Analysis parameters (Enhanced RAG disabled):', {
        ...analysisParams,
        imageUrls: analysisParams.imageUrls.map(url => url.substring(0, 50) + '...'),
        enhancedRagStatus: 'DISABLED'
      });

      setBuildingStage('Analyzing images...');

      const { data, error } = await supabase.functions.invoke('analyze-design', {
        body: analysisParams,
      });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw new Error(`Analysis failed: ${error.message}`);
      }

      if (!data) {
        console.error('❌ No data returned from analysis');
        throw new Error('No analysis data returned');
      }

      console.log('✅ Analysis completed successfully:', {
        annotationsCount: data.annotations?.length || 0,
        hasAnalysis: !!data.analysis,
        enhancedRagUsed: false
      });

      setBuildingStage('Processing results...');

      return {
        success: true,
        annotations: data.annotations || [],
        analysis: data.analysis || null
      };

    } catch (error) {
      console.error('❌ Analysis failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast.error(`Analysis failed: ${errorMessage}`);
      
      return {
        success: false,
        annotations: [],
        analysis: null,
        error: errorMessage
      };
    } finally {
      setIsAnalyzing(false);
      setIsBuilding(false);
      setBuildingStage('');
    }
  }, []);

  return {
    analyzeImages,
    isAnalyzing,
    isBuilding,
    buildingStage
  };
};
