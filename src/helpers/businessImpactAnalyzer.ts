// Enhanced Business Impact Analysis Module
// Phase 2, Step 2.2: Advanced ROI calculations and business metrics

export interface BusinessImpactMetrics {
  roi_score: number;
  priority_level: 'critical' | 'high' | 'medium' | 'low';
  revenue_impact: {
    monthly_increase: string;
    annual_projection: string;
    confidence_level: 'high' | 'medium' | 'low';
    methodology: string;
  };
  user_experience_metrics: {
    time_reduction?: string;
    error_reduction?: string;
    satisfaction_improvement?: string;
    task_completion_improvement?: string;
  };
  accessibility_impact: {
    affected_user_percentage: string;
    compliance_level: string;
    legal_risk_reduction: string;
  };
  conversion_metrics: {
    estimated_lift_percentage: number;
    affected_conversion_points: string[];
    statistical_confidence: number;
  };
  implementation_analysis: {
    effort_category: 'quick-win' | 'standard' | 'complex';
    time_estimate: string;
    resource_requirements: string[];
    technical_debt_impact: 'reduces' | 'neutral' | 'increases';
  };
  competitive_advantage: {
    benchmark_position: string;
    differentiation_value: string;
    market_impact: string;
  };
}

export interface EnhancedAnalysisIssueWithBusiness {
  id: string;
  level: 'molecular' | 'component' | 'layout' | 'flow';
  severity: 'critical' | 'warning' | 'improvement';
  category: 'accessibility' | 'usability' | 'visual' | 'content' | 'performance';
  confidence: number;
  impact_scope: 'user-trust' | 'task-completion' | 'conversion' | 'readability' | 'performance' | 'aesthetic';
  
  // Enhanced business impact
  business_impact: BusinessImpactMetrics;
  
  element: {
    type: string;
    location: {
      x: number;
      y: number;
      width: number;
      height: number;
      xPercent: number;
      yPercent: number;
      widthPercent: number;
      heightPercent: number;
    };
  };
  
  description: string;
  impact: string;
  suggested_fix: string;
  
  implementation: {
    effort: 'minutes' | 'hours' | 'days';
    code_snippet?: string;
    design_guidance?: string;
  };
  
  violated_patterns?: string[];
  rationale: string[];
  metrics: {
    affects_users: string;
    potential_improvement: string;
  };
}

// Phase 2.2: Enhanced Business Impact Analysis for Figmant
class BusinessImpactAnalyzer {
  private industryBenchmarks: Record<string, any>;
  private conversionData: Record<string, number>;
  private figmantMetrics: Record<string, any>;
  
  constructor() {
    // Enhanced industry benchmarks for Figmant Phase 2.2
    this.industryBenchmarks = {
      'e-commerce': {
        averageConversionRate: 2.5,
        averageOrderValue: 75,
        accessibilityCompliance: 65,
        mobileUsage: 85
      },
      'saas': {
        averageConversionRate: 3.2,
        averageOrderValue: 150,
        accessibilityCompliance: 72,
        mobileUsage: 70
      },
      'fintech': {
        averageConversionRate: 2.8,
        averageOrderValue: 200,
        accessibilityCompliance: 85,
        mobileUsage: 90
      },
      'healthcare': {
        averageConversionRate: 4.1,
        averageOrderValue: 120,
        accessibilityCompliance: 95,
        mobileUsage: 80
      },
      'default': {
        averageConversionRate: 3.0,
        averageOrderValue: 100,
        accessibilityCompliance: 70,
        mobileUsage: 80
      }
    };

    // Impact factors for different issue types
    this.conversionData = {
      'critical-accessibility': 15.0,
      'critical-usability': 12.0,
      'critical-performance': 20.0,
      'warning-accessibility': 8.0,
      'warning-usability': 6.0,
      'warning-performance': 10.0,
      'improvement-visual': 3.0,
      'improvement-content': 4.0
    };
  }

  analyzeBusinessImpact(
    issue: any,
    screenType: string,
    industry: string = 'default',
    monthlyTraffic: number = 10000,
    currentConversionRate: number = 3.0
  ): BusinessImpactMetrics {
    
    const benchmark = this.industryBenchmarks[industry] || this.industryBenchmarks['default'];
    const impactKey = `${issue.severity}-${issue.category}`;
    const baseImpactPercentage = this.conversionData[impactKey] || 5.0;
    
    // Calculate ROI based on issue characteristics
    const roiScore = this.calculateROIScore(issue, baseImpactPercentage, benchmark);
    
    // Determine priority level
    const priorityLevel = this.determinePriorityLevel(issue, roiScore);
    
    // Calculate revenue impact
    const revenueImpact = this.calculateRevenueImpact(
      baseImpactPercentage,
      monthlyTraffic,
      currentConversionRate,
      benchmark.averageOrderValue,
      issue.confidence
    );
    
    // Analyze user experience metrics
    const uxMetrics = this.calculateUXMetrics(issue, screenType);
    
    // Assess accessibility impact
    const accessibilityImpact = this.calculateAccessibilityImpact(issue, benchmark);
    
    // Calculate conversion metrics
    const conversionMetrics = this.calculateConversionMetrics(
      issue,
      baseImpactPercentage,
      currentConversionRate
    );
    
    // Analyze implementation effort
    const implementationAnalysis = this.analyzeImplementationEffort(issue);
    
    // Assess competitive advantage
    const competitiveAdvantage = this.assessCompetitiveAdvantage(issue, industry);

    return {
      roi_score: roiScore,
      priority_level: priorityLevel,
      revenue_impact: revenueImpact,
      user_experience_metrics: uxMetrics,
      accessibility_impact: accessibilityImpact,
      conversion_metrics: conversionMetrics,
      implementation_analysis: implementationAnalysis,
      competitive_advantage: competitiveAdvantage
    };
  }

  private calculateROIScore(issue: any, baseImpact: number, benchmark: any): number {
    let score = baseImpact;
    
    // Confidence multiplier
    score *= issue.confidence;
    
    // Severity multiplier
    const severityMultipliers = {
      'critical': 1.5,
      'warning': 1.0,
      'improvement': 0.6
    };
    score *= severityMultipliers[issue.severity] || 1.0;
    
    // Impact scope multiplier
    const scopeMultipliers = {
      'conversion': 1.4,
      'task-completion': 1.3,
      'user-trust': 1.2,
      'performance': 1.1,
      'readability': 0.9,
      'aesthetic': 0.7
    };
    score *= scopeMultipliers[issue.impact_scope] || 1.0;
    
    // Implementation effort divisor (easier = higher ROI)
    const effortDivisors = {
      'minutes': 1.0,
      'hours': 0.8,
      'days': 0.5
    };
    score *= effortDivisors[issue.implementation?.effort] || 0.8;
    
    return Math.round(score * 10) / 10;
  }

  private determinePriorityLevel(issue: any, roiScore: number): 'critical' | 'high' | 'medium' | 'low' {
    if (issue.severity === 'critical' && roiScore >= 15) return 'critical';
    if (roiScore >= 12) return 'high';
    if (roiScore >= 8) return 'medium';
    return 'low';
  }

  private calculateRevenueImpact(
    impactPercentage: number,
    monthlyTraffic: number,
    conversionRate: number,
    averageOrderValue: number,
    confidence: number
  ) {
    const currentMonthlyRevenue = monthlyTraffic * (conversionRate / 100) * averageOrderValue;
    const adjustedImpact = impactPercentage * confidence;
    const monthlyIncrease = (currentMonthlyRevenue * adjustedImpact / 100);
    const annualIncrease = monthlyIncrease * 12;
    
    const confidenceLevel: 'high' | 'medium' | 'low' = confidence >= 0.8 ? 'high' : confidence >= 0.6 ? 'medium' : 'low';
    
    return {
      monthly_increase: `$${Math.round(monthlyIncrease).toLocaleString()}`,
      annual_projection: `$${Math.round(annualIncrease).toLocaleString()}`,
      confidence_level: confidenceLevel,
      methodology: `Based on ${adjustedImpact.toFixed(1)}% conversion improvement from ${impactPercentage}% base impact × ${Math.round(confidence * 100)}% confidence`
    };
  }

  private calculateUXMetrics(issue: any, screenType: string) {
    const metrics: any = {};
    
    // Screen-type specific metrics
    if (screenType === 'checkout' && issue.category === 'usability') {
      metrics.error_reduction = '15-25%';
      metrics.task_completion_improvement = '8-12%';
    }
    
    if (screenType === 'form' && issue.category === 'accessibility') {
      metrics.error_reduction = '20-30%';
      metrics.satisfaction_improvement = '10-15%';
    }
    
    if (issue.category === 'performance') {
      metrics.time_reduction = '20-40%';
      metrics.satisfaction_improvement = '15-25%';
    }
    
    if (issue.category === 'visual' && issue.severity === 'critical') {
      metrics.satisfaction_improvement = '5-10%';
    }
    
    return metrics;
  }

  private calculateAccessibilityImpact(issue: any, benchmark: any) {
    let affectedPercentage = '0%';
    let complianceLevel = 'WCAG 2.1 AA Compliant';
    let riskReduction = 'Low legal risk';
    
    if (issue.category === 'accessibility') {
      switch (issue.severity) {
        case 'critical':
          affectedPercentage = '15-20%';
          complianceLevel = 'Non-compliant with WCAG 2.1 AA';
          riskReduction = 'High legal risk reduction';
          break;
        case 'warning':
          affectedPercentage = '8-12%';
          complianceLevel = 'Partially compliant with WCAG 2.1 AA';
          riskReduction = 'Medium legal risk reduction';
          break;
        case 'improvement':
          affectedPercentage = '3-5%';
          complianceLevel = 'Enhances WCAG 2.1 AA compliance';
          riskReduction = 'Proactive compliance improvement';
          break;
      }
    }
    
    return {
      affected_user_percentage: affectedPercentage,
      compliance_level: complianceLevel,
      legal_risk_reduction: riskReduction
    };
  }

  private calculateConversionMetrics(issue: any, baseImpact: number, currentRate: number) {
    const estimatedLift = baseImpact * issue.confidence;
    
    let affectedPoints = ['Primary conversion flow'];
    if (issue.impact_scope === 'task-completion') {
      affectedPoints = ['Form completion', 'Task success rate'];
    }
    if (issue.impact_scope === 'user-trust') {
      affectedPoints = ['Trust indicators', 'Credibility signals'];
    }
    
    return {
      estimated_lift_percentage: Math.round(estimatedLift * 10) / 10,
      affected_conversion_points: affectedPoints,
      statistical_confidence: Math.round(issue.confidence * 100)
    };
  }

  private analyzeImplementationEffort(issue: any) {
    const effort = issue.implementation?.effort || 'hours';
    
    let category: 'quick-win' | 'standard' | 'complex';
    let timeEstimate: string;
    let resources: string[];
    let techDebtImpact: 'reduces' | 'neutral' | 'increases';
    
    switch (effort) {
      case 'minutes':
        category = 'quick-win';
        timeEstimate = '15-30 minutes';
        resources = ['Frontend developer'];
        techDebtImpact = 'reduces';
        break;
      case 'hours':
        category = 'standard';
        timeEstimate = '2-8 hours';
        resources = ['Frontend developer', 'Designer (optional)'];
        techDebtImpact = 'neutral';
        break;
      case 'days':
        category = 'complex';
        timeEstimate = '1-3 days';
        resources = ['Frontend developer', 'Designer', 'QA tester'];
        techDebtImpact = 'neutral';
        break;
      default:
        category = 'standard';
        timeEstimate = '2-8 hours';
        resources = ['Frontend developer'];
        techDebtImpact = 'neutral';
    }
    
    return {
      effort_category: category,
      time_estimate: timeEstimate,
      resource_requirements: resources,
      technical_debt_impact: techDebtImpact
    };
  }

  private assessCompetitiveAdvantage(issue: any, industry: string): any {
    let benchmarkPosition = 'Industry average';
    let differentiationValue = 'Standard improvement';
    let marketImpact = 'Maintains competitive position';
    
    if (issue.severity === 'critical') {
      benchmarkPosition = 'Below industry standard';
      differentiationValue = 'Critical for competitive parity';
      marketImpact = 'Prevents competitive disadvantage';
    }
    
    if (issue.confidence >= 0.8 && issue.impact_scope === 'conversion') {
      benchmarkPosition = 'Above industry average potential';
      differentiationValue = 'Significant competitive advantage';
      marketImpact = 'Creates market differentiation';
    }
    
    return {
      benchmark_position: benchmarkPosition,
      differentiation_value: differentiationValue,
      market_impact: marketImpact
    };
  }

  // Aggregate analysis for full report
  generateBusinessSummary(issues: EnhancedAnalysisIssueWithBusiness[]) {
    const totalROI = issues.reduce((sum, issue) => sum + issue.business_impact.roi_score, 0);
    const quickWins = issues.filter(i => i.business_impact.implementation_analysis.effort_category === 'quick-win');
    const criticalIssues = issues.filter(i => i.business_impact.priority_level === 'critical');
    
    const totalMonthlyRevenue = issues.reduce((sum, issue) => {
      const revenueStr = issue.business_impact.revenue_impact.monthly_increase.replace(/[$,]/g, '');
      return sum + parseInt(revenueStr, 10);
    }, 0);
    
    const implementationRoadmap = {
      immediate: quickWins.slice(0, 3),
      shortTerm: issues.filter(i => 
        i.business_impact.implementation_analysis.effort_category === 'standard' && 
        i.business_impact.priority_level === 'high'
      ).slice(0, 5),
      longTerm: issues.filter(i => 
        i.business_impact.implementation_analysis.effort_category === 'complex'
      )
    };
    
    return {
      totalPotentialRevenue: `$${totalMonthlyRevenue.toLocaleString()}`,
      quickWinsAvailable: quickWins.length,
      criticalIssuesCount: criticalIssues.length,
      averageROIScore: Math.round((totalROI / issues.length) * 10) / 10,
      implementationRoadmap,
      topRecommendation: issues.sort((a, b) => b.business_impact.roi_score - a.business_impact.roi_score)[0]?.description || 'No issues found',
      quickestWin: quickWins.sort((a, b) => b.business_impact.roi_score - a.business_impact.roi_score)[0]?.description || 'No quick wins available',
      highestImpact: issues.sort((a, b) => b.business_impact.roi_score - a.business_impact.roi_score)[0]?.description || 'No high impact items'
    };
  }

  // Phase 2.2: Enhanced Figmant-specific business impact calculations
  calculateFigmantBusinessMetrics(analysisData: {
    issues: FigmantIssueWithBusinessImpact[];
    screenType: string;
    industry?: string;
    userVolume?: number;
    conversionBaseline?: number;
  }): FigmantBusinessMetrics {
    const { issues, screenType, industry = 'technology', userVolume = 10000, conversionBaseline = 2.5 } = analysisData;
    
    // Calculate screen-specific multipliers
    const screenMultipliers = this.getScreenTypeMultipliers(screenType);
    
    // Calculate ROI projections based on issue severity and confidence
    const roiProjections = this.calculateFigmantROI(issues, screenMultipliers, userVolume, conversionBaseline);
    
    // Generate implementation roadmap with priorities
    const implementationRoadmap = this.generateFigmantRoadmap(issues, screenType);
    
    // Create priority matrix
    const priorityMatrix = this.createPriorityMatrix(issues);
    
    // Generate A/B test hypotheses
    const abTestHypotheses = this.generateABTestHypotheses(issues, screenType);
    
    return {
      roiProjections,
      implementationRoadmap,
      priorityMatrix,
      abTestHypotheses,
      businessImpactScore: this.calculateOverallBusinessImpact(issues),
      conversionOptimization: this.analyzeConversionOptimization(issues, screenType),
      competitiveAdvantage: this.assessFigmantCompetitiveAdvantage(issues, industry)
    };
  }

  private getScreenTypeMultipliers(screenType: string): Record<string, number> {
    const multipliers = {
      'checkout': { conversion: 1.8, revenue: 1.5, retention: 1.2 },
      'landing': { conversion: 1.6, revenue: 1.3, retention: 1.1 },
      'dashboard': { retention: 1.7, engagement: 1.4, satisfaction: 1.3 },
      'form': { completion: 1.5, conversion: 1.4, acquisition: 1.2 },
      'feed': { engagement: 1.6, retention: 1.3, satisfaction: 1.2 },
      'profile': { retention: 1.4, satisfaction: 1.3, engagement: 1.1 },
      'generic': { conversion: 1.0, revenue: 1.0, retention: 1.0 }
    };
    
    return multipliers[screenType] || multipliers['generic'];
  }

  private calculateFigmantROI(
    issues: FigmantIssueWithBusinessImpact[], 
    multipliers: Record<string, number>,
    userVolume: number,
    conversionBaseline: number
  ): FigmantROIProjections {
    let totalAnnualValue = 0;
    let implementationCost = 0;
    
    issues.forEach(issue => {
      const impactValue = this.calculateIssueBusinessValue(issue, multipliers, userVolume, conversionBaseline);
      totalAnnualValue += impactValue.annualValue;
      implementationCost += impactValue.implementationCost;
    });

    const roi = ((totalAnnualValue - implementationCost) / implementationCost) * 100;
    
    return {
      annualValue: Math.round(totalAnnualValue),
      implementationCost: Math.round(implementationCost),
      roiPercentage: Math.round(roi),
      paybackMonths: Math.round((implementationCost / totalAnnualValue) * 12),
      confidenceLevel: this.calculateROIConfidence(issues),
      breakdown: {
        highImpact: Math.round(totalAnnualValue * 0.4),
        mediumImpact: Math.round(totalAnnualValue * 0.35),
        lowImpact: Math.round(totalAnnualValue * 0.25)
      }
    };
  }

  private calculateIssueBusinessValue(
    issue: FigmantIssueWithBusinessImpact,
    multipliers: Record<string, number>,
    userVolume: number,
    conversionBaseline: number
  ): { annualValue: number; implementationCost: number } {
    // Base impact calculation
    let baseImpact = 0;
    
    switch (issue.severity) {
      case 'critical':
        baseImpact = userVolume * 0.15 * (conversionBaseline / 100); // 15% of users affected
        break;
      case 'warning':
        baseImpact = userVolume * 0.08 * (conversionBaseline / 100); // 8% of users affected
        break;
      case 'improvement':
        baseImpact = userVolume * 0.03 * (conversionBaseline / 100); // 3% of users affected
        break;
    }

    // Apply confidence multiplier
    const confidenceMultiplier = issue.confidence || 0.7;
    baseImpact *= confidenceMultiplier;

    // Apply screen-type multipliers
    const relevantMultiplier = multipliers[issue.impact_scope] || 1.0;
    baseImpact *= relevantMultiplier;

    // Calculate annual value (assuming $50 average value per conversion)
    const annualValue = baseImpact * 50 * 12;

    // Calculate implementation cost based on effort
    const implementationCost = this.getImplementationCost(issue.implementation?.effort || 'hours');

    return { annualValue, implementationCost };
  }

  private getImplementationCost(effort: string): number {
    const costs = {
      'minutes': 100,   // $100 for quick fixes
      'hours': 800,     // $800 for medium fixes (1 day)
      'days': 4000      // $4000 for complex fixes (5 days)
    };
    return costs[effort] || costs['hours'];
  }

  private generateFigmantRoadmap(issues: FigmantIssueWithBusinessImpact[], screenType: string): FigmantImplementationRoadmap {
    const sortedIssues = [...issues].sort((a, b) => {
      const scoreA = (a.business_impact?.roi_score || 0) * (a.confidence || 0.5);
      const scoreB = (b.business_impact?.roi_score || 0) * (b.confidence || 0.5);
      return scoreB - scoreA;
    });

    return {
      quickWins: sortedIssues
        .filter(i => i.implementation?.effort === 'minutes')
        .slice(0, 3)
        .map(i => ({
          title: i.description,
          effort: '< 30 minutes',
          impact: i.impact_scope,
          priority: 'High'
        })),
      weekOne: sortedIssues
        .filter(i => i.implementation?.effort === 'hours')
        .slice(0, 2)
        .map(i => ({
          title: i.description,
          effort: '1-2 days',
          impact: i.impact_scope,
          priority: 'Medium'
        })),
      strategic: sortedIssues
        .filter(i => i.implementation?.effort === 'days')
        .slice(0, 2)
        .map(i => ({
          title: i.description,
          effort: '1-2 weeks',
          impact: i.impact_scope,
          priority: 'Strategic'
        })),
      estimatedTimeline: `${this.calculateTotalTimeline(sortedIssues)} weeks`
    };
  }

  private createPriorityMatrix(issues: FigmantIssueWithBusinessImpact[]): FigmantPriorityMatrix {
    const matrix = {
      highImpactLowEffort: [] as string[],
      highImpactHighEffort: [] as string[],
      lowImpactLowEffort: [] as string[],
      lowImpactHighEffort: [] as string[]
    };

    issues.forEach(issue => {
      const isHighImpact = issue.severity === 'critical' || (issue.confidence || 0) > 0.8;
      const isLowEffort = issue.implementation?.effort === 'minutes' || issue.implementation?.effort === 'hours';

      if (isHighImpact && isLowEffort) {
        matrix.highImpactLowEffort.push(issue.description);
      } else if (isHighImpact && !isLowEffort) {
        matrix.highImpactHighEffort.push(issue.description);
      } else if (!isHighImpact && isLowEffort) {
        matrix.lowImpactLowEffort.push(issue.description);
      } else {
        matrix.lowImpactHighEffort.push(issue.description);
      }
    });

    return matrix;
  }

  private generateABTestHypotheses(issues: FigmantIssueWithBusinessImpact[], screenType: string): FigmantABTestHypothesis[] {
    return issues
      .filter(i => i.confidence && i.confidence >= 0.7)
      .slice(0, 3)
      .map(issue => ({
        hypothesis: `Fixing "${issue.description}" will improve ${issue.impact_scope} by 15-25%`,
        testDuration: this.getTestDuration(issue.severity),
        successMetric: this.getSuccessMetric(issue.impact_scope),
        expectedLift: this.getExpectedLift(issue.severity),
        testComplexity: this.getTestComplexity(issue.implementation?.effort || 'hours')
      }));
  }

  private calculateOverallBusinessImpact(issues: FigmantIssueWithBusinessImpact[]): number {
    const weights = { critical: 0.5, warning: 0.3, improvement: 0.2 };
    let totalScore = 0;
    let totalWeight = 0;

    issues.forEach(issue => {
      const weight = weights[issue.severity];
      const confidence = issue.confidence || 0.5;
      totalScore += weight * confidence * 100;
      totalWeight += weight;
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  private analyzeConversionOptimization(issues: FigmantIssueWithBusinessImpact[], screenType: string): any {
    const conversionIssues = issues.filter(i => 
      i.impact_scope === 'conversion' || i.impact_scope === 'task-completion'
    );

    return {
      potentialLift: conversionIssues.length * 0.05, // 5% per issue
      criticalBarriers: conversionIssues.filter(i => i.severity === 'critical').length,
      screenOptimization: this.getScreenOptimization(screenType),
      recommendations: conversionIssues.slice(0, 3).map(i => i.suggested_fix)
    };
  }

  private assessFigmantCompetitiveAdvantage(issues: FigmantIssueWithBusinessImpact[], industry: string): any {
    return {
      industryPosition: 'Above Average', // Placeholder
      differentiators: issues.filter(i => i.severity === 'improvement').length,
      marketOpportunity: 'Medium',
      benchmarkScore: 75 // Placeholder
    };
  }

  // Helper methods
  private calculateROIConfidence(issues: FigmantIssueWithBusinessImpact[]): number {
    const avgConfidence = issues.reduce((sum, i) => sum + (i.confidence || 0.5), 0) / issues.length;
    return Math.round(avgConfidence * 100);
  }

  private calculateTotalTimeline(issues: FigmantIssueWithBusinessImpact[]): number {
    const effortDays = { minutes: 0.1, hours: 1, days: 5 };
    const totalDays = issues.reduce((sum, i) => 
      sum + (effortDays[i.implementation?.effort || 'hours'] || 1), 0
    );
    return Math.ceil(totalDays / 7); // Convert to weeks
  }

  private getTestDuration(severity: string): string {
    return severity === 'critical' ? '2-3 weeks' : '3-4 weeks';
  }

  private getSuccessMetric(impact: string): string {
    const metrics = {
      'conversion': 'Conversion Rate',
      'task-completion': 'Task Completion Rate',
      'user-trust': 'User Satisfaction Score',
      'readability': 'Time on Page',
      'performance': 'Page Load Speed'
    };
    return metrics[impact] || 'Engagement Rate';
  }

  private getExpectedLift(severity: string): string {
    const lifts = { critical: '20-30%', warning: '10-20%', improvement: '5-15%' };
    return lifts[severity] || '10-20%';
  }

  private getTestComplexity(effort: string): string {
    const complexity = { minutes: 'Low', hours: 'Medium', days: 'High' };
    return complexity[effort] || 'Medium';
  }

  private getScreenOptimization(screenType: string): string {
    const optimizations = {
      'checkout': 'Streamline payment flow and reduce form friction',
      'landing': 'Optimize CTA placement and value proposition clarity',
      'dashboard': 'Improve data visualization and action accessibility',
      'form': 'Reduce cognitive load and provide clear validation',
      'feed': 'Enhance content discovery and engagement triggers'
    };
    return optimizations[screenType] || 'General UX improvements';
  }
}

// Enhanced type definitions for Phase 2.2
interface IssueWithBusinessImpact extends EnhancedAnalysisIssueWithBusiness {
  // Base interface for business impact analysis
}

interface FigmantIssueWithBusinessImpact extends EnhancedAnalysisIssueWithBusiness {
  impact_scope: 'user-trust' | 'task-completion' | 'conversion' | 'readability' | 'performance' | 'aesthetic';
}

interface FigmantBusinessMetrics {
  roiProjections: FigmantROIProjections;
  implementationRoadmap: FigmantImplementationRoadmap;
  priorityMatrix: FigmantPriorityMatrix;
  abTestHypotheses: FigmantABTestHypothesis[];
  businessImpactScore: number;
  conversionOptimization: any;
  competitiveAdvantage: any;
}

interface FigmantROIProjections {
  annualValue: number;
  implementationCost: number;
  roiPercentage: number;
  paybackMonths: number;
  confidenceLevel: number;
  breakdown: {
    highImpact: number;
    mediumImpact: number;
    lowImpact: number;
  };
}

interface FigmantImplementationRoadmap {
  quickWins: Array<{ title: string; effort: string; impact: string; priority: string }>;
  weekOne: Array<{ title: string; effort: string; impact: string; priority: string }>;
  strategic: Array<{ title: string; effort: string; impact: string; priority: string }>;
  estimatedTimeline: string;
}

interface FigmantPriorityMatrix {
  highImpactLowEffort: string[];
  highImpactHighEffort: string[];
  lowImpactLowEffort: string[];
  lowImpactHighEffort: string[];
}

interface FigmantABTestHypothesis {
  hypothesis: string;
  testDuration: string;
  successMetric: string;
  expectedLift: string;
  testComplexity: string;
}

export { BusinessImpactAnalyzer };