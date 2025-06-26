
import { Annotation } from '@/types/analysis';

interface AnnotationMarkerProps {
  annotation: Annotation;
  isActive: boolean;
  onClick: () => void;
  zoom: number;
}

export const AnnotationMarker = ({ annotation, isActive, onClick, zoom }: AnnotationMarkerProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 border-red-400';
      case 'suggested': return 'bg-yellow-500 border-yellow-400';
      case 'enhancement': return 'bg-blue-500 border-blue-400';
      default: return 'bg-purple-500 border-purple-400';
    }
  };

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

  return (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
        isActive ? 'scale-110 z-20' : 'z-10 hover:scale-105'
      }`}
      style={{
        left: `${annotation.x}%`,
        top: `${annotation.y}%`,
      }}
      onClick={onClick}
    >
      <div
        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-white font-bold text-sm shadow-lg ${getSeverityColor(
          annotation.severity
        )} ${isActive ? 'ring-4 ring-white/30' : ''}`}
      >
        <span className="text-xs">{getCategoryIcon(annotation.category)}</span>
      </div>
      
      {/* Content overlay when active */}
      {isActive && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-80 bg-white border-2 border-gray-300 rounded-lg p-4 shadow-xl z-30">
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-3 h-3 rounded-full ${getSeverityColor(annotation.severity).split(' ')[0]}`}></span>
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
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l-2 border-t-2 border-gray-300 rotate-45"></div>
        </div>
      )}
    </div>
  );
};
