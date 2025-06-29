
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Annotation } from '@/types/analysis';
import { toast } from 'sonner';
import { analysisService } from '@/services/analysisService';
import { enhancedRagService, EnhancedContext } from '@/services/analysis/enhancedRagService';

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
  useEnhancedRag?: boolean;
}

interface AnalyzeImagesResult {
  annotations: Annotation[];
  analysis: any;
  ragContext?: any;
  enhancedContext?: EnhancedContext;
  success: boolean;
}

export const useAIAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasResearchContext, setHasResearchContext] = useState(true);
  const [researchSourcesCount, setResearchSourcesCount] = useState(5);
  
  // Enhanced RAG state
  const [isBuilding, setIsBuilding] = useState(false);
  const [enhancedContext, setEnhancedContext] = useState<EnhancedContext | null>(null);
  const [buildingStage, setBuildingStage] = useState<string>('');

  const analyzeImages = async (params: AnalyzeImagesParams): Promise<AnalyzeImagesResult> => {
    console.log('🚀 Starting AI Analysis with params:', params);
    
    setIsAnalyzing(true);
    setError(null);
    setEnhancedContext(null);

    try {
      // Create analysis record first
      console.log('📝 Creating analysis record...');
      const analysisId = await analysisService.createAnalysis();
      
      if (!analysisId) {
        throw new Error('Failed to create analysis record');
      }

      console.log('✅ Analysis record created:', analysisId);

      let finalPrompt = params.analysisPrompt;
      let enhancedCtx: EnhancedContext | null = null;

      // Enhanced RAG Processing (if enabled - default to true)
      if (params.useEnhancedRag !== false) {
        console.log('🚀 Starting Enhanced RAG Analysis...');
        setIsBuilding(true);
        
        try {
          setBuildingStage('Analyzing images with Google Vision...');
          toast.info('Building enhanced context with AI vision...', { duration: 2000 });
          
          // Run enhanced RAG analysis
          enhancedCtx = await enhancedRagService.enhanceAnalysis(
            params.imageUrls,
            params.analysisPrompt,
            {
              maxKnowledgeEntries: 12,
              minConfidenceThreshold: 0.65,
              includeIndustrySpecific: true,
              focusAreas: params.deviceType ? [params.deviceType] : []
            }
          );
          
          setBuildingStage('Enhanced context built successfully');
          setEnhancedContext(enhancedCtx);
          finalPrompt = enhancedCtx.enhancedPrompt;
          
          console.log('✅ Enhanced RAG completed:', {
            visionElementsDetected: enhancedCtx.visionAnalysis.uiElements.length,
            knowledgeSourcesUsed: enhancedCtx.knowledgeSourcesUsed,
            overallConfidence: enhancedCtx.confidenceScore,
            processingTime: enhancedCtx.processingTime
          });
          
          toast.success(`Enhanced context built! Vision analyzed ${enhancedCtx.visionAnalysis.uiElements.length} UI elements and retrieved ${enhancedCtx.knowledgeSourcesUsed} knowledge sources.`, {
            duration: 4000
          });
          
        } catch (enhancedError) {
          console.error('⚠️ Enhanced RAG failed, falling back to standard analysis:', enhancedError);
          toast.warning('Enhanced analysis failed, continuing with standard analysis...', { duration: 3000 });
        } finally {
          setIsBuilding(false);
          setBuildingStage('');
        }
      }

      // Build enhanced prompt with user annotations
      if (params.userAnnotations.length > 0) {
        const annotationContext = params.userAnnotations
          .map(ann => `User highlighted area at (${ann.x}%, ${ann.y}%): "${ann.comment}"`)
          .join('; ');
        finalPrompt += `\n\nUser has highlighted these specific areas: ${annotationContext}`;
      }
      
      finalPrompt += `\n\nPlease analyze this ${params.deviceType || 'desktop'} design and provide actionable insights.`;

      console.log('📝 Final enhanced prompt prepared:', {
        originalLength: params.analysisPrompt.length,
        finalLength: finalPrompt.length,
        hasEnhancedContext: !!enhancedCtx
      });

      // Call the analyze-design edge function with enhanced context
      const { data, error: analysisError } = await supabase.functions.invoke('analyze-design', {
        body: {
          imageUrls: params.imageUrls,
          imageUrl: params.imageUrls[0], // Include both for compatibility
          analysisId: analysisId,
          analysisPrompt: finalPrompt,
          isComparative: params.imageUrls.length > 1,
          ragEnabled: true,
          enhancedContext: enhancedCtx ? {
            visionAnalysis: enhancedCtx.visionAnalysis,
            knowledgeSourcesUsed: enhancedCtx.knowledgeSourcesUsed,
            confidenceScore: enhancedCtx.confidenceScore,
            citations: enhancedCtx.citations
          } : undefined
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
        knowledgeSourcesUsed: data.knowledgeSourcesUsed || 0,
        hasEnhancedContext: !!enhancedCtx
      });

      // 🔍 DEBUG: Log the raw annotations we received
      console.log('🔍 Raw annotations received from edge function:', data.annotations);
      if (data.annotations && data.annotations.length > 0) {
        console.log('🔍 First annotation details:', {
          fullAnnotation: data.annotations[0],
          feedback: data.annotations[0].feedback,
          description: data.annotations[0].description,
          content: data.annotations[0].content,
          title: data.annotations[0].title,
          allKeys: Object.keys(data.annotations[0])
        });
      }

      // Update research context state
      const totalSources = (data.knowledgeSourcesUsed || 0) + (enhancedCtx?.knowledgeSourcesUsed || 0);
      setHasResearchContext(data.ragEnhanced || !!enhancedCtx);
      setResearchSourcesCount(totalSources);

      // Transform the response to match expected format
      const result: AnalyzeImagesResult = {
        annotations: data.annotations || [],
        analysis: data.analysis || null,
        ragContext: data.ragContext,
        enhancedContext: enhancedCtx,
        success: data.success || true
      };

      if (enhancedCtx) {
        toast.success(`Enhanced analysis complete! Used ${totalSources} research sources with ${Math.round(enhancedCtx.confidenceScore * 100)}% confidence.`, {
          duration: 6000
        });
      } else if (data.ragEnhanced) {
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
        enhancedContext: null,
        success: false
      };
    } finally {
      setIsAnalyzing(false);
      setIsBuilding(false);
      setBuildingStage('');
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
      deviceType: 'desktop',
      useEnhancedRag: true
    });

    return result;
  };

  return {
    analyzeImages,
    handleAnalyze,
    isAnalyzing,
    isBuilding, // New: indicates when building enhanced context
    buildingStage, // New: current stage of enhanced context building
    enhancedContext, // New: the enhanced context result
    error,
    hasResearchContext,
    researchSourcesCount
  };
};
