
import React, { useEffect } from 'react';

interface DebugAnnotation {
  id: string;
  imageIndex?: number;
  feedback?: string;
  x?: number;
  y?: number;
  category?: string;
  severity?: string;
}

interface AnnotationCorrelationDebuggerProps {
  annotations: DebugAnnotation[];
  activeImageIndex: number;
  selectedImages: string[];
  activeImageUrl?: string;
  componentName: string;
  currentImageAnnotations?: DebugAnnotation[];
}

export const AnnotationCorrelationDebugger: React.FC<AnnotationCorrelationDebuggerProps> = ({
  annotations,
  activeImageIndex,
  selectedImages,
  activeImageUrl,
  componentName,
  currentImageAnnotations
}) => {
  useEffect(() => {
    console.log(`🔍 ANNOTATION CORRELATION DEBUG - ${componentName}:`, {
      timestamp: new Date().toISOString(),
      component: componentName,
      totalAnnotations: annotations?.length || 0,
      activeImageIndex,
      activeImageUrl,
      selectedImagesCount: selectedImages?.length || 0,
      currentImageAnnotationsCount: currentImageAnnotations?.length || 0,
      
      // CRITICAL: Check image index distribution
      imageIndexDistribution: annotations?.reduce((acc, ann) => {
        const index = ann.imageIndex ?? 0;
        acc[index] = (acc[index] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
      
      // CRITICAL: Sample annotations with their image indexes
      annotationSample: annotations?.slice(0, 5).map((a, i) => ({
        sampleIndex: i + 1,
        id: a.id,
        imageIndex: a.imageIndex,
        hasImageIndex: a.imageIndex !== undefined,
        feedback: a.feedback?.substring(0, 60) + '...',
        feedbackLength: a.feedback?.length || 0,
        coordinates: a.x !== undefined && a.y !== undefined ? { x: a.x, y: a.y } : 'missing',
        category: a.category,
        severity: a.severity
      })),
      
      // CRITICAL: Check for filtering issues
      filteringAnalysis: {
        annotationsWithValidImageIndex: annotations?.filter(a => a.imageIndex !== undefined).length || 0,
        annotationsForCurrentImage: annotations?.filter(a => (a.imageIndex ?? 0) === activeImageIndex).length || 0,
        annotationsWithoutImageIndex: annotations?.filter(a => a.imageIndex === undefined).length || 0,
        annotationsWithGenericFeedback: annotations?.filter(a => 
          a.feedback && (
            a.feedback.includes('Analysis insight') ||
            a.feedback.includes('Located at') ||
            a.feedback.length < 20
          )
        ).length || 0
      },
      
      // CRITICAL: Image correlation check
      imageCorrelation: selectedImages?.map((imageUrl, index) => ({
        imageIndex: index,
        imageUrl: imageUrl.substring(imageUrl.length - 30),
        annotationCount: annotations?.filter(a => (a.imageIndex ?? 0) === index).length || 0,
        isActiveImage: index === activeImageIndex,
        sampleAnnotation: annotations?.find(a => (a.imageIndex ?? 0) === index)
      })),
      
      // CRITICAL: Current image specific data
      currentImageData: {
        activeImageIndex,
        activeImageUrl: activeImageUrl?.substring((activeImageUrl?.length || 0) - 30),
        expectedAnnotations: annotations?.filter(a => (a.imageIndex ?? 0) === activeImageIndex).length || 0,
        actualFilteredAnnotations: currentImageAnnotations?.length || 0,
        mismatch: (annotations?.filter(a => (a.imageIndex ?? 0) === activeImageIndex).length || 0) !== (currentImageAnnotations?.length || 0)
      }
    });
    
    // ADDITIONAL: Log individual problematic annotations
    const problematicAnnotations = annotations?.filter(a => 
      !a.feedback || 
      a.feedback.length < 20 || 
      a.imageIndex === undefined ||
      a.x === undefined ||
      a.y === undefined
    );
    
    if (problematicAnnotations && problematicAnnotations.length > 0) {
      console.warn(`⚠️ PROBLEMATIC ANNOTATIONS FOUND - ${componentName}:`, {
        count: problematicAnnotations.length,
        issues: problematicAnnotations.map(a => ({
          id: a.id,
          missingFeedback: !a.feedback || a.feedback.length < 20,
          missingImageIndex: a.imageIndex === undefined,
          missingCoordinates: a.x === undefined || a.y === undefined,
          feedback: a.feedback?.substring(0, 40) + '...'
        }))
      });
    }
    
    // FINAL: Summary of correlation health
    console.log(`📊 CORRELATION HEALTH SUMMARY - ${componentName}:`, {
      healthScore: calculateHealthScore(annotations || []),
      criticalIssues: identifyCriticalIssues(annotations || [], activeImageIndex, currentImageAnnotations || []),
      recommendations: generateRecommendations(annotations || [], activeImageIndex)
    });
    
  }, [annotations, activeImageIndex, activeImageUrl, componentName, currentImageAnnotations]);

  return null; // This is a debug-only component
};

function calculateHealthScore(annotations: DebugAnnotation[]): number {
  if (!annotations || annotations.length === 0) return 0;
  
  let score = 0;
  const total = annotations.length;
  
  annotations.forEach(a => {
    if (a.imageIndex !== undefined) score += 25;
    if (a.feedback && a.feedback.length > 20) score += 25;
    if (a.x !== undefined && a.y !== undefined) score += 25;
    if (a.category && a.severity) score += 25;
  });
  
  return Math.round(score / total);
}

function identifyCriticalIssues(
  annotations: DebugAnnotation[], 
  activeImageIndex: number, 
  currentImageAnnotations: DebugAnnotation[]
): string[] {
  const issues: string[] = [];
  
  if (annotations.length === 0) {
    issues.push('NO_ANNOTATIONS');
  }
  
  const withoutImageIndex = annotations.filter(a => a.imageIndex === undefined).length;
  if (withoutImageIndex > 0) {
    issues.push(`MISSING_IMAGE_INDEX: ${withoutImageIndex} annotations`);
  }
  
  const expectedForCurrentImage = annotations.filter(a => (a.imageIndex ?? 0) === activeImageIndex).length;
  if (expectedForCurrentImage !== currentImageAnnotations.length) {
    issues.push(`FILTERING_MISMATCH: Expected ${expectedForCurrentImage}, got ${currentImageAnnotations.length}`);
  }
  
  const genericFeedback = annotations.filter(a => 
    !a.feedback || a.feedback.length < 20 || a.feedback.includes('Analysis insight')
  ).length;
  if (genericFeedback > 0) {
    issues.push(`GENERIC_FEEDBACK: ${genericFeedback} annotations`);
  }
  
  return issues;
}

function generateRecommendations(annotations: DebugAnnotation[], activeImageIndex: number): string[] {
  const recommendations: string[] = [];
  
  if (annotations.some(a => a.imageIndex === undefined)) {
    recommendations.push('Ensure all annotations have imageIndex property set');
  }
  
  if (annotations.some(a => !a.feedback || a.feedback.length < 20)) {
    recommendations.push('Review annotation feedback generation to ensure specific, actionable content');
  }
  
  if (annotations.some(a => a.x === undefined || a.y === undefined)) {
    recommendations.push('Validate coordinate assignment during annotation creation');
  }
  
  return recommendations;
}
