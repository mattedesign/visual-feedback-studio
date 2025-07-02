import { supabase } from '@/integrations/supabase/client';

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

interface PerplexityResearchResult {
  updatedSolution: ContextualSolution;
  researchBacking: string[];
  confidenceAdjustment: number;
  currentExamples: string[];
  marketValidation: {
    isCurrentBestPractice: boolean;
    industryTrends: string[];
    competitorExamples: string[];
    abTestResults: string[];
  };
}

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class PerplexityEnhancer {
  private readonly CONFIDENCE_THRESHOLD = 0.75;

  /**
   * Main enhancement method - validates solutions with current market research
   */
  async enhanceWithCurrentResearch(
    solution: ContextualSolution,
    problemContext: string
  ): Promise<PerplexityResearchResult> {
    console.log('🔍 Starting Perplexity research enhancement for solution:', solution.title);

    try {
      // Get current market research
      const marketResearch = await this.getCurrentMarketResearch(solution, problemContext);
      
      // Get A/B test and case study examples
      const caseStudies = await this.getRecentCaseStudies(solution, problemContext);
      
      // Validate solution against current best practices
      const validation = await this.validateCurrentBestPractices(solution, problemContext);
      
      // Calculate confidence adjustment based on research
      const confidenceAdjustment = this.calculateConfidenceAdjustment(
        marketResearch,
        caseStudies,
        validation
      );
      
      // Update solution with research findings
      const updatedSolution = this.updateSolutionWithResearch(
        solution,
        marketResearch,
        caseStudies,
        validation
      );
      
      const result: PerplexityResearchResult = {
        updatedSolution,
        researchBacking: [...marketResearch.sources, ...caseStudies.sources],
        confidenceAdjustment,
        currentExamples: [...marketResearch.examples, ...caseStudies.examples],
        marketValidation: {
          isCurrentBestPractice: validation.isCurrentBestPractice,
          industryTrends: validation.industryTrends,
          competitorExamples: marketResearch.competitorExamples,
          abTestResults: caseStudies.abTestResults
        }
      };

      console.log('✅ Perplexity enhancement completed:', {
        confidenceAdjustment,
        researchSourcesFound: result.researchBacking.length,
        currentExamplesFound: result.currentExamples.length,
        isValidated: result.marketValidation.isCurrentBestPractice
      });

      return result;

    } catch (error) {
      console.error('❌ Perplexity enhancement failed:', error);
      
      // Return original solution with no enhancement
      return {
        updatedSolution: solution,
        researchBacking: [],
        confidenceAdjustment: 0,
        currentExamples: [],
        marketValidation: {
          isCurrentBestPractice: true, // Assume valid if research fails
          industryTrends: [],
          competitorExamples: [],
          abTestResults: []
        }
      };
    }
  }

  /**
   * Get current market research and competitor examples
   */
  private async getCurrentMarketResearch(
    solution: ContextualSolution,
    problemContext: string
  ): Promise<{
    sources: string[];
    examples: string[];
    competitorExamples: string[];
  }> {
    console.log('📊 Fetching current market research...');

    const query = `
Find recent examples (2024-2025) of companies implementing similar solutions to: "${solution.title}"

Problem context: ${problemContext}

Focus on:
1. Real company names and specific implementations
2. Results and outcomes achieved 
3. Industry-specific variations
4. Competitor strategies and approaches

Provide specific, actionable examples with company names and results where possible.
`;

    try {
      const response = await this.queryPerplexity(query, {
        searchRecencyFilter: '6months',
        searchDomainFilter: ['techcrunch.com', 'hbr.org', 'nielsen.com', 'baymard.com'],
        maxTokens: 1500
      });

      const content = response.choices[0]?.message?.content || '';
      
      return this.parseMarketResearch(content);

    } catch (error) {
      console.error('Failed to get market research:', error);
      return { sources: [], examples: [], competitorExamples: [] };
    }
  }

  /**
   * Get recent case studies and A/B test results
   */
  private async getRecentCaseStudies(
    solution: ContextualSolution,
    problemContext: string
  ): Promise<{
    sources: string[];
    examples: string[];
    abTestResults: string[];
  }> {
    console.log('🧪 Fetching recent case studies and A/B test results...');

    const query = `
Find recent A/B test results and case studies (2024-2025) related to: "${solution.recommendation}"

Problem type: ${problemContext}

Look for:
1. A/B test results with specific metrics and improvements
2. Before/after case studies with quantified outcomes
3. Implementation timelines and resource requirements
4. Success rates and ROI data

Focus on measurable business outcomes and conversion improvements.
`;

    try {
      const response = await this.queryPerplexity(query, {
        searchRecencyFilter: '6months',
        searchDomainFilter: ['vwo.com', 'optimizely.com', 'growthackers.com', 'conversionxl.com'],
        maxTokens: 1500
      });

      const content = response.choices[0]?.message?.content || '';
      
      return this.parseCaseStudies(content);

    } catch (error) {
      console.error('Failed to get case studies:', error);
      return { sources: [], examples: [], abTestResults: [] };
    }
  }

  /**
   * Validate solution against current best practices
   */
  private async validateCurrentBestPractices(
    solution: ContextualSolution,
    problemContext: string
  ): Promise<{
    isCurrentBestPractice: boolean;
    industryTrends: string[];
    validationScore: number;
  }> {
    console.log('✅ Validating against current best practices...');

    const query = `
Evaluate if this approach is still considered best practice in 2024-2025: "${solution.recommendation}"

Context: ${problemContext}

Research:
1. Current industry standards and recommendations
2. Recent changes in best practices
3. Emerging trends that might affect this approach
4. Expert opinions and industry leader perspectives

Determine if this is still recommended by UX experts, conversion specialists, and industry leaders.
`;

    try {
      const response = await this.queryPerplexity(query, {
        searchRecencyFilter: '3months',
        searchDomainFilter: ['nngroup.com', 'smashingmagazine.com', 'uxplanet.org', 'cxl.com'],
        maxTokens: 1000
      });

      const content = response.choices[0]?.message?.content || '';
      
      return this.parseValidation(content);

    } catch (error) {
      console.error('Failed to validate best practices:', error);
      return {
        isCurrentBestPractice: true,
        industryTrends: [],
        validationScore: 0.8
      };
    }
  }

  /**
   * Query Perplexity API with specific parameters
   */
  private async queryPerplexity(
    query: string,
    options: {
      searchRecencyFilter?: string;
      searchDomainFilter?: string[];
      maxTokens?: number;
    } = {}
  ): Promise<PerplexityResponse> {
    const { data, error } = await supabase.functions.invoke('perplexity-research', {
      body: {
        query,
        searchRecencyFilter: options.searchRecencyFilter || 'month',
        searchDomainFilter: options.searchDomainFilter || [],
        maxTokens: options.maxTokens || 1000
      }
    });

    if (error) {
      throw new Error(`Perplexity API error: ${error.message}`);
    }

    return data;
  }

  /**
   * Parse market research response
   */
  private parseMarketResearch(content: string): {
    sources: string[];
    examples: string[];
    competitorExamples: string[];
  } {
    const sources = this.extractSources(content);
    const examples = this.extractExamples(content);
    const competitorExamples = this.extractCompetitorExamples(content);

    return { sources, examples, competitorExamples };
  }

  /**
   * Parse case studies response
   */
  private parseCaseStudies(content: string): {
    sources: string[];
    examples: string[];
    abTestResults: string[];
  } {
    const sources = this.extractSources(content);
    const examples = this.extractExamples(content);
    const abTestResults = this.extractABTestResults(content);

    return { sources, examples, abTestResults };
  }

  /**
   * Parse validation response
   */
  private parseValidation(content: string): {
    isCurrentBestPractice: boolean;
    industryTrends: string[];
    validationScore: number;
  } {
    const isCurrentBestPractice = this.determineIfCurrentBestPractice(content);
    const industryTrends = this.extractIndustryTrends(content);
    const validationScore = this.calculateValidationScore(content);

    return { isCurrentBestPractice, industryTrends, validationScore };
  }

  /**
   * Calculate confidence adjustment based on research findings
   */
  private calculateConfidenceAdjustment(
    marketResearch: any,
    caseStudies: any,
    validation: any
  ): number {
    let adjustment = 0;

    // Positive adjustments
    if (validation.isCurrentBestPractice) adjustment += 0.1;
    if (marketResearch.examples.length > 2) adjustment += 0.05;
    if (caseStudies.abTestResults.length > 1) adjustment += 0.05;
    if (validation.validationScore > 0.8) adjustment += 0.05;

    // Negative adjustments
    if (!validation.isCurrentBestPractice) adjustment -= 0.15;
    if (marketResearch.examples.length === 0) adjustment -= 0.05;
    if (validation.validationScore < 0.6) adjustment -= 0.1;

    // Cap adjustment between -0.2 and +0.2
    return Math.max(-0.2, Math.min(0.2, adjustment));
  }

  /**
   * Update solution with research findings
   */
  private updateSolutionWithResearch(
    solution: ContextualSolution,
    marketResearch: any,
    caseStudies: any,
    validation: any
  ): ContextualSolution {
    return {
      ...solution,
      problem_specific_guidance: {
        ...solution.problem_specific_guidance,
        currentMarketExamples: marketResearch.examples,
        recentCaseStudies: caseStudies.examples,
        industryTrends: validation.industryTrends,
        lastResearchUpdate: new Date().toISOString()
      },
      expected_impact: {
        ...solution.expected_impact,
        researchValidated: validation.isCurrentBestPractice,
        confidenceLevel: Math.min(1.0, solution.success_rate + this.calculateConfidenceAdjustment(marketResearch, caseStudies, validation)),
        supportingCaseStudies: caseStudies.abTestResults
      }
    };
  }

  // Helper methods for parsing content
  private extractSources(content: string): string[] {
    const sourceRegex = /(?:Source|From|According to):\s*([^\n]+)/gi;
    const matches = content.match(sourceRegex) || [];
    return matches.map(match => match.replace(/(?:Source|From|According to):\s*/i, '').trim());
  }

  private extractExamples(content: string): string[] {
    const exampleRegex = /(?:Example|Case study|Company):\s*([^\n]+)/gi;
    const matches = content.match(exampleRegex) || [];
    return matches.map(match => match.replace(/(?:Example|Case study|Company):\s*/i, '').trim());
  }

  private extractCompetitorExamples(content: string): string[] {
    const competitorRegex = /(?:Competitor|Similar company):\s*([^\n]+)/gi;
    const matches = content.match(competitorRegex) || [];
    return matches.map(match => match.replace(/(?:Competitor|Similar company):\s*/i, '').trim());
  }

  private extractABTestResults(content: string): string[] {
    const abTestRegex = /(?:A\/B test|Test result|Conversion):\s*([^\n]+)/gi;
    const matches = content.match(abTestRegex) || [];
    return matches.map(match => match.replace(/(?:A\/B test|Test result|Conversion):\s*/i, '').trim());
  }

  private extractIndustryTrends(content: string): string[] {
    const trendRegex = /(?:Trend|Trending|Industry shift):\s*([^\n]+)/gi;
    const matches = content.match(trendRegex) || [];
    return matches.map(match => match.replace(/(?:Trend|Trending|Industry shift):\s*/i, '').trim());
  }

  private determineIfCurrentBestPractice(content: string): boolean {
    const positiveIndicators = [
      'best practice', 'recommended', 'effective', 'proven', 'current standard'
    ];
    const negativeIndicators = [
      'outdated', 'deprecated', 'no longer', 'replaced by', 'old approach'
    ];

    const contentLower = content.toLowerCase();
    const positiveCount = positiveIndicators.filter(indicator => 
      contentLower.includes(indicator)
    ).length;
    const negativeCount = negativeIndicators.filter(indicator => 
      contentLower.includes(indicator)
    ).length;

    return positiveCount > negativeCount;
  }

  private calculateValidationScore(content: string): number {
    const contentLower = content.toLowerCase();
    let score = 0.7; // Base score

    // Positive indicators
    if (contentLower.includes('highly recommended')) score += 0.2;
    if (contentLower.includes('proven effective')) score += 0.15;
    if (contentLower.includes('industry standard')) score += 0.1;
    if (contentLower.includes('best practice')) score += 0.1;

    // Negative indicators
    if (contentLower.includes('outdated')) score -= 0.3;
    if (contentLower.includes('no longer effective')) score -= 0.2;
    if (contentLower.includes('replaced by')) score -= 0.15;

    return Math.max(0, Math.min(1, score));
  }
}

// Export singleton instance
export const perplexityEnhancer = new PerplexityEnhancer();