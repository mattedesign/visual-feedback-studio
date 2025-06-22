
import { useState, useEffect } from 'react';
import { Annotation } from '@/types/analysis';
import { toast } from 'sonner';
import { getUserAnalyses, getMostRecentAnalysis, getAnalysisById, getFileUrl, AnalysisWithFiles } from '@/services/analysisDataService';

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
    
    // Set the most recent analysis as current
    if (userAnalyses.length > 0) {
      setCurrentAnalysis(userAnalyses[0]);
    }
    
    toast.success('Design uploaded successfully!');
  };

  const handleAreaClick = (coordinates: { x: number; y: number }) => {
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      x: coordinates.x,
      y: coordinates.y,
      category: 'ux',
      severity: 'suggested',
      feedback: `Clicked area at ${coordinates.x.toFixed(1)}%, ${coordinates.y.toFixed(1)}%. Consider improving the user experience in this section.`,
      implementationEffort: 'medium',
      businessImpact: 'high'
    };

    setAnnotations(prev => [...prev, newAnnotation]);
    setActiveAnnotation(newAnnotation.id);
  };

  const handleAnalyze = async () => {
    if (!imageUrl) return;

    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const sampleAnnotations: Annotation[] = [
        {
          id: '1',
          x: 25,
          y: 30,
          category: 'ux',
          severity: 'critical',
          feedback: 'The call-to-action button is too small and lacks sufficient contrast. Consider increasing size by 50% and using a more prominent color.',
          implementationEffort: 'low',
          businessImpact: 'high'
        },
        {
          id: '2',
          x: 70,
          y: 45,
          category: 'accessibility',
          severity: 'suggested',
          feedback: 'Text hierarchy could be improved. The heading appears to lack proper semantic structure for screen readers.',
          implementationEffort: 'medium',
          businessImpact: 'medium'
        },
        {
          id: '3',
          x: 50,
          y: 70,
          category: 'visual',
          severity: 'enhancement',
          feedback: 'The spacing between elements feels cramped. Consider adding more whitespace to improve visual breathing room.',
          implementationEffort: 'low',
          businessImpact: 'medium'
        }
      ];

      setAnnotations(sampleAnnotations);
      setIsAnalyzing(false);
      toast.success('Analysis complete!');
    }, 3000);
  };

  const handleNewAnalysis = () => {
    setImageUrl(null);
    setAnnotations([]);
    setActiveAnnotation(null);
    setCurrentAnalysis(null);
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
  };
};
