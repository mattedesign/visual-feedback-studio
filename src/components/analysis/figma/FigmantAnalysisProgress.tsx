// Phase 3.2: Advanced Progress Tracking for Figmant
// Real-time Supabase channel updates with stage-by-stage progress and business impact tracking

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Circle, 
  AlertCircle, 
  Loader, 
  Brain, 
  Eye, 
  Lightbulb, 
  Target,
  Zap,
  TrendingUp,
  Shield,
  Cpu,
  Database,
  RefreshCw,
  XCircle,
  Clock,
  Star,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced interfaces for Phase 3.2
interface EnhancedProgressStep {
  id: string;
  label: string;
  icon: React.ElementType;
  status: 'pending' | 'active' | 'complete' | 'error' | 'warning';
  description: string;
  subSteps?: string[];
  currentSubStep?: string;
  estimatedDuration?: number; // seconds
  actualDuration?: number; // seconds
  businessImpact?: string;
  metrics?: {
    processed?: number;
    total?: number;
    confidence?: number;
    issues_found?: number;
  };
}

interface FigmantAnalysisProgressProps {
  sessionId: string;
  onComplete?: (results?: any) => void;
  onError?: (error: string) => void;
  showBusinessMetrics?: boolean;
  showDetailedLogs?: boolean;
}

interface AnalysisMetrics {
  totalIssues: number;
  criticalIssues: number;
  averageConfidence: number;
  quickWins: number;
  estimatedROI: number;
  patternsAnalyzed: number;
  processingTime: number;
  modelUsed?: string;
}

export const FigmantAnalysisProgress: React.FC<FigmantAnalysisProgressProps> = ({ 
  sessionId,
  onComplete,
  onError,
  showBusinessMetrics = true,
  showDetailedLogs = false
}) => {
  const [steps, setSteps] = useState<EnhancedProgressStep[]>([
    { 
      id: 'upload', 
      label: 'Processing Images', 
      icon: Database,
      status: 'complete',
      description: 'Images uploaded and validated',
      subSteps: ['Upload validation', 'Format optimization', 'Storage preparation'],
      estimatedDuration: 5,
      businessImpact: 'Foundation for analysis quality'
    },
    { 
      id: 'vision', 
      label: 'Vision Intelligence', 
      icon: Eye,
      status: 'active',
      description: 'Detecting UI elements with Google Vision AI',
      subSteps: ['Element detection', 'Layout analysis', 'Text recognition', 'Color extraction'],
      estimatedDuration: 15,
      businessImpact: 'Identifies visual hierarchy issues'
    },
    { 
      id: 'analysis', 
      label: 'Multi-Model UX Analysis', 
      icon: Brain,
      status: 'pending',
      description: 'AI-powered pattern analysis with fallback models',
      subSteps: ['Claude Opus analysis', 'Pattern matching', 'Confidence validation', 'Issue categorization'],
      estimatedDuration: 20,
      businessImpact: 'Core UX insights and recommendations'
    },
    { 
      id: 'business', 
      label: 'Business Impact Calculation', 
      icon: TrendingUp,
      status: 'pending',
      description: 'ROI projections and implementation roadmap',
      subSteps: ['ROI calculation', 'Priority matrix', 'Implementation timeline', 'A/B test hypotheses'],
      estimatedDuration: 10,
      businessImpact: 'Quantifies business value of fixes'
    },
    { 
      id: 'rag', 
      label: 'Research Enhancement', 
      icon: Sparkles,
      status: 'pending',
      description: 'Knowledge base and competitive intelligence',
      subSteps: ['Knowledge matching', 'Pattern validation', 'Research citations', 'Best practices'],
      estimatedDuration: 8,
      businessImpact: 'Evidence-based recommendations'
    },
    { 
      id: 'complete', 
      label: 'Analysis Complete', 
      icon: Lightbulb,
      status: 'pending',
      description: 'Generating final insights and action items',
      subSteps: ['Results compilation', 'Confidence scoring', 'Quick wins identification'],
      estimatedDuration: 3,
      businessImpact: 'Ready for implementation'
    }
  ]);
  
  const [currentMessage, setCurrentMessage] = useState('Initializing enhanced Figmant analysis...');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [analyticsMetrics, setAnalyticsMetrics] = useState<AnalysisMetrics>({
    totalIssues: 0,
    criticalIssues: 0,
    averageConfidence: 0,
    quickWins: 0,
    estimatedROI: 0,
    patternsAnalyzed: 0,
    processingTime: 0
  });
  const [detailedLogs, setDetailedLogs] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const channelRef = useRef<any>(null);

  // Enhanced real-time progress tracking
  useEffect(() => {
    console.log('🔔 Setting up enhanced Figmant progress tracking for session:', sessionId);
    
    const channel = supabase
      .channel(`figmant-analysis-${sessionId}`)
      .on('broadcast', { event: 'progress' }, ({ payload }) => {
        console.log('📊 Progress update received:', payload);
        
        setCurrentMessage(payload.message || 'Processing...');
        setProgress(payload.progress || 0);
        
        // Add to detailed logs
        if (showDetailedLogs) {
          setDetailedLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${payload.message}`].slice(-10));
        }
        
        // Enhanced stage tracking with sub-steps
        updateStageProgress(payload);
        
        // Update metrics if provided
        if (payload.metrics) {
          updateAnalyticsMetrics(payload.metrics);
        }
        
        // Handle completion
        if (payload.stage === 'complete') {
          handleAnalysisComplete(payload);
        }
        
        // Enhanced error handling
        if (payload.stage === 'error') {
          handleAnalysisError(payload);
        }
      })
      .subscribe((status) => {
        console.log('📡 Supabase channel status:', status);
        if (status === 'SUBSCRIBED') {
          addLog('Connected to real-time progress updates');
        }
      });
    
    channelRef.current = channel;
    
    return () => {
      console.log('🔌 Cleaning up Figmant progress channel');
      channel.unsubscribe();
    };
  }, [sessionId, showDetailedLogs]);

  const updateStageProgress = (payload: any) => {
    const stageMap = {
      'upload': { step: 'upload', next: 'vision' },
      'vision': { step: 'vision', next: 'analysis' },
      'analysis': { step: 'analysis', next: 'business' },
      'business': { step: 'business', next: 'rag' },
      'insights': { step: 'rag', next: 'complete' },
      'complete': { step: 'complete', next: null }
    };

    const stageInfo = stageMap[payload.stage];
    if (!stageInfo) return;

    setSteps(prev => prev.map(step => {
      // Mark previous steps as complete
      const currentIndex = prev.findIndex(s => s.id === stageInfo.step);
      const stepIndex = prev.findIndex(s => s.id === step.id);
      
      if (stepIndex < currentIndex) {
        return { ...step, status: 'complete' as const };
      }
      
      // Update current step
      if (step.id === stageInfo.step) {
        const updatedStep = {
          ...step,
          status: payload.stage === 'complete' ? 'complete' as const : 'active' as const,
          currentSubStep: payload.subStep || step.currentSubStep,
          actualDuration: payload.duration || step.actualDuration
        };
        
        // Add metrics if available
        if (payload.stepMetrics) {
          updatedStep.metrics = { ...step.metrics, ...payload.stepMetrics };
        }
        
        return updatedStep;
      }
      
      return step;
    }));
  };

  const updateAnalyticsMetrics = (metrics: Partial<AnalysisMetrics>) => {
    setAnalyticsMetrics(prev => ({
      ...prev,
      ...metrics,
      processingTime: (Date.now() - startTimeRef.current) / 1000
    }));
  };

  const handleAnalysisComplete = (payload: any) => {
    setSteps(prev => prev.map(step => ({ ...step, status: 'complete' as const })));
    addLog('Analysis completed successfully!');
    
    // Final metrics update
    if (payload.finalMetrics) {
      updateAnalyticsMetrics(payload.finalMetrics);
    }
    
    onComplete?.(payload.results);
  };

  const handleAnalysisError = (payload: any) => {
    setError(payload.message || 'Analysis failed');
    addLog(`Error: ${payload.message}`);
    
    // Mark current active step as error
    setSteps(prev => prev.map(step => 
      step.status === 'active' ? { ...step, status: 'error' as const } : step
    ));
    
    onError?.(payload.message);
  };

  const addLog = (message: string) => {
    if (showDetailedLogs) {
      setDetailedLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`].slice(-10));
    }
  };

  const retryAnalysis = async () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setProgress(0);
    setCurrentMessage('Retrying analysis...');
    
    // Reset steps to initial state
    setSteps(prev => prev.map((step, index) => ({
      ...step,
      status: index === 0 ? 'complete' : index === 1 ? 'active' : 'pending'
    })));
    
    // Note: In a real implementation, you would trigger the analysis restart here
    addLog(`Retry attempt #${retryCount + 1}`);
  };

  const getStepIcon = (step: EnhancedProgressStep) => {
    const IconComponent = step.icon;
    
    switch(step.status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'active':
        return <Loader className="w-5 h-5 text-primary animate-spin" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-warning" />;
      default:
        return <IconComponent className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getEstimatedTimeRemaining = () => {
    const activeStepIndex = steps.findIndex(step => step.status === 'active');
    if (activeStepIndex === -1) return 0;
    
    const remainingSteps = steps.slice(activeStepIndex);
    return remainingSteps.reduce((total, step) => total + (step.estimatedDuration || 0), 0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Enhanced Header with Real-time Metrics */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader className="text-center pb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Brain className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-bold">Enhanced Figmant Analysis</CardTitle>
          <p className="text-muted-foreground">
            Multi-model AI analysis with business impact insights
          </p>
          
          {/* Real-time Status Badges */}
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant="outline" className="bg-background/50">
              <Clock className="w-3 h-3 mr-1" />
              ~{getEstimatedTimeRemaining()}s remaining
            </Badge>
            {analyticsMetrics.modelUsed && (
              <Badge variant="outline" className="bg-background/50">
                <Cpu className="w-3 h-3 mr-1" />
                {analyticsMetrics.modelUsed}
              </Badge>
            )}
            <Badge variant="outline" className="bg-background/50">
              <Target className="w-3 h-3 mr-1" />
              Session: {sessionId.slice(-8)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Enhanced Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-mono font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="text-center">
              <p className="text-sm text-primary animate-fade-in font-medium">
                {currentMessage}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Progress Steps */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Analysis Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    {getStepIcon(step)}
                    {index < steps.length - 1 && (
                      <div className={cn(
                        "w-0.5 h-16 mt-2 transition-all duration-500",
                        step.status === 'complete' ? 'bg-green-500' :
                        step.status === 'active' ? 'bg-primary animate-pulse' :
                        'bg-border'
                      )} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Step Header */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={cn(
                        "font-semibold transition-colors duration-200",
                        step.status === 'active' ? 'text-primary' :
                        step.status === 'complete' ? 'text-green-500' :
                        step.status === 'error' ? 'text-destructive' :
                        'text-muted-foreground'
                      )}>
                        {step.label}
                      </h3>
                      
                      {step.estimatedDuration && (
                        <Badge variant="outline" className="text-xs">
                          ~{step.estimatedDuration}s
                        </Badge>
                      )}
                    </div>
                    
                    {/* Step Description */}
                    <p className="text-sm text-muted-foreground mb-2">
                      {step.description}
                    </p>
                    
                    {/* Current Sub-step */}
                    {step.status === 'active' && step.currentSubStep && (
                      <p className="text-xs text-primary animate-fade-in mb-2">
                        → {step.currentSubStep}
                      </p>
                    )}
                    
                    {/* Business Impact */}
                    {showBusinessMetrics && step.businessImpact && (
                      <div className="flex items-center gap-1 mb-2">
                        <TrendingUp className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {step.businessImpact}
                        </span>
                      </div>
                    )}
                    
                    {/* Step Metrics */}
                    {step.metrics && (
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        {step.metrics.processed !== undefined && (
                          <span>Processed: {step.metrics.processed}/{step.metrics.total}</span>
                        )}
                        {step.metrics.confidence !== undefined && (
                          <span>Confidence: {Math.round(step.metrics.confidence * 100)}%</span>
                        )}
                        {step.metrics.issues_found !== undefined && (
                          <span>Issues: {step.metrics.issues_found}</span>
                        )}
                      </div>
                    )}
                    
                    {/* Sub-steps Progress */}
                    {step.status === 'active' && step.subSteps && (
                      <div className="mt-2 space-y-1">
                        {step.subSteps.map((subStep, subIndex) => (
                          <div key={subIndex} className="flex items-center gap-2 text-xs">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              step.currentSubStep === subStep ? 'bg-primary animate-pulse' :
                              subIndex < step.subSteps!.indexOf(step.currentSubStep || '') ? 'bg-green-500' :
                              'bg-muted'
                            )} />
                            <span className={cn(
                              step.currentSubStep === subStep ? 'text-primary font-medium' : 'text-muted-foreground'
                            )}>
                              {subStep}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Business Metrics & Logs Sidebar */}
        <div className="space-y-6">
          {/* Real-time Business Metrics */}
          {showBusinessMetrics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Live Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <div className="font-bold text-lg">{analyticsMetrics.totalIssues}</div>
                    <div className="text-muted-foreground text-xs">Total Issues</div>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <div className="font-bold text-lg text-destructive">{analyticsMetrics.criticalIssues}</div>
                    <div className="text-muted-foreground text-xs">Critical</div>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <div className="font-bold text-lg text-green-600">{analyticsMetrics.quickWins}</div>
                    <div className="text-muted-foreground text-xs">Quick Wins</div>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <div className="font-bold text-lg">{Math.round(analyticsMetrics.averageConfidence * 100)}%</div>
                    <div className="text-muted-foreground text-xs">Confidence</div>
                  </div>
                </div>
                
                {analyticsMetrics.estimatedROI > 0 && (
                  <div className="text-center p-3 bg-primary/10 rounded border border-primary/20">
                    <div className="font-bold text-lg text-primary">${analyticsMetrics.estimatedROI}</div>
                    <div className="text-muted-foreground text-xs">Estimated ROI</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Detailed Logs */}
          {showDetailedLogs && detailedLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-xs font-mono max-h-48 overflow-y-auto">
                  {detailedLogs.map((log, index) => (
                    <div key={index} className="text-muted-foreground">
                      {log}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Enhanced Error State */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-destructive mb-2">Analysis Failed</h3>
                <p className="text-destructive/80 text-sm mb-4">{error}</p>
                <div className="flex gap-2">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={retryAnalysis}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry Analysis
                  </Button>
                  {retryCount > 0 && (
                    <Badge variant="outline">
                      Attempt #{retryCount + 1}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};