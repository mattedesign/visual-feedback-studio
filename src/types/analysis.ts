
export interface Annotation {
  id: string;
  x: number;
  y: number;
  feedback: string;
  category: 'ux' | 'visual' | 'accessibility' | 'conversion' | 'brand';
  severity: 'critical' | 'suggested' | 'enhancement';
  implementationEffort: 'low' | 'medium' | 'high';
  businessImpact: 'low' | 'medium' | 'high';
}

export interface AnalysisContext {
  designType?: 'landing' | 'dashboard' | 'mobile' | 'ecommerce';
  businessGoals?: string[];
  targetAudience?: string;
}

export interface UploadOptions {
  type: 'image' | 'figma' | 'url';
  source: string;
  context?: AnalysisContext;
}
