
import { useState, useCallback, useRef } from 'react';
import { useImageProcessing } from './useImageProcessing';
import { useAnnotationSystem } from './useAnnotationSystem';
import { useAnalysisEngine } from './useAnalysisEngine';
import { analysisService } from '@/services/analysisService';
import { toast } from 'sonner';
import { Annotation, AnalysisStep } from '@/types/analysis';

export type AIProviderRequestConfig = {
  aiProvider?: string;
  model?: string;
  testMode?: boolean;
};

export const useAnalysisWorkflow = () => {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('upload');
  const [analysisContext, setAnalysisContext] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<{ id: string } | null>(null);
  const [aiProviderConfig, setAIProviderConfig] = useState<AIProviderRequestConfig>({});
  const [aiAnnotations, setAIAnnotations] = useState<Annotation[]>([]);
  const [userAnnotations, setUserAnnotations] = useState<{ [imageUrl: string]: Annotation[] }>({});
  const [researchCitations, setResearchCitations] = useState<string[]>([]);
  const [knowledgeSourcesUsed, setKnowledgeSourcesUsed] = useState<number>(0);
  const [ragEnhanced, setRAGEnhanced] = useState<boolean>(false);
  const [enhancedContext, setEnhancedContext] = useState<string>('');
  const [visionEnhanced, setVisionEnhanced] = useState<boolean>(false);
  const [visionConfidenceScore, setVisionConfidenceScore] = useState<number>(0);
  const [visionElementsDetected, setVisionElementsDetected] = useState<string[]>([]);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

  const imageProcessing = useImageProcessing();
  const annotationSystem = useAnnotationSystem();
  const analysisEngine = useAnalysisEngine();

  analysisEngine.setAIAnnotations = setAIAnnotations;
  analysisEngine.setResearchCitations = setResearchCitations;
  analysisEngine.setKnowledgeSourcesUsed = setKnowledgeSourcesUsed;
  analysisEngine.setRAGEnhanced = setRAGEnhanced;

  const uploadFiles = useCallback(async (files: File[]) => {
    try {
      const urls = await imageProcessing.processAndUpload(files);
      setUploadedFiles(urls);
      setCurrentStep('review');
      return urls;
    } catch (error) {
      toast.error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }, [imageProcessing]);

  const selectImages = useCallback((images: string[]) => {
    setSelectedImages(images);
  }, []);

  const proceedFromReview = useCallback(() => {
    setCurrentStep('annotate');
  }, []);

  const goToStep = useCallback((step: AnalysisStep) => {
    setCurrentStep(step);
  }, []);

  const resetWorkflow = useCallback(() => {
    setUploadedFiles([]);
    setSelectedImages([]);
    setCurrentStep('upload');
    setAnalysisContext('');
    setAIAnnotations([]);
    setUserAnnotations({});
    setResearchCitations([]);
    setKnowledgeSourcesUsed(0);
    setRAGEnhanced(false);
    setEnhancedContext('');
    setVisionEnhanced(false);
    setVisionConfidenceScore(0);
    setVisionElementsDetected([]);
    setActiveImageUrl(null);
  }, []);

  const addAnnotation = useCallback((imageUrl: string, annotation: Annotation) => {
    setUserAnnotations(prev => ({
      ...prev,
      [imageUrl]: [...(prev[imageUrl] || []), annotation]
    }));
  }, []);

  const updateAnnotation = useCallback((imageUrl: string, updatedAnnotation: Annotation) => {
    setUserAnnotations(prev => {
      const annotations = prev[imageUrl] || [];
      const updatedAnnotations = annotations.map(a => a.id === updatedAnnotation.id ? updatedAnnotation : a);
      return { ...prev, [imageUrl]: updatedAnnotations };
    });
  }, []);

  const deleteAnnotation = useCallback((imageUrl: string, annotationId: string) => {
    setUserAnnotations(prev => {
      const annotations = prev[imageUrl] || [];
      const updatedAnnotations = annotations.filter(a => a.id !== annotationId);
      return { ...prev, [imageUrl]: updatedAnnotations };
    });
  }, []);

  const getTotalAnnotationsCount = () => {
    let count = 0;
    Object.values(userAnnotations).forEach(annotations => {
      count += annotations.length;
    });
    return count;
  };

  // NEW: Add uploaded file method
  const addUploadedFile = useCallback((imageUrl: string) => {
    setUploadedFiles(prev => {
      if (!prev.includes(imageUrl)) {
        const newFiles = [...prev, imageUrl];
        // Also add to selected images
        setSelectedImages(newFiles);
        return newFiles;
      }
      return prev;
    });
  }, []);

  // NEW: Set active image method
  const setActiveImage = useCallback((imageUrl: string | null) => {
    setActiveImageUrl(imageUrl);
  }, []);

  // NEW: Select single image method
  const selectImage = useCallback((imageUrl: string) => {
    setActiveImageUrl(imageUrl);
  }, []);

  // NEW: Add user annotation method
  const addUserAnnotation = useCallback((imageUrl: string, annotation: { x: number; y: number; comment: string }) => {
    const newAnnotation: Annotation = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      x: annotation.x,
      y: annotation.y,
      category: 'ux',
      severity: 'suggested',
      feedback: annotation.comment,
      implementationEffort: 'low',
      businessImpact: 'medium'
    };
    
    setUserAnnotations(prev => ({
      ...prev,
      [imageUrl]: [...(prev[imageUrl] || []), newAnnotation]
    }));
  }, []);

  // NEW: Convert userAnnotations to imageAnnotations format
  const imageAnnotations = Object.entries(userAnnotations).map(([imageUrl, annotations]) => ({
    imageUrl,
    annotations
  }));

  // NEW: Get selected image URL (for backward compatibility)
  const selectedImageUrl = selectedImages[0] || null;

  // NEW: Start analysis method
  const startAnalysis = useCallback(async () => {
    if (!currentAnalysis) {
      // Create analysis if not exists
      const analysisId = await analysisService.createAnalysis();
      if (!analysisId) {
        toast.error('Failed to create analysis');
        return;
      }
      setCurrentAnalysis({ id: analysisId });
    }
    
    await performAnalysis();
  }, [currentAnalysis]);

  const performAnalysis = useCallback(async () => {
    if (!currentAnalysis || selectedImages.length === 0) {
      console.error('❌ Analysis prerequisites not met');
      return;
    }

    console.log('🔄 Starting comprehensive analysis with AI config:', aiProviderConfig);
    setIsAnalyzing(true);

    try {
      const analysisRequest = {
        imageUrls: selectedImages,
        analysisId: currentAnalysis.id,
        analysisPrompt: analysisContext || 'Comprehensive UX analysis',
        designType: selectedImages.length > 1 ? 'responsive' : 'desktop',
        isComparative: selectedImages.length > 1,
        ragEnhanced: true,
        researchSourceCount: 5,
        ...aiProviderConfig
      };

      console.log('📡 Analysis request with AI config:', analysisRequest);

      const result = await analysisService.analyzeDesign(analysisRequest);

      if (result.success && result.annotations) {
        console.log('✅ Analysis completed successfully');
        
        analysisEngine.setAIAnnotations(result.annotations);
        analysisEngine.setResearchCitations(result.researchCitations || []);
        analysisEngine.setKnowledgeSourcesUsed(result.knowledgeSourcesUsed || 0);
        analysisEngine.setRAGEnhanced(result.researchEnhanced || false);
        
        setCurrentStep('results');
        
        toast.success(`Analysis complete! Found ${result.annotations.length} insights${result.researchEnhanced ? ' with research backing' : ''}.`);
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      toast.error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCurrentStep('annotate');
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentAnalysis, selectedImages, analysisContext, analysisEngine, aiProviderConfig]);

  return {
    uploadedFiles,
    selectedImages,
    currentStep,
    analysisContext,
    isAnalyzing,
    aiAnnotations,
    userAnnotations,
    currentAnalysis,
    researchCitations,
    knowledgeSourcesUsed,
    ragEnhanced,
    enhancedContext,
    visionEnhanced,
    visionConfidenceScore,
    visionElementsDetected,
    activeImageUrl,
    imageAnnotations,
    selectedImageUrl,
    setUploadedFiles,
    setSelectedImages,
    setCurrentStep,
    setAnalysisContext,
    setIsAnalyzing,
    setAIAnnotations,
    setUserAnnotations,
    setResearchCitations,
    setKnowledgeSourcesUsed,
    setRAGEnhanced,
    setEnhancedContext,
    setVisionEnhanced,
    setVisionConfidenceScore,
    setVisionElementsDetected,
    setActiveImage,
    uploadFiles,
    selectImages,
    proceedFromReview,
    goToStep,
    resetWorkflow,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    getTotalAnnotationsCount,
    performAnalysis,
    startAnalysis,
    setCurrentAnalysis,
    aiProviderConfig,
    setAIProviderConfig,
    addUploadedFile,
    selectImage,
    addUserAnnotation
  };
};
