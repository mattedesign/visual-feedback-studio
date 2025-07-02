import { supabase } from '@/integrations/supabase/client';
import { Annotation } from '@/types/analysis';
import { Tables } from '@/integrations/supabase/types';

export interface BusinessContext {
  urgency: 'low' | 'medium' | 'high';
  stakeholders: string[];
  goals: string[];
  businessType: string;
  userSegment: string;
  timeline: string;
}

// Use actual database types
export type ProblemStatement = Tables<'problem_statements'>;
export type ContextualSolution = Tables<'contextual_solutions'>;

export interface Solution {
  id: string;
  title: string;
  description: string;
  category: string;
  implementationEffort: 'low' | 'medium' | 'high';
  businessImpact: 'low' | 'medium' | 'high';
  confidence: number;
  source: 'traditional' | 'contextual';
  stakeholder_communication?: {
    executive_summary: string;
    technical_details: string;
    implementation_plan: string;
  };
}

export interface SolutionResult {
  approach: 'traditional' | 'problem_statement' | 'hybrid';
  solutions: Solution[];
  confidence: number;
  businessContext?: BusinessContext;
  testingData: {
    traditionalCount: number;
    contextualCount: number;
    userSatisfactionPrompt: string;
    matchingDetails?: {
      matchedTemplate: ProblemStatement | null;
      matchingConfidence: number;
      extractedContext: BusinessContext;
    };
  };
}

export class HybridSolutionEngine {
  private readonly CONFIDENCE_THRESHOLD = 0.4; // Lowered for better matching

  async findSolutions(input: {
    annotations: Annotation[];
    userProblemStatement?: string;
    analysisContext: string;
  }): Promise<SolutionResult> {
    console.log('🔍 HybridSolutionEngine: Starting solution discovery...', {
      hasAnnotations: input.annotations.length > 0,
      hasProblemStatement: !!input.userProblemStatement,
      contextLength: input.analysisContext.length
    });

    let approach: SolutionResult['approach'] = 'traditional';
    let solutions: Solution[] = [];
    let businessContext: BusinessContext | undefined;
    let matchingDetails: SolutionResult['testingData']['matchingDetails'];

    // Step 1: Try problem statement matching first if provided
    if (input.userProblemStatement) {
      console.log('🎯 Attempting problem statement matching...');
      
      const problemStatementResult = await this.matchProblemStatement(input.userProblemStatement);
      matchingDetails = {
        matchedTemplate: problemStatementResult.matchedTemplate,
        matchingConfidence: problemStatementResult.confidence,
        extractedContext: problemStatementResult.extractedContext
      };

      if (problemStatementResult.confidence >= this.CONFIDENCE_THRESHOLD) {
        console.log('✅ High confidence problem statement match found!');
        approach = 'problem_statement';
        businessContext = problemStatementResult.extractedContext;
        
        // Convert contextual solutions to standard format
        solutions = problemStatementResult.contextualSolutions.map(this.convertContextualSolution);
      }
    }

    // Step 2: Generate traditional solutions from annotations
    const traditionalSolutions = await this.generateTraditionalSolutions(input.annotations);

    // Step 3: Determine final approach and combine solutions
    if (approach === 'problem_statement' && solutions.length > 0) {
      // Add traditional solutions as backup
      solutions.push(...traditionalSolutions.slice(0, 2)); // Add top 2 traditional
      if (traditionalSolutions.length > 0) {
        approach = 'hybrid';
      }
    } else {
      // Fall back to traditional solutions
      approach = 'traditional';
      solutions = traditionalSolutions;
    }

    const result: SolutionResult = {
      approach,
      solutions,
      confidence: approach === 'problem_statement' ? matchingDetails?.matchingConfidence || 0 : 0.8,
      businessContext,
      testingData: {
        traditionalCount: traditionalSolutions.length,
        contextualCount: solutions.filter(s => s.source === 'contextual').length,
        userSatisfactionPrompt: this.generateSatisfactionPrompt(approach),
        matchingDetails
      }
    };

    // Track results for testing
    await this.trackTestingResults(result);

    console.log('🎉 HybridSolutionEngine: Solution discovery complete!', {
      approach: result.approach,
      solutionCount: result.solutions.length,
      confidence: result.confidence
    });

    return result;
  }

  async matchProblemStatement(statement: string): Promise<{
    matchedTemplate: ProblemStatement | null;
    confidence: number;
    extractedContext: BusinessContext;
    contextualSolutions: ContextualSolution[];
  }> {
    try {
      // Fetch problem statement templates
      const { data: templates, error } = await supabase
        .from('problem_statements')
        .select('*')
        .limit(10);

      if (error) {
        console.error('Error fetching problem statements:', error);
        return this.getDefaultResponse(statement);
      }

      if (!templates || templates.length === 0) {
        console.warn('No problem statement templates found');
        return this.getDefaultResponse(statement);
      }

      // Simple keyword matching for now (can be enhanced with AI later)
      let bestMatch: ProblemStatement | null = null;
      let bestScore = 0;

      for (const template of templates) {
        const score = this.calculateMatchingScore(statement, template.statement, template.category);
        console.log(`🎯 Template "${template.statement.substring(0, 40)}..." scored: ${Math.round(score * 100)}%`);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = template as ProblemStatement;
        }
      }

      console.log(`🏆 Best match: "${bestMatch?.statement.substring(0, 50)}..." with ${Math.round(bestScore * 100)}% confidence`);

      if (!bestMatch || bestScore < 0.3) {
        return this.getDefaultResponse(statement);
      }

      // Extract business context from user statement
      const extractedContext = this.extractBusinessContext(statement, bestMatch.implied_context);

      // Fetch contextual solutions for this problem statement
      const { data: solutions } = await supabase
        .from('contextual_solutions')
        .select('*')
        .contains('problem_statement_ids', [bestMatch.id])
        .limit(5);

      const contextualSolutions = (solutions || []) as ContextualSolution[];

      return {
        matchedTemplate: bestMatch,
        confidence: bestScore,
        extractedContext,
        contextualSolutions
      };

    } catch (error) {
      console.error('Error in matchProblemStatement:', error);
      return this.getDefaultResponse(statement);
    }
  }

  private calculateMatchingScore(userStatement: string, templateStatement: string, category?: string): number {
    const userLower = userStatement.toLowerCase();
    const templateLower = templateStatement.toLowerCase();
    
    // Base word matching score
    const userWords = userLower.split(/\s+/).filter(word => word.length > 2);
    const templateWords = templateLower.split(/\s+/).filter(word => word.length > 2);
    
    let baseScore = 0;
    const totalWords = Math.max(userWords.length, templateWords.length);
    
    for (const word of userWords) {
      if (templateWords.some(tw => tw.includes(word) || word.includes(tw))) {
        baseScore++;
      }
    }
    
    const wordMatchScore = baseScore / totalWords;

    // Category-specific keyword boosting
    const categoryKeywords = this.getCategoryKeywords(category || 'general');
    let categoryBoost = 0;
    
    for (const keyword of categoryKeywords) {
      if (userLower.includes(keyword)) {
        categoryBoost += 0.2; // Each matching category keyword adds 20%
      }
    }

    // Urgency and business impact detection
    const urgencyBoost = this.detectUrgencyKeywords(userLower) ? 0.1 : 0;
    const businessImpactBoost = this.detectBusinessImpactKeywords(userLower) ? 0.15 : 0;

    // Combine scores with weighting
    const finalScore = Math.min(1.0, (wordMatchScore * 0.6) + categoryBoost + urgencyBoost + businessImpactBoost);
    
    console.log(`📊 Scoring "${templateStatement.substring(0, 50)}...": ${Math.round(finalScore * 100)}%`);
    
    return finalScore;
  }

  // Category-specific keywords for better matching
  private getCategoryKeywords(category: string): string[] {
    const keywordMap: Record<string, string[]> = {
      'conversion_decline': ['conversion', 'signup', 'checkout', 'purchase', 'cart', 'abandon', 'drop', 'decline', 'sales', 'revenue'],
      'competitive_pressure': ['competitor', 'alternative', 'market', 'losing users', 'switch', 'outdated', 'behind'],
      'user_confusion': ['confused', 'lost', 'find', 'navigate', 'understand', 'unclear', 'complex', 'difficult'],
      'technical_constraints': ['slow', 'performance', 'load', 'mobile', 'browser', 'compatibility', 'technical'],
      'stakeholder_demands': ['executive', 'ceo', 'board', 'deadline', 'urgent', 'priority', 'stakeholder']
    };
    
    return keywordMap[category] || [];
  }

  // Detect urgency indicators
  private detectUrgencyKeywords(statement: string): boolean {
    const urgencyKeywords = ['urgent', 'immediately', 'asap', 'critical', 'emergency', 'deadline', 'priority'];
    return urgencyKeywords.some(keyword => statement.includes(keyword));
  }

  // Detect business impact indicators
  private detectBusinessImpactKeywords(statement: string): boolean {
    const impactKeywords = ['revenue', 'sales', 'conversion', 'users', 'customers', 'growth', 'profit', 'loss', 'churn'];
    return impactKeywords.some(keyword => statement.includes(keyword));
  }

  private extractBusinessContext(statement: string, templateContext: any): BusinessContext {
    const lowercaseStatement = statement.toLowerCase();
    
    // Extract urgency from keywords
    let urgency: BusinessContext['urgency'] = 'medium';
    if (lowercaseStatement.includes('urgent') || lowercaseStatement.includes('immediately') || lowercaseStatement.includes('asap')) {
      urgency = 'high';
    } else if (lowercaseStatement.includes('eventually') || lowercaseStatement.includes('when possible')) {
      urgency = 'low';
    }

    // Extract stakeholders (basic detection)
    const stakeholders: string[] = [];
    if (lowercaseStatement.includes('ceo') || lowercaseStatement.includes('executive')) stakeholders.push('executives');
    if (lowercaseStatement.includes('customer') || lowercaseStatement.includes('user')) stakeholders.push('customers');
    if (lowercaseStatement.includes('team') || lowercaseStatement.includes('developer')) stakeholders.push('development_team');
    if (lowercaseStatement.includes('marketing')) stakeholders.push('marketing');
    if (stakeholders.length === 0) stakeholders.push('product_team');

    // Extract timeline
    let timeline = 'within_quarter';
    if (lowercaseStatement.includes('week') || lowercaseStatement.includes('immediately')) timeline = 'within_month';
    if (lowercaseStatement.includes('month')) timeline = 'within_quarter';
    if (lowercaseStatement.includes('year') || lowercaseStatement.includes('long term')) timeline = 'within_year';

    return {
      urgency,
      stakeholders,
      goals: templateContext?.goals || ['improve_user_experience'],
      businessType: templateContext?.businessType || 'saas',
      userSegment: templateContext?.userSegment || 'general',
      timeline
    };
  }

  private async generateTraditionalSolutions(annotations: Annotation[]): Promise<Solution[]> {
    // Convert annotations to traditional solutions format
    return annotations.slice(0, 5).map((annotation, index) => ({
      id: `traditional_${index}`,
      title: annotation.title || annotation.feedback?.substring(0, 50) || 'UX Improvement',
      description: annotation.description || annotation.feedback || 'Improve user experience based on analysis',
      category: annotation.category || 'ux',
      implementationEffort: annotation.implementationEffort || 'medium',
      businessImpact: annotation.businessImpact || 'medium',
      confidence: 0.8, // Default confidence since annotation may not have this property
      source: 'traditional' as const
    }));
  }

  private convertContextualSolution(contextualSolution: ContextualSolution): Solution {
    // Parse stakeholder communication JSON safely
    let stakeholderComm;
    try {
      stakeholderComm = typeof contextualSolution.stakeholder_communication === 'string' 
        ? JSON.parse(contextualSolution.stakeholder_communication)
        : contextualSolution.stakeholder_communication;
    } catch {
      stakeholderComm = undefined;
    }

    return {
      id: contextualSolution.id,
      title: contextualSolution.title,
      description: contextualSolution.recommendation,
      category: 'business_context',
      implementationEffort: 'medium', // Could be derived from solution data
      businessImpact: 'high', // Contextual solutions are typically high impact
      confidence: (contextualSolution.success_rate || 80) / 100,
      source: 'contextual',
      stakeholder_communication: stakeholderComm
    };
  }

  private generateSatisfactionPrompt(approach: SolutionResult['approach']): string {
    switch (approach) {
      case 'problem_statement':
        return "How well did these business-context solutions address your specific challenge? (1-5 stars)";
      case 'hybrid':
        return "Which solutions were most helpful: the business-context ones or traditional UX analysis? (Rate each 1-5)";
      case 'traditional':
        return "How relevant were these traditional UX solutions to your business needs? (1-5 stars)";
      default:
        return "How satisfied are you with these solutions? (1-5 stars)";
    }
  }

  private getDefaultResponse(statement: string) {
    return {
      matchedTemplate: null,
      confidence: 0.1,
      extractedContext: {
        urgency: 'medium' as const,
        stakeholders: ['product_team'],
        goals: ['improve_user_experience'],
        businessType: 'general',
        userSegment: 'general',
        timeline: 'within_quarter'
      },
      contextualSolutions: []
    };
  }

  async trackTestingResults(result: SolutionResult): Promise<void> {
    try {
      // Store testing analytics (could be expanded later)
      console.log('📊 Tracking testing results:', {
        approach: result.approach,
        solutionCount: result.solutions.length,
        confidence: result.confidence,
        timestamp: new Date().toISOString()
      });

      // Could store in database for analytics
      // await supabase.from('solution_testing_analytics').insert({...})
      
    } catch (error) {
      console.error('Error tracking testing results:', error);
    }
  }
}