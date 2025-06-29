
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

interface ImageAnnotations {
  imageUrl: string;
  annotations: UserAnnotation[];
}

export const useAnalysisWorkflow = () => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [userAnnotations, setUserAnnotations] = useState<Record<string, UserAnnotation[]>>({});
  const [imageAnnotations, setImageAnnotations] = useState<ImageAnnotations[]>([]);
  const [analysisContext, setAnalysisContext] = useState<string>('');
  const [aiAnnotations, setAIAnnotations] = useState<Annotation[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  
  // Enhanced context state
  const [enhancedContext, setEnhancedContext] = useState<any>(null);
  const [ragEnhanced, setRagEnhanced] = useState<boolean>(false);
  const [knowledgeSourcesUsed, setKnowledgeSourcesUsed] = useState<number>(0);
  const [researchCitations, setResearchCitations] = useState<string[]>([]);
  const [visionEnhanced, setVisionEnhanced] = useState<boolean>(false);
  const [visionConfidenceScore, setVisionConfidenceScore] = useState<number | undefined>(undefined);
  const [visionElementsDetected, setVisionElementsDetected] = useState<number>(0);

  const { analyzeImages, isAnalyzing: aiAnalyzing, isBuilding, buildingStage } = useAIAnalysis();

  const resetWorkflow = useCallback(() => {
    setCurrentStep('upload');
    setSelectedImages([]);
    setUploadedFiles([]);
    setActiveImageUrl(null);
    setUserAnnotations({});
    setImageAnnotations([]);
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
    setIsAnalyzing(false);
    setCurrentAnalysis(null);
  }, []);

  const selectImages = useCallback((images: string[]) => {
    setSelectedImages(images);
    setUploadedFiles(images);
    if (images.length > 0) {
      setActiveImageUrl(images[0]);
    }
  }, []);

  // Single image selection
  const selectImage = useCallback((imageUrl: string) => {
    if (!selectedImages.includes(imageUrl)) {
      setSelectedImages(prev => [...prev, imageUrl]);
    }
    setActiveImageUrl(imageUrl);
  }, [selectedImages]);

  // Add uploaded file to the list
  const addUploadedFile = useCallback((imageUrl: string) => {
    setUploadedFiles(prev => {
      if (!prev.includes(imageUrl)) {
        return [...prev, imageUrl];
      }
      return prev;
    });
    
    // Also add to selected images if not already there
    setSelectedImages(prev => {
      if (!prev.includes(imageUrl)) {
        return [...prev, imageUrl];
      }
      return prev;
    });
  }, []);

  // Set active image
  const setActiveImage = useCallback((imageUrl: string) => {
    setActiveImageUrl(imageUrl);
  }, []);

  const addUserAnnotation = useCallback((imageUrl: string, annotation: Omit<UserAnnotation, 'id'>) => {
    const newAnnotation = {
      ...annotation,
      id: Date.now().toString()
    };
    
    // Update userAnnotations (legacy format)
    setUserAnnotations(prev => ({
      ...prev,
      [imageUrl]: [...(prev[imageUrl] || []), newAnnotation]
    }));

    // Update imageAnnotations (new format)
    setImageAnnotations(prev => {
      const existingIndex = prev.findIndex(ia => ia.imageUrl === imageUrl);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          annotations: [...updated[existingIndex].annotations, newAnnotation]
        };
        return updated;
      } else {
        return [...prev, { imageUrl, annotations: [newAnnotation] }];
      }
    });
  }, []);

  const removeUserAnnotation = useCallback((imageUrl: string, annotationId: string) => {
    // Update userAnnotations (legacy format)
    setUserAnnotations(prev => ({
      ...prev,
      [imageUrl]: (prev[imageUrl] || []).filter(a => a.id !== annotationId)
    }));

    // Update imageAnnotations (new format)
    setImageAnnotations(prev => {
      return prev.map(ia => {
        if (ia.imageUrl === imageUrl) {
          return {
            ...ia,
            annotations: ia.annotations.filter(a => a.id !== annotationId)
          };
        }
        return ia;
      });
    });
  }, []);

  const updateUserAnnotation = useCallback((imageUrl: string, annotationId: string, comment: string) => {
    // Update userAnnotations (legacy format)
    setUserAnnotations(prev => ({
      ...prev,
      [imageUrl]: (prev[imageUrl] || []).map(a => 
        a.id === annotationId ? { ...a, comment } : a
      )
    }));

    // Update imageAnnotations (new format)
    setImageAnnotations(prev => {
      return prev.map(ia => {
        if (ia.imageUrl === imageUrl) {
          return {
            ...ia,
            annotations: ia.annotations.map(a => 
              a.id === annotationId ? { ...a, comment } : a
            )
          };
        }
        return ia;
      });
    });
  }, []);

  const getTotalAnnotationsCount = useCallback(() => {
    return imageAnnotations.reduce((total, ia) => total + ia.annotations.length, 0);
  }, [imageAnnotations]);

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
    setIsAnalyzing(true);

    try {
      // Prepare user annotations for analysis
      const userAnnotationsArray = imageAnnotations.flatMap(imageAnnotation => 
        imageAnnotation.annotations.map(annotation => ({
          imageUrl: imageAnnotation.imageUrl,
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
        setIsAnalyzing(false);
        toast.success(`Analysis complete! Found ${result.annotations.length} insights.`);
      } else {
        toast.error('Analysis failed. Please try again.');
        setCurrentStep('review');
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Analysis failed. Please try again.');
      setCurrentStep('review');
      setIsAnalyzing(false);
    }
  }, [selectedImages, imageAnnotations, analysisContext, analyzeImages]);

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

  const proceedFromReview = useCallback(() => {
    setCurrentStep('annotate');
  }, []);

  // Legacy properties for backward compatibility
  const selectedImageUrl = selectedImages[0] || null;

  return {
    // State
    currentStep,
    selectedImages,
    uploadedFiles,
    activeImageUrl,
    userAnnotations,
    imageAnnotations,
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
    isAnalyzing: isAnalyzing || aiAnalyzing,
    isBuilding,
    buildingStage,
    currentAnalysis,
    selectedImageUrl, // Legacy compatibility

    // Actions
    resetWorkflow,
    selectImages,
    selectImage,
    addUploadedFile,
    setActiveImageUrl,
    setActiveImage,
    addUserAnnotation,
    removeUserAnnotation,
    updateUserAnnotation,
    setAnalysisContext,
    startAnalysis,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    proceedFromReview,
    getTotalAnnotationsCount,
    setAiAnnotations: setAIAnnotations,
    setIsAnalyzing
  };
};
