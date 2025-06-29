
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

  // Use the standardized AI Analysis hook
  const { analyzeImages, isAnalyzing, hasResearchContext, researchSourcesCount } = useAIAnalysis();

  useEffect(() => {
    // Parse context and set focus areas
    const focusAreas = parseContextForDisplay(workflow.analysisContext);
    setDetectedFocusAreas(focusAreas);
    setCurrentStep(`Analyzing your context: ${focusAreas.join(', ')}...`);
  }, [workflow.analysisContext]);

  const performAnalysis = useCallback(async () => {
    if (analysisStartedRef.current) {
      console.log('⚠️ Analysis already in progress, skipping duplicate call');
      return;
    }

    console.log('=== AnalyzingStep.performAnalysis - Starting ===');
    
    analysisStartedRef.current = true;

    try {
      setCurrentStep('Initializing analysis...');
      setAnalysisProgress(5);
      
      // Input validation
      if (workflow.selectedImages.length === 0) {
        throw new Error('No images selected for analysis');
      }

      setCurrentStep('Validating images...');
      setAnalysisProgress(15);

      // Robust image validation with timeout
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

      setCurrentStep('Building research context...');
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

      setCurrentStep('Enhancing with UX research...');
      setAnalysisProgress(50);

      setCurrentStep('Running AI analysis...');
      setAnalysisProgress(65);

      // Call analysis with enhanced RAG enabled by default
      const result = await analyzeImages({
        imageUrls: workflow.selectedImages,
        userAnnotations,
        analysisPrompt: workflow.analysisContext || 'Analyze this design for UX improvements',
        deviceType: 'desktop',
        useEnhancedRag: true
      });

      setAnalysisProgress(85);

      if (result.success && result.annotations) {
        setCurrentStep('Processing results...');
        setAnalysisProgress(95);

        // Store AI annotations in workflow
        workflow.setAiAnnotations(result.annotations);

        setCurrentStep(`Analysis complete for ${detectedFocusAreas.join(' & ')}!`);
        setAnalysisProgress(100);

        console.log('✅ AnalyzingStep: Analysis completed successfully', {
          annotationsReceived: result.annotations.length
        });

        // Smooth transition to results
        setTimeout(() => {
          workflow.goToStep('results');
        }, 1000);
      } else {
        throw new Error('Analysis failed to return valid results');
      }

    } catch (error) {
      console.error('❌ AnalyzingStep: Analysis failed:', error);
      
      // Proper error handling without infinite retries
      if (retryCount < maxRetries) {
        const nextRetry = retryCount + 1;
        console.log(`🔄 Attempting retry ${nextRetry}/${maxRetries}`);
        setRetryCount(nextRetry);
        setCurrentStep(`Retrying analysis (${nextRetry}/${maxRetries})...`);
        setAnalysisProgress(0);
        
        analysisStartedRef.current = false;
        
        const delay = 3000;
        setTimeout(() => {
          performAnalysis();
        }, delay);
        
        toast(`Analysis failed, retrying in ${delay/1000} seconds...`, {
          duration: delay - 500,
        });
      } else {
        console.error('❌ Max retries exceeded');
        setCurrentStep('Analysis failed');
        setAnalysisProgress(0);
        workflow.setIsAnalyzing(false);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`Analysis failed: ${errorMessage}. Please try again.`, {
          duration: 8000,
        });
        
        // Reset for potential retry
        analysisStartedRef.current = false;
      }
    }
  }, [workflow, analyzeImages, detectedFocusAreas, retryCount]);

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
