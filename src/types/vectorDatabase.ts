
export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: 'ux' | 'visual' | 'accessibility' | 'conversion' | 'brand';
  tags: string[];
  embedding?: number[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CompetitorPattern {
  id: string;
  pattern_name: string;
  description: string;
  industry?: string;
  pattern_type: 'layout' | 'navigation' | 'color' | 'typography' | 'interaction';
  embedding?: number[];
  examples: any[];
  effectiveness_score: number;
  created_at: string;
  updated_at: string;
}

export interface SimilaritySearchResult<T> extends T {
  similarity: number;
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
