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
  
  // 🎯 STEP 6: ENHANCED ANNOTATION CREATION WITH IMAGE CORRELATION
  const handleAreaClick = useCallback(async (
    coordinates: { x: number; y: number }, 
    imageUrl?: string, 
    imageIndex?: number
  ) => {
    if (!currentAnalysis) {
      toast.error('No analysis selected');
      return;
    }

    // 🎯 ENHANCED: Determine which image this annotation belongs to
    const targetImageIndex = imageIndex ?? 0;
    
    // 🎯 ENHANCED: Validate coordinates are within bounds
    const safeX = Math.max(0, Math.min(100, coordinates.x));
    const safeY = Math.max(0, Math.min(100, coordinates.y));
    
    // 🎯 ENHANCED: Generate context-aware feedback based on position
    const generateContextualFeedback = (x: number, y: number, imageIndex: number) => {
      let locationContext = '';
      
      // Determine location context based on coordinates
      if (y <= 15) {
        locationContext = 'header area';
      } else if (y <= 25) {
        locationContext = 'navigation section';
      } else if (y >= 80) {
        locationContext = 'footer region';
      } else if (x <= 25) {
        locationContext = 'left sidebar area';
      } else if (x >= 75) {
        locationContext = 'right sidebar area';
      } else {
        locationContext = 'main content area';
      }
      
      const imageText = targetImageIndex > 0 ? ` on image ${targetImageIndex + 1}` : '';
      
      return `User annotation in the ${locationContext}${imageText} at ${safeX.toFixed(1)}%, ${safeY.toFixed(1)}%. Consider reviewing the user experience and design elements in this section for potential improvements.`;
    };

    // 🎯 ENHANCED: Create annotation with proper image correlation (removed imageUrl since it's not in type)
    const newAnnotationData: Omit<Annotation, 'id'> = {
      x: safeX,
      y: safeY,
      category: 'ux',
      severity: 'suggested',
      feedback: generateContextualFeedback(safeX, safeY, targetImageIndex),
      implementationEffort: 'medium',
      businessImpact: 'medium',
      imageIndex: targetImageIndex // 🆕 NEW: Proper image correlation
    };

    console.log('🎯 Enhanced Annotation Creation:', {
      coordinates: { x: safeX, y: safeY },
      targetImageIndex,
      imageUrl,
      annotationData: newAnnotationData
    });

    try {
      const savedAnnotation = await saveAnnotation(newAnnotationData, currentAnalysis.id);
      if (savedAnnotation) {
        setAnnotations(prev => [...prev, savedAnnotation]);
        setActiveAnnotation(savedAnnotation.id);
        toast.success(`Annotation added to image ${targetImageIndex + 1}`);
        
        console.log('✅ Annotation successfully created:', {
          id: savedAnnotation.id,
          imageIndex: savedAnnotation.imageIndex,
          coordinates: { x: savedAnnotation.x, y: savedAnnotation.y }
        });
      }
    } catch (error) {
      console.error('❌ Failed to save annotation:', error);
      toast.error('Failed to save annotation');
    }
  }, [currentAnalysis, setAnnotations, setActiveAnnotation]);

  // 🎯 ENHANCED: Delete annotation with better error handling
  const handleDeleteAnnotation = useCallback(async (annotationId: string) => {
    console.log('🗑️ Deleting annotation:', { annotationId });
    
    try {
      const success = await deleteAnnotation(annotationId);
      if (success) {
        setAnnotations(prev => prev.filter(ann => ann.id !== annotationId));
        if (activeAnnotation === annotationId) {
          setActiveAnnotation(null);
        }
        toast.success('Annotation deleted');
        
        console.log('✅ Annotation successfully deleted:', { annotationId });
      } else {
        throw new Error('Delete operation returned false');
      }
    } catch (error) {
      console.error('❌ Failed to delete annotation:', error);
      toast.error('Failed to delete annotation');
    }
  }, [setAnnotations, activeAnnotation, setActiveAnnotation]);

  // 🆕 NEW: Enhanced annotation update handler
  const handleUpdateAnnotation = useCallback(async (
    annotationId: string, 
    updates: Partial<Annotation>
  ) => {
    console.log('📝 Updating annotation:', { annotationId, updates });
    
    try {
      // Update locally (since we don't have an update service)
      setAnnotations(prev => prev.map(ann => 
        ann.id === annotationId 
          ? { ...ann, ...updates }
          : ann
      ));
      
      toast.success('Annotation updated');
      
      console.log('✅ Annotation successfully updated:', { annotationId, updates });
    } catch (error) {
      console.error('❌ Failed to update annotation:', error);
      toast.error('Failed to update annotation');
    }
  }, [setAnnotations]);

  // 🆕 NEW: Move annotation to different image
  const handleMoveAnnotationToImage = useCallback(async (
    annotationId: string,
    newImageIndex: number
  ) => {
    console.log('🔄 Moving annotation to different image:', {
      annotationId,
      newImageIndex
    });
    
    try {
      const updates = {
        imageIndex: newImageIndex
      };
      
      await handleUpdateAnnotation(annotationId, updates);
      toast.success(`Annotation moved to image ${newImageIndex + 1}`);
      
      console.log('✅ Annotation successfully moved:', {
        annotationId,
        newImageIndex
      });
    } catch (error) {
      console.error('❌ Failed to move annotation:', error);
      toast.error('Failed to move annotation');
    }
  }, [handleUpdateAnnotation]);

  // 🆕 NEW: Bulk operations for annotations
  const handleBulkDeleteAnnotations = useCallback(async (annotationIds: string[]) => {
    console.log('🗑️ Bulk deleting annotations:', { annotationIds });
    
    try {
      const deletePromises = annotationIds.map(id => deleteAnnotation(id));
      const results = await Promise.allSettled(deletePromises);
      
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failCount = results.filter(r => r.status === 'rejected').length;
      
      if (successCount > 0) {
        setAnnotations(prev => prev.filter(ann => !annotationIds.includes(ann.id)));
        
        // Clear active annotation if it was deleted
        if (activeAnnotation && annotationIds.includes(activeAnnotation)) {
          setActiveAnnotation(null);
        }
      }
      
      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} annotation(s)`);
      } else {
        toast.success(`Deleted ${successCount} annotation(s)`);
      }
      
      console.log('✅ Bulk delete completed:', { successCount, failCount });
    } catch (error) {
      console.error('❌ Failed to bulk delete annotations:', error);
      toast.error('Failed to delete annotations');
    }
  }, [setAnnotations, activeAnnotation, setActiveAnnotation]);

  // 🆕 NEW: Validate annotation coordinates
  const validateAnnotationCoordinates = useCallback((x: number, y: number) => {
    const isValid = 
      typeof x === 'number' && 
      typeof y === 'number' && 
      !isNaN(x) && 
      !isNaN(y) && 
      x >= 0 && 
      x <= 100 && 
      y >= 0 && 
      y <= 100;
    
    return {
      isValid,
      safeX: Math.max(0, Math.min(100, x || 50)),
      safeY: Math.max(0, Math.min(100, y || 50))
    };
  }, []);

  return {
    // Enhanced core handlers
    handleAreaClick,
    handleDeleteAnnotation,
    
    // New enhanced handlers
    handleUpdateAnnotation,
    handleMoveAnnotationToImage,
    handleBulkDeleteAnnotations,
    
    // Utility functions
    validateAnnotationCoordinates,
  };
};