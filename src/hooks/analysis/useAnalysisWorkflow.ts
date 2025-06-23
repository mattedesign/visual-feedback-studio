
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
    setCurrentStep(step);
  };

  const addUploadedFile = (url: string) => {
    setUploadedFiles(prev => [...prev, url]);
  };

  const selectImage = (url: string) => {
    setSelectedImages([url]);
    if (!imageAnnotations.find(ia => ia.imageUrl === url)) {
      setImageAnnotations([{ imageUrl: url, annotations: [] }]);
    }
  };

  const selectImages = (urls: string[]) => {
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
    
    setImageAnnotations(prev => 
      prev.map(ia => 
        ia.imageUrl === imageUrl 
          ? { ...ia, annotations: [...ia.annotations, newAnnotation] }
          : ia
      )
    );
  };

  const removeUserAnnotation = (imageUrl: string, id: string) => {
    setImageAnnotations(prev =>
      prev.map(ia =>
        ia.imageUrl === imageUrl
          ? { ...ia, annotations: ia.annotations.filter(ann => ann.id !== id) }
          : ia
      )
    );
  };

  const updateUserAnnotation = (imageUrl: string, id: string, comment: string) => {
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

  const resetWorkflow = () => {
    setCurrentStep('upload');
    setUploadedFiles([]);
    setSelectedImages([]);
    setImageAnnotations([]);
    setAnalysisContext('');
    setCurrentAnalysis(null);
    setAiAnnotations([]);
    setIsAnalyzing(false);
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
    setAnalysisContext,
    setCurrentAnalysis,
    setAiAnnotations,
    setIsAnalyzing,
    resetWorkflow,
  };
};
