import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Annotation } from '@/types/analysis';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface EnhancedImageTabsViewerProps {
  images: string[];
  activeImageUrl: string;
  onImageChange: (imageUrl: string) => void;
  aiAnnotations: Annotation[];
  userAnnotations: { [imageUrl: string]: Array<{ x: number; y: number; comment: string; id: string }> };
  activeAnnotation: string | null;
  onAnnotationClick: (annotationId: string) => void;
  isMobile?: boolean;
}

export const EnhancedImageTabsViewer: React.FC<EnhancedImageTabsViewerProps> = ({
  images,
  activeImageUrl,
  onImageChange,
  aiAnnotations,
  userAnnotations,
  activeAnnotation,
  onAnnotationClick,
  isMobile = false
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // FIXED: Enhanced annotation filtering with proper imageIndex validation
  const getAnnotationsForImage = (imageIndex: number) => {
    const filteredAnnotations = aiAnnotations.filter(annotation => {
      // CRITICAL FIX: Ensure imageIndex is properly set and compared
      const annotationImageIndex = annotation.imageIndex ?? 0;
      const matches = annotationImageIndex === imageIndex;
      
      // Enhanced debugging for development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Enhanced Annotation Filter Check:', {
          annotationId: annotation.id,
          annotationImageIndex,
          requestedImageIndex: imageIndex,
          matches,
          hasValidImageIndex: annotation.imageIndex !== undefined,
          feedback: annotation.feedback?.substring(0, 50) + '...'
        });
      }
      
      return matches;
    });
    
    console.log(`📊 Image ${imageIndex + 1} annotations:`, {
      totalAnnotations: aiAnnotations.length,
      filteredCount: filteredAnnotations.length,
      imageIndex
    });
    
    return filteredAnnotations;
  };

  const getUserAnnotationsForImage = (imageUrl: string) => {
    return userAnnotations[imageUrl] || [];
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'suggested': return 'bg-yellow-600';
      case 'enhancement': return 'bg-blue-600';
      default: return 'bg-purple-600';
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleResetView = () => {
    setZoom(1);
    setRotation(0);
  };

  const activeImageIndex = images.indexOf(activeImageUrl);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex-shrink-0 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">
            Visual Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetView}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-6 overflow-hidden">
        <Tabs value={activeImageUrl} onValueChange={onImageChange} className="flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6 flex-shrink-0">
            {images.map((imageUrl, index) => {
              const currentImageAiAnnotations = getAnnotationsForImage(index);
              const currentImageUserAnnotations = getUserAnnotationsForImage(imageUrl);
              const totalAnnotations = currentImageAiAnnotations.length + currentImageUserAnnotations.length;
              
              return (
                <TabsTrigger key={imageUrl} value={imageUrl} className="relative">
                  Image {index + 1}
                  {totalAnnotations > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {totalAnnotations}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {images.map((imageUrl, index) => {
            // FIXED: Proper annotation filtering for current image
            const currentImageIndex = index;
            const currentImageAiAnnotations = getAnnotationsForImage(currentImageIndex);
            const currentImageUserAnnotations = getUserAnnotationsForImage(imageUrl);

            return (
              <TabsContent key={imageUrl} value={imageUrl} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 flex items-center justify-center overflow-hidden relative">
                  <div 
                    className="relative overflow-auto max-w-full max-h-full"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transformOrigin: 'center',
                      transition: 'transform 0.2s ease-in-out'
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={`Analysis Image ${index + 1}`}
                      className="rounded-lg shadow-sm border border-gray-200 dark:border-slate-600 object-contain"
                      style={{ 
                        maxHeight: isMobile ? '50vh' : '70vh',
                        maxWidth: '100%'
                      }}
                      onError={(e) => {
                        console.error('Image failed to load:', imageUrl);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    
                    {/* User annotations (blue markers) */}
                    {currentImageUserAnnotations.map((annotation, userIndex) => (
                      <div
                        key={`user-${annotation.id}`}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                        style={{
                          left: `${annotation.x}%`,
                          top: `${annotation.y}%`,
                        }}
                        title={annotation.comment}
                      >
                        <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-blue-600 border-4 border-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform`}>
                          <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-white font-bold`}>U</span>
                        </div>
                      </div>
                    ))}

                    {/* FIXED: AI annotations with proper sequential numbering per image */}
                    {currentImageAiAnnotations.map((annotation, annotationIndex) => {
                      // Generate unique key with imageIndex for proper React reconciliation
                      const uniqueKey = `${annotation.id}-img${currentImageIndex}-${annotationIndex}`;
                      const isActive = activeAnnotation === annotation.id;
                      
                      return (
                        <div
                          key={uniqueKey}
                          className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                            isActive ? 'scale-110 z-20' : 'z-10 hover:scale-105'
                          }`}
                          style={{
                            left: `${annotation.x}%`,
                            top: `${annotation.y}%`,
                          }}
                          onClick={() => onAnnotationClick(annotation.id)}
                        >
                          {/* Pulsing ring effect for active annotations */}
                          {isActive && (
                            <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-blue-400 animate-ping opacity-75"></div>
                          )}
                          
                          <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-full border-4 border-white flex items-center justify-center text-white font-bold text-lg shadow-xl ${getSeverityColor(annotation.severity)} ${
                            isActive ? 'ring-4 ring-gray-400' : ''
                          }`}>
                            {/* FIXED: Sequential numbering starts at 1 for each image */}
                            <span className={`${isMobile ? 'text-sm' : 'text-base'} font-bold annotation-marker-number`}>
                              {annotationIndex + 1}
                            </span>
                          </div>
                          
                          {/* Enhanced popup with more details - Hidden on mobile */}
                          {isActive && !isMobile && (
                            <div className="absolute top-14 left-1/2 transform -translate-x-1/2 w-80 bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 rounded-lg p-4 shadow-xl z-30">
                              <div className="flex items-center gap-2 mb-3">
                                <div className={`w-3 h-3 rounded-full ${getSeverityColor(annotation.severity)}`}></div>
                                <Badge className={`${getSeverityColor(annotation.severity)} text-white font-bold`}>
                                  {annotation.severity?.toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className="capitalize font-medium">
                                  {annotation.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed mb-3 whitespace-pre-wrap">
                                {annotation.feedback}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mb-2">
                                <span><strong>Effort:</strong> {annotation.implementationEffort || 'Unknown'}</span>
                                <span><strong>Impact:</strong> {annotation.businessImpact || 'Unknown'}</span>
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

                {/* FIXED: Enhanced Summary for current image */}
                <div className={`mt-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg ${isMobile ? 'text-sm' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Image {currentImageIndex + 1} Summary
                    </h4>
                    <div className="flex items-center gap-2">
                      {currentImageAiAnnotations.length > 0 && (
                        <Badge variant="secondary">
                          {currentImageAiAnnotations.length} AI insights
                        </Badge>
                      )}
                      {currentImageUserAnnotations.length > 0 && (
                        <Badge variant="outline">
                          {currentImageUserAnnotations.length} user notes
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {currentImageAiAnnotations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        <div className="font-bold text-red-700 dark:text-red-300">
                          {currentImageAiAnnotations.filter(a => a.severity === 'critical').length}
                        </div>
                        <div className="text-red-600 dark:text-red-400">Critical</div>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                        <div className="font-bold text-yellow-700 dark:text-yellow-300">
                          {currentImageAiAnnotations.filter(a => a.severity === 'suggested').length}
                        </div>
                        <div className="text-yellow-600 dark:text-yellow-400">Suggested</div>
                      </div>
                      <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <div className="font-bold text-blue-700 dark:text-blue-300">
                          {currentImageAiAnnotations.filter(a => a.severity === 'enhancement').length}
                        </div>
                        <div className="text-blue-600 dark:text-blue-400">Enhancement</div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-2">
                      No AI insights available for this image
                    </p>
                  )}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
};