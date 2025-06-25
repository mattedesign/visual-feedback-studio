
import { useEffect, useCallback } from 'react';
import { useAnalysisState } from './analysis/useAnalysisState';
import { useAnalysisLoader } from './analysis/useAnalysisLoader';
import { useImageUploadHandler } from './analysis/useImageUploadHandler';
import { useAnnotationHandlers } from './analysis/useAnnotationHandlers';
import { useAIAnalysis } from './analysis/useAIAnalysis';
import { useAnalysisActions } from './analysis/useAnalysisActions';
import { useUploadConfirmationActions } from './analysis/useUploadConfirmationActions';

export const useAnalysis = () => {
  // 🔄 LOOP DETECTION: Track hook renders
  console.log('🔄 HOOK RENDER:', new Date().toISOString(), {
    hookName: 'useAnalysis',
    renderCount: ++((window as any).useAnalysisRenderCount) || ((window as any).useAnalysisRenderCount = 1)
  });

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

  // Load user analyses on mount - run only once initially
  useEffect(() => {
    console.log('🔄 EFFECT RUNNING: Initial load effect', {
      timestamp: new Date().toISOString(),
      effectRunCount: ++((window as any).analysisEffectRunCount) || ((window as any).analysisEffectRunCount = 1)
    });
    loadAnalyses();
  }, []); // Empty dependency array - only run once on mount

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
