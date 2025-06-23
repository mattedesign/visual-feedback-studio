
import { Annotation } from '@/types/analysis';
import { CurrentImageSummary } from './CurrentImageSummary';
import { AIInsightsList } from './AIInsightsList';
import { DetailedFeedbackCard } from './DetailedFeedbackCard';

interface FeedbackPanelProps {
  currentImageAIAnnotations: Annotation[];
  currentImageUserAnnotations: Array<{
    x: number;
    y: number;
    comment: string;
    id: string;
  }>;
  activeImageIndex: number;
  isMultiImage: boolean;
  activeAnnotation: string | null;
  onAnnotationClick: (annotationId: string) => void;
  aiAnnotations: Annotation[];
  getSeverityColor: (severity: string) => string;
}

export const FeedbackPanel = ({
  currentImageAIAnnotations,
  currentImageUserAnnotations,
  activeImageIndex,
  isMultiImage,
  activeAnnotation,
  onAnnotationClick,
  aiAnnotations,
  getSeverityColor,
}: FeedbackPanelProps) => {
  return (
    <div className="space-y-6">
      <CurrentImageSummary
        currentImageAIAnnotations={currentImageAIAnnotations}
        currentImageUserAnnotations={currentImageUserAnnotations}
        isMultiImage={isMultiImage}
      />

      <AIInsightsList
        currentImageAIAnnotations={currentImageAIAnnotations}
        activeImageIndex={activeImageIndex}
        isMultiImage={isMultiImage}
        activeAnnotation={activeAnnotation}
        onAnnotationClick={onAnnotationClick}
        getSeverityColor={getSeverityColor}
      />

      <DetailedFeedbackCard
        activeAnnotation={activeAnnotation}
        aiAnnotations={aiAnnotations}
        isMultiImage={isMultiImage}
        getSeverityColor={getSeverityColor}
      />
    </div>
  );
};
