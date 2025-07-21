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

class BusinessImpactAnalyzer {
  private industryBenchmarks: Record<string, any>;
  private conversionData: Record<string, number>;
  
  constructor() {
    // Industry benchmarks for different sectors
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

  private assessCompetitiveAdvantage(issue: any, industry: string) {
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
}

export { BusinessImpactAnalyzer };