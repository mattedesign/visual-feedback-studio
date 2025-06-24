import { supabase } from '@/integrations/supabase/client';
import { 
  KnowledgeEntry, 
  CompetitorPattern, 
  RankedKnowledgeEntry,
  SimilaritySearchResult, 
  SearchFilters,
  EmbeddingResponse 
} from '@/types/vectorDatabase';

export class VectorKnowledgeService {
  private static instance: VectorKnowledgeService;
  private openaiApiKey: string | null = null;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): VectorKnowledgeService {
    if (!VectorKnowledgeService.instance) {
      VectorKnowledgeService.instance = new VectorKnowledgeService();
    }
    return VectorKnowledgeService.instance;
  }

  /**
   * Set OpenAI API key for embedding generation
   */
  public setOpenAIKey(apiKey: string): void {
    this.openaiApiKey = apiKey;
  }

  /**
   * Generate embeddings using OpenAI's text-embedding-ada-002 model
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured. Call setOpenAIKey() first.');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: text,
          model: 'text-embedding-ada-002',
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data: EmbeddingResponse = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  /**
   * Add a new knowledge entry to the vector database
   */
  public async addKnowledgeEntry(entry: Omit<KnowledgeEntry, 'id' | 'created_at' | 'updated_at'>): Promise<KnowledgeEntry> {
    try {
      // Generate embedding for the content
      const embedding = await this.generateEmbedding(`${entry.title} ${entry.content}`);

      const { data, error } = await supabase
        .from('knowledge_entries')
        .insert({
          title: entry.title,
          content: entry.content,
          category: entry.category,
          tags: entry.tags || [],
          embedding: `[${embedding.join(',')}]`,
          metadata: entry.metadata || {},
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding knowledge entry:', error);
        throw new Error(`Failed to add knowledge entry: ${error.message}`);
      }

      // Transform the database response to match our interface
      return {
        id: data.id,
        title: data.title,
        content: data.content,
        source: entry.source,
        category: data.category as KnowledgeEntry['category'],
        industry: entry.industry,
        element_type: entry.element_type,
        metadata: data.metadata,
        tags: data.tags,
        created_at: data.created_at,
        updated_at: data.updated_at,
        embedding: data.embedding
      };
    } catch (error) {
      console.error('Error in addKnowledgeEntry:', error);
      throw error;
    }
  }

  /**
   * Add a new competitor pattern to the vector database
   */
  public async addCompetitorPattern(pattern: Omit<CompetitorPattern, 'id' | 'created_at' | 'updated_at'>): Promise<CompetitorPattern> {
    try {
      // Generate embedding for the pattern description
      const embedding = await this.generateEmbedding(`${pattern.pattern_name || pattern.domain} ${pattern.description || ''}`);

      const { data, error } = await supabase
        .from('competitor_patterns')
        .insert({
          pattern_name: pattern.pattern_name || pattern.domain,
          description: pattern.description || '',
          industry: pattern.industry,
          pattern_type: pattern.pattern_type,
          embedding: `[${embedding.join(',')}]`,
          examples: pattern.examples || [],
          effectiveness_score: pattern.effectiveness_score || 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding competitor pattern:', error);
        throw new Error(`Failed to add competitor pattern: ${error.message}`);
      }

      // Transform the database response to match our interface
      return {
        id: data.id,
        domain: pattern.domain,
        industry: data.industry,
        pattern_type: data.pattern_type as CompetitorPattern['pattern_type'],
        design_elements: pattern.design_elements,
        performance_metrics: pattern.performance_metrics,
        screenshot_url: pattern.screenshot_url,
        analysis_date: pattern.analysis_date,
        pattern_name: data.pattern_name,
        description: data.description,
        effectiveness_score: Number(data.effectiveness_score),
        examples: data.examples,
        created_at: data.created_at,
        updated_at: data.updated_at,
        embedding: data.embedding
      };
    } catch (error) {
      console.error('Error in addCompetitorPattern:', error);
      throw error;
    }
  }

  /**
   * Search for similar knowledge entries using vector similarity
   */
  public async searchKnowledge(
    query: string, 
    filters: SearchFilters = {}
  ): Promise<Array<KnowledgeEntry & { similarity: number }>> {
    try {
      // Generate embedding for the search query
      const queryEmbedding = await this.generateEmbedding(query);

      const { data, error } = await supabase.rpc('match_knowledge', {
        query_embedding: `[${queryEmbedding.join(',')}]`,
        match_threshold: filters.match_threshold || 0.7,
        match_count: filters.match_count || 10,
        filter_category: filters.category || null,
      });

      if (error) {
        console.error('Error searching knowledge:', error);
        throw new Error(`Failed to search knowledge: ${error.message}`);
      }

      // Transform the database response to match our interface
      return (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        source: '', // Default source since it's not in the database
        category: item.category as KnowledgeEntry['category'],
        metadata: item.metadata,
        tags: item.tags,
        similarity: item.similarity,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (error) {
      console.error('Error in searchKnowledge:', error);
      throw error;
    }
  }

  /**
   * Search for similar competitor patterns using vector similarity
   */
  public async searchPatterns(
    query: string, 
    filters: SearchFilters = {}
  ): Promise<Array<CompetitorPattern & { similarity: number }>> {
    try {
      // Generate embedding for the search query
      const queryEmbedding = await this.generateEmbedding(query);

      const { data, error } = await supabase.rpc('match_patterns', {
        query_embedding: `[${queryEmbedding.join(',')}]`,
        match_threshold: filters.match_threshold || 0.7,
        match_count: filters.match_count || 10,
        filter_industry: filters.industry || null,
        filter_pattern_type: filters.pattern_type || null,
      });

      if (error) {
        console.error('Error searching patterns:', error);
        throw new Error(`Failed to search patterns: ${error.message}`);
      }

      // Transform the database response to match our interface
      return (data || []).map((item: any) => ({
        id: item.id,
        domain: '', // Default domain since it's not in the database
        industry: item.industry,
        pattern_type: item.pattern_type as CompetitorPattern['pattern_type'],
        design_elements: {},
        performance_metrics: {},
        analysis_date: item.created_at || new Date().toISOString(),
        pattern_name: item.pattern_name,
        description: item.description,
        effectiveness_score: Number(item.effectiveness_score),
        examples: item.examples,
        similarity: item.similarity,
        created_at: item.created_at,
        updated_at: item.updated_at,
        embedding: item.embedding
      }));
    } catch (error) {
      console.error('Error in searchPatterns:', error);
      throw error;
    }
  }

  /**
   * Get all knowledge entries (with optional filtering)
   */
  public async getAllKnowledgeEntries(filters: { category?: string } = {}): Promise<KnowledgeEntry[]> {
    try {
      let query = supabase.from('knowledge_entries').select('*');

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching knowledge entries:', error);
        throw new Error(`Failed to fetch knowledge entries: ${error.message}`);
      }

      // Transform the database response to match our interface
      return (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        source: '', // Default source since it's not in the database
        category: item.category as KnowledgeEntry['category'],
        metadata: item.metadata,
        tags: item.tags,
        created_at: item.created_at,
        updated_at: item.updated_at,
        embedding: item.embedding
      }));
    } catch (error) {
      console.error('Error in getAllKnowledgeEntries:', error);
      throw error;
    }
  }

  /**
   * Get all competitor patterns (with optional filtering)
   */
  public async getAllCompetitorPatterns(filters: { 
    industry?: string; 
    pattern_type?: string 
  } = {}): Promise<CompetitorPattern[]> {
    try {
      let query = supabase.from('competitor_patterns').select('*');

      if (filters.industry) {
        query = query.eq('industry', filters.industry);
      }
      
      if (filters.pattern_type) {
        query = query.eq('pattern_type', filters.pattern_type);
      }

      const { data, error } = await query.order('effectiveness_score', { ascending: false });

      if (error) {
        console.error('Error fetching competitor patterns:', error);
        throw new Error(`Failed to fetch competitor patterns: ${error.message}`);
      }

      // Transform the database response to match our interface
      return (data || []).map((item: any) => ({
        id: item.id,
        domain: '', // Default domain since it's not in the database
        industry: item.industry,
        pattern_type: item.pattern_type as CompetitorPattern['pattern_type'],
        design_elements: {},
        performance_metrics: {},
        analysis_date: item.created_at || new Date().toISOString(),
        pattern_name: item.pattern_name,
        description: item.description,
        effectiveness_score: Number(item.effectiveness_score),
        examples: item.examples,
        created_at: item.created_at,
        updated_at: item.updated_at,
        embedding: item.embedding
      }));
    } catch (error) {
      console.error('Error in getAllCompetitorPatterns:', error);
      throw error;
    }
  }

  /**
   * Update a knowledge entry
   */
  public async updateKnowledgeEntry(
    id: string, 
    updates: Partial<Omit<KnowledgeEntry, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<KnowledgeEntry> {
    try {
      const updateData: any = { ...updates };

      // If title or content is being updated, regenerate embedding
      if (updates.title || updates.content) {
        // Get current entry to build complete text for embedding
        const { data: currentEntry } = await supabase
          .from('knowledge_entries')
          .select('title, content')
          .eq('id', id)
          .single();

        if (currentEntry) {
          const newTitle = updates.title || currentEntry.title;
          const newContent = updates.content || currentEntry.content;
          const embedding = await this.generateEmbedding(`${newTitle} ${newContent}`);
          updateData.embedding = `[${embedding.join(',')}]`;
        }
      }

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('knowledge_entries')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating knowledge entry:', error);
        throw new Error(`Failed to update knowledge entry: ${error.message}`);
      }

      // Transform the database response to match our interface
      return {
        id: data.id,
        title: data.title,
        content: data.content,
        source: updates.source || '',
        category: data.category as KnowledgeEntry['category'],
        industry: updates.industry,
        element_type: updates.element_type,
        metadata: data.metadata,
        tags: data.tags,
        created_at: data.created_at,
        updated_at: data.updated_at,
        embedding: data.embedding
      };
    } catch (error) {
      console.error('Error in updateKnowledgeEntry:', error);
      throw error;
    }
  }

  /**
   * Delete a knowledge entry
   */
  public async deleteKnowledgeEntry(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('knowledge_entries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting knowledge entry:', error);
        throw new Error(`Failed to delete knowledge entry: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteKnowledgeEntry:', error);
      throw error;
    }
  }

  /**
   * Delete a competitor pattern
   */
  public async deleteCompetitorPattern(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('competitor_patterns')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting competitor pattern:', error);
        throw new Error(`Failed to delete competitor pattern: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteCompetitorPattern:', error);
      throw error;
    }
  }

  /**
   * Batch insert multiple knowledge entries
   */
  public async batchAddKnowledgeEntries(entries: Array<Omit<KnowledgeEntry, 'id' | 'created_at' | 'updated_at'>>): Promise<KnowledgeEntry[]> {
    try {
      const entriesWithEmbeddings = await Promise.all(
        entries.map(async (entry) => {
          const embedding = await this.generateEmbedding(`${entry.title} ${entry.content}`);
          return {
            title: entry.title,
            content: entry.content,
            category: entry.category,
            tags: entry.tags || [],
            metadata: entry.metadata || {},
            embedding: `[${embedding.join(',')}]`,
          };
        })
      );

      const { data, error } = await supabase
        .from('knowledge_entries')
        .insert(entriesWithEmbeddings)
        .select();

      if (error) {
        console.error('Error batch adding knowledge entries:', error);
        throw new Error(`Failed to batch add knowledge entries: ${error.message}`);
      }

      // Transform the database response to match our interface
      return (data || []).map((item: any, index: number) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        source: entries[index].source,
        category: item.category as KnowledgeEntry['category'],
        industry: entries[index].industry,
        element_type: entries[index].element_type,
        metadata: item.metadata,
        tags: item.tags,
        created_at: item.created_at,
        updated_at: item.updated_at,
        embedding: item.embedding
      }));
    } catch (error) {
      console.error('Error in batchAddKnowledgeEntries:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const vectorKnowledgeService = VectorKnowledgeService.getInstance();
