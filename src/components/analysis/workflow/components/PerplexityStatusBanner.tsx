import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Globe, TrendingUp, Zap, ExternalLink, Award } from 'lucide-react';

interface PerplexityStatusBannerProps {
  className?: string;
  onViewDetails?: () => void;
  sourcesCount?: number;
  validationScore?: number;
}

export const PerplexityStatusBanner = ({
  className = '',
  onViewDetails,
  sourcesCount = 0,
  validationScore = 0
}: PerplexityStatusBannerProps) => {
  const isPerplexityEnabled = useFeatureFlag('perplexity-integration');

  // Only render if Perplexity integration is enabled
  if (!isPerplexityEnabled) {
    return null;
  }

  return (
    <Card className={`border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-indigo-900/20 shadow-lg ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Status */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
              <Globe className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-lg font-bold text-purple-900 dark:text-purple-100">
                  Perplexity Research Active
                </h4>
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 text-xs font-bold animate-pulse">
                  LIVE
                </Badge>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 text-xs font-bold">
                  PREMIUM
                </Badge>
              </div>
              <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                Real-time UX research validation and competitive intelligence
              </p>
            </div>
          </div>

          {/* Right Section - Metrics */}
          <div className="flex items-center gap-6">
            {/* Status Indicators */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Research Active
                </span>
              </div>
              
              {sourcesCount > 0 && (
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {sourcesCount} Sources
                  </span>
                </div>
              )}
              
              {validationScore > 0 && (
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {Math.round(validationScore * 100)}% Validated
                  </span>
                </div>
              )}
            </div>

            {/* View Details Button */}
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewDetails}
                className="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/20"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Research
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced Features Footer */}
        <div className="mt-4 pt-3 border-t border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-xs">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-500" />
                <span className="text-gray-600 dark:text-gray-400">Real-time Trends</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">Competitive Analysis</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-3 h-3 text-purple-500" />
                <span className="text-gray-600 dark:text-gray-400">Research Validation</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Powered by Perplexity.ai
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};