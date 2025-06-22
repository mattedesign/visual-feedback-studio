
import { useEffect } from 'react';
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
    setUploadedAnalysis,
    setShowUploadConfirmation,
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
  });

  // Load user analyses on mount - the loader will handle not auto-loading during uploads
  useEffect(() => {
    console.log('useAnalysis effect triggered, isUploadInProgress:', isUploadInProgress);
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
    uploadedAnalysis,
    showUploadConfirmation,
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
