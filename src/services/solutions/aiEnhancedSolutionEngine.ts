import { supabase } from '@/integrations/supabase/client';
import { Annotation } from '@/types/analysis';
import { intelligentProblemMatcher } from '../ai/intelligentProblemMatcher';

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

interface EnhancedSolution {
  id: string;
  title: string;
  type: 'traditional' | 'contextual' | 'dynamic';
  priority: 'critical' | 'high' | 'medium' | 'low';
  recommendation: string;
  implementation: {
    phases: string[];
    quickWins: string[];
    timeline: string;
    effort: 'low' | 'medium' | 'high';
  };
  businessImpact: {
    metrics: string[];
    expectedImprovement: string;
    confidence: number;
  };
  stakeholderGuidance: {
    executive: string;
    technical: string;
    design: string;
  };
  researchBacking?: string[];
  originalAnnotations?: Annotation[];
}

interface StakeholderCommunication {
  executiveSummary: string;
  technicalRequirements: string;
  designRationale: string;
  marketingAlignment: string;
  timelineExpectations: string;
}

interface ConsultationResult {
  solutions: EnhancedSolution[];
  approach: 'traditional' | 'problem_statement' | 'dynamic' | 'hybrid';
  confidence: number;
  businessContext?: Record<string, any>;
  stakeholderGuidance?: StakeholderCommunication;
  problemStatementMatch?: {
    template: any;
    confidence: number;
    extractedContext: any;
  };
  recommendations: {
    immediate: EnhancedSolution[];
    shortTerm: EnhancedSolution[];
    longTerm: EnhancedSolution[];
  };
}

interface ConsultationInput {
  analysisResults: Annotation[];
  userProblemStatement?: string;
  analysisContext: string;
  analysisId?: string;
  userId?: string;
}

export class AIEnhancedSolutionEngine {
  private readonly CONFIDENCE_THRESHOLD = 0.75;
  private readonly MIN_TRADITIONAL_SOLUTIONS = 3;

  /**
   * Main method that provides complete UX consultation
   */
  async provideConsultation(input: ConsultationInput): Promise<ConsultationResult> {
    console.log('🎯 Starting AI-enhanced solution consultation:', {
      annotationCount: input.analysisResults.length,
      hasProblemStatement: !!input.userProblemStatement,
      analysisContextLength: input.analysisContext.length,
      analysisId: input.analysisId
    });

    try {
      let approach: ConsultationResult['approach'] = 'traditional';
      let confidence = 0.6; // Base confidence for traditional analysis
      let businessContext: Record<string, any> = {};
      let problemStatementMatch: any = null;
      
      // Step 1: Try AI problem statement interpretation if provided
      if (input.userProblemStatement) {
        console.log('🧠 Attempting AI problem statement interpretation...');
        
        try {
          const problemResult = await intelligentProblemMatcher.interpretProblemStatement(
            input.userProblemStatement
          );
          
          console.log('🎯 Problem interpretation completed:', {
            hasMatch: !!problemResult.matchedTemplate,
            confidence: problemResult.confidence,
            hasSolution: !!problemResult.contextualizedSolution,
            hasEnhancement: !!problemResult.enhancedSolution,
            hasDynamicSolution: !!problemResult.dynamicSolution
          });

          if (problemResult.confidence >= this.CONFIDENCE_THRESHOLD) {
            approach = problemResult.contextualizedSolution ? 'problem_statement' : 'dynamic';
            confidence = problemResult.confidence;
            businessContext = problemResult.extractedContext;
            problemStatementMatch = {
              template: problemResult.matchedTemplate,
              confidence: problemResult.confidence,
              extractedContext: problemResult.extractedContext
            };
            
            // Record usage for analytics
            if (problemResult.matchedTemplate) {
              await this.trackProblemStatementUsage(
                input.userProblemStatement,
                problemResult.matchedTemplate.id,
                input.analysisId
              );
            }
          }
        } catch (error) {
          console.error('⚠️ Problem statement interpretation failed:', error);
          // Continue with traditional approach
        }
      }

      // Step 2: Generate solutions based on approach
      let solutions: EnhancedSolution[] = [];
      let stakeholderGuidance: StakeholderCommunication | undefined;

      if (approach === 'problem_statement' || approach === 'dynamic') {
        // Use AI-generated contextual solutions
        const aiSolutions = await this.generateAISolutions(input, problemStatementMatch);
        solutions = aiSolutions.solutions;
        stakeholderGuidance = aiSolutions.stakeholderGuidance;
        
        // Supplement with traditional solutions if needed
        if (solutions.length < this.MIN_TRADITIONAL_SOLUTIONS) {
          console.log('📊 Supplementing with traditional solutions...');
          const traditionalSolutions = await this.generateTraditionalSolutions(input.analysisResults);
          solutions = [...solutions, ...traditionalSolutions];
          approach = 'hybrid';
        }
      } else {
        // Use traditional annotation-based solutions
        solutions = await this.generateTraditionalSolutions(input.analysisResults);
        stakeholderGuidance = this.generateTraditionalStakeholderGuidance(solutions);
      }

      // Step 3: Organize solutions by timeline
      const recommendations = this.organizeSolutionsByTimeline(solutions);

      // Step 4: Store consultation results for learning
      if (input.analysisId) {
        await this.storeConsultationResults({
          analysisId: input.analysisId,
          approach,
          confidence,
          solutionCount: solutions.length,
          problemStatementUsed: !!input.userProblemStatement
        });
      }

      const result: ConsultationResult = {
        solutions,
        approach,
        confidence,
        businessContext,
        stakeholderGuidance,
        problemStatementMatch,
        recommendations
      };

      console.log('✅ Solution consultation completed:', {
        approach,
        confidence,
        solutionCount: solutions.length,
        immediateSolutions: recommendations.immediate.length,
        shortTermSolutions: recommendations.shortTerm.length,
        longTermSolutions: recommendations.longTerm.length
      });

      return result;

    } catch (error) {
      console.error('❌ Solution consultation failed:', error);
      
      // Fallback to basic traditional solutions
      const fallbackSolutions = await this.generateTraditionalSolutions(input.analysisResults);
      
      return {
        solutions: fallbackSolutions,
        approach: 'traditional',
        confidence: 0.5,
        recommendations: this.organizeSolutionsByTimeline(fallbackSolutions)
      };
    }
  }

  /**
   * Generate AI-powered solutions from contextual database or dynamic generation
   */
  private async generateAISolutions(
    input: ConsultationInput,
    problemMatch: any
  ): Promise<{
    solutions: EnhancedSolution[];
    stakeholderGuidance: StakeholderCommunication;
  }> {
    console.log('🤖 Generating AI-powered solutions...');

    const solutions: EnhancedSolution[] = [];
    let stakeholderGuidance: StakeholderCommunication;

    // Try to get solutions from the problem interpretation result
    if (problemMatch?.template) {
      // Get contextual solutions from database
      const { data: contextualSolutions, error } = await supabase
        .from('contextual_solutions')
        .select('*')
        .contains('problem_statement_ids', [problemMatch.template.id])
        .order('success_rate', { ascending: false });

      if (!error && contextualSolutions) {
        console.log(`📚 Found ${contextualSolutions.length} contextual solutions`);
        
        for (const solution of contextualSolutions) {
          const enhancedSolution = this.transformContextualSolution(
            solution,
            input.analysisResults,
            problemMatch.extractedContext
          );
          solutions.push(enhancedSolution);
        }
      }
    }

    // Generate stakeholder guidance from AI solutions
    if (solutions.length > 0) {
      stakeholderGuidance = this.generateAIStakeholderGuidance(
        solutions,
        problemMatch?.extractedContext
      );
    } else {
      // Fallback guidance
      stakeholderGuidance = this.generateTraditionalStakeholderGuidance(solutions);
    }

    console.log(`✅ Generated ${solutions.length} AI-powered solutions`);
    return { solutions, stakeholderGuidance };
  }

  /**
   * Generate traditional annotation-based solutions
   */
  private async generateTraditionalSolutions(annotations: Annotation[]): Promise<EnhancedSolution[]> {
    console.log('📊 Generating traditional annotation-based solutions...');

    const solutions: EnhancedSolution[] = [];
    const annotationsByPriority = this.groupAnnotationsByPriority(annotations);

    // Generate solutions for critical issues
    for (const annotation of annotationsByPriority.critical) {
      solutions.push(this.transformAnnotationToSolution(annotation, 'critical'));
    }

    // Generate solutions for high priority issues
    for (const annotation of annotationsByPriority.high) {
      solutions.push(this.transformAnnotationToSolution(annotation, 'high'));
    }

    // Generate solutions for medium priority issues (limit to top 3)
    for (const annotation of annotationsByPriority.medium.slice(0, 3)) {
      solutions.push(this.transformAnnotationToSolution(annotation, 'medium'));
    }

    console.log(`✅ Generated ${solutions.length} traditional solutions`);
    return solutions;
  }

  /**
   * Transform contextual solution from database to enhanced solution format
   */
  private transformContextualSolution(
    contextualSolution: ContextualSolution,
    annotations: Annotation[],
    businessContext: any
  ): EnhancedSolution {
    const relatedAnnotations = this.findRelatedAnnotations(
      contextualSolution.title,
      annotations
    );

    return {
      id: contextualSolution.id,
      title: contextualSolution.title,
      type: 'contextual',
      priority: this.determinePriorityFromContext(businessContext),
      recommendation: contextualSolution.recommendation,
      implementation: {
        phases: contextualSolution.problem_specific_guidance?.implementationPhases || [
          'Analysis and planning',
          'Implementation',
          'Testing and optimization'
        ],
        quickWins: contextualSolution.problem_specific_guidance?.quickWins || [],
        timeline: this.estimateTimelineFromContext(businessContext),
        effort: this.estimateEffortFromGuidance(contextualSolution.problem_specific_guidance)
      },
      businessImpact: {
        metrics: this.extractBusinessMetrics(contextualSolution.expected_impact),
        expectedImprovement: this.formatExpectedImprovement(contextualSolution.expected_impact),
        confidence: contextualSolution.success_rate
      },
      stakeholderGuidance: {
        executive: contextualSolution.stakeholder_communication?.executiveSummary || contextualSolution.stakeholder_communication?.ceoUpdate || '',
        technical: contextualSolution.stakeholder_communication?.developmentTeam || contextualSolution.stakeholder_communication?.technicalTeam || '',
        design: contextualSolution.stakeholder_communication?.designTeam || ''
      },
      originalAnnotations: relatedAnnotations
    };
  }

  /**
   * Transform annotation to solution format
   */
  private transformAnnotationToSolution(annotation: Annotation, priority: string): EnhancedSolution {
    return {
      id: annotation.id,
      title: annotation.title,
      type: 'traditional',
      priority: priority as any,
      recommendation: annotation.description,
      implementation: {
        phases: this.generateImplementationPhases(annotation),
        quickWins: this.generateQuickWins(annotation),
        timeline: this.estimateTimelineFromSeverity(annotation.severity),
        effort: this.estimateEffortFromAnnotation(annotation)
      },
      businessImpact: {
        metrics: this.generateBusinessMetrics(annotation),
        expectedImprovement: this.generateExpectedImprovement(annotation),
        confidence: (annotation as any).confidence || 0.8
      },
      stakeholderGuidance: {
        executive: this.generateExecutiveGuidance(annotation),
        technical: this.generateTechnicalGuidance(annotation),
        design: this.generateDesignGuidance(annotation)
      },
      originalAnnotations: [annotation]
    };
  }

  /**
   * Track usage and feedback for continuous improvement
   */
  async trackUsageAndFeedback(
    solutionId: string,
    approach: string,
    userSatisfaction: number
  ): Promise<void> {
    console.log('📊 Tracking solution usage and feedback:', {
      solutionId,
      approach,
      userSatisfaction
    });

    try {
      // Store feedback in user_problem_statements table
      const { error } = await supabase
        .from('user_problem_statements')
        .insert({
          original_statement: `Solution feedback: ${solutionId}`,
          satisfaction_score: userSatisfaction,
          implementation_feedback: `Approach: ${approach}`
        });

      if (error) {
        console.error('Failed to track feedback:', error);
      } else {
        console.log('✅ Feedback tracked successfully');
      }
    } catch (error) {
      console.error('Error tracking feedback:', error);
    }
  }

  // Helper methods for solution generation and organization

  private groupAnnotationsByPriority(annotations: Annotation[]) {
    return {
      critical: annotations.filter(a => a.severity === 'critical'),
      high: annotations.filter(a => a.severity === 'suggested' && ((a as any).confidence || 0) > 0.8),
      medium: annotations.filter(a => a.severity === 'suggested' && ((a as any).confidence || 0) <= 0.8),
      low: annotations.filter(a => a.severity === 'enhancement')
    };
  }

  private organizeSolutionsByTimeline(solutions: EnhancedSolution[]) {
    return {
      immediate: solutions.filter(s => 
        s.implementation.effort === 'low' || 
        s.priority === 'critical'
      ).slice(0, 3),
      shortTerm: solutions.filter(s => 
        s.implementation.effort === 'medium' && 
        s.priority !== 'low'
      ).slice(0, 4),
      longTerm: solutions.filter(s => 
        s.implementation.effort === 'high' || 
        s.priority === 'low'
      ).slice(0, 3)
    };
  }

  private generateAIStakeholderGuidance(
    solutions: EnhancedSolution[],
    businessContext: any
  ): StakeholderCommunication {
    const urgency = businessContext?.urgency || 'medium';
    const stakeholders = businessContext?.stakeholders || [];
    
    return {
      executiveSummary: this.generateExecutiveSummary(solutions, urgency),
      technicalRequirements: this.generateTechnicalRequirements(solutions),
      designRationale: this.generateDesignRationale(solutions),
      marketingAlignment: this.generateMarketingAlignment(solutions, businessContext),
      timelineExpectations: this.generateTimelineExpectations(solutions, urgency)
    };
  }

  private generateTraditionalStakeholderGuidance(solutions: EnhancedSolution[]): StakeholderCommunication {
    return {
      executiveSummary: `Analysis identified ${solutions.length} improvement opportunities with potential for significant user experience enhancement.`,
      technicalRequirements: 'Implementation will require front-end development resources and QA testing.',
      designRationale: 'Recommendations focus on improving usability, accessibility, and conversion optimization.',
      marketingAlignment: 'Changes should be communicated as user experience improvements and tested for impact.',
      timelineExpectations: 'Estimated 2-6 weeks for implementation depending on complexity and resource allocation.'
    };
  }

  // Additional helper methods for data transformation and analysis

  private findRelatedAnnotations(solutionTitle: string, annotations: Annotation[]): Annotation[] {
    const keywords = solutionTitle.toLowerCase().split(' ');
    return annotations.filter(annotation => {
      const annotationText = `${annotation.title} ${annotation.description}`.toLowerCase();
      return keywords.some(keyword => annotationText.includes(keyword));
    });
  }

  private determinePriorityFromContext(businessContext: any): 'critical' | 'high' | 'medium' | 'low' {
    if (businessContext?.urgency === 'critical') return 'critical';
    if (businessContext?.urgency === 'high') return 'high';
    if (businessContext?.urgency === 'medium') return 'medium';
    return 'low';
  }

  private estimateTimelineFromContext(businessContext: any): string {
    const urgency = businessContext?.urgency;
    const timeConstraints = businessContext?.timeConstraints || [];
    
    if (urgency === 'critical' || timeConstraints.some(c => c.includes('asap'))) {
      return '1-2 weeks';
    } else if (urgency === 'high') {
      return '2-4 weeks';
    } else {
      return '4-8 weeks';
    }
  }

  private estimateEffortFromGuidance(guidance: any): 'low' | 'medium' | 'high' {
    const phases = guidance?.implementationPhases?.length || 3;
    if (phases <= 2) return 'low';
    if (phases <= 4) return 'medium';
    return 'high';
  }

  private extractBusinessMetrics(expectedImpact: any): string[] {
    if (!expectedImpact) return ['User satisfaction', 'Task completion rate'];
    
    const metrics = [];
    if (expectedImpact.conversionMetrics) {
      metrics.push('Conversion rate');
    }
    if (expectedImpact.businessOutcomes) {
      metrics.push('Revenue impact');
    }
    if (expectedImpact.userExperience) {
      metrics.push('User satisfaction');
    }
    
    return metrics.length > 0 ? metrics : ['User satisfaction', 'Task completion rate'];
  }

  private formatExpectedImprovement(expectedImpact: any): string {
    if (expectedImpact?.conversionMetrics?.expectedImprovement) {
      return expectedImpact.conversionMetrics.expectedImprovement;
    }
    return '15-25% improvement expected';
  }

  private generateImplementationPhases(annotation: Annotation): string[] {
    const severity = annotation.severity;
    if (severity === 'critical') {
      return ['Immediate fix', 'Testing', 'Deployment'];
    } else if (severity === 'suggested') {
      return ['Analysis', 'Design iteration', 'Implementation', 'Testing'];
    } else {
      return ['Research', 'Design', 'Development', 'Testing', 'Optimization'];
    }
  }

  private generateQuickWins(annotation: Annotation): string[] {
    const category = annotation.category?.toLowerCase() || '';
    if (category.includes('color') || category.includes('text')) {
      return ['Update color scheme', 'Improve text contrast'];
    } else if (category.includes('button') || category.includes('cta')) {
      return ['Optimize button styling', 'Improve call-to-action placement'];
    }
    return ['Review current implementation', 'Plan improvement strategy'];
  }

  private estimateTimelineFromSeverity(severity: string): string {
    switch (severity) {
      case 'critical': return '1-2 days';
      case 'suggested': return '1-2 weeks';
      case 'enhancement': return '2-4 weeks';
      default: return '1-2 weeks';
    }
  }

  private estimateEffortFromAnnotation(annotation: Annotation): 'low' | 'medium' | 'high' {
    if (annotation.severity === 'critical') return 'low';
    if (annotation.severity === 'suggested') return 'medium';
    return 'high';
  }

  private generateBusinessMetrics(annotation: Annotation): string[] {
    const category = annotation.category?.toLowerCase() || '';
    if (category.includes('conversion') || category.includes('button')) {
      return ['Conversion rate', 'Click-through rate'];
    } else if (category.includes('navigation') || category.includes('menu')) {
      return ['Task completion rate', 'Time on page'];
    }
    return ['User satisfaction', 'Task completion rate'];
  }

  private generateExpectedImprovement(annotation: Annotation): string {
    const confidence = (annotation as any).confidence || 0.8;
    const improvement = Math.round(confidence * 30); // Scale to realistic improvement
    return `${improvement}% improvement expected`;
  }

  private generateExecutiveGuidance(annotation: Annotation): string {
    return `${annotation.title}: ${annotation.description.slice(0, 100)}...`;
  }

  private generateTechnicalGuidance(annotation: Annotation): string {
    return `Technical implementation required for: ${annotation.title}`;
  }

  private generateDesignGuidance(annotation: Annotation): string {
    return `Design consideration: ${annotation.title}`;
  }

  private generateExecutiveSummary(solutions: EnhancedSolution[], urgency: string): string {
    const criticalCount = solutions.filter(s => s.priority === 'critical').length;
    const totalCount = solutions.length;
    
    return `Analysis identified ${totalCount} improvement opportunities${criticalCount > 0 ? `, including ${criticalCount} critical issues` : ''}. ${urgency === 'high' ? 'Immediate action recommended.' : 'Systematic implementation recommended.'}`;
  }

  private generateTechnicalRequirements(solutions: EnhancedSolution[]): string {
    const effortLevels = solutions.map(s => s.implementation.effort);
    const hasHighEffort = effortLevels.includes('high');
    
    return `Implementation requires ${hasHighEffort ? 'significant development resources' : 'standard development resources'} and coordinated testing across affected components.`;
  }

  private generateDesignRationale(solutions: EnhancedSolution[]): string {
    return 'Recommendations are based on established UX principles, user research findings, and industry best practices for conversion optimization.';
  }

  private generateMarketingAlignment(solutions: EnhancedSolution[], businessContext: any): string {
    const businessModel = businessContext?.businessModel;
    if (businessModel === 'saas') {
      return 'Changes align with SaaS conversion optimization and user onboarding improvements.';
    }
    return 'Improvements support overall business goals and user experience enhancement.';
  }

  private generateTimelineExpectations(solutions: EnhancedSolution[], urgency: string): string {
    const quickWinCount = solutions.filter(s => s.implementation.effort === 'low').length;
    
    if (urgency === 'critical') {
      return `Critical fixes can be implemented within 1-2 weeks. ${quickWinCount} quick wins available for immediate impact.`;
    }
    return `Recommended phased approach over 2-8 weeks with ${quickWinCount} quick wins for early momentum.`;
  }

  private async trackProblemStatementUsage(
    originalStatement: string,
    templateId: string,
    analysisId?: string
  ): Promise<void> {
    try {
      await supabase
        .from('user_problem_statements')
        .insert({
          original_statement: originalStatement,
          matched_problem_statement_id: templateId,
          analysis_id: analysisId
        });
    } catch (error) {
      console.error('Failed to track problem statement usage:', error);
    }
  }

  private async storeConsultationResults(data: {
    analysisId: string;
    approach: string;
    confidence: number;
    solutionCount: number;
    problemStatementUsed: boolean;
  }): Promise<void> {
    try {
      await supabase
        .from('analysis_results')
        .update({
          synthesis_metadata: {
            consultationApproach: data.approach,
            consultationConfidence: data.confidence,
            solutionCount: data.solutionCount,
            problemStatementUsed: data.problemStatementUsed,
            consultationTimestamp: new Date().toISOString()
          }
        })
        .eq('analysis_id', data.analysisId);
    } catch (error) {
      console.error('Failed to store consultation results:', error);
    }
  }
}

// Export singleton instance
export const aiEnhancedSolutionEngine = new AIEnhancedSolutionEngine();