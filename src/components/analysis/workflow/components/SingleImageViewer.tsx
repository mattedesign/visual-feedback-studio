
import { Annotation } from '@/types/analysis';

interface SingleImageViewerProps {
  imageUrl: string;
  userAnnotations: Array<{
    x: number;
    y: number;
    comment: string;
    id: string;
  }>;
  aiAnnotations: Annotation[];
  onAnnotationClick: (annotationId: string) => void;
  activeAnnotation: string | null;
  getCategoryIcon: (category: string) => string;
}

export const SingleImageViewer = ({
  imageUrl,
  userAnnotations,
  aiAnnotations,
  onAnnotationClick,
  activeAnnotation,
  getCategoryIcon,
}: SingleImageViewerProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'suggested': return 'bg-yellow-600';
      case 'enhancement': return 'bg-blue-600';
      default: return 'bg-purple-600';
    }
  };

  return (
    <div className="relative bg-white rounded-lg p-6 border-2 border-gray-300">
      {/* Background blur overlay when annotation is active */}
      {activeAnnotation && (
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] rounded-lg z-10 pointer-events-none" />
      )}
      
      <img
        src={imageUrl}
        alt="Analyzed design"
        className="w-full h-auto rounded"
      />
      
      {/* User annotations (blue) */}
      {userAnnotations.map((annotation) => (
        <div
          key={annotation.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
          style={{
            left: `${annotation.x}%`,
            top: `${annotation.y}%`,
          }}
        >
          <div className="w-10 h-10 bg-blue-600 border-4 border-white rounded-full flex items-center justify-center shadow-xl">
            <span className="text-sm text-white font-bold">U</span>
          </div>
        </div>
      ))}

      {/* AI annotations */}
      {aiAnnotations.map((annotation) => (
        <div
          key={annotation.id}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
            activeAnnotation === annotation.id ? 'scale-110 z-30' : 'z-20 hover:scale-105'
          }`}
          style={{
            left: `${annotation.x}%`,
            top: `${annotation.y}%`,
          }}
          onClick={() => onAnnotationClick(annotation.id)}
        >
          <div className={`w-12 h-12 rounded-full border-4 border-white flex items-center justify-center text-white font-bold text-lg shadow-xl ${getSeverityColor(annotation.severity)} ${activeAnnotation === annotation.id ? 'ring-4 ring-white/50 shadow-2xl' : ''}`}>
            <span className="text-base">{getCategoryIcon(annotation.category)}</span>
          </div>
          
          {/* Contextual feedback overlay */}
          {activeAnnotation === annotation.id && (
            <div className="absolute top-14 left-1/2 transform -translate-x-1/2 w-80 bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-lg p-4 shadow-2xl z-40">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${getSeverityColor(annotation.severity)}`}></div>
                <span className="text-sm font-semibold capitalize text-gray-900">
                  {annotation.severity} • {annotation.category}
                </span>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed mb-3 whitespace-pre-wrap">
                {annotation.feedback}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>Effort: {annotation.implementationEffort}</span>
                <span>Impact: {annotation.businessImpact}</span>
              </div>
              
              {/* Arrow pointing to annotation */}
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white/95 border-l-2 border-t-2 border-gray-200 rotate-45"></div>
              
              {/* Connection line */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gray-200"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
