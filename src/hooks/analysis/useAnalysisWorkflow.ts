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
    setCurrentAnalysis,
    aiProviderConfig,
    setAIProviderConfig
  };
};
