
import { useState, useMemo, useCallback } from 'react';
import { Annotation } from '@/types/analysis';
import { AnalysisWithFiles } from '@/services/analysisDataService';

export type WorkflowStep = 'upload' | 'review' | 'annotate' | 'analyzing' | 'results';

export interface ImageAnnotations {
  imageUrl: string;
  annotations: Array<{
    x: number;
    y: number;
    comment: string;
    id: string;
  }>;
}

export const useAnalysisWorkflow = () => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [imageAnnotations, setImageAnnotations] = useState<ImageAnnotations[]>([]);
  const [analysisContext, setAnalysisContext] = useState<string>('');
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisWithFiles | null>(null);
  const [aiAnnotations, setAiAnnotations] = useState<Annotation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Memoized computed values
  const selectedImageUrl = useMemo(() => 
    activeImageUrl || (selectedImages.length > 0 ? selectedImages[0] : null),
    [activeImageUrl, selectedImages]
  );

  const userAnnotations = useMemo(() => {
    const currentUrl = activeImageUrl || selectedImages[0];
    if (!currentUrl) return [];
    const imageAnnotation = imageAnnotations.find(ia => ia.imageUrl === currentUrl);
    return imageAnnotation?.annotations || [];
  }, [imageAnnotations, activeImageUrl, selectedImages]);

  const goToStep = useCallback((step: WorkflowStep) => {
    console.log('Workflow step change:', currentStep, '->', step);
    setCurrentStep(step);
  }, [currentStep]);

  const addUploadedFile = useCallback((url: string) => {
    console.log('Adding uploaded file to workflow:', url);
    setUploadedFiles(prev => [...prev, url]);
  }, []);

  const selectImage = useCallback((url: string) => {
    console.log('Selecting single image:', url);
    setSelectedImages([url]);
    setActiveImageUrl(url);
    setImageAnnotations(prev => {
      const existing = prev.find(ia => ia.imageUrl === url);
      return existing ? prev : [...prev, { imageUrl: url, annotations: [] }];
    });
  }, []);

  const selectImages = useCallback((urls: string[]) => {
    console.log('Selecting multiple images:', urls.length);
    setSelectedImages(urls);
    setActiveImageUrl(urls[0] || null);
    setImageAnnotations(prev => {
      const newImageAnnotations = urls.map(url => {
        const existing = prev.find(ia => ia.imageUrl === url);
        return existing || { imageUrl: url, annotations: [] };
      });
      return [...prev.filter(ia => !urls.includes(ia.imageUrl)), ...newImageAnnotations];
    });
  }, []);

  const setActiveImage = useCallback((url: string) => {
    console.log('Setting active image:', url);
    setActiveImageUrl(url);
    // Ensure we have an annotation entry for this image
    setImageAnnotations(prev => {
      const existing = prev.find(ia => ia.imageUrl === url);
      return existing ? prev : [...prev, { imageUrl: url, annotations: [] }];
    });
  }, []);

  const addUserAnnotation = useCallback((imageUrl: string, annotation: { x: number; y: number; comment: string }) => {
    const newAnnotation = {
      ...annotation,
      id: `user-${Date.now()}-${Math.random()}`
    };
    
    console.log('Adding user annotation to image:', imageUrl, newAnnotation);
    
    setImageAnnotations(prev => 
      prev.map(ia => 
        ia.imageUrl === imageUrl 
          ? { ...ia, annotations: [...ia.annotations, newAnnotation] }
          : ia
      )
    );
  }, []);

  const removeUserAnnotation = useCallback((imageUrl: string, id: string) => {
    console.log('Removing user annotation:', imageUrl, id);
    setImageAnnotations(prev =>
      prev.map(ia =>
        ia.imageUrl === imageUrl
          ? { ...ia, annotations: ia.annotations.filter(ann => ann.id !== id) }
          : ia
      )
    );
  }, []);

  const updateUserAnnotation = useCallback((imageUrl: string, id: string, comment: string) => {
    console.log('Updating user annotation:', imageUrl, id, comment);
    setImageAnnotations(prev =>
      prev.map(ia =>
        ia.imageUrl === imageUrl
          ? { 
              ...ia, 
              annotations: ia.annotations.map(ann => 
                ann.id === id ? { ...ann, comment } : ann
              ) 
            }
          : ia
      )
    );
  }, []);

  const getTotalAnnotationsCount = useCallback(() => {
    return imageAnnotations.reduce((total, ia) => total + ia.annotations.length, 0);
  }, [imageAnnotations]);

  // Safe setter for analysis context that preserves user input
  const updateAnalysisContext = useCallback((value: string) => {
    console.log('Updating user analysis context:', value.substring(0, 100) + '...');
    setAnalysisContext(value);
  }, []);

  const resetWorkflow = useCallback(() => {
    console.log('Resetting workflow state');
    setCurrentStep('upload');
    setUploadedFiles([]);
    setSelectedImages([]);
    setActiveImageUrl(null);
    setImageAnnotations([]);
    setAnalysisContext('');
    setCurrentAnalysis(null);
    setAiAnnotations([]);
    setIsAnalyzing(false);
  }, []);

  // Smart workflow progression based on number of images
  const proceedFromUpload = useCallback((imageUrls: string[]) => {
    console.log('Proceeding from upload with images:', imageUrls.length);
    console.log('Current analysis exists:', !!currentAnalysis);
    
    if (imageUrls.length === 1) {
      // Single image: Upload → Annotate (skip review)
      selectImage(imageUrls[0]);
      goToStep('annotate');
    } else {
      // Multiple images: Upload → Review
      selectImages(imageUrls);
      goToStep('review');
    }
  }, [currentAnalysis, selectImage, selectImages, goToStep]);

  const proceedFromReview = useCallback(() => {
    console.log('Proceeding from review to annotate');
    // Always go to annotate step from review
    // The AnalysisWorkflow component will determine which annotate component to use
    goToStep('annotate');
  }, [goToStep]);

  // Memoize the return object to prevent unnecessary re-renders
  return useMemo(() => ({
    currentStep,
    uploadedFiles,
    selectedImages,
    selectedImageUrl,
    activeImageUrl,
    imageAnnotations,
    userAnnotations,
    analysisContext,
    currentAnalysis,
    aiAnnotations,
    isAnalyzing,
    goToStep,
    addUploadedFile,
    selectImage,
    selectImages,
    setActiveImage,
    addUserAnnotation,
    removeUserAnnotation,
    updateUserAnnotation,
    getTotalAnnotationsCount,
    setAnalysisContext: updateAnalysisContext,
    setCurrentAnalysis,
    setAiAnnotations,
    setIsAnalyzing,
    resetWorkflow,
    proceedFromUpload,
    proceedFromReview,
  }), [
    currentStep,
    uploadedFiles,
    selectedImages,
    selectedImageUrl,
    activeImageUrl,
    imageAnnotations,
    userAnnotations,
    analysisContext,
    currentAnalysis,
    aiAnnotations,
    isAnalyzing,
    goToStep,
    addUploadedFile,
    selectImage,
    selectImages,
    setActiveImage,
    addUserAnnotation,
    removeUserAnnotation,
    updateUserAnnotation,
    getTotalAnnotationsCount,
    updateAnalysisContext,
    resetWorkflow,
    proceedFromUpload,
    proceedFromReview,
  ]);
};
