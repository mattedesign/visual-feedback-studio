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
      const guidance = s.problem_specific_guidance as any;
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

  // Helper methods implementation...
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

  // Placeholder methods for remaining functionality
  private async conductNovelProblemResearch(analysis: NovelProblemAnalysis, statement: string): Promise<any> {
    return { sources: [], industrySpecific: false, bestPractices: false };
  }

  private async generateSolutionFollowingPatterns(
    analysis: NovelProblemAnalysis,
    research: any,
    patterns: SolutionPatterns,
    context: ExtractedBusinessContext
  ): Promise<ContextualSolution> {
    return {
      id: `generated-${Date.now()}`,
      title: `Solution for ${analysis.problemClassification.primaryChallenge}`,
      problem_statement_ids: [],
      recommendation: 'Generated recommendation',
      problem_specific_guidance: {},
      context_adapted_implementation: {},
      expected_impact: {},
      stakeholder_communication: {},
      success_rate: 0.7
    };
  }

  private async assessSolutionQuality(solution: ContextualSolution, patterns: SolutionPatterns): Promise<SolutionQualityScore> {
    return {
      structuralQuality: 0.8,
      contentDepth: 0.7,
      businessAlignment: 0.8,
      researchIntegration: 0.7,
      implementationClarity: 0.8,
      overallScore: 0.76,
      qualityFlags: []
    };
  }

  private calculateGenerationConfidence(analysis: NovelProblemAnalysis, research: any, quality: SolutionQualityScore): number {
    return 0.8;
  }

  private shouldRecommendForTemplateCreation(quality: SolutionQualityScore, confidence: number, analysis: NovelProblemAnalysis): boolean {
    return quality.overallScore > 0.8 && confidence > 0.75;
  }

  private determineComplexityLevel(analysis: NovelProblemAnalysis): 'high' | 'medium' | 'low' {
    return 'medium';
  }

  private async flagForExpertReview(
    solution: ContextualSolution,
    complexity: 'high' | 'medium' | 'low',
    novelty: number,
    statement: string,
    analysis: NovelProblemAnalysis,
    confidence: number
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_problem_statements')
        .insert({
          original_statement: statement,
          extracted_context: {
            generatedSolution: solution,
            complexityLevel: complexity,
            noveltyLevel: novelty,
            confidenceScore: confidence,
            analysisContext: analysis,
            needsExpertReview: true,
            flaggedAt: new Date().toISOString()
          } as any
        });

      if (error) {
        console.error('Failed to flag for expert review:', error);
      }
    } catch (error) {
      console.error('Expert review flagging failed:', error);
    }
  }

  private fallbackProblemAnalysis(statement: string, context: ExtractedBusinessContext): NovelProblemAnalysis {
    return {
      businessContext: {
        industry: context.industry || 'general',
        businessModel: context.businessModel || 'general',
        urgencyLevel: context.urgency,
        stakeholderDynamics: context.stakeholders,
        successMetrics: context.businessGoals,
        constraints: context.resourceConstraints
      },
      problemClassification: {
        primaryChallenge: this.classifyPrimaryChallenge(statement),
        secondaryFactors: [],
        similarityToExistingTemplates: 0.3,
        uniqueAspects: this.identifyUniqueAspects(statement)
      },
      researchRequirements: {
        industrySpecificGuidance: !!context.industry,
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
}

// Export singleton instance
export const dynamicSolutionGenerator = new DynamicSolutionGenerator();