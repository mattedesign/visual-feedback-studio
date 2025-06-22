
import { AnnotationData, ProcessedAnnotation } from './types.ts';

export function formatAnalysisResponse(annotations: AnnotationData[]): {
  success: boolean;
  annotations: ProcessedAnnotation[];
  totalAnnotations: number;
} {
  const processedAnnotations = annotations.map((ann, index) => ({
    id: `ai-${Date.now()}-${index}`,
    x: ann.x,
    y: ann.y,
    category: ann.category,
    severity: ann.severity,
    feedback: ann.feedback,
    implementationEffort: ann.implementationEffort,
    businessImpact: ann.businessImpact
  }));

  return {
    success: true,
    annotations: processedAnnotations,
    totalAnnotations: annotations.length
  };
}

export function formatErrorResponse(error: Error): {
  error: string;
  details: string;
} {
  return {
    error: 'Analysis failed',
    details: error.message
  };
}
