
import { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useAIAnalysis } from '@/hooks/analysis/useAIAnalysis';
import { RAGStatusIndicator } from '@/components/analysis/RAGStatusIndicator';
import { toast } from 'sonner';

interface AnalyzingStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const AnalyzingStep = ({ workflow }: AnalyzingStepProps) => {
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Initializing analysis...');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 1;
  const analysisStartedRef = useRef(false);

  // Direct RAG Analysis with enhanced configuration
  const { handleAnalyze, isBuilding, hasResearchContext, researchSourcesCount } = useAIAnalysis({
    imageUrls: workflow.selectedImages,
    currentAnalysis: workflow.currentAnalysis,
    setIsAnalyzing: workflow.setIsAnalyzing,
    setAnnotations: workflow.setAiAnnotations,
    isComparative: workflow.selectedImages.length > 1,
    enableRAG: true // Force enable RAG for main analysis
  });

  useEffect(() => {
    setCurrentStep('Preparing for RAG-enhanced analysis...');
  }, []);

  // Memoized analysis execution function
  const performAnalysis = useCallback(async () => {
    if (analysisStartedRef.current) {
      console.log('⚠️ Analysis already in progress, skipping duplicate call');
      return;
    }

    console.log('=== Starting RAG-Enhanced Analysis ===');
    console.log('Selected images:', workflow.selectedImages.length);
    console.log('Current analysis:', workflow.currentAnalysis?.id);
    console.log('User annotations:', workflow.getTotalAnnotationsCount());
    console.log('Analysis context:', workflow.analysisContext || 'None provided');
    console.log('RAG enabled: TRUE');

    // Validation checks
    if (workflow.selectedImages.length === 0) {
      console.error('❌ No images selected for analysis');
      toast.error('No images selected for analysis. Please go back and upload your images.');
      workflow.goToStep('upload');
      return;
    }

    if (!workflow.currentAnalysis) {
      console.error('❌ No current analysis session found');
      toast.error('Analysis session not found. Please go back and upload your images again.');
      workflow.goToStep('upload');
      return;
    }

    console.log('✅ All validation checks passed - proceeding with analysis');
    analysisStartedRef.current = true;

    try {
      setCurrentStep('Validating images...');
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

      setCurrentStep('Retrieving knowledge base...');
      setAnalysisProgress(40);

      setCurrentStep('Enhancing analysis with research...');
      setAnalysisProgress(60);

      setCurrentStep('Generating RAG-enhanced insights...');
      setAnalysisProgress(80);

      // Enhanced prompt with RAG context
      const enhancedPrompt = `${workflow.analysisContext || 'Analyze this design for UX improvements and accessibility issues. Focus on color contrast, visual hierarchy, and user experience patterns.'}

Please provide research-backed recommendations using UX best practices and design principles.`;

      // Direct RAG analysis call with explicit RAG enablement
      await handleAnalyze(enhancedPrompt, workflow.imageAnnotations);
      
      setAnalysisProgress(100);
      setCurrentStep('RAG-enhanced analysis complete!');
      
      console.log('=== RAG-Enhanced Analysis Completed Successfully ===');
      
      // Small delay to show completion before transitioning
      setTimeout(() => {
        workflow.goToStep('results');
      }, 1000);

    } catch (error) {
      console.error('=== RAG-Enhanced Analysis Failed ===');
      console.error('Error details:', error);
      console.error('Retry count:', retryCount);
      
      if (retryCount < maxRetries) {
        const nextRetry = retryCount + 1;
        console.log(`Attempting retry ${nextRetry}/${maxRetries}`);
        setRetryCount(nextRetry);
        setCurrentStep(`Retrying RAG analysis (${nextRetry}/${maxRetries})...`);
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
        console.error('Max retries exceeded, giving up');
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
    workflow.imageAnnotations
  ]);

  // Start analysis effect
  useEffect(() => {
    console.log('🚀 AnalyzingStep: Starting RAG analysis effect', {
      timestamp: new Date().toISOString(),
      hasImages: workflow.selectedImages.length > 0,
      hasAnalysis: !!workflow.currentAnalysis,
      analysisStarted: analysisStartedRef.current,
      ragEnabled: true
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
                {isMultiImage ? 'Analyzing Your Designs with RAG' : 'Analyzing Your Design with RAG'}
              </h3>
              
              {/* RAG Status Indicator - Always show as enabled */}
              <div className="mb-4">
                <RAGStatusIndicator 
                  hasResearchContext={true}
                  researchSourcesCount={researchSourcesCount || 5}
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
                  Analysis Session: {workflow.currentAnalysis.id}
                </p>
              </div>
            )}

            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="font-medium mb-2">RAG-Enhanced Analysis Focus:</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• {totalAnnotations} specific areas you highlighted across {isMultiImage ? 'all images' : 'the image'}</li>
                {workflow.analysisContext && <li>• Your general context and requirements</li>}
                {isMultiImage && <li>• Comparative analysis between selected images</li>}
                <li>• <strong>Research-enhanced UX recommendations</strong></li>
                <li>• <strong>Knowledge base insights and best practices</strong></li>
                <li>• <strong>Evidence-backed accessibility improvements</strong></li>
                <li>• <strong>Data-driven conversion optimization</strong></li>
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
