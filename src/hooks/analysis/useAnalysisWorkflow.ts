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
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [userAnnotations, setUserAnnotations] = useState<Record<string, UserAnnotation[]>>({});
  const [imageAnnotations, setImageAnnotations] = useState<ImageAnnotations[]>([]);
  const [analysisContext, setAnalysisContext] = useState<string>('');
  const [aiAnnotations, setAIAnnotations] = useState<Annotation[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  
  // Enhanced context state - read-only for display
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
    console.log('🖼️ FIXED: Selecting images (single source):', images.length, images);
    setSelectedImages(images);
    if (images.length > 0) {
      setActiveImageUrl(images[0]);
    }
  }, []);

  const selectImage = useCallback((imageUrl: string) => {
    if (!selectedImages.includes(imageUrl)) {
      setSelectedImages(prev => [...prev, imageUrl]);
    }
    setActiveImageUrl(imageUrl);
  }, [selectedImages]);

  const addUploadedFile = useCallback((imageUrl: string) => {
    setSelectedImages(prev => {
      if (!prev.includes(imageUrl)) {
        const newImages = [...prev, imageUrl];
        console.log('📸 FIXED: Added image to selection:', newImages.length, 'total');
        return newImages;
      }
      console.log('⚠️ FIXED: Image already in selection, skipping duplicate');
      return prev;
    });
    
    if (!activeImageUrl) {
      setActiveImageUrl(imageUrl);
    }
  }, [activeImageUrl]);

  const setActiveImage = useCallback((imageUrl: string) => {
    setActiveImageUrl(imageUrl);
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
    setUserAnnotations(prev => ({
      ...prev,
      [imageUrl]: (prev[imageUrl] || []).filter(a => a.id !== annotationId)
    }));

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
    setUserAnnotations(prev => ({
      ...prev,
      [imageUrl]: (prev[imageUrl] || []).map(a => 
        a.id === annotationId ? { ...a, comment } : a
      )
    }));

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

    // Prevent duplicate analysis
    if (isAnalyzing || aiAnalyzing) {
      console.log('⚠️ Analysis already in progress, skipping');
      return;
    }

    console.log('🚀 Starting analysis workflow:', {
      imageCount: selectedImages.length,
      annotationCount: getTotalAnnotationsCount(),
      contextLength: analysisContext.length
    });

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

      const result = await analyzeImages({
        imageUrls: selectedImages,
        userAnnotations: userAnnotationsArray,
        analysisPrompt: analysisContext,
        deviceType: 'desktop',
        useEnhancedRag: true
      });

      if (result.success) {
        console.log('✅ Analysis completed successfully:', {
          annotationCount: result.annotations.length
        });

        setAIAnnotations(result.annotations);
        setAnalysisResults(result.analysis);
        
        setCurrentStep('results');
        toast.success(`Analysis complete! Found ${result.annotations.length} insights.`);
      } else {
        console.error('❌ Analysis failed:', result);
        toast.error('Analysis failed. Please try again.');
        setCurrentStep('annotate');
      }
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      toast.error('Analysis failed. Please try again.');
      setCurrentStep('annotate');
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedImages, imageAnnotations, analysisContext, analyzeImages, isAnalyzing, aiAnalyzing, getTotalAnnotationsCount]);

  const goToStep = useCallback((step: WorkflowStep) => {
    console.log('🔄 Workflow: Navigating to step:', step);
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
  const uploadedFiles = selectedImages;

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
    // ✅ VERIFY these enhanced context properties are included:
    enhancedContext: enhancedContext || null,
    ragEnhanced: ragEnhanced || false,
    knowledgeSourcesUsed: knowledgeSourcesUsed || 0,
    researchCitations: researchCitations || [],
    visionEnhanced: visionEnhanced || false,
    visionConfidenceScore: visionConfidenceScore,
    visionElementsDetected: visionElementsDetected || 0,
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
