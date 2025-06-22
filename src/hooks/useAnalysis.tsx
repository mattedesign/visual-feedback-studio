
import { useEffect, useCallback } from 'react';
import { useAnalysisState } from './analysis/useAnalysisState';
import { useAnalysisLoader } from './analysis/useAnalysisLoader';
import { useImageUploadHandler } from './analysis/useImageUploadHandler';
import { useAnnotationHandlers } from './analysis/useAnnotationHandlers';
import { useAIAnalysis } from './analysis/useAIAnalysis';
import { useAnalysisActions } from './analysis/useAnalysisActions';
import { useUploadConfirmationActions } from './analysis/useUploadConfirmationActions';

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
    uploadedAnalysis,
    showUploadConfirmation,
    hasPendingConfirmation,
    setCurrentAnalysis,
    setAnalyses,
    setImageUrl,
    setAnnotations,
    setActiveAnnotation,
    setIsAnalyzing,
    setIsLoadingAnalyses,
    setIsUploadInProgress,
    setUploadedAnalysis,
    setShowUploadConfirmation,
    setHasPendingConfirmation,
  } = state;

  const { loadAnalyses, loadAnalysis } = useAnalysisLoader({
    setCurrentAnalysis,
    setImageUrl,
    setAnnotations,
    setAnalyses,
    setIsLoadingAnalyses,
    isUploadInProgress,
    hasPendingConfirmation,
    currentAnalysis,
  });

  const { handleImageUpload } = useImageUploadHandler({
    setIsUploadInProgress,
    setImageUrl,
    setAnalyses,
    setCurrentAnalysis,
    setAnnotations,
    setUploadedAnalysis,
    setShowUploadConfirmation,
    setHasPendingConfirmation,
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

  const {
    handleViewLatestAnalysis,
    handleUploadAnother,
    handleDismissConfirmation,
  } = useUploadConfirmationActions({
    uploadedAnalysis,
    setCurrentAnalysis,
    setImageUrl,
    setAnnotations,
    setActiveAnnotation,
    setShowUploadConfirmation,
    setUploadedAnalysis,
    setHasPendingConfirmation,
  });

  // Memoize the loadAnalyses function to prevent unnecessary re-renders
  const memoizedLoadAnalyses = useCallback(() => {
    console.log('useAnalysis effect triggered, isUploadInProgress:', isUploadInProgress, 'hasPendingConfirmation:', hasPendingConfirmation);
    loadAnalyses();
  }, [loadAnalyses]);

  // Load user analyses on mount - only run once and when upload state changes
  useEffect(() => {
    memoizedLoadAnalyses();
  }, [memoizedLoadAnalyses]);

  return {
    currentAnalysis,
    analyses,
    imageUrl,
    annotations,
    activeAnnotation,
    isAnalyzing,
    isLoadingAnalyses,
    isUploadInProgress,
    uploadedAnalysis,
    showUploadConfirmation,
    hasPendingConfirmation,
    handleImageUpload,
    handleAreaClick,
    handleAnalyze,
    handleNewAnalysis,
    loadAnalysis,
    setActiveAnnotation,
    handleDeleteAnnotation,
    handleViewLatestAnalysis,
    handleUploadAnother,
    handleDismissConfirmation,
  };
};
