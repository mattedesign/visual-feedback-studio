
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const activeImageIndex = images.indexOf(activeImageUrl);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'suggested': return 'bg-yellow-600';
      case 'enhancement': return 'bg-blue-600';
      default: return 'bg-purple-600';
    }
  };

  const handleAnnotationClick = (annotationId: string, annotationIndex: number) => {
    console.log('🎯 Image Annotation clicked:', { annotationId, annotationIndex });
    onAnnotationClick(annotationId);
    
    // Scroll to corresponding detail in right panel
    setTimeout(() => {
      const detailElement = document.getElementById(`detail-${annotationId}`);
      if (detailElement) {
        detailElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
  };

  return (
    <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 h-full">
      <CardContent className="p-6 h-full flex flex-col">
        <Tabs value={activeImageUrl} onValueChange={onImageChange} className="flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6 flex-shrink-0">
            {images.map((imageUrl, index) => {
              const aiAnnotations = getAnnotationsForImage(index);
              const userAnnotations = getUserAnnotationsForImage(imageUrl);
              
              return (
                <TabsTrigger key={imageUrl} value={imageUrl} className="relative">
                  Image {index + 1}
                  {(aiAnnotations.length > 0 || userAnnotations.length > 0) && (
                    <Badge 
                      variant="secondary" 
                      className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {aiAnnotations.length + userAnnotations.length}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {images.map((imageUrl, index) => {
            // Filter annotations specifically for this image index
            const currentImageIndex = index;
            const aiAnnotations = getAnnotationsForImage(currentImageIndex);
            const userAnnotations = getUserAnnotationsForImage(imageUrl);

            console.log(`🔍 ImageTabsViewer - Image ${index + 1} annotations:`, {
              imageIndex: currentImageIndex,
              aiAnnotationsCount: aiAnnotations.length,
              userAnnotationsCount: userAnnotations.length,
              aiAnnotationDetails: aiAnnotations.map(a => ({
                id: a.id,
                imageIndex: a.imageIndex,
                category: a.category
              }))
            });

            return (
              <TabsContent key={imageUrl} value={imageUrl} className="mt-0 flex-1 flex flex-col">
                <div className="flex-1 flex items-center justify-center mb-4">
                  <div className="relative w-full">
                    <img
                      src={imageUrl}
                      alt={`Analysis Image ${index + 1}`}
                      className="w-full h-auto rounded-lg shadow-sm border border-gray-200 dark:border-slate-600 object-contain"
                      style={{ maxHeight: '70vh' }}
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

                    {/* AI annotations with sequential numbering - FILTERED BY IMAGE INDEX */}
                    {aiAnnotations.map((annotation, annotationIndex) => {
                      const isActive = activeAnnotation === annotation.id;
                      const feedbackContent = annotation.feedback || 'No feedback available';

                      return (
                        <div
                          key={annotation.id || `ai-${annotationIndex}`}
                          className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                            isActive ? 'scale-110 z-20' : 'z-10 hover:scale-105'
                          }`}
                          style={{
                            left: `${annotation.x}%`,
                            top: `${annotation.y}%`,
                          }}
                          onClick={() => handleAnnotationClick(annotation.id, annotationIndex)}
                        >
                          {/* Pulsing ring effect for active annotations */}
                          {isActive && (
                            <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-blue-400 animate-ping opacity-75"></div>
                          )}
                          
                          <div className={`w-12 h-12 rounded-full border-4 border-white flex items-center justify-center text-white font-bold text-lg shadow-xl transition-all duration-300 ${getSeverityColor(annotation.severity)} ${
                            isActive ? 'ring-4 ring-blue-400 ring-offset-2' : ''
                          }`}>
                            {/* Sequential number for this specific image */}
                            <span className="text-base font-bold annotation-marker-number">{annotationIndex + 1}</span>
                          </div>
                          
                          {/* Active state tooltip */}
                          {isActive && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap animate-fade-in">
                              Detail #{annotationIndex + 1}
                            </div>
                          )}
                          
                          {/* Content overlay when clicked */}
                          {isActive && (
                            <div className="absolute top-14 left-1/2 transform -translate-x-1/2 w-80 bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 rounded-lg p-4 shadow-xl z-30">
                              <div className="flex items-center gap-2 mb-3">
                                <div className={`w-3 h-3 rounded-full ${getSeverityColor(annotation.severity)}`}></div>
                                <span className="text-sm font-semibold capitalize text-gray-900 dark:text-white">
                                  {annotation.severity} • {annotation.category}
                                </span>
                              </div>
                              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed mb-3 whitespace-pre-wrap">
                                {feedbackContent}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                <span>Effort: {annotation.implementationEffort || 'Unknown'}</span>
                                <span>Impact: {annotation.businessImpact || 'Unknown'}</span>
                              </div>
                              
                              {/* Arrow pointing to annotation */}
                              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white dark:bg-slate-800 border-l-2 border-t-2 border-gray-300 dark:border-slate-600 rotate-45"></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Summary for this image */}
                <div className="flex-shrink-0 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Image {index + 1} Summary
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{aiAnnotations.length} AI insights</span>
                    <span>{userAnnotations.length} user annotations</span>
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
};
