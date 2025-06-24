
import { vectorKnowledgeService } from '@/services/knowledgeBase/vectorService';
import { KnowledgeEntry, SearchFilters } from '@/types/vectorDatabase';

interface RAGContext {
  relevantKnowledge: Array<KnowledgeEntry & { similarity: number }>;
  totalRelevantEntries: number;
  categories: string[];
  searchQuery: string;
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
   * Build RAG context by retrieving relevant knowledge for analysis query
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
      console.log('🔍 Building RAG context for query:', analysisQuery.substring(0, 100) + '...');

      const searchFilters: SearchFilters = {
        match_count: options.maxResults || 10,
        match_threshold: options.similarityThreshold || 0.7,
        category: options.categoryFilter,
        industry: options.industryFilter,
      };

      // Search for relevant knowledge entries
      const relevantKnowledge = await vectorKnowledgeService.searchKnowledge(
        analysisQuery,
        searchFilters
      );

      // Extract unique categories from results
      const categories = [...new Set(relevantKnowledge.map(entry => entry.category))];

      const context: RAGContext = {
        relevantKnowledge,
        totalRelevantEntries: relevantKnowledge.length,
        categories,
        searchQuery: analysisQuery,
      };

      console.log(`✅ RAG context built: ${relevantKnowledge.length} relevant entries found`);
      console.log(`📊 Categories covered: ${categories.join(', ')}`);

      return context;
    } catch (error) {
      console.error('❌ Error building RAG context:', error);
      throw new Error('Failed to build RAG context');
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
    console.log('🔧 Enhancing analysis prompt with research context...');

    let enhancedPrompt = `RESEARCH-BACKED DESIGN ANALYSIS REQUEST\n\n`;

    // Add user's original prompt
    enhancedPrompt += `USER REQUEST:\n${userPrompt}\n\n`;

    // Add research context section
    if (ragContext.relevantKnowledge.length > 0) {
      enhancedPrompt += `RELEVANT UX RESEARCH CONTEXT:\n`;
      enhancedPrompt += `You have access to ${ragContext.totalRelevantEntries} relevant research entries covering: ${ragContext.categories.join(', ')}\n\n`;

      // Add top research insights
      enhancedPrompt += `KEY RESEARCH INSIGHTS TO CONSIDER:\n`;
      ragContext.relevantKnowledge.slice(0, 6).forEach((entry, index) => {
        enhancedPrompt += `${index + 1}. ${entry.title} (Relevance: ${(entry.similarity * 100).toFixed(1)}%)\n`;
        enhancedPrompt += `   Insight: ${entry.content.substring(0, 200)}...\n`;
        enhancedPrompt += `   Source: ${entry.source || 'UX Research Database'}\n`;
        enhancedPrompt += `   Category: ${entry.category}\n\n`;
      });

      // Add specific guidance based on analysis type
      enhancedPrompt += `ANALYSIS GUIDANCE:\n`;
      switch (analysisType) {
        case 'ux':
          enhancedPrompt += `Focus on user experience principles, usability heuristics, and user behavior patterns from the research.\n`;
          break;
        case 'conversion':
          enhancedPrompt += `Emphasize conversion optimization strategies, form design, and trust signals from the research.\n`;
          break;
        case 'accessibility':
          enhancedPrompt += `Prioritize accessibility guidelines, inclusive design principles, and WCAG compliance from the research.\n`;
          break;
        default:
          enhancedPrompt += `Provide comprehensive analysis covering UX, conversion, accessibility, and visual design principles from the research.\n`;
      }

      enhancedPrompt += `\nRESEARCH-BACKED ANALYSIS REQUIREMENTS:\n`;
      enhancedPrompt += `• Ground all recommendations in the provided research insights\n`;
      enhancedPrompt += `• Cite specific research sources for each recommendation\n`;
      enhancedPrompt += `• Include relevance scores for cited research\n`;
      enhancedPrompt += `• Explain how each recommendation connects to established UX principles\n`;
      enhancedPrompt += `• Prioritize recommendations based on research-backed impact\n`;
      enhancedPrompt += `• Provide implementation guidance based on research best practices\n\n`;

    } else {
      enhancedPrompt += `RESEARCH CONTEXT:\n`;
      enhancedPrompt += `No highly relevant research entries found for this specific query. Provide analysis based on general UX principles and best practices.\n\n`;
    }

    enhancedPrompt += `OUTPUT FORMAT:\n`;
    enhancedPrompt += `Structure your response to clearly indicate which research sources support each recommendation. Include research citations and explain the connection between the research and your specific recommendations.\n`;

    console.log(`✅ Enhanced prompt created (${enhancedPrompt.length} characters)`);
    return enhancedPrompt;
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
        methodology: `Analysis enhanced with ${ragContext.totalRelevantEntries} relevant UX research sources using vector similarity search (threshold: 0.7). Recommendations are backed by peer-reviewed research and industry best practices.`,
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
