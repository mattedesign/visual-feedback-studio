
import { Badge } from '@/components/ui/badge';
import { Annotation } from '@/types/analysis';

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
      {isMultiImage && (
        <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 mb-6">
          <h4 className="font-bold text-lg mb-3 text-gray-900">Current Image Summary</h4>
          <div className="grid grid-cols-1 gap-3 text-base">
            <div className="text-gray-800">AI Insights: <span className="font-bold text-purple-700 text-lg">{currentImageAIAnnotations.length}</span></div>
            <div className="text-gray-800">Your Comments: <span className="font-bold text-green-700 text-lg">{currentImageUserAnnotations.length}</span></div>
          </div>
        </div>
      )}

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

      {activeAnnotation && (
        <div className="bg-gray-100 border-2 border-gray-300 p-5 rounded-lg">
          <h4 className="font-bold text-lg mb-3 text-gray-900">Detailed Feedback</h4>
          {(() => {
            const annotation = aiAnnotations.find(a => a.id === activeAnnotation);
            return annotation ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
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
                <p className="text-base text-gray-800 leading-relaxed font-medium">{annotation.feedback}</p>
                <div className="flex gap-6 text-sm text-gray-600 font-semibold">
                  <span>Implementation: {annotation.implementationEffort}</span>
                  <span>Business Impact: {annotation.businessImpact}</span>
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
};
