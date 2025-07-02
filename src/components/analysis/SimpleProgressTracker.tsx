import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Loader2 } from 'lucide-react';

interface SimpleProgressTrackerProps {
  currentPhase: 'uploading' | 'processing' | 'analyzing' | 'complete';
  progressPercentage: number; // 0-100
  startTime: Date;
  statusMessage?: string;
  onComplete?: () => void;
}

const PHASE_CONFIG = {
  uploading: { label: 'Upload', order: 0 },
  processing: { label: 'Processing', order: 1 },
  analyzing: { label: 'Analysis', order: 2 },
  complete: { label: 'Complete', order: 3 }
} as const;

const DEFAULT_STATUS_MESSAGES = {
  uploading: 'Uploading images...',
  processing: 'Processing design elements...',
  analyzing: 'Generating insights...',
  complete: 'Analysis complete!'
} as const;

export const SimpleProgressTracker = React.memo<SimpleProgressTrackerProps>(({
  currentPhase,
  progressPercentage,
  startTime,
  statusMessage,
  onComplete
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Memoized elapsed time formatting - only recalculates when seconds change
  const formattedElapsedTime = useMemo(() => {
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s elapsed` : `${seconds}s elapsed`;
  }, [elapsedSeconds]);

  // Memoized display message
  const displayMessage = useMemo(() => {
    return statusMessage || DEFAULT_STATUS_MESSAGES[currentPhase];
  }, [statusMessage, currentPhase]);

  // Memoized progress value - rounds to nearest 5% to reduce updates
  const roundedProgress = useMemo(() => {
    return Math.round(progressPercentage / 5) * 5;
  }, [progressPercentage]);

  // Single timer effect - updates only once per second
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  // Handle completion with stable reference
  const handleComplete = useCallback(() => {
    if (currentPhase === 'complete' && onComplete) {
      onComplete();
    }
  }, [currentPhase, onComplete]);

  // Trigger completion handler when phase changes to complete
  useEffect(() => {
    if (currentPhase === 'complete') {
      handleComplete();
    }
  }, [currentPhase, handleComplete]);

  return (
    <div className="w-full max-w-md mx-auto bg-card border border-border rounded-lg p-6 space-y-4">
      {/* Header with status */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          AI Analysis in Progress
        </h3>
        <p className="text-sm text-muted-foreground">
          {formattedElapsedTime}
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">Progress</span>
          <span className="text-sm text-muted-foreground">{roundedProgress}%</span>
        </div>
        <Progress 
          value={roundedProgress} 
          className="h-2 transition-all duration-300 ease-out"
        />
      </div>

      {/* Phase indicators */}
      <div className="flex justify-between items-center">
        {Object.entries(PHASE_CONFIG).map(([phase, config]) => {
          const isActive = phase === currentPhase;
          const isCompleted = PHASE_CONFIG[currentPhase].order > config.order;
          const isUpcoming = PHASE_CONFIG[currentPhase].order < config.order;
          
          return (
            <div key={phase} className="flex flex-col items-center space-y-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                isCompleted
                  ? 'bg-primary text-primary-foreground'
                  : isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-current" />
                )}
              </div>
              <span className={`text-xs font-medium transition-colors duration-200 ${
                isActive 
                  ? 'text-foreground' 
                  : isCompleted
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}>
                {config.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Status message */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {displayMessage}
        </p>
      </div>
    </div>
  );
});

SimpleProgressTracker.displayName = 'SimpleProgressTracker';