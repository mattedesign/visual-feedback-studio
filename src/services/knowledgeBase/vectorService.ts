
import { supabase } from '@/integrations/supabase/client';
import { 
  KnowledgeEntry, 
  CompetitorPattern, 
  SearchFilters 
} from '@/types/vectorDatabase';

class VectorKnowledgeService {
  private static instance: VectorKnowledgeService;

  private constructor() {}

  public static getInstance(): VectorKnowledgeService {
    if (!VectorKnowledgeService.instance) {
      VectorKnowledgeService.instance = new VectorKnowledgeService();
    }
    return VectorKnowledgeService.instance;
  }

  // Generate embeddings using the edge function for consistency
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      console.log('🔄 Generating embedding via edge function for:', text.substring(0, 50) + '...');
      
      const { data, error } = await supabase.functions.invoke('generate-embeddings', {
        body: { text }
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw new Error(`Embedding generation failed: ${error.message}`);
      }

      if (!data?.embedding || !Array.isArray(data.embedding)) {
        console.error('❌ Invalid embedding response:', data);
        throw new Error('Invalid embedding response from edge function');
      }

      console.log('✅ Embedding generated successfully:', {
        dimensions: data.embedding.length,
        textLength: text.length
      });

      return data.embedding;
    } catch (error) {
      console.error('❌ Error generating embedding:', error);
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  // Add a knowledge entry with proper embedding generation
  public async addKnowledgeEntry(
    entry: Omit<KnowledgeEntry, 'id' | 'created_at' | 'updated_at'>
  ): Promise<KnowledgeEntry> {
    try {
      console.log('📝 Adding knowledge entry:', entry.title);

      // Generate embedding for the content
      const embedding = await this.generateEmbedding(entry.content);

      // Convert embedding array to string format for database storage
      const embeddingString = `[${embedding.join(',')}]`;

      // Insert into database
      const { data, error } = await supabase
        .from('knowledge_entries')
        .insert({
          ...entry,
          embedding: embeddingString
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Database insertion error:', error);
        throw new Error(`Failed to insert knowledge entry: ${error.message}`);
      }

      console.log('✅ Knowledge entry added successfully:', data.id);
      return data as KnowledgeEntry;
    } catch (error) {
      console.error('❌ Error adding knowledge entry:', error);
      throw error;
    }
  }

  // Search knowledge entries using vector similarity
  public async searchKnowledge(
    query: string,
    filters?: SearchFilters
  ): Promise<Array<KnowledgeEntry & { similarity: number }>> {
    try {
      console.log('🔍 Searching knowledge with query:', query);
      
      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Use the RPC function for vector search
      const { data, error } = await supabase.rpc('match_knowledge', {
        query_embedding: queryEmbedding,
        match_threshold: filters?.match_threshold || 0.5, // LOWERED THRESHOLD
        match_count: filters?.match_count || 10,
        filter_category: filters?.category_filter || filters?.category || null
      });

      if (error) {
        console.error('❌ RPC search error:', error);
        throw new Error(`Knowledge search failed: ${error.message}`);
      }

      console.log('✅ Knowledge search completed:', {
        resultsCount: data?.length || 0,
        query: query.substring(0, 50) + '...'
      });

      // Map database results to KnowledgeEntry type
      const results = (data || []).map(item => ({
        ...item,
        source: item.source || '', // Provide default empty string
        category: item.category as KnowledgeEntry['category'], // Type assertion for category
      }));

      return results;
    } catch (error) {
      console.error('❌ Error searching knowledge:', error);
      throw error;
    }
  }

  // Add a competitor pattern
  public async addCompetitorPattern(
    pattern: Omit<CompetitorPattern, 'id' | 'created_at' | 'updated_at'>
  ): Promise<CompetitorPattern> {
    try {
      console.log('📝 Adding competitor pattern:', pattern.pattern_name);

      // Generate embedding for the description
      const embedding = await this.generateEmbedding(pattern.description);

      // Convert embedding array to string format for database storage
      const embeddingString = `[${embedding.join(',')}]`;

      // Insert into database
      const { data, error } = await supabase
        .from('competitor_patterns')
        .insert({
          ...pattern,
          embedding: embeddingString
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Database insertion error:', error);
        throw new Error(`Failed to insert competitor pattern: ${error.message}`);
      }

      console.log('✅ Competitor pattern added successfully:', data.id);
      return data as CompetitorPattern;
    } catch (error) {
      console.error('❌ Error adding competitor pattern:', error);
      throw error;
    }
  }

  // Search competitor patterns
  public async searchPatterns(
    query: string,
    filters?: SearchFilters
  ): Promise<Array<CompetitorPattern & { similarity: number }>> {
    try {
      console.log('🔍 Searching patterns with query:', query);
      
      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Use the RPC function for vector search
      const { data, error } = await supabase.rpc('match_patterns', {
        query_embedding: queryEmbedding,
        match_threshold: filters?.match_threshold || 0.5, // LOWERED THRESHOLD
        match_count: filters?.match_count || 10,
        filter_industry: filters?.industry_filter || filters?.industry || null,
        filter_pattern_type: filters?.pattern_type_filter || filters?.pattern_type || null
      });

      if (error) {
        console.error('❌ RPC search error:', error);
        throw new Error(`Pattern search failed: ${error.message}`);
      }

      console.log('✅ Pattern search completed:', {
        resultsCount: data?.length || 0,
        query: query.substring(0, 50) + '...'
      });

      // Map database results to CompetitorPattern type, providing defaults for missing fields
      const results = (data || []).map(item => ({
        ...item,
        // Provide defaults for legacy fields
        domain: item.domain || '',
        design_elements: item.design_elements || {},
        performance_metrics: item.performance_metrics || {},
        analysis_date: item.analysis_date || new Date().toISOString(),
      }));

      return results;
    } catch (error) {
      console.error('❌ Error searching patterns:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const vectorKnowledgeService = VectorKnowledgeService.getInstance();
