
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Loader2, Brain, Search, Lightbulb, Upload, Zap, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProgressStep {
  id: string;
  title: String;
  description: string;
  estimatedTime: number;
  icon: React.ReactNode;
}

interface AnalysisProgressStepsProps {
  currentStep: string;
  progress: number;
  researchSourcesFound?: number;
  totalImages?: number;
  completedSteps?: string[];
  onStepComplete?: (stepId: string) => void;
}

const PROGRESS_STEPS: ProgressStep[] = [
  {
    id: 'uploading',
    title: 'Uploading Images',
    description: 'Preparing design files...',
    estimatedTime: 5,
    icon: <Upload className="w-4 h-4" />
  },
  {
    id: 'processing',
    title: 'Processing Elements',
    description: 'Detecting UI components...',
    estimatedTime: 10,
    icon: <Search className="w-4 h-4" />
  },
  {
    id: 'research',
    title: 'Research Context',
    description: 'Searching UX studies database...',
    estimatedTime: 15,
    icon: <Brain className="w-4 h-4" />
  },
  {
    id: 'analysis',
    title: 'AI Analysis',
    description: 'Analyzing against best practices...',
    estimatedTime: 30,
    icon: <Zap className="w-4 h-4" />
  },
  {
    id: 'recommendations',
    title: 'Recommendations',
    description: 'Generating suggestions...',
    estimatedTime: 10,
    icon: <Lightbulb className="w-4 h-4" />
  }
];

export const AnalysisProgressSteps = ({
  currentStep,
  progress,
  researchSourcesFound = 0,
  totalImages = 1,
  completedSteps = [],
  onStepComplete
}: AnalysisProgressStepsProps) => {
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const getCurrentStepIndex = () => {
    return PROGRESS_STEPS.findIndex(step => step.id === currentStep);
  };

  const getCurrentStep = () => {
    return PROGRESS_STEPS.find(step => step.id === currentStep);
  };

  const getStepStatus = (stepId: string) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const currentStepData = getCurrentStep();
  const currentStepIndex = getCurrentStepIndex();
  const totalEstimatedTime = PROGRESS_STEPS.reduce((acc, step) => acc + step.estimatedTime, 0);
  const remainingTime = Math.max(0, totalEstimatedTime - elapsedTime);

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
      <CardContent className="p-6">
        {/* Condensed Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 font-semibold hidden">
              <Star className="w-4 h-4 mr-2 fill-current" />
              Research-Backed Analysis
            </Badge>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            AI Analysis in Progress
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {formatTime(elapsedTime)} elapsed • ~{formatTime(remainingTime)} remaining
          </p>
        </div>

        {/* Overall Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress 
            value={progress} 
            className="h-2 bg-gray-200 dark:bg-slate-700"
          />
        </div>

        {/* Current Step - Simplified */}
        {currentStepData && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  {currentStepData.title}
                </h4>
                <p className="text-blue-700 dark:text-blue-200 text-sm">
                  {currentStepData.description}
                  {currentStep === 'research' && researchSourcesFound > 0 && 
                    ` (${researchSourcesFound} sources found)`
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step Indicators - Horizontal */}
        <div className="flex justify-between items-center mb-4">
          {PROGRESS_STEPS.map((step, index) => {
            const status = getStepStatus(step.id);
            const isActive = status === 'active';
            const isCompleted = status === 'completed';
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isActive
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 dark:bg-slate-600 text-gray-600 dark:text-slate-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span className={`text-xs mt-1 text-center max-w-[60px] ${
                  isActive 
                    ? 'text-blue-900 dark:text-blue-100 font-medium' 
                    : isCompleted
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.title.toString().split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Research Status - Only when relevant */}
        {currentStep === 'research' && researchSourcesFound > 0 && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                {researchSourcesFound} research insights found from 272+ UX studies
              </span>
            </div>
          </div>
        )}

        {/* Details Toggle */}
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {showDetails ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show Details
              </>
            )}
          </Button>
        </div>

        {/* Detailed View - Collapsible */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600 space-y-2">
            {PROGRESS_STEPS.map((step) => {
              const status = getStepStatus(step.id);
              const isActive = status === 'active';
              const isCompleted = status === 'completed';
              
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-2 rounded transition-colors ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/20' 
                      : isCompleted
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : 'bg-gray-50 dark:bg-slate-700/50'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 dark:bg-slate-600 text-gray-600'
                  }`}>
                    {isCompleted ? '✓' : isActive ? '⋯' : step.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {step.description} • ~{step.estimatedTime}s
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
