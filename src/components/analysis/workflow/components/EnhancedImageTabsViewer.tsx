import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Annotation } from '@/types/analysis';
import { AlertTriangle, Target, Zap, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

interface EnhancedImageTabsViewerProps {
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

export const EnhancedImageTabsViewer = ({
  images,
  activeImageUrl,
  onImageChange,
  getAnnotationsForImage,
  getUserAnnotationsForImage,
  onAnnotationClick,
  activeAnnotation,
  getCategoryIcon,
}: EnhancedImageTabsViewerProps) => {
  const [showCrossImageComparison, setShowCrossImageComparison] = useState(false);
  const isMobile = useIsMobile();
  
  const activeImageIndex = images.indexOf(activeImageUrl);

  // Set up swipe navigation for mobile
  const swipeRef = useSwipeNavigation({
    onSwipeLeft: () => {
      const nextIndex = Math.min(activeImageIndex + 1, images.length - 1);
      if (nextIndex !== activeImageIndex) {
        onImageChange(images[nextIndex]);
      }
    },
    onSwipeRight: () => {
      const prevIndex = Math.max(activeImageIndex - 1, 0);
      if (prevIndex !== activeImageIndex) {
        onImageChange(images[prevIndex]);
      }
    },
    enabled: isMobile
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'suggested': return 'bg-yellow-600';
      case 'enhancement': return 'bg-blue-600';
      default: return 'bg-purple-600';
    }
  };

  const getTabSeverityIndicator = (imageIndex: number) => {
    const annotations = getAnnotationsForImage(imageIndex);
    const criticalCount = annotations.filter(a => a.severity === 'critical').length;
    const suggestedCount = annotations.filter(a => a.severity === 'suggested').length;
    const enhancementCount = annotations.filter(a => a.severity === 'enhancement').length;

    if (criticalCount > 0) return { color: 'bg-red-500', priority: 'critical' };
    if (suggestedCount > 0) return { color: 'bg-yellow-500', priority: 'suggested' };
    if (enhancementCount > 0) return { color: 'bg-blue-500', priority: 'enhancement' };
    return { color: 'bg-gray-400', priority: 'none' };
  };

  const getAllAnnotations = () => {
    return images.flatMap((_, index) => getAnnotationsForImage(index));
  };

  const getCrossImageInsights = () => {
    const allAnnotations = getAllAnnotations();
    const criticalIssues = allAnnotations.filter(a => a.severity === 'critical');
    const commonCategories = allAnnotations.reduce((acc, annotation) => {
      acc[annotation.category] = (acc[annotation.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalIssues: allAnnotations.length,
      criticalIssues: criticalIssues.length,
      mostCommonCategory: Object.entries(commonCategories).sort(([,a], [,b]) => b - a)[0],
      issuesFoundAcrossAllImages: Object.values(commonCategories).some(count => count === images.length)
    };
  };

  const jumpToCriticalIssue = () => {
    const allAnnotations = getAllAnnotations();
    const criticalAnnotation = allAnnotations.find(a => a.severity === 'critical');
    if (criticalAnnotation) {
      onAnnotationClick(criticalAnnotation.id);
      // Find which image this annotation belongs to
      for (let i = 0; i < images.length; i++) {
        const imageAnnotations = getAnnotationsForImage(i);
        if (imageAnnotations.some(a => a.id === criticalAnnotation.id)) {
          onImageChange(images[i]);
          break;
        }
      }
    }
  };

  const crossImageInsights = getCrossImageInsights();

  return (
    <div className="space-y-6">
      {/* Cross-Image Analysis Summary */}
      <Card className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 border-slate-200 dark:border-slate-600">
        <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2`}>
              📊 Multi-Image Analysis Overview
            </h4>
            <div className="flex gap-2">
              {!isMobile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCrossImageComparison(!showCrossImageComparison)}
                >
                  {showCrossImageComparison ? 'Hide' : 'Show'} Comparison
                </Button>
              )}
              {crossImageInsights.criticalIssues > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={jumpToCriticalIssue}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Target className="w-4 h-4 mr-1" />
                  {isMobile ? 'Critical' : 'Jump to Critical Issue'}
                </Button>
              )}
            </div>
          </div>

          <div className={`grid gap-4 mb-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'}`}>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{crossImageInsights.totalIssues}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Insights</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{crossImageInsights.criticalIssues}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Critical Issues</div>
            </div>
            {!isMobile && (
              <>
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100 capitalize">
                    {crossImageInsights.mostCommonCategory?.[0] || 'N/A'}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Top Category</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{images.length}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Images Analyzed</div>
                </div>
              </>
            )}
          </div>

          {(showCrossImageComparison || isMobile) && (
            <div className="mt-4 p-4 bg-white dark:bg-slate-700 rounded-lg">
              <h5 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Cross-Image Insights</h5>
              <div className="text-sm text-slate-700 dark:text-slate-300">
                {crossImageInsights.issuesFoundAcrossAllImages ? (
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="w-4 h-4" />
                    Similar issues found across all images - systematic pattern detected
                  </div>
                ) : (
                  <div className="text-slate-600 dark:text-slate-400">
                    Issues vary by image - context-specific improvements needed
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Image Tabs with Mobile Optimization */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardContent className={`${isMobile ? 'p-3' : 'p-6'}`}>
          {/* Mobile Navigation Header */}
          {isMobile && (
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const prevIndex = Math.max(activeImageIndex - 1, 0);
                  if (prevIndex !== activeImageIndex) onImageChange(images[prevIndex]);
                }}
                disabled={activeImageIndex === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <div className="text-center">
                <div className="text-sm font-semibold">Image {activeImageIndex + 1} of {images.length}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Swipe to navigate
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const nextIndex = Math.min(activeImageIndex + 1, images.length - 1);
                  if (nextIndex !== activeImageIndex) onImageChange(images[nextIndex]);
                }}
                disabled={activeImageIndex === images.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          <Tabs value={activeImageUrl} onValueChange={onImageChange}>
            {!isMobile && (
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
                {images.map((imageUrl, index) => {
                  const aiAnnotations = getAnnotationsForImage(index);
                  const userAnnotations = getUserAnnotationsForImage(imageUrl);
                  const severityIndicator = getTabSeverityIndicator(index);
                  const totalInsights = aiAnnotations.length + userAnnotations.length;
                  
                  return (
                    <TabsTrigger key={imageUrl} value={imageUrl} className="relative flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        Image {index + 1}
                        {totalInsights > 0 && (
                          <Badge 
                            variant="secondary" 
                            className="h-5 px-2 text-xs font-bold"
                          >
                            {totalInsights} insights
                          </Badge>
                        )}
                      </div>
                      {severityIndicator.priority !== 'none' && (
                        <div className={`w-2 h-2 rounded-full ${severityIndicator.color} absolute top-1 right-1`} />
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            )}

            {images.map((imageUrl, index) => {
              const aiAnnotations = getAnnotationsForImage(index);
              const userAnnotations = getUserAnnotationsForImage(imageUrl);

              return (
                <TabsContent key={imageUrl} value={imageUrl} className="mt-0">
                  <div ref={isMobile ? swipeRef : undefined} className="relative inline-block max-w-full">
                    <img
                      src={imageUrl}
                      alt={`Analysis Image ${index + 1}`}
                      className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200 dark:border-slate-600"
                      style={{ maxHeight: isMobile ? '50vh' : '70vh' }}
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
                        <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-blue-600 border-4 border-white rounded-full flex items-center justify-center shadow-xl`}>
                          <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-white font-bold`}>U</span>
                        </div>
                      </div>
                    ))}

                    {/* AI annotations with sequential numbering */}
                    {aiAnnotations.map((annotation, annotationIndex) => {
                      return (
                        <div
                          key={annotation.id || `ai-${annotationIndex}`}
                          className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                            activeAnnotation === annotation.id ? 'scale-110 z-20' : 'z-10 hover:scale-105'
                          }`}
                          style={{
                            left: `${annotation.x}%`,
                            top: `${annotation.y}%`,
                          }}
                          onClick={() => onAnnotationClick(annotation.id)}
                        >
                          <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-full border-4 border-white flex items-center justify-center text-white font-bold text-lg shadow-xl ${getSeverityColor(annotation.severity)} ${
                            activeAnnotation === annotation.id ? 'ring-4 ring-gray-400' : ''
                          }`}>
                            {/* Sequential number instead of category icon */}
                            <span className={`${isMobile ? 'text-sm' : 'text-base'} font-bold`}>{annotationIndex + 1}</span>
                          </div>
                          
                          {/* Enhanced popup with more details - Hidden on mobile */}
                          {activeAnnotation === annotation.id && !isMobile && (
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

                  {/* Enhanced Summary for this image */}
                  <div className={`mt-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg ${isMobile ? 'p-3' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Image {index + 1} Summary
                      </h4>
                      {index < images.length - 1 && !isMobile && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onImageChange(images[index + 1])}
                          className="text-xs"
                        >
                          Next Image <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                    <div className={`grid gap-4 text-sm ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'}`}>
                      <div className="text-center">
                        <div className="font-bold text-gray-900 dark:text-white">{aiAnnotations.length}</div>
                        <div className="text-gray-600 dark:text-gray-400">AI Insights</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-red-600">
                          {aiAnnotations.filter(a => a.severity === 'critical').length}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">Critical</div>
                      </div>
                      {!isMobile && (
                        <>
                          <div className="text-center">
                            <div className="font-bold text-yellow-600">
                              {aiAnnotations.filter(a => a.severity === 'suggested').length}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">Suggested</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-blue-600">
                              {aiAnnotations.filter(a => a.severity === 'enhancement').length}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">Enhancement</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
