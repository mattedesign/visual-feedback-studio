import { Badge } from '@/components/ui/badge';
import { Annotation } from '@/types/analysis';

interface AIInsightsListProps {
  currentImageAIAnnotations: Annotation[];
  activeImageIndex: number;
  isMultiImage: boolean;
  activeAnnotation: string | null;
  onAnnotationClick: (annotationId: string) => void;
  getSeverityColor: (severity: string) => string;
}

export const AIInsightsList = ({
  currentImageAIAnnotations,
  activeImageIndex,
  isMultiImage,
  activeAnnotation,
  onAnnotationClick,
  getSeverityColor,
}: AIInsightsListProps) => {
  // This component is now replaced by DetailedAnnotationsList
  // Keeping it for backward compatibility but it's essentially a wrapper
  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-gray-900">
        AI Insights for Image {activeImageIndex + 1} ({currentImageAIAnnotations.length})
      </h3>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {currentImageAIAnnotations.map((annotation) => (
          <div
            key={annotation.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
              activeAnnotation === annotation.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 bg-white'
            }`}
            onClick={() => onAnnotationClick(annotation.id)}
          >
            <div className="flex items-center gap-3 mb-3">
              <Badge className={`text-sm font-semibold px-3 py-1 ${getSeverityColor(annotation.severity)}`}>
                {annotation.severity.toUpperCase()}
              </Badge>
              <span className="text-base font-semibold capitalize text-gray-700">{annotation.category}</span>
              {isMultiImage && (
                <Badge variant="outline" className="text-sm font-semibold border-gray-400 text-gray-700">
                  Image {(annotation.imageIndex ?? 0) + 1}
                </Badge>
              )}
            </div>
            <p className="text-base text-gray-800 leading-relaxed line-clamp-3 font-medium">
              {annotation.feedback}
            </p>
            <div className="flex gap-4 mt-3 text-sm text-gray-600 font-semibold">
              <span>Effort: {annotation.implementationEffort}</span>
              <span>Impact: {annotation.businessImpact}</span>
            </div>
          </div>
        ))}
        
        {currentImageAIAnnotations.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <p className="text-lg">No AI insights for this image</p>
          </div>
        )}
      </div>
    </div>
  );
};
