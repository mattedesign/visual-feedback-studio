
import { UploadCanvasState } from './canvas/UploadCanvasState';
import { ReviewCanvasState } from './canvas/ReviewCanvasState';
import { AnnotateCanvasState } from './canvas/AnnotateCanvasState';
import { AnalyzingCanvasState } from './canvas/AnalyzingCanvasState';
import { ResultsCanvasState } from './canvas/ResultsCanvasState';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';

interface StudioCanvasProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  activeAnnotation?: string | null;
  onAnnotationClick?: (annotationId: string) => void;
}

export const StudioCanvas = ({
  workflow,
  selectedDevice,
  activeAnnotation,
  onAnnotationClick
}: StudioCanvasProps) => {
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
        return <ResultsCanvasState workflow={workflow} selectedDevice={selectedDevice} activeAnnotation={activeAnnotation} onAnnotationClick={onAnnotationClick} />;
      default:
        return <UploadCanvasState workflow={workflow} />;
    }
  };

  return (
    <div className="h-full w-full bg-transparent overflow-auto">
      {renderCanvasState()}
    </div>
  );
};
