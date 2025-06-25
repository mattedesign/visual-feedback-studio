
import { useState, useCallback } from 'react';
import { ragService, RAGContext, EnhancedAnalysisResult } from '@/services/analysis/ragService';
import { toast } from 'sonner';

export const useRAGAnalysis = () => {
  const [isBuilding, setIsBuilding] = useState(false);
  const [ragContext, setRagContext] = useState<RAGContext | null>(null);
  const [enhancedResults, setEnhancedResults] = useState<EnhancedAnalysisResult | null>(null);

  // ALL RAG FUNCTIONS DISABLED - Return immediately without action
  const buildRAGContext = useCallback(async () => {
    console.log('🚫 RAG DISABLED: buildRAGContext() call blocked');
    setIsBuilding(false);
    return null;
  }, []);

  const enhancePromptWithResearch = useCallback((userPrompt: string) => {
    console.log('🚫 RAG DISABLED: enhancePromptWithResearch() call blocked');
    return userPrompt; // Return original prompt unchanged
  }, []);

  const formatAnalysisWithResearch = useCallback(() => {
    console.log('🚫 RAG DISABLED: formatAnalysisWithResearch() call blocked');
    return null;
  }, []);

  const getResearchCitations = useCallback(async () => {
    console.log('🚫 RAG DISABLED: getResearchCitations() call blocked');
    return [];
  }, []);

  const clearRAGData = useCallback(() => {
    setRagContext(null);
    setEnhancedResults(null);
    console.log('🧹 RAG data cleared');
  }, []);

  return {
    // State - Always disabled
    isBuilding: false,
    ragContext: null,
    enhancedResults: null,
    
    // Methods - All disabled
    buildRAGContext,
    enhancePromptWithResearch,
    formatAnalysisWithResearch,
    getResearchCitations,
    clearRAGData,
    
    // Computed values - Always empty/false
    hasResearchContext: false,
    researchSourcesCount: 0,
    researchCategories: [],
  };
};
