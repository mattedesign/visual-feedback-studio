
import { useState, useEffect } from 'react';
import { Annotation } from '@/types/analysis';
import { toast } from 'sonner';
import { 
  getUserAnalyses, 
  getMostRecentAnalysis, 
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

export const useAnalysis = () => {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisWithFiles | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisWithFiles[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(true);

  // Load user analyses on mount
  useEffect(() => {
    const loadAnalyses = async () => {
      setIsLoadingAnalyses(true);
      try {
        const userAnalyses = await getUserAnalyses();
        setAnalyses(userAnalyses);
        
        // Auto-load most recent analysis if available
        const recentAnalysis = userAnalyses.length > 0 ? userAnalyses[0] : null;
        if (recentAnalysis && recentAnalysis.files.length > 0) {
          await loadAnalysis(recentAnalysis.id);
        }
      } catch (error) {
        console.error('Error loading analyses:', error);
      } finally {
        setIsLoadingAnalyses(false);
      }
    };

    loadAnalyses();
  }, []);

  const loadAnalysis = async (analysisId: string) => {
    try {
      const analysis = await getAnalysisById(analysisId);
      if (analysis && analysis.files.length > 0) {
        setCurrentAnalysis(analysis);
        
        // Get the first file URL
        const firstFile = analysis.files[0];
        const fileUrl = getFileUrl(firstFile);
        
        if (fileUrl) {
          setImageUrl(fileUrl);
          
          // Load existing annotations for this analysis
          const existingAnnotations = await getAnnotationsForAnalysis(analysisId);
          setAnnotations(existingAnnotations);
          
          toast.success(`Loaded analysis: ${analysis.title}`);
        } else {
          toast.error('No valid file URL found for this analysis');
        }
      } else {
        toast.error('Analysis not found or has no files');
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
      toast.error('Failed to load analysis');
    }
  };

  const handleImageUpload = async (uploadedImageUrl: string) => {
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
    }
    
    toast.success('Design uploaded successfully!');
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
      // Update analysis status to indicate it's being processed
      await updateAnalysisStatus(currentAnalysis.id, 'analyzing');
      
      // Update analysis context with basic info
      await updateAnalysisContext(currentAnalysis.id, {
        analysis_prompt: 'AI-powered design analysis focusing on UX, accessibility, and conversion optimization',
        ai_model_used: 'gpt-4o-mini'
      });
      
      // Simulate AI analysis (replace with real AI call later)
      setTimeout(async () => {
        const sampleAnnotations: Omit<Annotation, 'id'>[] = [
          {
            x: 25,
            y: 30,
            category: 'ux',
            severity: 'critical',
            feedback: 'The call-to-action button is too small and lacks sufficient contrast. Consider increasing size by 50% and using a more prominent color.',
            implementationEffort: 'low',
            businessImpact: 'high'
          },
          {
            x: 70,
            y: 45,
            category: 'accessibility',
            severity: 'suggested',
            feedback: 'Text hierarchy could be improved. The heading appears to lack proper semantic structure for screen readers.',
            implementationEffort: 'medium',
            businessImpact: 'medium'
          },
          {
            x: 50,
            y: 70,
            category: 'visual',
            severity: 'enhancement',
            feedback: 'The spacing between elements feels cramped. Consider adding more whitespace to improve visual breathing room.',
            implementationEffort: 'low',
            businessImpact: 'medium'
          }
        ];

        // Save all annotations to database
        const savedAnnotations: Annotation[] = [];
        for (const annotationData of sampleAnnotations) {
          const saved = await saveAnnotation(annotationData, currentAnalysis.id);
          if (saved) {
            savedAnnotations.push(saved);
          }
        }

        setAnnotations(prev => [...prev, ...savedAnnotations]);
        
        // Update analysis status to completed
        await updateAnalysisStatus(currentAnalysis.id, 'completed', new Date().toISOString());
        
        setIsAnalyzing(false);
        toast.success('Analysis complete!');
      }, 3000);
    } catch (error) {
      console.error('Error during analysis:', error);
      setIsAnalyzing(false);
      toast.error('Analysis failed');
    }
  };

  const handleNewAnalysis = () => {
    setImageUrl(null);
    setAnnotations([]);
    setActiveAnnotation(null);
    setCurrentAnalysis(null);
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
    handleImageUpload,
    handleAreaClick,
    handleAnalyze,
    handleNewAnalysis,
    loadAnalysis,
    setActiveAnnotation,
    handleDeleteAnnotation,
  };
};
