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
import { FigmaAnnotateLayout } from './workflow/FigmaAnnotateLayout';
import { DiagnosticDebugMode } from './DiagnosticDebugMode';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { analysisSessionService } from '@/services/analysisSessionService';

export const AnalysisWorkflow = () => {
  // ✅ STREAMLINED: All hooks moved to top
  const { user } = useAuth();
  const workflow = useAnalysisWorkflow();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  
  // ✅ STREAMLINED: Always use enhanced Figma UI - no feature flag checks needed
  const urlParams = new URLSearchParams(window.location.search);
  const debugMode = urlParams.get('debug') === 'true';
  const [showDiagnostics, setShowDiagnostics] = useState(debugMode);
  
  // ✅ STREAMLINED: Route detection for proper state management
  const isOnMainAnalysisPage = window.location.pathname === '/analysis';
  const isOnResultsPage = window.location.pathname.includes('/analysis/') && 
                          window.location.pathname !== '/analysis';

  // ✅ STREAMLINED: Reset workflow and session if on main analysis page with cached results
  useEffect(() => {
    if (isOnMainAnalysisPage && workflow.analysisResults) {
      console.log('🔄 On main analysis page with cached results - clearing state and session');
      workflow.resetWorkflow();
      analysisSessionService.resetSession();
    }
  }, [isOnMainAnalysisPage, workflow.analysisResults]);
  
  console.log('🎨 AnalysisWorkflow - Always Enhanced Mode:', { 
    currentStep: workflow.currentStep,
    currentURL: window.location.href 
  });

  // ✅ STREAMLINED: Early return if no user
  if (!user) {
    return null;
  }

  // ✅ STREAMLINED: Always use Figma-inspired interface for upload step
  if (workflow.currentStep === 'upload') {
    return <CenteredAnalysisInterface workflow={workflow} />;
  }

  // ✅ STREAMLINED: Always use Figma-inspired annotation layout
  if (workflow.currentStep === 'annotate') {
    console.log('✅ Using Figma-inspired annotation layout for step:', workflow.currentStep);
    return <FigmaAnnotateLayout workflow={workflow} />;
  }

  const renderCurrentStep = () => {
    switch (workflow.currentStep) {
      case 'review':
        return <ReviewStep workflow={workflow} />;
      case 'analyzing':
        return <AnalyzingStep workflow={workflow} />;
      case 'results':
        // ✅ STREAMLINED: Always use enhanced results layout when on results route
        const isOnResultsRoute = window.location.pathname.includes('/analysis/') && 
                                 window.location.pathname !== '/analysis';
        
        // ✅ STREAMLINED: Always use tab-based layout for results when on results route
        if (workflow.analysisResults && isOnResultsRoute) {
          return (
            <TabBasedResultsLayout
              analysisData={workflow.analysisResults}
              strategistAnalysis={null}
              userChallenge={workflow.analysisContext}
            />
          );
        }
        
        // ✅ STREAMLINED: Reset to upload if on main page with cached results
        if (!isOnResultsRoute && workflow.analysisResults) {
          console.log('🔄 On main analysis page with cached results - resetting to upload');
          workflow.resetWorkflow();
          return null; // Let it re-render with clean state
        }
        
        return <ResultsStep workflow={workflow} />;
      default:
        // ✅ STREAMLINED: Fallback to studio layout for any unhandled cases
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
