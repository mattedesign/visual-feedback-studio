import { useEffect, useRef, useState } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useConsolidatedAnalysis } from '@/hooks/analysis/useConsolidatedAnalysis';
import { SimpleProgressTracker } from '@/components/analysis/SimpleProgressTracker';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { analysisErrorHandler } from '@/utils/analysisErrorHandler';
import { toast } from 'sonner';
import { EnhancedErrorHandler } from './components/EnhancedErrorHandler';

interface AnalyzingStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const AnalyzingStep = ({ workflow }: AnalyzingStepProps) => {
  const consolidatedAnalysis = useConsolidatedAnalysis();
  const analysisStartedRef = useRef(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // Feature flags
  const useConsolidatedPipeline = useFeatureFlag('consolidated-analysis-pipeline');

  const performAnalysis = async () => {
    if (analysisStartedRef.current || consolidatedAnalysis.isAnalyzing) {
      console.log('⚠️ Analysis already in progress, skipping duplicate call');
      return;
    }

    console.log('🚀 Starting consolidated analysis with error handling');
    analysisStartedRef.current = true;

    try {
      // Validate inputs
      if (workflow.selectedImages.length === 0) {
        throw new Error('No images selected for analysis');
      }

      if (!workflow.analysisContext.trim()) {
        throw new Error('No analysis context provided');
      }

      console.log('📊 Analysis Configuration:', {
        imageCount: workflow.selectedImages.length,
        contextLength: workflow.analysisContext.length,
        useConsolidatedPipeline
      });

      // Execute analysis with new consolidated system
      const result = await consolidatedAnalysis.executeAnalysis({
        imageUrls: workflow.selectedImages,
        analysisContext: workflow.analysisContext,
        deviceType: 'desktop'
      });

      if (result.success && result.analysisId) {
        console.log('✅ Consolidated analysis completed successfully:', {
          analysisId: result.analysisId,
          annotationCount: result.annotations?.length || 0,
          hasWellDone: !!result.wellDone
        });

        // Update workflow state with results
        if (result.annotations) {
          workflow.setAiAnnotations(result.annotations);
        }

        toast.success('Analysis complete! Redirecting to results...');
        
        // Navigate to results with a brief delay
        setTimeout(() => {
          window.location.href = `/analysis/${result.analysisId}?beta=true`;
        }, 1000);
      } else {
        throw new Error(result.error || 'Analysis failed');
      }

    } catch (error) {
      console.error('❌ Consolidated analysis failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setAnalysisError(errorMessage);
      
      toast.error(`Analysis failed: ${errorMessage}`, {
        duration: 8000
      });
      
      // Don't auto-navigate on error - let user choose what to do
      workflow.setIsAnalyzing(false);
    } finally {
      analysisStartedRef.current = false;
    }
  };

  // Start analysis on mount
  useEffect(() => {
    if (!analysisStartedRef.current && !consolidatedAnalysis.isAnalyzing) {
      performAnalysis();
    }
    
    // Cleanup on unmount
    return () => {
      analysisErrorHandler.cancelAllOperations();
    };
  }, []);

  // Monitor for completion from consolidated analysis
  useEffect(() => {
    if (consolidatedAnalysis.progress.phase === 'complete') {
      console.log('✅ Analysis marked as complete by consolidated system');
    }
  }, [consolidatedAnalysis.progress.phase]);

  // ✅ FIXED: Show error handler if analysis failed
  if (analysisError) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <EnhancedErrorHandler
          error={analysisError}
          onRetry={() => {
            setAnalysisError(null);
            analysisStartedRef.current = false;
            performAnalysis();
          }}
          onReset={() => {
            setAnalysisError(null);
            workflow.resetWorkflow();
          }}
          onDebug={() => {
            // Show debug info - could open diagnostics panel
            console.log('🔍 Debug info requested for error:', analysisError);
          }}
          context={{
            step: 'analyzing',
            imageCount: workflow.selectedImages.length,
            promptLength: workflow.analysisContext.length
          }}
        />
      </div>
    );
  }

  // Choose progress tracker based on feature flag
  if (useConsolidatedPipeline) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <SimpleProgressTracker
            currentPhase={
              consolidatedAnalysis.progress.phase === 'idle' ? 'uploading' :
              consolidatedAnalysis.progress.phase === 'complete' ? 'complete' :
              consolidatedAnalysis.progress.phase === 'research' ? 'processing' :
              consolidatedAnalysis.progress.phase === 'analysis' ? 'processing' :
              consolidatedAnalysis.progress.phase === 'validation' ? 'processing' :
              consolidatedAnalysis.progress.phase === 'recommendations' ? 'processing' :
              'processing'
            }
            progressPercentage={consolidatedAnalysis.progress.progress}
            startTime={consolidatedAnalysis.analysisStartTime || new Date()}
            statusMessage={consolidatedAnalysis.progress.message}
            onComplete={() => {
              console.log('🎉 Analysis completed - ready for results');
            }}
          />
          
          {/* Research sources indicator */}
          {consolidatedAnalysis.progress.researchSourcesFound > 0 && (
            <div className="text-center">
              <p className="text-emerald-400 text-sm">
                📚 {consolidatedAnalysis.progress.researchSourcesFound} research insights found
              </p>
            </div>
          )}
          
          {/* Cancel button for user control */}
          {consolidatedAnalysis.isAnalyzing && (
            <div className="text-center">
              <button
                onClick={() => {
                  consolidatedAnalysis.cancelAnalysis();
                  workflow.goToStep('annotate');
                }}
                className="text-gray-400 hover:text-white text-sm underline"
              >
                Cancel Analysis
              </button>
            </div>
          )}

          {/* Enhanced Error Display */}
          {workflow.buildingStage && (
            <div className="text-center">
              <p className="text-blue-400 text-sm animate-pulse">
                {workflow.buildingStage}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback: Use existing progress display if consolidated pipeline is not enabled
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <SimpleProgressTracker
          currentPhase="analyzing"
          progressPercentage={75}
          startTime={new Date()}
          statusMessage="Running analysis with fallback system..."
          onComplete={() => {
            console.log('🎉 Fallback analysis completed');
          }}
        />
        
        <div className="text-center">
          <p className="text-yellow-400 text-sm">
            Using legacy analysis system
          </p>
        </div>
      </div>
    </div>
  );
};