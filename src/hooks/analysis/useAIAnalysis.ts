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
  ragContext?: any;
  researchEnhanced?: boolean;
  knowledgeSourcesUsed?: number;
}

export const useAIAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildingStage, setBuildingStage] = useState<string>('');
  const [hasResearchContext, setHasResearchContext] = useState(false);
  const [researchSourcesCount, setResearchSourcesCount] = useState(0);

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

  // 🔍 RAG CONTEXT BUILDER - Re-enabled
  const buildRAGContext = async (imageUrls: string[], userPrompt: string, analysisId: string) => {
    console.log('🔍 === RAG CONTEXT BUILDING START ===');
    setBuildingStage('Building research context...');
    
    try {
      const { data: ragData, error: ragError } = await supabase.functions.invoke('build-rag-context', {
        body: {
          imageUrls,
          userPrompt,
          imageAnnotations: [],
          analysisId
        }
      });

      if (ragError) {
        console.warn('⚠️ RAG context building failed:', ragError);
        return null;
      }

      if (ragData && ragData.retrievedKnowledge?.relevantPatterns?.length > 0) {
        const knowledgeCount = ragData.retrievedKnowledge.relevantPatterns.length;
        console.log('✅ RAG context built successfully:', {
          knowledgeEntries: knowledgeCount,
          citations: ragData.researchCitations?.length || 0,
          industryContext: ragData.industryContext
        });
        
        setHasResearchContext(true);
        setResearchSourcesCount(knowledgeCount);
        setBuildingStage(`Research context ready: ${knowledgeCount} insights found`);
        
        // Show success toast
        toast.success(`Research context ready: ${knowledgeCount} insights found`, { duration: 3000 });
        
        return ragData;
      } else {
        console.log('⚠️ No knowledge retrieved from RAG');
        setHasResearchContext(false);
        setResearchSourcesCount(0);
        return null;
      }
    } catch (error) {
      console.error('❌ RAG context building error:', error);
      setHasResearchContext(false);
      setResearchSourcesCount(0);
      return null;
    }
  };

  const analyzeImages = useCallback(async (params: AnalyzeImagesParams): Promise<AnalysisResult> => {
    console.log('🚀 ANALYSIS START:', {
      imageCount: params.imageUrls.length,
      userAnnotationsCount: params.userAnnotations.length,
      enhancedRagEnabled: params.useEnhancedRag !== false // ✅ RAG NOW ENABLED BY DEFAULT
    });

    setIsAnalyzing(true);
    setIsBuilding(true);
    setBuildingStage('Preparing analysis...');
    setHasResearchContext(false);
    setResearchSourcesCount(0);

    try {
      const analysisId = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      let ragContext = null;
      let enhancedPrompt = params.analysisPrompt;

      // ✅ RAG CONTEXT BUILDING - RE-ENABLED
      if (params.useEnhancedRag !== false) {
        console.log('🔍 Building RAG context for enhanced analysis...');
        ragContext = await buildRAGContext(params.imageUrls, params.analysisPrompt, analysisId);
        
        if (ragContext && ragContext.enhancedPrompt) {
          enhancedPrompt = ragContext.enhancedPrompt;
          console.log('✅ Using RAG-enhanced prompt:', {
            originalLength: params.analysisPrompt.length,
            enhancedLength: enhancedPrompt.length,
            researchSources: ragContext.retrievedKnowledge?.relevantPatterns?.length || 0
          });
        }
      }

      const analysisParams = {
        imageUrls: params.imageUrls,
        userAnnotations: params.userAnnotations,
        analysisPrompt: enhancedPrompt, // ✅ Use enhanced prompt with research context
        deviceType: params.deviceType,
        useEnhancedRag: params.useEnhancedRag !== false, // ✅ Pass RAG setting to backend
        analysisId,
        ragContext // ✅ Include RAG context in analysis
      };

      console.log('📝 Analysis parameters:', {
        ...analysisParams,
        imageUrls: analysisParams.imageUrls.map(url => url.substring(0, 50) + '...'),
        enhancedRagStatus: params.useEnhancedRag !== false ? 'ENABLED' : 'DISABLED',
        promptType: ragContext ? 'RAG_ENHANCED' : 'STANDARD',
        researchSourcesIncluded: ragContext?.retrievedKnowledge?.relevantPatterns?.length || 0
      });

      setBuildingStage('Analyzing images with research context...');
      
      // Show different toast based on RAG status
      if (ragContext) {
        toast.info(`Analyzing with ${researchSourcesCount} research sources...`, { duration: 2000 });
      } else {
        toast.info('Analyzing with standard AI...', { duration: 2000 });
      }

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
        researchEnhanced: !!ragContext,
        knowledgeSourcesUsed: ragContext?.retrievedKnowledge?.relevantPatterns?.length || 0
      });

      // 🔍 EXPANDED RAW API RESPONSE STRUCTURE LOGGING
      if (data.annotations && data.annotations.length > 0) {
        const firstAnnotation = data.annotations[0];
        console.log('🔍 RAW ANNOTATION PROPERTIES:', Object.keys(firstAnnotation));
        console.log('🔍 RAW ANNOTATION VALUES:', firstAnnotation);
        console.log('🔍 DETAILED ANNOTATION BREAKDOWN:', {
          annotationKeys: Object.keys(firstAnnotation),
          annotationKeysCount: Object.keys(firstAnnotation).length,
          propertyTypeMapping: Object.keys(firstAnnotation).reduce((acc, key) => {
            acc[key] = {
              type: typeof firstAnnotation[key],
              value: firstAnnotation[key],
              hasValue: !!firstAnnotation[key]
            };
            return acc;
          }, {} as Record<string, any>),
          possibleFeedbackSources: {
            feedback: firstAnnotation?.feedback,
            description: firstAnnotation?.description,
            title: firstAnnotation?.title,
            content: firstAnnotation?.content,
            text: firstAnnotation?.text,
            message: firstAnnotation?.message
          }
        });
        
        // Log all annotations for complete picture
        console.log('🔍 ALL RAW ANNOTATIONS SAMPLE:', data.annotations.slice(0, 3).map((ann, i) => ({
          index: i,
          keys: Object.keys(ann),
          feedbackProperty: ann?.feedback,
          descriptionProperty: ann?.description,
          titleProperty: ann?.title,
          fullAnnotation: ann
        })));
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
        researchEnhanced: !!ragContext,
        knowledgeSourcesUsed: ragContext?.retrievedKnowledge?.relevantPatterns?.length || 0,
        allFeedbackLengths: normalizedAnnotations.map((a: Annotation, i: number) => ({
          index: i + 1,
          feedbackLength: a.feedback.length,
          hasValidFeedback: a.feedback && a.feedback !== 'Analysis insight' && !a.feedback.startsWith('Analysis insight'),
          feedbackPreview: a.feedback.substring(0, 100) + '...'
        }))
      });

      // ✅ SUCCESS TOAST WITH RAG STATUS
      const successMessage = ragContext 
        ? `Analysis complete! Enhanced with ${ragContext.retrievedKnowledge?.relevantPatterns?.length || 0} research sources.`
        : 'Analysis complete!';
      
      toast.success(successMessage, { duration: 4000 });

      return {
        success: true,
        annotations: normalizedAnnotations,
        analysis: data.analysis || null,
        ragContext: ragContext,
        researchEnhanced: !!ragContext,
        knowledgeSourcesUsed: ragContext?.retrievedKnowledge?.relevantPatterns?.length || 0
      };

    } catch (error) {
      console.error('❌ Analysis failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast.error(`Analysis failed: ${errorMessage}`);
      
      return {
        success: false,
        annotations: [],
        analysis: null,
        error: errorMessage,
        researchEnhanced: false,
        knowledgeSourcesUsed: 0
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
    hasResearchContext, // ✅ Now properly tracks RAG status
    researchSourcesCount // ✅ Now properly tracks research sources count
  };
};