
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Annotation } from '@/types/analysis';
import { MessageSquare, TrendingUp, Eye, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { DetailedFeedbackCard } from '../DetailedFeedbackCard';

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

  // 🔧 ENHANCED: Log when component receives new data
  useEffect(() => {
    console.log('🎯 FeedbackPanel - Data Update:', {
      activeImageIndex,
      currentImageAIAnnotationsCount: currentImageAIAnnotations.length,
      currentImageUserAnnotationsCount: currentImageUserAnnotations.length,
      isMultiImage,
      activeAnnotation,
      annotationDetails: currentImageAIAnnotations.map((a, i) => ({
        index: i + 1,
        id: a.id,
        feedback: a.feedback,
        category: a.category,
        severity: a.severity,
        imageIndex: a.imageIndex
      }))
    });
  }, [currentImageAIAnnotations, activeImageIndex, activeAnnotation]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ux': return '👤';
      case 'visual': return '🎨';
      case 'accessibility': return '♿';
      case 'conversion': return '📈';
      case 'brand': return '🏷️';
      default: return '💡';
    }
  };

  const totalAnnotations = currentImageAIAnnotations.length + currentImageUserAnnotations.length;

  return (
    <div className="space-y-4">
      {/* 🔧 ENHANCED: Header with current image information */}
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
          
          {/* 🔧 ENHANCED: Show current image information */}
          <div className="text-sm text-slate-400">
            {isMultiImage ? (
              <div className="flex items-center justify-between">
                <span>Viewing Image {activeImageIndex + 1} of {aiAnnotations.length > 0 ? Math.max(...aiAnnotations.map(a => (a.imageIndex ?? 0) + 1)) : 1}</span>
                <span className="text-blue-300">{currentImageAIAnnotations.length} insights for this image</span>
              </div>
            ) : (
              <span>Single image analysis • {currentImageAIAnnotations.length} insights found</span>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Summary stats for current image */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2">
              <div className="text-red-400 font-bold text-lg">
                {currentImageAIAnnotations.filter(a => a.severity === 'critical').length}
              </div>
              <div className="text-xs text-red-300">Critical</div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
              <div className="text-yellow-400 font-bold text-lg">
                {currentImageAIAnnotations.filter(a => a.severity === 'suggested').length}
              </div>
              <div className="text-xs text-yellow-300">Suggested</div>  
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2">
              <div className="text-blue-400 font-bold text-lg">
                {currentImageAIAnnotations.filter(a => a.severity === 'enhancement').length}
              </div>
              <div className="text-xs text-blue-300">Enhance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Feedback Card for active annotation */}
      <DetailedFeedbackCard
        activeAnnotation={activeAnnotation}
        aiAnnotations={currentImageAIAnnotations}
        isMultiImage={isMultiImage}
        getSeverityColor={getSeverityColor}
      />

      {/* Annotations List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Detailed Insights</CardTitle>
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
                      Show All
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
                  <p className="text-sm">Switch to another image to see analysis</p>
                </div>
              ) : (
                (showAllAnnotations ? currentImageAIAnnotations : currentImageAIAnnotations.slice(0, 5)).map((annotation, index) => (
                  <div
                    key={annotation.id}
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
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {annotation.feedback}
                        </p>
                        <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                          <span>Effort: {annotation.implementationEffort}</span>
                          <span>Impact: {annotation.businessImpact}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

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
    </div>
  );
};
