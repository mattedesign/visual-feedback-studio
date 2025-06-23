
import { useState } from 'react';
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
  const [imageAnnotations, setImageAnnotations] = useState<ImageAnnotations[]>([]);
  const [analysisContext, setAnalysisContext] = useState<string>('');
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisWithFiles | null>(null);
  const [aiAnnotations, setAiAnnotations] = useState<Annotation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Legacy support for single image workflows
  const selectedImageUrl = selectedImages.length > 0 ? selectedImages[0] : null;
  const userAnnotations = imageAnnotations.length > 0 ? imageAnnotations[0]?.annotations || [] : [];

  const goToStep = (step: WorkflowStep) => {
    console.log('Workflow step change:', currentStep, '->', step);
    setCurrentStep(step);
  };

  const addUploadedFile = (url: string) => {
    console.log('Adding uploaded file to workflow:', url);
    setUploadedFiles(prev => [...prev, url]);
  };

  const selectImage = (url: string) => {
    console.log('Selecting single image:', url);
    setSelectedImages([url]);
    if (!imageAnnotations.find(ia => ia.imageUrl === url)) {
      setImageAnnotations([{ imageUrl: url, annotations: [] }]);
    }
  };

  const selectImages = (urls: string[]) => {
    console.log('Selecting multiple images:', urls.length);
    setSelectedImages(urls);
    const newImageAnnotations = urls.map(url => {
      const existing = imageAnnotations.find(ia => ia.imageUrl === url);
      return existing || { imageUrl: url, annotations: [] };
    });
    setImageAnnotations(newImageAnnotations);
  };

  const addUserAnnotation = (imageUrl: string, annotation: { x: number; y: number; comment: string }) => {
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
  };

  const removeUserAnnotation = (imageUrl: string, id: string) => {
    console.log('Removing user annotation:', imageUrl, id);
    setImageAnnotations(prev =>
      prev.map(ia =>
        ia.imageUrl === imageUrl
          ? { ...ia, annotations: ia.annotations.filter(ann => ann.id !== id) }
          : ia
      )
    );
  };

  const updateUserAnnotation = (imageUrl: string, id: string, comment: string) => {
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
  };

  const getTotalAnnotationsCount = () => {
    return imageAnnotations.reduce((total, ia) => total + ia.annotations.length, 0);
  };

  // Safe setter for analysis context that preserves user input
  const updateAnalysisContext = (value: string) => {
    console.log('Updating user analysis context:', value.substring(0, 100) + '...');
    setAnalysisContext(value);
  };

  const resetWorkflow = () => {
    console.log('Resetting workflow state');
    setCurrentStep('upload');
    setUploadedFiles([]);
    setSelectedImages([]);
    setImageAnnotations([]);
    setAnalysisContext('');
    setCurrentAnalysis(null);
    setAiAnnotations([]);
    setIsAnalyzing(false);
  };

  // Smart workflow progression based on number of images
  const proceedFromUpload = (imageUrls: string[]) => {
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
  };

  const proceedFromReview = () => {
    console.log('Proceeding from review to annotate');
    // Always go to annotate step from review
    // The AnalysisWorkflow component will determine which annotate component to use
    goToStep('annotate');
  };

  return {
    currentStep,
    uploadedFiles,
    selectedImages,
    selectedImageUrl, // Legacy support
    imageAnnotations,
    userAnnotations, // Legacy support
    analysisContext,
    currentAnalysis,
    aiAnnotations,
    isAnalyzing,
    goToStep,
    addUploadedFile,
    selectImage, // Legacy support
    selectImages,
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
  };
};
