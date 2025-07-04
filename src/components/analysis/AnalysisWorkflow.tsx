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
import { FigmaInspiredUploadInterface } from './workflow/components/FigmaInspiredUploadInterface';
import { CenteredAnalysisInterface } from './figma/CenteredAnalysisInterface';
import { DiagnosticDebugMode } from './DiagnosticDebugMode';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { analysisSessionService } from '@/services/analysisSessionService';

export const AnalysisWorkflow = () => {
  // 🔄 LOOP DETECTION: Track component renders
  console.log('🔄 COMPONENT RENDER:', new Date().toISOString(), {
    componentName: 'AnalysisWorkflow',
    renderCount: ++((window as any).analysisWorkflowRenderCount) || ((window as any).analysisWorkflowRenderCount = 1)
  });

  // ✅ FIXED: Move ALL hooks to the top before any conditional returns
  const { user } = useAuth();
  const workflow = useAnalysisWorkflow();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  
  // Check for Figma UI feature flag
  const figmaUIEnabled = useFeatureFlag('figma-inspired-ui');
  const urlParams = new URLSearchParams(window.location.search);
  const figmaMode = urlParams.get('figma') === 'true';
  
  // ✅ FIXED: Diagnostic debug mode - always initialize properly
  const debugMode = urlParams.get('debug') === 'true';
  const [showDiagnostics, setShowDiagnostics] = useState(debugMode);
  
  // ✅ FIXED: Check if we're on the main analysis page vs results page
  const isOnMainAnalysisPage = window.location.pathname === '/analysis';
  const isOnResultsPage = window.location.pathname.includes('/analysis/') && 
                          window.location.pathname !== '/analysis';

  // ✅ FIXED: Reset workflow and analysis session if we're on main analysis page but have cached results
  useEffect(() => {
    if (isOnMainAnalysisPage && workflow.analysisResults) {
      console.log('🔄 On main analysis page with cached results - clearing state and session');
      workflow.resetWorkflow();
      analysisSessionService.resetSession();
    }
  }, [isOnMainAnalysisPage, workflow.analysisResults]);
  
  // ✅ FIXED: Debug panel state management
  console.log('🔍 DEBUG PANEL STATE:', {
    debugMode,
    showDiagnostics,
    urlDebug: urlParams.get('debug'),
    shouldShowPanel: debugMode || showDiagnostics
  });
  
  console.log('🎨 AnalysisWorkflow Figma Check:', { 
    figmaUIEnabled, 
    figmaMode, 
    currentStep: workflow.currentStep,
    currentURL: window.location.href 
  });

  // ✅ FIXED: Now safe to return early after all hooks are called
  if (!user) {
    return null;
  }

  // Use centered interface for upload step when feature flag is enabled
  if ((figmaUIEnabled || figmaMode) && workflow.currentStep === 'upload') {
    return <CenteredAnalysisInterface workflow={workflow} />;
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
        // ✅ FIXED: Only show results when we're on a results route with an ID
        const isOnResultsRoute = window.location.pathname.includes('/analysis/') && 
                                 window.location.pathname !== '/analysis';
        
        // Use tab-based layout for results when feature flag is enabled AND we're on a results route
        if ((figmaUIEnabled || figmaMode) && workflow.analysisResults && isOnResultsRoute) {
          return (
            <TabBasedResultsLayout
              analysisData={workflow.analysisResults}
              strategistAnalysis={null}
              userChallenge={workflow.analysisContext}
            />
          );
        }
        
        // ✅ FIXED: If we're on the main analysis page but have results, reset to upload
        if (!isOnResultsRoute && workflow.analysisResults) {
          console.log('🔄 On main analysis page with cached results - resetting to upload');
          workflow.resetWorkflow();
          return null; // Let it re-render with clean state
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
      {/* ✅ FIXED: Always show debug panel when enabled */}
      {(debugMode || showDiagnostics) && (
        <div className="fixed top-4 right-4 z-50 w-96 max-h-96 overflow-auto bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border">
          <DiagnosticDebugMode
            images={workflow.selectedImages}
            analysisPrompt={workflow.analysisContext}
            analysisId={workflow.currentAnalysis?.id}
            onDiagnosticsComplete={(canProceed) => {
              console.log('🔍 Diagnostics completed, can proceed:', canProceed);
            }}
          />
        </div>
      )}
      
      {/* ✅ FIXED: Always show debug toggle button */}
      <Button
        onClick={() => setShowDiagnostics(!showDiagnostics)}
        variant="ghost"
        size="sm"
        className="fixed bottom-4 left-4 z-50 opacity-60 hover:opacity-100 bg-white/80 backdrop-blur-sm border shadow-sm"
      >
        {showDiagnostics ? '🔍 Hide Debug' : '🔍 Debug'}
      </Button>
      
      {renderCurrentStep()}
    </div>
  );
};
