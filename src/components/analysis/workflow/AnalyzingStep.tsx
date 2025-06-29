
import { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { RAGStatusIndicator } from '../RAGStatusIndicator';
import { EnhancedAnalysisDisplay } from './components/EnhancedAnalysisDisplay';
import { ContextIntelligenceDisplay } from './components/ContextIntelligenceDisplay';
import { toast } from 'sonner';

interface AnalyzingStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

const parseContextForDisplay = (context: string): string[] => {
  if (!context) return ['Comprehensive UX'];
  
  const focusAreas = [];
  const lower = context.toLowerCase();
  
  if (/checkout|cart|purchase|ecommerce|e-commerce|order|product/.test(lower)) focusAreas.push('E-commerce');
  if (/mobile|responsive|touch|tablet|phone|ios|android|device/.test(lower)) focusAreas.push('Mobile UX');
  if (/accessibility|contrast|wcag|ada|screen reader|keyboard|disability/.test(lower)) focusAreas.push('Accessibility');
  if (/conversion|cta|revenue|optimize|funnel|landing|signup/.test(lower)) focusAreas.push('Conversion');
  if (/usability|navigation|flow|journey|interaction|ux/.test(lower)) focusAreas.push('Usability');
  if (/visual|design|color|typography|layout|brand|aesthetic/.test(lower)) focusAreas.push('Visual Design');
  
  return focusAreas.length > 0 ? focusAreas : ['Comprehensive UX'];
};

export const AnalyzingStep = ({ workflow }: AnalyzingStepProps) => {
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Initializing enhanced analysis...');
  const [retryCount, setRetryCount] = useState(0);
  const [detectedFocusAreas, setDetectedFocusAreas] = useState<string[]>([]);
  const maxRetries = 1;
  const analysisStartedRef = useRef(false);

  useEffect(() => {
    const focusAreas = parseContextForDisplay(workflow.analysisContext);
    setDetectedFocusAreas(focusAreas);
    setCurrentStep(`Analyzing your context: ${focusAreas.join(', ')}...`);
  }, [workflow.analysisContext]);

  const performAnalysis = useCallback(async () => {
    if (analysisStartedRef.current) {
      console.log('⚠️ Enhanced analysis already in progress, skipping duplicate call');
      return;
    }

    console.log('=== Enhanced AnalyzingStep - Starting ===');
    
    analysisStartedRef.current = true;

    try {
      setCurrentStep('Initializing enhanced analysis...');
      setAnalysisProgress(5);
      
      if (workflow.selectedImages.length === 0) {
        throw new Error('No images selected for analysis');
      }

      setCurrentStep('Validating images...');
      setAnalysisProgress(15);

      // Image validation
      const imageValidationPromises = workflow.selectedImages.map(async (imageUrl, index) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          const response = await fetch(imageUrl, { 
            method: 'HEAD',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`Image ${index + 1} not accessible: ${response.status}`);
          }
          
          console.log(`✅ Image ${index + 1} validated successfully`);
          return true;
        } catch (error) {
          console.error(`❌ Image ${index + 1} validation failed:`, error);
          throw new Error(`Image ${index + 1} validation failed`);
        }
      });

      await Promise.all(imageValidationPromises);
      setAnalysisProgress(25);

      setCurrentStep('Building vision analysis context...');
      setAnalysisProgress(35);

      // Prepare user annotations
      const userAnnotations = workflow.imageAnnotations.flatMap(imageAnnotation => 
        imageAnnotation.annotations.map(annotation => ({
          imageUrl: imageAnnotation.imageUrl,
          x: annotation.x,
          y: annotation.y,
          comment: annotation.comment,
          id: annotation.id
        }))
      );

      setCurrentStep('Retrieving UX research knowledge...');
      setAnalysisProgress(50);

      setCurrentStep('Running enhanced AI analysis...');
      setAnalysisProgress(65);

      // Call enhanced analysis
      const result = await workflow.startAnalysis();

      setAnalysisProgress(85);

      if (workflow.aiAnnotations && workflow.aiAnnotations.length > 0) {
        setCurrentStep('Processing enhanced results...');
        setAnalysisProgress(95);

        setCurrentStep(`Enhanced analysis complete for ${detectedFocusAreas.join(' & ')}!`);
        setAnalysisProgress(100);

        console.log('✅ Enhanced AnalyzingStep: Analysis completed successfully', {
          annotationsReceived: workflow.aiAnnotations.length,
          enhancedContext: !!workflow.enhancedContext,
          knowledgeSourcesUsed: workflow.knowledgeSourcesUsed
        });

        // Smooth transition to results
        setTimeout(() => {
          workflow.goToStep('results');
        }, 1000);
      } else {
        throw new Error('Enhanced analysis failed to return valid results');
      }

    } catch (error) {
      console.error('❌ Enhanced AnalyzingStep: Analysis failed:', error);
      
      if (retryCount < maxRetries) {
        const nextRetry = retryCount + 1;
        console.log(`🔄 Attempting enhanced analysis retry ${nextRetry}/${maxRetries}`);
        setRetryCount(nextRetry);
        setCurrentStep(`Retrying enhanced analysis (${nextRetry}/${maxRetries})...`);
        setAnalysisProgress(0);
        
        analysisStartedRef.current = false;
        
        const delay = 3000;
        setTimeout(() => {
          performAnalysis();
        }, delay);
        
        toast(`Enhanced analysis failed, retrying in ${delay/1000} seconds...`, {
          duration: delay - 500,
        });
      } else {
        console.error('❌ Max retries exceeded for enhanced analysis');
        setCurrentStep('Enhanced analysis failed');
        setAnalysisProgress(0);
        workflow.setIsAnalyzing(false);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`Enhanced analysis failed: ${errorMessage}. Please try again.`, {
          duration: 8000,
        });
        
        analysisStartedRef.current = false;
      }
    }
  }, [workflow, detectedFocusAreas, retryCount]);

  useEffect(() => {
    console.log('🚀 Enhanced AnalyzingStep: useEffect - Starting enhanced analysis effect', {
      timestamp: new Date().toISOString(),
      hasImages: workflow.selectedImages.length > 0,
      hasAnalysis: !!workflow.currentAnalysis,
      analysisStarted: analysisStartedRef.current,
      currentAiAnnotations: workflow.aiAnnotations?.length || 0
    });

    if (!analysisStartedRef.current) {
      performAnalysis();
    }
  }, []);

  useEffect(() => {
    if (retryCount > 0 && analysisStartedRef.current) {
      analysisStartedRef.current = false;
    }
  }, [retryCount]);

  const totalAnnotations = workflow.getTotalAnnotationsCount();
  const isMultiImage = workflow.selectedImages.length > 1;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-12 text-center">
          <div className="space-y-6">
            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            
            <div>
              <h3 className="text-2xl font-semibold mb-4">
                Enhanced {isMultiImage ? 'Multi-Image' : 'Design'} Analysis
              </h3>
              
              {/* Context Intelligence Display */}
              <div className="mb-4">
                <ContextIntelligenceDisplay 
                  analysisContext={workflow.analysisContext}
                  focusAreas={detectedFocusAreas}
                  researchSourcesCount={workflow.researchSourcesCount}
                  isAnalyzing={true}
                />
              </div>
              
              {/* RAG Status Indicator */}
              <div className="mb-4">
                <RAGStatusIndicator 
                  hasResearchContext={workflow.hasResearchContext}
                  researchSourcesCount={workflow.researchSourcesCount}
                  isAnalyzing={true}
                />
              </div>

              {/* Enhanced Analysis Display */}
              {workflow.enhancedContext && (
                <div className="mb-4">
                  <EnhancedAnalysisDisplay 
                    enhancedContext={workflow.enhancedContext}
                    isAnalyzing={true}
                  />
                </div>
              )}
              
              <p className="text-slate-400 mb-2">
                {currentStep}
              </p>
              {retryCount > 0 && (
                <p className="text-yellow-400 text-sm">
                  Retry attempt {retryCount} of {maxRetries}
                </p>
              )}
            </div>

            {workflow.currentAnalysis && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-300 text-sm">
                  Analysis ID: {workflow.currentAnalysis.id}
                </p>
              </div>
            )}

            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="font-medium mb-2">Enhanced Analysis Features:</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Vision analysis detecting UI patterns and industry context</li>
                <li>• {totalAnnotations} specific areas you highlighted across {isMultiImage ? 'all images' : 'the image'}</li>
                {workflow.analysisContext && <li>• Your context priorities: {detectedFocusAreas.join(', ')}</li>}
                {isMultiImage && <li>• Comparative analysis between selected images</li>}
                <li>• Knowledge base integration with UX research</li>
                <li>• Confidence scoring and evidence-backed recommendations</li>
                {workflow.knowledgeSourcesUsed > 0 && <li>• Analysis enhanced with {workflow.knowledgeSourcesUsed} research insights</li>}
              </ul>
            </div>

            <div className="bg-slate-600 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
            
            <div className="text-sm text-slate-400">
              {analysisProgress}% complete
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
