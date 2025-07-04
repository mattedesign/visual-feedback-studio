import { useState, useCallback, useEffect } from 'react';
import { Annotation } from '@/types/analysis';
import { useEnhancedAnalysis } from './useEnhancedAnalysis';
import { toast } from 'sonner';
import { EnhancedContext } from '@/services/analysis/enhancedRagService';
// import { saveAnalysisResults } from '@/services/analysisResultsService'; // No longer needed - edge function handles saving
import { aiEnhancedSolutionEngine } from '@/services/solutions/aiEnhancedSolutionEngine';
import { analysisService } from '@/services/analysisService';
import { subscriptionService } from '@/services/subscriptionService';
import { useNavigate } from 'react-router-dom';

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

// ✅ ENHANCED: Helper function to save image URLs to uploaded_files table with better error handling
const saveImagesToUploadedFiles = async (imageUrls: string[], analysisId: string, userId?: string) => {
  if (!userId) {
    console.warn('⚠️ No userId provided for saveImagesToUploadedFiles');
    return;
  }
  
  const { supabase } = await import('@/integrations/supabase/client');
  
  try {
    console.log('💾 Saving images to uploaded_files table:', {
      imageCount: imageUrls.length,
      analysisId,
      userId: userId.substring(0, 8) + '...'
    });

    // Determine file type from URL or default to jpeg
    const uploadRecords = imageUrls.map((url, index) => {
      const isStorageUrl = url.includes('supabase.co') || url.includes('analysis-images');
      let fileType = 'image/jpeg';
      
      // Try to determine file type from URL
      if (url.includes('.png')) fileType = 'image/png';
      else if (url.includes('.webp')) fileType = 'image/webp';
      else if (url.includes('.gif')) fileType = 'image/gif';

      return {
        analysis_id: analysisId,
        user_id: userId,
        file_name: `analysis-image-${index + 1}.${fileType.split('/')[1]}`,
        file_type: fileType,
        file_size: 0, // Unknown for external URLs
        storage_path: isStorageUrl ? url : `external/${Date.now()}-${index}`,
        upload_type: isStorageUrl ? 'file' : 'url',
        public_url: url,
        original_url: url
      };
    });

    const { data, error } = await supabase
      .from('uploaded_files')
      .insert(uploadRecords)
      .select('id, public_url');

    if (error) {
      console.error('❌ Error saving images to uploaded_files:', error);
      throw error;
    } else {
      console.log(`✅ Successfully saved ${imageUrls.length} images to uploaded_files table:`, 
        data?.map(d => d.id));
      return data;
    }
  } catch (error) {
    console.error('❌ Critical error in saveImagesToUploadedFiles:', error);
    throw error; // Re-throw to handle upstream
  }
};

export const useAnalysisWorkflow = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [images, setImages] = useState<string[]>([]);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [userAnnotations, setUserAnnotations] = useState<Record<string, UserAnnotation[]>>({});
  const [imageAnnotations, setImageAnnotations] = useState<ImageAnnotations[]>([]);
  const [analysisContext, setAnalysisContext] = useState<string>('');
  const [aiAnnotations, setAiAnnotations] = useState<Annotation[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [consultationResults, setConsultationResults] = useState<any>(null);
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
  
  // 🔧 FIX: Reset workflow state when component mounts (user navigates to analysis page)
  useEffect(() => {
    console.log('🔄 WORKFLOW INITIALIZATION: Ensuring clean state for new analysis');
    setCurrentStep('upload');
    setImages([]);
    setActiveImageUrl(null);
    setUserAnnotations({});
    setImageAnnotations([]);
    setAnalysisContext('');
    setAiAnnotations([]);
    setAnalysisResults(null);
    setConsultationResults(null);
    setEnhancedContext(null);
    setRagEnhanced(false);
    setKnowledgeSourcesUsed(0);
    setResearchCitations([]);
    setVisionEnhanced(false);
    setVisionConfidenceScore(undefined);
    setVisionElementsDetected(0);
    setIsAnalyzing(false);
    setCurrentAnalysis(null);
  }, []); // Only run on mount

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
    setConsultationResults(null);
    setEnhancedContext(null);
    setRagEnhanced(false);
    setKnowledgeSourcesUsed(0);
    setResearchCitations([]);
    setVisionEnhanced(false);
    setVisionConfidenceScore(undefined);
    setVisionElementsDetected(0);
    setIsAnalyzing(false);
    setCurrentAnalysis(null);
    
    enhancedAnalysis.resetState();
  }, [enhancedAnalysis]);

  const addImage = useCallback(async (imageUrl: string) => {
    console.log('📸 ADD IMAGE CALLED:', {
      imageUrl,
      currentImages: images,
      alreadyExists: images.includes(imageUrl),
      timestamp: new Date().toISOString()
    });
    
    // ✅ FIX 1: Single analysis session creation - only create on first image AND no existing session
    if (!currentAnalysis?.id) {
      console.log('🔥 CREATING SINGLE ANALYSIS SESSION for workflow...');
      try {
        const { analysisSessionService } = await import('@/services/analysisSessionService');
        const analysisId = await analysisSessionService.getOrCreateSession();
        
        if (analysisId) {
          const { supabase } = await import('@/integrations/supabase/client');
          const { data: { user } } = await supabase.auth.getUser();
          
          setCurrentAnalysis({
            id: analysisId,
            user_id: user?.id
          });
          
          console.log('✅ SINGLE ANALYSIS SESSION CREATED:', {
            analysisId,
            userId: user?.id?.substring(0, 8) + '...',
            timestamp: new Date().toISOString()
          });
        } else {
          console.error('❌ Failed to create analysis session - no ID returned');
          return;
        }
      } catch (error) {
        console.error('❌ CRITICAL: Failed to create analysis session:', error);
        return;
      }
    }
    
    // ✅ FIX 1: Always use the same session for all images
    if (currentAnalysis?.id) {
      console.log('💾 SAVING IMAGE TO EXISTING SESSION:', {
        analysisId: currentAnalysis.id,
        imageUrl: imageUrl.substring(0, 50) + '...',
        timestamp: new Date().toISOString()
      });
      
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: { user } } = await supabase.auth.getUser();
        
        await saveImagesToUploadedFiles([imageUrl], currentAnalysis.id, user?.id);
        console.log('✅ IMAGE SAVED TO SINGLE SESSION');
      } catch (imageError) {
        console.warn('⚠️ Failed to save image to session:', imageError);
      }
    } else {
      console.error('❌ CRITICAL: No analysis session available for image save');
    }
    
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
    
    if (images.length === 0) {
      setActiveImageUrl(imageUrl);
    }
  }, [images, currentAnalysis]);

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

  // 🔥 ENHANCED: Save analysis results to database and route to saved results
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

    // 🔒 CHECK SUBSCRIPTION LIMITS BEFORE ANALYSIS
    console.log('🔒 Checking subscription limits...');
    const subscriptionCheck = await subscriptionService.checkCanCreateAnalysis();
    
    if (!subscriptionCheck.canCreate) {
      if (subscriptionCheck.shouldRedirect) {
        console.log('🔀 Redirecting to subscription page');
        navigate('/subscription');
        return;
      }
      return;
    }

    console.log('🚀 Starting enhanced analysis workflow with database storage:', {
      imageCount: images.length,
      annotationCount: getTotalAnnotationsCount(),
      contextLength: analysisContext.length,
      databaseStorage: true
    });

    setIsAnalyzing(true);
    setCurrentStep('analyzing');

    try {
      // ✅ FIX 1: Use existing analysis session or create if needed
      let analysisId = currentAnalysis?.id;
      
      if (!analysisId) {
        console.log('🔧 No existing analysis session, creating one for analysis...');
        const { analysisSessionService } = await import('@/services/analysisSessionService');
        analysisId = await analysisSessionService.getOrCreateSession();
        
        if (!analysisId) {
          throw new Error('Failed to create analysis session');
        }
        
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: { user } } = await supabase.auth.getUser();
        
        setCurrentAnalysis({
          id: analysisId,
          user_id: user?.id
        });
      }

      // ✅ FIX 5: Get user for subsequent operations  
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();

      console.log('✅ USING ANALYSIS SESSION:', {
        analysisId,
        wasExisting: !!currentAnalysis?.id,
        timestamp: new Date().toISOString()
      });
      
      console.log('💾 Current analysis context set:', { 
        analysisId, 
        userId: user?.id,
        hasValidIds: !!(analysisId && user?.id)
      });

      // ✅ CRITICAL: Save image URLs to uploaded_files table for proper dashboard display and Claude access
      try {
        const savedFiles = await saveImagesToUploadedFiles(images, analysisId, user?.id);
        console.log('✅ Images saved to uploaded_files table for dashboard display:', savedFiles?.length);
      } catch (imageSaveError) {
        console.error('❌ Failed to save images to uploaded_files - analysis will continue but dashboard may not show images correctly:', imageSaveError);
        // Continue with analysis even if image save fails
      }

      const userAnnotationsArray = imageAnnotations.flatMap(imageAnnotation => 
        imageAnnotation.annotations.map(annotation => ({
          imageUrl: imageAnnotation.imageUrl,
          x: annotation.x,
          y: annotation.y,
          comment: annotation.comment,
          id: annotation.id
        }))
      );

      // Run the analysis
      const result = await enhancedAnalysis.analyzeImages({
        imageUrls: images,
        userAnnotations: userAnnotationsArray,
        analysisPrompt: analysisContext,
        deviceType: 'desktop',
        useEnhancedRag: true
      });

      if (result.success) {
        console.log('✅ Analysis completed successfully - saving to database:', {
          annotationCount: result.annotations.length,
          enhancedContext: !!result.enhancedContext,
          wellDoneReceived: !!result.wellDone,
          wellDoneInsights: result.wellDone?.insights?.length || 0,
          permanentAnalysisId: analysisId
        });

        setAiAnnotations(result.annotations);
        
        // Prepare complete analysis results
        const analysisResultsWithWellDone = {
          ...result.analysis,
          wellDone: result.wellDone,
          annotations: result.annotations,
          images: images,
          analysisContext: analysisContext,
          enhancedContext: result.enhancedContext
        };
        setAnalysisResults(analysisResultsWithWellDone);
        
        // Store enhanced context data
        if (result.enhancedContext) {
          setEnhancedContext(result.enhancedContext);
          setRagEnhanced(true);
          setKnowledgeSourcesUsed(result.enhancedContext.knowledgeSourcesUsed);
          setResearchCitations(result.enhancedContext.citations);
          setVisionEnhanced(true);
          setVisionConfidenceScore(result.enhancedContext.confidenceScore);
          setVisionElementsDetected(result.enhancedContext.visionAnalysis.uiElements.length);
        }
        
        // 🔥 ANALYSIS RESULTS ALREADY SAVED: The edge function handles database storage
        console.log('✅ Analysis results already saved by edge function');
        
        // 🤖 GENERATE AI-ENHANCED SOLUTIONS: Integrate the new solution engine
        console.log('🤖 Generating AI-enhanced solutions...');
        try {
          const consultation = await aiEnhancedSolutionEngine.provideConsultation({
            analysisResults: result.annotations,
            userProblemStatement: undefined, // Can be added later via user input
            analysisContext: analysisContext,
            analysisId: analysisId,
            userId: user?.id
          });
          
          console.log('✅ AI-enhanced consultation completed:', {
            approach: consultation.approach,
            confidence: consultation.confidence,
            solutionCount: consultation.solutions.length
          });
          
          setConsultationResults(consultation);
          
          // Store consultation in session for results page
          sessionStorage.setItem('consultationResults', JSON.stringify(consultation));
          
        } catch (consultationError) {
          console.error('⚠️ AI consultation failed, continuing without:', consultationError);
        }
        
        toast.success('Analysis complete and saved! Redirecting to results...');
        
        // 🔥 ROUTE TO SAVED ANALYSIS: Use the permanent analysis ID
        setTimeout(() => {
          window.location.href = `/analysis/${analysisId}?beta=true`;
        }, 1000);
        
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
        // ✅ FIXED: Skip review step and go directly to analyzing with consolidated pipeline
        setCurrentStep('analyzing');
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
    consultationResults,
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
    setAnalysisContext, // ✅ FIXED: Expose analysis context setter
    setAiAnnotations, // ✅ FIXED: Expose AI annotations setter
    addUploadedFile: addImage,
    setActiveImageUrl,
    setActiveImage,
    addUserAnnotation,
    removeUserAnnotation,
    updateUserAnnotation,
    startAnalysis,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    proceedFromReview,
    getTotalAnnotationsCount,
    setIsAnalyzing
  };
};
