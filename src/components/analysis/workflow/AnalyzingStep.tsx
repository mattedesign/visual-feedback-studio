
import { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useAIAnalysis } from '@/hooks/analysis/useAIAnalysis';
import { RAGStatusIndicator } from '../RAGStatusIndicator';
import { toast } from 'sonner';

interface AnalyzingStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const AnalyzingStep = ({ workflow }: AnalyzingStepProps) => {
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Initializing analysis...');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const analysisStartedRef = useRef(false);

  // Updated to capture RAG state from useAIAnalysis
  const { handleAnalyze, ragContext, isBuilding, hasResearchContext, researchSourcesCount } = useAIAnalysis({
    imageUrls: workflow.selectedImages,
    currentAnalysis: workflow.currentAnalysis,
    setIsAnalyzing: workflow.setIsAnalyzing,
    setAnnotations: workflow.setAiAnnotations,
    isComparative: workflow.selectedImages.length > 1
  });

  // Update step text based on RAG status
  useEffect(() => {
    if (isBuilding) {
      setCurrentStep('Building research context...');
    } else if (ragContext && !isBuilding) {
      setCurrentStep('Performing research-enhanced analysis...');
    }
  }, [isBuilding, ragContext]);

  // Memoized analysis execution function
  const performAnalysis = useCallback(async () => {
    // Prevent multiple simultaneous analysis runs
    if (analysisStartedRef.current) {
      console.log('⚠️ Analysis already in progress, skipping duplicate call');
      return;
    }

    console.log('=== Starting Analysis Validation ===');
    console.log('Selected images:', workflow.selectedImages.length);
    console.log('Current analysis:', workflow.currentAnalysis?.id);
    console.log('User annotations:', workflow.getTotalAnnotationsCount());
    console.log('Analysis context:', workflow.analysisContext || 'None provided');

    // Validation checks
    if (workflow.selectedImages.length === 0) {
      console.error('No images selected for analysis');
      toast.error('No images selected for analysis');
      return;
    }

    if (!workflow.currentAnalysis) {
      console.error('No current analysis found - this is the main issue');
      toast.error('Analysis session not found. Please go back and upload your images again.');
      return;
    }

    console.log('=== Starting RAG-Enhanced Analysis Process ===');
    console.log('Is comparative:', workflow.selectedImages.length > 1);

    analysisStartedRef.current = true;

    try {
      setCurrentStep('Preparing images...');
      setAnalysisProgress(10);

      // Validate images are accessible
      const imageValidationPromises = workflow.selectedImages.map(async (imageUrl, index) => {
        try {
          const response = await fetch(imageUrl, { method: 'HEAD' });
          if (!response.ok) {
            throw new Error(`Image ${index + 1} not accessible: ${response.status}`);
          }
          console.log(`Image ${index + 1} validated successfully`);
          return true;
        } catch (error) {
          console.error(`Image ${index + 1} validation failed:`, error);
          throw error;
        }
      });

      await Promise.all(imageValidationPromises);
      setAnalysisProgress(25);

      setCurrentStep('Building research context...');
      setAnalysisProgress(40);

      setCurrentStep('Enhancing analysis with UX research...');
      setAnalysisProgress(60);

      setCurrentStep('Sending to AI for analysis...');
      setAnalysisProgress(80);

      await handleAnalyze(workflow.analysisContext, workflow.imageAnnotations);
      
      setAnalysisProgress(100);
      setCurrentStep('Analysis complete!');
      
      console.log('=== RAG-Enhanced Analysis Completed Successfully ===');
      
      // Small delay to show completion before transitioning
      setTimeout(() => {
        workflow.goToStep('results');
      }, 1000);

    } catch (error) {
      console.error('=== Analysis Failed ===');
      console.error('Error details:', error);
      console.error('Retry count:', retryCount);
      
      if (retryCount < maxRetries) {
        const nextRetry = retryCount + 1;
        console.log(`Attempting retry ${nextRetry}/${maxRetries}`);
        setRetryCount(nextRetry);
        setCurrentStep(`Retrying analysis (${nextRetry}/${maxRetries})...`);
        setAnalysisProgress(0);
        
        // Reset the analysis started flag for retry
        analysisStartedRef.current = false;
        
        // Exponential backoff: 2s, 4s, 8s
        const delay = Math.pow(2, retryCount) * 2000;
        setTimeout(() => {
          performAnalysis();
        }, delay);
        
        toast(`Analysis failed, retrying in ${delay/1000} seconds... (${nextRetry}/${maxRetries})`, {
          duration: delay - 500,
        });
      } else {
        console.error('Max retries exceeded, giving up');
        setCurrentStep('Analysis failed after multiple attempts');
        workflow.setIsAnalyzing(false);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`Analysis failed: ${errorMessage}. Please try again or contact support if the issue persists.`, {
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
    workflow.imageAnnotations
  ]);

  // Stable effect that only runs once when component mounts or when critical dependencies change
  useEffect(() => {
    console.log('🚀 AnalyzingStep: Starting analysis effect', {
      timestamp: new Date().toISOString(),
      hasImages: workflow.selectedImages.length > 0,
      hasAnalysis: !!workflow.currentAnalysis,
      analysisStarted: analysisStartedRef.current
    });

    // Only start analysis if we haven't started yet
    if (!analysisStartedRef.current) {
      performAnalysis();
    }
  }, []); // Empty dependency array - only run once on mount

  // Separate effect for retry logic
  useEffect(() => {
    if (retryCount > 0 && analysisStartedRef.current) {
      // Reset for retry
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
                {isMultiImage ? 'Analyzing Your Designs' : 'Analyzing Your Design'}
              </h3>
              
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

            {/* Research Context Building Indicator */}
            {isBuilding && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                  <span className="text-sm text-blue-300 font-medium">Building research context...</span>
                </div>
                <p className="text-xs text-blue-400 mt-1">Retrieving UX research insights for enhanced analysis</p>
              </div>
            )}

            {/* Research Context Ready Indicator */}
            {ragContext && !isBuilding && (
              <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <div className="text-green-400">✅</div>
                  <span className="text-sm text-green-300 font-medium">
                    Research context ready: {ragContext.retrievedKnowledge?.relevantPatterns?.length || researchSourcesCount} insights found
                  </span>
                </div>
                <p className="text-xs text-green-400 mt-1">
                  Analysis enhanced with {ragContext.industryContext || 'UX'} research
                </p>
              </div>
            )}

            {workflow.currentAnalysis && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-300 text-sm">
                  Analysis ID: {workflow.currentAnalysis.id}
                </p>
              </div>
            )}

            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="font-medium mb-2">Enhanced Analysis Focus:</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• {totalAnnotations} specific areas you highlighted across {isMultiImage ? 'all images' : 'the image'}</li>
                {workflow.analysisContext && <li>• Your general context and requirements</li>}
                {isMultiImage && <li>• Comparative analysis between selected images</li>}
                <li>• Research-backed UX and accessibility recommendations</li>
                <li>• Evidence-based conversion optimization opportunities</li>
                <li>• Citations from peer-reviewed UX studies</li>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
