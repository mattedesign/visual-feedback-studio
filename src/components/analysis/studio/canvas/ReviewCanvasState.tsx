
import { ReviewStep } from '@/components/analysis/workflow/ReviewStep';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';

interface ReviewCanvasStateProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const ReviewCanvasState = ({ workflow }: ReviewCanvasStateProps) => {
  return (
    <div className="h-full overflow-auto">
      <ReviewStep workflow={workflow} />
    </div>
  );
};
