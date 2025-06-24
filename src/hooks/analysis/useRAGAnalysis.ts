
import { useState, useCallback } from 'react';
import { ragService, RAGContext, EnhancedAnalysisResult } from '@/services/analysis/ragService';
import { toast } from 'sonner';

export const useRAGAnalysis = () => {
  const [isBuilding, setIsBuilding] = useState(false);
  const [ragContext, setRagContext] = useState<RAGContext | null>(null);
  const [enhancedResults, setEnhancedResults] = useState<EnhancedAnalysisResult | null>(null);

  const buildRAGContext = useCallback(async (
    analysisQuery: string,
    options?: {
      maxResults?: number;
      similarityThreshold?: number;
      categoryFilter?: string;
      industryFilter?: string;
    }
  ) => {
    setIsBuilding(true);
    try {
      console.log('🔍 Building RAG context for analysis...');
      const context = await ragService.buildRAGContext(analysisQuery, options);
      setRagContext(context);
      
      toast.success(`Found ${context.totalRelevantEntries} relevant research sources`);
      console.log('✅ RAG context built successfully');
      
      return context;
    } catch (error) {
      console.error('❌ Error building RAG context:', error);
      toast.error('Failed to build research context');
      throw error;
    } finally {
      setIsBuilding(false);
    }
  }, []);

  const enhancePromptWithResearch = useCallback((
    userPrompt: string,
    context: RAGContext,
    analysisType?: 'ux' | 'conversion' | 'accessibility' | 'comprehensive'
  ) => {
    try {
      console.log('🔧 Enhancing prompt with research context...');
      const enhancedPrompt = ragService.enhanceAnalysisPrompt(userPrompt, context, analysisType);
      console.log('✅ Prompt enhanced with research');
      return enhancedPrompt;
    } catch (error) {
      console.error('❌ Error enhancing prompt:', error);
      toast.error('Failed to enhance prompt with research');
      throw error;
    }
  }, []);

  const formatAnalysisWithResearch = useCallback((
    aiAnalysis: string,
    context: RAGContext
  ) => {
    try {
      console.log('📋 Formatting analysis with research citations...');
      const formattedResults = ragService.formatResearchBackedRecommendations(aiAnalysis, context);
      setEnhancedResults(formattedResults);
      
      toast.success(`Analysis enhanced with ${formattedResults.researchSummary.totalSourcesCited} research sources`);
      console.log('✅ Analysis formatted with research backing');
      
      return formattedResults;
    } catch (error) {
      console.error('❌ Error formatting research-backed analysis:', error);
      toast.error('Failed to format research-backed analysis');
      throw error;
    }
  }, []);

  const getResearchCitations = useCallback(async (
    topic: string,
    maxCitations: number = 3
  ) => {
    try {
      console.log(`🔍 Getting research citations for: ${topic}`);
      const citations = await ragService.getResearchCitations(topic, maxCitations);
      console.log(`✅ Found ${citations.length} research citations`);
      return citations;
    } catch (error) {
      console.error('❌ Error getting research citations:', error);
      toast.error('Failed to get research citations');
      return [];
    }
  }, []);

  const clearRAGData = useCallback(() => {
    setRagContext(null);
    setEnhancedResults(null);
    console.log('🧹 RAG data cleared');
  }, []);

  return {
    // State
    isBuilding,
    ragContext,
    enhancedResults,
    
    // Methods
    buildRAGContext,
    enhancePromptWithResearch,
    formatAnalysisWithResearch,
    getResearchCitations,
    clearRAGData,
    
    // Computed values
    hasResearchContext: ragContext !== null,
    researchSourcesCount: ragContext?.totalRelevantEntries || 0,
    researchCategories: ragContext?.categories || [],
  };
};
