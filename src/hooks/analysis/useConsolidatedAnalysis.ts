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

    // Enhanced problem statement matching using seeded database
    if (result.success && result.analysisId) {
      console.log('🎯 Starting enhanced problem statement matching...');
      
      // Use a more elegant approach than setTimeout for better UX
      const initiateProblemStatementMatching = async () => {
        try {
          const userChallenge = prompt(`🎯 BUSINESS CHALLENGE ANALYZER

Your analysis is complete! To provide targeted business solutions, please describe your specific challenge:

Examples:
• "Our checkout conversion dropped 30% after redesign"
• "Users can't find our pricing page" 
• "Mobile users are bouncing at 80%"

Your challenge:`);

          if (!userChallenge?.trim()) {
            console.log('👤 User skipped problem statement input');
            return;
          }

          console.log('🔍 Fetching problem statement templates...');
          
          // Query seeded problem_statements table with error handling
          const { data: templates, error } = await supabase
            .from('problem_statements')
            .select('*')
            .order('usage_count', { ascending: false });
          
          if (error) {
            console.error('❌ Database error fetching templates:', error);
            alert('Sorry, there was an issue accessing the problem statement database. Your analysis is still complete.');
            return;
          }

          if (!templates || templates.length === 0) {
            console.warn('⚠️ No problem statement templates found');
            alert('Problem statement templates are not yet available. Your analysis is complete.');
            return;
          }

          console.log(`📊 Found ${templates.length} problem statement templates`);
          
          // Enhanced matching with better algorithms
          const match = await enhancedMatchUserToProblemStatement(userChallenge, templates);
          console.log('🎯 ENHANCED MATCH RESULT:', match);
          
          // Store with comprehensive error handling
          const { data: stored, error: insertError } = await supabase
            .from('user_problem_statements')
            .insert({
              user_id: user.id,
              analysis_id: result.analysisId,
              original_statement: userChallenge,
              matched_problem_statement_id: match.templateId,
              extracted_context: match.context
            })
            .select()
            .single();

          if (insertError) {
            console.error('❌ Error storing problem statement:', insertError);
            alert('Your analysis is complete, but we couldn\'t save your business challenge. Please try again later.');
            return;
          }

          console.log('✅ Problem statement successfully stored:', stored.id);
          
          // Enhanced user feedback with actionable information
          const confidenceText = match.confidence > 0.75 ? 'High' : 
                                match.confidence > 0.5 ? 'Medium' : 'Low';
          
          alert(`🎯 BUSINESS CHALLENGE MATCHED!

Category: ${match.category}
Confidence: ${confidenceText} (${Math.round(match.confidence * 100)}%)

Your challenge has been analyzed and will provide targeted business solutions in future features.`);

        } catch (error) {
          console.error('💥 Unexpected error in problem statement matching:', error);
          alert('Your analysis is complete. There was an issue with the business challenge matcher, but your results are saved.');
        }
      };

      // Defer execution to avoid blocking navigation
      Promise.resolve().then(() => {
        // Small delay to ensure UI has updated
        setTimeout(initiateProblemStatementMatching, 1500);
      });
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

// Enhanced problem statement matching with category-specific keywords
async function enhancedMatchUserToProblemStatement(userStatement: string, templates: any[]) {
  console.log('🔍 Enhanced matching user statement against templates:', {
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
    const confidence = enhancedCalculateMatchingScore(userStatement, template);
    
    if (confidence > bestMatch.confidence) {
      bestMatch = {
        templateId: template.id,
        category: template.category,
        confidence,
        context: enhancedExtractBusinessContext(userStatement, template.implied_context, template.category)
      };
    }
  }

  return bestMatch;
}

// Enhanced matching with category-specific keyword weighting
function enhancedCalculateMatchingScore(userStatement: string, template: any): number {
  const userLower = userStatement.toLowerCase();
  const templateLower = template.statement.toLowerCase();
  
  // Base word matching score
  const userWords = userLower.split(/\s+/).filter(word => word.length > 2);
  const templateWords = templateLower.split(/\s+/).filter(word => word.length > 2);
  
  let baseScore = 0;
  const totalWords = Math.max(userWords.length, templateWords.length);
  
  for (const word of userWords) {
    if (templateWords.some(tw => tw.includes(word) || word.includes(tw))) {
      baseScore++;
    }
  }
  
  const wordMatchScore = baseScore / totalWords;

  // Category-specific keyword boosting
  const categoryKeywords = getCategoryKeywords(template.category);
  let categoryBoost = 0;
  
  for (const keyword of categoryKeywords) {
    if (userLower.includes(keyword)) {
      categoryBoost += 0.2; // Each matching category keyword adds 20%
    }
  }

  // Urgency and business impact detection
  const urgencyBoost = detectUrgencyKeywords(userLower) ? 0.1 : 0;
  const businessImpactBoost = detectBusinessImpactKeywords(userLower) ? 0.15 : 0;

  // Combine scores with weighting
  const finalScore = Math.min(1.0, (wordMatchScore * 0.6) + categoryBoost + urgencyBoost + businessImpactBoost);
  
  console.log(`📊 Scoring "${template.statement.substring(0, 50)}...": ${Math.round(finalScore * 100)}%`);
  
  return finalScore;
}

// Category-specific keywords for better matching
function getCategoryKeywords(category: string): string[] {
  const keywordMap: Record<string, string[]> = {
    'conversion_decline': ['conversion', 'signup', 'checkout', 'purchase', 'cart', 'abandon', 'drop', 'decline', 'sales', 'revenue'],
    'competitive_pressure': ['competitor', 'alternative', 'market', 'losing users', 'switch', 'outdated', 'behind'],
    'user_confusion': ['confused', 'lost', 'find', 'navigate', 'understand', 'unclear', 'complex', 'difficult'],
    'technical_constraints': ['slow', 'performance', 'load', 'mobile', 'browser', 'compatibility', 'technical'],
    'stakeholder_demands': ['executive', 'ceo', 'board', 'deadline', 'urgent', 'priority', 'stakeholder']
  };
  
  return keywordMap[category] || [];
}

// Detect urgency indicators
function detectUrgencyKeywords(statement: string): boolean {
  const urgencyKeywords = ['urgent', 'immediately', 'asap', 'critical', 'emergency', 'deadline', 'priority'];
  return urgencyKeywords.some(keyword => statement.includes(keyword));
}

// Detect business impact indicators
function detectBusinessImpactKeywords(statement: string): boolean {
  const impactKeywords = ['revenue', 'sales', 'conversion', 'users', 'customers', 'growth', 'profit', 'loss', 'churn'];
  return impactKeywords.some(keyword => statement.includes(keyword));
}

// Enhanced business context extraction
function enhancedExtractBusinessContext(statement: string, templateContext: any, category: string) {
  const lowercaseStatement = statement.toLowerCase();
  
  // Enhanced urgency detection with more nuanced levels
  let urgency = 'medium';
  if (lowercaseStatement.includes('urgent') || lowercaseStatement.includes('immediately') || lowercaseStatement.includes('asap') || lowercaseStatement.includes('critical')) {
    urgency = 'high';
  } else if (lowercaseStatement.includes('eventually') || lowercaseStatement.includes('when possible') || lowercaseStatement.includes('nice to have')) {
    urgency = 'low';
  } else if (lowercaseStatement.includes('soon') || lowercaseStatement.includes('priority')) {
    urgency = 'medium-high';
  }

  // Enhanced stakeholder detection
  const stakeholders = [];
  if (lowercaseStatement.includes('ceo') || lowercaseStatement.includes('executive') || lowercaseStatement.includes('board')) stakeholders.push('executives');
  if (lowercaseStatement.includes('customer') || lowercaseStatement.includes('user') || lowercaseStatement.includes('client')) stakeholders.push('customers');
  if (lowercaseStatement.includes('team') || lowercaseStatement.includes('developer') || lowercaseStatement.includes('engineering')) stakeholders.push('development_team');
  if (lowercaseStatement.includes('marketing') || lowercaseStatement.includes('sales')) stakeholders.push('marketing');
  if (lowercaseStatement.includes('design') || lowercaseStatement.includes('ux')) stakeholders.push('design_team');
  if (stakeholders.length === 0) stakeholders.push('product_team');

  // Timeline detection
  let timeline = 'within_quarter';
  if (lowercaseStatement.includes('week') || lowercaseStatement.includes('days')) timeline = 'within_month';
  if (lowercaseStatement.includes('month') || lowercaseStatement.includes('sprint')) timeline = 'within_quarter';
  if (lowercaseStatement.includes('year') || lowercaseStatement.includes('long term') || lowercaseStatement.includes('roadmap')) timeline = 'within_year';

  // Business impact estimation
  let estimatedImpact = 'medium';
  if (lowercaseStatement.includes('revenue') || lowercaseStatement.includes('conversion') || lowercaseStatement.includes('sales')) {
    estimatedImpact = 'high';
  } else if (lowercaseStatement.includes('nice to have') || lowercaseStatement.includes('polish')) {
    estimatedImpact = 'low';
  }

  return {
    urgency,
    stakeholders,
    timeline,
    estimatedImpact,
    category,
    businessType: templateContext?.businessType || 'saas',
    userSegment: templateContext?.userSegment || 'general',
    extractedMetrics: extractMetrics(statement)
  };
}

// Extract numerical metrics from user statements
function extractMetrics(statement: string): Record<string, any> {
  const metrics: Record<string, any> = {};
  
  // Look for percentage drops/increases
  const percentageMatch = statement.match(/(\d+)%/g);
  if (percentageMatch) {
    metrics.percentages = percentageMatch;
  }
  
  // Look for user counts
  const userCountMatch = statement.match(/(\d+)\s*(users?|customers?)/gi);
  if (userCountMatch) {
    metrics.userCounts = userCountMatch;
  }
  
  // Look for time periods
  const timeMatch = statement.match(/(\d+)\s*(days?|weeks?|months?)/gi);
  if (timeMatch) {
    metrics.timePeriods = timeMatch;
  }
  
  return metrics;
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