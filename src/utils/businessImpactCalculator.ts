import { BusinessImpactMetrics, QuickWin, MajorProject } from '@/types/businessImpact';

interface TechnicalAuditData {
  accessibility: {
    averageScore: number;
    criticalIssues: number;
    totalIssues: number;
  };
  performance: {
    averageScore: number;
    failingMetrics: number;
    totalMetrics: number;
  };
  components: {
    totalComponents: number;
    accessibilityIssues: number;
  };
  technical: {
    htmlIssues: number;
    seoIssues: number;
  };
}

interface BusinessContext {
  industry?: string;
  userBase?: number;
  averageOrderValue?: number;
  conversionRate?: number;
  trafficVolume?: number;
}

export interface BusinessMetrics {
  impactScore: number;
  revenueEstimate: {
    annual: number;
    confidence: number;
    assumptions: string[];
  };
  implementationTimeline: {
    quickWins: number;
    majorProjects: number;
    total: number;
  };
  competitivePosition: {
    score: number;
    strengths: string[];
    gaps: string[];
  };
  prioritizedRecommendations: {
    quickWins: QuickWin[];
    majorProjects: MajorProject[];
  };
}

export class BusinessImpactCalculator {
  /**
   * Calculate business impact metrics from technical audit data
   */
  static calculateBusinessImpact(
    technicalAudit: TechnicalAuditData,
    businessContext: BusinessContext = {}
  ): BusinessImpactMetrics {
    const accessibilityImpact = this.calculateAccessibilityImpact(technicalAudit.accessibility, businessContext);
    const performanceImpact = this.calculatePerformanceImpact(technicalAudit.performance, businessContext);
    const technicalDebtImpact = this.calculateTechnicalDebtImpact(technicalAudit, businessContext);

    // Calculate overall impact score (0-100)
    const impactScore = Math.round(
      (accessibilityImpact.score * 0.3) +
      (performanceImpact.score * 0.4) +
      (technicalDebtImpact.score * 0.3)
    );

    // Calculate revenue estimates
    const revenueEstimate = this.calculateRevenueImpact(
      impactScore,
      businessContext
    );

    // Calculate implementation timeline
    const implementationTimeline = this.calculateImplementationTimeline(technicalAudit);

    // Calculate competitive position
    const competitivePosition = this.calculateCompetitivePosition(
      technicalAudit,
      businessContext
    );

    return {
      impactScore,
      revenueEstimate,
      implementationTimeline,
      competitivePosition
    };
  }

  /**
   * Generate quick wins from technical audit data
   */
  static generateQuickWins(technicalAudit: TechnicalAuditData): QuickWin[] {
    const quickWins: QuickWin[] = [];

    // Accessibility quick wins
    if (technicalAudit.accessibility.criticalIssues > 0) {
      quickWins.push({
        id: 'accessibility-critical',
        title: 'Fix Critical Accessibility Issues',
        impact: 'high',
        effort: 'medium',
        timeline: '2-3 weeks',
        category: 'Accessibility',
        priority: 1
      });
    }

    // Performance quick wins
    if (technicalAudit.performance.averageScore < 70) {
      quickWins.push({
        id: 'performance-optimization',
        title: 'Optimize Core Web Vitals',
        impact: 'high',
        effort: 'medium',
        timeline: '3-4 weeks',
        category: 'Performance',
        priority: 2
      });
    }

    // Technical debt quick wins
    if (technicalAudit.technical.htmlIssues > 5) {
      quickWins.push({
        id: 'html-validation',
        title: 'Fix HTML Validation Errors',
        impact: 'medium',
        effort: 'low',
        timeline: '1-2 weeks',
        category: 'Technical Quality',
        priority: 3
      });
    }

    return quickWins.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Generate major projects from technical audit data
   */
  static generateMajorProjects(technicalAudit: TechnicalAuditData): MajorProject[] {
    const projects: MajorProject[] = [];

    // Comprehensive accessibility overhaul
    if (technicalAudit.accessibility.averageScore < 60) {
      projects.push({
        id: 'accessibility-overhaul',
        title: 'Comprehensive Accessibility Redesign',
        impact: 'high',
        resourceRequirements: ['UX Designer', 'Frontend Developer', 'Accessibility Specialist'],
        timeline: '8-12 weeks',
        roi: 15,
        category: 'Accessibility'
      });
    }

    // Performance architecture redesign
    if (technicalAudit.performance.averageScore < 50) {
      projects.push({
        id: 'performance-architecture',
        title: 'Performance Architecture Overhaul',
        impact: 'high',
        resourceRequirements: ['Senior Frontend Developer', 'DevOps Engineer', 'Performance Specialist'],
        timeline: '12-16 weeks',
        roi: 25,
        category: 'Performance'
      });
    }

    return projects;
  }

  /**
   * Calculate business metrics (legacy compatibility)
   */
  static calculateBusinessMetrics(
    technicalAudit: TechnicalAuditData,
    businessContext: BusinessContext = {}
  ): BusinessMetrics {
    const impact = this.calculateBusinessImpact(technicalAudit, businessContext);
    return {
      ...impact,
      prioritizedRecommendations: {
        quickWins: this.generateQuickWins(technicalAudit),
        majorProjects: this.generateMajorProjects(technicalAudit)
      }
    };
  }

  // Private helper methods
  private static calculateAccessibilityImpact(
    accessibility: TechnicalAuditData['accessibility'],
    businessContext: BusinessContext
  ) {
    const score = Math.max(0, 100 - (accessibility.criticalIssues * 10) - (accessibility.totalIssues * 2));
    const userImpact = businessContext.userBase ? Math.round(businessContext.userBase * 0.15) : 0; // 15% of users affected by accessibility issues
    
    return { score, userImpact };
  }

  private static calculatePerformanceImpact(
    performance: TechnicalAuditData['performance'],
    businessContext: BusinessContext
  ) {
    const score = performance.averageScore;
    const conversionImpact = performance.averageScore < 70 ? 0.1 : 0.05; // Performance directly impacts conversion
    
    return { score, conversionImpact };
  }

  private static calculateTechnicalDebtImpact(
    technicalAudit: TechnicalAuditData,
    businessContext: BusinessContext
  ) {
    const totalIssues = technicalAudit.technical.htmlIssues + technicalAudit.technical.seoIssues;
    const score = Math.max(0, 100 - (totalIssues * 3));
    
    return { score };
  }

  private static calculateRevenueImpact(
    impactScore: number,
    businessContext: BusinessContext
  ) {
    const baseRevenue = (businessContext.trafficVolume || 10000) * 
                       (businessContext.conversionRate || 0.02) * 
                       (businessContext.averageOrderValue || 50) * 12; // Annual

    const potentialIncrease = (100 - impactScore) / 100 * 0.2; // Up to 20% increase
    const annual = Math.round(baseRevenue * potentialIncrease);
    
    return {
      annual,
      confidence: Math.round(impactScore * 0.8), // Higher impact score = higher confidence
      assumptions: [
        'Performance improvements increase conversion by 0.1% per 10-point score increase',
        'Accessibility fixes expand addressable market by 15%',
        'Technical debt reduction improves development velocity by 25%'
      ]
    };
  }

  private static calculateImplementationTimeline(technicalAudit: TechnicalAuditData) {
    const quickWinWeeks = Math.ceil(
      (technicalAudit.accessibility.criticalIssues * 0.5) +
      (technicalAudit.technical.htmlIssues * 0.1) + 2
    );

    const majorProjectWeeks = Math.ceil(
      (technicalAudit.accessibility.totalIssues * 0.2) +
      (technicalAudit.performance.failingMetrics * 1.5) + 8
    );

    return {
      quickWins: quickWinWeeks,
      majorProjects: majorProjectWeeks,
      total: quickWinWeeks + majorProjectWeeks
    };
  }

  private static calculateCompetitivePosition(
    technicalAudit: TechnicalAuditData,
    businessContext: BusinessContext
  ) {
    // Industry benchmarks (simplified)
    const industryBenchmarks = {
      accessibility: 75,
      performance: 80
    };

    const accessibilityGap = technicalAudit.accessibility.averageScore - industryBenchmarks.accessibility;
    const performanceGap = technicalAudit.performance.averageScore - industryBenchmarks.performance;

    const score = Math.round(5 + (accessibilityGap + performanceGap) / 20); // 1-10 scale

    return {
      score: Math.max(1, Math.min(10, score)),
      strengths: [
        ...(technicalAudit.accessibility.averageScore > 80 ? ['Strong accessibility foundation'] : []),
        ...(technicalAudit.performance.averageScore > 85 ? ['Excellent performance metrics'] : []),
      ],
      gaps: [
        ...(technicalAudit.accessibility.criticalIssues > 0 ? ['Critical accessibility barriers'] : []),
        ...(technicalAudit.performance.averageScore < 70 ? ['Performance bottlenecks'] : []),
        ...(technicalAudit.technical.htmlIssues > 10 ? ['Technical debt accumulation'] : [])
      ]
    };
  }
}