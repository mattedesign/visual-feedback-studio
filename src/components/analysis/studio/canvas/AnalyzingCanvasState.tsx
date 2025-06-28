import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { useAIAnalysis } from '@/hooks/analysis/useAIAnalysis';
import { Loader2, Brain, Search, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

interface AnalyzingCanvasStateProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const AnalyzingCanvasState = ({ workflow }: AnalyzingCanvasStateProps) => {
  const [currentPhase, setCurrentPhase] = useState<'initializing' | 'rag' | 'analysis' | 'complete'>('initializing');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const { analyzeImages, isAnalyzing } = useAIAnalysis();

  // Start analysis when component mounts
  useEffect(() => {
    const runAnalysis = async () => {
      try {
        console.log('🚀 AnalyzingCanvasState: Starting real analysis');
        
        setCurrentPhase('initializing');
        setPhaseProgress(0);
        
        // Simulate phase progression
        setTimeout(() => {
          setCurrentPhase('rag');
          setPhaseProgress(25);
        }, 1000);
        
        setTimeout(() => {
          setCurrentPhase('analysis');
          setPhaseProgress(50);
        }, 3000);

        // Prepare user annotations in the expected format
        const userAnnotations = workflow.imageAnnotations.flatMap(imageAnnotation => 
          imageAnnotation.annotations.map(annotation => ({
            imageUrl: imageAnnotation.imageUrl,
            x: annotation.x,
            y: annotation.y,
            comment: annotation.comment,
            id: annotation.id
          }))
        );

        // Call the AI analysis
        const result = await analyzeImages({
          imageUrls: workflow.selectedImages,
          userAnnotations,
          analysisPrompt: workflow.analysisContext || 'Analyze this design for UX improvements',
          deviceType: 'desktop'
        });
        
        setCurrentPhase('complete');
        setPhaseProgress(100);
        
        if (result.success && result.annotations) {
          workflow.setAiAnnotations(result.annotations);
          console.log('✅ AnalyzingCanvasState: Analysis complete, moving to results');
          
          // Move to results after a brief delay
          setTimeout(() => {
            workflow.goToStep('results');
          }, 1500);
        } else {
          throw new Error('Analysis failed to return results');
        }
        
      } catch (error) {
        console.error('❌ AnalyzingCanvasState: Analysis failed:', error);
        toast.error('Analysis failed. Please try again.');
        workflow.goToStep('annotate');
      }
    };

    runAnalysis();
  }, []); // Only run once when component mounts

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
      case 'complete':
        return {
          icon: <Lightbulb className="w-6 h-6" />,
          title: 'Analysis Complete',
          description: 'Finalizing results and preparing recommendations...',
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
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
