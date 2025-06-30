
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
    'critical': 30,
    'suggested': 20,
    'enhancement': 10,
    'info': 5
  };

  private conversionImprovements = {
    'critical': 0.15,      // 15% conversion improvement
    'suggested': 0.08,     // 8% improvement  
    'enhancement': 0.03    // 3% improvement
  };

  private defaultSiteMetrics = {
    monthlyVisitors: 10000,
    currentConversionRate: 0.02, // 2%
    averageOrderValue: 150
  };

  calculateBusinessMetrics(annotations: any[]): BusinessMetrics {
    if (!annotations || annotations.length === 0) {
      return this.getEmptyMetrics();
    }

    const impactScore = this.calculateImpactScore(annotations);
    const revenueEstimate = this.calculateRevenueEstimate(annotations);
    const timeline = this.calculateImplementationTimeline(annotations);
    const competitivePosition = this.calculateCompetitivePosition(annotations);
    const prioritizedRecommendations = this.prioritizeRecommendations(annotations);

    return {
      impactScore,
      revenueEstimate,
      implementationTimeline: timeline,
      competitivePosition,
      prioritizedRecommendations
    };
  }

  private calculateImpactScore(annotations: any[]): number {
    const totalImpact = annotations.reduce((sum, annotation) => {
      const severity = annotation?.severity || 'enhancement';
      const weight = this.severityWeights[severity.toLowerCase()] || 10;
      const confidence = annotation?.confidence || 0.8;
      const researchBacking = annotation?.researchBacking?.length || 0;
      const researchBonus = Math.min(researchBacking * 0.1, 0.3);
      
      return sum + (weight * (confidence + researchBonus));
    }, 0);

    return Math.min(100, Math.round(totalImpact));
  }

  private calculateRevenueEstimate(annotations: any[]): BusinessMetrics['revenueEstimate'] {
    const criticalIssues = annotations.filter(a => a?.severity === 'critical').length;
    const suggestedIssues = annotations.filter(a => a?.severity === 'suggested').length;
    const enhancementIssues = annotations.filter(a => a?.severity === 'enhancement').length;

    const totalImprovement = 
      (criticalIssues * this.conversionImprovements.critical) +
      (suggestedIssues * this.conversionImprovements.suggested) +
      (enhancementIssues * this.conversionImprovements.enhancement);

    const { monthlyVisitors, currentConversionRate, averageOrderValue } = this.defaultSiteMetrics;
    
    const currentMonthlyRevenue = monthlyVisitors * currentConversionRate * averageOrderValue;
    const improvedConversionRate = currentConversionRate * (1 + totalImprovement);
    const improvedMonthlyRevenue = monthlyVisitors * improvedConversionRate * averageOrderValue;
    const monthlyIncrease = improvedMonthlyRevenue - currentMonthlyRevenue;
    const annualIncrease = monthlyIncrease * 12;

    const confidence = Math.min(0.9, 0.6 + (annotations.length * 0.05));

    return {
      annual: Math.round(annualIncrease),
      confidence: Math.round(confidence * 100),
      assumptions: [
        `${monthlyVisitors.toLocaleString()} monthly visitors`,
        `${(currentConversionRate * 100).toFixed(1)}% current conversion rate`,
        `$${averageOrderValue} average order value`,
        `${(totalImprovement * 100).toFixed(1)}% total conversion improvement potential`
      ]
    };
  }

  private calculateImplementationTimeline(annotations: any[]): BusinessMetrics['implementationTimeline'] {
    const quickWinKeywords = ['color', 'spacing', 'copy', 'button', 'text', 'font', 'contrast'];
    const moderateKeywords = ['layout', 'navigation', 'form', 'menu', 'header', 'footer'];
    const majorKeywords = ['architecture', 'redesign', 'rebuild', 'restructure', 'overhaul'];

    let quickWins = 0;
    let moderate = 0;
    let major = 0;

    annotations.forEach(annotation => {
      const content = `${annotation?.title || ''} ${annotation?.description || ''} ${annotation?.feedback || ''}`.toLowerCase();
      
      if (quickWinKeywords.some(keyword => content.includes(keyword))) {
        quickWins += 1;
      } else if (majorKeywords.some(keyword => content.includes(keyword))) {
        major += 3;
      } else if (moderateKeywords.some(keyword => content.includes(keyword))) {
        moderate += 2;
      } else {
        // Default categorization by severity
        if (annotation?.severity === 'critical') {
          major += 2;
        } else if (annotation?.severity === 'suggested') {
          moderate += 1;
        } else {
          quickWins += 1;
        }
      }
    });

    const quickWinWeeks = Math.ceil(quickWins * 0.5); // 0.5 weeks per quick win
    const moderateWeeks = Math.ceil(moderate * 1.5); // 1.5 weeks per moderate task
    const majorWeeks = Math.ceil(major * 2); // 2 weeks per major task

    return {
      quickWins: Math.max(1, quickWinWeeks),
      majorProjects: Math.max(2, majorWeeks),
      total: Math.max(3, quickWinWeeks + moderateWeeks + majorWeeks)
    };
  }

  private calculateCompetitivePosition(annotations: any[]): BusinessMetrics['competitivePosition'] {
    const criticalCount = annotations.filter(a => a?.severity === 'critical').length;
    const totalCount = annotations.length;
    
    // Score based on critical issue density
    let score = 10;
    if (criticalCount > 0) {
      score = Math.max(1, 10 - (criticalCount * 2));
    }
    
    const strengths = [];
    const gaps = [];

    if (criticalCount === 0) {
      strengths.push('No critical usability issues identified');
    }
    if (annotations.some(a => a?.researchBacking?.length > 0)) {
      strengths.push('Research-backed recommendations available');
    }
    if (annotations.length < 5) {
      strengths.push('Overall good user experience foundation');
    }

    if (criticalCount > 2) {
      gaps.push('Multiple critical usability issues need immediate attention');
    }
    if (annotations.filter(a => a?.severity === 'suggested').length > 5) {
      gaps.push('Several improvement opportunities identified');
    }
    if (totalCount > 10) {
      gaps.push('Comprehensive UX audit reveals optimization potential');
    }

    return {
      score: Math.round(score),
      strengths: strengths.length > 0 ? strengths : ['Analysis completed with actionable insights'],
      gaps: gaps.length > 0 ? gaps : ['Minor optimization opportunities available']
    };
  }

  private prioritizeRecommendations(annotations: any[]): BusinessMetrics['prioritizedRecommendations'] {
    const quickWinKeywords = ['color', 'spacing', 'copy', 'button', 'text', 'font', 'contrast'];
    
    const quickWins = annotations
      .filter(annotation => {
        const content = `${annotation?.title || ''} ${annotation?.description || ''} ${annotation?.feedback || ''}`.toLowerCase();
        return quickWinKeywords.some(keyword => content.includes(keyword)) || 
               annotation?.severity === 'enhancement';
      })
      .slice(0, 4)
      .map(annotation => ({
        title: this.extractTitle(annotation),
        impact: annotation?.severity === 'critical' ? 'High' : 'Medium',
        effort: 'Low',
        timeline: '1-2 weeks',
        description: this.extractDescription(annotation)
      }));

    const majorProjects = annotations
      .filter(annotation => annotation?.severity === 'critical' || annotation?.severity === 'suggested')
      .slice(0, 3)
      .map(annotation => ({
        title: this.extractTitle(annotation),
        impact: 'High',
        effort: annotation?.severity === 'critical' ? 'High' : 'Medium',
        timeline: annotation?.severity === 'critical' ? '4-8 weeks' : '2-4 weeks',
        description: this.extractDescription(annotation),
        roi: annotation?.severity === 'critical' ? 'Very High' : 'High'
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

  private getEmptyMetrics(): BusinessMetrics {
    return {
      impactScore: 0,
      revenueEstimate: {
        annual: 0,
        confidence: 0,
        assumptions: ['No analysis data available']
      },
      implementationTimeline: {
        quickWins: 0,
        majorProjects: 0,
        total: 0
      },
      competitivePosition: {
        score: 5,
        strengths: ['No analysis completed yet'],
        gaps: ['Run analysis to identify improvement opportunities']
      },
      prioritizedRecommendations: {
        quickWins: [],
        majorProjects: []
      }
    };
  }
}
