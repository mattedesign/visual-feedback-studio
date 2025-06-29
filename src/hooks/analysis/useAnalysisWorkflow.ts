import { useState, useCallback } from 'react';
import { Annotation } from '@/types/analysis';
import { useEnhancedAnalysis } from './useEnhancedAnalysis';
import { toast } from 'sonner';
import { EnhancedContext } from '@/services/analysis/enhancedRagService';

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
  const [images, setImages] = useState<string[]>([]);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [userAnnotations, setUserAnnotations] = useState<Record<string, UserAnnotation[]>>({});
  const [imageAnnotations, setImageAnnotations] = useState<ImageAnnotations[]>([]);
  const [analysisContext, setAnalysisContext] = useState<string>('');
  const [aiAnnotations, setAiAnnotations] = useState<Annotation[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  
  // Enhanced context state
  const [enhancedContext, setEnhancedContext] = useState<EnhancedContext | null>(null);
  const [ragEnhanced, setRagEnhanced] = useState<boolean>(false);
  const [knowledgeSourcesUsed, setKnowledgeSourcesUsed] = useState<number>(0);
  const [researchCitations, setResearchCitations] = useState<string[]>([]);
  const [visionEnhanced, setVisionEnhanced] = useState<boolean>(false);
  const [visionConfidenceScore, setVisionConfidenceScore] = useState<number | undefined>(undefined);
  const [visionElementsDetected, setVisionElementsDetected] = useState<number>(0);

  // 🔥 FIXED: Properly integrate enhanced analysis hook
  const enhancedAnalysis = useEnhancedAnalysis({ currentAnalysis });

  const resetWorkflow = useCallback(() => {
    console.log('🔄 RESET: Clearing all workflow state');
    setCurrentStep('upload');
    setImages([]);
    setActiveImageUrl(null);
    setUserAnnotations({});
    setImageAnnotations([]);
    setAnalysisContext('');
    setAiAnnotations([]);
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
    
    // Reset enhanced analysis state
    enhancedAnalysis.resetState();
  }, [enhancedAnalysis]);

  // 🔥 SIMPLIFIED: Single function to add images
  const addImage = useCallback((imageUrl: string) => {
    console.log('📸 ADD IMAGE CALLED:', {
      imageUrl,
      currentImages: images,
      alreadyExists: images.includes(imageUrl)
    });
    
    setImages(prev => {
      if (prev.includes(imageUrl)) {
        console.log('⚠️ DUPLICATE PREVENTED: Image already exists');
        return prev;
      }
      
      const newImages = [...prev, imageUrl];
      console.log('✅ IMAGE ADDED:', {
        previousCount: prev.length,
        newCount: newImages.length,
        addedImage: imageUrl
      });
      return newImages;
    });
    
    // Set as active if it's the first image
    if (images.length === 0) {
      setActiveImageUrl(imageUrl);
    }
  }, [images]);

  // 🔥 SIMPLIFIED: Single function to select multiple images
  const selectImages = useCallback((imageUrls: string[]) => {
    console.log('🖼️ SELECT IMAGES:', {
      newImages: imageUrls,
      currentImages: images
    });
    setImages(imageUrls);
    if (imageUrls.length > 0 && !activeImageUrl) {
      setActiveImageUrl(imageUrls[0]);
    }
  }, [images, activeImageUrl]);

  const selectImage = useCallback((imageUrl: string) => {
    console.log('🖼️ SELECT SINGLE IMAGE:', imageUrl);
    if (!images.includes(imageUrl)) {
      addImage(imageUrl);
    }
    setActiveImageUrl(imageUrl);
  }, [images, addImage]);

  const setActiveImage = useCallback((imageUrl: string) => {
    console.log('🎯 SETTING ACTIVE IMAGE:', imageUrl);
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

  // 🔥 FIXED: Use enhanced analysis instead of basic analysis
  const startAnalysis = useCallback(async () => {
    if (images.length === 0) {
      toast.error('Please select at least one image to analyze');
      return;
    }

    if (!analysisContext.trim()) {
      toast.error('Please provide analysis context');
      return;
    }

    if (isAnalyzing || enhancedAnalysis.isAnalyzing) {
      console.log('⚠️ Analysis already in progress, skipping');
      return;
    }

    console.log('🚀 Starting enhanced analysis workflow:', {
      imageCount: images.length,
      annotationCount: getTotalAnnotationsCount(),
      contextLength: analysisContext.length
    });

    setIsAnalyzing(true);
    setCurrentStep('analyzing');

    try {
      const userAnnotationsArray = imageAnnotations.flatMap(imageAnnotation => 
        imageAnnotation.annotations.map(annotation => ({
          imageUrl: imageAnnotation.imageUrl,
          x: annotation.x,
          y: annotation.y,
          comment: annotation.comment,
          id: annotation.id
        }))
      );

      // 🔥 FIXED: Use enhanced analysis hook
      const result = await enhancedAnalysis.analyzeImages({
        imageUrls: images,
        userAnnotations: userAnnotationsArray,
        analysisPrompt: analysisContext,
        deviceType: 'desktop',
        useEnhancedRag: true
      });

      if (result.success) {
        console.log('✅ Enhanced analysis completed successfully:', {
          annotationCount: result.annotations.length,
          enhancedContext: !!result.enhancedContext
        });

        setAiAnnotations(result.annotations);
        setAnalysisResults(result.analysis);
        
        // 🔥 FIXED: Store enhanced context data properly
        if (result.enhancedContext) {
          setEnhancedContext(result.enhancedContext);
          setRagEnhanced(true);
          setKnowledgeSourcesUsed(result.enhancedContext.knowledgeSourcesUsed);
          setResearchCitations(result.enhancedContext.citations);
          setVisionEnhanced(true);
          setVisionConfidenceScore(result.enhancedContext.confidenceScore);
          setVisionElementsDetected(result.enhancedContext.visionAnalysis.uiElements.length);
        }
        
        setCurrentStep('results');
      } else {
        console.error('❌ Enhanced analysis failed:', result);
        toast.error('Enhanced analysis failed. Please try again.');
        setCurrentStep('annotate');
      }
    } catch (error) {
      console.error('❌ Enhanced analysis failed:', error);
      toast.error('Enhanced analysis failed. Please try again.');
      setCurrentStep('annotate');
    } finally {
      setIsAnalyzing(false);
    }
  }, [images, imageAnnotations, analysisContext, enhancedAnalysis, isAnalyzing, getTotalAnnotationsCount]);

  const goToStep = useCallback((step: WorkflowStep) => {
    console.log('🔄 Workflow: Navigating to step:', step);
    setCurrentStep(step);
  }, []);

  const goToNextStep = useCallback(() => {
    switch (currentStep) {
      case 'upload':
        if (images.length > 0) {
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
        break;
      case 'results':
        resetWorkflow();
        break;
    }
  }, [currentStep, images.length, startAnalysis, resetWorkflow]);

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

  return {
    // State - using single source of truth
    currentStep,
    selectedImages: images,
    uploadedFiles: images,
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
    currentAnalysis,
    selectedImageUrl: images[0] || null,

    // 🔥 FIXED: Enhanced analysis state integration
    isAnalyzing: isAnalyzing || enhancedAnalysis.isAnalyzing,
    isBuilding: enhancedAnalysis.isBuilding,
    buildingStage: enhancedAnalysis.buildingStage,
    hasResearchContext: enhancedAnalysis.hasResearchContext,
    researchSourcesCount: enhancedAnalysis.researchSourcesCount,

    // Actions - simplified interface
    resetWorkflow,
    selectImages,
    selectImage,
    addUploadedFile: addImage,
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
    setAiAnnotations: setAiAnnotations,
    setIsAnalyzing
  };
};
