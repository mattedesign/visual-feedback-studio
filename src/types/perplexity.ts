export interface PerplexityResearchRequest {
  query: string;
  context?: string;
  domain?: string;
  recencyFilter?: 'day' | 'week' | 'month' | 'year';
  maxSources?: number;
}

export interface PerplexityResearchResponse {
  success: boolean;
  content?: string;
  sources?: PerplexitySource[];
  relatedQuestions?: string[];
  error?: string;
}

export interface PerplexitySource {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
  domain?: string;
}

export interface PerplexityCompetitiveAnalysis {
  competitors: CompetitorInsight[];
  industryTrends: TrendInsight[];
  benchmarks: BenchmarkData[];
  recommendations: string[];
}

export interface CompetitorInsight {
  name: string;
  strengths: string[];
  weaknesses: string[];
  marketPosition: string;
  sources: PerplexitySource[];
}

export interface TrendInsight {
  trend: string;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  description: string;
  sources: PerplexitySource[];
}

export interface BenchmarkData {
  metric: string;
  value: string;
  industry: string;
  source: PerplexitySource;
}

export interface PerplexityValidationResult {
  isValid: boolean;
  confidence: number;
  sources: PerplexitySource[];
  contradictions?: string[];
  supportingEvidence: string[];
  lastValidated: string;
}

export interface PerplexityEnhancedAnnotation {
  originalAnnotation: any;
  perplexityValidation?: PerplexityValidationResult;
  competitiveContext?: CompetitorInsight[];
  trendAlignment?: TrendInsight[];
  industryBenchmarks?: BenchmarkData[];
}