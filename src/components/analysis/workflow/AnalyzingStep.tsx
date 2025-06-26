
import { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useAIAnalysis } from '@/hooks/analysis/useAIAnalysis';
import { RAGStatusIndicator } from '../RAGStatusIndicator';
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
  const [currentStep, setCurrentStep] = useState('Initializing analysis...');
  const [retryCount, setRetryCount] = useState(0);
  const [detectedFocusAreas, setDetectedFocusAreas] = useState<string[]>([]);
  const maxRetries = 1;
  const analysisStartedRef = useRef(false);

  // Direct RAG Analysis
  const { handleAnalyze, isBuilding, hasResearchContext, researchSourcesCount } = useAIAnalysis({
    imageUrls: workflow.selectedImages,
    currentAnalysis: workflow.currentAnalysis,
    setIsAnalyzing: workflow.setIsAnalyzing,
    setAnnotations: workflow.setAiAnnotations,
    isComparative: workflow.selectedImages.length > 1
  });

  useEffect(() => {
    // Parse context and set focus areas
    const focusAreas = parseContextForDisplay(workflow.analysisContext);
    setDetectedFocusAreas(focusAreas);
    setCurrentStep(`Analyzing your context: ${focusAreas.join(', ')}...`);
  }, [workflow.analysisContext]);

  // Memoized analysis execution function
  const performAnalysis = useCallback(async () => {
    if (analysisStartedRef.current) {
      console.log('⚠️ Analysis already in progress, skipping duplicate call');
      return;
    }

    console.log('=== AnalyzingStep.performAnalysis - Starting ===');
    console.log('📊 Workflow state:', {
      selectedImages: workflow.selectedImages.length,
      currentAnalysisId: workflow.currentAnalysis?.id,
      userAnnotations: workflow.getTotalAnnotationsCount(),
      analysisContext: workflow.analysisContext ? 'PROVIDED' : 'NONE',
      aiAnnotationsCount: workflow.aiAnnotations?.length || 0,
      detectedFocusAreas
    });

    if (workflow.selectedImages.length === 0) {
      console.error('❌ No images selected for analysis');
      toast.error('No images selected for analysis');
      return;
    }

    if (!workflow.currentAnalysis) {
      console.error('❌ No current analysis found');
      toast.error('Analysis session not found. Please go back and upload your images again.');
      return;
    }

    analysisStartedRef.current = true;

    try {
      setCurrentStep('Preparing images...');
      setAnalysisProgress(10);

      // Validate images are accessible
      const imageValidationPromises = workflow.selectedImages.map(async (imageUrl, index) => {
        try {
          console.log(`🔍 Validating image ${index + 1}:`, imageUrl);
          const response = await fetch(imageUrl, { method: 'HEAD' });
          if (!response.ok) {
            throw new Error(`Image ${index + 1} not accessible: ${response.status}`);
          }
          console.log(`✅ Image ${index + 1} validated successfully`);
          return true;
        } catch (error) {
          console.error(`❌ Image ${index + 1} validation failed:`, error);
          throw error;
        }
      });

      await Promise.all(imageValidationPromises);
      setAnalysisProgress(25);

      setCurrentStep(`Retrieving relevant UX research for ${detectedFocusAreas.join(', ')}...`);
      setAnalysisProgress(40);

      setCurrentStep(`Building targeted analysis based on ${detectedFocusAreas.join(' & ')} priorities...`);
      setAnalysisProgress(60);

      setCurrentStep(`Generating context-aware insights for ${workflow.selectedImages.length} image${workflow.selectedImages.length > 1 ? 's' : ''}...`);
      setAnalysisProgress(80);

      console.log('🚀 About to call handleAnalyze');
      
      // Direct RAG analysis call
      await handleAnalyze(workflow.analysisContext, workflow.imageAnnotations);
      
      console.log('✅ handleAnalyze completed, checking workflow.aiAnnotations');
      console.log('📊 Current AI annotations count:', workflow.aiAnnotations?.length || 0);
      
      setAnalysisProgress(100);
      setCurrentStep(`Context-aware analysis complete for ${detectedFocusAreas.join(' & ')}!`);
      
      console.log('=== AnalyzingStep.performAnalysis - Completed Successfully ===');
      
      // Small delay to show completion before transitioning
      setTimeout(() => {
        console.log('🎯 Transitioning to results step');
        workflow.goToStep('results');
      }, 1000);

    } catch (error) {
      console.error('=== AnalyzingStep.performAnalysis - Failed ===');
      console.error('❌ Error details:', error);
      console.error('🔄 Retry count:', retryCount);
      
      if (retryCount < maxRetries) {
        const nextRetry = retryCount + 1;
        console.log(`🔄 Attempting retry ${nextRetry}/${maxRetries}`);
        setRetryCount(nextRetry);
        setCurrentStep(`Retrying context-aware analysis (${nextRetry}/${maxRetries})...`);
        setAnalysisProgress(0);
        
        analysisStartedRef.current = false;
        
        const delay = 3000;
        setTimeout(() => {
          performAnalysis();
        }, delay);
        
        toast(`Analysis failed, retrying in ${delay/1000} seconds... (${nextRetry}/${maxRetries})`, {
          duration: delay - 500,
        });
      } else {
        console.error('❌ Max retries exceeded, giving up');
        setCurrentStep('Analysis failed');
        workflow.setIsAnalyzing(false);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`Analysis failed: ${errorMessage}. Please check your API configuration or try again.`, {
          duration: 8000,
        });
      }
    } finally {
      if (retryCount >= maxRetries) {
        analysisStartedRef.current = false;
      }
    }
  }, [
    workflow.selectedImages.length,
    workflow.currentAnalysis?.id,
    workflow.analysisContext,
    handleAnalyze,
    retryCount,
    workflow.goToStep,
    workflow.setIsAnalyzing,
    workflow.getTotalAnnotationsCount,
    workflow.imageAnnotations,
    workflow.aiAnnotations?.length,
    detectedFocusAreas
  ]);

  // Start analysis effect
  useEffect(() => {
    console.log('🚀 AnalyzingStep: useEffect - Starting analysis effect', {
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

  // Separate effect for retry logic
  useEffect(() => {
    if (retryCount > 0 && analysisStartedRef.current) {
      analysisStartedRef.current = false;
    }
  }, [retryCount]);

  // Monitor ai annotations changes
  useEffect(() => {
    console.log('📊 AnalyzingStep: AI annotations changed:', {
      count: workflow.aiAnnotations?.length || 0,
      annotations: workflow.aiAnnotations?.map(a => ({
        id: a.id,
        category: a.category,
        severity: a.severity
      })) || []
    });
  }, [workflow.aiAnnotations]);

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
                {isMultiImage ? 'Analyzing Your Designs' : 'Analyzing Your Design'}
              </h3>
              
              {/* Context Intelligence Display */}
              {workflow.analysisContext && (
                <div className="mb-4 p-4 bg-slate-700/50 rounded-lg">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Your Analysis Context:</h4>
                  <p className="text-sm text-slate-200 italic mb-3">"{workflow.analysisContext}"</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {detectedFocusAreas.map((area) => (
                      <Badge key={area} variant="secondary" className="bg-blue-600/80 text-white">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* RAG Status Indicator */}
              <div className="mb-4">
                <RAGStatusIndicator 
                  hasResearchContext={hasResearchContext}
                  researchSourcesCount={researchSourcesCount}
                  isAnalyzing={true}
                />
              </div>
              
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
              <h4 className="font-medium mb-2">Context-Aware Analysis Focus:</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• {totalAnnotations} specific areas you highlighted across {isMultiImage ? 'all images' : 'the image'}</li>
                {workflow.analysisContext && <li>• Your context priorities: {detectedFocusAreas.join(', ')}</li>}
                {isMultiImage && <li>• Comparative analysis between selected images</li>}
                <li>• Research-enhanced UX recommendations</li>
                <li>• Knowledge base insights targeting {detectedFocusAreas.join(' & ')}</li>
                <li>• Evidence-backed {detectedFocusAreas.includes('Accessibility') ? 'accessibility' : 'usability'} improvements</li>
                {researchSourcesCount && <li>• Analysis enhanced with {researchSourcesCount} research insights</li>}
              </ul>
            </div>

            <div className="bg-slate-600 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${analysisProgress}%` }}
              ></div>
            </div>
            
            <div className="text-sm text-slate-400">
              {analysisProgress}% complete
            </div>

            {/* Debug info */}
            <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-left">
              <h5 className="text-sm font-medium text-slate-300 mb-2">Debug Info:</h5>
              <div className="text-xs text-slate-400 space-y-1">
                <div>Current AI Annotations: {workflow.aiAnnotations?.length || 0}</div>
                <div>Analysis Started: {analysisStartedRef.current ? 'Yes' : 'No'}</div>
                <div>Retry Count: {retryCount}</div>
                <div>Focus Areas: {detectedFocusAreas.join(', ')}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
