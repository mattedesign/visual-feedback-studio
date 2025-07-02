
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { enhancedRagService, EnhancedContext } from '@/services/analysis/enhancedRagService';
import { analysisService } from '@/services/analysisService';
import { multiStageAnalysisPipeline } from '@/services/analysis/multiStageAnalysisPipeline';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { visualGroundingService } from '@/services/analysis/visualGroundingService';
import { ragContentValidator } from '@/services/analysis/ragContentValidator';
import { analysisQualityController } from '@/services/analysis/analysisQualityController';
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
        
        // ✅ FIX: Enhanced UUID validation for analysis context
        const isValidUUID = (uuid: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
        
        let validAnalysisId = currentAnalysis?.id;
        let validUserId = currentAnalysis?.user_id;
        
        console.log('🔍 Multi-Stage Pipeline: Validating analysis context:', {
          hasCurrentAnalysis: !!currentAnalysis,
          currentAnalysisId: currentAnalysis?.id,
          currentUserId: currentAnalysis?.user_id,
          isValidAnalysisUUID: validAnalysisId ? isValidUUID(validAnalysisId) : false,
          isValidUserUUID: validUserId ? isValidUUID(validUserId) : false
        });
        
        // Get user ID from auth first (needed for analysis creation)
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user?.id) {
          throw new Error('User authentication required for multi-stage analysis');
        }
        
        validUserId = user.id;
        
        // ✅ FIX: Always create a new analysis for multi-stage pipeline if current one is invalid
        if (!validAnalysisId || !isValidUUID(validAnalysisId) || validAnalysisId === 'temp-analysis') {
          console.log('🔧 Creating new analysis for multi-stage pipeline...');
          try {
            const { analysisService } = await import('@/services/analysisService');
            validAnalysisId = await analysisService.createAnalysis();
            
            if (!validAnalysisId || !isValidUUID(validAnalysisId)) {
              throw new Error('Failed to create valid analysis record for pipeline');
            }
            
            console.log('✅ Created valid analysis ID for pipeline:', validAnalysisId);

            // ✅ FIX: Create the analysis_results record early to prevent 406 errors in stage logging
            try {
              console.log('🔧 Creating analysis_results record early to prevent 406 errors...');
              const { error: createError } = await supabase
                .from('analysis_results')
                .insert({
                  analysis_id: validAnalysisId,
                  user_id: validUserId,
                  images: request.imageUrls,
                  annotations: [],
                  pipeline_stage: 'initializing',
                  processing_stages: [],
                  stage_timing: {}
                });

              if (createError) {
                console.warn('⚠️ Failed to create early analysis_results record (non-critical):', createError.message);
              } else {
                console.log('✅ Early analysis_results record created successfully');
              }
            } catch (earlyCreateError) {
              console.warn('⚠️ Failed to create early analysis_results record (non-critical):', earlyCreateError);
            }

          } catch (error) {
            console.error('❌ Failed to create analysis ID:', error);
            throw new Error(`Could not initialize analysis for pipeline: ${error.message}`);
          }
        }
        
        console.log('🚀 Starting pipeline with valid IDs:', { 
          validAnalysisId, 
          validUserId,
          isValidUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(validAnalysisId)
        });

        // Execute multi-stage analysis pipeline with valid IDs
        const pipelineResult = await multiStageAnalysisPipeline.executeAnalysis(
          request.imageUrls,
          request.analysisPrompt,
          validAnalysisId,
          validUserId,
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
        // ✅ Enhanced standard analysis flow with quality control
        let enhancedPrompt = request.analysisPrompt;
        let contextData: EnhancedContext | null = null;
        let ragValidationResult = null;
        let ragImpactAnalysis = null;

        // 1. Enhanced visual grounding for prompt
        setBuildingStage('Enhancing visual grounding...');
        const visualGrounding = visualGroundingService.buildVisuallyGroundedPrompt(
          request.analysisPrompt,
          request.imageUrls,
          {
            requireVisualEvidence: true,
            minimumConfidenceThreshold: 0.8,
            enableCoordinateValidation: true,
            maxAnnotationsPerImage: 15
          }
        );
        enhancedPrompt = visualGrounding.enhancedPrompt;

        if (request.useEnhancedRag) {
          setBuildingStage('Building validated RAG context...');
          console.log('📚 Enhanced Analysis: Building validated RAG context');

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

            // Get raw RAG context first
            contextData = await enhancedRagService.enhanceAnalysisWithWorkflow(
              workflowState,
              request.analysisPrompt,
              {
                maxKnowledgeEntries: 15, // Get more initially for validation
                minConfidenceThreshold: 0.6, // Lower threshold for initial retrieval
                includeIndustrySpecific: true
              }
            );

            // Validate and filter RAG content
            if (contextData && contextData.retrievedKnowledge.length > 0) {
              setBuildingStage('Validating RAG content...');
              
              ragValidationResult = await ragContentValidator.validateRagContent(
                contextData.retrievedKnowledge,
                request.analysisPrompt,
                request.imageUrls,
                {
                  maxKnowledgeEntries: 8, // Reduced final count
                  minRelevanceScore: 0.75,
                  requireImageRelevance: true,
                  enableContentFiltering: true,
                  maxContentLength: 400
                }
              );

              ragImpactAnalysis = ragContentValidator.analyzeRagImpact(
                ragValidationResult.validatedEntries,
                request.analysisPrompt
              );

              // Build safe RAG prompt
              enhancedPrompt = ragContentValidator.buildSafeRagPrompt(
                visualGrounding.enhancedPrompt,
                ragValidationResult.validatedEntries,
                ragValidationResult
              );

              console.log('✅ RAG Validation Complete:', {
                originalEntries: contextData.retrievedKnowledge.length,
                validatedEntries: ragValidationResult.validatedEntries.length,
                filteredCount: ragValidationResult.filteredCount,
                hallucinationRisk: ragImpactAnalysis.hallucinationRisk
              });
            }

            setEnhancedContext(contextData);
            setHasResearchContext(true);
            setResearchSourcesCount(ragValidationResult?.validatedEntries.length || 0);

          } catch (ragError) {
            console.warn('⚠️ Enhanced Analysis: RAG enhancement failed, falling back to visual grounding only:', ragError);
          }
        }

        setBuildingStage('Running quality-controlled AI analysis...');
        setIsBuilding(false);

        const analysisResult = await analysisService.analyzeDesign({
          imageUrls: request.imageUrls,
          analysisId: currentAnalysis?.id || 'temp-analysis',
          analysisPrompt: enhancedPrompt,
          designType: 'web',
          isComparative: request.imageUrls.length > 1,
          ragEnhanced: !!contextData,
          researchSourceCount: ragValidationResult?.validatedEntries.length || 0
        });

        if (!analysisResult.success) {
          throw new Error(analysisResult.error || 'Analysis failed');
        }

        // ✅ Post-analysis quality control
        setBuildingStage('Performing quality control...');
        const qualityResult = await analysisQualityController.performQualityControl(
          analysisResult.annotations || [],
          request.imageUrls,
          ragValidationResult || undefined,
          ragImpactAnalysis || undefined,
          {
            enableVisualValidation: true,
            enableRagValidation: !!ragValidationResult,
            enableHallucinationDetection: true,
            minimumQualityThreshold: 0.7,
            maxRetryAttempts: 1
          }
        );

        console.log('🎯 Quality Control Results:', {
          overallQuality: qualityResult.overallQuality,
          visualGroundingScore: qualityResult.visualGroundingScore,
          ragQualityScore: qualityResult.ragQualityScore,
          hallucinationRisk: qualityResult.hallucinationRisk,
          issueCount: qualityResult.qualityIssues.length,
          validatedAnnotations: qualityResult.validatedAnnotations.length
        });

        const response: AnalyzeImagesResponse = {
          success: true,
          annotations: qualityResult.validatedAnnotations,
          analysis: {
            ...analysisResult,
            qualityMetrics: qualityResult,
            visualGrounding: visualGrounding,
            ragValidation: ragValidationResult
          },
          enhancedContext: contextData,
          wellDone: analysisResult.wellDone
        };

        // Enhanced success message with quality info
        if (contextData && ragValidationResult) {
          toast.success(
            `Enhanced analysis complete! Found ${response.annotations.length} quality-validated insights using ${ragValidationResult.validatedEntries.length} verified research sources. Quality score: ${Math.round(qualityResult.overallQuality * 100)}%`,
            { duration: 5000 }
          );
        } else {
          toast.success(
            `Analysis complete! Found ${response.annotations.length} quality-validated insights. Quality score: ${Math.round(qualityResult.overallQuality * 100)}%`,
            { duration: 4000 }
          );
        }

        // Show quality warnings if needed
        if (qualityResult.overallQuality < 0.7) {
          toast.warning(
            `Quality below threshold (${Math.round(qualityResult.overallQuality * 100)}%). ${qualityResult.qualityIssues.length} issues detected.`,
            { duration: 6000 }
          );
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
