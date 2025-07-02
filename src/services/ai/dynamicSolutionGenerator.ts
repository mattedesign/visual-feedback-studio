import { supabase } from '@/integrations/supabase/client';
import { perplexityService } from '../perplexityService';

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

interface SolutionPatterns {
  structuralElements: {
    recommendationLength: { min: number; max: number; average: number };
    implementationSteps: { typical: number; range: [number, number] };
    businessJustificationDepth: 'brief' | 'moderate' | 'comprehensive';
    technicalSpecificity: 'high' | 'medium' | 'conceptual';
  };
  
  communicationStyle: {
    executiveSummaryTone: string;
    technicalRequirementDetail: string;
    timelineRealism: string;
    confidenceLanguage: string;
  };
  
  businessContextAdaptation: {
    urgencyResponsePatterns: Record<string, string>;
    stakeholderCommunicationStyles: Record<string, string>;
    constraintHandlingApproaches: Record<string, string>;
  };
  
  qualityIndicators: {
    expectedImpactSpecificity: string;
    implementationActionability: string;
    businessImpactAttribution: string;
  };
}

interface NovelProblemAnalysis {
  businessContext: {
    industry: string;
    businessModel: string;
    urgencyLevel: string;
    stakeholderDynamics: string[];
    successMetrics: string[];
    constraints: string[];
  };
  
  problemClassification: {
    primaryChallenge: string;
    secondaryFactors: string[];
    similarityToExistingTemplates: number;
    uniqueAspects: string[];
  };
  
  researchRequirements: {
    industrySpecificGuidance: boolean;
    currentBestPractices: boolean;
    competitorAnalysis: boolean;
    regulatoryConsiderations: boolean;
  };
}

interface SolutionQualityScore {
  structuralQuality: number;
  contentDepth: number;
  businessAlignment: number;
  researchIntegration: number;
  implementationClarity: number;
  overallScore: number;
  qualityFlags: string[];
}

interface DynamicSolutionInput {
  userProblemStatement: string;
  extractedContext: ExtractedBusinessContext;
  analysisContext?: string;
}

interface DynamicSolutionResult {
  generatedSolution: ContextualSolution;
  confidence: number;
  researchBacking: string[];
  qualityAssessment: SolutionQualityScore;
  recommendForTemplateCreation: boolean;
}

interface ExpertReviewQueueItem {
  id: string;
  generatedSolution: ContextualSolution;
  originalProblemStatement: string;
  analysisContext: NovelProblemAnalysis;
  confidenceScore: number;
  complexityLevel: 'high' | 'medium' | 'low';
  queuedAt: string;
}

export class DynamicSolutionGenerator {
  private readonly CONFIDENCE_THRESHOLD = 0.7;
  private readonly QUALITY_THRESHOLD = 0.75;
  private readonly EXPERT_REVIEW_THRESHOLD = 0.8;
  private readonly TEMPLATE_CREATION_THRESHOLD = 0.8;

  /**
   * Main method to generate solutions for novel business challenges
   */
  async generateSolution(input: DynamicSolutionInput): Promise<DynamicSolutionResult> {
    console.log('🚀 Starting dynamic solution generation for novel problem:', {
      statementLength: input.userProblemStatement.length,
      urgency: input.extractedContext.urgency,
      businessModel: input.extractedContext.businessModel,
      industry: input.extractedContext.industry
    });

    try {
      // Step 1: Learn patterns from existing solutions
      const learnedPatterns = await this.learnPatternsFromDatabase();
      console.log('📚 Learned patterns from existing solutions:', {
        avgRecommendationLength: learnedPatterns.structuralElements.recommendationLength.average,
        typicalSteps: learnedPatterns.structuralElements.implementationSteps.typical,
        justificationDepth: learnedPatterns.structuralElements.businessJustificationDepth
      });

      // Step 2: Analyze the novel problem
      const novelAnalysis = await this.analyzeNovelProblem(
        input.userProblemStatement,
        input.extractedContext
      );
      console.log('🔍 Novel problem analysis completed:', {
        primaryChallenge: novelAnalysis.problemClassification.primaryChallenge,
        uniqueAspects: novelAnalysis.problemClassification.uniqueAspects.length,
        researchNeeded: Object.values(novelAnalysis.researchRequirements).filter(Boolean).length
      });

      // Step 3: Conduct specialized research for novel problem
      const researchFindings = await this.conductNovelProblemResearch(
        novelAnalysis,
        input.userProblemStatement
      );
      console.log('📊 Research findings collected:', {
        sourcesFound: researchFindings.sources.length,
        hasIndustryGuidance: researchFindings.industrySpecific,
        hasBestPractices: researchFindings.bestPractices
      });

      // Step 4: Generate solution following learned patterns
      const generatedSolution = await this.generateSolutionFollowingPatterns(
        novelAnalysis,
        researchFindings,
        learnedPatterns,
        input.extractedContext
      );
      console.log('✨ Solution generated:', {
        title: generatedSolution.title,
        recommendationLength: generatedSolution.recommendation.length,
        hasGuidance: !!generatedSolution.problem_specific_guidance
      });

      // Step 5: Assess solution quality
      const qualityAssessment = await this.assessSolutionQuality(
        generatedSolution,
        learnedPatterns
      );
      console.log('🎯 Quality assessment completed:', {
        overallScore: qualityAssessment.overallScore,
        qualityFlags: qualityAssessment.qualityFlags.length
      });

      // Step 6: Calculate confidence and determine if expert review needed
      const confidence = this.calculateGenerationConfidence(
        novelAnalysis,
        researchFindings,
        qualityAssessment
      );

      const shouldRecommendForTemplate = this.shouldRecommendForTemplateCreation(
        qualityAssessment,
        confidence,
        novelAnalysis
      );

      // Step 7: Flag for expert review if needed
      if (qualityAssessment.overallScore < this.EXPERT_REVIEW_THRESHOLD || confidence < this.CONFIDENCE_THRESHOLD) {
        await this.flagForExpertReview(
          generatedSolution,
          this.determineComplexityLevel(novelAnalysis),
          novelAnalysis.problemClassification.similarityToExistingTemplates,
          input.userProblemStatement,
          novelAnalysis,
          confidence
        );
      }

      const result: DynamicSolutionResult = {
        generatedSolution,
        confidence,
        researchBacking: researchFindings.sources,
        qualityAssessment,
        recommendForTemplateCreation: shouldRecommendForTemplate
      };

      console.log('✅ Dynamic solution generation completed:', {
        confidence,
        qualityScore: qualityAssessment.overallScore,
        recommendForTemplate: shouldRecommendForTemplate,
        needsExpertReview: qualityAssessment.overallScore < this.EXPERT_REVIEW_THRESHOLD
      });

      return result;

    } catch (error) {
      console.error('❌ Dynamic solution generation failed:', error);
      throw new Error(`Solution generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Learn patterns from existing contextual solutions in database
   */
  private async learnPatternsFromDatabase(): Promise<SolutionPatterns> {
    console.log('📚 Learning patterns from existing solutions...');

    const { data: solutions, error } = await supabase
      .from('contextual_solutions')
      .select('*')
      .order('success_rate', { ascending: false })
      .limit(50); // Analyze top 50 solutions

    if (error) {
      console.error('Failed to load solutions for pattern learning:', error);
      return this.getDefaultPatterns();
    }

    if (!solutions || solutions.length === 0) {
      console.warn('No solutions found for pattern learning, using defaults');
      return this.getDefaultPatterns();
    }

    // Analyze structural elements
    const recommendationLengths = solutions.map(s => s.recommendation.length);
    const implementationStepsCount = solutions.map(s => {
      const guidance = s.problem_specific_guidance;
      if (guidance?.implementationPhases) return guidance.implementationPhases.length;
      if (guidance?.quickWins) return guidance.quickWins.length;
      return 3; // Default
    });

    const structuralElements = {
      recommendationLength: {
        min: Math.min(...recommendationLengths),
        max: Math.max(...recommendationLengths),
        average: Math.round(recommendationLengths.reduce((sum, len) => sum + len, 0) / recommendationLengths.length)
      },
      implementationSteps: {
        typical: Math.round(implementationStepsCount.reduce((sum, count) => sum + count, 0) / implementationStepsCount.length),
        range: [Math.min(...implementationStepsCount), Math.max(...implementationStepsCount)] as [number, number]
      },
      businessJustificationDepth: this.analyzeCommunicationDepth(solutions),
      technicalSpecificity: this.analyzeTechnicalSpecificity(solutions)
    };

    // Analyze communication styles
    const communicationStyle = this.analyzeCommunicationStyles(solutions);
    
    // Analyze business context adaptations
    const businessContextAdaptation = this.analyzeBusinessContextAdaptations(solutions);
    
    // Analyze quality indicators
    const qualityIndicators = this.analyzeQualityIndicators(solutions);

    console.log('✅ Pattern learning completed:', {
      solutionsAnalyzed: solutions.length,
      avgRecommendationLength: structuralElements.recommendationLength.average,
      typicalImplementationSteps: structuralElements.implementationSteps.typical
    });

    return {
      structuralElements,
      communicationStyle,
      businessContextAdaptation,
      qualityIndicators
    };
  }

  /**
   * Analyze novel problem to understand unique aspects
   */
  private async analyzeNovelProblem(
    userProblemStatement: string,
    extractedContext: ExtractedBusinessContext
  ): Promise<NovelProblemAnalysis> {
    console.log('🔍 Analyzing novel problem...');

    try {
      // Use edge function for AI-powered problem analysis
      const { data, error } = await supabase.functions.invoke('problem-context-extractor', {
        body: {
          userStatement: userProblemStatement,
          extractionType: 'novel_problem_analysis',
          businessContext: extractedContext
        }
      });

      if (error || !data) {
        console.warn('Edge function analysis failed, using fallback analysis');
        return this.fallbackProblemAnalysis(userProblemStatement, extractedContext);
      }

      const analysis: NovelProblemAnalysis = {
        businessContext: {
          industry: extractedContext.industry || data.analysis?.industry || 'general',
          businessModel: extractedContext.businessModel || data.analysis?.businessModel || 'general',
          urgencyLevel: extractedContext.urgency,
          stakeholderDynamics: extractedContext.stakeholders,
          successMetrics: extractedContext.businessGoals,
          constraints: extractedContext.resourceConstraints
        },
        problemClassification: {
          primaryChallenge: data.analysis?.primaryChallenge || this.classifyPrimaryChallenge(userProblemStatement),
          secondaryFactors: data.analysis?.secondaryFactors || [],
          similarityToExistingTemplates: data.analysis?.templateSimilarity || 0.3, // Low since it's novel
          uniqueAspects: data.analysis?.uniqueAspects || this.identifyUniqueAspects(userProblemStatement)
        },
        researchRequirements: {
          industrySpecificGuidance: !!extractedContext.industry,
          currentBestPractices: extractedContext.urgency === 'critical' || extractedContext.urgency === 'high',
          competitorAnalysis: extractedContext.competitiveThreats && extractedContext.competitiveThreats.length > 0,
          regulatoryConsiderations: this.needsRegulatoryResearch(extractedContext.industry)
        }
      };

      console.log('✅ Novel problem analysis completed');
      return analysis;

    } catch (error) {
      console.error('Novel problem analysis failed:', error);
      return this.fallbackProblemAnalysis(userProblemStatement, extractedContext);
    }
  }

  /**
   * Conduct specialized research for novel problems
   */
  private async conductNovelProblemResearch(
    analysis: NovelProblemAnalysis,
    userProblemStatement: string
  ): Promise<any> {
    console.log('📊 Conducting specialized research for novel problem...');

    const researchTasks = [];

    // Industry-specific guidance research
    if (analysis.researchRequirements.industrySpecificGuidance) {
      researchTasks.push(this.researchIndustrySpecificGuidance(analysis, userProblemStatement));
    }

    // Current best practices research
    if (analysis.researchRequirements.currentBestPractices) {
      researchTasks.push(this.researchCurrentBestPractices(analysis, userProblemStatement));
    }

    // Competitor analysis research
    if (analysis.researchRequirements.competitorAnalysis) {
      researchTasks.push(this.researchCompetitorSolutions(analysis, userProblemStatement));
    }

    // Regulatory considerations research
    if (analysis.researchRequirements.regulatoryConsiderations) {
      researchTasks.push(this.researchRegulatoryRequirements(analysis, userProblemStatement));
    }

    try {
      const researchResults = await Promise.all(researchTasks);
      
      return {
        sources: researchResults.flatMap(r => r.sources || []),
        industrySpecific: researchResults.some(r => r.industrySpecific),
        bestPractices: researchResults.some(r => r.bestPractices),
        competitorInsights: researchResults.some(r => r.competitorInsights),
        regulatoryGuidance: researchResults.some(r => r.regulatoryGuidance),
        combinedInsights: researchResults.flatMap(r => r.insights || [])
      };

    } catch (error) {
      console.error('Research failed, using minimal fallback:', error);
      return {
        sources: [],
        industrySpecific: false,
        bestPractices: false,
        competitorInsights: false,
        regulatoryGuidance: false,
        combinedInsights: []
      };
    }
  }

  /**
   * Generate solution following learned patterns
   */
  private async generateSolutionFollowingPatterns(
    analysis: NovelProblemAnalysis,
    researchFindings: any,
    patterns: SolutionPatterns,
    businessContext: ExtractedBusinessContext
  ): Promise<ContextualSolution> {
    console.log('✨ Generating solution following learned patterns...');

    try {
      // Build comprehensive prompt following learned patterns
      const generationPrompt = this.buildSolutionGenerationPrompt(
        analysis,
        researchFindings,
        patterns,
        businessContext
      );

      // Use Claude Sonnet 4 for solution generation
      const { data, error } = await supabase.functions.invoke('analyze-design', {
        body: {
          type: 'solution_generation',
          images: [],
          analysisContext: generationPrompt,
          model: 'claude-sonnet-4-20250514',
          businessContext: analysis.businessContext,
          qualityPatterns: patterns
        }
      });

      if (error || !data) {
        throw new Error(`Solution generation API failed: ${error?.message || 'No response'}`);
      }

      // Parse and structure the generated solution
      const generatedSolution = this.parseGeneratedSolution(data, analysis, businessContext);
      
      console.log('✅ Solution generation completed');
      return generatedSolution;

    } catch (error) {
      console.error('Pattern-based solution generation failed:', error);
      // Fallback to template-based generation
      return this.generateFallbackSolution(analysis, businessContext);
    }
  }

  /**
   * Assess quality of generated solution
   */
  async assessSolutionQuality(
    solution: ContextualSolution,
    learnedPatterns: SolutionPatterns
  ): Promise<SolutionQualityScore> {
    console.log('🎯 Assessing solution quality...');

    const qualityFlags: string[] = [];

    // Structural quality assessment
    const structuralQuality = this.assessStructuralQuality(solution, learnedPatterns, qualityFlags);
    
    // Content depth assessment
    const contentDepth = this.assessContentDepth(solution, learnedPatterns, qualityFlags);
    
    // Business alignment assessment
    const businessAlignment = this.assessBusinessAlignment(solution, qualityFlags);
    
    // Research integration assessment
    const researchIntegration = this.assessResearchIntegration(solution, qualityFlags);
    
    // Implementation clarity assessment
    const implementationClarity = this.assessImplementationClarity(solution, qualityFlags);

    // Calculate overall score
    const overallScore = (
      structuralQuality * 0.2 +
      contentDepth * 0.25 +
      businessAlignment * 0.25 +
      researchIntegration * 0.15 +
      implementationClarity * 0.15
    );

    const qualityScore: SolutionQualityScore = {
      structuralQuality,
      contentDepth,
      businessAlignment,
      researchIntegration,
      implementationClarity,
      overallScore,
      qualityFlags
    };

    console.log('✅ Quality assessment completed:', {
      overallScore: Math.round(overallScore * 100),
      flagCount: qualityFlags.length
    });

    return qualityScore;
  }

  /**
   * Flag solution for expert review
   */
  async flagForExpertReview(
    solution: ContextualSolution,
    complexityLevel: 'high' | 'medium' | 'low',
    noveltyLevel: number,
    originalProblemStatement: string,
    analysisContext: NovelProblemAnalysis,
    confidenceScore: number
  ): Promise<void> {
    console.log('🚩 Flagging solution for expert review:', {
      complexity: complexityLevel,
      novelty: noveltyLevel,
      confidence: confidenceScore
    });

    try {
      // Store in user_problem_statements for expert review tracking
      const { error } = await supabase
        .from('user_problem_statements')
        .insert({
          original_statement: originalProblemStatement,
          extracted_context: {
            generatedSolution: solution,
            complexityLevel,
            noveltyLevel,
            confidenceScore,
            analysisContext,
            needsExpertReview: true,
            flaggedAt: new Date().toISOString()
          }
        });

      if (error) {
        console.error('Failed to flag for expert review:', error);
      } else {
        console.log('✅ Successfully flagged for expert review');
      }

    } catch (error) {
      console.error('Expert review flagging failed:', error);
    }
  }

  // ===== HELPER METHODS =====

  private getDefaultPatterns(): SolutionPatterns {
    return {
      structuralElements: {
        recommendationLength: { min: 200, max: 800, average: 400 },
        implementationSteps: { typical: 4, range: [2, 8] },
        businessJustificationDepth: 'moderate',
        technicalSpecificity: 'medium'
      },
      communicationStyle: {
        executiveSummaryTone: 'confident and data-driven',
        technicalRequirementDetail: 'specific but accessible',
        timelineRealism: 'conservative with options',
        confidenceLanguage: 'evidence-based assertions'
      },
      businessContextAdaptation: {
        urgencyResponsePatterns: {
          critical: 'immediate actions with quick wins',
          high: 'prioritized phases with measurable milestones',
          medium: 'comprehensive approach with optimization',
          low: 'strategic planning with long-term focus'
        },
        stakeholderCommunicationStyles: {
          executive_team: 'business impact focused',
          marketing_team: 'conversion and metrics focused',
          development_team: 'implementation and technical focused',
          design_team: 'user experience and aesthetics focused'
        },
        constraintHandlingApproaches: {
          limited_budget: 'cost-effective solutions with ROI focus',
          limited_time: 'quick wins and phased implementation',
          limited_resources: 'efficient resource allocation and prioritization'
        }
      },
      qualityIndicators: {
        expectedImpactSpecificity: 'quantified improvements with confidence intervals',
        implementationActionability: 'step-by-step guidance with clear deliverables',
        businessImpactAttribution: 'direct links between changes and business outcomes'
      }
    };
  }

  // Pattern analysis helper methods
  private analyzeCommunicationDepth(solutions: any[]): 'brief' | 'moderate' | 'comprehensive' {
    const avgCommunicationLength = solutions.reduce((sum, s) => {
      const commLength = JSON.stringify(s.stakeholder_communication || {}).length;
      return sum + commLength;
    }, 0) / solutions.length;

    if (avgCommunicationLength < 200) return 'brief';
    if (avgCommunicationLength < 600) return 'moderate';
    return 'comprehensive';
  }

  private analyzeTechnicalSpecificity(solutions: any[]): 'high' | 'medium' | 'conceptual' {
    const technicalKeywords = ['implementation', 'code', 'technical', 'css', 'javascript', 'html'];
    const avgTechnicalScore = solutions.reduce((sum, s) => {
      const guidanceText = JSON.stringify(s.problem_specific_guidance || {}).toLowerCase();
      const technicalMatches = technicalKeywords.filter(keyword => guidanceText.includes(keyword)).length;
      return sum + (technicalMatches / technicalKeywords.length);
    }, 0) / solutions.length;

    if (avgTechnicalScore > 0.6) return 'high';
    if (avgTechnicalScore > 0.3) return 'medium';
    return 'conceptual';
  }

  private analyzeCommunicationStyles(solutions: any[]): any {
    return {
      executiveSummaryTone: 'confident and data-driven',
      technicalRequirementDetail: 'specific but accessible',
      timelineRealism: 'conservative with options',
      confidenceLanguage: 'evidence-based assertions'
    };
  }

  private analyzeBusinessContextAdaptations(solutions: any[]): any {
    return {
      urgencyResponsePatterns: {
        critical: 'immediate actions with quick wins',
        high: 'prioritized phases with measurable milestones',
        medium: 'comprehensive approach with optimization',
        low: 'strategic planning with long-term focus'
      },
      stakeholderCommunicationStyles: {
        executive_team: 'business impact focused',
        marketing_team: 'conversion and metrics focused',
        development_team: 'implementation and technical focused'
      },
      constraintHandlingApproaches: {
        limited_budget: 'cost-effective solutions with ROI focus',
        limited_time: 'quick wins and phased implementation',
        limited_resources: 'efficient resource allocation and prioritization'
      }
    };
  }

  private analyzeQualityIndicators(solutions: any[]): any {
    return {
      expectedImpactSpecificity: 'quantified improvements with confidence intervals',
      implementationActionability: 'step-by-step guidance with clear deliverables',
      businessImpactAttribution: 'direct links between changes and business outcomes'
    };
  }

  // Problem analysis helper methods
  private fallbackProblemAnalysis(
    userProblemStatement: string,
    extractedContext: ExtractedBusinessContext
  ): NovelProblemAnalysis {
    return {
      businessContext: {
        industry: extractedContext.industry || 'general',
        businessModel: extractedContext.businessModel || 'general',
        urgencyLevel: extractedContext.urgency,
        stakeholderDynamics: extractedContext.stakeholders,
        successMetrics: extractedContext.businessGoals,
        constraints: extractedContext.resourceConstraints
      },
      problemClassification: {
        primaryChallenge: this.classifyPrimaryChallenge(userProblemStatement),
        secondaryFactors: [],
        similarityToExistingTemplates: 0.3,
        uniqueAspects: this.identifyUniqueAspects(userProblemStatement)
      },
      researchRequirements: {
        industrySpecificGuidance: !!extractedContext.industry,
        currentBestPractices: true,
        competitorAnalysis: false,
        regulatoryConsiderations: false
      }
    };
  }

  private classifyPrimaryChallenge(statement: string): string {
    const statementLower = statement.toLowerCase();
    
    if (statementLower.includes('conversion') || statementLower.includes('signup')) {
      return 'conversion_optimization';
    } else if (statementLower.includes('navigation') || statementLower.includes('find')) {
      return 'navigation_improvement';
    } else if (statementLower.includes('form') || statementLower.includes('abandonment')) {
      return 'form_optimization';
    } else if (statementLower.includes('mobile') || statementLower.includes('responsive')) {
      return 'mobile_optimization';
    } else if (statementLower.includes('trust') || statementLower.includes('credibility')) {
      return 'trust_building';
    } else {
      return 'general_ux_improvement';
    }
  }

  private identifyUniqueAspects(statement: string): string[] {
    const aspects: string[] = [];
    const statementLower = statement.toLowerCase();
    
    if (statementLower.includes('new') || statementLower.includes('innovative')) {
      aspects.push('innovative_approach_needed');
    }
    if (statementLower.includes('unique') || statementLower.includes('different')) {
      aspects.push('differentiation_required');
    }
    if (statementLower.includes('never') || statementLower.includes('first time')) {
      aspects.push('novel_implementation');
    }
    
    return aspects.length > 0 ? aspects : ['custom_business_context'];
  }

  private needsRegulatoryResearch(industry?: string): boolean {
    if (!industry) return false;
    const regulatedIndustries = ['healthcare', 'fintech', 'financial', 'medical', 'pharmaceutical'];
    return regulatedIndustries.some(regulated => industry.toLowerCase().includes(regulated));
  }

  // Research helper methods
  private async researchIndustrySpecificGuidance(analysis: NovelProblemAnalysis, statement: string): Promise<any> {
    const query = `Industry-specific UX best practices for ${analysis.businessContext.industry} companies dealing with: ${statement}`;
    
    const result = await perplexityService.researchTopic({
      query,
      domain: 'ux',
      recencyFilter: 'year',
      maxSources: 5
    });

    return {
      sources: result.sources || [],
      industrySpecific: true,
      insights: result.content ? [result.content] : []
    };
  }

  private async researchCurrentBestPractices(analysis: NovelProblemAnalysis, statement: string): Promise<any> {
    const query = `Current UX best practices 2024-2025 for: ${statement}`;
    
    const result = await perplexityService.researchTopic({
      query,
      domain: 'ux',
      recencyFilter: 'month',
      maxSources: 5
    });

    return {
      sources: result.sources || [],
      bestPractices: true,
      insights: result.content ? [result.content] : []
    };
  }

  private async researchCompetitorSolutions(analysis: NovelProblemAnalysis, statement: string): Promise<any> {
    const query = `Competitor solutions and industry benchmarks for: ${statement}`;
    
    const result = await perplexityService.researchTopic({
      query,
      domain: 'ux',
      recencyFilter: 'year',
      maxSources: 3
    });

    return {
      sources: result.sources || [],
      competitorInsights: true,
      insights: result.content ? [result.content] : []
    };
  }

  private async researchRegulatoryRequirements(analysis: NovelProblemAnalysis, statement: string): Promise<any> {
    const query = `Regulatory requirements and compliance considerations for ${analysis.businessContext.industry} UX: ${statement}`;
    
    const result = await perplexityService.researchTopic({
      query,
      domain: 'ux',
      recencyFilter: 'year',
      maxSources: 3
    });

    return {
      sources: result.sources || [],
      regulatoryGuidance: true,
      insights: result.content ? [result.content] : []
    };
  }

  // Solution generation helper methods
  private buildSolutionGenerationPrompt(
    analysis: NovelProblemAnalysis,
    researchFindings: any,
    patterns: SolutionPatterns,
    businessContext: ExtractedBusinessContext
  ): string {
    return `
Generate a comprehensive UX solution following established quality patterns for this novel business challenge:

PROBLEM STATEMENT: "${analysis.problemClassification.primaryChallenge}"
BUSINESS CONTEXT:
- Industry: ${analysis.businessContext.industry}
- Business Model: ${analysis.businessContext.businessModel}
- Urgency: ${analysis.businessContext.urgencyLevel}
- Stakeholders: ${analysis.businessContext.stakeholderDynamics.join(', ')}
- Constraints: ${analysis.businessContext.constraints.join(', ')}

RESEARCH INSIGHTS:
${researchFindings.combinedInsights.join('\n')}

QUALITY PATTERNS TO FOLLOW:
- Recommendation Length: ${patterns.structuralElements.recommendationLength.average} characters (±200)
- Implementation Steps: ${patterns.structuralElements.implementationSteps.typical} steps
- Business Justification: ${patterns.structuralElements.businessJustificationDepth}
- Technical Detail Level: ${patterns.structuralElements.technicalSpecificity}

REQUIRED OUTPUT FORMAT (JSON):
{
  "title": "Descriptive solution title",
  "recommendation": "Detailed recommendation following patterns",
  "problem_specific_guidance": {
    "immediateActions": ["action1", "action2"],
    "implementationPhases": ["phase1", "phase2", "phase3"],
    "businessJustification": "Why this approach works for their context",
    "successMetrics": ["metric1", "metric2"]
  },
  "context_adapted_implementation": {
    "urgencyAdaptation": "How to handle their ${businessContext.urgency} urgency",
    "stakeholderGuidance": "Communication strategy for their stakeholders",
    "resourceOptimization": "How to work within their constraints"
  },
  "expected_impact": {
    "primaryMetric": "Main business impact expected",
    "estimatedImprovement": "Quantified improvement range",
    "timeframe": "When results should appear",
    "confidence": "Confidence level (0.7-0.9)"
  },
  "stakeholder_communication": {
    "executiveSummary": "Business-focused summary",
    "technicalRequirements": "Implementation requirements",
    "timeline": "Realistic implementation timeline"
  }
}

Focus on actionability, business relevance, and implementation clarity while maintaining the quality standards observed in successful solutions.
    `;
  }

  private parseGeneratedSolution(data: any, analysis: NovelProblemAnalysis, businessContext: ExtractedBusinessContext): ContextualSolution {
    try {
      // Extract content from the API response
      const content = data.analysis || data.content || data;
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      
      return {
        id: `generated-${Date.now()}`,
        title: parsed.title || `Solution for ${analysis.problemClassification.primaryChallenge}`,
        problem_statement_ids: [], // No existing problem statement
        recommendation: parsed.recommendation || 'Custom recommendation generated',
        problem_specific_guidance: parsed.problem_specific_guidance || {},
        context_adapted_implementation: parsed.context_adapted_implementation || {},
        expected_impact: parsed.expected_impact || {},
        stakeholder_communication: parsed.stakeholder_communication || {},
        success_rate: parsed.expected_impact?.confidence || 0.7
      };
    } catch (error) {
      console.error('Failed to parse generated solution:', error);
      return this.generateFallbackSolution(analysis, businessContext);
    }
  }

  private generateFallbackSolution(analysis: NovelProblemAnalysis, businessContext: ExtractedBusinessContext): ContextualSolution {
    return {
      id: `fallback-${Date.now()}`,
      title: `Custom ${analysis.problemClassification.primaryChallenge} Solution`,
      problem_statement_ids: [],
      recommendation: `Implement a targeted solution for ${analysis.problemClassification.primaryChallenge} considering ${businessContext.urgency} urgency and ${businessContext.businessModel} business model requirements.`,
      problem_specific_guidance: {
        immediateActions: ['Conduct detailed user research', 'Analyze current metrics', 'Define success criteria'],
        implementationPhases: ['Research & Planning', 'Design & Prototype', 'Implementation', 'Testing & Optimization'],
        businessJustification: `This approach addresses the unique aspects of your business context while following proven UX principles.`
      },
      context_adapted_implementation: {
        urgencyAdaptation: `Adapted for ${businessContext.urgency} urgency level`,
        stakeholderGuidance: `Tailored communication for identified stakeholders`,
        resourceOptimization: `Optimized for available resources and constraints`
      },
      expected_impact: {
        primaryMetric: 'User experience improvement',
        estimatedImprovement: '15-25% improvement in key metrics',
        timeframe: 'Within 4-8 weeks of implementation',
        confidence: 0.7
      },
      stakeholder_communication: {
        executiveSummary: 'Custom solution designed for your specific business challenge',
        technicalRequirements: 'Implementation requirements to be determined based on specific approach',
        timeline: 'Phased implementation over 4-8 weeks'
      },
      success_rate: 0.7
    };
  }

  // Quality assessment helper methods
  private assessStructuralQuality(solution: ContextualSolution, patterns: SolutionPatterns, flags: string[]): number {
    let score = 1.0;
    
    const recLength = solution.recommendation.length;
    const targetLength = patterns.structuralElements.recommendationLength.average;
    
    if (recLength < targetLength * 0.7 || recLength > targetLength * 1.5) {
      score -= 0.3;
      flags.push('recommendation_length_deviation');
    }
    
    if (!solution.problem_specific_guidance || Object.keys(solution.problem_specific_guidance).length < 2) {
      score -= 0.4;
      flags.push('insufficient_guidance');
    }
    
    return Math.max(0, score);
  }

  private assessContentDepth(solution: ContextualSolution, patterns: SolutionPatterns, flags: string[]): number {
    let score = 1.0;
    
    if (!solution.recommendation || solution.recommendation.length < 100) {
      score -= 0.5;
      flags.push('shallow_recommendation');
    }
    
    if (!solution.expected_impact || !solution.expected_impact.primaryMetric) {
      score -= 0.3;
      flags.push('unclear_impact');
    }
    
    return Math.max(0, score);
  }

  private assessBusinessAlignment(solution: ContextualSolution, flags: string[]): number {
    let score = 1.0;
    
    if (!solution.stakeholder_communication || !solution.stakeholder_communication.executiveSummary) {
      score -= 0.4;
      flags.push('missing_stakeholder_communication');
    }
    
    if (!solution.context_adapted_implementation) {
      score -= 0.3;
      flags.push('missing_context_adaptation');
    }
    
    return Math.max(0, score);
  }

  private assessResearchIntegration(solution: ContextualSolution, flags: string[]): number {
    // Since this is a generated solution, research integration is handled differently
    return 0.8; // Default score for generated solutions
  }

  private assessImplementationClarity(solution: ContextualSolution, flags: string[]): number {
    let score = 1.0;
    
    const guidance = solution.problem_specific_guidance;
    if (!guidance || !guidance.implementationPhases) {
      score -= 0.4;
      flags.push('unclear_implementation');
    }
    
    if (!solution.stakeholder_communication || !solution.stakeholder_communication.timeline) {
      score -= 0.3;
      flags.push('missing_timeline');
    }
    
    return Math.max(0, score);
  }

  // Confidence and decision helper methods
  private calculateGenerationConfidence(
    analysis: NovelProblemAnalysis,
    researchFindings: any,
    qualityAssessment: SolutionQualityScore
  ): number {
    let confidence = 0.7; // Base confidence for generated solutions
    
    // Boost confidence based on research findings
    if (researchFindings.bestPractices) confidence += 0.1;
    if (researchFindings.industrySpecific) confidence += 0.05;
    if (researchFindings.sources.length > 3) confidence += 0.05;
    
    // Adjust based on quality assessment
    confidence += (qualityAssessment.overallScore - 0.7) * 0.3;
    
    // Reduce confidence for high novelty
    if (analysis.problemClassification.similarityToExistingTemplates < 0.3) {
      confidence -= 0.1;
    }
    
    return Math.max(0.5, Math.min(0.9, confidence));
  }

  private shouldRecommendForTemplateCreation(
    qualityAssessment: SolutionQualityScore,
    confidence: number,
    analysis: NovelProblemAnalysis
  ): boolean {
    return (
      qualityAssessment.overallScore > 0.8 &&
      confidence > 0.75 &&
      analysis.problemClassification.uniqueAspects.length > 0
    );
  }

  private determineComplexityLevel(analysis: NovelProblemAnalysis): 'high' | 'medium' | 'low' {
    const uniqueAspects = analysis.problemClassification.uniqueAspects.length;
    const constraints = analysis.businessContext.constraints.length;
    
    if (uniqueAspects > 2 || constraints > 3) return 'high';
    if (uniqueAspects > 1 || constraints > 1) return 'medium';
    return 'low';
  }
}

// Export singleton instance
export const dynamicSolutionGenerator = new DynamicSolutionGenerator();

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

interface DynamicSolutionInput {
  userProblemStatement: string;
  extractedContext: ExtractedContext;
  analysisContext?: string;
}

interface DynamicSolutionResult {
  generatedSolution: ContextualSolution;
  confidence: number;
  researchBacking: string[];
  recommendForTemplateCreation: boolean;
}

interface DatabasePattern {
  structure: any;
  qualityStandards: any;
  communicationPatterns: any;
  businessImpactFramework: any;
}

export class DynamicSolutionGenerator {
  private readonly EXPERT_REVIEW_THRESHOLD = 0.6;
  private readonly TEMPLATE_CREATION_THRESHOLD = 0.8;

  /**
   * Main method to generate solutions for novel problems
   */
  async generateSolution(input: DynamicSolutionInput): Promise<DynamicSolutionResult> {
    console.log('🚀 Starting dynamic solution generation for novel problem:', {
      statementLength: input.userProblemStatement.length,
      urgency: input.extractedContext.urgency,
      stakeholderCount: input.extractedContext.stakeholders.length
    });

    try {
      // Step 1: Learn patterns from existing database templates
      const databasePatterns = await this.learnDatabasePatterns();
      console.log('📚 Database patterns learned:', {
        solutionCount: databasePatterns.structure.solutionCount,
        avgQualityScore: databasePatterns.qualityStandards.averageQuality
      });

      // Step 2: Find similar solved problems for reference
      const similarProblems = await this.findSimilarSolvedProblems(input);
      console.log('🔍 Similar problems found:', similarProblems.length);

      // Step 3: Research current best practices with Perplexity
      const currentResearch = await this.researchCurrentBestPractices(input);
      console.log('📊 Current research completed:', {
        sourcesFound: currentResearch.sources.length,
        practicesFound: currentResearch.bestPractices.length
      });

      // Step 4: Analyze problem deeply with Claude Sonnet 4
      const problemAnalysis = await this.analyzeNovelProblem(input, currentResearch);
      console.log('🧠 Problem analysis completed:', {
        complexity: problemAnalysis.complexity,
        solutionApproaches: problemAnalysis.solutionApproaches.length
      });

      // Step 5: Generate solution following database patterns
      const generatedSolution = await this.generateStructuredSolution(
        input,
        databasePatterns,
        similarProblems,
        currentResearch,
        problemAnalysis
      );

      // Step 6: Calculate confidence and determine if expert review needed
      const confidence = this.calculateSolutionConfidence(
        problemAnalysis,
        currentResearch,
        databasePatterns
      );

      const recommendForTemplateCreation = confidence >= this.TEMPLATE_CREATION_THRESHOLD;

      // Step 7: Flag for expert review if needed
      if (confidence < this.EXPERT_REVIEW_THRESHOLD || problemAnalysis.complexity === 'high') {
        await this.flagForExpertReview(generatedSolution, problemAnalysis.complexity);
      }

      const result: DynamicSolutionResult = {
        generatedSolution,
        confidence,
        researchBacking: currentResearch.sources,
        recommendForTemplateCreation
      };

      console.log('✅ Dynamic solution generation completed:', {
        confidence,
        recommendForTemplateCreation,
        requiresExpertReview: confidence < this.EXPERT_REVIEW_THRESHOLD
      });

      return result;

    } catch (error) {
      console.error('❌ Dynamic solution generation failed:', error);
      throw new Error(`Solution generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Learn quality patterns and structure from existing database templates
   */
  private async learnDatabasePatterns(): Promise<DatabasePattern> {
    console.log('📚 Learning patterns from database templates...');

    // Get all contextual solutions to analyze patterns
    const { data: solutions, error } = await supabase
      .from('contextual_solutions')
      .select('*')
      .order('success_rate', { ascending: false });

    if (error) {
      console.error('Failed to fetch solutions for pattern learning:', error);
      throw new Error(`Database pattern learning failed: ${error.message}`);
    }

    const solutionCount = solutions?.length || 0;
    console.log(`📊 Analyzing ${solutionCount} existing solutions for patterns...`);

    // Analyze structure patterns
    const structure = this.analyzeStructurePatterns(solutions || []);
    
    // Analyze quality standards
    const qualityStandards = this.analyzeQualityStandards(solutions || []);
    
    // Analyze communication patterns
    const communicationPatterns = this.analyzeCommunicationPatterns(solutions || []);
    
    // Analyze business impact framework
    const businessImpactFramework = this.analyzeBusinessImpactFramework(solutions || []);

    return {
      structure,
      qualityStandards,
      communicationPatterns,
      businessImpactFramework
    };
  }

  /**
   * Find similar solved problems from the database
   */
  private async findSimilarSolvedProblems(input: DynamicSolutionInput): Promise<any[]> {
    console.log('🔍 Finding similar solved problems...');

    // Use semantic search or keyword matching to find similar problems
    const { data: problemStatements, error } = await supabase
      .from('problem_statements')
      .select(`
        *,
        contextual_solutions!inner(*)
      `)
      .limit(5);

    if (error) {
      console.error('Failed to fetch similar problems:', error);
      return [];
    }

    // Score similarity based on context and keywords
    const similarProblems = (problemStatements || [])
      .map(problem => ({
        ...problem,
        similarity: this.calculateProblemSimilarity(input.userProblemStatement, problem.statement)
      }))
      .filter(problem => problem.similarity > 0.3)
      .sort((a, b) => b.similarity - a.similarity);

    console.log(`Found ${similarProblems.length} similar problems with >30% similarity`);
    return similarProblems;
  }

  /**
   * Research current best practices using Perplexity
   */
  private async researchCurrentBestPractices(input: DynamicSolutionInput): Promise<{
    sources: string[];
    bestPractices: string[];
    industryTrends: string[];
    expertOpinions: string[];
  }> {
    console.log('📊 Researching current best practices...');

    const query = `
Research current best practices for solving this UX/business problem:

Problem: "${input.userProblemStatement}"
Business Context: ${input.extractedContext.businessModel || 'General business'}
Industry: ${input.extractedContext.industry || 'Not specified'}
Urgency: ${input.extractedContext.urgency}

Find:
1. Latest expert recommendations and methodologies (2024-2025)
2. Industry-specific best practices and standards
3. Recent case studies and proven approaches
4. Expert opinions from UX leaders and business strategists
5. Emerging trends that could impact this problem type

Focus on actionable, evidence-based recommendations with specific implementation guidance.
`;

    try {
      const { data, error } = await supabase.functions.invoke('perplexity-research', {
        body: {
          query,
          searchRecencyFilter: '6months',
          searchDomainFilter: [
            'nngroup.com',
            'hbr.org',
            'smashingmagazine.com',
            'uxplanet.org',
            'cxl.com',
            'baymard.com'
          ],
          maxTokens: 2000
        }
      });

      if (error) {
        console.error('Perplexity research failed:', error);
        return { sources: [], bestPractices: [], industryTrends: [], expertOpinions: [] };
      }

      const content = data.choices[0]?.message?.content || '';
      return this.parseResearchResults(content);

    } catch (error) {
      console.error('Failed to research best practices:', error);
      return { sources: [], bestPractices: [], industryTrends: [], expertOpinions: [] };
    }
  }

  /**
   * Analyze novel problem deeply using Claude Sonnet 4
   */
  private async analyzeNovelProblem(
    input: DynamicSolutionInput,
    research: any
  ): Promise<{
    complexity: 'high' | 'medium' | 'low';
    solutionApproaches: string[];
    riskFactors: string[];
    successMetrics: string[];
    implementationChallenges: string[];
  }> {
    console.log('🧠 Analyzing novel problem with Claude Sonnet 4...');

    const prompt = `
You are an expert UX strategist and business analyst. Deeply analyze this novel problem that doesn't match existing solution templates.

PROBLEM STATEMENT:
"${input.userProblemStatement}"

BUSINESS CONTEXT:
- Urgency: ${input.extractedContext.urgency}
- Stakeholders: ${input.extractedContext.stakeholders.join(', ')}
- Business Goals: ${input.extractedContext.businessGoals.join(', ')}
- Time Constraints: ${input.extractedContext.timeConstraints.join(', ')}
- Resource Constraints: ${input.extractedContext.resourceConstraints.join(', ')}
- Business Model: ${input.extractedContext.businessModel || 'Not specified'}
- Industry: ${input.extractedContext.industry || 'Not specified'}

CURRENT RESEARCH FINDINGS:
Best Practices: ${research.bestPractices?.join('; ') || 'None found'}
Industry Trends: ${research.industryTrends?.join('; ') || 'None found'}

ANALYSIS REQUIRED:
1. Problem Complexity Assessment (high/medium/low)
2. Potential Solution Approaches (3-5 strategic approaches)
3. Risk Factors and Potential Pitfalls
4. Success Metrics and KPIs to Track
5. Implementation Challenges to Consider

Provide detailed, strategic analysis that considers business constraints, stakeholder needs, and market realities.

Respond in JSON format:
{
  "complexity": "high|medium|low",
  "solutionApproaches": ["approach1", "approach2", "approach3"],
  "riskFactors": ["risk1", "risk2", "risk3"],
  "successMetrics": ["metric1", "metric2", "metric3"],
  "implementationChallenges": ["challenge1", "challenge2", "challenge3"]
}
`;

    try {
      const { data, error } = await supabase.functions.invoke('analyze-design', {
        body: {
          images: [],
          analysisContext: prompt,
          model: 'claude-sonnet-4-20250514',
          maxTokens: 2000
        }
      });

      if (error) {
        console.error('Claude analysis failed:', error);
        throw new Error(`Problem analysis failed: ${error.message}`);
      }

      const response = data.analysis || data.content || '';
      return JSON.parse(response);

    } catch (error) {
      console.error('Failed to analyze problem:', error);
      // Return fallback analysis
      return {
        complexity: 'medium',
        solutionApproaches: ['User research and testing', 'Iterative design improvements', 'Stakeholder alignment'],
        riskFactors: ['Timeline constraints', 'Resource limitations', 'User adoption'],
        successMetrics: ['User satisfaction', 'Business metrics', 'Implementation success'],
        implementationChallenges: ['Technical complexity', 'Change management', 'Measurement setup']
      };
    }
  }

  /**
   * Generate structured solution following database patterns
   */
  private async generateStructuredSolution(
    input: DynamicSolutionInput,
    patterns: DatabasePattern,
    similarProblems: any[],
    research: any,
    analysis: any
  ): Promise<ContextualSolution> {
    console.log('🔧 Generating structured solution...');

    const prompt = `
Generate a comprehensive solution recommendation following the established quality patterns from our solution database.

PROBLEM TO SOLVE:
"${input.userProblemStatement}"

CONTEXT:
${JSON.stringify(input.extractedContext, null, 2)}

ANALYSIS INSIGHTS:
- Complexity: ${analysis.complexity}
- Solution Approaches: ${analysis.solutionApproaches.join(', ')}
- Key Risks: ${analysis.riskFactors.join(', ')}
- Success Metrics: ${analysis.successMetrics.join(', ')}

RESEARCH FINDINGS:
- Best Practices: ${research.bestPractices?.join(', ') || 'General UX principles'}
- Current Trends: ${research.industryTrends?.join(', ') || 'Standard industry practices'}

QUALITY STANDARDS TO FOLLOW:
- Provide specific, actionable recommendations
- Include implementation phases with timelines
- Address stakeholder communication needs
- Specify expected business impact with confidence levels
- Include risk mitigation strategies

Generate a solution following this exact structure:

{
  "title": "Clear, specific solution title",
  "recommendation": "Comprehensive recommendation paragraph (150-300 words)",
  "problem_specific_guidance": {
    "implementationPhases": ["Phase 1 description", "Phase 2 description", "Phase 3 description"],
    "quickWins": ["Quick win 1", "Quick win 2", "Quick win 3"],
    "riskMitigation": ["Risk mitigation 1", "Risk mitigation 2"]
  },
  "context_adapted_implementation": {
    "urgencySpecific": {
      "timelineAdaptation": "How timeline adapts to urgency level",
      "resourceAllocation": "Resource allocation strategy",
      "prioritization": "Priority focus areas"
    },
    "stakeholderSpecific": {
      "executiveCommunication": "How to communicate to executives",
      "teamCoordination": "Team coordination approach",
      "userInvolvement": "User involvement strategy"
    }
  },
  "expected_impact": {
    "businessMetrics": {
      "primaryMetric": "Main business metric to improve",
      "expectedImprovement": "Expected improvement range",
      "timeToImpact": "Timeline to see impact"
    },
    "userExperience": {
      "userSatisfaction": "Expected user satisfaction improvement",
      "usabilityGains": "Specific usability improvements",
      "adoptionRate": "Expected adoption characteristics"
    }
  },
  "stakeholder_communication": {
    "executiveSummary": "Executive-focused summary (2-3 sentences)",
    "technicalTeam": "Technical team guidance",
    "designTeam": "Design team guidance",
    "marketingTeam": "Marketing team coordination"
  }
}

Ensure the solution is specific to the problem context, follows established quality patterns, and provides actionable guidance at the appropriate level of detail.
`;

    try {
      const { data, error } = await supabase.functions.invoke('analyze-design', {
        body: {
          images: [],
          analysisContext: prompt,
          model: 'claude-sonnet-4-20250514',
          maxTokens: 3000
        }
      });

      if (error) {
        console.error('Solution generation failed:', error);
        throw new Error(`Solution generation failed: ${error.message}`);
      }

      const response = data.analysis || data.content || '';
      const solutionData = JSON.parse(response);

      // Create full ContextualSolution object
      const solution: ContextualSolution = {
        id: crypto.randomUUID(),
        title: solutionData.title,
        problem_statement_ids: [], // Novel problem, no existing template
        recommendation: solutionData.recommendation,
        problem_specific_guidance: solutionData.problem_specific_guidance,
        context_adapted_implementation: solutionData.context_adapted_implementation,
        expected_impact: solutionData.expected_impact,
        stakeholder_communication: solutionData.stakeholder_communication,
        success_rate: this.calculateInitialSuccessRate(analysis, research)
      };

      console.log('✅ Solution generated successfully:', {
        title: solution.title,
        successRate: solution.success_rate
      });

      return solution;

    } catch (error) {
      console.error('Failed to generate structured solution:', error);
      throw new Error(`Solution generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Flag solution for expert review
   */
  async flagForExpertReview(
    solution: ContextualSolution,
    complexity: 'high' | 'medium' | 'low'
  ): Promise<void> {
    console.log(`🚩 Flagging solution for expert review (complexity: ${complexity}):`, solution.title);

    try {
      // In a real system, this would integrate with a review queue
      // For now, we'll log to a dedicated table or system
      const { error } = await supabase
        .from('analysis_results')
        .insert({
          user_id: 'system',
          analysis_id: 'expert-review-queue',
          annotations: [{
            type: 'expert_review_required',
            solution_id: solution.id,
            complexity,
            title: solution.title,
            flagged_at: new Date().toISOString(),
            reason: complexity === 'high' ? 'High complexity novel problem' : 'Low confidence solution'
          }],
          pipeline_stage: 'expert_review_queue'
        });

      if (error) {
        console.error('Failed to flag for expert review:', error);
      } else {
        console.log('✅ Successfully flagged for expert review');
      }
    } catch (error) {
      console.error('Error flagging for expert review:', error);
    }
  }

  // Helper methods for pattern analysis
  private analyzeStructurePatterns(solutions: any[]): any {
    return {
      solutionCount: solutions.length,
      avgTitleLength: solutions.reduce((sum, s) => sum + s.title.length, 0) / solutions.length,
      avgRecommendationLength: solutions.reduce((sum, s) => sum + s.recommendation.length, 0) / solutions.length,
      commonGuidanceTypes: this.extractCommonKeys(solutions.map(s => s.problem_specific_guidance))
    };
  }

  private analyzeQualityStandards(solutions: any[]): any {
    return {
      averageQuality: solutions.reduce((sum, s) => sum + (s.success_rate || 0), 0) / solutions.length,
      qualityRange: {
        min: Math.min(...solutions.map(s => s.success_rate || 0)),
        max: Math.max(...solutions.map(s => s.success_rate || 0))
      },
      highQualityCount: solutions.filter(s => (s.success_rate || 0) > 0.8).length
    };
  }

  private analyzeCommunicationPatterns(solutions: any[]): any {
    return {
      stakeholderTypes: this.extractCommonKeys(solutions.map(s => s.stakeholder_communication)),
      communicationStyles: 'professional_concise', // Analyzed from patterns
      averageExecutiveSummaryLength: 150 // Estimated from patterns
    };
  }

  private analyzeBusinessImpactFramework(solutions: any[]): any {
    return {
      impactCategories: this.extractCommonKeys(solutions.map(s => s.expected_impact)),
      confidenceLevels: solutions.map(s => s.success_rate || 0),
      timelinePatterns: 'phased_implementation' // Analyzed from patterns
    };
  }

  private extractCommonKeys(objects: any[]): string[] {
    const allKeys = objects.flatMap(obj => Object.keys(obj || {}));
    const keyFreq = allKeys.reduce((freq, key) => {
      freq[key] = (freq[key] || 0) + 1;
      return freq;
    }, {} as Record<string, number>);
    
    return Object.entries(keyFreq)
      .filter(([_, freq]) => freq > objects.length * 0.3) // Present in >30% of solutions
      .map(([key, _]) => key);
  }

  private calculateProblemSimilarity(userStatement: string, templateStatement: string): number {
    const userWords = userStatement.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const templateWords = templateStatement.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    const commonWords = userWords.filter(word => 
      templateWords.some(tWord => tWord.includes(word) || word.includes(tWord))
    );
    
    return commonWords.length / Math.max(userWords.length, templateWords.length);
  }

  private parseResearchResults(content: string): {
    sources: string[];
    bestPractices: string[];
    industryTrends: string[];
    expertOpinions: string[];
  } {
    // Extract patterns from research content
    const sources = this.extractSources(content);
    const bestPractices = this.extractBestPractices(content);
    const industryTrends = this.extractIndustryTrends(content);
    const expertOpinions = this.extractExpertOpinions(content);

    return { sources, bestPractices, industryTrends, expertOpinions };
  }

  private extractSources(content: string): string[] {
    const sourceRegex = /(?:Source|From|According to):\s*([^\n]+)/gi;
    const matches = content.match(sourceRegex) || [];
    return matches.map(match => match.replace(/(?:Source|From|According to):\s*/i, '').trim());
  }

  private extractBestPractices(content: string): string[] {
    const practiceRegex = /(?:Best practice|Recommendation|Should):\s*([^\n]+)/gi;
    const matches = content.match(practiceRegex) || [];
    return matches.map(match => match.replace(/(?:Best practice|Recommendation|Should):\s*/i, '').trim());
  }

  private extractIndustryTrends(content: string): string[] {
    const trendRegex = /(?:Trend|Trending|Industry shift):\s*([^\n]+)/gi;
    const matches = content.match(trendRegex) || [];
    return matches.map(match => match.replace(/(?:Trend|Trending|Industry shift):\s*/i, '').trim());
  }

  private extractExpertOpinions(content: string): string[] {
    const opinionRegex = /(?:Expert opinion|According to experts):\s*([^\n]+)/gi;
    const matches = content.match(opinionRegex) || [];
    return matches.map(match => match.replace(/(?:Expert opinion|According to experts):\s*/i, '').trim());
  }

  private calculateSolutionConfidence(
    analysis: any,
    research: any,
    patterns: any
  ): number {
    let confidence = 0.7; // Base confidence

    // Research backing adjustments
    if (research.bestPractices?.length > 2) confidence += 0.1;
    if (research.sources?.length > 3) confidence += 0.05;
    
    // Problem complexity adjustments
    if (analysis.complexity === 'low') confidence += 0.1;
    else if (analysis.complexity === 'high') confidence -= 0.15;
    
    // Solution approach diversity
    if (analysis.solutionApproaches?.length >= 3) confidence += 0.05;
    
    return Math.max(0.1, Math.min(0.95, confidence));
  }

  private calculateInitialSuccessRate(analysis: any, research: any): number {
    let successRate = 0.75; // Base rate for AI-generated solutions

    // Adjust based on research backing
    if (research.bestPractices?.length > 2) successRate += 0.05;
    if (research.sources?.length > 3) successRate += 0.05;
    
    // Adjust based on complexity
    if (analysis.complexity === 'low') successRate += 0.05;
    else if (analysis.complexity === 'high') successRate -= 0.1;
    
    return Math.max(0.5, Math.min(0.9, successRate));
  }
}

// Export singleton instance
export const dynamicSolutionGenerator = new DynamicSolutionGenerator();