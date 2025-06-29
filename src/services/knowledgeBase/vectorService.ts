import { supabase } from '@/integrations/supabase/client';
import { KnowledgeEntry, SearchFilters } from '@/types/vectorDatabase';
import { TypeAdapter } from './typeAdapter';

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
      
      // Use the corrected database function parameters with proper field selection
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
      
      // Fix: Map database results to KnowledgeEntry type with proper field mapping
      const processedData = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        source: item.source || 'Database', // Add default source for database entries
        category: item.category,
        tags: item.tags || [],
        metadata: item.metadata || {},
        created_at: item.created_at,
        updated_at: item.updated_at,
        similarity: item.similarity || 0,
        // Map additional fields from knowledge_entries table
        primary_category: item.primary_category,
        secondary_category: item.secondary_category,
        industry_tags: item.industry_tags || [],
        complexity_level: item.complexity_level,
        use_cases: item.use_cases || [],
        related_patterns: item.related_patterns || [],
        freshness_score: item.freshness_score,
        application_context: item.application_context
      }));
      
      return processedData;

    } catch (error) {
      console.error('❌ Vector Search: Search failed:', error);
      return [];
    }
  }

  // Update searchKnowledge overload to accept SearchFilters
  async searchKnowledgeWithFilters(
    query: string,
    filters?: SearchFilters
  ): Promise<KnowledgeEntry[]> {
    const options = TypeAdapter.searchFiltersToVectorOptions(filters);
    return this.searchKnowledge(query, options);
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

  // Enhanced methods that were expected by the hook
  async searchByHierarchy(
    query: string,
    primaryCategory?: string,
    secondaryCategory?: string,
    industryTags?: string[],
    complexityLevel?: string
  ): Promise<KnowledgeEntry[]> {
    try {
      const filters: SearchFilters = {
        primary_category: primaryCategory,
        secondary_category: secondaryCategory,
        industry_tags: industryTags,
        complexity_level: complexityLevel
      };

      return await this.searchKnowledgeWithFilters(query, filters);
    } catch (error) {
      console.error('❌ Vector Search: Hierarchy search failed:', error);
      return [];
    }
  }

  async getKnowledgeStats() {
    try {
      const { data, error } = await supabase
        .from('knowledge_entries')
        .select('primary_category, complexity_level, industry_tags');

      if (error) throw error;

      const categoryBreakdown = data?.reduce((acc: any[], item: any) => {
        const category = item.primary_category || 'Unknown';
        const existing = acc.find(c => c.category === category);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ category, count: 1 });
        }
        return acc;
      }, []) || [];

      const complexityBreakdown = data?.reduce((acc: any[], item: any) => {
        const level = item.complexity_level || 'intermediate';
        const existing = acc.find(c => c.level === level);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ level, count: 1 });
        }
        return acc;
      }, []) || [];

      const industryTagsBreakdown: Array<{ tag: string; count: number }> = [];

      return {
        totalEntries: data?.length || 0,
        categoryBreakdown,
        complexityBreakdown,
        industryTagsBreakdown
      };
    } catch (error) {
      console.error('❌ Vector Search: Stats loading failed:', error);
      throw error;
    }
  }

  async addKnowledgeEntry(entry: Omit<KnowledgeEntry, 'id' | 'created_at' | 'updated_at'>): Promise<KnowledgeEntry> {
    try {
      const { data, error } = await supabase
        .from('knowledge_entries')
        .insert([entry])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Vector Search: Failed to add knowledge entry:', error);
      throw error;
    }
  }

  async addCompetitorPattern(pattern: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('competitor_patterns')
        .insert([pattern])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Vector Search: Failed to add competitor pattern:', error);
      throw error;
    }
  }

  async findRelatedPatterns(entryId: string, maxResults = 5): Promise<KnowledgeEntry[]> {
    try {
      const { data, error } = await supabase
        .from('knowledge_entries')
        .select('*')
        .neq('id', entryId)
        .limit(maxResults);

      if (error) throw error;
      
      // Fix: Map results to proper KnowledgeEntry format
      return (data || []).map(item => ({
        ...item,
        source: item.source || 'Database',
        similarity: 0.8 // Default similarity for related patterns
      }));
    } catch (error) {
      console.error('❌ Vector Search: Failed to find related patterns:', error);
      return [];
    }
  }

  async getIndustryPatterns(industry: string, limit = 10): Promise<KnowledgeEntry[]> {
    try {
      const { data, error } = await supabase
        .from('knowledge_entries')
        .select('*')
        .contains('industry_tags', [industry])
        .limit(limit);

      if (error) throw error;
      
      // Fix: Map results to proper KnowledgeEntry format
      return (data || []).map(item => ({
        ...item,
        source: item.source || 'Database',
        similarity: 0.85 // Default similarity for industry patterns
      }));
    } catch (error) {
      console.error('❌ Vector Search: Failed to get industry patterns:', error);
      return [];
    }
  }

  async searchByComplexity(
    query: string,
    userLevel: string,
    includeHigher = false
  ): Promise<Array<KnowledgeEntry & { similarity: number }>> {
    try {
      let complexityFilter = [userLevel];
      
      if (includeHigher) {
        const levels = ['beginner', 'intermediate', 'advanced'];
        const currentIndex = levels.indexOf(userLevel);
        if (currentIndex !== -1) {
          complexityFilter = levels.slice(currentIndex);
        }
      }

      const { data, error } = await supabase
        .from('knowledge_entries')
        .select('*')
        .in('complexity_level', complexityFilter);

      if (error) throw error;
      
      // Fix: Map results to proper KnowledgeEntry format with similarity
      return (data || []).map(item => ({
        ...item,
        source: item.source || 'Database',
        similarity: 0.8
      }));
    } catch (error) {
      console.error('❌ Vector Search: Complexity search failed:', error);
      return [];
    }
  }

  async getCategoryBreakdown() {
    try {
      const stats = await this.getKnowledgeStats();
      return stats.categoryBreakdown;
    } catch (error) {
      console.error('❌ Vector Search: Category breakdown failed:', error);
      throw error;
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
export const vectorKnowledgeService = vectorService;
