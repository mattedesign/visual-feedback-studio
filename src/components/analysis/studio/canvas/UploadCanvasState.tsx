
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { FeatureCards } from './FeatureCards';

interface UploadCanvasStateProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const UploadCanvasState = ({
  workflow
}: UploadCanvasStateProps) => {
  return <div className="flex items-center justify-center h-full bg-transparent">
      <div className="w-full max-w-6xl px-8">
        {/* Feature Cards */}
        <FeatureCards />
      </div>
    </div>;
};
