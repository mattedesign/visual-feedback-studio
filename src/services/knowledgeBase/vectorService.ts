
import { supabase } from '@/integrations/supabase/client';
import { KnowledgeEntry, CompetitorPattern, SearchFilters } from '@/types/vectorDatabase';

const OPENAI_API_URL = 'https://api.openai.com/v1/embeddings';

class VectorKnowledgeService {
  private async generateEmbedding(text: string): Promise<number[]> {
    const { data: { OPENAI_API_KEY } } = await supabase.functions.invoke('get-env-var', {
      body: { key: 'OPENAI_API_KEY' }
    });

    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small',
        dimensions: 1536
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  async searchKnowledge(
    query: string, 
    filters?: SearchFilters
  ): Promise<Array<KnowledgeEntry & { similarity: number }>> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Use the enhanced match_knowledge function with new filters
      const { data, error } = await supabase.rpc('match_knowledge', {
        query_embedding: `[${queryEmbedding.join(',')}]`,
        match_threshold: filters?.match_threshold || 0.7,
        match_count: filters?.match_count || 10,
        filter_category: filters?.category || null,
        filter_primary_category: filters?.primary_category || null,
        filter_secondary_category: filters?.secondary_category || null,
        filter_industry_tags: filters?.industry_tags || null,
        filter_complexity_level: filters?.complexity_level || null
      });

      if (error) {
        console.error('Error searching knowledge:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchKnowledge:', error);
      throw error;
    }
  }

  async searchPatterns(
    query: string, 
    filters?: SearchFilters
  ): Promise<Array<CompetitorPattern & { similarity: number }>> {
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      
      const { data, error } = await supabase.rpc('match_patterns', {
        query_embedding: `[${queryEmbedding.join(',')}]`,
        match_threshold: filters?.match_threshold || 0.7,
        match_count: filters?.match_count || 10,
        filter_industry: filters?.industry || null,
        filter_pattern_type: filters?.pattern_type || null
      });

      if (error) {
        console.error('Error searching patterns:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchPatterns:', error);
      throw error;
    }
  }

  async addKnowledgeEntry(entry: Omit<KnowledgeEntry, 'id' | 'created_at' | 'updated_at'>): Promise<KnowledgeEntry> {
    try {
      // Generate embedding for the content
      const contentText = `${entry.title} ${entry.content}`;
      const embedding = await this.generateEmbedding(contentText);
      
      const { data, error } = await supabase
        .from('knowledge_entries')
        .insert([{
          ...entry,
          embedding: `[${embedding.join(',')}]`
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding knowledge entry:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in addKnowledgeEntry:', error);
      throw error;
    }
  }

  async addCompetitorPattern(pattern: Omit<CompetitorPattern, 'id' | 'created_at' | 'updated_at'>): Promise<CompetitorPattern> {
    try {
      const contentText = `${pattern.pattern_name} ${pattern.description}`;
      const embedding = await this.generateEmbedding(contentText);
      
      const { data, error } = await supabase
        .from('competitor_patterns')
        .insert([{
          ...pattern,
          embedding: `[${embedding.join(',')}]`
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding competitor pattern:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in addCompetitorPattern:', error);
      throw error;
    }
  }

  // New method to search by hierarchical categories
  async searchByHierarchy(
    primaryCategory: string,
    secondaryCategory?: string,
    industryTags?: string[],
    complexityLevel?: 'basic' | 'intermediate' | 'advanced'
  ): Promise<KnowledgeEntry[]> {
    try {
      let query = supabase
        .from('knowledge_entries')
        .select('*')
        .eq('primary_category', primaryCategory);

      if (secondaryCategory) {
        query = query.eq('secondary_category', secondaryCategory);
      }

      if (industryTags && industryTags.length > 0) {
        query = query.overlaps('industry_tags', industryTags);
      }

      if (complexityLevel) {
        query = query.eq('complexity_level', complexityLevel);
      }

      const { data, error } = await query.order('freshness_score', { ascending: false });

      if (error) {
        console.error('Error searching by hierarchy:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchByHierarchy:', error);
      throw error;
    }
  }

  // New method to get knowledge statistics
  async getKnowledgeStats(): Promise<{
    totalEntries: number;
    categoryBreakdown: Array<{ category: string; count: number }>;
    complexityBreakdown: Array<{ level: string; count: number }>;
    industryTagsBreakdown: Array<{ tag: string; count: number }>;
  }> {
    try {
      // Get total count
      const { count: totalEntries } = await supabase
        .from('knowledge_entries')
        .select('*', { count: 'exact', head: true });

      // Get category breakdown
      const { data: categoryData } = await supabase
        .from('knowledge_entries')
        .select('primary_category');

      // Get complexity breakdown
      const { data: complexityData } = await supabase
        .from('knowledge_entries')
        .select('complexity_level');

      // Get industry tags breakdown
      const { data: industryData } = await supabase
        .from('knowledge_entries')
        .select('industry_tags');

      // Process category breakdown
      const categoryBreakdown = this.processBreakdown(categoryData, 'primary_category');
      const complexityBreakdown = this.processBreakdown(complexityData, 'complexity_level');
      
      // Process industry tags (flatten arrays)
      const allTags = industryData?.flatMap(item => item.industry_tags || []) || [];
      const tagCounts: { [key: string]: number } = {};
      allTags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
      const industryTagsBreakdown = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);

      return {
        totalEntries: totalEntries || 0,
        categoryBreakdown,
        complexityBreakdown,
        industryTagsBreakdown
      };
    } catch (error) {
      console.error('Error getting knowledge stats:', error);
      throw error;
    }
  }

  private processBreakdown(data: any[], field: string): Array<{ category: string; count: number }> {
    const counts: { [key: string]: number } = {};
    data?.forEach(item => {
      const value = item[field];
      if (value) {
        counts[value] = (counts[value] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }
}

export const vectorKnowledgeService = new VectorKnowledgeService();
