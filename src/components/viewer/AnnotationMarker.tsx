
import { Annotation } from '@/types/analysis';

interface AnnotationMarkerProps {
  annotation: Annotation;
  isActive: boolean;
  onClick: () => void;
  zoom: number;
  annotationIndex?: number;
}

export const AnnotationMarker = ({ 
  annotation, 
  isActive, 
  onClick, 
  zoom, 
  annotationIndex = 0 
}: AnnotationMarkerProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 border-red-400';
      case 'suggested': return 'bg-yellow-500 border-yellow-400';
      case 'enhancement': return 'bg-blue-500 border-blue-400';
      default: return 'bg-purple-500 border-purple-400';
    }
  };

  const handleClick = () => {
    console.log('🎯 AnnotationMarker clicked:', { annotationId: annotation.id, annotationIndex });
    onClick();
    
    // Scroll to corresponding detail in right panel
    setTimeout(() => {
      const detailElement = document.getElementById(`detail-${annotation.id}`);
      if (detailElement) {
        detailElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
  };

  // Debug logging
  console.log('🔢 AnnotationMarker rendering:', {
    annotationId: annotation.id,
    annotationIndex,
    displayNumber: annotationIndex + 1,
    category: annotation.category
  });

  return (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
        isActive ? 'scale-110 z-20' : 'z-10 hover:scale-105'
      }`}
      style={{
        left: `${annotation.x}%`,
        top: `${annotation.y}%`,
      }}
      onClick={handleClick}
    >
      {/* Pulsing ring effect for active annotations */}
      {isActive && (
        <div className="absolute inset-0 w-8 h-8 rounded-full border-4 border-blue-400 animate-ping opacity-75"></div>
      )}
      
      <div
        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-white font-bold text-sm shadow-lg transition-all duration-300 ${getSeverityColor(
          annotation.severity
        )} ${isActive ? 'ring-4 ring-blue-400 ring-offset-2' : ''}`}
      >
        {/* Sequential number - FORCED display */}
        <span className="text-xs font-bold leading-none" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          {annotationIndex + 1}
        </span>
      </div>
      
      {/* Active state tooltip */}
      {isActive && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap animate-fade-in">
          Detail #{annotationIndex + 1}
        </div>
      )}
      
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
