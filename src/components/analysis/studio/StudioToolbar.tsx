
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';

interface StudioToolbarProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const StudioToolbar = ({ workflow }: StudioToolbarProps) => {
  const getStepTitle = () => {
    switch (workflow.currentStep) {
      case 'upload': return 'Upload Images';
      case 'review': return 'Review Selection';
      case 'annotate': return 'Add Annotations';
      case 'analyzing': return 'Analyzing Design';
      case 'results': return 'Analysis Results';
      default: return 'Design Analysis';
    }
  };

  return (
    <div className="flex items-center justify-center p-4 bg-slate-700 border-b border-slate-600">
      <h2 className="text-lg font-semibold text-white">
        {getStepTitle()}
      </h2>
    </div>
  );
};
