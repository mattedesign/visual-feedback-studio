
export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  source: string; // Fixed: made required to match RPC function return
  category: 'ux' | 'visual' | 'accessibility' | 'conversion' | 'brand' | 'ecommerce-patterns' | 'ux-research' | 'ux-patterns' | 'saas-patterns' | 'fintech-patterns';
  industry?: string;
  element_type?: string;
  metadata?: any;
  similarity?: number;
  created_at?: string;
  updated_at?: string;
  embedding?: string; // Database stores as string
  tags?: string[];
  freshness_score?: number;
}

export interface CompetitorPattern {
  id: string;
  pattern_name: string;
  description: string;
  industry?: string;
  pattern_type: 'layout' | 'navigation' | 'color' | 'typography' | 'interaction' | 'conversion' | 'form' | 'checkout';
  examples?: any;
  effectiveness_score?: number;
  embedding?: string; // Database stores as string
  created_at?: string;
  updated_at?: string;
  // Legacy fields - made required to match RPC function usage
  domain: string;
  design_elements: any;
  performance_metrics: any;
  analysis_date: string;
  screenshot_url?: string;
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
  category_filter?: string; // Added for RPC function compatibility
  industry?: string;
  industry_filter?: string; // Added for RPC function compatibility
  pattern_type?: string;
  pattern_type_filter?: string; // Added for RPC function compatibility
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
