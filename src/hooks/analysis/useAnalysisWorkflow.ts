
import { useState } from 'react';
import { Annotation } from '@/types/analysis';
import { AnalysisWithFiles } from '@/services/analysisDataService';

export type WorkflowStep = 'upload' | 'review' | 'annotate' | 'analyzing' | 'results';

export const useAnalysisWorkflow = () => {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [userAnnotations, setUserAnnotations] = useState<Array<{
    x: number;
    y: number;
    comment: string;
    id: string;
  }>>([]);
  const [analysisContext, setAnalysisContext] = useState<string>('');
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisWithFiles | null>(null);
  const [aiAnnotations, setAiAnnotations] = useState<Annotation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const goToStep = (step: WorkflowStep) => {
    setCurrentStep(step);
  };

  const addUploadedFile = (url: string) => {
    setUploadedFiles(prev => [...prev, url]);
  };

  const selectImage = (url: string) => {
    setSelectedImageUrl(url);
  };

  const addUserAnnotation = (annotation: { x: number; y: number; comment: string }) => {
    const newAnnotation = {
      ...annotation,
      id: `user-${Date.now()}-${Math.random()}`
    };
    setUserAnnotations(prev => [...prev, newAnnotation]);
  };

  const removeUserAnnotation = (id: string) => {
    setUserAnnotations(prev => prev.filter(ann => ann.id !== id));
  };

  const updateUserAnnotation = (id: string, comment: string) => {
    setUserAnnotations(prev => 
      prev.map(ann => ann.id === id ? { ...ann, comment } : ann)
    );
  };

  const resetWorkflow = () => {
    setCurrentStep('upload');
    setUploadedFiles([]);
    setSelectedImageUrl(null);
    setUserAnnotations([]);
    setAnalysisContext('');
    setCurrentAnalysis(null);
    setAiAnnotations([]);
    setIsAnalyzing(false);
  };

  return {
    currentStep,
    uploadedFiles,
    selectedImageUrl,
    userAnnotations,
    analysisContext,
    currentAnalysis,
    aiAnnotations,
    isAnalyzing,
    goToStep,
    addUploadedFile,
    selectImage,
    addUserAnnotation,
    removeUserAnnotation,
    updateUserAnnotation,
    setAnalysisContext,
    setCurrentAnalysis,
    setAiAnnotations,
    setIsAnalyzing,
    resetWorkflow,
  };
};
