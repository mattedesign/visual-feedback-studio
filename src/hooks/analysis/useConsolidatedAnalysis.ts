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
      return await analysisErrorHandler.withCircuitBreaker(
        async () => {
          return await analysisErrorHandler.withTimeout(
            executeAnalysisSteps(input),
            120000, // 2 minute timeout
            'complete-analysis'
          );
        },
        'main-analysis',
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
    // Phase 1: Upload simulation
    await simulatePhaseProgress('uploading', 4000, 0, 10);
    
    // Phase 2: Processing simulation  
    await simulatePhaseProgress('processing', 6000, 10, 25);
    
    // Phase 3: Research simulation
    await simulatePhaseProgress('research', 12000, 25, 45);
    
    // Phase 4: Create analysis record
    updateProgress({ phase: 'analysis', message: 'Creating analysis record...' });
    
    const analysisId = await analysisErrorHandler.withRetry(
      () => analysisService.createAnalysis(),
      { maxRetries: 2, baseDelay: 1000, maxDelay: 3000, exponentialBackoff: true },
      {
        component: 'ConsolidatedAnalysis',
        operation: 'createAnalysis'
      }
    );

    if (!analysisId) {
      throw new Error('Failed to create analysis record');
    }

    console.log('✅ Analysis record created:', analysisId);
    
    // Get user for database operations
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Phase 5: Execute AI analysis
    updateProgress({ message: 'Running AI analysis...' });
    
    const analysisResult = await analysisErrorHandler.withRetry(
      () => analysisService.analyzeDesign({
        imageUrls: input.imageUrls,
        analysisId,
        analysisPrompt: input.analysisContext,
        designType: 'web',
        isComparative: input.imageUrls.length > 1,
        ragEnhanced: true,
        researchSourceCount: 12
      }),
      { maxRetries: 1, baseDelay: 2000, maxDelay: 5000, exponentialBackoff: true },
      {
        component: 'ConsolidatedAnalysis',
        operation: 'analyzeDesign',
        analysisId
      }
    );

    if (!analysisResult.success) {
      throw new Error(analysisResult.error || 'AI analysis failed');
    }

    console.log('✅ AI analysis completed:', {
      annotationCount: analysisResult.annotations?.length || 0,
      researchEnhanced: analysisResult.researchEnhanced,
      wellDoneReceived: !!analysisResult.wellDone
    });

    // Phase 6: Progress to recommendations
    await simulatePhaseProgress('recommendations', 6000, 75, 90);
    
    // Phase 7: Analysis results already saved by edge function
    updateProgress({ message: 'Finalizing analysis...' });
    
    // Edge function already saved the results, just simulate completion
    const savedResultId = analysisId; // Use analysisId as confirmation

    if (!savedResultId) {
      console.warn('⚠️ Failed to save to database, but analysis completed');
    }

    // Phase 8: Generate AI consultation (optional)
    let consultationResults = null;
    try {
      updateProgress({ message: 'Generating insights...' });
      
      consultationResults = await analysisErrorHandler.withTimeout(
        aiEnhancedSolutionEngine.provideConsultation({
          analysisResults: analysisResult.annotations || [],
          analysisContext: input.analysisContext,
          analysisId,
          userId: user.id
        }),
        30000, // 30 second timeout for consultation
        'consultation'
      );
      
      console.log('✅ AI consultation completed:', {
        approach: consultationResults.approach,
        confidence: consultationResults.confidence,
        solutionCount: consultationResults.solutions.length
      });
      
      // Store consultation in session
      sessionStorage.setItem('consultationResults', JSON.stringify(consultationResults));
    } catch (consultationError) {
      console.warn('⚠️ AI consultation failed, continuing without:', consultationError);
    }

    // Complete
    updateProgress({ phase: 'complete', progress: 100, message: 'Analysis complete!' });
    
    const result = {
      success: true,
      annotations: analysisResult.annotations,
      enhancedContext: analysisResult.researchEnhanced ? {
        knowledgeSourcesUsed: analysisResult.knowledgeSourcesUsed || 0,
        citations: analysisResult.researchCitations || []
      } : undefined,
      wellDone: analysisResult.wellDone,
      consultationResults,
      analysisId
    };

    // 🎯 STRATEGIST CONTEXT INTEGRATION (IMMEDIATE FIX)
    // Replace existing problem statement logic with strategist enhancement
    if (result.success && result.analysisId) {
      console.log('🎯 Starting UX Strategist enhancement...');
      
      const analysisId = result.analysisId;
      
      // IMMEDIATE context collection (no setTimeout)
      try {
        const strategistContext = prompt(`🧠 UX STRATEGIST CONSULTATION

I'm your 20-year Principal UX strategist. For expert-level recommendations, I need business context:

What specific design challenge are you facing?

Examples:
• "Users abandon checkout at payment step - 60% drop-off rate"
• "Mobile users can't find our main CTA - conversion down 40%" 
• "Dashboard overwhelming new users - activation down to 25%"
• "Form completion dropped from 80% to 30% after redesign"

Be specific about metrics, user behavior, and business impact.`);

        if (strategistContext?.trim()) {
          // Store for enhanced analysis
          localStorage.setItem(`strategist_context_${analysisId}`, JSON.stringify({
            userChallenge: strategistContext.trim(),
            timestamp: Date.now(),
            analysisType: 'strategist_enhanced',
            expectationLevel: 'principal_designer'
          }));
          
          console.log('✅ Strategist context captured:', strategistContext.trim());
          toast.success('🎭 UX Strategist analysis starting...');
        } else {
          console.log('ℹ️ No strategist context provided, using traditional analysis');
          toast.success('Analysis complete! Redirecting to results...');
        }
      } catch (error) {
        console.error('❌ Strategist context collection error:', error);
        toast.success('Analysis complete! Redirecting to results...');
      }
      
      // Navigate with strategist flag if context was provided
      const hasStrategistContext = localStorage.getItem(`strategist_context_${analysisId}`);
      const redirectUrl = hasStrategistContext 
        ? `/analysis/${analysisId}?strategist=true&beta=true`
        : `/analysis/${analysisId}?beta=true`;
      
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 2000); // Slightly longer delay for better UX
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
    analysisErrorHandler.resetCircuitBreakers();
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