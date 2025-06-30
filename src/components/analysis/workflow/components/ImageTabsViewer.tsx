
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

  const handleAnnotationClick = (annotation: Annotation) => {
    console.log('🎯 ImageTabsViewer: Annotation clicked, highlighting insight:', annotation.id);
    onAnnotationClick(annotation.id);
  };

  return (
    <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
      <CardContent className="p-6">
        <Tabs value={activeImageUrl} onValueChange={onImageChange}>
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
            {images.map((imageUrl, index) => {
              const aiAnnotations = getAnnotationsForImage(index);
              const userAnnotations = getUserAnnotationsForImage(imageUrl);
              const isActive = imageUrl === activeImageUrl;
              
              return (
                <TabsTrigger 
                  key={imageUrl} 
                  value={imageUrl} 
                  className={`relative transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300' 
                      : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Image {index + 1}
                  {(aiAnnotations.length > 0 || userAnnotations.length > 0) && (
                    <Badge 
                      variant="secondary" 
                      className={`ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs transition-all duration-200 ${
                        isActive 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 dark:bg-slate-600 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {aiAnnotations.length + userAnnotations.length}
                    </Badge>
                  )}
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {images.map((imageUrl, index) => {
            const aiAnnotations = getAnnotationsForImage(index);
            const userAnnotations = getUserAnnotationsForImage(imageUrl);

            return (
              <TabsContent key={imageUrl} value={imageUrl} className="mt-0">
                <div className="relative inline-block max-w-full">
                  <img
                    src={imageUrl}
                    alt={`Analysis Image ${index + 1}`}
                    className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200 dark:border-slate-600"
                    style={{ maxHeight: '70vh' }}
                  />
                  
                  {/* User annotations (blue) */}
                  {userAnnotations.map((annotation) => (
                    <div
                      key={annotation.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-110"
                      style={{
                        left: `${annotation.x}%`,
                        top: `${annotation.y}%`,
                      }}
                    >
                      <div className="w-10 h-10 bg-blue-600 border-4 border-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl">
                        <span className="text-sm text-white font-bold">U</span>
                      </div>
                    </div>
                  ))}

                  {/* AI annotations with enhanced highlighting */}
                  {aiAnnotations.map((annotation, annotationIndex) => {
                    const isActive = activeAnnotation === annotation.id;
                    const feedbackContent = annotation.feedback || 'No feedback available';

                    return (
                      <div
                        key={annotation.id || `ai-${annotationIndex}`}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ease-in-out ${
                          isActive ? 'scale-125 z-20' : 'z-10 hover:scale-110'
                        }`}
                        style={{
                          left: `${annotation.x}%`,
                          top: `${annotation.y}%`,
                        }}
                        onClick={() => handleAnnotationClick(annotation)}
                      >
                        <div className={`rounded-full border-4 border-white flex items-center justify-center text-white font-bold text-lg shadow-xl transition-all duration-300 ${
                          isActive 
                            ? 'w-14 h-14 bg-blue-600 ring-4 ring-blue-200 dark:ring-blue-700 shadow-2xl animate-pulse' 
                            : `w-12 h-12 ${getSeverityColor(annotation.severity)} hover:shadow-2xl`
                        }`}>
                          <span className={`${isActive ? 'text-lg' : 'text-base'}`}>
                            {getCategoryIcon(annotation.category)}
                          </span>
                          
                          {/* Active indicator */}
                          {isActive && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
                          )}
                        </div>
                        
                        {/* Content overlay when clicked */}
                        {isActive && (
                          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-80 bg-white dark:bg-slate-800 border-2 border-blue-300 dark:border-blue-600 rounded-lg p-4 shadow-2xl z-30 animate-scale-in">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
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
                            
                            {/* Enhanced arrow pointing to annotation */}
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white dark:bg-slate-800 border-l-2 border-t-2 border-blue-300 dark:border-blue-600 rotate-45"></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Enhanced summary for this image */}
                <div className={`mt-4 p-4 rounded-lg border transition-all duration-200 ${
                  imageUrl === activeImageUrl 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
                    : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600'
                }`}>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Image {index + 1} Summary
                    {imageUrl === activeImageUrl && (
                      <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(Active)</span>
                    )}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      {aiAnnotations.length} AI insights
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {userAnnotations.length} user annotations
                    </span>
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
