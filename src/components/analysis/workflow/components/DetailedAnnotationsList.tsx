
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
  
  // 🔍 DETAILED ANNOTATIONS LIST DEBUG
  console.log('📝 DETAILED ANNOTATIONS LIST - COMPREHENSIVE DEBUG:', {
    componentName: 'DetailedAnnotationsList',
    annotationsReceived: annotations.length,
    annotationsData: annotations.map((annotation, index) => ({
      index: index + 1,
      id: annotation.id,
      feedback: annotation.feedback,
      feedbackType: typeof annotation.feedback,
      feedbackLength: annotation.feedback?.length || 0,
      feedbackPreview: annotation.feedback?.substring(0, 100) + '...',
      feedbackIsEmpty: !annotation.feedback || annotation.feedback.trim() === '',
      feedbackIsGeneric: annotation.feedback?.startsWith('Analysis insight'),
      category: annotation.category,
      severity: annotation.severity,
      allAnnotationProperties: Object.keys(annotation)
    })),
    activeAnnotation,
    isMultiImage
  });

  if (annotations.length === 0) {
    console.log('⚠️ DETAILED ANNOTATIONS LIST - NO ANNOTATIONS TO DISPLAY');
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No insights available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {annotations.map((annotation, index) => {
        // 🔍 DEBUG: Individual annotation processing
        console.log(`📝 PROCESSING ANNOTATION ${index + 1}:`, {
          id: annotation.id,
          feedback: annotation.feedback,
          feedbackLength: annotation.feedback?.length || 0,
          feedbackIsValid: !!(annotation.feedback && annotation.feedback.trim()),
          category: annotation.category,
          severity: annotation.severity
        });

        // ✅ ROBUST FEEDBACK EXTRACTION
        const feedbackContent = annotation.feedback || 'No feedback available';
        const isValidFeedback = feedbackContent && feedbackContent.trim() !== '' && feedbackContent !== 'No feedback available';

        console.log(`✅ FINAL FEEDBACK FOR ANNOTATION ${index + 1}:`, {
          feedbackContent,
          isValidFeedback,
          contentLength: feedbackContent.length
        });

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
                  {isValidFeedback ? (
                    <span className="font-medium">{feedbackContent}</span>
                  ) : (
                    <span className="text-gray-500 italic">
                      Feedback content is being processed... Please check the console for details.
                    </span>
                  )}
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
