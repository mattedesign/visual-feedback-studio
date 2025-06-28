
import { Badge } from '@/components/ui/badge';
import { Annotation } from '@/types/analysis';

interface DetailedAnnotationsListProps {
  annotations: Annotation[];
  activeAnnotation: string | null;
  onAnnotationClick: (annotationId: string) => void;
  getSeverityColor: (severity: string) => string;
  isMultiImage?: boolean;
}

export const DetailedAnnotationsList = ({
  annotations,
  activeAnnotation,
  onAnnotationClick,
  getSeverityColor,
  isMultiImage = false,
}: DetailedAnnotationsListProps) => {
  if (annotations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No insights available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {annotations.map((annotation, index) => {
        // 🔍 DEBUG: Log annotation data to see what we're receiving
        console.log(`🔍 DetailedAnnotationsList - Annotation ${index + 1}:`, {
          id: annotation.id,
          feedback: annotation.feedback,
          description: annotation.description,
          title: annotation.title,
          content: annotation.content,
          fullAnnotation: annotation
        });

        // Try to get feedback content from multiple possible properties
        const feedbackContent = annotation.feedback || 
                               annotation.description || 
                               annotation.content || 
                               annotation.title || 
                               'No feedback available';

        return (
          <div
            key={annotation.id || `annotation-${index}`}
            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
              activeAnnotation === annotation.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => onAnnotationClick(annotation.id)}
          >
            <div className="flex items-start space-x-3">
              {/* Annotation Number/Icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${getSeverityColor(annotation.severity).split(' ')[0]}`}>
                {index + 1}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`text-xs font-bold ${getSeverityColor(annotation.severity)}`}>
                    {annotation.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {annotation.category}
                  </Badge>
                  {isMultiImage && annotation.imageIndex !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      Image {annotation.imageIndex + 1}
                    </Badge>
                  )}
                </div>
                
                {/* Feedback Content */}
                <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                  {feedbackContent}
                </div>
                
                {/* Implementation details */}
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-600 dark:text-gray-400">
                  <span>
                    <strong>Effort:</strong> {annotation.implementationEffort || 'Unknown'}
                  </span>
                  <span>
                    <strong>Impact:</strong> {annotation.businessImpact || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
