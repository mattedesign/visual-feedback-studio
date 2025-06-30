
export interface BusinessImpactMetrics {
  impactScore: number; // 0-100
  revenueEstimate: {
    annual: number;
    confidence: number;
    assumptions: string[];
  };
  implementationTimeline: {
    quickWins: number; // weeks
    majorProjects: number; // weeks
    total: number; // weeks
  };
  competitivePosition: {
    score: number; // 1-10
    strengths: string[];
    gaps: string[];
  };
}

export interface QuickWin {
  id: string;
  title: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  category: string;
  priority: number;
}

export interface MajorProject {
  id: string;
  title: string;
  impact: 'high' | 'medium' | 'low';
  resourceRequirements: string[];
  timeline: string;
  roi: number;
  category: string;
}

export interface BusinessAnalysisData {
  annotations: Array<{
    id: string;
    severity: 'critical' | 'suggested' | 'enhancement';
    feedback: string;
    confidence?: number;
    category?: string;
    implementationEffort?: 'low' | 'medium' | 'high';
    businessImpact?: 'low' | 'medium' | 'high';
  }>;
  enhancedContext?: {
    knowledgeSourcesUsed: number;
    citations?: string[];
    researchContext?: string;
  };
  analysisContext?: string;
  createdAt?: string;
  siteName?: string;
}
