import { UploadStep } from './workflow/UploadStep';
import { ReviewStep } from './workflow/ReviewStep';
import { AnnotateStep } from './workflow/AnnotateStep';
import { AnalyzingStep } from './workflow/AnalyzingStep';
import { ResultsStep } from './workflow/ResultsStep';
import { TestAnalysisButton } from './TestAnalysisButton';
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
        return <AnnotateStep workflow={workflow} />;
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
        {/* Test button for API verification */}
        <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <h3 className="text-lg font-medium mb-3">API Test</h3>
          <p className="text-slate-400 text-sm mb-4">
            Test the AI analysis functionality to verify your Anthropic API key is working correctly.
          </p>
          <TestAnalysisButton />
        </div>

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
                      : 'bg-slate-700 text-slate-400'
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
            <span className="text-xs text-slate-400">Upload</span>
            <span className="text-xs text-slate-400">Review</span>
            <span className="text-xs text-slate-400">Annotate</span>
            <span className="text-xs text-slate-400">Analyzing</span>
            <span className="text-xs text-slate-400">Results</span>
          </div>
        </div>

        {renderCurrentStep()}
      </div>
    </div>
  );
};
