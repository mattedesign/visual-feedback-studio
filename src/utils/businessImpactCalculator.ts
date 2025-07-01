export interface BusinessMetrics {
  impactScore: number; // 0-100
  revenueEstimate: {
    annual: number;
    confidence: number;
    assumptions: string[];
  };
  implementationTimeline: {
    quickWins: number; // weeks
    majorProjects: number; // weeks
    total: number; // weeks
  };
  competitivePosition: {
    score: number; // 1-10
    strengths: string[];
    gaps: string[];
  };
  prioritizedRecommendations: {
    quickWins: Array<{
      title: string;
      impact: string;
      effort: string;
      timeline: string;
      description: string;
    }>;
    majorProjects: Array<{
      title: string;
      impact: string;
      effort: string;
      timeline: string;
      description: string;
      roi: string;
    }>;
  };
}

export class BusinessImpactCalculator {
  private severityWeights = {
    'critical': 25,
    'high': 25,
    'suggested': 15,
    'medium': 15,
    'enhancement': 8,
    'low': 8,
    'info': 3
  };

  private conversionImprovements = {
    'critical': 0.20,      // 20% conversion improvement
    'high': 0.20,
    'suggested': 0.12,     // 12% improvement  
    'medium': 0.12,
    'enhancement': 0.05,   // 5% improvement
    'low': 0.05
  };

  calculateBusinessMetrics(annotations: any[]): BusinessMetrics {
    console.log('🧮 BusinessImpactCalculator: Processing', annotations.length, 'annotations');
    
    if (!annotations || annotations.length === 0) {
      return this.getOptimalMetrics();
    }

    const impactScore = this.calculateImpactScore(annotations);
    const revenueEstimate = this.calculateRevenueEstimate(annotations, impactScore);
    const timeline = this.calculateImplementationTimeline(annotations);
    const competitivePosition = this.calculateCompetitivePosition(annotations, impactScore);
    const prioritizedRecommendations = this.prioritizeRecommendations(annotations);

    console.log('✅ BusinessImpactCalculator: Calculated metrics:', {
      impactScore,
      revenue: `$${(revenueEstimate.annual / 1000).toFixed(0)}K`,
      timeline: `${timeline.total}w`,
      competitive: competitivePosition.score
    });

    return {
      impactScore,
      revenueEstimate,
      implementationTimeline: timeline,
      competitivePosition,
      prioritizedRecommendations
    };
  }

  private calculateImpactScore(annotations: any[]): number {
    if (annotations.length === 0) return 95;
    
    // Count issues by severity
    const severityCounts = annotations.reduce((counts, annotation) => {
      const severity = annotation?.severity?.toLowerCase() || 'enhancement';
      counts[severity] = (counts[severity] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    // Calculate deductions based on severity
    let totalDeduction = 0;
    Object.entries(severityCounts).forEach(([severity, count]) => {
      const weight = this.severityWeights[severity as keyof typeof this.severityWeights] || 5;
      totalDeduction += weight * count;
    });

    // Factor in research backing
    const researchBacked = annotations.filter(a => 
      a?.researchBacking?.length > 0 || 
      a?.confidence > 0.8
    ).length;
    const researchBonus = Math.min(15, researchBacked * 2);

    const finalScore = Math.max(20, Math.min(100, 100 - totalDeduction + researchBonus));
    
    console.log('📊 Impact Score Calculation:', {
      totalIssues: annotations.length,
      severityCounts,
      totalDeduction,
      researchBonus,
      finalScore
    });

    return Math.round(finalScore);
  }

  private calculateRevenueEstimate(annotations: any[], impactScore: number): BusinessMetrics['revenueEstimate'] {
    // Analyze issue types for targeted revenue calculations
    const issueTypes = this.categorizeIssues(annotations);
    
    // Base calculation - opportunity gap from perfect score
    const opportunityGap = 100 - impactScore;
    const baseRevenue = opportunityGap * 1200; // $1.2K per point below 100

    // Category-specific bonuses
    const conversionRevenue = issueTypes.conversion * 15000; // $15K per conversion issue
    const accessibilityRevenue = issueTypes.accessibility * 10000; // $10K per accessibility issue
    const uxRevenue = issueTypes.ux * 8000; // $8K per UX issue
    const visualRevenue = issueTypes.visual * 4000; // $4K per visual issue

    const totalRevenue = baseRevenue + conversionRevenue + accessibilityRevenue + uxRevenue + visualRevenue;
    
    // Calculate confidence based on issue severity and research backing
    const criticalIssues = annotations.filter(a => 
      ['critical', 'high'].includes(a?.severity?.toLowerCase())
    ).length;
    const researchBacked = annotations.filter(a => a?.researchBacking?.length > 0).length;
    
    const confidence = Math.min(95, 65 + (criticalIssues * 5) + (researchBacked * 3));

    const assumptions = [
      `Based on ${annotations.length} identified improvement opportunities`,
      `${issueTypes.conversion} conversion-related issues found`,
      `${issueTypes.accessibility} accessibility improvements needed`,
      `Impact score: ${impactScore}/100 indicates ${100 - impactScore}% opportunity gap`
    ];

    return {
      annual: Math.max(5000, Math.round(totalRevenue / 1000) * 1000), // Round to nearest $1K, min $5K
      confidence: Math.round(confidence),
      assumptions
    };
  }

  private categorizeIssues(annotations: any[]) {
    const categories = {
      conversion: 0,
      accessibility: 0,
      ux: 0,
      visual: 0,
      other: 0
    };

    annotations.forEach(annotation => {
      const text = `${annotation?.feedback || ''} ${annotation?.description || ''} ${annotation?.title || ''}`.toLowerCase();
      
      if (text.includes('conversion') || text.includes('cta') || text.includes('button') || 
          text.includes('checkout') || text.includes('purchase') || text.includes('form')) {
        categories.conversion++;
      } else if (text.includes('accessibility') || text.includes('contrast') || 
                text.includes('readable') || text.includes('wcag') || text.includes('alt')) {
        categories.accessibility++;
      } else if (text.includes('navigation') || text.includes('usability') || 
                text.includes('user experience') || text.includes('confusing') || 
                text.includes('flow')) {
        categories.ux++;
      } else if (text.includes('color') || text.includes('font') || text.includes('spacing') || 
                text.includes('layout') || text.includes('visual') || text.includes('design')) {
        categories.visual++;
      } else {
        categories.other++;
      }
    });

    return categories;
  }

  private calculateImplementationTimeline(annotations: any[]): BusinessMetrics['implementationTimeline'] {
    if (annotations.length === 0) {
      return { quickWins: 1, majorProjects: 0, total: 1 };
    }

    const quickWinKeywords = ['color', 'spacing', 'copy', 'font', 'text', 'contrast', 'alt'];
    const majorProjectKeywords = ['architecture', 'redesign', 'rebuild', 'restructure', 'navigation', 'conversion'];

    let quickWinTasks = 0;
    let moderateTasks = 0;
    let majorTasks = 0;

    annotations.forEach(annotation => {
      const content = `${annotation?.title || ''} ${annotation?.description || ''} ${annotation?.feedback || ''}`.toLowerCase();
      const severity = annotation?.severity?.toLowerCase() || 'enhancement';
      
      const isQuickWin = quickWinKeywords.some(keyword => content.includes(keyword)) || 
                        ['enhancement', 'low'].includes(severity);
      const isMajorProject = majorProjectKeywords.some(keyword => content.includes(keyword)) || 
                           ['critical', 'high'].includes(severity);

      if (isQuickWin) {
        quickWinTasks++;
      } else if (isMajorProject) {
        majorTasks++;
      } else {
        moderateTasks++;
      }
    });

    const quickWinWeeks = Math.ceil(quickWinTasks * 0.4); // 0.4 weeks per quick win
    const moderateWeeks = Math.ceil(moderateTasks * 1.2); // 1.2 weeks per moderate task
    const majorWeeks = Math.ceil(majorTasks * 2.5); // 2.5 weeks per major task

    return {
      quickWins: Math.max(1, quickWinWeeks),
      majorProjects: Math.max(0, moderateWeeks + majorWeeks),
      total: Math.max(1, Math.min(20, quickWinWeeks + moderateWeeks + majorWeeks))
    };
  }

  private calculateCompetitivePosition(annotations: any[], impactScore: number): BusinessMetrics['competitivePosition'] {
    const criticalCount = annotations.filter(a => 
      ['critical', 'high'].includes(a?.severity?.toLowerCase())
    ).length;
    
    // Score based on impact score and critical issues
    let score = Math.floor(impactScore / 10); // Convert 100-point scale to 10-point scale
    if (criticalCount > 3) score = Math.max(1, score - 2);
    if (criticalCount === 0 && impactScore > 85) score = Math.min(10, score + 1);
    
    const strengths = [];
    const gaps = [];

    // Dynamic strengths based on analysis
    if (criticalCount === 0) {
      strengths.push('No critical usability issues identified');
    }
    if (impactScore > 80) {
      strengths.push('Strong foundational user experience');
    }
    if (annotations.some(a => a?.researchBacking?.length > 0)) {
      strengths.push('Research-backed recommendations available');
    }
    if (annotations.length < 5) {
      strengths.push('Overall good design foundation');
    }

    // Dynamic gaps based on issues found
    if (criticalCount > 2) {
      gaps.push(`${criticalCount} critical issues requiring immediate attention`);
    }
    if (annotations.filter(a => a?.severity === 'suggested').length > 3) {
      gaps.push('Multiple improvement opportunities identified');
    }
    
    const issueTypes = this.categorizeIssues(annotations);
    if (issueTypes.conversion > 0) {
      gaps.push('Conversion optimization opportunities available');
    }
    if (issueTypes.accessibility > 1) {
      gaps.push('Accessibility improvements needed for broader reach');
    }

    // Fallbacks if no specific issues found
    if (strengths.length === 0) {
      strengths.push('Analysis completed with actionable insights');
    }
    if (gaps.length === 0) {
      gaps.push('Minor optimization opportunities available');
    }

    return {
      score: Math.max(1, Math.min(10, score)),
      strengths,
      gaps
    };
  }

  private prioritizeRecommendations(annotations: any[]): BusinessMetrics['prioritizedRecommendations'] {
    const quickWinKeywords = ['color', 'spacing', 'copy', 'button', 'text', 'font', 'contrast'];
    
    const quickWins = annotations
      .filter(annotation => {
        const content = `${annotation?.title || ''} ${annotation?.description || ''} ${annotation?.feedback || ''}`.toLowerCase();
        return quickWinKeywords.some(keyword => content.includes(keyword)) || 
               ['enhancement', 'low'].includes(annotation?.severity?.toLowerCase());
      })
      .slice(0, 4)
      .map(annotation => ({
        title: this.extractTitle(annotation),
        impact: ['critical', 'high'].includes(annotation?.severity?.toLowerCase()) ? 'High' : 'Medium',
        effort: 'Low',
        timeline: '1-2 weeks',
        description: this.extractDescription(annotation)
      }));

    const majorProjects = annotations
      .filter(annotation => 
        ['critical', 'high', 'suggested'].includes(annotation?.severity?.toLowerCase())
      )
      .slice(0, 3)
      .map(annotation => ({
        title: this.extractTitle(annotation),
        impact: 'High',
        effort: ['critical', 'high'].includes(annotation?.severity?.toLowerCase()) ? 'High' : 'Medium',
        timeline: ['critical', 'high'].includes(annotation?.severity?.toLowerCase()) ? '4-8 weeks' : '2-4 weeks',
        description: this.extractDescription(annotation),
        roi: ['critical', 'high'].includes(annotation?.severity?.toLowerCase()) ? 'Very High' : 'High'
      }));

    return { quickWins, majorProjects };
  }

  private extractTitle(annotation: any): string {
    const title = annotation?.title || annotation?.feedback || 'Improvement Opportunity';
    return title.length > 60 ? title.substring(0, 60) + '...' : title;
  }

  private extractDescription(annotation: any): string {
    const description = annotation?.description || annotation?.feedback || 'Implementation details available in visual analysis';
    return description.length > 100 ? description.substring(0, 100) + '...' : description;
  }

  private getOptimalMetrics(): BusinessMetrics {
    return {
      impactScore: 95,
      revenueEstimate: {
        annual: 12000,
        confidence: 85,
        assumptions: ['No issues found - excellent foundation for growth']
      },
      implementationTimeline: {
        quickWins: 1,
        majorProjects: 0,
        total: 1
      },
      competitivePosition: {
        score: 9,
        strengths: ['Excellent user experience foundation', 'No critical issues identified'],
        gaps: ['Minor enhancement opportunities available']
      },
      prioritizedRecommendations: {
        quickWins: [{
          title: 'Maintain current excellence',
          impact: 'High',
          effort: 'Low',
          timeline: '1 week',
          description: 'Continue monitoring and maintaining current high standards'
        }],
        majorProjects: [{
          title: 'Strategic growth optimization',
          impact: 'High',
          effort: 'Medium',
          timeline: '2-3 weeks',
          description: 'Explore advanced optimization opportunities',
          roi: 'High'
        }]
      }
    };
  }
}
