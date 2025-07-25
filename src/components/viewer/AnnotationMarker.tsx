
import { Annotation, getAnnotationTitle, getAnnotationDescription } from '@/types/analysis';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

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
  const useSeparatedFields = useFeatureFlag('separated-annotation-fields');
  
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

  // Get title and description for display
  const title = useSeparatedFields ? getAnnotationTitle(annotation) : annotation.feedback;
  const description = useSeparatedFields ? getAnnotationDescription(annotation) : null;
  const displayText = useSeparatedFields && description ? description : annotation.feedback;

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
      title={useSeparatedFields ? title : annotation.feedback}
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
        <span className="text-xs font-bold leading-none annotation-marker-number" data-annotation-number={annotationIndex + 1}>
          {annotationIndex + 1}
        </span>
      </div>
      
      {/* Active state tooltip with title */}
      {isActive && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap animate-fade-in">
          {useSeparatedFields ? title : `Detail #${annotationIndex + 1}`}
        </div>
      )}
      
      {/* Enhanced content overlay when active */}
      {isActive && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-80 bg-white border-2 border-gray-300 rounded-lg p-4 shadow-xl z-30">
          <div className="annotation-content">
            {/* Problem Statement */}
            <h4 className="font-semibold text-red-600 mb-2">
              🚨 {annotation.problemStatement || annotation.description || annotation.feedback}
            </h4>
            
            {/* Solution Statement */}
            {(annotation.solutionStatement || (useSeparatedFields && description && description !== (annotation.problemStatement || annotation.description))) && (
              <p className="text-green-600 mt-2 mb-3">
                ✅ {annotation.solutionStatement || (useSeparatedFields ? description : annotation.feedback)}
              </p>
            )}
            
            {/* Metadata */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-3 h-3 rounded-full ${getSeverityColor(annotation.severity).split(' ')[0]}`}></span>
              <span className="text-xs text-gray-500">
                {annotation.severity} • {annotation.category}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>Effort: {annotation.implementationEffort}</span>
              <span>Impact: {annotation.businessImpact}</span>
            </div>
          </div>
          
          {/* Arrow pointing to annotation */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l-2 border-t-2 border-gray-300 rotate-45"></div>
        </div>
      )}
    </div>
  );
};
