
import { supabase } from '@/integrations/supabase/client';
import { KnowledgeEntry, SearchFilters } from '@/types/vectorDatabase';

export interface VectorSearchOptions {
  maxResults?: number;
  confidenceThreshold?: number;
  categories?: string[];
  industries?: string[];
}

class VectorService {
  private readonly DEFAULT_OPTIONS: Required<VectorSearchOptions> = {
    maxResults: 10,
    confidenceThreshold: 0.7,
    categories: [],
    industries: []
  };

  async searchKnowledge(
    query: string,
    options: VectorSearchOptions = {}
  ): Promise<KnowledgeEntry[]> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    console.log('🔍 Vector Search: Searching knowledge base', {
      query: query.substring(0, 50),
      options: opts
    });

    try {
      // Generate embedding for the query
      const embedding = await this.generateEmbedding(query);
      
      // Use the corrected database function parameters
      const { data, error } = await supabase.rpc('match_knowledge', {
        query_embedding: embedding,
        match_threshold: opts.confidenceThreshold,
        match_count: opts.maxResults,
        filter_category: opts.categories.length > 0 ? opts.categories[0] : null
      });

      if (error) {
        console.error('❌ Vector Search: Database error:', error);
        return [];
      }

      console.log('✅ Vector Search: Found knowledge entries:', data?.length || 0);
      return data || [];

    } catch (error) {
      console.error('❌ Vector Search: Search failed:', error);
      return [];
    }
  }

  async searchPatterns(
    query: string,
    options: VectorSearchOptions = {}
  ): Promise<any[]> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    try {
      const embedding = await this.generateEmbedding(query);
      
      const { data, error } = await supabase.rpc('match_patterns', {
        query_embedding: embedding,
        match_threshold: opts.confidenceThreshold,
        match_count: opts.maxResults,
        filter_industry: opts.industries.length > 0 ? opts.industries[0] : null,
        filter_pattern_type: null
      });

      if (error) {
        console.error('❌ Vector Search: Pattern search error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Vector Search: Pattern search failed:', error);
      return [];
    }
  }

  private async generateEmbedding(text: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-embeddings', {
        body: { input: text }
      });

      if (error) {
        throw new Error(`Embedding generation failed: ${error.message}`);
      }

      return data.embedding;
    } catch (error) {
      console.error('❌ Vector Search: Embedding generation failed:', error);
      // Return a dummy embedding for fallback
      return Array(1536).fill(0).toString();
    }
  }
}

export const vectorService = new VectorService();
