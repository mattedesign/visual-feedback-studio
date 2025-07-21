import { lazy, Suspense } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useAuth } from '@/hooks/useAuth';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { CenteredAnalysisInterface } from './figma/CenteredAnalysisInterface';
import { DiagnosticDebugMode } from './DiagnosticDebugMode';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { analysisSessionService } from '@/services/analysisSessionService';

// Lazy load heavy workflow components
const ReviewStep = lazy(() => import('./workflow/ReviewStep').then(m => ({ default: m.ReviewStep })));
const AnnotateStep = lazy(() => import('./workflow/AnnotateStep').then(m => ({ default: m.AnnotateStep })));
const MultiImageAnnotateStep = lazy(() => import('./workflow/MultiImageAnnotateStep').then(m => ({ default: m.MultiImageAnnotateStep })));
const AnalyzingStep = lazy(() => import('./workflow/AnalyzingStep').then(m => ({ default: m.AnalyzingStep })));
const ResultsStep = lazy(() => import('./workflow/ResultsStep').then(m => ({ default: m.ResultsStep })));
const AnalysisStudioLayout = lazy(() => import('./studio/AnalysisStudioLayout').then(m => ({ default: m.AnalysisStudioLayout })));
const FigmaUploadLayout = lazy(() => import('./figma/FigmaUploadLayout').then(m => ({ default: m.FigmaUploadLayout })));
const SimplifiedContextInput = lazy(() => import('./workflow/components/SimplifiedContextInput').then(m => ({ default: m.SimplifiedContextInput })));
const TabBasedResultsLayout = lazy(() => import('./workflow/components/TabBasedResultsLayout').then(m => ({ default: m.TabBasedResultsLayout })));
const FigmaInspiredUploadInterface = lazy(() => import('./workflow/components/FigmaInspiredUploadInterface').then(m => ({ default: m.FigmaInspiredUploadInterface })));

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

  // ✅ SIMPLIFIED: Skip annotation step - go directly to analyzing
  if (workflow.currentStep === 'annotate') {
    console.log('✅ Skipping annotation step, going directly to analysis');
    // Automatically proceed to analyzing if we have images and context
    if (workflow.selectedImages.length > 0 && workflow.analysisContext.trim()) {
      workflow.goToStep('analyzing');
    }
    return <CenteredAnalysisInterface workflow={workflow} />;
  }

  const renderCurrentStep = () => {
    const LoadingFallback = () => (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );

    switch (workflow.currentStep) {
      case 'review':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ReviewStep workflow={workflow} />
          </Suspense>
        );
      case 'analyzing':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AnalyzingStep workflow={workflow} />
          </Suspense>
        );
      case 'results':
        // ✅ STREAMLINED: Always use enhanced results layout when on results route
        const isOnResultsRoute = window.location.pathname.includes('/analysis/') && 
                                 window.location.pathname !== '/analysis';
        
        // ✅ STREAMLINED: Always use tab-based layout for results when on results route
        if (workflow.analysisResults && isOnResultsRoute) {
          return (
            <Suspense fallback={<LoadingFallback />}>
              <TabBasedResultsLayout
                analysisData={workflow.analysisResults}
                strategistAnalysis={null}
                userChallenge={workflow.analysisContext}
              />
            </Suspense>
          );
        }
        
        // ✅ STREAMLINED: Reset to upload if on main page with cached results
        if (!isOnResultsRoute && workflow.analysisResults) {
          console.log('🔄 On main analysis page with cached results - resetting to upload');
          workflow.resetWorkflow();
          return null; // Let it re-render with clean state
        }
        
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ResultsStep workflow={workflow} />
          </Suspense>
        );
      default:
        // ✅ STREAMLINED: Fallback to studio layout for any unhandled cases
        return (
          <Suspense fallback={<LoadingFallback />}>
            <AnalysisStudioLayout 
              workflow={workflow}
              sidebarCollapsed={sidebarCollapsed}
              setSidebarCollapsed={setSidebarCollapsed}
              rightPanelCollapsed={rightPanelCollapsed}
              setRightPanelCollapsed={setRightPanelCollapsed}
            />
          </Suspense>
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
