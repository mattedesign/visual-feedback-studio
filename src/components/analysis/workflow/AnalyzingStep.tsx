import { useEffect, useRef, useState } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useConsolidatedAnalysis } from '@/hooks/analysis/useConsolidatedAnalysis';
import { SimpleProgressTracker } from '@/components/analysis/SimpleProgressTracker';
// Removed useFeatureFlag - always use simplified consolidated pipeline
import { analysisErrorHandler } from '@/utils/analysisErrorHandler';
import { toast } from 'sonner';
import { EnhancedErrorHandler } from './components/EnhancedErrorHandler';
import { useAnalysisCancellation } from '@/hooks/analysis/useAnalysisCancellation';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

interface AnalyzingStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const AnalyzingStep = ({ workflow }: AnalyzingStepProps) => {
  const consolidatedAnalysis = useConsolidatedAnalysis();
  const analysisStartedRef = useRef(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const { cancelAnalysis, cancelling } = useAnalysisCancellation();
  
  // Always use consolidated pipeline - simplified flow only

  const performAnalysis = async () => {
    if (analysisStartedRef.current || consolidatedAnalysis.isAnalyzing) {
      console.log('⚠️ Analysis already in progress, skipping duplicate call');
      return;
    }

    console.log('🚀 Starting simplified analysis');
    console.log('📊 Analysis details:', {
      imageCount: workflow.selectedImages.length,
      contextLength: workflow.analysisContext.length,
      hasContext: !!workflow.analysisContext.trim(),
      timestamp: new Date().toISOString()
    });
    analysisStartedRef.current = true;

    try {
      // Validate inputs
      if (workflow.selectedImages.length === 0) {
        throw new Error('No images selected for analysis');
      }

      if (!workflow.analysisContext.trim()) {
        throw new Error('No analysis context provided');
      }

      console.log('📊 Starting simplified analysis with consolidated pipeline');

      // Execute simplified analysis
      const result = await consolidatedAnalysis.executeAnalysis({
        imageUrls: workflow.selectedImages,
        analysisContext: workflow.analysisContext,
        deviceType: 'desktop'
      });

      if (result.success && result.analysisId) {
        console.log('✅ Simplified analysis completed:', {
          analysisId: result.analysisId,
          annotationCount: result.annotations?.length || 0,
          timestamp: new Date().toISOString()
        });

        // Store analysis ID for potential cancellation
        setCurrentAnalysisId(result.analysisId);

        if (result.annotations) {
          console.log('✅ Setting AI annotations:', {
            count: result.annotations.length
          });
          workflow.setAiAnnotations(result.annotations);
        }

        toast.success('Analysis complete! Redirecting to results...');
        
        console.log('🔀 Navigating to results page:', `/analysis/${result.analysisId}?beta=true`);
        
        // Navigate to results
        setTimeout(() => {
          window.location.href = `/analysis/${result.analysisId}?beta=true`;
        }, 1000);
      } else {
        console.error('❌ Analysis failed:', {
          success: result.success,
          error: result.error,
          analysisId: result.analysisId,
          timestamp: new Date().toISOString()
        });
        throw new Error(result.error || 'Analysis failed');
      }

    } catch (error) {
      console.error('❌ Simplified analysis failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        imageCount: workflow.selectedImages.length,
        contextLength: workflow.analysisContext.length
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setAnalysisError(errorMessage);
      
      toast.error(`Analysis failed: ${errorMessage}`, {
        duration: 8000
      });
      
      console.log('🔄 Stopping analysis and resetting workflow state');
      workflow.setIsAnalyzing(false);
    } finally {
      console.log('🏁 Analysis process completed');
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

  // Always use consolidated pipeline - simplified flow only
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
        
        {/* Cancel button for user control */}
        {consolidatedAnalysis.isAnalyzing && (
          <div className="text-center space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  // Cancel both locally and in database
                  consolidatedAnalysis.cancelAnalysis();
                  
                  if (currentAnalysisId) {
                    const cancelled = await cancelAnalysis(currentAnalysisId);
                    if (cancelled) {
                      toast.success('Analysis cancelled successfully');
                      workflow.goToStep('upload');
                    }
                  } else {
                    // If no analysis ID, just cancel locally
                    workflow.goToStep('upload');
                  }
                } catch (error) {
                  console.error('Failed to cancel analysis:', error);
                  // Still go back even if cancellation failed
                  workflow.goToStep('upload');
                }
              }}
              disabled={cancelling}
              className="flex items-center gap-2 text-red-400 hover:text-red-300 border-red-400/20 hover:border-red-300/20"
            >
              <XCircle className="h-4 w-4" />
              {cancelling ? 'Cancelling...' : 'Cancel Analysis'}
            </Button>
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
};