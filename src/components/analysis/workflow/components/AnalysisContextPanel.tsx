
import { EnhancedAnalysisContextPanel } from './EnhancedAnalysisContextPanel';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';

interface AnalysisContextPanelProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
  showAsExpanded?: boolean;
  showAsCard?: boolean;
  className?: string;
}

export const AnalysisContextPanel = ({ 
  workflow, 
  showAsExpanded = false, 
  showAsCard = true,
  className = ""
}: AnalysisContextPanelProps) => {
  return (
    <EnhancedAnalysisContextPanel
      analysisContext={workflow.analysisContext}
      onAnalysisContextChange={workflow.setAnalysisContext}
      uploadedImageCount={workflow.selectedImages.length}
      showAsExpanded={showAsExpanded}
      showAsCard={showAsCard}
      className={className}
    />
  );
};
