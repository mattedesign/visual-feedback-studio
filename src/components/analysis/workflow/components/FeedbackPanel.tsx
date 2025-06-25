
import { Annotation } from '@/types/analysis';
import { CurrentImageSummary } from './CurrentImageSummary';
import { OverallAnalysisSummary } from './OverallAnalysisSummary';
import { CategorySummaries } from './CategorySummaries';
import { PrioritySummary } from './PrioritySummary';
import { DetailedAnnotationsList } from './DetailedAnnotationsList';
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
      {/* Analysis Summary Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
          📊 Analysis Summary
        </h2>
        
        <OverallAnalysisSummary 
          annotations={aiAnnotations}
          isMultiImage={isMultiImage}
          imageCount={isMultiImage ? Math.max(...aiAnnotations.map(a => (a.imageIndex ?? 0) + 1)) : 1}
        />
        
        <CategorySummaries annotations={aiAnnotations} />
        
        <PrioritySummary annotations={aiAnnotations} />
      </div>

      {/* Current Image Summary (for multi-image) */}
      {isMultiImage && (
        <CurrentImageSummary
          currentImageAIAnnotations={currentImageAIAnnotations}
          currentImageUserAnnotations={currentImageUserAnnotations}
          isMultiImage={isMultiImage}
        />
      )}

      {/* Individual Comments Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
          💬 Individual Comments
        </h2>
        
        <DetailedAnnotationsList
          annotations={isMultiImage ? currentImageAIAnnotations : aiAnnotations}
          activeAnnotation={activeAnnotation}
          onAnnotationClick={onAnnotationClick}
          getSeverityColor={getSeverityColor}
          isMultiImage={isMultiImage}
        />
      </div>

      {/* Selected Annotation Details */}
      <DetailedFeedbackCard
        activeAnnotation={activeAnnotation}
        aiAnnotations={aiAnnotations}
        isMultiImage={isMultiImage}
        getSeverityColor={getSeverityColor}
      />
    </div>
  );
};
