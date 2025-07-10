
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
    console.error('❌ Analysis Error:', error);
    
    // Update analysis status to failed
    try {
      if (currentAnalysis) {
        await updateAnalysisStatus(currentAnalysis.id, 'failed');
        console.log(`✅ Analysis ${currentAnalysis.id.substring(0, 8)} marked as failed`);
      }
    } catch (statusError) {
      console.error('Failed to update analysis status:', statusError);
    }
    
    setIsAnalyzing(false);
    
    // Re-throw to allow retry logic in AnalyzingStep
    throw error;
  }, [currentAnalysis, setIsAnalyzing]);

  return {
    handleAnalysisError,
  };
};
