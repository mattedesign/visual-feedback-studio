
import { useState, useCallback } from 'react';
import { vectorKnowledgeService } from '@/services/knowledgeBase/vectorService';
import { 
  KnowledgeEntry, 
  CompetitorPattern, 
  SearchFilters 
} from '@/types/vectorDatabase';
import { toast } from 'sonner';

export const useVectorKnowledge = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<KnowledgeEntry & { similarity: number }>>([]);
  const [patternResults, setPatternResults] = useState<Array<CompetitorPattern & { similarity: number }>>([]);
  const [knowledgeStats, setKnowledgeStats] = useState<{
    totalEntries: number;
    categoryBreakdown: Array<{ category: string; count: number }>;
    complexityBreakdown: Array<{ level: string; count: number }>;
    industryTagsBreakdown: Array<{ tag: string; count: number }>;
  } | null>(null);

  const searchKnowledge = useCallback(async (query: string, filters?: SearchFilters) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await vectorKnowledgeService.searchKnowledge(query, filters);
      setSearchResults(results);
      console.log(`Found ${results.length} knowledge entries matching "${query}"`, {
        filters,
        topResults: results.slice(0, 3).map(r => ({
          title: r.title,
          similarity: r.similarity,
          primary_category: r.primary_category,
          complexity: r.complexity_level
        }))
      });
    } catch (error) {
      console.error('Error searching knowledge:', error);
      toast.error('Failed to search knowledge base');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchPatterns = useCallback(async (query: string, filters?: SearchFilters) => {
    if (!query.trim()) {
      setPatternResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await vectorKnowledgeService.searchPatterns(query, filters);
      setPatternResults(results);
      console.log(`Found ${results.length} competitor patterns matching "${query}"`);
    } catch (error) {
      console.error('Error searching patterns:', error);
      toast.error('Failed to search competitor patterns');
      setPatternResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchByHierarchy = useCallback(async (
    primaryCategory: string,
    secondaryCategory?: string,
    industryTags?: string[],
    complexityLevel?: string
  ) => {
    setIsLoading(true);
    try {
      const results = await vectorKnowledgeService.searchByHierarchy(
        primaryCategory,
        secondaryCategory,
        industryTags,
        complexityLevel
      );
      
      // Convert to search results format (without similarity score)
      const resultsWithSimilarity = results.map(result => ({
        ...result,
        similarity: 1.0 // Default high similarity for hierarchical search
      }));
      
      setSearchResults(resultsWithSimilarity);
      console.log(`Found ${results.length} entries by hierarchy:`, {
        primaryCategory,
        secondaryCategory,
        industryTags,
        complexityLevel
      });
    } catch (error) {
      console.error('Error searching by hierarchy:', error);
      toast.error('Failed to search by hierarchy');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadKnowledgeStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const stats = await vectorKnowledgeService.getKnowledgeStats();
      setKnowledgeStats(stats);
      console.log('Knowledge base statistics:', stats);
    } catch (error) {
      console.error('Error loading knowledge stats:', error);
      toast.error('Failed to load knowledge statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addKnowledgeEntry = useCallback(async (entry: Omit<KnowledgeEntry, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    try {
      const newEntry = await vectorKnowledgeService.addKnowledgeEntry(entry);
      toast.success('Knowledge entry added successfully');
      console.log('Added knowledge entry:', {
        id: newEntry.id,
        title: newEntry.title,
        primary_category: newEntry.primary_category,
        complexity_level: newEntry.complexity_level
      });
      return newEntry;
    } catch (error) {
      console.error('Error adding knowledge entry:', error);
      toast.error('Failed to add knowledge entry');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addCompetitorPattern = useCallback(async (pattern: Omit<CompetitorPattern, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    try {
      const newPattern = await vectorKnowledgeService.addCompetitorPattern(pattern);
      toast.success('Competitor pattern added successfully');
      return newPattern;
    } catch (error) {
      console.error('Error adding competitor pattern:', error);
      toast.error('Failed to add competitor pattern');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enhanced Hierarchical Search
  const searchByHierarchyEnhanced = useCallback(async (
    query: string,
    primaryCategory?: string,
    secondaryCategory?: string,
    industryTags?: string[],
    complexityLevel?: string
  ) => {
    setIsLoading(true);
    try {
      const results = await vectorKnowledgeService.searchByHierarchy(
        query,
        primaryCategory,
        secondaryCategory,
        industryTags,
        complexityLevel
      );
      
      // Convert to search results format with default similarity
      const resultsWithSimilarity = results.map(result => ({
        ...result,
        similarity: 1.0
      }));
      
      setSearchResults(resultsWithSimilarity);
      console.log(`Found ${results.length} entries by enhanced hierarchy search:`, {
        query,
        primaryCategory,
        secondaryCategory,
        industryTags,
        complexityLevel
      });
    } catch (error) {
      console.error('Error in enhanced hierarchy search:', error);
      toast.error('Failed to search by hierarchy');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Find Related Patterns
  const findRelatedPatterns = useCallback(async (entryId: string, maxResults = 5) => {
    setIsLoading(true);
    try {
      const results = await vectorKnowledgeService.findRelatedPatterns(entryId, maxResults);
      
      const resultsWithSimilarity = results.map(result => ({
        ...result,
        similarity: 0.9 // High similarity for related patterns
      }));
      
      setSearchResults(resultsWithSimilarity);
      console.log(`Found ${results.length} related patterns for entry ${entryId}`);
    } catch (error) {
      console.error('Error finding related patterns:', error);
      toast.error('Failed to find related patterns');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get Industry Patterns
  const getIndustryPatterns = useCallback(async (industry: string, limit = 10) => {
    setIsLoading(true);
    try {
      const results = await vectorKnowledgeService.getIndustryPatterns(industry, limit);
      
      const resultsWithSimilarity = results.map(result => ({
        ...result,
        similarity: 0.85 // Good similarity for industry-specific results
      }));
      
      setSearchResults(resultsWithSimilarity);
      console.log(`Found ${results.length} patterns for industry: ${industry}`);
    } catch (error) {
      console.error('Error getting industry patterns:', error);
      toast.error('Failed to get industry patterns');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Search by Complexity
  const searchByComplexity = useCallback(async (
    query: string,
    userLevel: string,
    includeHigher = false
  ) => {
    setIsLoading(true);
    try {
      const results = await vectorKnowledgeService.searchByComplexity(query, userLevel, includeHigher);
      setSearchResults(results.map(r => ({ ...r, similarity: r.similarity || 0.8 })));
      console.log(`Found ${results.length} results by complexity for level: ${userLevel}`, {
        includeHigher
      });
    } catch (error) {
      console.error('Error searching by complexity:', error);
      toast.error('Failed to search by complexity level');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get Category Breakdown - Fixed to call without arguments
  const getCategoryBreakdown = useCallback(async () => {
    setIsLoading(true);
    try {
      const breakdown = await vectorKnowledgeService.getCategoryBreakdown();
      console.log('Category breakdown:', breakdown);
      toast.success('Category breakdown loaded successfully');
      return breakdown;
    } catch (error) {
      console.error('Error getting category breakdown:', error);
      toast.error('Failed to get category breakdown');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    searchResults,
    patternResults,
    knowledgeStats,
    searchKnowledge,
    searchPatterns,
    searchByHierarchy,
    loadKnowledgeStats,
    addKnowledgeEntry,
    addCompetitorPattern,
    // Enhanced methods
    searchByHierarchyEnhanced,
    findRelatedPatterns,
    getIndustryPatterns,
    searchByComplexity,
    getCategoryBreakdown,
    clearResults: () => {
      setSearchResults([]);
      setPatternResults([]);
    }
  };
};
