import { ReviewStep } from './workflow/ReviewStep';
import { AnnotateStep } from './workflow/AnnotateStep';
import { MultiImageAnnotateStep } from './workflow/MultiImageAnnotateStep';
import { AnalyzingStep } from './workflow/AnalyzingStep';
import { ResultsStep } from './workflow/ResultsStep';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useAuth } from '@/hooks/useAuth';
import { AnalysisStudioLayout } from './studio/AnalysisStudioLayout';
import { useState } from 'react';

export const AnalysisWorkflow = () => {
  // 🔄 LOOP DETECTION: Track component renders
  console.log('🔄 COMPONENT RENDER:', new Date().toISOString(), {
    componentName: 'AnalysisWorkflow',
    renderCount: ++((window as any).analysisWorkflowRenderCount) || ((window as any).analysisWorkflowRenderCount = 1)
  });

  const { user } = useAuth();
  const workflow = useAnalysisWorkflow();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  if (!user) {
    return null;
  }

  // For upload and annotate steps, use the studio layout
  if (workflow.currentStep === 'upload' || workflow.currentStep === 'annotate') {
    return (
      <AnalysisStudioLayout 
        workflow={workflow}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        rightPanelCollapsed={rightPanelCollapsed}
        setRightPanelCollapsed={setRightPanelCollapsed}
      />
    );
  }

  const renderCurrentStep = () => {
    switch (workflow.currentStep) {
      case 'review':
        return <ReviewStep workflow={workflow} />;
      case 'analyzing':
        return <AnalyzingStep workflow={workflow} />;
      case 'results':
        return <ResultsStep workflow={workflow} />;
      default:
        return (
          <AnalysisStudioLayout 
            workflow={workflow}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            rightPanelCollapsed={rightPanelCollapsed}
            setRightPanelCollapsed={setRightPanelCollapsed}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {renderCurrentStep()}
      </div>
    </div>
  );
};
