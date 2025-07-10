import { useState, useCallback, useRef, useEffect } from 'react';
import { analysisErrorHandler } from '@/utils/analysisErrorHandler';
import { analysisService } from '@/services/analysisService';
// import { saveAnalysisResults } from '@/services/analysisResultsService'; // No longer needed - edge function handles saving
import { aiEnhancedSolutionEngine } from '@/services/solutions/aiEnhancedSolutionEngine';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AnalysisInput {
  imageUrls: string[];
  analysisContext: string;
  userAnnotations?: any[];
  deviceType?: 'desktop' | 'tablet' | 'mobile';
}

interface AnalysisProgress {
  phase: 'idle' | 'uploading' | 'processing' | 'research' | 'analysis' | 'validation' | 'recommendations' | 'complete';
  progress: number;
  message: string;
  researchSourcesFound: number;
}

interface AnalysisResult {
  success: boolean;
  annotations?: any[];
  enhancedContext?: any;
  wellDone?: any;
  consultationResults?: any;
  analysisId?: string;
  error?: string;
}

export const useConsolidatedAnalysis = () => {
  const [progress, setProgress] = useState<AnalysisProgress>({
    phase: 'idle',
    progress: 0,
    message: '',
    researchSourcesFound: 0
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStartTime, setAnalysisStartTime] = useState<Date | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      analysisErrorHandler.cancelAllOperations();
    };
  }, []);

  const updateProgress = useCallback((update: Partial<AnalysisProgress>) => {
    setProgress(prev => ({ ...prev, ...update }));
  }, []);

  const simulatePhaseProgress = useCallback(async (
    phase: AnalysisProgress['phase'],
    duration: number,
    startProgress: number,
    endProgress: number
  ) => {
    updateProgress({ phase, message: getPhaseMessage(phase) });
    
    const steps = 20;
    const stepDuration = duration / steps;
    const progressIncrement = (endProgress - startProgress) / steps;
    
    for (let i = 0; i <= steps; i++) {
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Analysis cancelled by user');
      }
      
      const currentProgress = startProgress + (progressIncrement * i);
      updateProgress({ progress: currentProgress });
      
      // Special handling for research phase
      if (phase === 'research' && i > 5) {
        const sourcesFound = Math.min(12, Math.floor((i / steps) * 12));
        updateProgress({ researchSourcesFound: sourcesFound });
      }
      
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
  }, [updateProgress]);

  const executeAnalysis = useCallback(async (input: AnalysisInput): Promise<AnalysisResult> => {
    if (isAnalyzing) {
      console.log('⚠️ Analysis already in progress');
      return { success: false, error: 'Analysis already in progress' };
    }

    // ✅ FIXED: Enhanced validation with proper error messages
    if (input.imageUrls.length === 0) {
      toast.error('Please select at least one image to analyze');
      throw new Error('Please select at least one image to analyze');
    }

    if (!input.analysisContext.trim()) {
      toast.error('Please provide analysis context');
      throw new Error('Please provide analysis context');
    }
    
    if (input.analysisContext.trim().length < 10) {
      toast.error('Analysis context must be at least 10 characters long for meaningful results');
      throw new Error('Analysis context must be at least 10 characters long');
    }
    
    if (input.analysisContext.length > 2000) {
      toast.error('Analysis context must be less than 2000 characters');
      throw new Error('Analysis context must be less than 2000 characters');
    }

    console.log('🚀 Starting consolidated analysis:', {
      imageCount: input.imageUrls.length,
      contextLength: input.analysisContext.length
    });

    setIsAnalyzing(true);
    setAnalysisStartTime(new Date());
    abortControllerRef.current = new AbortController();
    
    updateProgress({
      phase: 'uploading',
      progress: 0,
      message: 'Preparing analysis...',
      researchSourcesFound: 0
    });

    try {
      return await analysisErrorHandler.withSimpleTimeout(
        async () => executeAnalysisSteps(input),
        120000, // 2 minute timeout
        {
          component: 'ConsolidatedAnalysis',
          operation: 'executeAnalysis',
          metadata: { imageCount: input.imageUrls.length }
        }
      );
    } catch (error) {
      analysisErrorHandler.handleError(error, {
        component: 'ConsolidatedAnalysis',
        operation: 'executeAnalysis',
        metadata: { imageCount: input.imageUrls.length }
      });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setIsAnalyzing(false);
      abortControllerRef.current = null;
    }
  }, [isAnalyzing, simulatePhaseProgress, updateProgress]);

  const executeAnalysisSteps = async (input: AnalysisInput): Promise<AnalysisResult> => {
    console.log('🚀 Starting simplified analysis flow');
    
    // Phase 1: Quick prep and create analysis record
    updateProgress({ phase: 'uploading', progress: 0, message: 'Preparing analysis...' });
    
    const analysisId = await analysisService.createAnalysis();
    if (!analysisId) {
      throw new Error('Failed to create analysis record');
    }

    console.log('✅ Analysis record created:', analysisId);
    updateProgress({ progress: 20, message: 'Analysis record created' });
    
    // Phase 2: Execute simple Claude analysis
    updateProgress({ 
      phase: 'analysis', 
      progress: 40, 
      message: 'Running Claude analysis...'
    });
    
    const analysisResult = await analysisService.analyzeDesign({
      imageUrls: input.imageUrls,
      analysisId,
      analysisPrompt: input.analysisContext,
      designType: 'web',
      isComparative: input.imageUrls.length > 1
    });

    if (!analysisResult.success) {
      throw new Error(analysisResult.error || 'Analysis failed');
    }

    console.log('✅ Simple analysis completed:', {
      annotationCount: analysisResult.annotations?.length || 0,
      modelUsed: 'claude-3-5-sonnet-20241022'
    });

    // Phase 3: Complete
    updateProgress({ 
      phase: 'complete', 
      progress: 100, 
      message: 'Analysis complete!'
    });
    
    const result = {
      success: true,
      annotations: analysisResult.annotations,
      enhancedContext: undefined,
      wellDone: null,
      consultationResults: null,
      analysisId
    };

    // Navigate to results
    if (result.success && result.analysisId) {
      console.log('✅ Analysis complete, redirecting to results');
      
      setTimeout(() => {
        window.location.href = `/analysis/${result.analysisId}?beta=true`;
      }, 1000);
    }
    
    return result;
  };

  const cancelAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log('🛑 Analysis cancelled by user');
    }
    analysisErrorHandler.cancelAllOperations();
    setIsAnalyzing(false);
    updateProgress({ phase: 'idle', progress: 0, message: '', researchSourcesFound: 0 });
  }, [updateProgress]);

  const resetState = useCallback(() => {
    setIsAnalyzing(false);
    setAnalysisStartTime(null);
    updateProgress({ phase: 'idle', progress: 0, message: '', researchSourcesFound: 0 });
    // Removed circuit breaker reset - no longer needed
  }, [updateProgress]);

  return {
    // State
    isAnalyzing,
    progress,
    analysisStartTime,
    
    // Actions
    executeAnalysis,
    cancelAnalysis,
    resetState
  };
};

function getPhaseMessage(phase: AnalysisProgress['phase']): string {
  switch (phase) {
    case 'uploading':
      return 'Uploading images...';
    case 'processing':
      return 'Processing design elements...';
    case 'research':
      return 'Searching UX research database...';
    case 'analysis':
      return 'Running AI analysis...';
    case 'validation':
      return 'Validating insights...';
    case 'recommendations':
      return 'Generating recommendations...';
    case 'complete':
      return 'Analysis complete!';
    default:
      return '';
  }
}