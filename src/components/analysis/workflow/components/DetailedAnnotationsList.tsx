
import { Badge } from '@/components/ui/badge';
import { Annotation } from '@/types/analysis';

interface DetailedAnnotationsListProps {
  annotations: Annotation[];
  activeAnnotation: string | null;
  onAnnotationClick: (annotationId: string) => void;
  getSeverityColor: (severity: string) => string;
  isMultiImage: boolean;
}

export const DetailedAnnotationsList = ({
  annotations,
  activeAnnotation,
  onAnnotationClick,
  getSeverityColor,
  isMultiImage,
}: DetailedAnnotationsListProps) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ux': return '👤';
      case 'visual': return '🎨';
      case 'accessibility': return '♿';
      case 'conversion': return '📈';
      case 'brand': return '🏷️';
      default: return '💡';
    }
  };

  if (!annotations || annotations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg">No feedback available</p>
        <p className="text-sm mt-2">Analysis may still be processing or no issues were found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {annotations.map((annotation, index) => (
        <div
          key={annotation.id}
          className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
            activeAnnotation === annotation.id
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
          onClick={() => onAnnotationClick(annotation.id)}
        >
          {/* Header with badges and icon */}
          <div className="flex items-start gap-3 mb-3">
            <span className="text-xl flex-shrink-0 mt-1">
              {getCategoryIcon(annotation.category)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className={`text-xs font-semibold ${getSeverityColor(annotation.severity)}`}>
                  {annotation.severity.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize border-gray-300 text-gray-700">
                  {annotation.category}
                </Badge>
                {isMultiImage && annotation.imageIndex !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    Image {annotation.imageIndex + 1}
                  </Badge>
                )}
              </div>
              
              {/* Feedback content */}
              <div className="mb-3">
                <p className="text-sm text-gray-800 leading-relaxed font-medium">
                  {annotation.feedback || 'No specific feedback provided for this annotation.'}
                </p>
              </div>
              
              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex gap-4">
                  <span className="font-medium">
                    Effort: <span className="capitalize">{annotation.implementationEffort || 'Not specified'}</span>
                  </span>
                  <span className="font-medium">
                    Impact: <span className="capitalize">{annotation.businessImpact || 'Not specified'}</span>
                  </span>
                </div>
                <span className="text-gray-400">
                  #{index + 1}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
        <p className="text-xs text-gray-600 text-center">
          💡 Click on any annotation above to see detailed information, or click on the image markers to focus on specific areas.
        </p>
      </div>
    </div>
  );
};
