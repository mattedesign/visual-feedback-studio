
import { useCallback, useRef, useMemo } from 'react';
import { AnalysisWithFiles } from '@/services/analysisDataService';
import { Annotation } from '@/types/analysis';
import { analysisService } from '@/services/analysisService';
import { toast } from 'sonner';

interface UseAnalysisExecutionEnhancedProps {
  currentAnalysis: AnalysisWithFiles | null;
  setIsAnalyzing: (analyzing: boolean) => void;
  setAnnotations: (annotations: Annotation[]) => void;
  onProgress?: (progress: { step: string; percentage: number }) => void;
}

interface BatchAnalysisRequest {
  imageUrls: string[];
  analysisId: string;
  analysisPrompt: string;
  designType: string;
  isComparative: boolean;
  ragEnhanced: boolean;
  researchSourceCount: number;
  batchId: string;
  timeout?: number;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

export const useAnalysisExecutionEnhanced = ({
  currentAnalysis,
  setIsAnalyzing,
  setAnnotations,
  onProgress,
}: UseAnalysisExecutionEnhancedProps) => {
  // Performance: Use refs to avoid recreating objects
  const abortControllerRef = useRef<AbortController | null>(null);
  const progressRef = useRef<{ step: string; percentage: number }>({ step: '', percentage: 0 });
  
  // Memoized retry configuration
  const retryConfig = useMemo<RetryConfig>(() => ({
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
  }), []);

  // Memory-optimized delay function
  const delay = useCallback((ms: number) => 
    new Promise(resolve => setTimeout(resolve, ms)), []);

  // Exponential backoff with jitter
  const calculateRetryDelay = useCallback((attempt: number, config: RetryConfig) => {
    const exponentialDelay = Math.min(
      config.baseDelay * Math.pow(2, attempt),
      config.maxDelay
    );
    // Add jitter (±20%)
    const jitter = exponentialDelay * 0.2 * (Math.random() - 0.5);
    return Math.max(1000, exponentialDelay + jitter);
  }, []);

  // Optimized progress reporting
  const reportProgress = useCallback((step: string, percentage: number) => {
    if (progressRef.current.step !== step || progressRef.current.percentage !== percentage) {
      progressRef.current = { step, percentage };
      onProgress?.(progressRef.current);
    }
  }, [onProgress]);

  // Batch processing with memory optimization
  const processBatch = useCallback(async (
    request: BatchAnalysisRequest,
    signal: AbortSignal
  ): Promise<Annotation[]> => {
    const { timeout = 45000 } = request;
    
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Analysis timeout after ${timeout}ms`));
      }, timeout);
      
      signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new Error('Analysis aborted'));
      });
    });

    // Process analysis with timeout race
    const analysisPromise = analysisService.analyzeDesign({
      imageUrls: request.imageUrls,
      analysisId: request.analysisId,
      analysisPrompt: request.analysisPrompt,
      designType: request.designType,
      isComparative: request.isComparative,
      ragEnhanced: request.ragEnhanced,
      researchSourceCount: request.researchSourceCount,
    });

    const response = await Promise.race([analysisPromise, timeoutPromise]);
    
    if (!response.success || !response.annotations) {
      throw new Error(response.error || 'Analysis failed to return valid results');
    }

    return response.annotations;
  }, []);

  // Enhanced error recovery with retry logic
  const executeWithRetry = useCallback(async (
    request: BatchAnalysisRequest,
    config: RetryConfig
  ): Promise<Annotation[]> => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      // Create new abort controller for each attempt
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      
      try {
        reportProgress(
          attempt === 0 ? 'Analyzing design...' : `Retrying analysis (${attempt}/${config.maxRetries})...`,
          10 + (attempt * 20)
        );

        const result = await processBatch(request, signal);
        
        // Success - clean up and return
        abortControllerRef.current = null;
        return result;
        
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on abort or timeout for last attempt
        if (signal.aborted || attempt === config.maxRetries) {
          break;
        }
        
        // Don't retry on certain error types
        if (lastError.message.includes('No analysis session found') ||
            lastError.message.includes('invalid')) {
          break;
        }

        const retryDelay = calculateRetryDelay(attempt, config);
        reportProgress(`Retrying in ${Math.round(retryDelay/1000)}s...`, 30 + (attempt * 15));
        
        await delay(retryDelay);
      }
    }
    
    throw lastError;
  }, [processBatch, reportProgress, calculateRetryDelay, delay]);

  // Optimized main execution function with enhanced error handling
  const executeAnalysis = useCallback(async (
    imagesToAnalyze: string[],
    enhancedPrompt: string,
    isComparative: boolean,
    ragMetadata?: {
      hasRAGContext: boolean;
      researchSourceCount: number;
      categories: string[];
    }
  ) => {
    if (!currentAnalysis) {
      throw new Error('No analysis session found');
    }

    // Generate unique batch ID for tracking
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('🚀 Enhanced Analysis Execution:', {
      batchId,
      imageCount: imagesToAnalyze.length,
      isComparative,
      promptLength: enhancedPrompt.length,
      ragEnabled: true,
      researchSources: ragMetadata?.researchSourceCount || 0
    });

    try {
      reportProgress('Preparing analysis...', 5);

      // Create optimized batch request
      const batchRequest: BatchAnalysisRequest = {
        imageUrls: imagesToAnalyze,
        analysisId: currentAnalysis.id,
        analysisPrompt: enhancedPrompt,
        designType: currentAnalysis.design_type,
        isComparative,
        ragEnhanced: true,
        researchSourceCount: ragMetadata?.researchSourceCount || 0,
        batchId,
        timeout: 60000, // 60 second timeout
      };

      reportProgress('Starting analysis with retry support...', 10);

      // Execute with enhanced retry logic
      const annotations = await executeWithRetry(batchRequest, retryConfig);

      reportProgress('Processing results...', 90);

      console.log('✅ Enhanced Analysis: Completed successfully:', {
        batchId,
        annotationCount: annotations.length,
        categories: [...new Set(annotations.map(a => a.category))],
        researchEnhanced: ragMetadata?.hasRAGContext || false,
        knowledgeSourcesUsed: ragMetadata?.researchSourceCount || 0
      });

      setAnnotations(annotations);
      reportProgress('Analysis complete', 100);
      
      const successMessage = ragMetadata?.hasRAGContext 
        ? `Analysis complete! Enhanced with ${ragMetadata.researchSourceCount} research sources.`
        : `Analysis complete! Found ${annotations.length} design insights.`;
      
      toast.success(successMessage);

    } catch (error) {
      console.error('❌ Enhanced Analysis: Execution failed:', error);
      
      // Enhanced error reporting
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const userFriendlyMessage = errorMessage.includes('timeout') 
        ? 'Analysis timeout - please try again with fewer images'
        : errorMessage.includes('abort')
        ? 'Analysis was cancelled'
        : 'Analysis failed - please try again';
      
      toast.error(userFriendlyMessage);
      throw error;
    } finally {
      // Cleanup
      if (abortControllerRef.current) {
        abortControllerRef.current = null;
      }
      setIsAnalyzing(false);
      reportProgress('', 0);
    }
  }, [currentAnalysis, setIsAnalyzing, setAnnotations, executeWithRetry, retryConfig, reportProgress]);

  // Cleanup function for component unmount
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    executeAnalysis,
    cleanup,
  };
};
