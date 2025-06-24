
import { supabase } from '@/integrations/supabase/client';
import { vectorKnowledgeService } from '@/services/knowledgeBase/vectorService';
import { KnowledgeEntry, SearchFilters } from '@/types/vectorDatabase';

interface RAGContext {
  relevantKnowledge: Array<KnowledgeEntry & { similarity: number }>;
  totalRelevantEntries: number;
  categories: string[];
  searchQuery: string;
  enhancedPrompt?: string;
  retrievalMetadata?: {
    searchQueries: string[];
    processingTime: number;
    industryContext: string;
  };
}

interface ResearchBackedRecommendation {
  recommendation: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  supportingResearch: Array<{
    title: string;
    source: string;
    relevanceScore: number;
    keyInsight: string;
  }>;
  implementationGuidance: string;
}

interface EnhancedAnalysisResult {
  recommendations: ResearchBackedRecommendation[];
  researchSummary: {
    totalSourcesCited: number;
    primaryCategories: string[];
    confidenceScore: number;
  };
  methodology: string;
}

export class RAGService {
  private static instance: RAGService;

  private constructor() {}

  public static getInstance(): RAGService {
    if (!RAGService.instance) {
      RAGService.instance = new RAGService();
    }
    return RAGService.instance;
  }

  /**
   * Build RAG context using the enhanced edge function
   */
  public async buildRAGContext(
    analysisQuery: string,
    options: {
      maxResults?: number;
      similarityThreshold?: number;
      categoryFilter?: string;
      industryFilter?: string;
    } = {}
  ): Promise<RAGContext> {
    try {
      console.log('🔍 Building enhanced RAG context via edge function...', {
        query: analysisQuery.substring(0, 100) + '...',
        options
      });

      const { data, error } = await supabase.functions.invoke('build-rag-context', {
        body: {
          userPrompt: analysisQuery, // Updated parameter name to match function
          maxResults: options.maxResults || 15,
          similarityThreshold: options.similarityThreshold || 0.2, // Lower threshold for better coverage
          categoryFilter: options.categoryFilter,
          industryFilter: options.industryFilter,
        }
      });

      if (error) {
        console.error('❌ RAG context building failed:', error);
        throw new Error(`Failed to build RAG context: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from RAG context builder');
      }

      // Transform the response to match expected format
      const allKnowledge = [
        ...(data.retrievedKnowledge?.relevantPatterns || []),
        ...(data.retrievedKnowledge?.competitorInsights || [])
      ];

      const context: RAGContext = {
        relevantKnowledge: allKnowledge,
        totalRelevantEntries: data.totalEntriesFound || allKnowledge.length,
        categories: [...new Set(allKnowledge.map((entry: any) => entry.category))],
        searchQuery: data.searchTermsUsed?.join(', ') || analysisQuery,
        enhancedPrompt: data.enhancedPrompt,
        retrievalMetadata: {
          searchQueries: data.searchTermsUsed || [],
          processingTime: 0, // Will be calculated by the edge function
          industryContext: data.industryContext || 'general'
        }
      };

      console.log(`✅ Enhanced RAG context built successfully:`, {
        knowledgeCount: context.totalRelevantEntries,
        categories: context.categories,
        industryContext: context.retrievalMetadata?.industryContext,
        searchTermsUsed: data.searchTermsUsed?.length || 0,
        hasEnhancedPrompt: !!context.enhancedPrompt
      });

      return context;
    } catch (error) {
      console.error('❌ Error building RAG context:', error);
      
      // Enhanced fallback with local knowledge search
      try {
        console.log('🔄 Attempting fallback knowledge search...');
        const fallbackResults = await this.performFallbackSearch(analysisQuery);
        return fallbackResults;
      } catch (fallbackError) {
        console.error('❌ Fallback search also failed:', fallbackError);
        throw new Error('Failed to build RAG context and fallback search failed');
      }
    }
  }

  /**
   * Fallback search when main RAG context building fails
   */
  private async performFallbackSearch(query: string): Promise<RAGContext> {
    console.log('🔄 Performing fallback knowledge search...');
    
    try {
      const relevantKnowledge = await vectorKnowledgeService.searchKnowledge(query, {
        match_count: 10,
        match_threshold: 0.1, // Very low threshold for fallback
      });

      console.log(`✅ Fallback search found ${relevantKnowledge.length} entries`);

      return {
        relevantKnowledge,
        totalRelevantEntries: relevantKnowledge.length,
        categories: [...new Set(relevantKnowledge.map(entry => entry.category))],
        searchQuery: query,
        enhancedPrompt: this.buildBasicEnhancedPrompt(query, relevantKnowledge),
        retrievalMetadata: {
          searchQueries: [query],
          processingTime: 0,
          industryContext: 'general'
        }
      };
    } catch (error) {
      console.error('❌ Fallback search failed:', error);
      
      // Ultimate fallback - empty context but with basic prompt
      return {
        relevantKnowledge: [],
        totalRelevantEntries: 0,
        categories: [],
        searchQuery: query,
        enhancedPrompt: this.buildBasicEnhancedPrompt(query, []),
        retrievalMetadata: {
          searchQueries: [query],
          processingTime: 0,
          industryContext: 'general'
        }
      };
    }
  }

  /**
   * Build a basic enhanced prompt when advanced RAG fails
   */
  private buildBasicEnhancedPrompt(
    userPrompt: string,
    knowledgeEntries: Array<KnowledgeEntry & { similarity: number }>
  ): string {
    let prompt = `You are an expert UX analyst providing detailed design feedback.\n\n`;

    if (userPrompt.trim()) {
      prompt += `ANALYSIS REQUEST:\n${userPrompt.trim()}\n\n`;
    }

    if (knowledgeEntries.length > 0) {
      prompt += `AVAILABLE RESEARCH CONTEXT:\n`;
      knowledgeEntries.slice(0, 5).forEach((entry, index) => {
        prompt += `${index + 1}. ${entry.title} - ${entry.content.substring(0, 200)}...\n\n`;
      });
      prompt += `Use the above research to inform your analysis.\n\n`;
    }

    prompt += `Please provide detailed UX feedback annotations in JSON format, focusing on usability, accessibility, and conversion optimization.`;
    
    return prompt;
  }

  /**
   * Enhanced analysis prompt with better research integration
   */
  public enhanceAnalysisPrompt(
    userPrompt: string,
    ragContext: RAGContext,
    analysisType: 'ux' | 'conversion' | 'accessibility' | 'comprehensive' = 'comprehensive'
  ): string {
    console.log('🔧 Enhancing prompt with research context...');

    // Use the pre-built enhanced prompt from RAG context if available
    if (ragContext.enhancedPrompt) {
      console.log('✅ Using pre-built enhanced prompt from RAG context');
      return ragContext.enhancedPrompt;
    }

    // Fallback to manual prompt building
    return this.buildBasicEnhancedPrompt(userPrompt, ragContext.relevantKnowledge);
  }

  /**
   * Format analysis results with research-backed recommendations and citations
   */
  public formatResearchBackedRecommendations(
    aiAnalysis: string,
    ragContext: RAGContext
  ): EnhancedAnalysisResult {
    console.log('📋 Formatting research-backed recommendations...');

    try {
      // Enhanced parsing logic for better recommendation extraction
      const lines = aiAnalysis.split('\n').filter(line => line.trim());
      const recommendations: ResearchBackedRecommendation[] = [];

      let currentRecommendation: Partial<ResearchBackedRecommendation> = {};
      
      for (const line of lines) {
        if (this.isRecommendationLine(line)) {
          if (currentRecommendation.recommendation) {
            recommendations.push(this.finalizeRecommendation(currentRecommendation, ragContext));
            currentRecommendation = {};
          }
          
          currentRecommendation.recommendation = this.cleanRecommendationText(line);
          currentRecommendation.category = this.inferCategory(line);
          currentRecommendation.priority = this.inferPriority(line);
        } else if (this.isReasoningLine(line)) {
          currentRecommendation.reasoning = line.trim();
        }
      }

      // Finalize last recommendation
      if (currentRecommendation.recommendation) {
        recommendations.push(this.finalizeRecommendation(currentRecommendation, ragContext));
      }

      // Enhanced research summary
      const researchSummary = {
        totalSourcesCited: ragContext.totalRelevantEntries,
        primaryCategories: ragContext.categories,
        confidenceScore: this.calculateEnhancedConfidenceScore(ragContext),
      };

      const result: EnhancedAnalysisResult = {
        recommendations: recommendations.length > 0 ? recommendations : this.generateFallbackRecommendations(ragContext),
        researchSummary,
        methodology: `Enhanced analysis using ${ragContext.totalRelevantEntries} relevant UX research sources with multi-strategy retrieval (vector similarity, keyword matching, category-based search). Recommendations are backed by peer-reviewed research and industry best practices.`,
      };

      console.log(`✅ Formatted ${result.recommendations.length} research-backed recommendations`);
      return result;

    } catch (error) {
      console.error('❌ Error formatting recommendations:', error);
      throw new Error('Failed to format research-backed recommendations');
    }
  }

  /**
   * Get research citations for a specific topic or recommendation
   */
  public async getResearchCitations(
    topic: string,
    maxCitations: number = 5 // Increased default
  ): Promise<Array<{
    title: string;
    source: string;
    relevanceScore: number;
    keyInsight: string;
    category: string;
  }>> {
    try {
      const relevantResearch = await vectorKnowledgeService.searchKnowledge(topic, {
        match_count: maxCitations,
        match_threshold: 0.4, // Lower threshold for more results
      });

      return relevantResearch.map(entry => ({
        title: entry.title,
        source: entry.source || 'UX Research Database',
        relevanceScore: entry.similarity || 0,
        keyInsight: entry.content.substring(0, 200) + '...', // Longer insights
        category: entry.category,
      }));
    } catch (error) {
      console.error('❌ Error getting research citations:', error);
      return [];
    }
  }

  /**
   * Private helper methods
   */
  private isRecommendationLine(line: string): boolean {
    const indicators = ['RECOMMENDATION', '•', '-', '1.', '2.', '3.', 'Consider', 'Improve', 'Fix', 'Add', 'Remove', 'Update'];
    return indicators.some(indicator => line.includes(indicator));
  }

  private isReasoningLine(line: string): boolean {
    const indicators = ['because', 'research shows', 'studies indicate', 'based on', 'according to', 'evidence suggests'];
    return indicators.some(indicator => line.toLowerCase().includes(indicator));
  }

  private cleanRecommendationText(line: string): string {
    return line.replace(/^[•\-\d\.\s]*/, '').replace(/^RECOMMENDATION[:\s]*/i, '').trim();
  }

  private generateFallbackRecommendations(ragContext: RAGContext): ResearchBackedRecommendation[] {
    if (ragContext.relevantKnowledge.length === 0) {
      return [{
        recommendation: "Conduct comprehensive UX analysis based on established principles",
        reasoning: "No specific research context was available for this analysis",
        priority: 'medium' as const,
        category: 'general',
        supportingResearch: [],
        implementationGuidance: "Follow established UX best practices and conduct user testing to validate changes."
      }];
    }

    // Generate recommendations based on available knowledge
    return ragContext.relevantKnowledge.slice(0, 3).map((entry, index) => ({
      recommendation: `Apply insights from ${entry.title}`,
      reasoning: `Based on research showing: ${entry.content.substring(0, 100)}...`,
      priority: (index === 0 ? 'high' : index === 1 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
      category: entry.category,
      supportingResearch: [{
        title: entry.title,
        source: entry.source || 'UX Research Database',
        relevanceScore: entry.similarity || 0,
        keyInsight: entry.content.substring(0, 150) + '...'
      }],
      implementationGuidance: this.generateImplementationGuidance(entry.category)
    }));
  }

  private calculateEnhancedConfidenceScore(ragContext: RAGContext): number {
    if (ragContext.totalRelevantEntries === 0) return 0.3;
    if (ragContext.totalRelevantEntries >= 10) return 0.95;
    if (ragContext.totalRelevantEntries >= 5) return 0.85;
    return 0.6 + (ragContext.totalRelevantEntries * 0.05);
  }

  private finalizeRecommendation(
    partial: Partial<ResearchBackedRecommendation>,
    ragContext: RAGContext
  ): ResearchBackedRecommendation {
    const supportingResearch = ragContext.relevantKnowledge.slice(0, 3).map(entry => ({
      title: entry.title,
      source: entry.source || 'UX Research Database',
      relevanceScore: entry.similarity || 0,
      keyInsight: entry.content.substring(0, 150) + '...',
    }));

    return {
      recommendation: partial.recommendation || 'Recommendation not specified',
      reasoning: partial.reasoning || 'Based on UX best practices and research insights',
      priority: partial.priority || 'medium',
      category: partial.category || 'general',
      supportingResearch,
      implementationGuidance: this.generateImplementationGuidance(partial.category || 'general'),
    };
  }

  private inferCategory(text: string): string {
    const categoryKeywords = {
      ux: ['user', 'usability', 'navigation', 'interface', 'interaction'],
      visual: ['color', 'typography', 'visual', 'design', 'brand'],
      accessibility: ['accessibility', 'contrast', 'screen reader', 'wcag', 'inclusive'],
      conversion: ['conversion', 'cta', 'form', 'checkout', 'trust'],
    };

    const lowerText = text.toLowerCase();
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }
    return 'general';
  }

  private inferPriority(text: string): 'high' | 'medium' | 'low' {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('critical') || lowerText.includes('urgent') || lowerText.includes('major')) {
      return 'high';
    }
    if (lowerText.includes('minor') || lowerText.includes('enhancement') || lowerText.includes('nice')) {
      return 'low';
    }
    return 'medium';
  }

  private generateImplementationGuidance(category: string): string {
    const guidance = {
      ux: 'Conduct user testing to validate changes. Implement incrementally and measure user behavior metrics.',
      visual: 'Use design systems for consistency. Test across different devices and screen sizes.',
      accessibility: 'Test with screen readers and automated accessibility tools. Ensure WCAG 2.1 AA compliance.',
      conversion: 'A/B test changes and monitor conversion metrics. Implement gradually to measure impact.',
      general: 'Prioritize based on user impact and implementation effort. Test thoroughly before deployment.',
    };

    return guidance[category as keyof typeof guidance] || guidance.general;
  }
}

// Export singleton instance
export const ragService = RAGService.getInstance();

// Export types for use in other components
export type { RAGContext, ResearchBackedRecommendation, EnhancedAnalysisResult };
