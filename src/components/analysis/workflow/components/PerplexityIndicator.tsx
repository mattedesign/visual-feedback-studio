import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { PerplexitySource, PerplexityValidationResult } from '@/types/perplexity';
import { ChevronDown, ChevronUp, ExternalLink, Globe, TrendingUp, Award } from 'lucide-react';
import { useState } from 'react';

interface PerplexityIndicatorProps {
  validation?: PerplexityValidationResult;
  sources?: PerplexitySource[];
  trendData?: any;
  className?: string;
}

export const PerplexityIndicator = ({
  validation,
  sources = [],
  trendData,
  className = ''
}: PerplexityIndicatorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isPerplexityEnabled = useFeatureFlag('perplexity-integration');

  // Only render if Perplexity integration is enabled
  if (!isPerplexityEnabled) {
    return null;
  }

  // Don't render if no Perplexity data
  if (!validation && sources.length === 0 && !trendData) {
    return null;
  }

  const confidenceColor = validation?.confidence 
    ? validation.confidence > 0.8 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      : validation.confidence > 0.6
      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';

  return (
    <Card className={`border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Real-Time Research Validation
              </CardTitle>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Enhanced with current industry insights
              </p>
            </div>
          </div>
          
          {validation && (
            <Badge className={`${confidenceColor} font-bold text-sm px-3 py-1`}>
              {Math.round((validation.confidence || 0) * 100)}% Confidence
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Validation Summary */}
        {validation && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-start gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                validation.isValid ? 'bg-green-500' : 'bg-red-500'
              }`}>
                <Award className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Research Validation Status
                </h5>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {validation.isValid 
                    ? 'This recommendation is supported by current UX research'
                    : 'This recommendation may need additional validation'
                  }
                </p>
                {validation.lastValidated && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Last validated: {new Date(validation.lastValidated).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sources Summary */}
        {sources.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Real-Time Sources ({sources.length})
              </h5>
              <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                    {isExpanded ? (
                      <>Hide Details <ChevronUp className="w-4 h-4 ml-1" /></>
                    ) : (
                      <>Show Details <ChevronDown className="w-4 h-4 ml-1" /></>
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-3">
                  <div className="space-y-3">
                    {sources.slice(0, 3).map((source, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h6 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                              {source.title}
                            </h6>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {source.snippet}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {source.domain}
                              </Badge>
                              {source.publishedDate && (
                                <Badge variant="outline" className="text-xs">
                                  {new Date(source.publishedDate).toLocaleDateString()}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="ml-2 flex-shrink-0"
                          >
                            <a 
                              href={source.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
            
            {!isExpanded && (
              <div className="flex gap-2 flex-wrap">
                {sources.slice(0, 3).map((source, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {source.domain}
                  </Badge>
                ))}
                {sources.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{sources.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}

        {/* Beta Warning */}
        <Separator />
        <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
          <TrendingUp className="w-3 h-3" />
          <span>Real-time research validation • Powered by Perplexity.ai</span>
        </div>
      </CardContent>
    </Card>
  );
};