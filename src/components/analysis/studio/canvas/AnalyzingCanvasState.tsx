
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { Loader2, Brain, Search, Lightbulb } from 'lucide-react';

interface AnalyzingCanvasStateProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const AnalyzingCanvasState = ({ workflow }: AnalyzingCanvasStateProps) => {
  const [currentPhase, setCurrentPhase] = useState<'initializing' | 'rag' | 'analysis' | 'results'>('initializing');
  const [phaseProgress, setPhaseProgress] = useState(0);

  useEffect(() => {
    // Simulate analysis phases
    const phases = [
      { name: 'initializing', duration: 1000, label: 'Initializing Analysis...' },
      { name: 'rag', duration: 3000, label: 'Building Research Context...' },
      { name: 'analysis', duration: 5000, label: 'Analyzing Design...' },
      { name: 'results', duration: 1000, label: 'Preparing Results...' }
    ];

    let currentIndex = 0;
    
    const runPhase = () => {
      if (currentIndex >= phases.length) return;
      
      const phase = phases[currentIndex];
      setCurrentPhase(phase.name as any);
      setPhaseProgress(0);
      
      // Animate progress for this phase
      const progressInterval = setInterval(() => {
        setPhaseProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            currentIndex++;
            setTimeout(runPhase, 200); // Brief pause between phases
            return 100;
          }
          return prev + (100 / (phase.duration / 100));
        });
      }, 100);
    };

    runPhase();
  }, []);

  const getPhaseInfo = () => {
    switch (currentPhase) {
      case 'initializing':
        return {
          icon: <Loader2 className="w-6 h-6 animate-spin" />,
          title: 'Initializing Analysis',
          description: 'Setting up analysis parameters and preparing images...',
          color: 'from-blue-500 to-blue-600'
        };
      case 'rag':
        return {
          icon: <Search className="w-6 h-6" />,
          title: 'Building Research Context',
          description: 'Searching UX knowledge base for relevant patterns and best practices...',
          color: 'from-purple-500 to-purple-600'
        };
      case 'analysis':
        return {
          icon: <Brain className="w-6 h-6" />,
          title: 'Analyzing Design',
          description: 'AI is examining your design using research-backed insights...',
          color: 'from-pink-500 to-pink-600'
        };
      case 'results':
        return {
          icon: <Lightbulb className="w-6 h-6" />,
          title: 'Preparing Results',
          description: 'Finalizing analysis and generating recommendations...',
          color: 'from-green-500 to-green-600'
        };
      default:
        return {
          icon: <Loader2 className="w-6 h-6 animate-spin" />,
          title: 'Processing',
          description: 'Please wait...',
          color: 'from-gray-500 to-gray-600'
        };
    }
  };

  const phaseInfo = getPhaseInfo();

  return (
    <div className="h-full flex items-center justify-center p-8">
      <Card className="w-full max-w-lg bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardContent className="p-8 text-center">
          {/* Phase Icon */}
          <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${phaseInfo.color} flex items-center justify-center mx-auto mb-6 text-white`}>
            {phaseInfo.icon}
          </div>

          {/* Phase Title */}
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {phaseInfo.title}
          </h3>

          {/* Phase Description */}
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {phaseInfo.description}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mb-4">
            <div 
              className={`h-2 rounded-full bg-gradient-to-r ${phaseInfo.color} transition-all duration-300 ease-out`}
              style={{ width: `${phaseProgress}%` }}
            />
          </div>

          {/* Progress Percentage */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round(phaseProgress)}% complete
          </p>

          {/* Analysis Context */}
          {workflow.analysisContext && (
            <div className="mt-6 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-medium">Focus:</span> {workflow.analysisContext}
              </p>
            </div>
          )}

          {/* Image Count */}
          <div className="mt-4">
            <Badge variant="outline" className="text-gray-600 dark:text-gray-300">
              Analyzing {workflow.selectedImages.length} image{workflow.selectedImages.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
