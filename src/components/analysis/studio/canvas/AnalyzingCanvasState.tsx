
import { useEffect, useState } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { AnalysisProgressSteps } from '../../workflow/components/AnalysisProgressSteps';

interface AnalyzingCanvasStateProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

type AnalysisPhase = 'uploading' | 'processing' | 'research' | 'analysis' | 'recommendations';

export const AnalyzingCanvasState = ({ workflow }: AnalyzingCanvasStateProps) => {
  const [currentPhase, setCurrentPhase] = useState<AnalysisPhase>('processing');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [researchSourcesFound, setResearchSourcesFound] = useState(0);
  const [hasStartedAnalysis, setHasStartedAnalysis] = useState(false);

  // Complete a step and add it to completed steps
  const completeStep = (stepId: string) => {
    console.log(`✅ Canvas Step completed: ${stepId}`);
    setCompletedSteps(prev => {
      if (!prev.includes(stepId)) {
        return [...prev, stepId];
      }
      return prev;
    });
  };

  useEffect(() => {
    // Only start analysis once and if we have the required data
    if (hasStartedAnalysis || !workflow.analysisContext.trim() || workflow.selectedImages.length === 0) {
      console.log('⚠️ AnalyzingCanvasState: Skipping analysis start', {
        hasStartedAnalysis,
        hasContext: !!workflow.analysisContext.trim(),
        hasImages: workflow.selectedImages.length > 0
      });
      return;
    }

    console.log('🚀 AnalyzingCanvasState: Starting analysis with progress');
    setHasStartedAnalysis(true);
    
    const runAnalysisWithProgress = async () => {
      try {
        // Phase 1: Skip uploading since we're already in canvas
        setCurrentPhase('processing');
        setPhaseProgress(15);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        completeStep('uploading'); // Mark uploading as complete since we're in canvas
        
        // Phase 2: Research context building
        setCurrentPhase('research');
        setPhaseProgress(35);
        
        // Simulate research sources being found
        for (let i = 1; i <= 8; i++) {
          await new Promise(resolve => setTimeout(resolve, 800));
          setResearchSourcesFound(i);
          setPhaseProgress(35 + (i * 3)); // Progress 35-59
        }
        
        completeStep('processing');
        
        // Phase 3: AI Analysis
        setCurrentPhase('analysis');
        setPhaseProgress(60);
        
        // Start real analysis
        await workflow.startAnalysis();
        
        completeStep('research');
        
        // Phase 4: Recommendations
        setCurrentPhase('recommendations');
        setPhaseProgress(85);
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        setPhaseProgress(100);
        completeStep('analysis');
        completeStep('recommendations');
        
        console.log('✅ AnalyzingCanvasState: Analysis completed successfully');
        
      } catch (error) {
        console.error('❌ AnalyzingCanvasState: Analysis failed:', error);
      }
    };

    runAnalysisWithProgress();
  }, [workflow.analysisContext, workflow.selectedImages.length, hasStartedAnalysis, workflow.startAnalysis]);

  // Monitor workflow state changes for real data
  useEffect(() => {
    // Fix: Check if knowledgeSourcesUsed exists and is a number
    if (workflow.knowledgeSourcesUsed && workflow.knowledgeSourcesUsed > 0) {
      setResearchSourcesFound(workflow.knowledgeSourcesUsed);
      completeStep('research');
    }
    
    if (workflow.aiAnnotations && workflow.aiAnnotations.length > 0) {
      setCurrentPhase('recommendations');
      setPhaseProgress(100);
      completeStep('analysis');
    }
  }, [workflow.knowledgeSourcesUsed, workflow.aiAnnotations]);

  return (
    <div className="h-full flex items-center justify-center p-8">
      <AnalysisProgressSteps
        currentStep={currentPhase}
        progress={phaseProgress}
        researchSourcesFound={researchSourcesFound}
        totalImages={workflow.selectedImages.length}
        completedSteps={completedSteps}
        onStepComplete={completeStep}
      />
    </div>
  );
};
