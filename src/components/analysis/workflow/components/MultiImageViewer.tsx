import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Annotation } from '@/types/analysis';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MultiImageViewerProps {
  images: string[];
  currentImageIndex: number;
  userAnnotations: any[];
  aiAnnotations: Annotation[];
  onAnnotationClick: (id: string) => void;
  onImageChange: (index: number) => void;
  activeAnnotation: string | null;
  getCategoryIcon: (category: string) => string;
}

const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case 'critical':
      return { bg: 'bg-red-500', border: 'border-red-300' };
    case 'suggested':
      return { bg: 'bg-yellow-500', border: 'border-yellow-300' };
    case 'enhancement':
      return { bg: 'bg-blue-500', border: 'border-blue-300' };
    default:
      return { bg: 'bg-purple-500', border: 'border-purple-300' };
  }
};

export const MultiImageViewer = ({
  images,
  currentImageIndex,
  userAnnotations,
  aiAnnotations,
  onAnnotationClick,
  onImageChange,
  activeAnnotation,
  getCategoryIcon
}: MultiImageViewerProps) => {
  // ✅ CRITICAL FIX: Filter AI annotations for the current image only
  const currentImageAiAnnotations = aiAnnotations.filter(annotation => {
    const annotationImageIndex = annotation.imageIndex ?? 0;
    return annotationImageIndex === currentImageIndex;
  });

  // ✅ Filter user annotations for current image
  const currentImageUserAnnotations = userAnnotations.filter(annotation => {
    return annotation.imageIndex === currentImageIndex || 
           (annotation.imageIndex === undefined && currentImageIndex === 0);
  });

  console.log('🔧 MULTI IMAGE VIEWER - ANNOTATION CORRELATION:', {
    currentImageIndex,
    totalAiAnnotations: aiAnnotations.length,
    currentImageAiAnnotations: currentImageAiAnnotations.length,
    totalUserAnnotations: userAnnotations.length,
    currentImageUserAnnotations: currentImageUserAnnotations.length,
    imageUrl: images[currentImageIndex]?.substring(images[currentImageIndex].length - 30),
    annotationDistribution: aiAnnotations.reduce((acc, ann) => {
      const idx = ann.imageIndex ?? 0;
      acc[idx] = (acc[idx] || 0) + 1;
      return acc;
    }, {} as Record<number, number>)
  });

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      onImageChange(currentImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (currentImageIndex < images.length - 1) {
      onImageChange(currentImageIndex + 1);
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Design Analysis</span>
          {images.length > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevImage}
                disabled={currentImageIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-slate-400">
                {currentImageIndex + 1} of {images.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextImage}
                disabled={currentImageIndex === images.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={images[currentImageIndex]}
            alt={`Design analysis ${currentImageIndex + 1}`}
            className="w-full h-auto max-h-[70vh] object-contain bg-white rounded-b-lg"
            style={{ minHeight: '400px' }}
          />
          
          {/* ✅ FIXED: Only render AI annotations for current image */}
          {currentImageAiAnnotations.map((annotation, annotationIndex) => {
            console.log(`🔧 MULTI IMAGE - RENDERING AI ANNOTATION ${annotationIndex + 1}:`, {
              id: annotation.id,
              imageIndex: annotation.imageIndex,
              currentImageIndex,
              x: annotation.x,
              y: annotation.y
            });
            
            return (
              <div
                key={`ai-annotation-${annotation.id}`}
                className={`absolute w-8 h-8 rounded-full border-2 shadow-lg flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 z-10 ${
                  activeAnnotation === annotation.id
                    ? 'bg-blue-500 border-blue-300 scale-125 ring-4 ring-blue-200'
                    : getSeverityStyles(annotation.severity).bg + ' ' + getSeverityStyles(annotation.severity).border + ' hover:scale-110'
                }`}
                style={{
                  left: `${annotation.x}%`,
                  top: `${annotation.y}%`
                }}
                onClick={() => onAnnotationClick(annotation.id)}
                title={annotation.feedback}
              >
                <span className="text-white text-xs font-bold leading-none">
                  {annotationIndex + 1}
                </span>
                
                {/* Show annotation details on hover/click */}
                {activeAnnotation === annotation.id && (
                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-80 bg-white border-2 border-gray-300 rounded-lg p-4 shadow-xl z-30">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`w-3 h-3 rounded-full ${getSeverityStyles(annotation.severity).bg.split(' ')[0]}`}></span>
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
          })}
          
          {/* ✅ FIXED: Only render user annotations for current image */}
          {currentImageUserAnnotations.map((annotation, index) => (
            <div
              key={`user-annotation-${annotation.id}`}
              className="absolute w-6 h-6 rounded-full bg-green-500 border-2 border-white shadow-lg flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10 hover:scale-110 transition-transform"
              style={{
                left: `${annotation.x}%`,
                top: `${annotation.y}%`
              }}
              title={annotation.comment}
            >
              <span className="text-white text-xs font-bold">U</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};