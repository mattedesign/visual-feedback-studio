
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { enhancedRagService, EnhancedContext } from '@/services/analysis/enhancedRagService';
import { analysisService } from '@/services/analysisService';
import { multiStageAnalysisPipeline } from '@/services/analysis/multiStageAnalysisPipeline';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Annotation } from '@/types/analysis';

interface UseEnhancedAnalysisProps {
  currentAnalysis?: any;
}

interface AnalyzeImagesRequest {
  imageUrls: string[];
  userAnnotations: Array<{
    imageUrl: string;
    x: number;
    y: number;
    comment: string;
    id: string;
  }>;
  analysisPrompt: string;
  deviceType: string;
  useEnhancedRag?: boolean;
}

interface AnalyzeImagesResponse {
  success: boolean;
  annotations: Annotation[];
  analysis?: any;
  enhancedContext?: EnhancedContext;
  // ✅ NEW: Add Well Done data to response
  wellDone?: {
    insights: Array<{
      title: string;
      description: string;
      category: string;
    }>;
    overallStrengths: string[];
    categoryHighlights: Record<string, string>;
  };
}

export const useEnhancedAnalysis = ({ currentAnalysis }: UseEnhancedAnalysisProps = {}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildingStage, setBuildingStage] = useState<string>('');
  const [hasResearchContext, setHasResearchContext] = useState(false);
  const [researchSourcesCount, setResearchSourcesCount] = useState(0);
  const [enhancedContext, setEnhancedContext] = useState<EnhancedContext | null>(null);
  
  // Check if multi-stage pipeline is enabled
  const useMultiStagePipeline = useFeatureFlag('multi-stage-pipeline');

  const resetState = useCallback(() => {
    setIsAnalyzing(false);
    setIsBuilding(false);
    setBuildingStage('');
    setHasResearchContext(false);
    setResearchSourcesCount(0);
    setEnhancedContext(null);
  }, []);

  const analyzeImages = useCallback(async (request: AnalyzeImagesRequest): Promise<AnalyzeImagesResponse> => {
    console.log('🚀 Enhanced Analysis: Starting comprehensive analysis', {
      imageCount: request.imageUrls.length,
      userAnnotationsCount: request.userAnnotations.length,
      useEnhancedRag: request.useEnhancedRag
    });

    setIsAnalyzing(true);
    setIsBuilding(true);
    
    // Don't reset state here, let it accumulate
    setBuildingStage('');
    setHasResearchContext(false);
    setResearchSourcesCount(0);
    setEnhancedContext(null);

    try {
      // Decide between multi-stage pipeline and standard analysis
      if (useMultiStagePipeline) {
        console.log('🔄 Using Multi-Stage Analysis Pipeline');
        setBuildingStage('Running multi-stage analysis...');
        
        // Execute multi-stage analysis pipeline
        const pipelineResult = await multiStageAnalysisPipeline.executeAnalysis(
          request.imageUrls,
          request.analysisPrompt,
          currentAnalysis?.id || 'temp-analysis',
          currentAnalysis?.user_id || 'temp-user',
          {
            skipStages: [],
            forceStages: [],
            customWeights: {}
          }
        );

        if (!pipelineResult.success) {
          throw new Error(pipelineResult.error || 'Multi-stage analysis failed');
        }

        setHasResearchContext(true);
        setResearchSourcesCount(pipelineResult.finalResult.metadata?.googleVision ? 3 : 0);

        console.log('✅ Multi-Stage Analysis: Pipeline completed successfully', {
          annotationCount: pipelineResult.finalResult.annotations.length,
          stagesCompleted: pipelineResult.stages.filter(s => s.status === 'success').length,
          processingTime: pipelineResult.finalResult.processing_time_ms
        });

        const response: AnalyzeImagesResponse = {
          success: true,
          annotations: pipelineResult.finalResult.annotations,
          analysis: {
            success: true,
            annotations: pipelineResult.finalResult.annotations,
            researchEnhanced: true,
            knowledgeSourcesUsed: 3,
            multiStageData: pipelineResult.finalResult.metadata
          },
          enhancedContext: null
        };

        toast.success(
          `Multi-stage analysis complete! Found ${response.annotations.length} insights using advanced pipeline.`,
          { duration: 4000 }
        );

        return response;

      } else {
        // Standard enhanced analysis flow
        let enhancedPrompt = request.analysisPrompt;
        let contextData: EnhancedContext | null = null;

        if (request.useEnhancedRag) {
          setBuildingStage('Building enhanced context...');
          console.log('📚 Enhanced Analysis: Building RAG context');

          try {
            const workflowState = {
              selectedImages: request.imageUrls,
              aiAnnotations: [],
              currentStep: 'analyzing',
              imageAnnotations: request.userAnnotations.reduce((acc, ua) => {
                const existingImage = acc.find(img => img.imageUrl === ua.imageUrl);
                if (existingImage) {
                  existingImage.annotations.push({
                    id: ua.id,
                    x: ua.x,
                    y: ua.y,
                    comment: ua.comment
                  });
                } else {
                  acc.push({
                    imageUrl: ua.imageUrl,
                    annotations: [{
                      id: ua.id,
                      x: ua.x,
                      y: ua.y,
                      comment: ua.comment
                    }]
                  });
                }
                return acc;
              }, [] as Array<{
                imageUrl: string;
                annotations: Array<{
                  id: string;
                  x: number;
                  y: number;
                  comment: string;
                }>;
              }>)
            };

            contextData = await enhancedRagService.enhanceAnalysisWithWorkflow(
              workflowState,
              request.analysisPrompt,
              {
                maxKnowledgeEntries: 12,
                minConfidenceThreshold: 0.7,
                includeIndustrySpecific: true
              }
            );

            enhancedPrompt = contextData.enhancedPrompt;
            setEnhancedContext(contextData);
            setHasResearchContext(true);
            setResearchSourcesCount(contextData.knowledgeSourcesUsed);

          } catch (ragError) {
            console.warn('⚠️ Enhanced Analysis: RAG enhancement failed, falling back to standard analysis:', ragError);
          }
        }

        setBuildingStage('Running AI analysis...');
        setIsBuilding(false);

        const analysisResult = await analysisService.analyzeDesign({
          imageUrls: request.imageUrls,
          analysisId: currentAnalysis?.id || 'temp-analysis',
          analysisPrompt: enhancedPrompt,
          designType: 'web',
          isComparative: request.imageUrls.length > 1,
          ragEnhanced: !!contextData,
          researchSourceCount: contextData?.knowledgeSourcesUsed || 0
        });

        if (!analysisResult.success) {
          throw new Error(analysisResult.error || 'Analysis failed');
        }

        const response: AnalyzeImagesResponse = {
          success: true,
          annotations: analysisResult.annotations || [],
          analysis: analysisResult,
          enhancedContext: contextData,
          wellDone: analysisResult.wellDone
        };

        if (contextData) {
          toast.success(
            `Enhanced analysis complete! Found ${response.annotations.length} insights using ${contextData.knowledgeSourcesUsed} research sources.`,
            { duration: 4000 }
          );
        } else {
          toast.success(`Analysis complete! Found ${response.annotations.length} insights.`);
        }

        return response;
      }

    } catch (error) {
      console.error('❌ Enhanced Analysis: Analysis failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Enhanced analysis failed: ${errorMessage}`);
      
      return {
        success: false,
        annotations: [],
        analysis: null
      };
    } finally {
      setIsAnalyzing(false);
      setIsBuilding(false);
    }
  }, [currentAnalysis]);

  return {
    analyzeImages,
    isAnalyzing,
    isBuilding,
    buildingStage,
    hasResearchContext,
    researchSourcesCount,
    enhancedContext,
    resetState
  };
};
