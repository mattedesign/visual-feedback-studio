import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Annotation, getAnnotationTitle, getAnnotationDescription } from '@/types/analysis';
import { MessageSquare, TrendingUp, Eye, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { DetailedFeedbackCard } from './DetailedFeedbackCard';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

interface FeedbackPanelProps {
  currentImageAIAnnotations: Annotation[];
  currentImageUserAnnotations: any[];
  activeImageIndex: number;
  isMultiImage: boolean;
  activeAnnotation: string | null;
  onAnnotationClick: (id: string) => void;
  aiAnnotations: Annotation[];
  getSeverityColor: (severity: string) => string;
  businessImpact?: any;
  insights?: any;
  researchCitations: string[];
}

export const FeedbackPanel = ({
  currentImageAIAnnotations,
  currentImageUserAnnotations,
  activeImageIndex,
  isMultiImage,
  activeAnnotation,
  onAnnotationClick,
  aiAnnotations,
  getSeverityColor,
  businessImpact,
  insights,
  researchCitations
}: FeedbackPanelProps) => {
  const [showAllAnnotations, setShowAllAnnotations] = useState(false);
  const useSeparatedFields = useFeatureFlag('separated-annotation-fields');

  // 🚨 CRITICAL DEBUG: Add debugging for FeedbackPanel data
  useEffect(() => {
    console.log('🚨 FEEDBACK PANEL - CRITICAL DATA DEBUG:', {
      timestamp: new Date().toISOString(),
      component: 'FeedbackPanel',
      receivedData: {
        currentImageAIAnnotationsCount: currentImageAIAnnotations?.length || 0,
        currentImageUserAnnotationsCount: currentImageUserAnnotations?.length || 0,
        activeImageIndex,
        isMultiImage,
        activeAnnotation,
        totalAIAnnotations: aiAnnotations?.length || 0
      },
      annotationQuality: {
        hasValidAnnotations: currentImageAIAnnotations?.length > 0,
        allHaveValidFeedback: currentImageAIAnnotations?.every(a => a.feedback && a.feedback.length > 20),
        allHaveValidCoordinates: currentImageAIAnnotations?.every(a => 
          typeof a.x === 'number' && typeof a.y === 'number' && 
          a.x >= 0 && a.x <= 100 && a.y >= 0 && a.y <= 100
        ),
        avgFeedbackLength: currentImageAIAnnotations?.length > 0 
          ? currentImageAIAnnotations.reduce((sum, a) => sum + (a.feedback?.length || 0), 0) / currentImageAIAnnotations.length 
          : 0
      },
      correlationCheck: {
        annotationsClaimCurrentImage: currentImageAIAnnotations?.map(a => ({
          id: a.id,
          imageIndex: a.imageIndex,
          matchesActiveIndex: a.imageIndex === activeImageIndex,
          feedback: a.feedback?.substring(0, 40) + '...'
        }))
      },
      potentialIssues: {
        noAnnotationsForCurrentImage: (currentImageAIAnnotations?.length || 0) === 0,
        mismatchedImageIndexes: currentImageAIAnnotations?.some(a => a.imageIndex !== activeImageIndex),
        genericFeedback: currentImageAIAnnotations?.some(a => 
          !a.feedback || 
          a.feedback.length < 20 || 
          a.feedback.includes('Analysis insight')
        )
      }
    });
  }, [currentImageAIAnnotations, activeImageIndex, activeAnnotation, isMultiImage]);

  // 🎯 STEP 5: ENHANCED FEEDBACK FILTERING WITH STRICT IMAGE CORRELATION
  const currentImageFeedback = useMemo(() => {
    console.log('🎯 FEEDBACK PANEL - Enhanced Filtering Logic:', {
      inputAnnotationsCount: currentImageAIAnnotations?.length || 0,
      activeImageIndex,
      isMultiImage,
      processingTimestamp: new Date().toISOString()
    });

    if (!currentImageAIAnnotations || currentImageAIAnnotations.length === 0) {
      console.warn('⚠️ No annotations provided to FeedbackPanel');
      return [];
    }
    
    if (!isMultiImage) {
      console.log('📋 Single image: Using all provided annotations:', {
        annotationCount: currentImageAIAnnotations.length
      });
      return currentImageAIAnnotations;
    }
    
    // 🆕 For multi-image, verify annotations are already filtered correctly
    const verified = currentImageAIAnnotations.filter(annotation => {
      const annotationImageIndex = annotation.imageIndex ?? 0;
      const belongsToCurrentImage = annotationImageIndex === activeImageIndex;
      
      if (!belongsToCurrentImage) {
        console.error('🚨 FILTERING ERROR: Annotation does not belong to current image:', {
          annotationId: annotation.id,
          annotationImageIndex,
          activeImageIndex,
          shouldNotBeHere: true
        });
      }
      
      return belongsToCurrentImage;
    });
    
    console.log('🎯 FEEDBACK PANEL - Final verification:', {
      originalCount: currentImageAIAnnotations.length,
      verifiedCount: verified.length,
      allCorrectlyFiltered: verified.length === currentImageAIAnnotations.length,
      activeImageIndex
    });
    
    return verified;
  }, [currentImageAIAnnotations, activeImageIndex, isMultiImage]);

  // 🎯 ENHANCED: Log when component receives new data with better debugging
  useEffect(() => {
    console.log('🎯 ENHANCED FeedbackPanel - Data Update:', {
      activeImageIndex,
      currentImageAIAnnotationsCount: currentImageAIAnnotations.length,
      filteredFeedbackCount: currentImageFeedback.length,
      currentImageUserAnnotationsCount: currentImageUserAnnotations.length,
      isMultiImage,
      activeAnnotation,
      dataQuality: {
        allAnnotationsHaveValidFeedback: currentImageFeedback.every(a => a.feedback && a.feedback.length > 10),
        avgFeedbackLength: currentImageFeedback.length > 0 
          ? currentImageFeedback.reduce((sum, a) => sum + (a.feedback?.length || 0), 0) / currentImageFeedback.length 
          : 0,
        categoriesPresent: [...new Set(currentImageFeedback.map(a => a.category))],
        severityDistribution: {
          critical: currentImageFeedback.filter(a => a.severity === 'critical').length,
          suggested: currentImageFeedback.filter(a => a.severity === 'suggested').length,
          enhancement: currentImageFeedback.filter(a => a.severity === 'enhancement').length
        }
      },
      annotationDetails: currentImageFeedback.map((a, i) => ({
        index: i + 1,
        id: a.id,
        feedback: a.feedback?.substring(0, 50) + '...',
        category: a.category,
        severity: a.severity,
        imageIndex: a.imageIndex
      }))
    });
  }, [currentImageFeedback, activeImageIndex, activeAnnotation, isMultiImage]);

  // 🎯 ENHANCED: Category icon function with content category added
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ux': return '👤';
      case 'visual': return '🎨';
      case 'accessibility': return '♿';
      case 'conversion': return '📈';
      case 'brand': return '🏷️';
      case 'content': return '📝';
      default: return '💡';
    }
  };

  // 🎯 ENHANCED: Calculate totals based on filtered feedback
  const totalAnnotations = currentImageAIAnnotations.length + currentImageUserAnnotations.length;

  return (
    <div className="space-y-4">
      {/* 🚨 DEBUG: Add debugging info to the UI for immediate visibility */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-3">
            <div className="text-xs text-red-300 space-y-1">
              <div>🚨 DEBUG INFO:</div>
              <div>Active Image: {activeImageIndex + 1} | Annotations: {currentImageFeedback.length}</div>
              <div>Multi-image: {isMultiImage ? 'Yes' : 'No'} | Total AI: {aiAnnotations?.length}</div>
              <div>Image Indexes: {currentImageFeedback.map(a => a.imageIndex).join(', ')}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 🎯 ENHANCED: Header with current image information */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" />
              Analysis Panel
            </CardTitle>
            <Badge variant="outline" className="border-blue-500 text-blue-300">
              <MessageSquare className="w-3 h-3 mr-1" />
              {totalAnnotations} insights
            </Badge>
          </div>
          
          {/* 🎯 ENHANCED: Show current image information with better context */}
          <div className="text-sm text-slate-400">
            {isMultiImage ? (
              <div className="flex items-center justify-between">
                <span>Image {activeImageIndex + 1} Analysis</span>
                <span className="text-blue-300">
                  {currentImageFeedback.length} insights for this image
                </span>
              </div>
            ) : (
              <span>Single image analysis • {currentImageFeedback.length} insights found</span>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* 🎯 ENHANCED: Summary stats for current image using filtered feedback */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
              <div className="text-red-400 font-bold text-lg">
                {currentImageFeedback.filter(a => a.severity === 'critical').length}
              </div>
              <div className="text-xs text-red-300">Critical</div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
              <div className="text-yellow-400 font-bold text-lg">
                {currentImageFeedback.filter(a => a.severity === 'suggested').length}
              </div>
              <div className="text-xs text-yellow-300">Suggested</div>  
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
              <div className="text-blue-400 font-bold text-lg">
                {currentImageFeedback.filter(a => a.severity === 'enhancement').length}
              </div>
              <div className="text-xs text-blue-300">Enhance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🎯 ENHANCED: Detailed Feedback Card for active annotation using filtered feedback */}
      <DetailedFeedbackCard
        activeAnnotation={activeAnnotation}
        aiAnnotations={currentImageAIAnnotations} // Use filtered feedback instead of all annotations
        isMultiImage={isMultiImage}
        getSeverityColor={getSeverityColor}
      />

      {/* 🎯 ENHANCED: Annotations List with separated title/description display */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {isMultiImage ? `Image ${activeImageIndex + 1} Insights` : 'Detailed Insights'}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {currentImageAIAnnotations.length}
              </Badge>
              {currentImageAIAnnotations.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllAnnotations(!showAllAnnotations)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  {showAllAnnotations ? (
                    <>
                      <ChevronUp className="w-3 h-3 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3 mr-1" />
                      Show All ({currentImageAIAnnotations.length})
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {currentImageAIAnnotations.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No insights for this image</p>
                  {isMultiImage && (
                    <p className="text-sm">Switch to another image to see analysis</p>
                  )}
                </div>
              ) : (
                (showAllAnnotations ? currentImageAIAnnotations : currentImageAIAnnotations.slice(0, 5)).map((annotation, index) => {
                  // Use new title/description fields with fallback
                  const title = useSeparatedFields ? getAnnotationTitle(annotation) : annotation.feedback;
                  const description = useSeparatedFields ? getAnnotationDescription(annotation) : null;
                  const displayText = useSeparatedFields && description ? description : annotation.feedback;
                  
                  return (
                    <div
                      key={`feedback-${annotation.id}-${activeImageIndex}`}
                      className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                        activeAnnotation === annotation.id
                          ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/20'
                          : 'border-slate-600 hover:border-slate-500 bg-slate-800/30 hover:bg-slate-800/50'
                      }`}
                      onClick={() => onAnnotationClick(annotation.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          {/* NEW: Display title prominently if using separated fields */}
                          {useSeparatedFields && (
                            <h4 className="font-semibold text-slate-200 mb-1 text-sm">
                              {title}
                            </h4>
                          )}
                          
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">
                              {getCategoryIcon(annotation.category)}
                            </span>
                            <Badge className={`text-xs ${getSeverityColor(annotation.severity)}`}>
                              {annotation.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize border-slate-600">
                              {annotation.category}
                            </Badge>
                            {/* Coordinate information for correlation */}
                            {annotation.x !== undefined && annotation.y !== undefined && (
                              <Badge variant="outline" className="text-xs text-slate-400">
                                {annotation.x.toFixed(0)}%, {annotation.y.toFixed(0)}%
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-slate-300 leading-relaxed">
                            {displayText}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                            <span>Effort: {annotation.implementationEffort || 'Medium'}</span>
                            <span>Impact: {annotation.businessImpact || 'Medium'}</span>
                            {isMultiImage && (
                              <span className="text-blue-400">
                                Image {(annotation.imageIndex ?? 0) + 1}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 🎯 ENHANCED: User Annotations Section */}
      {currentImageUserAnnotations.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-400" />
              Your Annotations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentImageUserAnnotations.map((annotation, index) => (
                <div
                  key={`user-${annotation.id}-${activeImageIndex}`}
                  className="border border-green-600/30 rounded-lg p-3 bg-green-500/5"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      U{index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {annotation.comment}
                      </p>
                      <div className="text-xs text-slate-400 mt-1">
                        Position: {annotation.x?.toFixed(1)}%, {annotation.y?.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Impact Summary - only if available */}
      {businessImpact && (
        <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Business Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-300">Potential Revenue:</span>
                <span className="text-green-400 font-semibold">{businessImpact.totalPotentialRevenue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Quick Wins:</span>
                <span className="text-blue-400 font-semibold">{businessImpact.quickWinsAvailable}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Critical Issues:</span>
                <span className="text-red-400 font-semibold">{businessImpact.criticalIssuesCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 🆕 NEW: Research Citations Section (if available) */}
      {researchCitations && researchCitations.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Research Backing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-300">
              <p className="mb-2">This analysis is backed by {researchCitations.length} research sources:</p>
              <div className="space-y-1">
                {researchCitations.slice(0, 3).map((citation, index) => (
                  <div key={index} className="text-xs text-slate-400">
                    • {citation}
                  </div>
                ))}
                {researchCitations.length > 3 && (
                  <div className="text-xs text-slate-400">
                    ... and {researchCitations.length - 3} more sources
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
