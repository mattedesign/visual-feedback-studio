
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

// Enhanced response formatter that supports RAG fields
export const responseFormatter = {
  formatSuccessResponse: (data: {
    annotations: AnnotationData[];
    totalAnnotations: number;
    modelUsed?: string;
    processingTime?: number;
    ragEnhanced?: boolean;
    knowledgeSourcesUsed?: number;
    researchCitations?: string[];
  }) => {
    const processedAnnotations = data.annotations.map((ann, index) => ({
      id: `ai-${Date.now()}-${index}`,
      x: ann.x,
      y: ann.y,
      category: ann.category,
      severity: ann.severity,
      feedback: ann.feedback,
      implementationEffort: ann.implementationEffort,
      businessImpact: ann.businessImpact,
      imageIndex: ann.imageIndex
    }));

    const responseBody = {
      success: true,
      annotations: processedAnnotations,
      totalAnnotations: data.totalAnnotations,
      modelUsed: data.modelUsed,
      processingTime: data.processingTime,
      ragEnhanced: data.ragEnhanced || false,
      knowledgeSourcesUsed: data.knowledgeSourcesUsed || 0,
      researchCitations: data.researchCitations || []
    };

    return {
      body: JSON.stringify(responseBody),
      status: 200
    };
  },

  formatErrorResponse: (error: Error) => {
    return {
      body: JSON.stringify(formatErrorResponse(error)),
      status: 500
    };
  }
};
