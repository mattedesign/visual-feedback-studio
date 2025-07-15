import { BusinessImpactMetrics } from '@/types/businessImpact';

export interface StrategicFramework {
  businessGoals: string[];
  userPersonas: string[];
  competitiveContext: string;
  successMetrics: string[];
  riskFactors: string[];
  implementationPriorities: string[];
}

export interface EnhancedAnalysisContext {
  technicalAudit: any;
  businessImpact: BusinessImpactMetrics;
  strategicFramework: StrategicFramework;
  userContext: string;
  competitorInsights?: any[];
}

export class StrategicContextBuilder {
  /**
   * Build strategic framework from business context and technical data
   */
  static buildStrategicFramework(
    businessContext: any,
    technicalAudit: any,
    userContext: string
  ): StrategicFramework {
    return {
      businessGoals: this.extractBusinessGoals(businessContext, userContext),
      userPersonas: this.identifyUserPersonas(userContext),
      competitiveContext: this.buildCompetitiveContext(technicalAudit),
      successMetrics: this.defineSuccessMetrics(businessContext, technicalAudit),
      riskFactors: this.identifyRiskFactors(technicalAudit),
      implementationPriorities: this.prioritizeImplementation(technicalAudit)
    };
  }

  /**
   * Create comprehensive analysis context for Claude prompts
   */
  static buildAnalysisContext(
    technicalAudit: any,
    businessImpact: BusinessImpactMetrics,
    userContext: string,
    competitorInsights?: any[]
  ): EnhancedAnalysisContext {
    const strategicFramework = this.buildStrategicFramework({}, technicalAudit, userContext);

    return {
      technicalAudit,
      businessImpact,
      strategicFramework,
      userContext,
      competitorInsights
    };
  }

  /**
   * Generate consultant-level insights prompt structure
   */
  static buildConsultantPrompt(context: EnhancedAnalysisContext, persona: string): string {
    const basePrompt = this.getPersonaBasePrompt(persona);
    const contextualData = this.formatContextualData(context);
    const strategicGuidance = this.getStrategicGuidance(context);
    
    return `
${basePrompt}

## STRATEGIC ANALYSIS FRAMEWORK

### Business Context
${contextualData.businessContext}

### Technical Foundation Analysis
${contextualData.technicalAnalysis}

### Competitive Intelligence
${contextualData.competitiveContext}

### Strategic Priorities
${strategicGuidance.priorities}

### Success Metrics & ROI
${strategicGuidance.metrics}

## ANALYSIS REQUIREMENTS

Provide consultant-level insights that:
1. Connect technical findings to business outcomes
2. Quantify impact using provided business metrics
3. Present strategic recommendations with implementation roadmap
4. Address competitive positioning and market opportunities
5. Include risk assessment and mitigation strategies

Focus on actionable insights that drive measurable business results.
    `.trim();
  }

  // Private helper methods
  private static extractBusinessGoals(businessContext: any, userContext: string): string[] {
    const goals = [];
    
    // Extract from user context
    if (userContext.toLowerCase().includes('conversion')) {
      goals.push('Increase conversion rates');
    }
    if (userContext.toLowerCase().includes('engagement')) {
      goals.push('Improve user engagement');
    }
    if (userContext.toLowerCase().includes('accessibility')) {
      goals.push('Enhance accessibility compliance');
    }
    if (userContext.toLowerCase().includes('performance')) {
      goals.push('Optimize performance metrics');
    }

    // Default business goals if none extracted
    if (goals.length === 0) {
      goals.push('Improve user experience', 'Increase conversion rates', 'Reduce bounce rates');
    }

    return goals;
  }

  private static identifyUserPersonas(userContext: string): string[] {
    const personas = [];
    
    if (userContext.toLowerCase().includes('mobile')) {
      personas.push('Mobile-first users');
    }
    if (userContext.toLowerCase().includes('accessibility') || userContext.toLowerCase().includes('disabled')) {
      personas.push('Users with disabilities');
    }
    if (userContext.toLowerCase().includes('senior') || userContext.toLowerCase().includes('elderly')) {
      personas.push('Senior users');
    }
    
    // Default personas
    if (personas.length === 0) {
      personas.push('Primary users', 'Power users', 'Occasional users');
    }

    return personas;
  }

  private static buildCompetitiveContext(technicalAudit: any): string {
    const accessibilityScore = technicalAudit?.accessibility?.averageScore || 0;
    const performanceScore = technicalAudit?.performance?.averageScore || 0;
    
    if (accessibilityScore < 60 && performanceScore < 60) {
      return 'Significantly behind industry standards in both accessibility and performance';
    } else if (accessibilityScore > 80 && performanceScore > 80) {
      return 'Leading industry standards with strong technical foundation';
    } else {
      return 'Mixed competitive position with opportunities for strategic improvement';
    }
  }

  private static defineSuccessMetrics(businessContext: any, technicalAudit: any): string[] {
    return [
      'Conversion rate improvement (%)',
      'Page load time reduction (seconds)',
      'Accessibility compliance score increase',
      'User task completion rate',
      'Customer satisfaction score (CSAT)',
      'Return on investment (ROI)',
      'Time to value for new users'
    ];
  }

  private static identifyRiskFactors(technicalAudit: any): string[] {
    const risks = [];
    
    if (technicalAudit?.accessibility?.criticalIssues > 0) {
      risks.push('Legal compliance risk due to accessibility barriers');
    }
    if (technicalAudit?.performance?.averageScore < 50) {
      risks.push('User abandonment risk due to poor performance');
    }
    if (technicalAudit?.technical?.htmlIssues > 10) {
      risks.push('Technical debt impacting development velocity');
    }
    
    return risks;
  }

  private static prioritizeImplementation(technicalAudit: any): string[] {
    const priorities = [];
    
    // High-impact, low-effort items first
    if (technicalAudit?.accessibility?.criticalIssues > 0) {
      priorities.push('1. Address critical accessibility barriers');
    }
    if (technicalAudit?.performance?.averageScore < 70) {
      priorities.push('2. Optimize core performance metrics');
    }
    priorities.push('3. Implement user testing and feedback loops');
    priorities.push('4. Establish design system consistency');
    
    return priorities;
  }

  private static getPersonaBasePrompt(persona: string): string {
    const prompts = {
      strategic: `You are a senior UX strategist and business consultant analyzing this interface through a strategic business lens.`,
      clarity: `You are a snarky UX goblin who tells the brutal truth about user experience with wit and practical wisdom.`,
      conversion: `You are a conversion optimization expert focused on maximizing business outcomes through UX improvements.`,
      mirror: `You are an empathetic UX researcher reflecting the user's emotional journey and pain points.`,
      mad: `You are a mad scientist UX researcher conducting wild experiments to push the boundaries of user experience.`,
      exec: `You are a C-level executive consultant focused on ROI, competitive advantage, and business impact.`
    };

    return prompts[persona as keyof typeof prompts] || prompts.strategic;
  }

  private static formatContextualData(context: EnhancedAnalysisContext) {
    return {
      businessContext: `
Revenue Impact: $${context.businessImpact.revenueEstimate.annual.toLocaleString()} potential annual increase
Implementation Timeline: ${context.businessImpact.implementationTimeline.total} weeks total
Competitive Position: ${context.businessImpact.competitivePosition.score}/10
Business Goals: ${context.strategicFramework.businessGoals.join(', ')}
      `.trim(),

      technicalAnalysis: `
Accessibility Score: ${context.technicalAudit?.accessibility?.averageScore || 0}/100
Performance Score: ${context.technicalAudit?.performance?.averageScore || 0}/100
Critical Issues: ${context.technicalAudit?.accessibility?.criticalIssues || 0}
Technical Debt: ${(context.technicalAudit?.technical?.htmlIssues || 0) + (context.technicalAudit?.technical?.seoIssues || 0)} issues
      `.trim(),

      competitiveContext: context.strategicFramework.competitiveContext
    };
  }

  private static getStrategicGuidance(context: EnhancedAnalysisContext) {
    return {
      priorities: context.strategicFramework.implementationPriorities.join('\n'),
      metrics: context.strategicFramework.successMetrics.join('\n- ')
    };
  }
}