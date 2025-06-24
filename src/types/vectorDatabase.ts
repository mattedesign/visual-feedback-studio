
export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  source: string;
  category: 'ux' | 'visual' | 'accessibility' | 'conversion' | 'brand' | 'ecommerce-patterns' | 'ux-research' | 'ux-patterns' | 'saas-patterns' | 'fintech-patterns';
  industry?: string;
  element_type?: string;
  metadata?: any;
  similarity?: number;
  created_at?: string;
  updated_at?: string;
  embedding?: string;
  tags?: string[];
}

export interface CompetitorPattern {
  id: string;
  domain: string;
  industry: string;
  pattern_type: 'layout' | 'navigation' | 'color' | 'typography' | 'interaction' | 'conversion' | 'form' | 'checkout';
  design_elements: any;
  performance_metrics: any;
  screenshot_url?: string;
  analysis_date: string;
  embedding?: string;
  created_at?: string;
  updated_at?: string;
  pattern_name?: string;
  description?: string;
  effectiveness_score?: number;
  examples?: any;
}

export interface RankedKnowledgeEntry extends KnowledgeEntry {
  relevanceScore: number;
  freshnessScore: number;
  authorityScore: number;
  overallScore: number;
}

export interface SimilaritySearchResult<T> {
  data: T & { similarity: number };
}

export interface SearchFilters {
  category?: string;
  industry?: string;
  pattern_type?: string;
  match_threshold?: number;
  match_count?: number;
}

export interface EmbeddingResponse {
  data: Array<{
    object: string;
    embedding: number[];
    index: number;
  }>;
  model: string;
  object: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}
