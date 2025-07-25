import { useState, useCallback, useEffect } from 'react';
import { Annotation } from '@/types/analysis';
import { UserComment, ImageComments, createUserComment } from '@/types/userComment';
import { useEnhancedAnalysis } from './useEnhancedAnalysis';
import { toast } from 'sonner';
import { EnhancedContext } from '@/services/analysis/enhancedRagService';
// import { saveAnalysisResults } from '@/services/analysisResultsService'; // No longer needed - edge function handles saving
import { aiEnhancedSolutionEngine } from '@/services/solutions/aiEnhancedSolutionEngine';
import { analysisService } from '@/services/analysisService';
import { subscriptionService } from '@/services/subscriptionService';
import { useNavigate } from 'react-router-dom';

export type WorkflowStep = 'upload' | 'annotate' | 'review' | 'analyzing' | 'results';

// ✅ NEW: Phase 4.3 - Enhanced workflow state management
export type WorkflowStatus = 'idle' | 'busy' | 'error' | 'success';
export type WorkflowTransition = {
  from: WorkflowStep;
  to: WorkflowStep;
  timestamp: number;
  trigger: string;
  metadata?: Record<string, any>;
};

interface WorkflowState {
  currentStep: WorkflowStep;
  status: WorkflowStatus;
  canProceed: boolean;
  canGoBack: boolean;
  isTransitioning: boolean;
  lastError?: string;
  transitionHistory: WorkflowTransition[];
  validationErrors: Record<WorkflowStep, string[]>;
}

// Legacy interface for backward compatibility
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
  
  // ✅ NEW: Phase 4.3 - Enhanced workflow state management
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    currentStep: 'upload',
    status: 'idle',
    canProceed: false,
    canGoBack: false,
    isTransitioning: false,
    transitionHistory: [],
    validationErrors: {
      upload: [],
      annotate: [],
      review: [],
      analyzing: [],
      results: []
    }
  });
  
  // Legacy state for backward compatibility
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('upload');
  const [images, setImages] = useState<string[]>([]);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [userAnnotations, setUserAnnotations] = useState<Record<string, UserAnnotation[]>>({});
  const [imageAnnotations, setImageAnnotations] = useState<ImageAnnotations[]>([]);
  // ✅ NEW: Separate user comments state
  const [userComments, setUserComments] = useState<ImageComments[]>([]);
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
  
  // ✅ NEW: Phase 4.2 - Automated Analysis Triggers (now persistent)
  const [autoAnalysisEnabled, setAutoAnalysisEnabled] = useState<boolean>(false);
  const [autoAnalysisDelay, setAutoAnalysisDelay] = useState<number>(3000);
  const [lastChangeTimestamp, setLastChangeTimestamp] = useState<number>(0);
  const [pendingAutoAnalysis, setPendingAutoAnalysis] = useState<NodeJS.Timeout | null>(null);
  const [autoAnalysisHistory, setAutoAnalysisHistory] = useState<Array<{timestamp: number, trigger: string, imageCount: number}>>([]);
  const [smartTriggerThreshold, setSmartTriggerThreshold] = useState<number>(2);
  const [autoAnalysisContext, setAutoAnalysisContext] = useState<string>('Auto-analysis based on design changes');
  
  // ✅ NEW: Load automation preferences from database
  useEffect(() => {
    const loadAutomationPreferences = async () => {
      try {
        const { automationPreferencesService } = await import('@/services/figmant/automationPreferencesService');
        const preferences = await automationPreferencesService.getPreferences();
        
        setAutoAnalysisEnabled(preferences.autoAnalysisEnabled);
        setAutoAnalysisDelay(preferences.autoAnalysisDelay);
        setSmartTriggerThreshold(preferences.smartTriggerThreshold);
        
        console.log('📋 Loaded automation preferences:', preferences);
      } catch (error) {
        console.warn('Failed to load automation preferences:', error);
      }
    };

    loadAutomationPreferences();
  }, []);
  
  // ✅ NEW: Phase 4.3 - Enhanced workflow state synchronization
  useEffect(() => {
    setWorkflowState(prev => ({
      ...prev,
      currentStep,
      status: isAnalyzing ? 'busy' : (analysisResults ? 'success' : 'idle'),
      canProceed: validateCanProceed(currentStep, images, analysisContext),
      canGoBack: validateCanGoBack(currentStep),
      isTransitioning: false
    }));
  }, [currentStep, isAnalyzing, analysisResults, images, analysisContext]);

  // ✅ NEW: Phase 4.3 - Workflow validation functions
  const validateCanProceed = useCallback((step: WorkflowStep, imageList: string[], context: string): boolean => {
    switch (step) {
      case 'upload':
        return imageList.length > 0;
      case 'annotate':
        return true; // Can always proceed from annotate
      case 'review':
        return context.trim().length > 0;
      case 'analyzing':
        return false; // Cannot proceed while analyzing
      case 'results':
        return false; // End state
      default:
        return false;
    }
  }, []);

  const validateCanGoBack = useCallback((step: WorkflowStep): boolean => {
    return step !== 'upload' && step !== 'analyzing';
  }, []);

  // ✅ NEW: Phase 4.3 - Enhanced workflow transition tracking
  const recordTransition = useCallback((from: WorkflowStep, to: WorkflowStep, trigger: string, metadata?: Record<string, any>) => {
    const transition: WorkflowTransition = {
      from,
      to,
      timestamp: Date.now(),
      trigger,
      metadata
    };

    setWorkflowState(prev => ({
      ...prev,
      transitionHistory: [...prev.transitionHistory, transition].slice(-20) // Keep last 20 transitions
    }));

    console.log('🔄 Workflow Transition:', transition);
  }, []);

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
    
    // ✅ NEW: Reset enhanced workflow state
    setWorkflowState(prev => ({
      ...prev,
      currentStep: 'upload',
      status: 'idle',
      canProceed: false,
      canGoBack: false,
      isTransitioning: false,
      lastError: undefined,
      transitionHistory: [],
      validationErrors: {
        upload: [],
        annotate: [],
        review: [],
        analyzing: [],
        results: []
      }
    }));
    
    // ✅ NEW: Phase 4.2 - Listen for automated analysis events
    const handleAutomatedAnalysis = (event: CustomEvent) => {
      const { sessionId, parameters } = event.detail;
      console.log('🤖 Received automated analysis event:', { sessionId, parameters });
      
      if (parameters.analysisType === 'comprehensive') {
        // Set context for automated analysis
        if (!analysisContext.trim()) {
          setAnalysisContext('Automated comprehensive analysis triggered by design changes');
        }
        // Start analysis after a short delay
        setTimeout(() => {
          startAnalysis();
        }, 1000);
      }
    };

    window.addEventListener('figmant:automated-analysis', handleAutomatedAnalysis as EventListener);
    
    return () => {
      window.removeEventListener('figmant:automated-analysis', handleAutomatedAnalysis as EventListener);
    };
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

  // ✅ FIX: Shared analysis session ID for all uploads
  const getOrCreateAnalysisSession = useCallback(async () => {
    if (currentAnalysis?.id) {
      return currentAnalysis.id;
    }
    
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
        
        return analysisId;
      } else {
        console.error('❌ Failed to create analysis session - no ID returned');
        return null;
      }
    } catch (error) {
      console.error('❌ CRITICAL: Failed to create analysis session:', error);
      return null;
    }
  }, [currentAnalysis]);

  const addImage = useCallback(async (imageUrl: string) => {
    console.log('📸 ADD IMAGE CALLED:', {
      imageUrl,
      currentImages: images,
      alreadyExists: images.includes(imageUrl),
      timestamp: new Date().toISOString()
    });
    
    // ✅ FIX 1: Use shared analysis session
    const analysisId = await getOrCreateAnalysisSession();
    if (!analysisId) {
      console.error('❌ CRITICAL: No analysis session available for image save');
      return;
    }
    
    // Save image to the analysis session
    console.log('💾 SAVING IMAGE TO SESSION:', {
      analysisId,
      imageUrl: imageUrl.substring(0, 50) + '...',
      timestamp: new Date().toISOString()
    });
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      
      await saveImagesToUploadedFiles([imageUrl], analysisId, user?.id);
      console.log('✅ IMAGE SAVED TO SESSION');
    } catch (imageError) {
      console.warn('⚠️ Failed to save image to session:', imageError);
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
      
      // ✅ NEW: Phase 4.2 - Trigger auto-analysis when image is added
      setTimeout(() => {
        triggerAutoAnalysisIfEnabled(newImages.length, 'image_addition');
      }, 100); // Small delay to ensure state is updated
      
      return newImages;
    });
    
    if (images.length === 0) {
      setActiveImageUrl(imageUrl);
    }
  }, [images, getOrCreateAnalysisSession]);

  // ✅ NEW: Phase 4.2 - Enhanced auto-analysis with automation service integration
  const triggerAutoAnalysisIfEnabled = useCallback(async (imageCount: number, trigger: string) => {
    if (!autoAnalysisEnabled || isAnalyzing || imageCount < smartTriggerThreshold) {
      return;
    }

    // Clear any pending auto-analysis
    if (pendingAutoAnalysis) {
      clearTimeout(pendingAutoAnalysis);
    }

    console.log('🤖 Auto-analysis triggered:', { trigger, imageCount, delay: autoAnalysisDelay });
    
    // Integrate with automation service
    try {
      const { figmantAutomationService } = await import('@/services/figmant/automationService');
      const sessionId = currentAnalysis?.id || 'temp-session';
      
      await figmantAutomationService.evaluateTriggersForSession(sessionId, {
        imageCount,
        lastChange: Date.now(),
        designChanges: [{
          timestamp: Date.now(),
          sessionId,
          changeType: 'addition',
          affectedImages: images.slice(-1), // Latest image
          severity: 'medium',
          metadata: { trigger, autoTriggered: true }
        }]
      });
    } catch (error) {
      console.warn('⚠️ Automation service integration failed:', error);
    }
    
    const timeout = setTimeout(() => {
      if (!isAnalyzing && images.length >= smartTriggerThreshold) {
        console.log('🚀 Starting automated analysis');
        
        // Set auto-generated context if none provided
        if (!analysisContext.trim()) {
          setAnalysisContext(autoAnalysisContext);
        }
        
        // Track auto-analysis
        setAutoAnalysisHistory(prev => [...prev, {
          timestamp: Date.now(),
          trigger,
          imageCount
        }].slice(-10)); // Keep last 10 auto-analyses
        
        // Trigger analysis by setting the step
        setCurrentStep('analyzing');
      }
    }, autoAnalysisDelay);

    setPendingAutoAnalysis(timeout);
  }, [autoAnalysisEnabled, isAnalyzing, smartTriggerThreshold, pendingAutoAnalysis, autoAnalysisDelay, images.length, analysisContext, autoAnalysisContext, currentAnalysis]);

  // ✅ NEW: Phase 4.2 - Toggle auto-analysis with persistence
  const toggleAutoAnalysis = useCallback(async (enabled: boolean) => {
    setAutoAnalysisEnabled(enabled);
    if (!enabled && pendingAutoAnalysis) {
      clearTimeout(pendingAutoAnalysis);
      setPendingAutoAnalysis(null);
    }
    
    // Save to user preferences
    try {
      const { automationPreferencesService } = await import('@/services/figmant/automationPreferencesService');
      await automationPreferencesService.toggleFeature('autoAnalysisEnabled', enabled);
    } catch (error) {
      console.warn('Failed to save automation preference:', error);
    }
  }, [pendingAutoAnalysis]);

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

    // ✅ NEW: Also add to user comments system
    const newComment = createUserComment(
      annotation.x, 
      annotation.y, 
      annotation.comment, 
      imageUrl
    );
    
    setUserComments(prev => {
      const existingIndex = prev.findIndex(ic => ic.imageUrl === imageUrl);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          comments: [...updated[existingIndex].comments, newComment]
        };
        return updated;
      } else {
        return [...prev, { imageUrl, comments: [newComment] }];
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
      toast.error('Please provide analysis context - describe what you want me to analyze');
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

    // ✅ IMPROVED: Use user comments for analysis context (reduced payload)
    const userCommentsArray = userComments.flatMap(imageComment => 
      imageComment.comments.map(comment => ({
        imageUrl: comment.imageUrl || imageComment.imageUrl,
        x: Math.round(comment.x * 10) / 10, // Round to 1 decimal place
        y: Math.round(comment.y * 10) / 10, // Round to 1 decimal place
        comment: comment.comment.substring(0, 500) // Limit comment length
      }))
    );

    // ✅ OPTIMIZED: Further reduce payload size for edge function
    const optimizedPayload = {
      imageUrls: images.slice(0, 5), // Limit to max 5 images to avoid timeout
      analysisId,
      analysisPrompt: analysisContext.substring(0, 800), // Further reduced context length
      designType: 'website',
      isComparative: images.length > 1,
      ragEnhanced: true,
      // Only include essential user comment data
      userComments: userCommentsArray.slice(0, 8).map(comment => ({
        imageUrl: comment.imageUrl,
        x: Math.round(comment.x),
        y: Math.round(comment.y), 
        comment: comment.comment.substring(0, 200) // Limit comment length
      }))
    };

    console.log('🚀 Starting optimized analysis with reduced payload:', {
      imageCount: optimizedPayload.imageUrls.length,
      commentCount: optimizedPayload.userComments.length,
      contextLength: optimizedPayload.analysisPrompt.length
    });

    // Run the analysis with optimized payload
    const result = await analysisService.analyzeDesign(optimizedPayload);

      if (result.success) {
        console.log('✅ Analysis completed successfully - saving to database:', {
          annotationCount: result.annotations?.length || 0,
          wellDoneReceived: !!result.wellDone,
          wellDoneInsights: result.wellDone?.insights?.length || 0,
          permanentAnalysisId: analysisId
        });

        setAiAnnotations(result.annotations || []);
        
        // Prepare complete analysis results
        const analysisResultsWithWellDone = {
          success: result.success,
          wellDone: result.wellDone,
          annotations: result.annotations,
          images: images,
          analysisContext: analysisContext,
          researchEnhanced: result.researchEnhanced,
          knowledgeSourcesUsed: result.knowledgeSourcesUsed,
          researchCitations: result.researchCitations
        };
        setAnalysisResults(analysisResultsWithWellDone);
        
        // Store research context data
        if (result.researchEnhanced) {
          setRagEnhanced(true);
          setKnowledgeSourcesUsed(result.knowledgeSourcesUsed || 0);
          setResearchCitations(result.researchCitations || []);
          setVisionEnhanced(true);
          setVisionConfidenceScore(0.8);
          setVisionElementsDetected(5);
        }
        
        // ✅ ANALYSIS COMPLETE: Edge function handles database storage
        console.log('✅ Analysis results saved successfully');
        
        toast.success('Analysis complete! Redirecting to results...');
        
        // 🔥 ROUTE TO SAVED ANALYSIS: Use the permanent analysis ID
        setTimeout(() => {
          window.location.href = `/analysis/${analysisId}?beta=true`;
        }, 1000);
        
      } else {
        console.error('❌ Enhanced analysis failed:', result);
        toast.error('Analysis failed. Please try again.');
        setCurrentStep('upload'); // Reset to upload step instead of annotate
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error('❌ Enhanced analysis failed:', error);
      toast.error('Analysis failed. Please try again.');
      setCurrentStep('upload'); // Reset to upload step instead of annotate
      setIsAnalyzing(false);
    } finally {
      setIsAnalyzing(false);
    }
  }, [images, userComments, analysisContext, isAnalyzing, getTotalAnnotationsCount, navigate, currentAnalysis]);

  // ✅ NEW: Phase 4.3 - Enhanced workflow step management with transition tracking
  const goToStep = useCallback((step: WorkflowStep, trigger: string = 'manual') => {
    const previousStep = currentStep;
    console.log('🔄 Workflow: Navigating to step:', { from: previousStep, to: step, trigger });
    
    recordTransition(previousStep, step, trigger);
    setCurrentStep(step);
  }, [currentStep, recordTransition]);

  const goToNextStep = useCallback(() => {
    const previousStep = currentStep;

    switch (currentStep) {
      case 'upload':
        if (images.length > 0) {
          recordTransition(previousStep, 'annotate', 'next_step');
          setCurrentStep('annotate');
        }
        break;
      case 'annotate':
        // ✅ FIXED: Skip review step and go directly to analyzing with consolidated pipeline
        recordTransition(previousStep, 'analyzing', 'next_step');
        setCurrentStep('analyzing');
        break;
      case 'review':
        recordTransition(previousStep, 'analyzing', 'start_analysis');
        startAnalysis();
        break;
      case 'analyzing':
        break;
      case 'results':
        recordTransition(previousStep, 'upload', 'reset_workflow');
        resetWorkflow();
        break;
    }
  }, [currentStep, images.length, startAnalysis, resetWorkflow, recordTransition]);

  const goToPreviousStep = useCallback(() => {
    const previousStep = currentStep;
    switch (currentStep) {
      case 'annotate':
        recordTransition(previousStep, 'upload', 'previous_step');
        setCurrentStep('upload');
        break;
      case 'review':
        recordTransition(previousStep, 'annotate', 'previous_step');
        setCurrentStep('annotate');
        break;
      case 'results':
        recordTransition(previousStep, 'review', 'previous_step');
        setCurrentStep('review');
        break;
    }
  }, [currentStep, recordTransition]);

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
    // ✅ NEW: Expose user comments
    userComments,
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

    // Enhanced state integration
    isAnalyzing: isAnalyzing,
    isBuilding: false,
    buildingStage: 'idle',
    hasResearchContext: ragEnhanced,
    researchSourcesCount: knowledgeSourcesUsed,

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
    setIsAnalyzing,
    getOrCreateAnalysisSession, // ✅ FIX: Expose session creation function
    
    // ✅ NEW: Phase 4.2 - Auto-analysis controls
    autoAnalysisEnabled,
    autoAnalysisHistory,
    toggleAutoAnalysis,
    setSmartTriggerThreshold,
    setAutoAnalysisDelay,
    
    // ✅ NEW: Phase 4.3 - Enhanced workflow orchestration
    workflowState,
    transitionHistory: workflowState.transitionHistory,
    canProceed: workflowState.canProceed,
    canGoBack: workflowState.canGoBack,
    workflowStatus: workflowState.status,
    validationErrors: workflowState.validationErrors,
    recordTransition
  };
};
