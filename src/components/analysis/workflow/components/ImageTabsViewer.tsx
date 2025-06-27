
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Annotation } from '@/types/analysis';

interface ImageTabsViewerProps {
  images: string[];
  activeImageUrl: string;
  onImageChange: (imageUrl: string) => void;
  getAnnotationsForImage: (imageIndex: number) => Annotation[];
  getUserAnnotationsForImage: (imageUrl: string) => Array<{
    x: number;
    y: number;
    comment: string;
    id: string;
  }>;
  onAnnotationClick: (annotationId: string) => void;
  activeAnnotation: string | null;
  getCategoryIcon: (category: string) => string;
}

export const ImageTabsViewer = ({
  images,
  activeImageUrl,
  onImageChange,
  getAnnotationsForImage,
  getUserAnnotationsForImage,
  onAnnotationClick,
  activeAnnotation,
  getCategoryIcon,
}: ImageTabsViewerProps) => {
  const [hoveredAnnotation, setHoveredAnnotation] = useState<string | null>(null);
  const [clickedAnnotation, setClickedAnnotation] = useState<string | null>(null);

  const handleAnnotationClick = (annotationId: string, imageIndex: number) => {
    setClickedAnnotation(annotationId);
    onAnnotationClick(annotationId);
    
    // Clear the clicked indicator after 2 seconds
    setTimeout(() => {
      setClickedAnnotation(null);
    }, 2000);
  };

  return (
    <div className="relative">
      <Tabs value={activeImageUrl} onValueChange={onImageChange}>
        <TabsList className="grid w-full mb-6 h-12" style={{ gridTemplateColumns: `repeat(${images.length}, 1fr)` }}>
          {images.map((imageUrl, index) => {
            const imageAnnotations = getAnnotationsForImage(index);
            
            // 🔍 DEBUG: Enhanced annotation logging for ImageTabsViewer
            console.log('🔍 ImageTabsViewer - Annotation Debug for Tab:', {
              imageIndex: index,
              imageUrl: imageUrl,
              requestedImageIndex: index,
              annotationsForThisImage: imageAnnotations.length,
              annotationDetails: imageAnnotations.map(ann => ({
                id: ann.id,
                imageIndex: ann.imageIndex,
                x: ann.x,
                y: ann.y,
                category: ann.category,
                severity: ann.severity,
                feedback: ann.feedback.substring(0, 50) + '...'
              }))
            });
            
            return (
              <TabsTrigger key={imageUrl} value={imageUrl} className="relative text-base font-semibold py-3">
                Image {index + 1}
                {imageAnnotations.length > 0 && (
                  <Badge className="ml-3 h-6 w-6 p-0 text-sm rounded-full bg-blue-600 text-white">
                    {imageAnnotations.length}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {images.map((imageUrl, imageIndex) => (
          <TabsContent key={imageUrl} value={imageUrl}>
            <div className="relative bg-white rounded-lg p-6 border-2 border-gray-300">
              <img
                src={imageUrl}
                alt={`Analyzed design ${imageIndex + 1}`}
                className="w-full h-auto rounded"
              />
              
              {/* User annotations (blue) for this image */}
              {getUserAnnotationsForImage(imageUrl).map((annotation) => (
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

              {/* AI annotations for this specific image */}
              {getAnnotationsForImage(imageIndex).map((annotation) => {
                // 🔍 DEBUG: Log each annotation being rendered
                console.log('🔍 ImageTabsViewer - Rendering AI Annotation:', {
                  annotationId: annotation.id,
                  expectedImageIndex: imageIndex,
                  actualImageIndex: annotation.imageIndex,
                  x: annotation.x,
                  y: annotation.y,
                  category: annotation.category,
                  severity: annotation.severity,
                  isCorrectImage: (annotation.imageIndex ?? 0) === imageIndex
                });
                
                return (
                  <div
                    key={annotation.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                      activeAnnotation === annotation.id ? 'scale-110 z-20' : 'z-10 hover:scale-105'
                    }`}
                    style={{
                      left: `${annotation.x}%`,
                      top: `${annotation.y}%`,
                    }}
                    onMouseEnter={() => setHoveredAnnotation(annotation.id)}
                    onMouseLeave={() => setHoveredAnnotation(null)}
                    onClick={() => handleAnnotationClick(annotation.id, imageIndex)}
                  >
                    <div className={`w-12 h-12 rounded-full border-4 border-white flex items-center justify-center text-white font-bold text-lg shadow-xl ${
                      annotation.severity === 'critical' ? 'bg-red-600' :
                      annotation.severity === 'suggested' ? 'bg-yellow-600' :
                      annotation.severity === 'enhancement' ? 'bg-blue-600' :
                      'bg-purple-600'
                    } ${activeAnnotation === annotation.id ? 'ring-4 ring-gray-400' : ''}`}>
                      <span className="text-base">{getCategoryIcon(annotation.category)}</span>
                    </div>

                    {/* Hover Indicator */}
                    {hoveredAnnotation === annotation.id && (
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-30 animate-fade-in">
                        <Badge className="bg-blue-600 text-white border-blue-500 text-sm px-3 py-1">
                          📍 From Image {imageIndex + 1}
                        </Badge>
                      </div>
                    )}

                    {/* Click Indicator */}
                    {clickedAnnotation === annotation.id && (
                      <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-30 animate-fade-in">
                        <Badge className="bg-green-600 text-white border-green-500 text-sm px-3 py-1">
                          Viewing insight from Image {imageIndex + 1}
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
