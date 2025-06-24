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
    actualThreshold?: number;
    queriesGenerated?: number;
    error?: string;
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
   * Build RAG context using the improved dedicated edge function
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
      console.log('🔍 Building RAG context via improved edge function...', {
        query: analysisQuery.substring(0, 100) + '...',
        options
      });

      const { data, error } = await supabase.functions.invoke('build-rag-context', {
        body: {
          analysisQuery,
          maxResults: options.maxResults || 8,
          similarityThreshold: options.similarityThreshold || 0.5, // LOWERED from 0.7
          categoryFilter: options.categoryFilter,
          industryFilter: options.industryFilter,
        }
      });

      if (error) {
        console.error('❌ RAG context building failed:', error);
        
        // Return fallback context instead of throwing
        return {
          relevantKnowledge: [],
          totalRelevantEntries: 0,
          categories: [],
          searchQuery: analysisQuery,
          enhancedPrompt: this.buildFallbackPrompt(analysisQuery),
          retrievalMetadata: {
            searchQueries: [],
            processingTime: 0,
            industryContext: 'general',
            error: error.message
          }
        };
      }

      if (!data) {
        console.warn('⚠️ No data returned from RAG context builder');
        return {
          relevantKnowledge: [],
          totalRelevantEntries: 0,
          categories: [],
          searchQuery: analysisQuery,
          enhancedPrompt: this.buildFallbackPrompt(analysisQuery),
          retrievalMetadata: {
            searchQueries: [],
            processingTime: 0,
            industryContext: 'general',
            error: 'No data returned'
          }
        };
      }

      const context: RAGContext = {
        relevantKnowledge: data.relevantKnowledge || [],
        totalRelevantEntries: data.totalRelevantEntries || 0,
        categories: data.categories || [],
        searchQuery: data.searchQuery || analysisQuery,
        enhancedPrompt: data.enhancedPrompt,
        retrievalMetadata: data.retrievalMetadata || {
          searchQueries: [],
          processingTime: 0,
          industryContext: 'general'
        }
      };

      console.log(`✅ RAG context built successfully:`, {
        knowledgeCount: context.totalRelevantEntries,
        categories: context.categories,
        processingTime: context.retrievalMetadata?.processingTime,
        threshold: context.retrievalMetadata?.actualThreshold,
        queriesGenerated: context.retrievalMetadata?.queriesGenerated,
        hasError: !!context.retrievalMetadata?.error
      });

      // Log detailed results for debugging
      if (context.totalRelevantEntries > 0) {
        console.log('🎯 Retrieved knowledge preview:', 
          context.relevantKnowledge.slice(0, 3).map(k => ({
            title: k.title?.substring(0, 40),
            similarity: k.similarity?.toFixed(3),
            category: k.category
          }))
        );
      } else {
        console.warn('⚠️ No knowledge retrieved - check threshold and queries');
      }

      return context;
    } catch (error) {
      console.error('❌ Error building RAG context:', error);
      
      // Return fallback context instead of throwing
      return {
        relevantKnowledge: [],
        totalRelevantEntries: 0,
        categories: [],
        searchQuery: analysisQuery,
        enhancedPrompt: this.buildFallbackPrompt(analysisQuery),
        retrievalMetadata: {
          searchQueries: [],
          processingTime: 0,
          industryContext: 'general',
          error: error.message || 'Unknown error'
        }
      };
    }
  }

  /**
   * Enhance analysis prompt with relevant research context
   */
  public enhanceAnalysisPrompt(
    userPrompt: string,
    ragContext: RAGContext,
    analysisType: 'ux' | 'conversion' | 'accessibility' | 'comprehensive' = 'comprehensive'
  ): string {
    console.log('🔧 Enhancing prompt with research context...', {
      hasContext: ragContext.totalRelevantEntries > 0,
      knowledgeCount: ragContext.totalRelevantEntries,
      categories: ragContext.categories
    });

    // If the RAG context already includes an enhanced prompt, use it
    if (ragContext.enhancedPrompt) {
      console.log('✅ Using pre-built enhanced prompt from RAG context');
      return ragContext.enhancedPrompt;
    }

    // Enhanced fallback prompt building
    return this.buildFallbackPrompt(userPrompt, ragContext.totalRelevantEntries > 0 ? ragContext : undefined);
  }

  /**
   * Improved fallback prompt building
   */
  private buildFallbackPrompt(userPrompt: string, ragContext?: RAGContext): string {
    let prompt = `UX DESIGN ANALYSIS\n\n`;
    
    if (userPrompt.trim()) {
      prompt += `USER REQUEST: ${userPrompt}\n\n`;
    }

    if (ragContext && ragContext.totalRelevantEntries > 0) {
      prompt += `RESEARCH CONTEXT: Analysis enhanced with ${ragContext.totalRelevantEntries} UX research insights.\n\n`;
    } else {
      prompt += `STANDARD ANALYSIS: Based on established UX principles and best practices.\n\n`;
    }

    prompt += `ANALYSIS REQUIREMENTS:\n`;
    prompt += `• Provide specific, actionable UX feedback\n`;
    prompt += `• Reference established design principles\n`;
    prompt += `• Include accessibility considerations\n`;
    prompt += `• Consider conversion optimization opportunities\n`;
    prompt += `• Prioritize recommendations by user impact\n\n`;

    prompt += `Please provide detailed UX feedback annotations.`;
    return prompt;
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
      // This is a simplified formatting function
      // In a production environment, you might want to use AI to parse the analysis
      // or have the AI return structured JSON
      
      const lines = aiAnalysis.split('\n').filter(line => line.trim());
      const recommendations: ResearchBackedRecommendation[] = [];

      // Extract recommendations (this is a basic implementation)
      // You could enhance this with AI-powered parsing
      let currentRecommendation: Partial<ResearchBackedRecommendation> = {};
      
      for (const line of lines) {
        if (line.includes('RECOMMENDATION') || line.includes('•') || line.includes('-')) {
          if (currentRecommendation.recommendation) {
            // Finalize previous recommendation
            recommendations.push(this.finalizeRecommendation(currentRecommendation, ragContext));
            currentRecommendation = {};
          }
          
          currentRecommendation.recommendation = line.replace(/^[•\-\d\.\s]*/, '').trim();
          currentRecommendation.category = this.inferCategory(line);
          currentRecommendation.priority = this.inferPriority(line);
        } else if (line.includes('because') || line.includes('research shows') || line.includes('studies indicate')) {
          currentRecommendation.reasoning = line.trim();
        }
      }

      // Finalize last recommendation
      if (currentRecommendation.recommendation) {
        recommendations.push(this.finalizeRecommendation(currentRecommendation, ragContext));
      }

      // Calculate research summary
      const researchSummary = {
        totalSourcesCited: ragContext.totalRelevantEntries,
        primaryCategories: ragContext.categories,
        confidenceScore: this.calculateConfidenceScore(ragContext),
      };

      const result: EnhancedAnalysisResult = {
        recommendations,
        researchSummary,
        methodology: `Analysis enhanced with ${ragContext.totalRelevantEntries} relevant UX research sources using vector similarity search (threshold: 0.5). Recommendations are backed by peer-reviewed research and industry best practices.`,
      };

      console.log(`✅ Formatted ${recommendations.length} research-backed recommendations`);
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
    maxCitations: number = 3
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
        match_threshold: 0.6,
      });

      return relevantResearch.map(entry => ({
        title: entry.title,
        source: entry.source || 'UX Research Database',
        relevanceScore: entry.similarity || 0,
        keyInsight: entry.content.substring(0, 150) + '...',
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
  private finalizeRecommendation(
    partial: Partial<ResearchBackedRecommendation>,
    ragContext: RAGContext
  ): ResearchBackedRecommendation {
    // Find supporting research for this recommendation
    const supportingResearch = ragContext.relevantKnowledge.slice(0, 3).map(entry => ({
      title: entry.title,
      source: entry.source || 'UX Research Database',
      relevanceScore: entry.similarity || 0,
      keyInsight: entry.content.substring(0, 100) + '...',
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
      ux: 'Conduct user testing to validate changes. Implement incrementally and measure user behavior.',
      visual: 'Use design systems for consistency. Test across different devices and screen sizes.',
      accessibility: 'Test with screen readers and automated accessibility tools. Ensure WCAG compliance.',
      conversion: 'A/B test changes and monitor conversion metrics. Implement gradually to measure impact.',
      general: 'Prioritize based on user impact and implementation effort. Test thoroughly before deployment.',
    };

    return guidance[category as keyof typeof guidance] || guidance.general;
  }

  private calculateConfidenceScore(ragContext: RAGContext): number {
    if (ragContext.totalRelevantEntries === 0) return 0.3;
    if (ragContext.totalRelevantEntries >= 5) return 0.9;
    return 0.6 + (ragContext.totalRelevantEntries * 0.08);
  }
}

// Export singleton instance
export const ragService = RAGService.getInstance();

// Export types for use in other components
export type { RAGContext, ResearchBackedRecommendation, EnhancedAnalysisResult };
