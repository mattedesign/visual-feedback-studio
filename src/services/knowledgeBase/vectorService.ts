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

      // Transform the results to match our interface with flexible types
      const transformedData = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        source: item.source || '',
        category: item.category as string, // Flexible string
        primary_category: item.primary_category as string, // Flexible string
        secondary_category: item.secondary_category,
        industry_tags: item.industry_tags || [],
        complexity_level: item.complexity_level as string, // Flexible string
        use_cases: item.use_cases || [],
        freshness_score: item.freshness_score,
        application_context: item.application_context || {}, // Flexible any type
        tags: item.tags || [],
        metadata: item.metadata || {}, // Flexible any type
        created_at: item.created_at,
        updated_at: item.updated_at,
        similarity: item.similarity,
        industry: item.industry,
        element_type: item.element_type,
        embedding: item.embedding
      }));

      return transformedData;
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

      // Transform the results to match our interface with flexible types
      const transformedData = (data || []).map((item: any) => ({
        id: item.id,
        domain: item.domain || '',
        industry: item.industry,
        pattern_type: item.pattern_type as string, // Flexible string
        design_elements: item.design_elements || {},
        performance_metrics: item.performance_metrics || {},
        screenshot_url: item.screenshot_url,
        analysis_date: item.analysis_date || new Date().toISOString(),
        embedding: item.embedding,
        created_at: item.created_at,
        updated_at: item.updated_at,
        pattern_name: item.pattern_name,
        description: item.description,
        effectiveness_score: item.effectiveness_score,
        examples: item.examples,
        similarity: item.similarity
      }));

      return transformedData;
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
          title: entry.title,
          content: entry.content,
          source: entry.source,
          category: entry.category,
          primary_category: entry.primary_category,
          secondary_category: entry.secondary_category,
          industry_tags: entry.industry_tags || [],
          complexity_level: entry.complexity_level || 'intermediate',
          use_cases: entry.use_cases || [],
          application_context: entry.application_context || {},
          tags: entry.tags || [],
          metadata: entry.metadata || {},
          industry: entry.industry,
          element_type: entry.element_type,
          freshness_score: entry.freshness_score || 1.0,
          embedding: `[${embedding.join(',')}]`
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding knowledge entry:', error);
        throw error;
      }

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        source: data.source,
        category: data.category,
        primary_category: data.primary_category,
        secondary_category: data.secondary_category,
        industry_tags: data.industry_tags,
        complexity_level: data.complexity_level,
        use_cases: data.use_cases,
        application_context: data.application_context,
        tags: data.tags,
        metadata: data.metadata,
        created_at: data.created_at,
        updated_at: data.updated_at,
        industry: data.industry,
        element_type: data.element_type,
        freshness_score: data.freshness_score,
        embedding: data.embedding
      };
    } catch (error) {
      console.error('Error in addKnowledgeEntry:', error);
      throw error;
    }
  }

  async addCompetitorPattern(pattern: Omit<CompetitorPattern, 'id' | 'created_at' | 'updated_at'>): Promise<CompetitorPattern> {
    try {
      const contentText = `${pattern.pattern_name || ''} ${pattern.description || ''}`;
      const embedding = await this.generateEmbedding(contentText);
      
      const { data, error } = await supabase
        .from('competitor_patterns')
        .insert([{
          pattern_name: pattern.pattern_name || 'Unnamed Pattern',
          description: pattern.description || 'No description',
          pattern_type: pattern.pattern_type,
          industry: pattern.industry,
          effectiveness_score: pattern.effectiveness_score || 0,
          examples: pattern.examples || {},
          embedding: `[${embedding.join(',')}]`
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding competitor pattern:', error);
        throw error;
      }

      return {
        id: data.id,
        domain: pattern.domain,
        industry: data.industry,
        pattern_type: data.pattern_type,
        design_elements: pattern.design_elements,
        performance_metrics: pattern.performance_metrics,
        screenshot_url: pattern.screenshot_url,
        analysis_date: pattern.analysis_date,
        embedding: data.embedding,
        created_at: data.created_at,
        updated_at: data.updated_at,
        pattern_name: data.pattern_name,
        description: data.description,
        effectiveness_score: data.effectiveness_score,
        examples: data.examples
      };
    } catch (error) {
      console.error('Error in addCompetitorPattern:', error);
      throw error;
    }
  }

  // New method to search by hierarchical categories
  async searchByHierarchy(
    query: string,
    primaryCategory?: string,
    secondaryCategory?: string,
    industryTags?: string[],
    complexityLevel?: 'basic' | 'intermediate' | 'advanced'
  ): Promise<KnowledgeEntry[]> {
    try {
      // Generate embedding for the query to combine semantic search with hierarchical filtering
      const queryEmbedding = await this.generateEmbedding(query);
      
      const { data, error } = await supabase.rpc('match_knowledge', {
        query_embedding: `[${queryEmbedding.join(',')}]`,
        match_threshold: 0.5, // Lower threshold for hierarchical search
        match_count: 20,
        filter_primary_category: primaryCategory || null,
        filter_secondary_category: secondaryCategory || null,
        filter_industry_tags: industryTags || null,
        filter_complexity_level: complexityLevel || null
      });

      if (error) {
        console.error('Error in hierarchical search:', error);
        throw error;
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        source: item.source || '',
        category: item.category,
        primary_category: item.primary_category,
        secondary_category: item.secondary_category,
        industry_tags: item.industry_tags || [],
        complexity_level: item.complexity_level,
        use_cases: item.use_cases || [],
        freshness_score: item.freshness_score,
        application_context: item.application_context || {},
        tags: item.tags || [],
        metadata: item.metadata || {},
        created_at: item.created_at,
        updated_at: item.updated_at,
        industry: item.industry,
        element_type: item.element_type,
        embedding: item.embedding
      }));
    } catch (error) {
      console.error('Error in searchByHierarchy:', error);
      throw error;
    }
  }

  // Related Patterns Discovery
  async findRelatedPatterns(
    entryId: string,
    maxResults: number = 5
  ): Promise<KnowledgeEntry[]> {
    try {
      // First, get the source entry to understand its characteristics
      const { data: sourceEntry, error: sourceError } = await supabase
        .from('knowledge_entries')
        .select('*')
        .eq('id', entryId)
        .single();

      if (sourceError || !sourceEntry) {
        console.error('Error fetching source entry:', sourceError);
        throw new Error('Source entry not found');
      }

      // Use the source entry's content to find related patterns
      const queryText = `${sourceEntry.title} ${sourceEntry.content}`;
      const queryEmbedding = await this.generateEmbedding(queryText);

      const { data, error } = await supabase.rpc('match_knowledge', {
        query_embedding: `[${queryEmbedding.join(',')}]`,
        match_threshold: 0.6,
        match_count: maxResults + 1, // +1 to exclude the source entry
        filter_primary_category: sourceEntry.primary_category || null,
        filter_secondary_category: null,
        filter_industry_tags: sourceEntry.industry_tags || null,
        filter_complexity_level: null
      });

      if (error) {
        console.error('Error finding related patterns:', error);
        throw error;
      }

      // Filter out the source entry and transform results
      const relatedEntries = (data || [])
        .filter((item: any) => item.id !== entryId)
        .slice(0, maxResults)
        .map((item: any) => ({
          id: item.id,
          title: item.title,
          content: item.content,
          source: item.source || '',
          category: item.category,
          primary_category: item.primary_category,
          secondary_category: item.secondary_category,
          industry_tags: item.industry_tags || [],
          complexity_level: item.complexity_level,
          use_cases: item.use_cases || [],
          freshness_score: item.freshness_score,
          application_context: item.application_context || {},
          tags: item.tags || [],
          metadata: item.metadata || {},
          created_at: item.created_at,
          updated_at: item.updated_at,
          industry: item.industry,
          element_type: item.element_type,
          embedding: item.embedding
        }));

      return relatedEntries;
    } catch (error) {
      console.error('Error in findRelatedPatterns:', error);
      throw error;
    }
  }

  // Industry-Specific Retrieval
  async getIndustryPatterns(
    industry: string,
    limit: number = 10
  ): Promise<KnowledgeEntry[]> {
    try {
      let query = supabase
        .from('knowledge_entries')
        .select('*')
        .overlaps('industry_tags', [industry])
        .order('freshness_score', { ascending: false })
        .limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error('Error getting industry patterns:', error);
        throw error;
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        source: item.source || '',
        category: item.category,
        primary_category: item.primary_category,
        secondary_category: item.secondary_category,
        industry_tags: item.industry_tags || [],
        complexity_level: item.complexity_level,
        use_cases: item.use_cases || [],
        freshness_score: item.freshness_score,
        application_context: item.application_context || {},
        tags: item.tags || [],
        metadata: item.metadata || {},
        created_at: item.created_at,
        updated_at: item.updated_at,
        industry: item.industry,
        element_type: item.element_type,
        embedding: item.embedding
      }));
    } catch (error) {
      console.error('Error in getIndustryPatterns:', error);
      throw error;
    }
  }

  // Complexity-Filtered Search
  async searchByComplexity(
    query: string,
    userLevel: 'basic' | 'intermediate' | 'advanced',
    includeHigher: boolean = false
  ): Promise<KnowledgeEntry[]> {
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Define complexity hierarchy
      const complexityLevels = ['basic', 'intermediate', 'advanced'];
      const userLevelIndex = complexityLevels.indexOf(userLevel);
      
      let allowedLevels: string[];
      if (includeHigher) {
        // Include user level and higher
        allowedLevels = complexityLevels.slice(userLevelIndex);
      } else {
        // Only user level
        allowedLevels = [userLevel];
      }

      // Search with vector similarity first, then filter by complexity
      const { data: allResults, error } = await supabase.rpc('match_knowledge', {
        query_embedding: `[${queryEmbedding.join(',')}]`,
        match_threshold: 0.7,
        match_count: 50, // Get more results to filter by complexity
        filter_category: null,
        filter_primary_category: null,
        filter_secondary_category: null,
        filter_industry_tags: null,
        filter_complexity_level: null
      });

      if (error) {
        console.error('Error in complexity search:', error);
        throw error;
      }

      // Filter results by allowed complexity levels
      const filteredResults = (allResults || [])
        .filter((item: any) => 
          allowedLevels.includes(item.complexity_level) || 
          (!item.complexity_level && userLevel === 'intermediate') // Default to intermediate
        )
        .slice(0, 10); // Limit final results

      return filteredResults.map((item: any) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        source: item.source || '',
        category: item.category,
        primary_category: item.primary_category,
        secondary_category: item.secondary_category,
        industry_tags: item.industry_tags || [],
        complexity_level: item.complexity_level,
        use_cases: item.use_cases || [],
        freshness_score: item.freshness_score,
        application_context: item.application_context || {},
        tags: item.tags || [],
        metadata: item.metadata || {},
        created_at: item.created_at,
        updated_at: item.updated_at,
        industry: item.industry,
        element_type: item.element_type,
        embedding: item.embedding
      }));
    } catch (error) {
      console.error('Error in searchByComplexity:', error);
      throw error;
    }
  }

  // Category Statistics
  async getCategoryBreakdown(): Promise<{
    primaryCategories: Array<{category: string, count: number}>,
    secondaryCategories: Array<{category: string, count: number, primary: string}>,
    industryDistribution: Array<{industry: string, count: number}>
  }> {
    try {
      // Get primary categories breakdown
      const { data: primaryData } = await supabase
        .from('knowledge_entries')
        .select('primary_category');

      // Get secondary categories with their primary categories
      const { data: secondaryData } = await supabase
        .from('knowledge_entries')
        .select('primary_category, secondary_category')
        .not('secondary_category', 'is', null);

      // Get industry tags distribution
      const { data: industryData } = await supabase
        .from('knowledge_entries')
        .select('industry_tags');

      // Process primary categories
      const primaryCounts: { [key: string]: number } = {};
      primaryData?.forEach(item => {
        if (item.primary_category) {
          primaryCounts[item.primary_category] = (primaryCounts[item.primary_category] || 0) + 1;
        }
      });

      const primaryCategories = Object.entries(primaryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      // Process secondary categories
      const secondaryCounts: { [key: string]: { count: number, primary: string } } = {};
      secondaryData?.forEach(item => {
        if (item.secondary_category && item.primary_category) {
          const key = item.secondary_category;
          if (!secondaryCounts[key]) {
            secondaryCounts[key] = { count: 0, primary: item.primary_category };
          }
          secondaryCounts[key].count++;
        }
      });

      const secondaryCategories = Object.entries(secondaryCounts)
        .map(([category, data]) => ({ 
          category, 
          count: data.count, 
          primary: data.primary 
        }))
        .sort((a, b) => b.count - a.count);

      // Process industry distribution
      const allTags = industryData?.flatMap(item => item.industry_tags || []) || [];
      const industryCounts: { [key: string]: number } = {};
      allTags.forEach(tag => {
        industryCounts[tag] = (industryCounts[tag] || 0) + 1;
      });

      const industryDistribution = Object.entries(industryCounts)
        .map(([industry, count]) => ({ industry, count }))
        .sort((a, b) => b.count - a.count);

      return {
        primaryCategories,
        secondaryCategories,
        industryDistribution
      };
    } catch (error) {
      console.error('Error in getCategoryBreakdown:', error);
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
      const complexityBreakdown = this.processComplexityBreakdown(complexityData, 'complexity_level');
      
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

  private processComplexityBreakdown(data: any[], field: string): Array<{ level: string; count: number }> {
    const counts: { [key: string]: number } = {};
    data?.forEach(item => {
      const value = item[field];
      if (value) {
        counts[value] = (counts[value] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([level, count]) => ({ level, count }))
      .sort((a, b) => b.count - a.count);
  }
}

export const vectorKnowledgeService = new VectorKnowledgeService();
