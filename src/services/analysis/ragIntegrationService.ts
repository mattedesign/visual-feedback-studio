
import { supabase } from '@/integrations/supabase/client';
import { KnowledgeEntry, SearchFilters } from '@/types/vectorDatabase';
import { perplexityService } from '../perplexityService';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

export interface RagIntegrationOptions {
  maxKnowledgeEntries?: number;
  minConfidenceThreshold?: number;
  includeIndustrySpecific?: boolean;
}

class RagIntegrationService {
  /**
   * Unified RAG context retrieval that works with both enhanced analysis and edge functions
   * Now enhanced with optional Perplexity.ai real-time research
   */
  async retrieveKnowledgeContext(
    searchQuery: string,
    options: RagIntegrationOptions = {}
  ): Promise<{
    knowledge: KnowledgeEntry[];
    contextSummary: string;
    sourceCount: number;
    perplexityEnhanced?: boolean;
    perplexityData?: any;
  }> {
    const opts = {
      maxKnowledgeEntries: 12,
      minConfidenceThreshold: 0.7,
      includeIndustrySpecific: true,
      ...options
    };

    console.log('🔍 RAG Integration: Retrieving knowledge context', {
      query: searchQuery.substring(0, 100),
      options: opts
    });

    try {
      const filters: SearchFilters = {
        match_threshold: opts.minConfidenceThreshold,
        match_count: opts.maxKnowledgeEntries
      };

      // Call the build-rag-context edge function
      const { data, error } = await supabase.functions.invoke('build-rag-context', {
        body: {
          query: searchQuery,
          filters,
          includeCompetitive: opts.includeIndustrySpecific
        }
      });

      if (error) {
        console.error('❌ RAG Integration: Knowledge retrieval failed:', error);
        return {
          knowledge: [],
          contextSummary: 'No additional context available',
          sourceCount: 0
        };
      }

      const knowledge = data?.knowledge || [];
      const contextSummary = this.buildContextSummary(knowledge);

      console.log('✅ RAG Integration: Knowledge retrieved successfully', {
        knowledgeCount: knowledge.length,
        contextLength: contextSummary.length
      });

      // NEW: Optional Perplexity enhancement
      let perplexityData = null;
      let perplexityEnhanced = false;

      try {
        // Check if Perplexity integration is enabled
        const isPerplexityEnabled = typeof window !== 'undefined' && 
          new URLSearchParams(window.location.search).get('perplexity') === 'true';

        if (isPerplexityEnabled && knowledge.length > 0) {
          console.log('🔬 RAG Integration: Enhancing with Perplexity research...');
          
          // Use Perplexity to validate and enhance the top knowledge entries
          const topEntry = knowledge[0];
          const perplexityResponse = await perplexityService.researchTopic({
            query: `Validate and expand on this UX insight: ${topEntry.title}. ${topEntry.content.substring(0, 200)}`,
            domain: 'ux',
            recencyFilter: 'month',
            maxSources: 3
          });

          if (perplexityResponse.success) {
            perplexityData = perplexityResponse;
            perplexityEnhanced = true;
            
            console.log('✅ RAG Integration: Perplexity enhancement successful', {
              sourcesAdded: perplexityResponse.sources?.length || 0
            });
          }
        }
      } catch (perplexityError) {
        console.error('⚠️ RAG Integration: Perplexity enhancement failed (non-critical):', perplexityError);
      }

      return {
        knowledge,
        contextSummary,
        sourceCount: knowledge.length,
        perplexityEnhanced,
        perplexityData
      };

    } catch (error) {
      console.error('❌ RAG Integration: Service error:', error);
      return {
        knowledge: [],
        contextSummary: 'Error retrieving context',
        sourceCount: 0
      };
    }
  }

  /**
   * Build a context summary from knowledge entries
   */
  private buildContextSummary(knowledge: KnowledgeEntry[]): string {
    if (knowledge.length === 0) {
      return 'No additional UX research context available.';
    }

    let summary = `=== UX RESEARCH CONTEXT (${knowledge.length} sources) ===\n\n`;
    
    knowledge.slice(0, 8).forEach((entry, index) => {
      summary += `${index + 1}. ${entry.title}\n`;
      summary += `   ${entry.content.substring(0, 200)}...\n\n`;
    });

    return summary;
  }

  /**
   * Enhanced prompt building with RAG context
   */
  buildEnhancedPrompt(
    originalPrompt: string,
    ragContext: string,
    visionContext?: string
  ): string {
    let enhancedPrompt = originalPrompt + '\n\n';

    if (visionContext) {
      enhancedPrompt += visionContext + '\n\n';
    }

    if (ragContext && ragContext.length > 50) {
      enhancedPrompt += ragContext + '\n\n';
    }

    enhancedPrompt += 'Please provide specific, actionable UX recommendations based on the above context and research.';

    return enhancedPrompt;
  }
}

export const ragIntegrationService = new RagIntegrationService();
