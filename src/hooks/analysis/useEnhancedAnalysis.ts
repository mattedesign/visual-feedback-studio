
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { enhancedRagService, EnhancedContext } from '@/services/analysis/enhancedRagService';
import { analysisService } from '@/services/analysisService';
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
}

export const useEnhancedAnalysis = ({ currentAnalysis }: UseEnhancedAnalysisProps = {}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildingStage, setBuildingStage] = useState<string>('');
  const [hasResearchContext, setHasResearchContext] = useState(false);
  const [researchSourcesCount, setResearchSourcesCount] = useState(0);
  const [enhancedContext, setEnhancedContext] = useState<EnhancedContext | null>(null);

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
    resetState();

    try {
      // Phase 1: Build enhanced context if requested
      let enhancedPrompt = request.analysisPrompt;
      let contextData: EnhancedContext | null = null;

      if (request.useEnhancedRag) {
        setBuildingStage('Building enhanced context...');
        console.log('📚 Enhanced Analysis: Building RAG context');

        try {
          // Create a simplified workflow state for the enhanced service
          const workflowState = {
            selectedImages: request.imageUrls,
            aiAnnotations: [], // Will be populated after analysis
            currentStep: 'analyzing',
            imageAnnotations: request.userAnnotations.map(ua => ({
              imageUrl: ua.imageUrl,
              annotations: [{
                id: ua.id,
                x: ua.x,
                y: ua.y,
                comment: ua.comment
              }]
            }))
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

          console.log('✅ Enhanced Analysis: RAG context built successfully', {
            knowledgeSourcesUsed: contextData.knowledgeSourcesUsed,
            confidenceScore: contextData.confidenceScore,
            visionElementsDetected: contextData.visionAnalysis.uiElements.length
          });

        } catch (ragError) {
          console.warn('⚠️ Enhanced Analysis: RAG enhancement failed, falling back to standard analysis:', ragError);
          // Continue with standard analysis if RAG fails
        }
      }

      // Phase 2: Run AI analysis with enhanced prompt
      setBuildingStage('Running AI analysis...');
      setIsBuilding(false);

      console.log('🤖 Enhanced Analysis: Running AI analysis', {
        promptLength: enhancedPrompt.length,
        hasEnhancedContext: !!contextData
      });

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

      console.log('✅ Enhanced Analysis: Analysis completed successfully', {
        annotationCount: analysisResult.annotations?.length || 0,
        researchEnhanced: analysisResult.researchEnhanced,
        knowledgeSourcesUsed: analysisResult.knowledgeSourcesUsed
      });

      const response: AnalyzeImagesResponse = {
        success: true,
        annotations: analysisResult.annotations || [],
        analysis: analysisResult,
        enhancedContext: contextData
      };

      // Show enhanced success message
      if (contextData) {
        toast.success(
          `Enhanced analysis complete! Found ${response.annotations.length} insights using ${contextData.knowledgeSourcesUsed} research sources.`,
          { duration: 4000 }
        );
      } else {
        toast.success(`Analysis complete! Found ${response.annotations.length} insights.`);
      }

      return response;

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
  }, [currentAnalysis, resetState]);

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
