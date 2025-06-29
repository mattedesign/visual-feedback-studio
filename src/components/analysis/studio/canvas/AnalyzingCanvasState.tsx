
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { Loader2, Brain, Search, Lightbulb, CheckCircle } from 'lucide-react';

interface AnalyzingCanvasStateProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

export const AnalyzingCanvasState = ({ workflow }: AnalyzingCanvasStateProps) => {
  const [currentPhase, setCurrentPhase] = useState<'initializing' | 'vision' | 'rag' | 'analysis' | 'complete'>('initializing');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [hasStartedAnalysis, setHasStartedAnalysis] = useState(false);

  useEffect(() => {
    // Only start analysis once and if we have the required data
    if (hasStartedAnalysis || !workflow.analysisContext.trim() || workflow.selectedImages.length === 0) {
      console.log('⚠️ AnalyzingCanvasState: Skipping analysis start', {
        hasStartedAnalysis,
        hasContext: !!workflow.analysisContext.trim(),
        hasImages: workflow.selectedImages.length > 0
      });
      return;
    }

    console.log('🚀 AnalyzingCanvasState: Starting real analysis execution');
    setHasStartedAnalysis(true);
    
    // Start the actual analysis workflow
    const runAnalysis = async () => {
      try {
        setCurrentPhase('initializing');
        setPhaseProgress(10);
        
        // Short delay for UI feedback
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setCurrentPhase('vision');
        setPhaseProgress(25);
        console.log('🔍 Starting Google Vision analysis phase');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setCurrentPhase('rag');
        setPhaseProgress(50);
        console.log('🧠 Starting RAG context building phase');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setCurrentPhase('analysis');
        setPhaseProgress(75);
        console.log('🤖 Starting AI analysis phase');
        
        // Trigger the actual analysis using the workflow's method
        await workflow.startAnalysis();
        
        setCurrentPhase('complete');
        setPhaseProgress(100);
        
        console.log('✅ AnalyzingCanvasState: Analysis completed successfully');
        
      } catch (error) {
        console.error('❌ AnalyzingCanvasState: Analysis failed:', error);
        // Let the workflow handle the error state
      }
    };

    runAnalysis();
  }, [workflow.analysisContext, workflow.selectedImages.length, hasStartedAnalysis, workflow.startAnalysis]);

  // Monitor workflow state changes
  useEffect(() => {
    console.log('📊 AnalyzingCanvasState: Workflow state update:', {
      isAnalyzing: workflow.isAnalyzing,
      isBuilding: workflow.isBuilding,
      buildingStage: workflow.buildingStage,
      aiAnnotationsCount: workflow.aiAnnotations?.length || 0,
      currentStep: workflow.currentStep
    });

    // Update phase based on workflow state
    if (workflow.isBuilding && workflow.buildingStage) {
      if (workflow.buildingStage.includes('Vision')) {
        setCurrentPhase('vision');
        setPhaseProgress(40);
      } else if (workflow.buildingStage.includes('context')) {
        setCurrentPhase('rag');
        setPhaseProgress(60);
      }
    }

    // If we have AI annotations, we're complete
    if (workflow.aiAnnotations && workflow.aiAnnotations.length > 0) {
      setCurrentPhase('complete');
      setPhaseProgress(100);
    }
  }, [workflow.isAnalyzing, workflow.isBuilding, workflow.buildingStage, workflow.aiAnnotations]);

  const getPhaseInfo = () => {
    switch (currentPhase) {
      case 'initializing':
        return {
          icon: <Loader2 className="w-6 h-6 animate-spin" />,
          title: 'Initializing Analysis',
          description: 'Setting up analysis parameters and preparing images...',
          color: 'from-blue-500 to-blue-600'
        };
      case 'vision':
        return {
          icon: <Search className="w-6 h-6 animate-pulse" />,
          title: 'Vision Analysis',
          description: 'Analyzing UI elements and design patterns with Google Vision...',
          color: 'from-purple-500 to-purple-600'
        };
      case 'rag':
        return {
          icon: <Brain className="w-6 h-6 animate-pulse" />,
          title: 'Building Context',
          description: 'Retrieving relevant UX knowledge and best practices...',
          color: 'from-pink-500 to-pink-600'
        };
      case 'analysis':
        return {
          icon: <Brain className="w-6 h-6 animate-pulse" />,
          title: 'AI Analysis',
          description: 'Generating insights and recommendations...',
          color: 'from-orange-500 to-orange-600'
        };
      case 'complete':
        return {
          icon: <CheckCircle className="w-6 h-6" />,
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
              className={`h-2 rounded-full bg-gradient-to-r ${phaseInfo.color} transition-all duration-500 ease-out`}
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

          {/* Image Count - Show selected images only */}
          <div className="mt-4">
            <Badge variant="outline" className="text-gray-600 dark:text-gray-300">
              Analyzing {workflow.selectedImages.length} image{workflow.selectedImages.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Enhanced Context Status */}
          {workflow.enhancedContext && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Enhanced with {workflow.enhancedContext.knowledgeSourcesUsed} knowledge sources
                {workflow.enhancedContext.visionAnalysis?.uiElements?.length > 0 && 
                  ` • Detected ${workflow.enhancedContext.visionAnalysis.uiElements.length} UI elements`
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
