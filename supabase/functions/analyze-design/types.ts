
export interface AnalysisRequest {
  imageUrl: string;
  analysisId: string;
  analysisPrompt?: string;
  designType?: string;
}

export interface AnnotationData {
  x: number;
  y: number;
  category: 'ux' | 'visual' | 'accessibility' | 'conversion' | 'brand';
  severity: 'critical' | 'suggested' | 'enhancement';
  feedback: string;
  implementationEffort: 'low' | 'medium' | 'high';
  businessImpact: 'low' | 'medium' | 'high';
}

export interface ProcessedAnnotation extends AnnotationData {
  id: string;
}
