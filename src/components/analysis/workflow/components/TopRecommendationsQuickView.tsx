
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Annotation } from '@/types/analysis';
import { Star, ChevronRight, Zap, Target, AlertTriangle, TrendingUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TopRecommendationsQuickViewProps {
  annotations: Annotation[];
  onAnnotationClick: (annotationId: string) => void;
  onViewAllClick: () => void;
}

export const TopRecommendationsQuickView = ({
  annotations,
  onAnnotationClick,
  onViewAllClick
}: TopRecommendationsQuickViewProps) => {
  const isMobile = useIsMobile();
  
  // Smart sorting algorithm for top recommendations
  const getRecommendationScore = (annotation: Annotation) => {
    let score = 0;
    
    // Severity scoring (higher is more important)
    switch (annotation.severity) {
      case 'critical': score += 100; break;
      case 'suggested': score += 70; break;
      case 'enhancement': score += 40; break;
      default: score += 20;
    }
    
    // Business impact scoring
    const impact = annotation.businessImpact?.toLowerCase() || '';
    if (impact.includes('high') || impact.includes('significant')) score += 30;
    else if (impact.includes('medium') || impact.includes('moderate')) score += 20;
    else if (impact.includes('low') || impact.includes('minimal')) score += 10;
    
    // Implementation effort scoring (lower effort = higher score)
    const effort = annotation.implementationEffort?.toLowerCase() || '';
    if (effort.includes('low') || effort.includes('quick')) score += 25;
    else if (effort.includes('medium') || effort.includes('moderate')) score += 15;
    else if (effort.includes('high') || effort.includes('complex')) score += 5;
    
    // Category boost for high-impact categories
    switch (annotation.category) {
      case 'conversion': score += 20; break;
      case 'accessibility': score += 15; break;
      case 'ux': score += 15; break;
      case 'visual': score += 10; break;
      default: score += 5;
    }
    
    return score;
  };

  const topRecommendations = annotations
    .map(annotation => ({
      ...annotation,
      score: getRecommendationScore(annotation)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return AlertTriangle;
      case 'suggested': return Zap;
      case 'enhancement': return Target;
      default: return Star;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'suggested': return 'text-yellow-600 bg-yellow-50';
      case 'enhancement': return 'text-blue-600 bg-blue-50';
      default: return 'text-purple-600 bg-purple-50';
    }
  };

  const getPriorityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Critical';
      case 'suggested': return 'High';
      case 'enhancement': return 'Medium';
      default: return 'Low';
    }
  };

  if (topRecommendations.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700">
      <CardHeader className={isMobile ? 'pb-3' : 'pb-4'}>
        <div className="flex items-center justify-between">
          <CardTitle className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2`}>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            Top 5 Recommendations
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewAllClick}
            className="text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <p className="text-blue-700 dark:text-blue-300 text-sm">
          Prioritized by impact, effort, and business value
        </p>
      </CardHeader>
      <CardContent className={`space-y-3 ${isMobile ? 'p-3 pt-0' : 'p-6 pt-0'}`}>
        {topRecommendations.map((recommendation, index) => {
          const SeverityIcon = getSeverityIcon(recommendation.severity);
          
          return (
            <div
              key={recommendation.id}
              className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700 hover:shadow-md transition-all duration-200 cursor-pointer group"
              onClick={() => onAnnotationClick(recommendation.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getSeverityColor(recommendation.severity)}`}>
                    <SeverityIcon className="w-4 h-4" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`flex items-center gap-2 mb-2 ${isMobile ? 'flex-wrap' : ''}`}>
                    <Badge className={`${getSeverityColor(recommendation.severity)} font-bold ${isMobile ? 'text-xs' : 'text-xs'}`}>
                      {getPriorityLabel(recommendation.severity)}
                    </Badge>
                    <Badge variant="outline" className={`capitalize ${isMobile ? 'text-xs' : 'text-xs'}`}>
                      {recommendation.category}
                    </Badge>
                    <div className={`text-xs text-gray-500 dark:text-gray-400 ${isMobile ? 'w-full' : ''}`}>
                      Score: {recommendation.score}
                    </div>
                  </div>
                  
                  <p className={`${isMobile ? 'text-sm' : 'text-sm'} text-gray-800 dark:text-gray-200 leading-relaxed line-clamp-2 group-hover:text-blue-800 dark:group-hover:text-blue-200 transition-colors`}>
                    {recommendation.feedback}
                  </p>
                  
                  {!isMobile && (
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Effort:</span>
                        <span>{recommendation.implementationEffort || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span className="font-medium">Impact:</span>
                        <span>{recommendation.businessImpact || 'Unknown'}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
