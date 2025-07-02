import { supabase } from '@/integrations/supabase/client';
import {
  PerplexityResearchRequest,
  PerplexityResearchResponse,
  PerplexityCompetitiveAnalysis,
  PerplexityValidationResult,
  PerplexityEnhancedAnnotation
} from '@/types/perplexity';
import { Annotation } from '@/types/analysis';

class PerplexityService {
  // ✅ FIX: Rate limiting to prevent 406 errors
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 1500; // 1.5 seconds between requests

  /**
   * ✅ FIX: Rate limiting wrapper for API calls
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`⏱️ Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Research UX topics and validate insights using Perplexity.ai
   */
  async researchTopic(request: PerplexityResearchRequest): Promise<PerplexityResearchResponse> {
    try {
      // ✅ FIX: Apply rate limiting before making request
      await this.waitForRateLimit();
      
      console.log('🔍 Perplexity Research: Starting topic research', {
        query: request.query.substring(0, 100),
        domain: request.domain,
        recencyFilter: request.recencyFilter
      });

      const { data, error } = await supabase.functions.invoke('perplexity-research', {
        body: {
          type: 'research',
          ...request
        }
      });

      if (error) {
        console.error('❌ Perplexity Research: API call failed:', error);
        return {
          success: false,
          error: error.message || 'Research request failed'
        };
      }

      console.log('✅ Perplexity Research: Successfully completed', {
        sourcesCount: data?.sources?.length || 0,
        relatedQuestionsCount: data?.relatedQuestions?.length || 0
      });

      return {
        success: true,
        content: data.content,
        sources: data.sources || [],
        relatedQuestions: data.relatedQuestions || []
      };

    } catch (error) {
      console.error('❌ Perplexity Research: Service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Validate UX knowledge entries against current research
   */
  async validateKnowledgeEntry(
    entryId: string,
    title: string,
    content: string
  ): Promise<PerplexityValidationResult> {
    try {
      console.log('🔍 Perplexity Validation: Starting knowledge validation', {
        entryId,
        title: title.substring(0, 50)
      });

      const validationQuery = `Validate this UX research claim: "${title}". Content: ${content.substring(0, 500)}`;
      
      const response = await this.researchTopic({
        query: validationQuery,
        domain: 'ux',
        recencyFilter: 'year',
        maxSources: 5
      });

      if (!response.success) {
        throw new Error(response.error || 'Validation failed');
      }

      // Analyze the response to determine validation result
      const validation = this.analyzeValidationResponse(response, content);

      // Update the knowledge entry with validation results
      await supabase
        .from('knowledge_entries')
        .update({
          perplexity_validated: true,
          perplexity_validation_score: validation.confidence,
          perplexity_last_validated: new Date().toISOString(),
          perplexity_sources: JSON.parse(JSON.stringify(validation.sources))
        })
        .eq('id', entryId);

      console.log('✅ Perplexity Validation: Completed successfully', {
        entryId,
        confidence: validation.confidence,
        sourcesCount: validation.sources.length
      });

      return validation;

    } catch (error) {
      console.error('❌ Perplexity Validation: Service error:', error);
      return {
        isValid: false,
        confidence: 0,
        sources: [],
        supportingEvidence: [],
        lastValidated: new Date().toISOString()
      };
    }
  }

  /**
   * Get competitive analysis for UX patterns
   */
  async getCompetitiveAnalysis(
    designCategory: string,
    industry?: string
  ): Promise<PerplexityCompetitiveAnalysis> {
    try {
      console.log('🔍 Perplexity Competitive: Starting analysis', {
        category: designCategory,
        industry
      });

      const competitiveQuery = `Latest UX design trends and competitor analysis for ${designCategory}${industry ? ` in ${industry} industry` : ''}. Include best practices, common patterns, and emerging trends.`;

      const { data, error } = await supabase.functions.invoke('perplexity-research', {
        body: {
          type: 'competitive',
          query: competitiveQuery,
          domain: 'ux',
          industry,
          recencyFilter: 'month'
        }
      });

      if (error) {
        throw new Error(error.message || 'Competitive analysis failed');
      }

      console.log('✅ Perplexity Competitive: Analysis completed', {
        competitorsCount: data?.competitors?.length || 0,
        trendsCount: data?.industryTrends?.length || 0
      });

      return data || {
        competitors: [],
        industryTrends: [],
        benchmarks: [],
        recommendations: []
      };

    } catch (error) {
      console.error('❌ Perplexity Competitive: Service error:', error);
      return {
        competitors: [],
        industryTrends: [],
        benchmarks: [],
        recommendations: []
      };
    }
  }

  /**
   * Enhance annotations with Perplexity research
   */
  async enhanceAnnotations(
    annotations: Annotation[],
    designContext?: string
  ): Promise<PerplexityEnhancedAnnotation[]> {
    try {
      console.log('🔍 Perplexity Enhancement: Starting annotation enhancement', {
        annotationsCount: annotations.length,
        hasContext: !!designContext
      });

      const enhancedAnnotations: PerplexityEnhancedAnnotation[] = [];

      // Process annotations in batches to avoid overwhelming the API
      const batchSize = 3;
      for (let i = 0; i < annotations.length; i += batchSize) {
        const batch = annotations.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (annotation) => {
          try {
            // Create research query for this annotation
            const researchQuery = `UX research validation: ${annotation.feedback || annotation.title || 'Design recommendation'}. ${designContext ? `Context: ${designContext}` : ''}`;
            
            const validationResponse = await this.researchTopic({
              query: researchQuery,
              domain: 'ux',
              recencyFilter: 'year',
              maxSources: 3
            });

            const enhanced: PerplexityEnhancedAnnotation = {
              originalAnnotation: annotation
            };

            if (validationResponse.success && validationResponse.content) {
              enhanced.perplexityValidation = {
                isValid: true,
                confidence: 0.8, // Default confidence, could be improved with sentiment analysis
                sources: validationResponse.sources || [],
                supportingEvidence: [validationResponse.content],
                lastValidated: new Date().toISOString()
              };
            }

            return enhanced;
          } catch (error) {
            console.error('❌ Error enhancing annotation:', error);
            return {
              originalAnnotation: annotation
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        enhancedAnnotations.push(...batchResults);

        // Small delay between batches to respect rate limits
        if (i + batchSize < annotations.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log('✅ Perplexity Enhancement: Completed successfully', {
        originalCount: annotations.length,
        enhancedCount: enhancedAnnotations.length,
        validatedCount: enhancedAnnotations.filter(a => a.perplexityValidation).length
      });

      return enhancedAnnotations;

    } catch (error) {
      console.error('❌ Perplexity Enhancement: Service error:', error);
      // Return original annotations if enhancement fails
      return annotations.map(annotation => ({
        originalAnnotation: annotation
      }));
    }
  }

  /**
   * Analyze validation response to determine if knowledge is valid
   */
  private analyzeValidationResponse(
    response: PerplexityResearchResponse,
    originalContent: string
  ): PerplexityValidationResult {
    const content = response.content || '';
    const sources = response.sources || [];

    // Simple sentiment analysis - in production, this could be more sophisticated
    const positiveIndicators = ['confirm', 'supports', 'validates', 'accurate', 'correct', 'proven'];
    const negativeIndicators = ['contradicts', 'disputes', 'incorrect', 'outdated', 'disputed'];

    const positiveMatches = positiveIndicators.filter(indicator => 
      content.toLowerCase().includes(indicator)
    ).length;
    
    const negativeMatches = negativeIndicators.filter(indicator => 
      content.toLowerCase().includes(indicator)
    ).length;

    const confidence = Math.max(0, Math.min(1, 
      (positiveMatches - negativeMatches + sources.length * 0.1) / 3
    ));

    return {
      isValid: confidence > 0.5,
      confidence,
      sources,
      supportingEvidence: [content],
      contradictions: negativeMatches > 0 ? [content] : undefined,
      lastValidated: new Date().toISOString()
    };
  }
}

export const perplexityService = new PerplexityService();