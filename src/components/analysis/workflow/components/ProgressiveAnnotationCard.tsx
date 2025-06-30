
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Annotation } from '@/types/analysis';
import { CitationIndicator } from './CitationIndicator';
import { ChevronDown, ChevronUp, Award, BookOpen, Zap, Clock, TrendingUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProgressiveAnnotationCardProps {
  annotation: Annotation;
  index: number;
  isActive: boolean;
  onClick: () => void;
  getSeverityColor: (severity: string) => string;
  citationNumber?: number;
  citationText?: string;
  isMultiImage?: boolean;
}

export const ProgressiveAnnotationCard = ({
  annotation,
  index,
  isActive,
  onClick,
  getSeverityColor,
  citationNumber,
  citationText,
  isMultiImage = false
}: ProgressiveAnnotationCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();
  
  const feedbackText = annotation.feedback || 'No feedback available';
  const shouldShowExpand = feedbackText.length > (isMobile ? 80 : 150);
  const truncatedText = shouldShowExpand && !isExpanded 
    ? feedbackText.substring(0, isMobile ? 80 : 150) + '...' 
    : feedbackText;

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const getPriorityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Critical';
      case 'suggested': return 'High';
      case 'enhancement': return 'Medium';
      default: return 'Low';
    }
  };

  const getEffortColor = (effort?: string) => {
    switch (effort?.toLowerCase()) {
      case 'low': case 'quick': return 'text-green-600 bg-green-50';
      case 'medium': case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'high': case 'complex': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getImpactColor = (impact?: string) => {
    switch (impact?.toLowerCase()) {
      case 'high': case 'significant': return 'text-green-600 bg-green-50';
      case 'medium': case 'moderate': return 'text-yellow-600 bg-yellow-50';
      case 'low': case 'minimal': return 'text-gray-600 bg-gray-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 shadow-lg' 
          : 'hover:bg-gray-50 dark:hover:bg-slate-800 border-gray-200 dark:border-slate-700 hover:shadow-md'
      } ${isMobile ? 'mx-2' : ''}`}
      onClick={onClick}
    >
      <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
        {/* Header Section */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0">
            <div className={`${isMobile ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'} rounded-full flex items-center justify-center text-white font-bold shadow-md ${getSeverityColor(annotation.severity).split(' ')[0]}`}>
              {index + 1}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className={`flex items-center gap-2 mb-2 ${isMobile ? 'flex-wrap' : ''}`}>
              <Badge className={`${getSeverityColor(annotation.severity)} font-bold ${isMobile ? 'text-xs' : ''}`}>
                {getPriorityLabel(annotation.severity)}
              </Badge>
              <Badge variant="outline" className={`capitalize font-medium ${isMobile ? 'text-xs' : ''}`}>
                {annotation.category}
              </Badge>
              {isMultiImage && annotation.imageIndex !== undefined && (
                <Badge variant="secondary" className="text-xs">
                  Image {annotation.imageIndex + 1}
                </Badge>
              )}
              {citationNumber && citationNumber > 0 && (
                <div className="flex items-center gap-1">
                  <CitationIndicator
                    citationNumber={citationNumber}
                    citationText={citationText}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400 hover:from-emerald-600 hover:to-teal-600 font-bold shadow-sm text-xs"
                  />
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold">
                    <BookOpen className="w-3 h-3 mr-1" />
                    RESEARCH
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className={`space-y-3 ${isMobile ? 'ml-11' : 'ml-13'}`}>
          <div className={`rounded-lg p-3 ${citationNumber && citationNumber > 0 ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700' : 'bg-gray-50 dark:bg-slate-700'}`}>
            <div className="flex items-start gap-2">
              {citationNumber && citationNumber > 0 && (
                <div className="w-5 h-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="w-3 h-3 text-white" />
                </div>
              )}
              <p className={`${isMobile ? 'text-sm' : 'text-sm'} leading-relaxed ${citationNumber && citationNumber > 0 ? 'text-emerald-800 dark:text-emerald-200 font-medium' : 'text-gray-800 dark:text-gray-200'}`}>
                {truncatedText}
              </p>
            </div>
            
            {/* Research Foundation Note */}
            {citationNumber && citationNumber > 0 && isExpanded && (
              <div className="mt-2 p-2 bg-white dark:bg-slate-800 rounded border-l-4 border-emerald-500">
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                  📚 Research Foundation: This recommendation is backed by peer-reviewed UX research (Source #{citationNumber})
                </p>
              </div>
            )}
            
            {/* Expand/Collapse Button */}
            {shouldShowExpand && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpandToggle}
                className={`mt-2 p-0 h-auto ${isMobile ? 'text-xs' : 'text-sm'} text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200`}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-3 h-3 mr-1" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3 mr-1" />
                    Show more
                  </>
                )}
              </Button>
            )}
          </div>
          
          {/* Implementation Details - Only show when expanded or on desktop */}
          {(isExpanded || !isMobile) && (
            <div className={`flex items-center gap-4 ${isMobile ? 'text-xs' : 'text-xs'} ${isMobile ? 'flex-col items-start gap-2' : ''}`}>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">Effort:</span>
                <Badge className={`${getEffortColor(annotation.implementationEffort)} text-xs font-medium`}>
                  {annotation.implementationEffort || 'Unknown'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">Impact:</span>
                <Badge className={`${getImpactColor(annotation.businessImpact)} text-xs font-medium`}>
                  {annotation.businessImpact || 'Unknown'}
                </Badge>
              </div>
              {citationNumber && citationNumber > 0 && (
                <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold">
                  <Award className="w-3 h-3 mr-1" />
                  Research-Backed
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
