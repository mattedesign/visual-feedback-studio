import { useState, useCallback, useRef, useEffect } from 'react';
import { analysisErrorHandler } from '@/utils/analysisErrorHandler';
import { analysisService } from '@/services/analysisService';
import { saveAnalysisResults } from '@/services/analysisResultsService';
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

    // Validation
    if (input.imageUrls.length === 0) {
      throw new Error('Please select at least one image to analyze');
    }

    if (!input.analysisContext.trim()) {
      throw new Error('Please provide analysis context');
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
    
    // Phase 7: Save results to database
    updateProgress({ message: 'Saving results...' });
    
    const savedResultId = await analysisErrorHandler.withRetry(
      () => saveAnalysisResults({
        analysisId,
        annotations: analysisResult.annotations || [],
        images: input.imageUrls,
        analysisContext: input.analysisContext,
        enhancedContext: analysisResult.researchEnhanced ? {
          knowledgeSourcesUsed: analysisResult.knowledgeSourcesUsed || 0,
          citations: analysisResult.researchCitations || []
        } : null,
        wellDoneData: analysisResult.wellDone,
        researchCitations: analysisResult.researchCitations || [],
        knowledgeSourcesUsed: analysisResult.knowledgeSourcesUsed || 0,
        aiModelUsed: 'claude-3-5-sonnet',
        processingTimeMs: Date.now() - (analysisStartTime?.getTime() || Date.now())
      }),
      { maxRetries: 2, baseDelay: 1000, maxDelay: 3000, exponentialBackoff: true },
      {
        component: 'ConsolidatedAnalysis',
        operation: 'saveResults',
        analysisId
      }
    );

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

    // NEW: Add problem statement matching using seeded database
    if (result.success && result.analysisId) {
      console.log('🎯 Starting problem statement matching with seeded data...');
      
      setTimeout(async () => {
        const userChallenge = prompt(`🧪 TEST YOUR PROBLEM STATEMENT SYSTEM

Your database has 10 problem statement templates ready.

Describe your business challenge:`);

        if (userChallenge?.trim()) {
          try {
            // Query your seeded problem_statements table
            const { data: templates, error } = await supabase
              .from('problem_statements')
              .select('*');
            
            if (error) {
              console.error('Error fetching problem statements:', error);
              return;
            }

            if (templates && templates.length > 0) {
              const match = await matchUserToProblemStatement(userChallenge, templates);
              console.log('🎯 MATCH RESULT:', match);
              
              // Store in user_problem_statements table
              const { error: insertError } = await supabase
                .from('user_problem_statements')
                .insert({
                  user_id: user.id,
                  analysis_id: result.analysisId,
                  original_statement: userChallenge,
                  matched_problem_statement_id: match.templateId,
                  extracted_context: match.context
                });

              if (insertError) {
                console.error('Error storing problem statement:', insertError);
              }
              
              alert(`✅ MATCHED: ${match.category} (${Math.round(match.confidence * 100)}% confidence)`);
            } else {
              alert('❌ No problem statement templates found in database');
            }
          } catch (error) {
            console.error('Error in problem statement matching:', error);
            alert('❌ Error matching problem statement');
          }
        }
      }, 2000);
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

// Simple problem statement matching logic
async function matchUserToProblemStatement(userStatement: string, templates: any[]) {
  console.log('🔍 Matching user statement against templates:', {
    userStatement,
    templateCount: templates.length
  });

  let bestMatch = {
    templateId: null,
    category: 'general',
    confidence: 0,
    context: {}
  };

  for (const template of templates) {
    const confidence = calculateMatchingScore(userStatement, template.statement);
    
    if (confidence > bestMatch.confidence) {
      bestMatch = {
        templateId: template.id,
        category: template.category,
        confidence,
        context: extractBusinessContext(userStatement, template.implied_context)
      };
    }
  }

  return bestMatch;
}

// Calculate how well the user statement matches a template
function calculateMatchingScore(userStatement: string, templateStatement: string): number {
  const userWords = userStatement.toLowerCase().split(/\s+/);
  const templateWords = templateStatement.toLowerCase().split(/\s+/);
  
  let matches = 0;
  const totalWords = Math.max(userWords.length, templateWords.length);
  
  for (const word of userWords) {
    if (word.length > 3 && templateWords.some(tw => tw.includes(word) || word.includes(tw))) {
      matches++;
    }
  }
  
  return matches / totalWords;
}

// Extract business context from user statement
function extractBusinessContext(statement: string, templateContext: any) {
  const lowercaseStatement = statement.toLowerCase();
  
  // Extract urgency from keywords
  let urgency = 'medium';
  if (lowercaseStatement.includes('urgent') || lowercaseStatement.includes('immediately')) {
    urgency = 'high';
  } else if (lowercaseStatement.includes('eventually') || lowercaseStatement.includes('when possible')) {
    urgency = 'low';
  }

  // Extract stakeholders
  const stakeholders = [];
  if (lowercaseStatement.includes('ceo') || lowercaseStatement.includes('executive')) stakeholders.push('executives');
  if (lowercaseStatement.includes('customer') || lowercaseStatement.includes('user')) stakeholders.push('customers');
  if (lowercaseStatement.includes('team') || lowercaseStatement.includes('developer')) stakeholders.push('development_team');
  if (stakeholders.length === 0) stakeholders.push('product_team');

  return {
    urgency,
    stakeholders,
    businessType: templateContext?.businessType || 'saas',
    userSegment: templateContext?.userSegment || 'general'
  };
}

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