
import { UploadCanvasState } from './canvas/UploadCanvasState';
import { ReviewCanvasState } from './canvas/ReviewCanvasState';
import { AnnotateCanvasState } from './canvas/AnnotateCanvasState';
import { AnalyzingCanvasState } from './canvas/AnalyzingCanvasState';
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
        // 🚀 BYPASS STRATEGY: Results step now handled by direct routing
        // Users should never see this as they're redirected to ModularAnalysisInterface
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-lg font-semibold mb-2">Redirecting to Results...</h3>
              <p className="text-gray-400">Taking you to the professional dashboard</p>
            </div>
          </div>
        );
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
