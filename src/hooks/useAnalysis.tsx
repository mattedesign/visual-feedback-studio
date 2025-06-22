
import { useState } from 'react';
import { Annotation } from '@/types/analysis';
import { toast } from 'sonner';

export const useAnalysis = () => {
  const [currentAnalysis, setCurrentAnalysis] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageUpload = async (uploadedImageUrl: string) => {
    setImageUrl(uploadedImageUrl);
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
    imageUrl,
    annotations,
    activeAnnotation,
    isAnalyzing,
    handleImageUpload,
    handleAreaClick,
    handleAnalyze,
    handleNewAnalysis,
    setActiveAnnotation,
  };
};
