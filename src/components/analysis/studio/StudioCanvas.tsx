
import { UploadCanvasState } from './canvas/UploadCanvasState';
import { ReviewCanvasState } from './canvas/ReviewCanvasState';
import { AnnotateCanvasState } from './canvas/AnnotateCanvasState';
import { AnalyzingCanvasState } from './canvas/AnalyzingCanvasState';
import { ResultsCanvasState } from './canvas/ResultsCanvasState';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';

interface StudioCanvasProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
}

export const StudioCanvas = ({ workflow, selectedDevice }: StudioCanvasProps) => {
  const renderCanvasState = () => {
    switch (workflow.currentStep) {
      case 'upload':
        return <UploadCanvasState workflow={workflow} />;
      case 'review':
        return <ReviewCanvasState workflow={workflow} />;
      case 'annotate':
        return <AnnotateCanvasState workflow={workflow} selectedDevice={selectedDevice} />;
      case 'analyzing':
        return <AnalyzingCanvasState workflow={workflow} />;
      case 'results':
        return <ResultsCanvasState workflow={workflow} selectedDevice={selectedDevice} />;
      default:
        return <UploadCanvasState workflow={workflow} />;
    }
  };

  return (
    <div className="flex-1 bg-slate-800 border-l border-r border-slate-700 overflow-auto">
      {renderCanvasState()}
    </div>
  );
};
