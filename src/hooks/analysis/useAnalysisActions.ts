
import { useCallback } from 'react';
import { AnalysisWithFiles } from '@/services/analysisDataService';
import { Annotation } from '@/types/analysis';

interface UseAnalysisActionsProps {
  setImageUrl: (url: string | null) => void;
  setAnnotations: (annotations: Annotation[]) => void;
  setActiveAnnotation: (id: string | null) => void;
  setCurrentAnalysis: (analysis: AnalysisWithFiles | null) => void;
  setIsUploadInProgress: (inProgress: boolean) => void;
}

export const useAnalysisActions = ({
  setImageUrl,
  setAnnotations,
  setActiveAnnotation,
  setCurrentAnalysis,
  setIsUploadInProgress,
}: UseAnalysisActionsProps) => {
  const handleNewAnalysis = useCallback(() => {
    setImageUrl(null);
    setAnnotations([]);
    setActiveAnnotation(null);
    setCurrentAnalysis(null);
    setIsUploadInProgress(false);
  }, [setImageUrl, setAnnotations, setActiveAnnotation, setCurrentAnalysis, setIsUploadInProgress]);

  return {
    handleNewAnalysis,
  };
};
