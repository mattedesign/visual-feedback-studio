
// New types that don't modify existing interfaces
export interface WellDoneInsight {
  title: string;
  description: string;
  category: 'visual' | 'ux' | 'accessibility' | 'conversion' | 'mobile' | 'overall';
  imageIndex?: number;
}

export interface WellDoneData {
  insights: WellDoneInsight[];
  overallStrengths: string[];
  categoryHighlights: Record<string, string>;
}

export interface RAGContext {
  retrievedKnowledge: {
    relevantPatterns: Array<{
      id: string;
      title: string;
      content: string;
      category: string;
      source: string;
    }>;
    competitorInsights: any[];
  };
  enhancedPrompt: string;
  researchCitations: string[];
  industryContext: string;
  buildTimestamp?: string;
  searchQueries?: string[];
}

export interface AnalysisRequest {
  imageUrl?: string; // Keep for backward compatibility
  imageUrls?: string[]; // New field for multiple images
  analysisId: string;
  analysisPrompt?: string;
  designType?: string;
  isComparative?: boolean;
  aiProvider?: 'openai' | 'claude'; // New field for provider selection
  model?: string;
  testMode?: boolean;
  // RAG fields:
  ragEnabled?: boolean;
  ragContext?: RAGContext;
  researchCitations?: string[];
}

export interface EnhancedAnalysisResponse {
  success: boolean;
  annotations: AnnotationData[];
  totalAnnotations: number;
  providerUsed?: string;
  modelUsed?: string;
  testMode?: boolean;
  // RAG response fields:
  researchEnhanced?: boolean;
  knowledgeSourcesUsed?: number;
  researchCitations?: string[];
  industryContext?: string;
  // New well-done data fields:
  wellDoneData?: WellDoneData;
}

export interface Annotation {
  id: string;
  x: number;
  y: number;
  category: 'ux' | 'visual' | 'accessibility' | 'conversion' | 'brand';
  severity: 'critical' | 'suggested' | 'enhancement';
  feedback: string;
  implementationEffort: 'low' | 'medium' | 'high';
  businessImpact: 'low' | 'medium' | 'high';
  imageIndex?: number; // To identify which image this annotation belongs to
}

export interface AnnotationData {
  x: number;
  y: number;
  category: 'ux' | 'visual' | 'accessibility' | 'conversion' | 'brand';
  severity: 'critical' | 'suggested' | 'enhancement';
  feedback: string;
  implementationEffort: 'low' | 'medium' | 'high';
  businessImpact: 'low' | 'medium' | 'high';
  imageIndex?: number;
}

export interface ProcessedAnnotation {
  id: string;
  x: number;
  y: number;
  category: 'ux' | 'visual' | 'accessibility' | 'conversion' | 'brand';
  severity: 'critical' | 'suggested' | 'enhancement';
  feedback: string;
  implementationEffort: 'low' | 'medium' | 'high';
  businessImpact: 'low' | 'medium' | 'high';
}
