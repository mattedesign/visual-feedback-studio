
import { UploadStep } from './workflow/UploadStep';
import { ReviewStep } from './workflow/ReviewStep';
import { AnnotateStep } from './workflow/AnnotateStep';
import { MultiImageAnnotateStep } from './workflow/MultiImageAnnotateStep';
import { AnalyzingStep } from './workflow/AnalyzingStep';
import { ResultsStep } from './workflow/ResultsStep';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useAuth } from '@/hooks/useAuth';

export const AnalysisWorkflow = () => {
  // 🔄 LOOP DETECTION: Track component renders
  console.log('🔄 COMPONENT RENDER:', new Date().toISOString(), {
    componentName: 'AnalysisWorkflow',
    renderCount: ++((window as any).analysisWorkflowRenderCount) || ((window as any).analysisWorkflowRenderCount = 1)
  });

  const { user } = useAuth();
  const workflow = useAnalysisWorkflow();

  if (!user) {
    return null;
  }

  const renderCurrentStep = () => {
    switch (workflow.currentStep) {
      case 'upload':
        return <UploadStep workflow={workflow} />;
      case 'review':
        return <ReviewStep workflow={workflow} />;
      case 'annotate':
        // Use MultiImageAnnotateStep for multiple images, regular AnnotateStep for single image
        return workflow.selectedImages.length > 1 
          ? <MultiImageAnnotateStep workflow={workflow} />
          : <AnnotateStep workflow={workflow} />;
      case 'analyzing':
        return <AnalyzingStep workflow={workflow} />;
      case 'results':
        return <ResultsStep workflow={workflow} />;
      default:
        return <UploadStep workflow={workflow} />;
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
