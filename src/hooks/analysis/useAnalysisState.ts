
import { useState } from 'react';
import { Annotation } from '@/types/analysis';
import { AnalysisWithFiles } from '@/services/analysisDataService';

export const useAnalysisState = () => {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisWithFiles | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisWithFiles[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(true);
  const [isUploadInProgress, setIsUploadInProgress] = useState(false);
  const [uploadedAnalysis, setUploadedAnalysis] = useState<AnalysisWithFiles | null>(null);
  const [showUploadConfirmation, setShowUploadConfirmation] = useState(false);
  const [hasPendingConfirmation, setHasPendingConfirmation] = useState(false);

  return {
    currentAnalysis,
    setCurrentAnalysis,
    analyses,
    setAnalyses,
    imageUrl,
    setImageUrl,
    annotations,
    setAnnotations,
    activeAnnotation,
    setActiveAnnotation,
    isAnalyzing,
    setIsAnalyzing,
    isLoadingAnalyses,
    setIsLoadingAnalyses,
    isUploadInProgress,
    setIsUploadInProgress,
    uploadedAnalysis,
    setUploadedAnalysis,
    showUploadConfirmation,
    setShowUploadConfirmation,
    hasPendingConfirmation,
    setHasPendingConfirmation,
  };
};
