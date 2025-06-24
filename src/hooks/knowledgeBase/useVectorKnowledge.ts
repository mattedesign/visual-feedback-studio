
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

  const searchKnowledge = useCallback(async (query: string, filters?: SearchFilters) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await vectorKnowledgeService.searchKnowledge(query, filters);
      setSearchResults(results);
      console.log(`Found ${results.length} knowledge entries matching "${query}"`);
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

  const addKnowledgeEntry = useCallback(async (entry: Omit<KnowledgeEntry, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    try {
      const newEntry = await vectorKnowledgeService.addKnowledgeEntry(entry);
      toast.success('Knowledge entry added successfully');
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

  return {
    isLoading,
    searchResults,
    patternResults,
    searchKnowledge,
    searchPatterns,
    addKnowledgeEntry,
    addCompetitorPattern,
    clearResults: () => {
      setSearchResults([]);
      setPatternResults([]);
    }
  };
};
