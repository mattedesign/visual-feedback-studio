
import { useEffect } from 'react';
import { useAnalysisState } from './analysis/useAnalysisState';
import { useAnalysisLoader } from './analysis/useAnalysisLoader';
import { useImageUploadHandler } from './analysis/useImageUploadHandler';
import { useAnnotationHandlers } from './analysis/useAnnotationHandlers';
import { useAIAnalysis } from './analysis/useAIAnalysis';
import { useAnalysisActions } from './analysis/useAnalysisActions';

export const useAnalysis = () => {
  const state = useAnalysisState();
  
  const {
    currentAnalysis,
    analyses,
    imageUrl,
    annotations,
    activeAnnotation,
    isAnalyzing,
    isLoadingAnalyses,
    isUploadInProgress,
    setCurrentAnalysis,
    setAnalyses,
    setImageUrl,
    setAnnotations,
    setActiveAnnotation,
    setIsAnalyzing,
    setIsLoadingAnalyses,
    setIsUploadInProgress,
  } = state;

  const { loadAnalyses, loadAnalysis } = useAnalysisLoader({
    setCurrentAnalysis,
    setImageUrl,
    setAnnotations,
    setAnalyses,
    setIsLoadingAnalyses,
    isUploadInProgress,
    currentAnalysis,
  });

  const { handleImageUpload } = useImageUploadHandler({
    setIsUploadInProgress,
    setImageUrl,
    setAnalyses,
    setCurrentAnalysis,
    setAnnotations,
  });

  const { handleAreaClick, handleDeleteAnnotation } = useAnnotationHandlers({
    currentAnalysis,
    setAnnotations,
    setActiveAnnotation,
    activeAnnotation,
  });

  const { handleAnalyze } = useAIAnalysis({
    imageUrl,
    currentAnalysis,
    setIsAnalyzing,
    setAnnotations,
  });

  const { handleNewAnalysis } = useAnalysisActions({
    setImageUrl,
    setAnnotations,
    setActiveAnnotation,
    setCurrentAnalysis,
    setIsUploadInProgress,
  });

  // Load user analyses on mount, but don't auto-load analysis if upload is in progress
  useEffect(() => {
    loadAnalyses();
  }, [loadAnalyses]);

  return {
    currentAnalysis,
    analyses,
    imageUrl,
    annotations,
    activeAnnotation,
    isAnalyzing,
    isLoadingAnalyses,
    isUploadInProgress,
    handleImageUpload,
    handleAreaClick,
    handleAnalyze,
    handleNewAnalysis,
    loadAnalysis,
    setActiveAnnotation,
    handleDeleteAnnotation,
  };
};
