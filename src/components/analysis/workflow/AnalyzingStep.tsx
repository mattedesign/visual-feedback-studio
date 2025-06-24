
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useAIAnalysisEnhanced } from '@/hooks/analysis/useAIAnalysisEnhanced';
import { RAGStatusIndicator } from '../RAGStatusIndicator';
import { toast } from 'sonner';

interface AnalyzingStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const AnalyzingStep = ({ workflow }: AnalyzingStepProps) => {
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Initializing analysis...');
  const [hasStarted, setHasStarted] = useState(false);

  // Use enhanced AI analysis with RAG integration
  const { 
    handleAnalyze, 
    ragContext, 
    isBuilding, 
    hasResearchContext, 
    researchSourcesCount 
  } = useAIAnalysisEnhanced({
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
      setAnalysisProgress(40);
    } else if (ragContext && !isBuilding) {
      setCurrentStep('Performing research-enhanced analysis...');
      setAnalysisProgress(60);
    }
  }, [isBuilding, ragContext]);

  // Start analysis only once when component mounts
  useEffect(() => {
    if (!hasStarted && workflow.selectedImages.length > 0 && workflow.currentAnalysis) {
      setHasStarted(true);
      performAnalysis();
    }
  }, [hasStarted, workflow.selectedImages.length, workflow.currentAnalysis]);

  const performAnalysis = async () => {
    console.log('=== Starting Enhanced Analysis Process ===');
    console.log('Selected images:', workflow.selectedImages.length);
    console.log('Current analysis:', workflow.currentAnalysis?.id);
    console.log('User annotations:', workflow.getTotalAnnotationsCount());
    console.log('Analysis context:', workflow.analysisContext || 'None provided');

    // Basic validation
    if (workflow.selectedImages.length === 0) {
      console.error('No images selected for analysis');
      toast.error('No images selected for analysis');
      return;
    }

    if (!workflow.currentAnalysis) {
      console.error('No current analysis found');
      toast.error('Analysis session not found. Please go back and upload your images again.');
      return;
    }

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

      setCurrentStep('Starting RAG-enhanced analysis...');

      // Execute analysis with RAG enhancement
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
      
      setCurrentStep('Analysis failed');
      workflow.setIsAnalyzing(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Analysis failed: ${errorMessage}. Please try again or contact support if the issue persists.`, {
        duration: 8000,
      });
    }
  };

  const totalAnnotations = workflow.getTotalAnnotationsCount();
  const isMultiImage = workflow.selectedImages.length > 1;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-12 text-center">
          <div className="space-y-6">
            {/* Loading Animation */}
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
            </div>

            {/* Research Context Building Indicator */}
            {isBuilding && (
              <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                  <span className="text-sm text-blue-300 font-medium">Building research context...</span>
                </div>
                <p className="text-xs text-blue-400 mt-2">
                  Retrieving relevant UX research insights to enhance your analysis
                </p>
              </div>
            )}

            {/* Research Context Ready Indicator */}
            {ragContext && !isBuilding && researchSourcesCount > 0 && (
              <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center justify-center gap-3">
                  <div className="text-green-400 text-lg">✅</div>
                  <span className="text-sm text-green-300 font-medium">
                    Research context ready: {researchSourcesCount} insights found
                  </span>
                </div>
                <p className="text-xs text-green-400 mt-2">
                  Analysis enhanced with {ragContext.industryContext || 'UX'} research insights
                </p>
              </div>
            )}

            {/* Analysis Info Card */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="font-medium mb-3 text-blue-300">Enhanced Analysis Details:</h4>
              <ul className="text-sm text-slate-300 space-y-2 text-left">
                <li>• {totalAnnotations} specific areas you highlighted across {isMultiImage ? 'all images' : 'the image'}</li>
                {workflow.analysisContext && <li>• Your custom analysis requirements and context</li>}
                {isMultiImage && <li>• Comparative analysis between selected images</li>}
                {hasResearchContext && (
                  <li>• Research-backed insights from {researchSourcesCount} UX studies</li>
                )}
                <li>• Evidence-based accessibility and conversion recommendations</li>
                <li>• Industry-specific best practices and benchmarks</li>
              </ul>
            </div>

            {/* Progress Bar */}
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
