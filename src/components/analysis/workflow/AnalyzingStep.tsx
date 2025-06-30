
import { useEffect, useState } from 'react';
import { useAnalysisWorkflow } from '@/hooks/analysis/useAnalysisWorkflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Search, Brain, Target, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { AnalysisProgressSteps } from './components/AnalysisProgressSteps';

interface AnalyzingStepProps {
  workflow: ReturnType<typeof useAnalysisWorkflow>;
}

type AnalysisPhase = 'uploading' | 'processing' | 'research' | 'analysis' | 'recommendations';

interface AnalysisStats {
  totalImages: number;
  totalPromptLength: number;
  estimatedDuration: string;
  aiModelUsed: string;
}

export const AnalyzingStep = ({ workflow }: AnalyzingStepProps) => {
  const [currentPhase, setCurrentPhase] = useState<AnalysisPhase>('processing');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [researchSourcesFound, setResearchSourcesFound] = useState(0);
  const [hasStartedAnalysis, setHasStartedAnalysis] = useState(false);

  const analysisStats: AnalysisStats = {
    totalImages: workflow.selectedImages.length,
    totalPromptLength: workflow.analysisContext.length,
    estimatedDuration: workflow.selectedImages.length > 1 ? '3-5 minutes' : '2-3 minutes',
    aiModelUsed: workflow.aiProviderConfig.model || 'Auto Select'
  };

  const completeStep = (stepId: string) => {
    console.log(`✅ Step completed: ${stepId}`);
    setCompletedSteps(prev => {
      if (!prev.includes(stepId)) {
        return [...prev, stepId];
      }
      return prev;
    });
  };

  useEffect(() => {
    if (hasStartedAnalysis || !workflow.analysisContext.trim() || workflow.selectedImages.length === 0) {
      console.log('⚠️ AnalyzingStep: Skipping analysis start', {
        hasStartedAnalysis,
        hasContext: !!workflow.analysisContext.trim(),
        hasImages: workflow.selectedImages.length > 0
      });
      return;
    }

    console.log('🚀 AnalyzingStep: Starting analysis with progress');
    setHasStartedAnalysis(true);
    
    const runAnalysisWithProgress = async () => {
      try {
        // Phase 1: Processing uploaded files
        setCurrentPhase('processing');
        setPhaseProgress(10);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        completeStep('uploading');
        
        // Phase 2: Research context building
        setCurrentPhase('research');
        setPhaseProgress(25);
        
        // Simulate research sources being found
        for (let i = 1; i <= 8; i++) {
          await new Promise(resolve => setTimeout(resolve, 600));
          setResearchSourcesFound(i);
          setPhaseProgress(25 + (i * 4)); // Progress 25-57
        }
        
        completeStep('processing');
        
        // Phase 3: AI Analysis
        setCurrentPhase('analysis');
        setPhaseProgress(60);
        
        // Start real analysis
        await workflow.startAnalysis();
        
        completeStep('research');
        
        // Phase 4: Recommendations
        setCurrentPhase('recommendations');
        setPhaseProgress(85);
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        setPhaseProgress(100);
        completeStep('analysis');
        completeStep('recommendations');
        
        console.log('✅ AnalyzingStep: Analysis completed successfully');
        
      } catch (error) {
        console.error('❌ AnalyzingStep: Analysis failed:', error);
      }
    };

    runAnalysisWithProgress();
  }, [workflow.analysisContext, workflow.selectedImages.length, hasStartedAnalysis, workflow.startAnalysis]);

  // Monitor workflow state changes for real data
  useEffect(() => {
    // Fix: Check if knowledgeSourcesUsed exists and is a number
    if (workflow.knowledgeSourcesUsed && workflow.knowledgeSourcesUsed > 0) {
      setResearchSourcesFound(workflow.knowledgeSourcesUsed);
      completeStep('research');
    }
    
    if (workflow.aiAnnotations && workflow.aiAnnotations.length > 0) {
      setCurrentPhase('recommendations');
      setPhaseProgress(100);
      completeStep('analysis');
    }
  }, [workflow.knowledgeSourcesUsed, workflow.aiAnnotations]);

  const phaseIcons = {
    uploading: Target,
    processing: Search,
    research: Sparkles,
    analysis: Brain,
    recommendations: CheckCircle
  };

  const PhaseIcon = phaseIcons[currentPhase];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <PhaseIcon className="w-8 h-8 text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold">Analyzing Your Design</h1>
          </div>
          <p className="text-slate-300 text-lg">
            Our AI is performing a comprehensive analysis of your design using advanced UX research principles
          </p>
        </div>

        {/* Analysis Progress */}
        <div className="mb-8">
          <AnalysisProgressSteps
            currentStep={currentPhase}
            progress={phaseProgress}
            researchSourcesFound={researchSourcesFound}
            totalImages={analysisStats.totalImages}
            completedSteps={completedSteps}
            onStepComplete={completeStep}
          />
        </div>

        {/* Analysis Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Images</p>
                  <p className="text-2xl font-bold text-white">{analysisStats.totalImages}</p>
                </div>
                <Target className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Context Length</p>
                  <p className="text-2xl font-bold text-white">{analysisStats.totalPromptLength}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Est. Duration</p>
                  <p className="text-lg font-bold text-white">{analysisStats.estimatedDuration}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">AI Model</p>
                  <p className="text-sm font-bold text-white">{analysisStats.aiModelUsed}</p>
                </div>
                <Brain className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Phase Details */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PhaseIcon className="w-5 h-5 mr-2 text-blue-400" />
              Current Phase: {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-300">Progress</span>
                  <span className="text-sm text-slate-300">{phaseProgress}%</span>
                </div>
                <Progress value={phaseProgress} className="h-2" />
              </div>

              {currentPhase === 'research' && (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-blue-600 text-white">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Research Enhanced
                  </Badge>
                  <span className="text-sm text-slate-300">
                    {researchSourcesFound} research sources found
                  </span>
                </div>
              )}

              {currentPhase === 'analysis' && (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-purple-600 text-white">
                    <Brain className="w-3 h-3 mr-1" />
                    AI Analysis
                  </Badge>
                  <span className="text-sm text-slate-300">
                    Analyzing design patterns and UX principles
                  </span>
                </div>
              )}

              {currentPhase === 'recommendations' && (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-600 text-white">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Generating Recommendations
                  </Badge>
                  <span className="text-sm text-slate-300">
                    Creating actionable insights and suggestions
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
