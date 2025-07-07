import { supabase } from '@/integrations/supabase/client';
import { KnowledgeEntry, SearchFilters, VectorSearchOptions } from '@/types/vectorDatabase';
import { TypeAdapter } from './typeAdapter';

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
      
      // Process and map database results to KnowledgeEntry type
      const processedData = await Promise.all((data || []).map(async (item) => {
        // 🔥 FIXED: Properly await the enhanced knowledge entry
        const enhancedEntry = await this.getEnhancedKnowledgeEntry(item.id);
        
        return {
          id: item.id,
          title: item.title,
          content: item.content,
          source: 'Database', // Default source for database entries
          category: item.category,
          tags: item.tags || [],
          metadata: item.metadata || {},
          created_at: item.created_at,
          updated_at: item.updated_at,
          similarity: item.similarity || 0,
          // Use enhanced entry fields if available, otherwise default values
          primary_category: enhancedEntry?.primary_category,
          secondary_category: enhancedEntry?.secondary_category,
          industry_tags: enhancedEntry?.industry_tags || [],
          complexity_level: enhancedEntry?.complexity_level,
          use_cases: enhancedEntry?.use_cases || [],
          related_patterns: enhancedEntry?.related_patterns || [],
          freshness_score: enhancedEntry?.freshness_score,
          application_context: enhancedEntry?.application_context
        };
      }));
      
      return processedData;

    } catch (error) {
      console.error('❌ Vector Search: Search failed:', error);
      return [];
    }
  }

  // Helper method to get enhanced knowledge entry with all database fields
  private async getEnhancedKnowledgeEntry(entryId: string): Promise<Partial<KnowledgeEntry> | null> {
    try {
      const { data, error } = await supabase
        .from('knowledge_entries')
        .select(`
          primary_category,
          secondary_category,
          industry_tags,
          complexity_level,
          use_cases,
          related_patterns,
          freshness_score,
          application_context
        `)
        .eq('id', entryId)
        .single();

      if (error) {
        console.warn('⚠️ Could not fetch enhanced entry data:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('⚠️ Failed to get enhanced entry data:', error);
      return null;
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
      
      // Map results to proper KnowledgeEntry format
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
      
      // Map results to proper KnowledgeEntry format
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
      
      // Map results to proper KnowledgeEntry format with similarity
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

  // Knowledge Export Methods
  async exportAllKnowledge(): Promise<KnowledgeEntry[]> {
    try {
      console.log('🔍 Vector Export: Exporting all knowledge entries...');
      
      const { data, error } = await supabase
        .from('knowledge_entries')
        .select(`
          id,
          title,
          content,
          source,
          category,
          primary_category,
          secondary_category,
          industry_tags,
          complexity_level,
          use_cases,
          related_patterns,
          freshness_score,
          application_context,
          tags,
          metadata,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Vector Export: Failed to export knowledge:', error);
        throw error;
      }

      console.log('✅ Vector Export: Successfully exported', data?.length || 0, 'entries');
      return data || [];
    } catch (error) {
      console.error('❌ Vector Export: Export failed:', error);
      throw error;
    }
  }

  async exportFilteredKnowledge(filters: {
    primary_category?: string;
    complexity_level?: string;
    industry_tags?: string[];
    source?: string;
  }): Promise<KnowledgeEntry[]> {
    try {
      console.log('🔍 Vector Export: Exporting filtered knowledge entries...', filters);
      
      let query = supabase
        .from('knowledge_entries')
        .select(`
          id,
          title,
          content,
          source,
          category,
          primary_category,
          secondary_category,
          industry_tags,
          complexity_level,
          use_cases,
          related_patterns,
          freshness_score,
          application_context,
          tags,
          metadata,
          created_at,
          updated_at
        `);

      if (filters.primary_category) {
        query = query.eq('primary_category', filters.primary_category);
      }
      
      if (filters.complexity_level) {
        query = query.eq('complexity_level', filters.complexity_level);
      }

      if (filters.source) {
        query = query.eq('source', filters.source);
      }

      if (filters.industry_tags && filters.industry_tags.length > 0) {
        query = query.overlaps('industry_tags', filters.industry_tags);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Vector Export: Failed to export filtered knowledge:', error);
        throw error;
      }

      console.log('✅ Vector Export: Successfully exported', data?.length || 0, 'filtered entries');
      return data || [];
    } catch (error) {
      console.error('❌ Vector Export: Filtered export failed:', error);
      throw error;
    }
  }

  async exportKnowledgeStats(): Promise<{
    totalEntries: number;
    categoryBreakdown: Array<{ category: string; count: number }>;
    complexityBreakdown: Array<{ level: string; count: number }>;
    sourceBreakdown: Array<{ source: string; count: number }>;
    exportedAt: string;
  }> {
    try {
      console.log('🔍 Vector Export: Exporting knowledge statistics...');
      
      const stats = await this.getKnowledgeStats();
      
      // Get source breakdown
      const { data: sourceData, error: sourceError } = await supabase
        .from('knowledge_entries')
        .select('source');

      if (sourceError) {
        console.warn('⚠️ Could not fetch source breakdown:', sourceError);
      }

      const sourceBreakdown = sourceData?.reduce((acc: any[], item: any) => {
        const source = item.source || 'Unknown';
        const existing = acc.find(s => s.source === source);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ source, count: 1 });
        }
        return acc;
      }, []) || [];

      return {
        ...stats,
        sourceBreakdown,
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Vector Export: Stats export failed:', error);
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
