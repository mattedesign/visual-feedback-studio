
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle, Loader2 } from 'lucide-react';

interface ProcessingStateProps {
  fileName?: string;
  totalFiles?: number;
  currentFileIndex?: number;
}

export const ProcessingState = ({ 
  fileName = "your design", 
  totalFiles = 1,
  currentFileIndex = 1 
}: ProcessingStateProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Uploading');

  useEffect(() => {
    const steps = [
      { name: 'Uploading', duration: 2000 },
      { name: 'Optimizing', duration: 1500 },
      { name: 'Validating', duration: 1000 },
      { name: 'Preparing', duration: 500 }
    ];

    let currentStepIndex = 0;
    let stepProgress = 0;

    const updateProgress = () => {
      if (currentStepIndex >= steps.length) {
        setProgress(100);
        setCurrentStep('Complete');
        return;
      }

      const step = steps[currentStepIndex];
      setCurrentStep(step.name);

      const stepIncrement = 100 / steps.length;
      const baseProgress = currentStepIndex * stepIncrement;
      const currentProgress = baseProgress + (stepProgress * stepIncrement / 100);
      
      setProgress(Math.min(currentProgress, 100));

      stepProgress += 5;
      
      if (stepProgress >= 100) {
        currentStepIndex++;
        stepProgress = 0;
      }
    };

    const interval = setInterval(updateProgress, 100);
    return () => clearInterval(interval);
  }, []);

  const isMultiFile = totalFiles > 1;

  return (
    <Card className="max-w-2xl mx-auto bg-slate-800/50 border-slate-700">
      <CardContent className="p-12 text-center">
        <div className="space-y-6">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto bg-blue-500 rounded-full flex items-center justify-center">
            {progress >= 100 ? (
              <CheckCircle className="w-8 h-8 text-white" />
            ) : (
              <Upload className="w-8 h-8 text-white" />
            )}
          </div>

          {/* Title */}
          <div>
            <h3 className="text-xl font-semibold mb-2 text-white">
              {progress >= 100 ? 'Upload Complete!' : `${currentStep} ${fileName}`}
            </h3>
            
            {isMultiFile && (
              <p className="text-slate-400 text-sm mb-4">
                Processing file {currentFileIndex} of {totalFiles}
              </p>
            )}
            
            <p className="text-slate-400">
              {progress >= 100 
                ? 'Your design is ready for analysis'
                : 'Preparing your design for enhanced UX analysis...'
              }
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress 
              value={progress} 
              className="h-3 bg-slate-700"
            />
            <div className="flex justify-between text-sm text-slate-400">
              <span>{currentStep}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Processing Steps Indicator */}
          <div className="flex justify-center space-x-4 text-xs">
            {['Upload', 'Optimize', 'Validate', 'Prepare'].map((step, index) => {
              const stepProgress = Math.max(0, Math.min(100, (progress - (index * 25)) * 4));
              const isActive = stepProgress > 0 && stepProgress < 100;
              const isComplete = stepProgress >= 100;
              
              return (
                <div key={step} className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isComplete 
                      ? 'bg-green-500 text-white' 
                      : isActive 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-slate-600 text-slate-400'
                  }`}>
                    {isComplete ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : isActive ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                  </div>
                  <span className={`${
                    isComplete 
                      ? 'text-green-400' 
                      : isActive 
                      ? 'text-blue-400' 
                      : 'text-slate-500'
                  }`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Educational Tip */}
          <div className="bg-slate-700/50 rounded-lg p-3 text-left">
            <p className="text-slate-300 text-sm">
              💡 <strong>Did you know?</strong> Our enhanced analysis combines visual AI with 
              research from 272+ UX studies to provide evidence-backed recommendations.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
