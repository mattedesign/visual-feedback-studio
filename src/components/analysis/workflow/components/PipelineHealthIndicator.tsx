import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';

interface StageResult {
  stageName: string;
  status: 'success' | 'error' | 'timeout' | 'skipped' | 'running';
  duration_ms?: number;
  error?: string;
}

interface PipelineHealthIndicatorProps {
  stages: StageResult[];
  isRunning: boolean;
  currentStage?: string;
}

export const PipelineHealthIndicator = ({ 
  stages, 
  isRunning, 
  currentStage 
}: PipelineHealthIndicatorProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const completedStages = stages.filter(s => s.status === 'success').length;
  const totalStages = stages.length;
  const progressPercentage = totalStages > 0 ? (completedStages / totalStages) * 100 : 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="w-5 h-5 text-blue-500" />
          Multi-Stage Pipeline Status
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Progress: {completedStages}/{totalStages} stages</span>
            <span>{Math.round(progressPercentage)}% complete</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {stages.map((stage, index) => (
          <div key={stage.stageName} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(stage.status)}
                <span className="font-medium text-sm capitalize">
                  {stage.stageName.replace(/_/g, ' ')}
                </span>
              </div>
              <Badge className={getStatusColor(stage.status)}>
                {stage.status}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {stage.duration_ms && (
                <span>{Math.round(stage.duration_ms / 1000)}s</span>
              )}
              {stage.status === 'running' && currentStage === stage.stageName && (
                <span className="animate-pulse">Running...</span>
              )}
            </div>
          </div>
        ))}
        
        {isRunning && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Clock className="w-4 h-4 text-blue-500 animate-spin" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Pipeline running...
            </span>
          </div>
        )}
        
        {stages.some(s => s.error) && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Errors:</h4>
            {stages.filter(s => s.error).map(stage => (
              <div key={stage.stageName} className="text-sm text-red-700 dark:text-red-300">
                <strong>{stage.stageName}:</strong> {stage.error}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};