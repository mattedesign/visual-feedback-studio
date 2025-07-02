
import { useEffect, useState, useCallback, useRef } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { AnalysisProgressSteps } from './components/AnalysisProgressSteps';
import { PipelineHealthIndicator } from './components/PipelineHealthIndicator';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { toast } from 'sonner';

interface AnalyzingStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

type AnalysisPhase = 'uploading' | 'processing' | 'research' | 'analysis' | 'recommendations';

export const AnalyzingStep = ({ workflow }: AnalyzingStepProps) => {
  const [currentPhase, setCurrentPhase] = useState<AnalysisPhase>('uploading');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [researchSourcesFound, setResearchSourcesFound] = useState(0);
  const [pipelineStages, setPipelineStages] = useState<any[]>([]);
  const [showPipelineHealth, setShowPipelineHealth] = useState(false);
  const maxRetries = 1;
  const analysisStartedRef = useRef(false);
  
  // ✅ NEW: Multi-stage pipeline monitoring
  const useMultiStagePipeline = useFeatureFlag('multi-stage-pipeline');

  // Complete a step and add it to completed steps
  const completeStep = useCallback((stepId: string) => {
    console.log(`✅ Step completed: ${stepId}`);
    setCompletedSteps(prev => {
      if (!prev.includes(stepId)) {
        return [...prev, stepId];
      }
      return prev;
    });
  }, []);

  // 🎯 PHASE MANAGEMENT WITH REALISTIC TIMING AND PROPER COMPLETION TRACKING
  const progressPhases = [
    { phase: 'uploading', duration: 5000, progressStart: 0, progressEnd: 15 },
    { phase: 'processing', duration: 8000, progressStart: 15, progressEnd: 35 },
    { phase: 'research', duration: 12000, progressStart: 35, progressEnd: 60 },
    { phase: 'analysis', duration: 20000, progressStart: 60, progressEnd: 85 },
    { phase: 'recommendations', duration: 8000, progressStart: 85, progressEnd: 100 }
  ];

  const updateProgressWithPhase = useCallback((phase: AnalysisPhase, phaseProgress: number) => {
    const currentPhaseData = progressPhases.find(p => p.phase === phase);
    if (currentPhaseData) {
      const { progressStart, progressEnd } = currentPhaseData;
      const actualProgress = progressStart + (phaseProgress * (progressEnd - progressStart) / 100);
      setAnalysisProgress(Math.min(actualProgress, 100));
    }
  }, []);

  const simulatePhaseProgress = useCallback(async (phase: AnalysisPhase) => {
    const phaseData = progressPhases.find(p => p.phase === phase);
    if (!phaseData) return;

    console.log(`🔄 Starting phase: ${phase}`);
    setCurrentPhase(phase);
    
    const steps = 20;
    const stepDuration = phaseData.duration / steps;
    
    for (let i = 0; i <= steps; i++) {
      if (analysisStartedRef.current === false) break; // Stop if analysis was cancelled
      
      const phaseProgress = (i / steps) * 100;
      updateProgressWithPhase(phase, phaseProgress);
      
      // Special handling for research phase to show sources found
      if (phase === 'research' && i > 5) {
        const sourcesFound = Math.min(12, Math.floor((i / steps) * 12));
        setResearchSourcesFound(sourcesFound);
      }
      
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }

    // Mark step as completed when phase finishes
    completeStep(phase);
    console.log(`✅ Phase completed: ${phase}`);
  }, [updateProgressWithPhase, completeStep]);

  const performAnalysis = useCallback(async () => {
    if (analysisStartedRef.current) {
      console.log('⚠️ Enhanced analysis already in progress, skipping duplicate call');
      return;
    }

    console.log('=== Enhanced AnalyzingStep - Starting with Progress Tracking ===');
    analysisStartedRef.current = true;

    try {
      // Validate inputs
      if (workflow.selectedImages.length === 0) {
        throw new Error('No images selected for analysis');
      }

      if (!workflow.analysisContext.trim()) {
        throw new Error('No analysis context provided');
      }

      // Phase 1: Uploading
      await simulatePhaseProgress('uploading');
      
      // Phase 2: Processing design elements
      await simulatePhaseProgress('processing');
      
      // Phase 3: Building research context
      await simulatePhaseProgress('research');
      
      // Phase 4: AI Analysis - This is where real analysis happens
      setCurrentPhase('analysis');
      console.log('🤖 Starting real AI analysis');
      
      // Start real analysis in parallel with progress simulation
      const analysisPromise = workflow.startAnalysis();
      const progressPromise = simulatePhaseProgress('analysis');
      
      // Wait for both to complete
      await Promise.all([analysisPromise, progressPromise]);
      
      // Phase 5: Generating recommendations
      await simulatePhaseProgress('recommendations');
      
      console.log('✅ Enhanced analysis completed successfully', {
        annotationsReceived: workflow.aiAnnotations?.length || 0,
        enhancedContext: !!workflow.enhancedContext,
        knowledgeSourcesUsed: workflow.knowledgeSourcesUsed
      });

      // Final progress update
      setAnalysisProgress(100);
      
      // Brief pause to show completion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to results
      workflow.goToStep('results');

    } catch (error) {
      console.error('❌ Enhanced analysis failed:', error);
      
      if (retryCount < maxRetries) {
        const nextRetry = retryCount + 1;
        console.log(`🔄 Attempting enhanced analysis retry ${nextRetry}/${maxRetries}`);
        setRetryCount(nextRetry);
        
        // Reset state for retry
        analysisStartedRef.current = false;
        setCurrentPhase('uploading');
        setAnalysisProgress(0);
        setResearchSourcesFound(0);
        setCompletedSteps([]);
        
        const delay = 3000;
        setTimeout(() => {
          performAnalysis();
        }, delay);
        
        toast(`Enhanced analysis failed, retrying in ${delay/1000} seconds...`, {
          duration: delay - 500,
        });
      } else {
        console.error('❌ Max retries exceeded for enhanced analysis');
        workflow.setIsAnalyzing(false);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`Enhanced analysis failed: ${errorMessage}. Please try again.`, {
          duration: 8000,
        });
        
        analysisStartedRef.current = false;
      }
    }
  }, [workflow, retryCount, simulatePhaseProgress]);

  useEffect(() => {
    console.log('🚀 Enhanced AnalyzingStep: Starting analysis with progress tracking');
    if (!analysisStartedRef.current) {
      performAnalysis();
    }
  }, [performAnalysis]);

  useEffect(() => {
    if (retryCount > 0 && analysisStartedRef.current) {
      analysisStartedRef.current = false;
    }
  }, [retryCount]);

  // Monitor workflow state changes for real completion tracking
  useEffect(() => {
    // Mark research as complete when we have research context
    if (workflow.enhancedContext && workflow.enhancedContext.knowledgeSourcesUsed > 0) {
      setResearchSourcesFound(workflow.enhancedContext.knowledgeSourcesUsed);
      completeStep('research');
    }
    
    // Mark analysis as complete when we have AI annotations
    if (workflow.aiAnnotations && workflow.aiAnnotations.length > 0) {
      completeStep('analysis');
    }
  }, [workflow.enhancedContext, workflow.aiAnnotations, completeStep]);

  const isMultiImage = workflow.selectedImages.length > 1;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        <AnalysisProgressSteps
          currentStep={currentPhase}
          progress={analysisProgress}
          researchSourcesFound={researchSourcesFound}
          totalImages={workflow.selectedImages.length}
          completedSteps={completedSteps}
          onStepComplete={completeStep}
        />
        
        {/* ✅ NEW: Multi-Stage Pipeline Health Indicator */}
        {useMultiStagePipeline && (showPipelineHealth || pipelineStages.length > 0) && (
          <PipelineHealthIndicator
            stages={pipelineStages}
            isRunning={workflow.isAnalyzing}
            currentStage={currentPhase}
          />
        )}
        
        {retryCount > 0 && (
          <div className="mt-4 text-center">
            <p className="text-yellow-400 text-sm">
              Retry attempt {retryCount} of {maxRetries}
            </p>
          </div>
        )}
        
        {/* ✅ NEW: Enhanced Error Display */}
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
