
import { AnalyzingStep } from '@/components/analysis/workflow/AnalyzingStep';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';

interface AnalyzingCanvasStateProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const AnalyzingCanvasState = ({ workflow }: AnalyzingCanvasStateProps) => {
  return (
    <div className="h-full overflow-auto">
      <AnalyzingStep workflow={workflow} />
    </div>
  );
};
