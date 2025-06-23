
import { useCallback } from 'react';
import { AnalysisWithFiles, updateAnalysisStatus } from '@/services/analysisDataService';

interface UseAnalysisErrorHandlerProps {
  currentAnalysis: AnalysisWithFiles | null;
  setIsAnalyzing: (analyzing: boolean) => void;
}

export const useAnalysisErrorHandler = ({
  currentAnalysis,
  setIsAnalyzing,
}: UseAnalysisErrorHandlerProps) => {
  
  const handleAnalysisError = useCallback(async (error: unknown) => {
    console.error('=== Enhanced Analysis Error ===');
    
    // Type guard to safely access error properties
    if (error && typeof error === 'object') {
      const errorObj = error as Record<string, unknown>;
      console.error('Error name:', errorObj.name);
      console.error('Error message:', errorObj.message);
      console.error('Error stack:', errorObj.stack);
    } else {
      console.error('Error:', error);
    }
    
    // Update analysis status to failed
    try {
      if (currentAnalysis) {
        await updateAnalysisStatus(currentAnalysis.id, 'failed');
      }
    } catch (statusError) {
      console.error('Failed to update analysis status:', statusError);
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Final error message:', errorMessage);
    
    setIsAnalyzing(false);
    
    // Re-throw to allow retry logic in AnalyzingStep
    throw error;
  }, [currentAnalysis, setIsAnalyzing]);

  return {
    handleAnalysisError,
  };
};
