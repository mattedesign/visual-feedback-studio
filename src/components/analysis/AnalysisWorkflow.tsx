
import { UploadStep } from './workflow/UploadStep';
import { ReviewStep } from './workflow/ReviewStep';
import { AnnotateStep } from './workflow/AnnotateStep';
import { MultiImageAnnotateStep } from './workflow/MultiImageAnnotateStep';
import { AnalyzingStep } from './workflow/AnalyzingStep';
import { ResultsStep } from './workflow/ResultsStep';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useAuth } from '@/hooks/useAuth';

export const AnalysisWorkflow = () => {
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
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {['upload', 'review', 'annotate', 'analyzing', 'results'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    workflow.currentStep === step
                      ? 'bg-blue-500 text-white'
                      : index < ['upload', 'review', 'annotate', 'analyzing', 'results'].indexOf(workflow.currentStep)
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {index + 1}
                </div>
                {index < 4 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      index < ['upload', 'review', 'annotate', 'analyzing', 'results'].indexOf(workflow.currentStep)
                        ? 'bg-green-500'
                        : 'bg-slate-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center space-x-16 mt-2">
            <span className="text-xs text-slate-200">Upload</span>
            <span className="text-xs text-slate-200">Review</span>
            <span className="text-xs text-slate-200">
              {workflow.selectedImages.length > 1 ? 'Multi-Annotate' : 'Annotate'}
            </span>
            <span className="text-xs text-slate-200">Analyzing</span>
            <span className="text-xs text-slate-200">Results</span>
          </div>
        </div>

        {renderCurrentStep()}
      </div>
    </div>
  );
};
