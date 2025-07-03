import { ReviewStep } from './workflow/ReviewStep';
import { AnnotateStep } from './workflow/AnnotateStep';
import { MultiImageAnnotateStep } from './workflow/MultiImageAnnotateStep';
import { AnalyzingStep } from './workflow/AnalyzingStep';
import { ResultsStep } from './workflow/ResultsStep';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useAuth } from '@/hooks/useAuth';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { AnalysisStudioLayout } from './studio/AnalysisStudioLayout';
import { FigmaUploadLayout } from './figma/FigmaUploadLayout';
import { SimplifiedContextInput } from './workflow/components/SimplifiedContextInput';
import { TabBasedResultsLayout } from './workflow/components/TabBasedResultsLayout';
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
  
  // Check for Figma UI feature flag
  const figmaUIEnabled = useFeatureFlag('figma-inspired-ui');
  const urlParams = new URLSearchParams(window.location.search);
  const figmaMode = urlParams.get('figma') === 'true';
  
  console.log('🎨 AnalysisWorkflow Figma Check:', { 
    figmaUIEnabled, 
    figmaMode, 
    currentStep: workflow.currentStep,
    currentURL: window.location.href 
  });

  if (!user) {
    return null;
  }

  // Use enhanced upload layout for upload step when feature flag is enabled
  if ((figmaUIEnabled || figmaMode) && workflow.currentStep === 'upload') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full space-y-6">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold">Start Your UX Analysis</h1>
              <p className="text-muted-foreground text-lg">
                Upload your design images and provide context to get AI-powered insights
              </p>
            </div>
            
            {/* Integrated Chat for Context */}
            <div className="bg-background border rounded-lg p-6">
              <SimplifiedContextInput 
                analysisContext={workflow.analysisContext}
                onAnalysisContextChange={workflow.setAnalysisContext}
                onAnalyze={async () => {
                  if (workflow.selectedImages.length > 0 && workflow.analysisContext.trim()) {
                    workflow.goToStep('analyzing');
                  }
                }}
                canAnalyze={workflow.selectedImages.length > 0 && workflow.analysisContext.trim().length > 0}
                isAnalyzing={workflow.isAnalyzing}
                uploadedImageCount={workflow.selectedImages.length}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use Figma layout for annotate step when feature flag is enabled
  if ((figmaUIEnabled || figmaMode) && workflow.currentStep === 'annotate') {
    console.log('✅ Using Figma Upload Layout for step:', workflow.currentStep);
    return <FigmaUploadLayout workflow={workflow} />;
  }

  // For upload and annotate steps, use the studio layout (only when Figma is NOT enabled)
  if ((workflow.currentStep === 'upload' || workflow.currentStep === 'annotate') && !(figmaUIEnabled || figmaMode)) {
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
        // Use tab-based layout for results when feature flag is enabled  
        if ((figmaUIEnabled || figmaMode) && workflow.analysisResults) {
          return (
            <TabBasedResultsLayout
              analysisData={workflow.analysisResults}
              strategistAnalysis={workflow.consultationResults}
              userChallenge={workflow.analysisContext}
            />
          );
        }
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
    <div className="h-full">
      {renderCurrentStep()}
    </div>
  );
};
