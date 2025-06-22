
import { useCallback } from 'react';
import { toast } from 'sonner';
import { Annotation } from '@/types/analysis';
import { AnalysisWithFiles } from '@/services/analysisDataService';
import { saveAnnotation, deleteAnnotation } from '@/services/annotationsService';

interface UseAnnotationHandlersProps {
  currentAnalysis: AnalysisWithFiles | null;
  setAnnotations: (annotations: Annotation[] | ((prev: Annotation[]) => Annotation[])) => void;
  setActiveAnnotation: (id: string | null) => void;
  activeAnnotation: string | null;
}

export const useAnnotationHandlers = ({
  currentAnalysis,
  setAnnotations,
  setActiveAnnotation,
  activeAnnotation,
}: UseAnnotationHandlersProps) => {
  const handleAreaClick = useCallback(async (coordinates: { x: number; y: number }) => {
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
  }, [currentAnalysis, setAnnotations, setActiveAnnotation]);

  const handleDeleteAnnotation = useCallback(async (annotationId: string) => {
    const success = await deleteAnnotation(annotationId);
    if (success) {
      setAnnotations(prev => prev.filter(ann => ann.id !== annotationId));
      if (activeAnnotation === annotationId) {
        setActiveAnnotation(null);
      }
      toast.success('Annotation deleted');
    }
  }, [setAnnotations, activeAnnotation, setActiveAnnotation]);

  return {
    handleAreaClick,
    handleDeleteAnnotation,
  };
};
