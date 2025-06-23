
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
  return (
    <div className="relative bg-white rounded-lg p-6 border-2 border-gray-300">
      <img
        src={imageUrl}
        alt="Analyzed design"
        className="w-full h-auto rounded"
      />
      
      {/* User annotations (blue) */}
      {userAnnotations.map((annotation) => (
        <div
          key={annotation.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
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
            activeAnnotation === annotation.id ? 'scale-110 z-20' : 'z-10 hover:scale-105'
          }`}
          style={{
            left: `${annotation.x}%`,
            top: `${annotation.y}%`,
          }}
          onClick={() => onAnnotationClick(annotation.id)}
        >
          <div className={`w-12 h-12 rounded-full border-4 border-white flex items-center justify-center text-white font-bold text-lg shadow-xl ${
            annotation.severity === 'critical' ? 'bg-red-600' :
            annotation.severity === 'suggested' ? 'bg-yellow-600' :
            annotation.severity === 'enhancement' ? 'bg-blue-600' :
            'bg-purple-600'
          } ${activeAnnotation === annotation.id ? 'ring-4 ring-gray-400' : ''}`}>
            <span className="text-base">{getCategoryIcon(annotation.category)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
