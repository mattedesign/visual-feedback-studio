
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useRAGAnalysis } from '@/hooks/analysis/useRAGAnalysis';
import { useAnalysisExecutionEnhanced } from '@/hooks/analysis/useAnalysisExecutionEnhanced';
import { RAGStatusIndicator } from '../RAGStatusIndicator';
import { toast } from 'sonner';

interface AnalyzingStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const AnalyzingStep = ({ workflow }: AnalyzingStepProps) => {
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Initializing analysis...');
  const [retryCount, setRetryCount] = useState(0);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const maxRetries = 3;

  // Use RAG-enhanced analysis system
  const {
    isBuilding,
    ragContext,
    buildRAGContext,
    enhancePromptWithResearch,
    hasResearchContext,
    researchSourcesCount,
    researchCategories
  } = useRAGAnalysis();

  const { executeAnalysis } = useAnalysisExecutionEnhanced({
    currentAnalysis: workflow.currentAnalysis,
    setIsAnalyzing: workflow.setIsAnalyzing,
    setAnnotations: workflow.setAiAnnotations,
  });

  // Update step text based on RAG status
  useEffect(() => {
    if (isBuilding) {
      setCurrentStep('Building research context...');
    } else if (ragContext && !isBuilding) {
      const count = ragContext.totalRelevantEntries || 0;
      if (count > 0) {
        setCurrentStep(`Research-enhanced analysis with ${count} insights...`);
      } else {
        setCurrentStep('Performing standard analysis (no research found)...');
      }
    }
  }, [isBuilding, ragContext]);

  useEffect(() => {
    const performRAGEnhancedAnalysis = async () => {
      console.log('=== Starting RAG-Enhanced Analysis ===');
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
        console.error('No current analysis found');
        toast.error('Analysis session not found. Please go back and upload your images again.');
        return;
      }

      console.log('=== Starting RAG-Enhanced Analysis Process ===');
      console.log('Is comparative:', workflow.selectedImages.length > 1);

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
            console.log(`✅ Image ${index + 1} validated successfully`);
            return true;
          } catch (error) {
            console.error(`❌ Image ${index + 1} validation failed:`, error);
            throw error;
          }
        });

        await Promise.all(imageValidationPromises);
        setAnalysisProgress(25);

        // Step 1: Build RAG context with IMPROVED settings
        setCurrentStep('Building research context...');
        setAnalysisProgress(40);
        
        console.log('🔍 Building RAG context with improved settings...');
        const analysisQuery = workflow.analysisContext || 'UX design analysis with research insights';
        
        let context;
        try {
          context = await buildRAGContext(analysisQuery, {
            maxResults: 8,
            similarityThreshold: 0.5, // LOWERED from 0.7
          });
          
          console.log(`✅ RAG context built: ${context.totalRelevantEntries} research sources found`);
          
          // Store debug info for display
          setDebugInfo({
            threshold: 0.5,
            queriesGenerated: context.retrievalMetadata?.queriesGenerated || 0,
            processingTime: context.retrievalMetadata?.processingTime || 0,
            categories: context.categories,
            hasError: !!context.retrievalMetadata?.error,
            error: context.retrievalMetadata?.error
          });
          
          if (context.totalRelevantEntries === 0) {
            console.warn('⚠️ No knowledge retrieved - this may indicate an issue with the knowledge base or search parameters');
            toast('No specific research found for this query, proceeding with general UX analysis', {
              duration: 4000,
            });
          }
        } catch (error) {
          console.warn('⚠️ RAG context building failed, proceeding with standard analysis:', error);
          context = null;
          setDebugInfo({
            error: error.message,
            fallbackUsed: true
          });
        }

        // Step 2: Enhance prompt with research
        setCurrentStep('Enhancing analysis with UX research...');
        setAnalysisProgress(60);

        let enhancedPrompt = workflow.analysisContext || 'Analyze this design for UX improvements';
        
        if (context && context.totalRelevantEntries > 0) {
          console.log('🔧 Enhancing prompt with research context...');
          try {
            enhancedPrompt = enhancePromptWithResearch(
              workflow.analysisContext || 'Analyze this design for UX improvements',
              context,
              'comprehensive'
            );
            console.log('✅ Prompt enhanced with research');
          } catch (error) {
            console.warn('⚠️ Prompt enhancement failed, using original prompt:', error);
          }
        }

        // Step 3: Execute analysis
        setCurrentStep('Sending to AI for analysis...');
        setAnalysisProgress(80);

        console.log('🚀 Executing enhanced analysis...');
        await executeAnalysis(
          workflow.selectedImages,
          enhancedPrompt,
          workflow.selectedImages.length > 1,
          {
            hasRAGContext: context !== null && context.totalRelevantEntries > 0,
            researchSourceCount: context?.totalRelevantEntries || 0,
            categories: context?.categories || [],
          }
        );
        
        setAnalysisProgress(100);
        setCurrentStep('Analysis complete!');
        
        console.log('=== RAG-Enhanced Analysis Completed Successfully ===');
        console.log('Research sources used:', context?.totalRelevantEntries || 0);
        console.log('Research categories:', context?.categories || []);
        
        // Show success message with research info
        if (context && context.totalRelevantEntries > 0) {
          toast.success(`Analysis complete with ${context.totalRelevantEntries} research insights from ${context.categories.join(', ')}!`, {
            duration: 5000,
          });
        }
        
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
          setCurrentStep(`Retrying analysis (${nextRetry}/${maxRetries})...`);
          setAnalysisProgress(0);
          
          // Exponential backoff: 2s, 4s, 8s
          const delay = Math.pow(2, retryCount) * 2000;
          setTimeout(() => {
            performRAGEnhancedAnalysis();
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
      }
    };

    performRAGEnhancedAnalysis();
  }, [workflow, buildRAGContext, enhancePromptWithResearch, executeAnalysis, retryCount]);

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
                    Research context ready: {ragContext.totalRelevantEntries} insights found
                  </span>
                </div>
                <p className="text-xs text-green-400 mt-1">
                  Analysis enhanced with {researchCategories.join(', ') || 'UX'} research
                </p>
              </div>
            )}

            {/* Debug Information (Development Mode) */}
            {debugInfo && (
              <div className="mt-4 p-3 bg-gray-900/20 border border-gray-500/30 rounded-lg text-left">
                <div className="text-xs text-gray-300">
                  <div className="font-medium mb-1">🔧 Debug Info:</div>
                  {debugInfo.threshold && <div>Similarity threshold: {debugInfo.threshold}</div>}
                  {debugInfo.queriesGenerated && <div>Search queries: {debugInfo.queriesGenerated}</div>}
                  {debugInfo.processingTime && <div>Processing time: {debugInfo.processingTime}ms</div>}
                  {debugInfo.categories && <div>Categories: {debugInfo.categories.join(', ')}</div>}
                  {debugInfo.error && <div className="text-red-400">Error: {debugInfo.error}</div>}
                  {debugInfo.fallbackUsed && <div className="text-yellow-400">Using fallback analysis</div>}
                </div>
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
                {hasResearchContext && (
                  <li>• Enhanced with {researchSourcesCount} research sources from {researchCategories.join(', ')}</li>
                )}
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
