
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Annotation } from '@/types/analysis';

interface EnhancedImageTabsViewerProps {
  images: string[];
  activeImageUrl: string;
  onImageChange: (imageUrl: string) => void;
  getAnnotationsForImage: (imageIndex: number) => Annotation[];
  getUserAnnotationsForImage: (imageUrl: string) => any[];
  onAnnotationClick: (id: string) => void;
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

export const EnhancedImageTabsViewer = ({
  images,
  activeImageUrl,
  onImageChange,
  getAnnotationsForImage,
  getUserAnnotationsForImage,
  onAnnotationClick,
  activeAnnotation,
  getCategoryIcon
}: EnhancedImageTabsViewerProps) => {
  const [selectedTab, setSelectedTab] = useState(activeImageUrl);

  useEffect(() => {
    if (activeImageUrl !== selectedTab) {
      setSelectedTab(activeImageUrl);
    }
  }, [activeImageUrl, selectedTab]);

  // 🔧 FIXED: Get current image index and annotations with enhanced validation
  const currentImageIndex = images.indexOf(activeImageUrl);
  const safeCurrentImageIndex = currentImageIndex >= 0 ? currentImageIndex : 0;
  
  // 🔧 CRITICAL FIX: Ensure we only get annotations for the current image
  const currentImageAnnotations = getAnnotationsForImage(safeCurrentImageIndex);
  
  // 🔧 ENHANCED DEBUG: More detailed logging for correlation tracking
  console.log('🔧 ENHANCED IMAGE TABS VIEWER - CORRELATION CHECK:', {
    currentImageIndex: safeCurrentImageIndex,
    activeImageUrl: activeImageUrl.substring(activeImageUrl.length - 30),
    totalImages: images.length,
    currentImageAnnotationsCount: currentImageAnnotations.length,
    annotationCorrelation: currentImageAnnotations.map(a => ({
      id: a.id,
      annotationImageIndex: a.imageIndex,
      matchesCurrentImage: a.imageIndex === safeCurrentImageIndex,
      feedback: a.feedback?.substring(0, 40) + '...'
    })),
    allAnnotationsForAllImages: images.map((_, index) => ({
      imageIndex: index,
      annotationCount: getAnnotationsForImage(index).length
    }))
  });

  // 🔧 VALIDATION: Ensure all rendered annotations belong to current image
  const validatedAnnotations = currentImageAnnotations.filter(annotation => {
    const annotationImageIndex = annotation.imageIndex ?? 0;
    const isValid = annotationImageIndex === safeCurrentImageIndex;
    
    if (!isValid) {
      console.warn('🔴 CORRELATION ERROR: Annotation does not belong to current image:', {
        annotationId: annotation.id,
        annotationImageIndex,
        currentImageIndex: safeCurrentImageIndex,
        shouldNotRender: true
      });
    }
    
    return isValid;
  });

  console.log('🔧 VALIDATION RESULTS:', {
    originalCount: currentImageAnnotations.length,
    validatedCount: validatedAnnotations.length,
    filteredOut: currentImageAnnotations.length - validatedAnnotations.length
  });

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Image Analysis</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Image tabs */}
        <div className="flex border-b border-slate-600 bg-slate-800/30">
          {images.map((imageUrl, index) => {
            const annotationCount = getAnnotationsForImage(index).length;
            const userAnnotationCount = getUserAnnotationsForImage(imageUrl).length;
            const isActive = imageUrl === activeImageUrl;
            
            return (
              <button
                key={`tab-${index}`}
                onClick={() => onImageChange(imageUrl)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  isActive
                    ? 'border-blue-500 text-blue-300 bg-blue-500/10'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <span>Image {index + 1}</span>
                {annotationCount > 0 && (
                  <Badge variant="secondary" className="text-xs bg-blue-600 text-white">
                    {annotationCount} AI
                  </Badge>
                )}
                {userAnnotationCount > 0 && (
                  <Badge variant="outline" className="text-xs border-green-500 text-green-300">
                    {userAnnotationCount} User
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Active image viewer */}
        <div className="relative">
          <img
            src={activeImageUrl}
            alt={`Design ${safeCurrentImageIndex + 1}`}
            className="w-full h-auto max-h-[70vh] object-contain bg-white rounded-b-lg"
            style={{ minHeight: '400px' }}
          />
          
          {/* 🔧 CRITICAL FIX: Only render validated annotations for current image */}
          {validatedAnnotations.map((annotation, annotationIndex) => {
            console.log(`🔧 RENDERING VALIDATED ANNOTATION ${annotationIndex + 1} for image ${safeCurrentImageIndex + 1}:`, {
              id: annotation.id,
              imageIndex: annotation.imageIndex,
              x: annotation.x,
              y: annotation.y,
              isCorrectImage: annotation.imageIndex === safeCurrentImageIndex
            });
            
            return (
              <div
                key={`annotation-${annotation.id}-${safeCurrentImageIndex}`}
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
              </div>
            );
          })}
          
          {/* User annotations */}
          {getUserAnnotationsForImage(activeImageUrl).map((annotation, index) => (
            <div
              key={`user-annotation-${annotation.id}`}
              className="absolute w-6 h-6 rounded-full bg-green-500 border-2 border-white shadow-lg flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10"
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
