import { supabase } from '@/integrations/supabase/client';
import { perplexityEnhancer } from './perplexityEnhancer';

interface ProblemStatement {
  id: string;
  statement: string;
  category: string;
  implied_context: any;
  context_refinement_questions: string[];
  targeted_solutions: string[];
  traditional_ux_issues?: string[];
  usage_count: number;
}

interface ContextualSolution {
  id: string;
  title: string;
  problem_statement_ids: string[];
  recommendation: string;
  problem_specific_guidance: any;
  context_adapted_implementation: any;
  expected_impact: any;
  stakeholder_communication: any;
  success_rate: number;
}

interface ExtractedContext {
  urgency: 'low' | 'medium' | 'high' | 'critical';
  stakeholders: string[];
  timeConstraints: string[];
  businessGoals: string[];
  resourceConstraints: string[];
  emotionalIndicators: string[];
  businessModel?: string;
  industry?: string;
  competitiveThreats?: string[];
}

interface ProblemMatchResult {
  matchedTemplate: ProblemStatement | null;
  confidence: number;
  extractedContext: ExtractedContext;
  contextualizedSolution: ContextualSolution | null;
  enhancedSolution?: {
    researchBacking: string[];
    confidenceAdjustment: number;
    currentExamples: string[];
    marketValidation: any;
  };
  fallbackReason?: string;
  alternativeMatches?: Array<{
    template: ProblemStatement;
    confidence: number;
    reason: string;
  }>;
}

export class IntelligentProblemMatcher {
  private readonly CONFIDENCE_THRESHOLD = 0.75;
  private readonly MIN_ALTERNATIVE_CONFIDENCE = 0.5;

  /**
   * Main method to interpret user problem statements and match to database templates
   */
  async interpretProblemStatement(userStatement: string): Promise<ProblemMatchResult> {
    console.log('🤖 Starting intelligent problem statement interpretation:', {
      statementLength: userStatement.length,
      timestamp: new Date().toISOString()
    });

    try {
      // Step 1: Extract business context using Claude Sonnet 4
      const extractedContext = await this.extractBusinessContext(userStatement);
      console.log('✅ Context extracted successfully:', {
        urgency: extractedContext.urgency,
        stakeholderCount: extractedContext.stakeholders.length,
        businessGoalsCount: extractedContext.businessGoals.length,
        hasTimeConstraints: extractedContext.timeConstraints.length > 0
      });

      // Step 2: Get all problem statement templates from database
      const problemTemplates = await this.loadProblemTemplates();
      console.log('📚 Loaded problem templates:', {
        templateCount: problemTemplates.length,
        categories: [...new Set(problemTemplates.map(t => t.category))]
      });

      if (problemTemplates.length === 0) {
        console.warn('⚠️ No problem templates found in database');
        return {
          matchedTemplate: null,
          confidence: 0,
          extractedContext,
          contextualizedSolution: null,
          fallbackReason: 'No problem templates available in database'
        };
      }

      // Step 3: Use Claude Sonnet 4 for semantic matching and scoring
      const matchingResults = await this.performSemanticMatching(
        userStatement,
        extractedContext,
        problemTemplates
      );

      console.log('🎯 Semantic matching completed:', {
        bestMatch: matchingResults.bestMatch?.confidence || 0,
        alternativeCount: matchingResults.alternatives.length,
        meetsThreshold: (matchingResults.bestMatch?.confidence || 0) >= this.CONFIDENCE_THRESHOLD
      });

      // Step 4: If we have a high-confidence match, get contextual solution
      let contextualizedSolution: ContextualSolution | null = null;
      let enhancedSolution: any = null;
      
      if (matchingResults.bestMatch && matchingResults.bestMatch.confidence >= this.CONFIDENCE_THRESHOLD) {
        contextualizedSolution = await this.getContextualizedSolution(
          matchingResults.bestMatch.template,
          extractedContext
        );

        // Step 5: Enhance with Perplexity research if solution found
        if (contextualizedSolution) {
          console.log('🔍 Enhancing solution with Perplexity research...');
          try {
            const enhancement = await perplexityEnhancer.enhanceWithCurrentResearch(
              contextualizedSolution,
              userStatement
            );
            
            contextualizedSolution = enhancement.updatedSolution;
            enhancedSolution = {
              researchBacking: enhancement.researchBacking,
              confidenceAdjustment: enhancement.confidenceAdjustment,
              currentExamples: enhancement.currentExamples,
              marketValidation: enhancement.marketValidation
            };
            
            console.log('✅ Perplexity enhancement completed:', {
              confidenceAdjustment: enhancement.confidenceAdjustment,
              researchSourcesCount: enhancement.researchBacking.length,
              currentExamplesCount: enhancement.currentExamples.length
            });
          } catch (error) {
            console.error('⚠️ Perplexity enhancement failed, continuing without:', error);
          }
        }

        // Update usage count for matched template
        await this.updateTemplateUsage(matchingResults.bestMatch.template.id);
      }

      const result: ProblemMatchResult = {
        matchedTemplate: matchingResults.bestMatch?.template || null,
        confidence: matchingResults.bestMatch?.confidence || 0,
        extractedContext,
        contextualizedSolution,
        enhancedSolution,
        alternativeMatches: matchingResults.alternatives
      };

      // Add fallback reason if confidence is too low
      if (!matchingResults.bestMatch || matchingResults.bestMatch.confidence < this.CONFIDENCE_THRESHOLD) {
        result.fallbackReason = this.generateFallbackReason(matchingResults.bestMatch?.confidence || 0);
      }

      console.log('✅ Problem statement interpretation completed:', {
        hasMatch: !!result.matchedTemplate,
        confidence: result.confidence,
        hasSolution: !!result.contextualizedSolution,
        hasEnhancement: !!result.enhancedSolution,
        hasFallback: !!result.fallbackReason
      });

      return result;

    } catch (error) {
      console.error('❌ Problem statement interpretation failed:', error);
      return {
        matchedTemplate: null,
        confidence: 0,
        extractedContext: this.getEmptyContext(),
        contextualizedSolution: null,
        fallbackReason: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Extract business context and emotional indicators using edge functions
   */
  private async extractBusinessContext(userStatement: string): Promise<ExtractedContext> {
    console.log('🧠 Extracting business context...');

    try {
      // Use Supabase edge function for AI context extraction
      const { data, error } = await supabase.functions.invoke('problem-context-extractor', {
        body: {
          userStatement,
          extractionType: 'business_context'
        }
      });

      if (error) {
        console.error('❌ Edge function context extraction failed:', error);
        return this.basicContextExtraction(userStatement);
      }

      if (data && data.context) {
        console.log('✅ Business context extracted via edge function:', data.context);
        return {
          urgency: data.context.urgency || 'medium',
          stakeholders: data.context.stakeholders || [],
          timeConstraints: data.context.timeConstraints || [],
          businessGoals: data.context.businessGoals || [],
          resourceConstraints: data.context.resourceConstraints || [],
          emotionalIndicators: data.context.emotionalIndicators || [],
          businessModel: data.context.businessModel,
          industry: data.context.industry,
          competitiveThreats: data.context.competitiveThreats || []
        };
      }

      // Fallback to basic extraction
      return this.basicContextExtraction(userStatement);

    } catch (error) {
      console.error('❌ Context extraction failed:', error);
      return this.basicContextExtraction(userStatement);
    }
  }

  /**
   * Load all problem statement templates from the database
   */
  private async loadProblemTemplates(): Promise<ProblemStatement[]> {
    console.log('📚 Loading problem statement templates from database...');

    const { data, error } = await supabase
      .from('problem_statements')
      .select('*')
      .order('usage_count', { ascending: false });

    if (error) {
      console.error('❌ Failed to load problem templates:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('✅ Problem templates loaded:', {
      count: data?.length || 0,
      categories: [...new Set(data?.map(t => t.category) || [])]
    });

    return data || [];
  }

  /**
   * Perform semantic matching using edge functions
   */
  private async performSemanticMatching(
    userStatement: string,
    context: ExtractedContext,
    templates: ProblemStatement[]
  ): Promise<{
    bestMatch: { template: ProblemStatement; confidence: number } | null;
    alternatives: Array<{ template: ProblemStatement; confidence: number; reason: string }>;
  }> {
    console.log('🎯 Performing semantic matching...');

    try {
      // Use Supabase edge function for semantic matching
      const { data, error } = await supabase.functions.invoke('problem-semantic-matcher', {
        body: {
          userStatement,
          extractedContext: context,
          templates: templates.map(t => ({
            id: t.id,
            statement: t.statement,
            category: t.category,
            implied_context: t.implied_context
          }))
        }
      });

      if (error || !data) {
        console.error('❌ Edge function semantic matching failed:', error);
        return this.fallbackKeywordMatching(userStatement, context, templates);
      }

      const matches = data.matches || [];
      
      // Sort by confidence and find best match
      const sortedMatches = matches
        .map((match: any) => {
          const template = templates.find(t => t.id === match.templateId);
          return template ? {
            template,
            confidence: match.confidence,
            reason: match.reasoning
          } : null;
        })
        .filter(Boolean)
        .sort((a: any, b: any) => b.confidence - a.confidence);

      const bestMatch = sortedMatches.length > 0 ? sortedMatches[0] : null;
      const alternatives = sortedMatches
        .slice(1)
        .filter((match: any) => match.confidence >= this.MIN_ALTERNATIVE_CONFIDENCE)
        .slice(0, 3); // Top 3 alternatives

      console.log('✅ Semantic matching completed via edge function:', {
        bestMatchConfidence: bestMatch?.confidence || 0,
        alternativeCount: alternatives.length,
        totalMatches: matches.length
      });

      return { bestMatch, alternatives };

    } catch (error) {
      console.error('❌ Semantic matching failed:', error);
      // Fallback to simple keyword matching
      return this.fallbackKeywordMatching(userStatement, context, templates);
    }
  }

  /**
   * Get contextualized solution for matched template
   */
  private async getContextualizedSolution(
    template: ProblemStatement,
    context: ExtractedContext
  ): Promise<ContextualSolution | null> {
    console.log('🎯 Getting contextualized solution for template:', template.id);

    const { data, error } = await supabase
      .from('contextual_solutions')
      .select('*')
      .contains('problem_statement_ids', [template.id])
      .order('success_rate', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('❌ Failed to load contextual solution:', error);
      return null;
    }

    console.log('✅ Contextualized solution loaded:', {
      title: data.title,
      successRate: data.success_rate
    });

    return data;
  }

  /**
   * Record match accuracy for continuous improvement
   */
  async recordMatchAccuracy(
    originalStatement: string,
    matchedTemplateId: string,
    userSatisfaction: number
  ): Promise<void> {
    console.log('📊 Recording match accuracy:', {
      templateId: matchedTemplateId,
      satisfaction: userSatisfaction
    });

    try {
      // Store in user_problem_statements table for analytics
      const { error } = await supabase
        .from('user_problem_statements')
        .insert({
          original_statement: originalStatement,
          matched_problem_statement_id: matchedTemplateId,
          satisfaction_score: userSatisfaction
        });

      if (error) {
        console.error('❌ Failed to record match accuracy:', error);
      } else {
        console.log('✅ Match accuracy recorded successfully');
      }

      // Update template usage count
      await this.updateTemplateUsage(matchedTemplateId);

    } catch (error) {
      console.error('❌ Error recording match accuracy:', error);
    }
  }

  /**
   * Update template usage count
   */
  private async updateTemplateUsage(templateId: string): Promise<void> {
    const { error } = await supabase
      .from('problem_statements')
      .update({ 
        usage_count: 1, // Will be updated properly via SQL
        last_updated: new Date().toISOString()
      })
      .eq('id', templateId);

    if (error) {
      console.error('❌ Failed to update template usage:', error);
    }
  }

  /**
   * Generate fallback reason for low confidence matches
   */
  private generateFallbackReason(confidence: number): string {
    if (confidence === 0) {
      return 'No similar problem patterns found in database. This appears to be a novel problem that may require custom analysis.';
    } else if (confidence < 0.3) {
      return 'Very low similarity to existing problem patterns. Consider traditional UX analysis approach.';
    } else if (confidence < 0.5) {
      return 'Moderate similarity found but not confident enough for template-based recommendations.';
    } else {
      return `Similarity detected (${(confidence * 100).toFixed(0)}%) but below confidence threshold for automated recommendations.`;
    }
  }

  /**
   * Basic keyword-based context extraction as fallback
   */
  private basicContextExtraction(userStatement: string): ExtractedContext {
    const statement = userStatement.toLowerCase();
    
    const urgencyKeywords = {
      critical: ['board meeting', 'black friday', 'quarter', 'deadline', 'asap', 'urgent'],
      high: ['dropping', 'losing', 'competitor', 'customers asking', 'sales down'],
      medium: ['wants', 'needs', 'should', 'redesign', 'improve'],
      low: ['thinking', 'considering', 'maybe', 'eventually']
    };

    let urgency: ExtractedContext['urgency'] = 'medium';
    for (const [level, keywords] of Object.entries(urgencyKeywords)) {
      if (keywords.some(keyword => statement.includes(keyword))) {
        urgency = level as ExtractedContext['urgency'];
        break;
      }
    }

    const stakeholders = [];
    if (statement.includes('ceo')) stakeholders.push('CEO');
    if (statement.includes('board')) stakeholders.push('board');
    if (statement.includes('customer')) stakeholders.push('customers');
    if (statement.includes('dev') || statement.includes('development')) stakeholders.push('development_team');

    return {
      urgency,
      stakeholders,
      timeConstraints: [],
      businessGoals: [],
      resourceConstraints: [],
      emotionalIndicators: []
    };
  }

  /**
   * Fallback keyword matching when edge functions fail
   */
  private fallbackKeywordMatching(
    userStatement: string,
    context: ExtractedContext,
    templates: ProblemStatement[]
  ): { bestMatch: { template: ProblemStatement; confidence: number } | null; alternatives: any[] } {
    console.log('🔄 Using fallback keyword matching...');

    const statement = userStatement.toLowerCase();
    const matches = templates.map(template => {
      let score = 0;
      const templateStatement = template.statement.toLowerCase();

      // Simple keyword overlap scoring
      const userWords = statement.split(' ').filter(w => w.length > 3);
      const templateWords = templateStatement.split(' ').filter(w => w.length > 3);
      const commonWords = userWords.filter(w => templateWords.some(tw => tw.includes(w) || w.includes(tw)));
      
      score += (commonWords.length / Math.max(userWords.length, templateWords.length)) * 0.5;

      // Category-specific keyword matching
      if (template.category === 'conversion_decline' && (statement.includes('signup') || statement.includes('conversion'))) {
        score += 0.3;
      }
      if (template.category === 'competitive_pressure' && statement.includes('competitor')) {
        score += 0.3;
      }
      if (template.category === 'technical_constraints' && (statement.includes('dev') || statement.includes('time'))) {
        score += 0.3;
      }

      return { template, confidence: Math.min(score, 0.9) };
    });

    const sortedMatches = matches
      .filter(m => m.confidence > 0.1)
      .sort((a, b) => b.confidence - a.confidence);

    return {
      bestMatch: sortedMatches.length > 0 ? sortedMatches[0] : null,
      alternatives: sortedMatches.slice(1, 4).map(m => ({ ...m, reason: 'Keyword similarity match' }))
    };
  }

  /**
   * Get empty context structure
   */
  private getEmptyContext(): ExtractedContext {
    return {
      urgency: 'medium',
      stakeholders: [],
      timeConstraints: [],
      businessGoals: [],
      resourceConstraints: [],
      emotionalIndicators: []
    };
  }
}

// Export default instance
export const intelligentProblemMatcher = new IntelligentProblemMatcher();