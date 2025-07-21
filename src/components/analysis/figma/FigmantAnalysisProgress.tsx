import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Circle, AlertCircle, Loader, Brain, Eye, Lightbulb, Target } from 'lucide-react';

interface FigmantAnalysisProgressProps {
  sessionId: string;
  onComplete?: () => void;
}

interface ProgressStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'complete' | 'error';
  description: string;
}

export const FigmantAnalysisProgress: React.FC<FigmantAnalysisProgressProps> = ({ 
  sessionId,
  onComplete 
}) => {
  const [steps, setSteps] = useState<ProgressStep[]>([
    { 
      id: 'upload', 
      label: 'Processing Images', 
      icon: <Circle className="w-5 h-5" />,
      status: 'complete',
      description: 'Images uploaded and validated'
    },
    { 
      id: 'vision', 
      label: 'Vision Analysis', 
      icon: <Eye className="w-5 h-5" />,
      status: 'active',
      description: 'Detecting UI elements and patterns'
    },
    { 
      id: 'analysis', 
      label: 'UX Intelligence', 
      icon: <Brain className="w-5 h-5" />,
      status: 'pending',
      description: 'Analyzing user experience patterns'
    },
    { 
      id: 'business', 
      label: 'Business Impact', 
      icon: <Target className="w-5 h-5" />,
      status: 'pending',
      description: 'Calculating ROI and recommendations'
    },
    { 
      id: 'complete', 
      label: 'Analysis Ready', 
      icon: <Lightbulb className="w-5 h-5" />,
      status: 'pending',
      description: 'Generating actionable insights'
    }
  ]);
  
  const [currentMessage, setCurrentMessage] = useState('Initializing figmant analysis...');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const channel = supabase
      .channel(`figmant-analysis-${sessionId}`)
      .on('broadcast', { event: 'progress' }, ({ payload }) => {
        setCurrentMessage(payload.message || 'Processing...');
        setProgress(payload.progress || 0);
        
        // Update step status based on payload
        if (payload.stage === 'vision') {
          updateStepStatus('upload', 'complete');
          updateStepStatus('vision', 'active');
        } else if (payload.stage === 'analysis') {
          updateStepStatus('vision', 'complete');
          updateStepStatus('analysis', 'active');
        } else if (payload.stage === 'business') {
          updateStepStatus('analysis', 'complete');
          updateStepStatus('business', 'active');
        } else if (payload.stage === 'complete') {
          updateStepStatus('business', 'complete');
          updateStepStatus('complete', 'complete');
          onComplete?.();
        } else if (payload.stage === 'error') {
          setError(payload.message);
          const activeStep = steps.find(s => s.status === 'active');
          if (activeStep) {
            updateStepStatus(activeStep.id, 'error');
          }
        }
      })
      .subscribe();
    
    return () => {
      channel.unsubscribe();
    };
  }, [sessionId, onComplete]);
  
  const updateStepStatus = (stepId: string, status: ProgressStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };
  
  const getStepIcon = (step: ProgressStep) => {
    switch(step.status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'active':
        return <Loader className="w-5 h-5 text-primary animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };
  
  return (
    <div className="bg-card rounded-lg shadow-lg border max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <Brain className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-card-foreground mb-2">
          Figmant Analysis in Progress
        </h2>
        <p className="text-sm text-muted-foreground">
          AI-powered UX analysis with business impact insights
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Steps */}
      <div className="space-y-4 sm:space-y-6">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-3 sm:gap-4">
            <div className="flex flex-col items-center flex-shrink-0">
              {getStepIcon(step)}
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-12 sm:h-16 mt-2 transition-colors duration-300 ${
                  step.status === 'complete' ? 'bg-success' : 'bg-border'
                }`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-1">
                <h3 className={`font-semibold transition-colors duration-200 text-sm sm:text-base ${
                  step.status === 'active' ? 'text-primary' :
                  step.status === 'complete' ? 'text-success' :
                  step.status === 'error' ? 'text-destructive' :
                  'text-muted-foreground'
                }`}>
                  {step.label}
                </h3>
                {step.status === 'active' && (
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-primary rounded-full animate-pulse delay-75"></div>
                    <div className="w-1 h-1 bg-primary rounded-full animate-pulse delay-150"></div>
                  </div>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                {step.description}
              </p>
              {step.status === 'active' && (
                <p className="text-xs text-primary animate-fade-in break-words">
                  {currentMessage}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Error State */}
      {error && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-lg animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-destructive text-sm sm:text-base break-words font-medium mb-2">
                Analysis Error
              </p>
              <p className="text-destructive/80 text-xs sm:text-sm break-words mb-3">
                {error}
              </p>
              <button 
                className="text-destructive font-semibold hover:underline transition-all duration-200 hover:text-destructive/80 text-sm sm:text-base touch-manipulation"
                onClick={() => window.location.reload()}
              >
                Retry Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};