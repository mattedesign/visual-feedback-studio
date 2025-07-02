import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { Globe, X, TrendingUp, CheckCircle } from 'lucide-react';

interface PerplexityActivationNotificationProps {
  onDismiss?: () => void;
  className?: string;
}

export const PerplexityActivationNotification = ({
  onDismiss,
  className = ''
}: PerplexityActivationNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const isPerplexityEnabled = useFeatureFlag('perplexity-integration');

  useEffect(() => {
    // Show notification when Perplexity becomes active
    if (isPerplexityEnabled) {
      const hasSeenNotification = localStorage.getItem('perplexity-notification-seen');
      if (!hasSeenNotification) {
        setIsVisible(true);
        // Auto-hide after 10 seconds
        const timer = setTimeout(() => {
          handleDismiss();
        }, 10000);
        return () => clearTimeout(timer);
      }
    }
  }, [isPerplexityEnabled]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('perplexity-notification-seen', 'true');
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isVisible || !isPerplexityEnabled) {
    return null;
  }

  return (
    <Card className={`border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-lg ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-lg font-bold text-green-900 dark:text-green-100">
                  Perplexity Research Activated!
                </h4>
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 text-xs font-bold animate-pulse">
                  LIVE
                </Badge>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                Your analysis now includes real-time UX research validation and competitive intelligence
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Features List */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 rounded-lg p-3">
            <Globe className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Real-time Research
            </span>
          </div>
          
          <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 rounded-lg p-3">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Trend Analysis
            </span>
          </div>
          
          <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 rounded-lg p-3">
            <CheckCircle className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Validation
            </span>
          </div>
        </div>

        {/* Dismissal Instructions */}
        <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
          <p className="text-xs text-green-600 dark:text-green-400">
            🎯 Enhanced insights will now appear throughout your analysis. This message will auto-dismiss in 10 seconds.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};