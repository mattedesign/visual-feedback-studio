
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
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    
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
