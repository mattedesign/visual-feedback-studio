
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Loader2, Brain, Search, Lightbulb, Upload, Zap, Star, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface ProgressStep {
  id: string;
  title: String;
  description: string;
  estimatedTime: number; // in seconds
  educationalTip?: string;
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
    description: 'Preparing your design files for analysis...',
    estimatedTime: 5,
    icon: <Upload className="w-4 h-4" />,
    educationalTip: 'We optimize your images for better AI analysis while preserving design details'
  },
  {
    id: 'processing',
    title: 'Processing Design Elements',
    description: 'Detecting UI components and layout patterns...',
    estimatedTime: 10,
    icon: <Search className="w-4 h-4" />,
    educationalTip: 'Our vision AI identifies buttons, forms, navigation, and other UI elements'
  },
  {
    id: 'research',
    title: 'Building Research Context',
    description: 'Searching our database of 272+ UX research studies...',
    estimatedTime: 15,
    icon: <Brain className="w-4 h-4" />,
    educationalTip: 'We have 272+ UX research studies covering usability, conversion, and accessibility'
  },
  {
    id: 'analysis',
    title: 'Research-Backed AI Analysis',
    description: 'Analyzing your design against evidence-based best practices...',
    estimatedTime: 30,
    icon: <Zap className="w-4 h-4" />,
    educationalTip: 'AI combines visual analysis with research insights to generate recommendations'
  },
  {
    id: 'recommendations',
    title: 'Generating Evidence-Based Recommendations',
    description: 'Creating research-backed improvement suggestions...',
    estimatedTime: 10,
    icon: <Lightbulb className="w-4 h-4" />,
    educationalTip: 'Each recommendation includes effort estimate and business impact assessment'
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
  const [isMinimized, setIsMinimized] = useState(false);

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

  const getStepDescription = (step: ProgressStep) => {
    if (step.id === 'research' && researchSourcesFound > 0) {
      return `Found ${researchSourcesFound} relevant research insights from our 272-entry database`;
    }
    if (step.id === 'uploading' && totalImages > 1) {
      return `Preparing ${totalImages} design files for analysis...`;
    }
    return step.description;
  };

  const getResearchAreas = () => {
    const areas = ['Accessibility guidelines', 'Conversion patterns', 'Mobile UX', 'Visual hierarchy', 'User psychology'];
    return areas.slice(0, Math.min(3, researchSourcesFound));
  };

  const currentStepData = getCurrentStep();
  const currentStepIndex = getCurrentStepIndex();
  const totalEstimatedTime = PROGRESS_STEPS.reduce((acc, step) => acc + step.estimatedTime, 0);
  const completedTime = PROGRESS_STEPS.slice(0, currentStepIndex).reduce((acc, step) => acc + step.estimatedTime, 0);
  const remainingTime = Math.max(0, totalEstimatedTime - elapsedTime);

  return (
    <TooltipProvider>
      <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardContent className="p-6">
          {/* Header with Prominent Research Badge and Minimize Button */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center justify-center gap-3 flex-1">
                <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 px-6 py-3 text-base font-bold shadow-lg">
                  <Star className="w-5 h-5 mr-2 fill-current" />
                  Research-Backed Analysis
                </Badge>
                <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 px-4 py-2 text-sm font-semibold shadow-md">
                  272+ UX Studies Database
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="ml-4 p-2 hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                {isMinimized ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </Button>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Evidence-Based UX Analysis in Progress
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Research-backed analysis • {formatTime(elapsedTime)} elapsed • ~{formatTime(remainingTime)} remaining
            </p>
          </div>

          {/* Overall Progress Bar - Always Visible */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Overall Progress
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress 
              value={progress} 
              className="h-3 bg-gray-200 dark:bg-slate-700"
            />
          </div>

          {/* Current Step Summary - Always Visible */}
          {currentStepData && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                    {currentStepData.title}
                  </h4>
                  <p className="text-blue-700 dark:text-blue-200 text-sm">
                    {getStepDescription(currentStepData)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-blue-600 dark:text-blue-300" />
                    <span className="text-xs text-blue-600 dark:text-blue-300">
                      ~{currentStepData.estimatedTime} seconds
                    </span>
                  </div>
                </div>
                {currentStepData.educationalTip && !isMinimized && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-5 h-5 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center cursor-help">
                        <span className="text-blue-600 dark:text-blue-300 text-xs font-bold">?</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <p className="text-sm">{currentStepData.educationalTip}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          )}

          {/* Collapsible Content */}
          {!isMinimized && (
            <>
              {/* RAG Process Transparency - Research Context Building */}
              {currentStep === 'research' && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-5 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-emerald-900 dark:text-emerald-100 text-lg">
                        Building Research Context from 272 UX Studies
                      </h4>
                      <p className="text-emerald-800 dark:text-emerald-200 text-sm mt-1">
                        {researchSourcesFound > 0 
                          ? `Found ${researchSourcesFound} relevant studies for your design type`
                          : 'Searching comprehensive UX research database...'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {researchSourcesFound > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                          Research context ready: {researchSourcesFound} insights found
                        </span>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Research Areas Being Used:
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {getResearchAreas().map((area, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-300">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step Indicators with Proper Status Tracking */}
              <div className="space-y-3">
                {PROGRESS_STEPS.map((step, index) => {
                  const status = getStepStatus(step.id);
                  const isActive = status === 'active';
                  const isCompleted = status === 'completed';
                  
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${
                        isActive 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700' 
                          : isCompleted
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                          : 'bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                          isCompleted
                            ? 'bg-green-500 text-white scale-110'
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
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className={`font-medium transition-colors duration-300 ${
                            isActive 
                              ? 'text-blue-900 dark:text-blue-100' 
                              : isCompleted
                              ? 'text-green-900 dark:text-green-100'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {step.title}
                          </h5>
                          {isCompleted && (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 animate-fade-in">
                              ✓ Complete
                            </Badge>
                          )}
                          {isActive && (
                            <Badge className="bg-blue-500 text-white">
                              In Progress
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm mt-1 transition-colors duration-300 ${
                          isActive 
                            ? 'text-blue-700 dark:text-blue-200' 
                            : isCompleted
                            ? 'text-green-700 dark:text-green-200'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {getStepDescription(step)}
                        </p>
                      </div>

                      {step.educationalTip && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-4 h-4 bg-gray-200 dark:bg-slate-600 rounded-full flex items-center justify-center cursor-help">
                              <span className="text-gray-600 dark:text-slate-400 text-xs">i</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-xs">
                            <p className="text-sm">{step.educationalTip}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Enhanced Research Context Summary */}
              {researchSourcesFound > 0 && (
                <div className="mt-6 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-700 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-white fill-current" />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-900 dark:text-emerald-100 text-lg">
                        Research Context Ready
                      </h4>
                      <p className="text-emerald-700 dark:text-emerald-300 text-sm">
                        Based on {researchSourcesFound} relevant UX studies from our 272-entry database
                      </p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                    <p className="text-emerald-800 dark:text-emerald-200 text-sm font-medium mb-2">
                      🎯 Your analysis will include evidence-based insights covering:
                    </p>
                    <ul className="text-emerald-700 dark:text-emerald-300 text-sm space-y-1">
                      <li>• Usability patterns with proven success rates</li>
                      <li>• Conversion optimization based on A/B test data</li>
                      <li>• Accessibility guidelines with compliance metrics</li>
                      <li>• Industry-specific best practices</li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Minimized State Indicator */}
          {isMinimized && (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Click to expand detailed progress • Step {getCurrentStepIndex() + 1} of {PROGRESS_STEPS.length}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
