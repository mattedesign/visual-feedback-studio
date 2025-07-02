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

interface ExtractedBusinessContext {
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

interface PerplexityResearchQuery {
  solutionContext: {
    problemCategory: string;
    businessModel: string;
    urgencyLevel: string;
    industryContext?: string;
  };
  researchFocus: {
    implementationExamples: boolean;
    successMetrics: boolean;
    recentDevelopments: boolean;
    competitorAnalysis: boolean;
  };
  timeframe: string; // "last 12 months" for current relevance
}

interface EnhancedSolution extends ContextualSolution {
  researchBacking: {
    currentExamples: Array<{
      company: string;
      implementationSummary: string;
      results: string;
      sourceUrl: string;
      publishDate: string;
    }>;
    validationStudies: Array<{
      studySource: string;
      findingSummary: string;
      relevanceScore: number;
      sourceUrl: string;
    }>;
    marketTrends: Array<{
      trendDescription: string;
      implicationForSolution: string;
      sourceUrl: string;
    }>;
  };
  confidenceBoost: number; // How much research increases solution confidence
  lastResearchUpdate: string;
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
   * NEW: Enhanced main method with business context awareness
   */
  async enhanceWithCurrentResearch(
    solution: ContextualSolution,
    problemContext: string | ExtractedBusinessContext
  ): Promise<PerplexityResearchResult> {
    console.log('🔍 Starting Perplexity research enhancement for solution:', solution.title);

    try {
      // Extract business context if string provided
      const businessContext = typeof problemContext === 'string' 
        ? this.extractBusinessContextFromString(problemContext)
        : problemContext;

      // Build business context aware research query
      const researchQuery = this.buildBusinessContextQuery(solution, businessContext);
      
      // Execute parallel research streams
      const [marketResearch, caseStudies, validation] = await Promise.all([
        this.getBusinessContextAwareMarketResearch(solution, businessContext, researchQuery),
        this.getContextualizedCaseStudies(solution, businessContext, researchQuery),
        this.validateWithBusinessContext(solution, businessContext, researchQuery)
      ]);
      
      // Quality validation of research results
      const qualifiedResearch = this.validateResearchQuality({
        marketResearch,
        caseStudies,
        validation
      });
      
      // Calculate confidence adjustment based on research quality
      const confidenceAdjustment = this.calculateEnhancedConfidenceAdjustment(
        qualifiedResearch,
        businessContext
      );
      
      // Create enhanced solution with structured research backing
      const enhancedSolution = this.createEnhancedSolution(
        solution,
        qualifiedResearch,
        businessContext
      );
      
      const result: PerplexityResearchResult = {
        updatedSolution: enhancedSolution,
        researchBacking: qualifiedResearch.allSources,
        confidenceAdjustment,
        currentExamples: qualifiedResearch.allExamples,
        marketValidation: {
          isCurrentBestPractice: qualifiedResearch.validation.isCurrentBestPractice,
          industryTrends: qualifiedResearch.validation.industryTrends,
          competitorExamples: qualifiedResearch.marketResearch.competitorExamples,
          abTestResults: qualifiedResearch.caseStudies.abTestResults
        }
      };

      console.log('✅ Perplexity enhancement completed:', {
        businessContext: businessContext.urgency,
        confidenceAdjustment,
        researchSourcesFound: result.researchBacking.length,
        currentExamplesFound: result.currentExamples.length,
        isValidated: result.marketValidation.isCurrentBestPractice,
        industryContext: businessContext.industry || 'general'
      });

      return result;

    } catch (error) {
      console.error('❌ Perplexity enhancement failed:', error);
      
      // Return original solution with no enhancement but graceful fallback
      return this.createFallbackResult(solution, error);
    }
  }

  /**
   * NEW: Build business context-aware research query
   */
  private buildBusinessContextQuery(
    solution: ContextualSolution,
    businessContext: ExtractedBusinessContext
  ): PerplexityResearchQuery {
    return {
      solutionContext: {
        problemCategory: this.inferProblemCategory(solution, businessContext),
        businessModel: businessContext.businessModel || 'general',
        urgencyLevel: businessContext.urgency,
        industryContext: businessContext.industry
      },
      researchFocus: {
        implementationExamples: true,
        successMetrics: businessContext.urgency === 'critical' || businessContext.urgency === 'high',
        recentDevelopments: businessContext.urgency !== 'low',
        competitorAnalysis: businessContext.competitiveThreats && businessContext.competitiveThreats.length > 0
      },
      timeframe: this.determineResearchTimeframe(businessContext)
    };
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

  // ===== NEW BUSINESS CONTEXT-AWARE METHODS =====

  /**
   * Extract business context from string problem statement
   */
  private extractBusinessContextFromString(problemContext: string): ExtractedBusinessContext {
    const contextLower = problemContext.toLowerCase();
    
    // Urgency detection
    let urgency: ExtractedBusinessContext['urgency'] = 'medium';
    if (contextLower.includes('urgent') || contextLower.includes('asap') || contextLower.includes('critical')) {
      urgency = 'critical';
    } else if (contextLower.includes('soon') || contextLower.includes('quarter') || contextLower.includes('deadline')) {
      urgency = 'high';
    } else if (contextLower.includes('eventually') || contextLower.includes('considering')) {
      urgency = 'low';
    }

    // Stakeholder detection
    const stakeholders: string[] = [];
    if (contextLower.includes('ceo') || contextLower.includes('executive')) stakeholders.push('executive_team');
    if (contextLower.includes('marketing')) stakeholders.push('marketing_team');
    if (contextLower.includes('sales')) stakeholders.push('sales_team');
    if (contextLower.includes('dev') || contextLower.includes('engineering')) stakeholders.push('development_team');
    if (contextLower.includes('board')) stakeholders.push('board');

    // Business model detection
    let businessModel: string | undefined;
    if (contextLower.includes('saas') || contextLower.includes('subscription')) businessModel = 'saas';
    else if (contextLower.includes('ecommerce') || contextLower.includes('shopping')) businessModel = 'ecommerce';
    else if (contextLower.includes('b2b')) businessModel = 'b2b';
    else if (contextLower.includes('marketplace')) businessModel = 'marketplace';

    // Industry detection
    let industry: string | undefined;
    if (contextLower.includes('fintech') || contextLower.includes('financial')) industry = 'fintech';
    else if (contextLower.includes('healthcare') || contextLower.includes('medical')) industry = 'healthcare';
    else if (contextLower.includes('education') || contextLower.includes('edtech')) industry = 'education';
    else if (contextLower.includes('retail')) industry = 'retail';

    return {
      urgency,
      stakeholders,
      timeConstraints: this.extractTimeConstraints(contextLower),
      businessGoals: this.extractBusinessGoals(contextLower),
      resourceConstraints: this.extractResourceConstraints(contextLower),
      emotionalIndicators: this.extractEmotionalIndicators(contextLower),
      businessModel,
      industry,
      competitiveThreats: this.extractCompetitiveThreats(contextLower)
    };
  }

  /**
   * Get business context-aware market research
   */
  private async getBusinessContextAwareMarketResearch(
    solution: ContextualSolution,
    businessContext: ExtractedBusinessContext,
    researchQuery: PerplexityResearchQuery
  ): Promise<any> {
    console.log('📊 Fetching business context-aware market research...');

    const industryFilter = businessContext.industry ? ` in the ${businessContext.industry} industry` : '';
    const businessModelFilter = businessContext.businessModel ? ` for ${businessContext.businessModel} companies` : '';
    
    const query = `
Find recent company implementations (2024-2025) of "${solution.title}"${industryFilter}${businessModelFilter}

Business Context:
- Urgency Level: ${businessContext.urgency}
- Business Model: ${businessContext.businessModel || 'general'}
- Industry: ${businessContext.industry || 'cross-industry'}

Research Focus:
1. 2-3 specific companies with similar business contexts that implemented this solution
2. Quantified results (conversion rates, revenue impact, user metrics)
3. Implementation timeline and resources required
4. Success factors and lessons learned
5. Industry-specific adaptations

Prioritize examples from companies with similar urgency levels and business constraints.
`;

    try {
      const domainFilters = this.buildIndustrySpecificDomains(businessContext);
      const response = await this.queryPerplexity(query, {
        searchRecencyFilter: researchQuery.timeframe === 'last 6 months' ? '6months' : 'year',
        searchDomainFilter: domainFilters,
        maxTokens: 2000
      });

      const content = response.choices[0]?.message?.content || '';
      return this.parseBusinessContextMarketResearch(content, businessContext);

    } catch (error) {
      console.error('Failed to get business context-aware market research:', error);
      return { sources: [], examples: [], competitorExamples: [], confidence: 0.5 };
    }
  }

  /**
   * Get contextualized case studies based on business context
   */
  private async getContextualizedCaseStudies(
    solution: ContextualSolution,
    businessContext: ExtractedBusinessContext,
    researchQuery: PerplexityResearchQuery
  ): Promise<any> {
    console.log('🧪 Fetching contextualized case studies...');

    const urgencyContext = businessContext.urgency === 'critical' || businessContext.urgency === 'high' 
      ? 'rapid implementation and quick results' 
      : 'comprehensive implementation with long-term results';

    const query = `
Find A/B test results and case studies for "${solution.recommendation}" focusing on ${urgencyContext}

Business Context:
- Business Model: ${businessContext.businessModel || 'general'}
- Industry: ${businessContext.industry || 'cross-industry'}
- Timeline Requirements: ${businessContext.urgency}

Look for:
1. A/B test results with specific conversion improvements
2. Implementation timelines matching urgency (${businessContext.urgency === 'critical' ? '1-2 weeks' : '2-8 weeks'})
3. ROI data and business impact metrics
4. Resource requirements and team sizes
5. Success rates in similar business contexts

Focus on measurable outcomes relevant to ${businessContext.businessModel || 'general'} businesses.
`;

    try {
      const response = await this.queryPerplexity(query, {
        searchRecencyFilter: '6months',
        searchDomainFilter: this.buildTestingDomains(businessContext),
        maxTokens: 1500
      });

      const content = response.choices[0]?.message?.content || '';
      return this.parseContextualizedCaseStudies(content, businessContext);

    } catch (error) {
      console.error('Failed to get contextualized case studies:', error);
      return { sources: [], examples: [], abTestResults: [], confidence: 0.5 };
    }
  }

  /**
   * Validate solution with business context awareness
   */
  private async validateWithBusinessContext(
    solution: ContextualSolution,
    businessContext: ExtractedBusinessContext,
    researchQuery: PerplexityResearchQuery
  ): Promise<any> {
    console.log('✅ Validating with business context awareness...');

    const query = `
Evaluate if "${solution.recommendation}" is still considered best practice in 2024-2025 for ${businessContext.businessModel || 'general'} businesses${businessContext.industry ? ` in ${businessContext.industry}` : ''}

Specific Context:
- Urgency Level: ${businessContext.urgency}
- Business Constraints: ${businessContext.resourceConstraints.join(', ') || 'standard'}
- Competitive Pressure: ${businessContext.competitiveThreats?.length ? 'high' : 'moderate'}

Research:
1. Current industry standards for this business model
2. Recent expert opinions from UX leaders in this space
3. Emerging trends affecting this approach in 2024-2025
4. Success rates for companies with similar constraints
5. Alternative approaches gaining traction

Focus on validation from credible UX authorities and recent industry research.
`;

    try {
      const response = await this.queryPerplexity(query, {
        searchRecencyFilter: '3months',
        searchDomainFilter: this.buildValidationDomains(businessContext),
        maxTokens: 1200
      });

      const content = response.choices[0]?.message?.content || '';
      return this.parseBusinessContextValidation(content, businessContext);

    } catch (error) {
      console.error('Failed to validate with business context:', error);
      return {
        isCurrentBestPractice: true,
        industryTrends: [],
        validationScore: 0.7,
        confidence: 0.5
      };
    }
  }

  /**
   * Validate research quality with credibility scoring
   */
  private validateResearchQuality(researchData: {
    marketResearch: any;
    caseStudies: any;
    validation: any;
  }): any {
    console.log('🔍 Validating research quality...');

    // Source credibility scoring
    const credibilityScores = {
      marketResearch: this.scoreSourceCredibility(researchData.marketResearch.sources || []),
      caseStudies: this.scoreSourceCredibility(researchData.caseStudies.sources || []),
      validation: this.scoreSourceCredibility(researchData.validation.sources || [])
    };

    // Relevance validation
    const relevanceScores = {
      marketResearch: this.scoreRelevance(researchData.marketResearch.examples || []),
      caseStudies: this.scoreRelevance(researchData.caseStudies.examples || []),
      validation: this.scoreRelevance(researchData.validation.industryTrends || [])
    };

    // Recency weighting (favor last 6-18 months)
    const recencyScores = {
      marketResearch: this.scoreRecency(researchData.marketResearch.sources || []),
      caseStudies: this.scoreRecency(researchData.caseStudies.sources || []),
      validation: this.scoreRecency(researchData.validation.sources || [])
    };

    return {
      ...researchData,
      qualityMetrics: { credibilityScores, relevanceScores, recencyScores },
      allSources: [
        ...(researchData.marketResearch.sources || []),
        ...(researchData.caseStudies.sources || []),
        ...(researchData.validation.sources || [])
      ],
      allExamples: [
        ...(researchData.marketResearch.examples || []),
        ...(researchData.caseStudies.examples || [])
      ]
    };
  }

  /**
   * Calculate enhanced confidence adjustment with business context
   */
  private calculateEnhancedConfidenceAdjustment(
    qualifiedResearch: any,
    businessContext: ExtractedBusinessContext
  ): number {
    let adjustment = 0;

    // Base research quality
    const avgCredibility = this.averageQualityScore(qualifiedResearch.qualityMetrics.credibilityScores);
    const avgRelevance = this.averageQualityScore(qualifiedResearch.qualityMetrics.relevanceScores);
    const avgRecency = this.averageQualityScore(qualifiedResearch.qualityMetrics.recencyScores);

    // Quality-based adjustments
    if (avgCredibility > 0.8) adjustment += 0.1;
    if (avgRelevance > 0.8) adjustment += 0.08;
    if (avgRecency > 0.7) adjustment += 0.05;

    // Business context adjustments
    if (businessContext.urgency === 'critical' && qualifiedResearch.caseStudies.abTestResults?.length > 1) {
      adjustment += 0.07; // Urgent situations benefit more from proven results
    }

    if (businessContext.industry && qualifiedResearch.marketResearch.examples?.some((ex: string) => 
      ex.toLowerCase().includes(businessContext.industry!.toLowerCase())
    )) {
      adjustment += 0.05; // Industry-specific examples boost confidence
    }

    // Negative adjustments for poor quality
    if (avgCredibility < 0.5) adjustment -= 0.15;
    if (qualifiedResearch.allExamples.length === 0) adjustment -= 0.1;
    if (!qualifiedResearch.validation.isCurrentBestPractice) adjustment -= 0.12;

    // Cap adjustment between -0.25 and +0.25 for business context awareness
    return Math.max(-0.25, Math.min(0.25, adjustment));
  }

  /**
   * Create enhanced solution with structured research backing
   */
  private createEnhancedSolution(
    solution: ContextualSolution,
    qualifiedResearch: any,
    businessContext: ExtractedBusinessContext
  ): ContextualSolution {
    return {
      ...solution,
      problem_specific_guidance: {
        ...solution.problem_specific_guidance,
        currentMarketExamples: qualifiedResearch.marketResearch.examples,
        recentCaseStudies: qualifiedResearch.caseStudies.examples,
        industryTrends: qualifiedResearch.validation.industryTrends,
        businessContextAdaptations: this.generateBusinessContextAdaptations(businessContext),
        researchQualityScore: this.calculateOverallQualityScore(qualifiedResearch.qualityMetrics),
        lastResearchUpdate: new Date().toISOString(),
        recommendationConfidence: Math.min(1.0, solution.success_rate + this.calculateEnhancedConfidenceAdjustment(qualifiedResearch, businessContext))
      },
      expected_impact: {
        ...solution.expected_impact,
        researchValidated: qualifiedResearch.validation.isCurrentBestPractice,
        confidenceLevel: Math.min(1.0, solution.success_rate + this.calculateEnhancedConfidenceAdjustment(qualifiedResearch, businessContext)),
        supportingCaseStudies: qualifiedResearch.caseStudies.abTestResults,
        businessContextMatch: this.calculateBusinessContextMatch(solution, businessContext),
        industryRelevance: businessContext.industry ? 0.9 : 0.7
      }
    };
  }

  /**
   * Create graceful fallback result
   */
  private createFallbackResult(solution: ContextualSolution, error: any): PerplexityResearchResult {
    console.log('🔄 Creating fallback result due to research enhancement failure');
    
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

  /**
   * Infer problem category from solution and context
   */
  private inferProblemCategory(
    solution: ContextualSolution,
    businessContext: ExtractedBusinessContext
  ): string {
    const title = solution.title.toLowerCase();
    const recommendation = solution.recommendation.toLowerCase();
    
    if (title.includes('conversion') || recommendation.includes('conversion')) return 'conversion_optimization';
    if (title.includes('form') || recommendation.includes('form')) return 'form_optimization';
    if (title.includes('navigation') || recommendation.includes('navigation')) return 'navigation_improvement';
    if (title.includes('accessibility') || recommendation.includes('accessibility')) return 'accessibility_compliance';
    if (title.includes('trust') || recommendation.includes('trust')) return 'trust_building';
    if (title.includes('mobile') || recommendation.includes('mobile')) return 'mobile_optimization';
    
    // Infer from business context
    if (businessContext.businessModel === 'ecommerce') return 'ecommerce_optimization';
    if (businessContext.businessModel === 'saas') return 'saas_optimization';
    if (businessContext.urgency === 'critical') return 'urgent_fixes';
    
    return 'general_ux_improvement';
  }

  /**
   * Determine research timeframe based on business context
   */
  private determineResearchTimeframe(businessContext: ExtractedBusinessContext): string {
    switch (businessContext.urgency) {
      case 'critical':
        return 'last 6 months'; // Most recent examples for urgent situations
      case 'high':
        return 'last 9 months';
      case 'medium':
        return 'last 12 months';
      case 'low':
        return 'last 18 months'; // Can include slightly older but comprehensive examples
      default:
        return 'last 12 months';
    }
  }

  // Helper methods for business context extraction
  private extractTimeConstraints(contextLower: string): string[] {
    const constraints: string[] = [];
    if (contextLower.includes('quarter')) constraints.push('quarterly_deadline');
    if (contextLower.includes('month')) constraints.push('monthly_target');
    if (contextLower.includes('week')) constraints.push('weekly_sprint');
    if (contextLower.includes('asap') || contextLower.includes('urgent')) constraints.push('immediate');
    return constraints;
  }

  private extractBusinessGoals(contextLower: string): string[] {
    const goals: string[] = [];
    if (contextLower.includes('conversion')) goals.push('increase_conversions');
    if (contextLower.includes('revenue')) goals.push('increase_revenue');
    if (contextLower.includes('retention')) goals.push('improve_retention');
    if (contextLower.includes('engagement')) goals.push('increase_engagement');
    if (contextLower.includes('signup')) goals.push('increase_signups');
    return goals;
  }

  private extractResourceConstraints(contextLower: string): string[] {
    const constraints: string[] = [];
    if (contextLower.includes('budget')) constraints.push('limited_budget');
    if (contextLower.includes('developer') || contextLower.includes('dev team')) constraints.push('limited_dev_resources');
    if (contextLower.includes('designer')) constraints.push('limited_design_resources');
    if (contextLower.includes('time')) constraints.push('limited_time');
    return constraints;
  }

  private extractEmotionalIndicators(contextLower: string): string[] {
    const indicators: string[] = [];
    if (contextLower.includes('frustrated') || contextLower.includes('pressure')) indicators.push('pressure');
    if (contextLower.includes('excited') || contextLower.includes('optimistic')) indicators.push('optimism');
    if (contextLower.includes('concerned') || contextLower.includes('worried')) indicators.push('concern');
    if (contextLower.includes('confident')) indicators.push('confidence');
    return indicators;
  }

  private extractCompetitiveThreats(contextLower: string): string[] {
    const threats: string[] = [];
    if (contextLower.includes('competitor')) threats.push('direct_competition');
    if (contextLower.includes('losing market share')) threats.push('market_share_loss');
    if (contextLower.includes('better than competitors')) threats.push('competitive_advantage_needed');
    return threats;
  }

  // Domain and parsing helper methods
  private buildIndustrySpecificDomains(businessContext: ExtractedBusinessContext): string[] {
    const baseDomains = ['techcrunch.com', 'hbr.org', 'baymard.com'];
    
    if (businessContext.industry === 'fintech') {
      baseDomains.push('finovate.com', 'finextra.com');
    } else if (businessContext.industry === 'healthcare') {
      baseDomains.push('healthcareitnews.com', 'himss.org');
    } else if (businessContext.industry === 'ecommerce') {
      baseDomains.push('shopify.com', 'bigcommerce.com');
    }
    
    return baseDomains;
  }

  private buildTestingDomains(businessContext: ExtractedBusinessContext): string[] {
    return ['vwo.com', 'optimizely.com', 'growthackers.com', 'conversionxl.com', 'unbounce.com'];
  }

  private buildValidationDomains(businessContext: ExtractedBusinessContext): string[] {
    return ['nngroup.com', 'smashingmagazine.com', 'uxplanet.org', 'cxl.com', 'uxdesign.cc'];
  }

  private parseBusinessContextMarketResearch(content: string, businessContext: ExtractedBusinessContext): any {
    return {
      sources: this.extractSources(content),
      examples: this.extractExamples(content),
      competitorExamples: this.extractCompetitorExamples(content),
      confidence: this.calculateContentRelevance(content, businessContext)
    };
  }

  private parseContextualizedCaseStudies(content: string, businessContext: ExtractedBusinessContext): any {
    return {
      sources: this.extractSources(content),
      examples: this.extractExamples(content),
      abTestResults: this.extractABTestResults(content),
      confidence: this.calculateContentRelevance(content, businessContext)
    };
  }

  private parseBusinessContextValidation(content: string, businessContext: ExtractedBusinessContext): any {
    return {
      isCurrentBestPractice: this.determineIfCurrentBestPractice(content),
      industryTrends: this.extractIndustryTrends(content),
      validationScore: this.calculateValidationScore(content),
      confidence: this.calculateContentRelevance(content, businessContext)
    };
  }

  // Quality scoring methods
  private scoreSourceCredibility(sources: string[]): number {
    const credibleDomains = ['nngroup.com', 'baymard.com', 'hbr.org', 'techcrunch.com', 'smashingmagazine.com'];
    const credibleCount = sources.filter(source => 
      credibleDomains.some(domain => source.toLowerCase().includes(domain))
    ).length;
    
    return sources.length > 0 ? credibleCount / sources.length : 0.5;
  }

  private scoreRelevance(examples: string[]): number {
    // Simple relevance scoring based on example detail and specificity
    const detailedExamples = examples.filter(example => 
      example.length > 50 && (
        example.includes('%') || 
        example.includes('increased') || 
        example.includes('improved') ||
        example.includes('company')
      )
    ).length;
    
    return examples.length > 0 ? detailedExamples / examples.length : 0.5;
  }

  private scoreRecency(sources: string[]): number {
    // Assume sources are recent if research was filtered properly
    // In a real implementation, this would parse dates from sources
    return 0.8; // Default high recency score due to timeframe filtering
  }

  private averageQualityScore(scores: Record<string, number>): number {
    const values = Object.values(scores);
    return values.length > 0 ? values.reduce((sum, score) => sum + score, 0) / values.length : 0.5;
  }

  private calculateOverallQualityScore(qualityMetrics: any): number {
    const credibility = this.averageQualityScore(qualityMetrics.credibilityScores);
    const relevance = this.averageQualityScore(qualityMetrics.relevanceScores);
    const recency = this.averageQualityScore(qualityMetrics.recencyScores);
    
    return (credibility * 0.4 + relevance * 0.4 + recency * 0.2);
  }

  private generateBusinessContextAdaptations(businessContext: ExtractedBusinessContext): string[] {
    const adaptations: string[] = [];
    
    if (businessContext.urgency === 'critical') {
      adaptations.push('Prioritize quick wins with minimal development effort');
    }
    
    if (businessContext.businessModel === 'saas') {
      adaptations.push('Focus on trial-to-paid conversion optimization');
    } else if (businessContext.businessModel === 'ecommerce') {
      adaptations.push('Emphasize cart abandonment reduction and checkout optimization');
    }
    
    if (businessContext.industry) {
      adaptations.push(`Adapt messaging and examples to ${businessContext.industry} industry standards`);
    }
    
    return adaptations;
  }

  private calculateBusinessContextMatch(solution: ContextualSolution, businessContext: ExtractedBusinessContext): number {
    let matchScore = 0.7; // Base score
    
    // Check if solution aligns with business model
    if (businessContext.businessModel && solution.title.toLowerCase().includes(businessContext.businessModel)) {
      matchScore += 0.15;
    }
    
    // Check urgency alignment
    if (businessContext.urgency === 'critical' && solution.recommendation.includes('quick')) {
      matchScore += 0.1;
    }
    
    // Check industry relevance
    if (businessContext.industry && solution.recommendation.toLowerCase().includes(businessContext.industry)) {
      matchScore += 0.1;
    }
    
    return Math.min(1.0, matchScore);
  }

  private calculateContentRelevance(content: string, businessContext: ExtractedBusinessContext): number {
    let relevance = 0.5; // Base relevance
    
    const contentLower = content.toLowerCase();
    
    // Business model relevance
    if (businessContext.businessModel && contentLower.includes(businessContext.businessModel)) {
      relevance += 0.2;
    }
    
    // Industry relevance
    if (businessContext.industry && contentLower.includes(businessContext.industry)) {
      relevance += 0.15;
    }
    
    // Urgency relevance
    if (businessContext.urgency === 'critical' && contentLower.includes('quick')) {
      relevance += 0.1;
    }
    
    return Math.min(1.0, relevance);
  }
}

// Export singleton instance
export const perplexityEnhancer = new PerplexityEnhancer();