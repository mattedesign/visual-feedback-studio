import { useState, useEffect } from 'react';
import { Annotation } from '@/types/analysis';
import { toast } from 'sonner';
import { 
  getUserAnalyses, 
  getAnalysisById, 
  getFileUrl, 
  AnalysisWithFiles,
  updateAnalysisStatus,
  updateAnalysisContext
} from '@/services/analysisDataService';
import { 
  saveAnnotation, 
  getAnnotationsForAnalysis, 
  deleteAnnotation 
} from '@/services/annotationsService';
import { supabase } from '@/integrations/supabase/client';

export const useAnalysis = () => {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisWithFiles | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisWithFiles[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(true);
  const [isUploadInProgress, setIsUploadInProgress] = useState(false);

  // Load user analyses on mount, but don't auto-load analysis if upload is in progress
  useEffect(() => {
    const loadAnalyses = async () => {
      setIsLoadingAnalyses(true);
      try {
        const userAnalyses = await getUserAnalyses();
        setAnalyses(userAnalyses);
        
        // Only auto-load if there's no upload in progress and no current analysis
        if (!isUploadInProgress && !currentAnalysis && userAnalyses.length > 0) {
          const recentAnalysis = userAnalyses[0];
          if (recentAnalysis && recentAnalysis.files.length > 0) {
            await loadAnalysis(recentAnalysis.id);
          }
        }
      } catch (error) {
        console.error('Error loading analyses:', error);
        toast.error('Failed to load previous analyses');
      } finally {
        setIsLoadingAnalyses(false);
      }
    };

    loadAnalyses();
  }, [isUploadInProgress, currentAnalysis]);

  const loadAnalysis = async (analysisId: string) => {
    try {
      console.log('Loading analysis:', analysisId);
      const analysis = await getAnalysisById(analysisId);
      
      if (!analysis) {
        console.error('Analysis not found');
        toast.error('Analysis not found');
        return;
      }

      if (analysis.files.length === 0) {
        console.error('Analysis has no files');
        toast.error('Analysis has no files');
        return;
      }

      setCurrentAnalysis(analysis);
      
      // Get the first file URL
      const firstFile = analysis.files[0];
      const fileUrl = getFileUrl(firstFile);
      
      console.log('File URL for analysis:', fileUrl);
      
      if (!fileUrl) {
        console.error('No valid file URL found for analysis');
        toast.error('No valid file URL found for this analysis');
        setImageUrl(null);
        return;
      }

      // Verify the URL is accessible before setting it
      try {
        const response = await fetch(fileUrl, { method: 'HEAD' });
        if (response.ok) {
          setImageUrl(fileUrl);
          
          // Load existing annotations for this analysis
          const existingAnnotations = await getAnnotationsForAnalysis(analysisId);
          setAnnotations(existingAnnotations);
          
          console.log('Analysis loaded successfully with', existingAnnotations.length, 'annotations');
          toast.success(`Loaded analysis: ${analysis.title}`);
        } else {
          throw new Error(`File not accessible: ${response.status} ${response.statusText}`);
        }
      } catch (urlError) {
        console.error('Error verifying file URL:', urlError);
        toast.error('File is not accessible. Please try uploading again.');
        setImageUrl(null);
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
      toast.error('Failed to load analysis');
    }
  };

  const handleImageUpload = async (uploadedImageUrl: string) => {
    console.log('Handling image upload with URL:', uploadedImageUrl);
    
    // Set upload in progress to prevent auto-loading
    setIsUploadInProgress(true);
    
    try {
      // Verify the uploaded URL is accessible
      const response = await fetch(uploadedImageUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Uploaded file not accessible: ${response.status} ${response.statusText}`);
      }
      
      setImageUrl(uploadedImageUrl);
      
      // Refresh analyses list to include the new upload
      const userAnalyses = await getUserAnalyses();
      setAnalyses(userAnalyses);
      
      // Set the most recent analysis as current and clear previous annotations
      if (userAnalyses.length > 0) {
        const latestAnalysis = userAnalyses[0];
        setCurrentAnalysis(latestAnalysis);
        
        // Load annotations for the new analysis
        const existingAnnotations = await getAnnotationsForAnalysis(latestAnalysis.id);
        setAnnotations(existingAnnotations);
        
        console.log('Current analysis set to:', latestAnalysis.id);
      }
      
      toast.success('Design uploaded successfully!');
    } catch (error) {
      console.error('Error handling image upload:', error);
      toast.error(`Upload verification failed: ${error.message}`);
      setImageUrl(null);
    } finally {
      setIsUploadInProgress(false);
    }
  };

  const handleAreaClick = async (coordinates: { x: number; y: number }) => {
    if (!currentAnalysis) {
      toast.error('No analysis selected');
      return;
    }

    const newAnnotationData: Omit<Annotation, 'id'> = {
      x: coordinates.x,
      y: coordinates.y,
      category: 'ux',
      severity: 'suggested',
      feedback: `Clicked area at ${coordinates.x.toFixed(1)}%, ${coordinates.y.toFixed(1)}%. Consider improving the user experience in this section.`,
      implementationEffort: 'medium',
      businessImpact: 'high'
    };

    const savedAnnotation = await saveAnnotation(newAnnotationData, currentAnalysis.id);
    if (savedAnnotation) {
      setAnnotations(prev => [...prev, savedAnnotation]);
      setActiveAnnotation(savedAnnotation.id);
      toast.success('Annotation added');
    }
  };

  const handleAnalyze = async () => {
    if (!imageUrl || !currentAnalysis) {
      toast.error('No design or analysis selected');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('Starting AI analysis for:', { imageUrl, analysisId: currentAnalysis.id });
      
      // Update analysis status to indicate it's being processed
      await updateAnalysisStatus(currentAnalysis.id, 'analyzing');
      
      // Update analysis context with basic info
      await updateAnalysisContext(currentAnalysis.id, {
        analysis_prompt: 'AI-powered design analysis focusing on UX, accessibility, and conversion optimization',
        ai_model_used: 'claude-3-5-sonnet-20241022'
      });

      // Call the AI analysis edge function
      const { data, error } = await supabase.functions.invoke('analyze-design', {
        body: {
          imageUrl,
          analysisId: currentAnalysis.id,
          analysisPrompt: 'Analyze this design for UX, accessibility, and conversion optimization opportunities. Focus on critical issues that impact user experience and business goals.',
          designType: currentAnalysis.design_type || 'web'
        }
      });

      if (error) {
        console.error('AI analysis error:', error);
        throw new Error(error.message || 'AI analysis failed');
      }

      console.log('AI analysis completed:', data);

      if (data.success && data.annotations) {
        // Load the fresh annotations from the database
        const freshAnnotations = await getAnnotationsForAnalysis(currentAnalysis.id);
        setAnnotations(freshAnnotations);
        
        toast.success(`AI analysis complete! Found ${data.totalAnnotations} insights.`, {
          duration: 4000,
        });
      } else {
        throw new Error('Invalid response from AI analysis');
      }
      
    } catch (error) {
      console.error('Error during analysis:', error);
      
      // Update analysis status to failed
      await updateAnalysisStatus(currentAnalysis.id, 'failed');
      
      toast.error(`Analysis failed: ${error.message}`, {
        duration: 5000,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
    setImageUrl(null);
    setAnnotations([]);
    setActiveAnnotation(null);
    setCurrentAnalysis(null);
    setIsUploadInProgress(false);
  };

  const handleDeleteAnnotation = async (annotationId: string) => {
    const success = await deleteAnnotation(annotationId);
    if (success) {
      setAnnotations(prev => prev.filter(ann => ann.id !== annotationId));
      if (activeAnnotation === annotationId) {
        setActiveAnnotation(null);
      }
      toast.success('Annotation deleted');
    }
  };

  return {
    currentAnalysis,
    analyses,
    imageUrl,
    annotations,
    activeAnnotation,
    isAnalyzing,
    isLoadingAnalyses,
    isUploadInProgress,
    handleImageUpload,
    handleAreaClick,
    handleAnalyze,
    handleNewAnalysis,
    loadAnalysis,
    setActiveAnnotation,
    handleDeleteAnnotation,
  };
};
