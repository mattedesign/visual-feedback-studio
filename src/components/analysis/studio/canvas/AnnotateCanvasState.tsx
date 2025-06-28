
import { AnnotateStep } from '@/components/analysis/workflow/AnnotateStep';
import { MultiImageAnnotateStep } from '@/components/analysis/workflow/MultiImageAnnotateStep';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';

interface AnnotateCanvasStateProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const AnnotateCanvasState = ({ workflow }: AnnotateCanvasStateProps) => {
  return (
    <div className="h-full overflow-auto">
      {workflow.selectedImages.length > 1 ? (
        <MultiImageAnnotateStep workflow={workflow} />
      ) : (
        <AnnotateStep workflow={workflow} />
      )}
    </div>
  );
};
