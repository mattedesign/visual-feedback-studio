// Enhanced Input Structure for Claude UX Strategist

export interface VisionSummary {
  layoutDensity: 'low' | 'medium' | 'high';
  navigationPatterns: string[];
  ctaPositioning: string[];
  colorContrast: {
    score: number;
    issues: string[];
  };
  accessibilityFlags: string[];
  mobileOptimization: {
    touchTargets: number;
    responsiveScore: number;
    issues: string[];
  };
  designSystemConsistency: number; // 0-1 score
}

export interface RAGMatch {
  id: string;
  title: string;
  content: string;
  category: string;
  similarity: number;
  source: string;
  citations: string[];
  confidence: number;
  industryRelevance: number;
}

export interface BusinessContext {
  industry?: string;
  companySize?: 'startup' | 'small' | 'medium' | 'enterprise';
  targetAudience?: string;
  businessModel?: 'B2B' | 'B2C' | 'B2B2C' | 'marketplace';
  competitivePosition?: 'leader' | 'challenger' | 'follower' | 'niche';
  growthStage?: 'early' | 'growth' | 'mature' | 'declining';
}

export interface DesignPatternClassification {
  primaryPattern: string;
  secondaryPatterns: string[];
  antiPatterns: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  industryStandard: boolean;
}

export interface ClaudeStrategistInput {
  // Enhanced from basic userChallenge
  problemStatement: string;
  
  // NEW: Inferred user persona and context
  userPersona: string;
  businessGoals: string[];
  businessContext: BusinessContext;
  
  // Enhanced Google Vision analysis
  visionSummary: VisionSummary;
  
  // Structured RAG knowledge matches
  ragMatches: RAGMatch[];
  
  // Research citations and backing
  researchCitations: string[];
  
  // Restructured from basic annotations
  knownIssues: {
    critical: any[];
    important: any[];
    enhancements: any[];
  };
  
  // NEW: Industry and context intelligence
  industryContext: string;
  competitorPatterns: string[];
  
  // NEW: Design pattern analysis
  designPatternType: DesignPatternClassification;
  
  // Additional context
  imageContext?: any;
  userFeedback?: string;
  previousAnalyses?: string[];
}

export interface EnhancedStrategistOutput {
  // Core diagnosis and strategy
  diagnosis: string;
  strategicRationale: string;
  
  // Enhanced recommendations with research backing
  expertRecommendations: EnhancedRecommendation[];
  
  // Business impact quantification
  businessImpactAssessment: {
    roiProjection: {
      timeframe: string;
      estimatedValue: string;
      confidence: number;
    };
    implementationRoadmap: {
      quickWins: string[];
      weekOneActions: string[];
      strategicInitiatives: string[];
    };
    competitiveAdvantage: string;
  };
  
  // A/B testing framework
  abTestFramework: {
    primaryHypothesis: string;
    testVariants: string[];
    successCriteria: string[];
    estimatedTestDuration: string;
    expectedOutcome: string;
  };
  
  // Enhanced metrics and validation
  successMetrics: string[];
  validationFramework: {
    quantitativeMetrics: string[];
    qualitativeIndicators: string[];
    leadingIndicators: string[];
    laggingIndicators: string[];
  };
  
  // Multi-model confidence assessment
  confidenceAssessment: {
    overallConfidence: number;
    dataQualityScore: number;
    researchBacking: number;
    implementationFeasibility: number;
    businessAlignmentScore: number;
    reasoning: string;
  };
  
  // Research and citations
  researchSources: {
    academicSources: string[];
    industrySources: string[];
    competitorAnalysis: string[];
    uxPrinciples: string[];
  };
}

export interface EnhancedRecommendation {
  title: string;
  recommendation: string;
  
  // Enhanced confidence and impact
  confidence: number;
  expectedImpact: string;
  businessValue: {
    primary: string;
    secondary: string[];
    quantifiedImpact: string;
  };
  
  // Implementation details
  implementationEffort: 'Low' | 'Medium' | 'High';
  timeline: string;
  skillsRequired: string[];
  dependencies: string[];
  risks: string[];
  
  // Research backing
  reasoning: string;
  uxPrinciplesApplied: string[];
  researchEvidence: string[];
  source: string;
  citations: string[];
  
  // Validation approach
  validationMethod: string;
  successMetrics: string[];
  
  // Priority and sequencing
  priority: 1 | 2 | 3;
  category: 'critical-blocker' | 'conversion-optimization' | 'user-experience' | 'strategic-enhancement';
}