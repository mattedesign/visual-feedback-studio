
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Annotation } from '@/types/analysis';
import { Eye, ExternalLink, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface AnnotationDetailsListProps {
  annotations: Annotation[];
  activeAnnotation: string | null;
  onAnnotationClick: (annotationId: string) => void;
  currentImageIndex: number;
  showImageReference?: boolean;
}

export const AnnotationDetailsList: React.FC<AnnotationDetailsListProps> = ({
  annotations,
  activeAnnotation,
  onAnnotationClick,
  currentImageIndex,
  showImageReference = false
}) => {
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white border-red-500';
      case 'suggested': return 'bg-yellow-600 text-white border-yellow-500';
      case 'enhancement': return 'bg-blue-600 text-white border-blue-500';
      default: return 'bg-purple-600 text-white border-purple-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return AlertCircle;
      case 'suggested': return Info;
      case 'enhancement': return CheckCircle;
      default: return Info;
    }
  };

  const generateAnnotationTitle = (annotation: Annotation): string => {
    // FIXED: Generate proper titles based on category and content
    const categoryTitles = {
      'ux': 'User Experience Issue',
      'visual': 'Visual Design Improvement',
      'accessibility': 'Accessibility Enhancement',
      'conversion': 'Conversion Optimization',
      'navigation': 'Navigation Improvement',
      'content': 'Content Strategy',
      'performance': 'Performance Optimization'
    };

    // Use annotation.title if it exists and is different from feedback
    if (annotation.title && annotation.title.trim() !== annotation.feedback?.trim()) {
      return annotation.title;
    }

    const baseTitle = categoryTitles[annotation.category] || 'Design Recommendation';
    
    // Extract first meaningful sentence for title if feedback is long
    if (annotation.feedback && annotation.feedback.length > 60) {
      const firstSentence = annotation.feedback.split('.')[0];
      if (firstSentence.length <= 50 && firstSentence.length > 10) {
        return firstSentence.trim();
      }
    }
    
    return baseTitle;
  };

  const generateAnnotationDescription = (annotation: Annotation): string => {
    // FIXED: Ensure description is different from title
    if (!annotation.feedback) return 'No detailed feedback available.';
    
    const title = generateAnnotationTitle(annotation);
    
    // If feedback is the same as title, provide more context
    if (annotation.feedback.trim() === title.trim()) {
      const severityContext = {
        'critical': 'This critical issue requires immediate attention to prevent user frustration and potential business impact.',
        'suggested': 'This improvement suggestion could enhance user experience and interface usability.',
        'enhancement': 'This enhancement opportunity could further optimize the design and user interaction.'
      };
      
      return `${annotation.feedback} ${severityContext[annotation.severity] || 'This issue should be addressed to improve the overall design quality.'}`;
    }
    
    return annotation.feedback;
  };

  const getEffortBadgeColor = (effort: string) => {
    switch (effort?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getImpactBadgeColor = (impact: string) => {
    switch (impact?.toLowerCase()) {
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'high': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (annotations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No annotations available for this image.</p>
        <p className="text-sm mt-2">Upload an image and run analysis to see insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showImageReference && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
            Viewing Image {currentImageIndex + 1} Insights
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {annotations.length} annotation{annotations.length !== 1 ? 's' : ''} found for this image
          </p>
        </div>
      )}

      {annotations.map((annotation, index) => {
        const isActive = activeAnnotation === annotation.id;
        const title = generateAnnotationTitle(annotation);
        const description = generateAnnotationDescription(annotation);
        const SeverityIcon = getSeverityIcon(annotation.severity);
        
        return (
          <Card 
            key={annotation.id}
            id={`detail-${annotation.id}`}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              isActive ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
            onClick={() => onAnnotationClick(annotation.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${getSeverityColor(annotation.severity)} flex-shrink-0`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg leading-tight mb-2 break-words">
                      {title}
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`${getSeverityColor(annotation.severity)} text-xs flex items-center gap-1`}>
                        <SeverityIcon className="w-3 h-3" />
                        {annotation.severity?.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {annotation.category}
                      </Badge>
                      {annotation.implementationEffort && (
                        <Badge className={`text-xs ${getEffortBadgeColor(annotation.implementationEffort)}`}>
                          {annotation.implementationEffort} Effort
                        </Badge>
                      )}
                      {annotation.businessImpact && (
                        <Badge className={`text-xs ${getImpactBadgeColor(annotation.businessImpact)}`}>
                          {annotation.businessImpact} Impact
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost"
                  size="sm"
                  className="ml-2 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAnnotationClick(annotation.id);
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 break-words">
                {description}
              </p>
              
              {/* Enhanced metadata display */}
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t pt-3">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <strong>Position:</strong> 
                    <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">
                      {Math.round(annotation.x)}%, {Math.round(annotation.y)}%
                    </code>
                  </span>
                  {annotation.imageIndex !== undefined && (
                    <span><strong>Image:</strong> {annotation.imageIndex + 1}</span>
                  )}
                </div>
                <Button 
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 font-medium p-1 h-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAnnotationClick(annotation.id);
                    // Scroll annotation into view on image
                    setTimeout(() => {
                      const imageContainer = document.querySelector('.image-container');
                      if (imageContainer) {
                        const annotationElement = imageContainer.querySelector(`[data-annotation-id="${annotation.id}"]`);
                        if (annotationElement) {
                          annotationElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }
                    }, 100);
                  }}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View on Image
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {/* Summary statistics */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Analysis Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
            <div className="font-bold text-red-700 dark:text-red-300 text-lg">
              {annotations.filter(a => a.severity === 'critical').length}
            </div>
            <div className="text-red-600 dark:text-red-400">Critical</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
            <div className="font-bold text-yellow-700 dark:text-yellow-300 text-lg">
              {annotations.filter(a => a.severity === 'suggested').length}
            </div>
            <div className="text-yellow-600 dark:text-yellow-400">Suggested</div>
          </div>
          <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <div className="font-bold text-blue-700 dark:text-blue-300 text-lg">
              {annotations.filter(a => a.severity === 'enhancement').length}
            </div>
            <div className="text-blue-600 dark:text-blue-400">Enhancement</div>
          </div>
          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
            <div className="font-bold text-green-700 dark:text-green-300 text-lg">
              {annotations.length}
            </div>
            <div className="text-green-600 dark:text-green-400">Total</div>
          </div>
        </div>
      </div>
    </div>
  );
};
