
import { DesignViewer } from '@/components/viewer/DesignViewer';
import { FeedbackPanel } from '@/components/feedback/FeedbackPanel';
import { Annotation } from '@/types/analysis';

interface AnalysisLayoutProps {
  imageUrl: string;
  annotations: Annotation[];
  onAreaClick: (coordinates: { x: number; y: number }) => void;
  onAnalyzeClick: () => void;
  isAnalyzing: boolean;
  activeAnnotation: string | null;
  onAnnotationClick: (id: string) => void;
  onNewAnalysis: () => void;
  onDeleteAnnotation?: (id: string) => void;
}

export const AnalysisLayout = ({
  imageUrl,
  annotations,
  onAreaClick,
  onAnalyzeClick,
  isAnalyzing,
  activeAnnotation,
  onAnnotationClick,
  onNewAnalysis,
  onDeleteAnnotation,
}: AnalysisLayoutProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      <div className="lg:col-span-2">
        <DesignViewer
          imageUrl={imageUrl}
          annotations={annotations}
          onAreaClick={onAreaClick}
          onAnalyzeClick={onAnalyzeClick}
          isAnalyzing={isAnalyzing}
          activeAnnotation={activeAnnotation}
          onAnnotationClick={onAnnotationClick}
        />
      </div>
      <div className="lg:col-span-1">
        <FeedbackPanel
          annotations={annotations}
          activeAnnotation={activeAnnotation}
          onAnnotationSelect={onAnnotationClick}
          onNewAnalysis={onNewAnalysis}
          onDeleteAnnotation={onDeleteAnnotation}
        />
      </div>
    </div>
  );
};
