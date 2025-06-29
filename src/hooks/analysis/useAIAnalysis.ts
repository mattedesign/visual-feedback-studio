
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

  // 🔧 NORMALIZE ANNOTATION DATA - Fixed to use correct API response structure
  const normalizeAnnotation = (annotation: any, index: number): Annotation => {
    console.log(`🔧 NORMALIZING ANNOTATION ${index + 1}:`, {
      rawAnnotation: annotation,
      availableProperties: Object.keys(annotation || {}),
      feedbackValue: annotation?.feedback,
      titleValue: annotation?.title,
      descriptionValue: annotation?.description,
      categoryValue: annotation?.category,
      severityValue: annotation?.severity
    });

    // Extract feedback text from the correct API response structure
    // Based on edge function logs, the API returns feedback, title, and description
    const feedbackText = 
      annotation?.feedback ||     // Primary feedback from API
      annotation?.description ||  // Secondary detailed feedback
      annotation?.title ||        // Fallback to title
      annotation?.content || 
      annotation?.text || 
      annotation?.message ||
      `Analysis insight ${index + 1}`;

    const normalizedAnnotation: Annotation = {
      id: annotation?.id || `annotation-${index + 1}-${Date.now()}`,
      x: typeof annotation?.x === 'number' ? annotation.x : 50,
      y: typeof annotation?.y === 'number' ? annotation.y : 50,
      category: annotation?.category || 'ux',
      severity: annotation?.severity || 'suggested',
      feedback: feedbackText,
      implementationEffort: annotation?.implementationEffort || annotation?.effort || 'medium',
      businessImpact: annotation?.businessImpact || annotation?.impact || 'medium',
      imageIndex: typeof annotation?.imageIndex === 'number' ? annotation.imageIndex : 0,
      // Enhanced business impact fields
      enhancedBusinessImpact: annotation?.enhancedBusinessImpact,
      researchCitations: annotation?.researchCitations,
      competitiveBenchmarks: annotation?.competitiveBenchmarks,
      priorityScore: annotation?.priorityScore,
      quickWinPotential: annotation?.quickWinPotential
    };

    console.log(`✅ NORMALIZED ANNOTATION ${index + 1}:`, {
      id: normalizedAnnotation.id,
      feedback: normalizedAnnotation.feedback,
      feedbackSource: annotation?.feedback ? 'feedback' : annotation?.description ? 'description' : annotation?.title ? 'title' : 'fallback',
      category: normalizedAnnotation.category,
      severity: normalizedAnnotation.severity,
      feedbackLength: normalizedAnnotation.feedback.length,
      originalAnnotationStructure: {
        hasFeedback: !!annotation?.feedback,
        hasDescription: !!annotation?.description,
        hasTitle: !!annotation?.title
      }
    });

    return normalizedAnnotation;
  };

  const analyzeImages = useCallback(async (params: AnalyzeImagesParams): Promise<AnalysisResult> => {
    console.log('🚀 ANALYSIS START:', {
      imageCount: params.imageUrls.length,
      userAnnotationsCount: params.userAnnotations.length,
      enhancedRagDisabled: true
    });

    setIsAnalyzing(true);
    setIsBuilding(true);
    setBuildingStage('Preparing analysis...');

    try {
      const analysisParams = {
        imageUrls: params.imageUrls,
        userAnnotations: params.userAnnotations,
        analysisPrompt: params.analysisPrompt,
        deviceType: params.deviceType,
        useEnhancedRag: false, // Always disabled
        analysisId: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      console.log('📝 Analysis parameters:', {
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

      console.log('📊 RAW ANALYSIS DATA:', {
        dataKeys: Object.keys(data),
        annotationsCount: data.annotations?.length || 0,
        annotationsPreview: data.annotations?.slice(0, 2),
        hasAnalysis: !!data.analysis,
        fullData: data
      });

      // 🔍 LOG RAW API RESPONSE STRUCTURE FOR DEBUGGING
      if (data.annotations && data.annotations.length > 0) {
        console.log('🔍 RAW API ANNOTATION STRUCTURE:', {
          firstAnnotation: data.annotations[0],
          annotationKeys: Object.keys(data.annotations[0] || {}),
          annotationValues: {
            feedback: data.annotations[0]?.feedback,
            title: data.annotations[0]?.title,
            description: data.annotations[0]?.description,
            category: data.annotations[0]?.category,
            severity: data.annotations[0]?.severity
          }
        });
      }

      setBuildingStage('Processing results...');

      // 🔧 NORMALIZE ALL ANNOTATIONS with corrected property mapping
      const rawAnnotations = data.annotations || [];
      const normalizedAnnotations = rawAnnotations.map((annotation: any, index: number) => 
        normalizeAnnotation(annotation, index)
      );

      console.log('✅ ANNOTATION NORMALIZATION COMPLETE:', {
        originalCount: rawAnnotations.length,
        normalizedCount: normalizedAnnotations.length,
        sampleNormalizedAnnotation: normalizedAnnotations[0],
        allFeedbackLengths: normalizedAnnotations.map((a: Annotation, i: number) => ({
          index: i + 1,
          feedbackLength: a.feedback.length,
          hasValidFeedback: a.feedback && a.feedback !== 'Analysis insight' && !a.feedback.startsWith('Analysis insight'),
          feedbackPreview: a.feedback.substring(0, 100) + '...'
        }))
      });

      return {
        success: true,
        annotations: normalizedAnnotations,
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
    buildingStage,
    hasResearchContext: false,
    researchSourcesCount: 0
  };
};
