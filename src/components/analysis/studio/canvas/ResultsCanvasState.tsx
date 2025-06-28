
import { ResultsStep } from '@/components/analysis/workflow/ResultsStep';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';

interface ResultsCanvasStateProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const ResultsCanvasState = ({ workflow }: ResultsCanvasStateProps) => {
  return (
    <div className="h-full overflow-auto">
      <ResultsStep workflow={workflow} />
    </div>
  );
};
