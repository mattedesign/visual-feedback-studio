
import { useState, useCallback } from 'react';
import { Annotation } from '@/types/analysis';
import { useAIAnalysis } from './useAIAnalysis';
import { toast } from 'sonner';

export type WorkflowStep = 'upload' | 'annotate' | 'review' | 'analyzing' | 'results';

interface UserAnnotation {
  id: string;
  x: number;
  y: number;
  comment: string;
}

export const useAnalysisWorkflow = () => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [userAnnotations, setUserAnnotations] = useState<Record<string, UserAnnotation[]>>({});
  const [analysisContext, setAnalysisContext] = useState<string>('');
  const [aiAnnotations, setAIAnnotations] = useState<Annotation[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  
  // Enhanced context state
  const [enhancedContext, setEnhancedContext] = useState<any>(null);
  const [ragEnhanced, setRagEnhanced] = useState<boolean>(false);
  const [knowledgeSourcesUsed, setKnowledgeSourcesUsed] = useState<number>(0);
  const [researchCitations, setResearchCitations] = useState<string[]>([]);
  const [visionEnhanced, setVisionEnhanced] = useState<boolean>(false);
  const [visionConfidenceScore, setVisionConfidenceScore] = useState<number | undefined>(undefined);
  const [visionElementsDetected, setVisionElementsDetected] = useState<number>(0);

  const { analyzeImages, isAnalyzing, isBuilding, buildingStage } = useAIAnalysis();

  const resetWorkflow = useCallback(() => {
    setCurrentStep('upload');
    setSelectedImages([]);
    setUploadedFiles([]);
    setActiveImageUrl(null);
    setUserAnnotations({});
    setAnalysisContext('');
    setAIAnnotations([]);
    setAnalysisResults(null);
    setEnhancedContext(null);
    setRagEnhanced(false);
    setKnowledgeSourcesUsed(0);
    setResearchCitations([]);
    setVisionEnhanced(false);
    setVisionConfidenceScore(undefined);
    setVisionElementsDetected(0);
  }, []);

  const selectImages = useCallback((images: string[]) => {
    setSelectedImages(images);
    setUploadedFiles(images);
    if (images.length > 0) {
      setActiveImageUrl(images[0]);
    }
  }, []);

  const addUserAnnotation = useCallback((imageUrl: string, annotation: Omit<UserAnnotation, 'id'>) => {
    const newAnnotation = {
      ...annotation,
      id: Date.now().toString()
    };
    
    setUserAnnotations(prev => ({
      ...prev,
      [imageUrl]: [...(prev[imageUrl] || []), newAnnotation]
    }));
  }, []);

  const removeUserAnnotation = useCallback((imageUrl: string, annotationId: string) => {
    setUserAnnotations(prev => ({
      ...prev,
      [imageUrl]: (prev[imageUrl] || []).filter(a => a.id !== annotationId)
    }));
  }, []);

  const startAnalysis = useCallback(async () => {
    if (selectedImages.length === 0) {
      toast.error('Please select at least one image to analyze');
      return;
    }

    if (!analysisContext.trim()) {
      toast.error('Please provide analysis context');
      return;
    }

    setCurrentStep('analyzing');

    try {
      // Prepare user annotations for analysis
      const userAnnotationsArray = selectedImages.flatMap(imageUrl => 
        (userAnnotations[imageUrl] || []).map(annotation => ({
          imageUrl,
          x: annotation.x,
          y: annotation.y,
          comment: annotation.comment,
          id: annotation.id
        }))
      );

      console.log('🚀 Starting analysis with params:', {
        imageUrls: selectedImages,
        userAnnotations: userAnnotationsArray,
        analysisPrompt: analysisContext,
        deviceType: 'desktop',
        useEnhancedRag: true
      });

      const result = await analyzeImages({
        imageUrls: selectedImages,
        userAnnotations: userAnnotationsArray,
        analysisPrompt: analysisContext,
        deviceType: 'desktop',
        useEnhancedRag: true
      });

      if (result.success) {
        setAIAnnotations(result.annotations);
        setAnalysisResults(result.analysis);
        
        // Set enhanced context information
        if (result.enhancedContext) {
          setEnhancedContext(result.enhancedContext);
          setVisionEnhanced(true);
          setVisionConfidenceScore(result.enhancedContext.confidenceScore);
          setVisionElementsDetected(result.enhancedContext.visionAnalysis?.uiElements?.length || 0);
          setKnowledgeSourcesUsed(prev => prev + (result.enhancedContext.knowledgeSourcesUsed || 0));
          setResearchCitations(prev => [...prev, ...(result.enhancedContext.citations || [])]);
        }
        
        // Set RAG context information
        if (result.ragContext) {
          setRagEnhanced(true);
          if (result.ragContext.knowledgeSourcesUsed) {
            setKnowledgeSourcesUsed(prev => prev + result.ragContext.knowledgeSourcesUsed);
          }
          if (result.ragContext.researchCitations) {
            setResearchCitations(prev => [...prev, ...result.ragContext.researchCitations]);
          }
        }

        setCurrentStep('results');
        toast.success(`Analysis complete! Found ${result.annotations.length} insights.`);
      } else {
        toast.error('Analysis failed. Please try again.');
        setCurrentStep('review');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Analysis failed. Please try again.');
      setCurrentStep('review');
    }
  }, [selectedImages, userAnnotations, analysisContext, analyzeImages]);

  const goToStep = useCallback((step: WorkflowStep) => {
    setCurrentStep(step);
  }, []);

  const goToNextStep = useCallback(() => {
    switch (currentStep) {
      case 'upload':
        if (selectedImages.length > 0) {
          setCurrentStep('annotate');
        }
        break;
      case 'annotate':
        setCurrentStep('review');
        break;
      case 'review':
        startAnalysis();
        break;
      case 'analyzing':
        // Analysis will automatically move to results
        break;
      case 'results':
        resetWorkflow();
        break;
    }
  }, [currentStep, selectedImages.length, startAnalysis, resetWorkflow]);

  const goToPreviousStep = useCallback(() => {
    switch (currentStep) {
      case 'annotate':
        setCurrentStep('upload');
        break;
      case 'review':
        setCurrentStep('annotate');
        break;
      case 'results':
        setCurrentStep('review');
        break;
    }
  }, [currentStep]);

  return {
    // State
    currentStep,
    selectedImages,
    uploadedFiles,
    activeImageUrl,
    userAnnotations,
    analysisContext,
    aiAnnotations,
    analysisResults,
    enhancedContext,
    ragEnhanced,
    knowledgeSourcesUsed,
    researchCitations,
    visionEnhanced,
    visionConfidenceScore,
    visionElementsDetected,
    isAnalyzing,
    isBuilding,
    buildingStage,

    // Actions
    resetWorkflow,
    selectImages,
    setActiveImageUrl,
    addUserAnnotation,
    removeUserAnnotation,
    setAnalysisContext,
    startAnalysis,
    goToStep,
    goToNextStep,
    goToPreviousStep
  };
};
