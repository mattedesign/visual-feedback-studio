import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Circle, AlertCircle, Loader } from 'lucide-react';

interface AnalysisProgressProps {
  sessionId: string;
}

interface ProgressStep {
  id: string;
  label: string;
  icon: string;
  status: 'pending' | 'active' | 'complete' | 'error';
}

export function AnalysisProgress({ sessionId }: AnalysisProgressProps) {
  const [steps, setSteps] = useState<ProgressStep[]>([
    { id: 'upload', label: 'Processing Image', icon: '📤', status: 'complete' },
    { id: 'vision', label: 'Detecting Components', icon: '👁️', status: 'active' },
    { id: 'analysis', label: 'Analyzing UX Patterns', icon: '🧠', status: 'pending' },
    { id: 'insights', label: 'Generating Insights', icon: '💡', status: 'pending' },
    { id: 'complete', label: 'Analysis Complete', icon: '✅', status: 'pending' }
  ]);
  
  const [currentMessage, setCurrentMessage] = useState('Starting analysis...');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const channel = supabase
      .channel(`analysis-${sessionId}`)
      .on('broadcast', { event: 'progress' }, ({ payload }) => {
        setCurrentMessage(payload.message);
        
        // Update step status based on payload
        if (payload.status === 'vision') {
          updateStepStatus('upload', 'complete');
          updateStepStatus('vision', 'active');
        } else if (payload.status === 'analyzing') {
          updateStepStatus('vision', 'complete');
          updateStepStatus('analysis', 'active');
        } else if (payload.status === 'insights') {
          updateStepStatus('analysis', 'complete');
          updateStepStatus('insights', 'active');
        } else if (payload.status === 'complete') {
          updateStepStatus('insights', 'complete');
          updateStepStatus('complete', 'complete');
        } else if (payload.status === 'error') {
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
  }, [sessionId]);
  
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
      <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-card-foreground">Analyzing Your Design</h2>
      
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
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl flex-shrink-0">{step.icon}</span>
                <h3 className={`font-semibold transition-colors duration-200 text-sm sm:text-base ${
                  step.status === 'active' ? 'text-primary' :
                  step.status === 'complete' ? 'text-success' :
                  step.status === 'error' ? 'text-destructive' :
                  'text-muted-foreground'
                }`}>
                  {step.label}
                </h3>
              </div>
              {step.status === 'active' && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 animate-fade-in break-words">{currentMessage}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {error && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-lg animate-fade-in">
          <p className="text-destructive text-sm sm:text-base break-words">{error}</p>
          <button className="mt-2 text-destructive font-semibold hover:underline transition-all duration-200 hover:text-destructive/80 text-sm sm:text-base touch-manipulation">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}