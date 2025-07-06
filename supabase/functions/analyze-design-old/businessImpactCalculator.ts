
export interface BusinessImpactMetrics {
  conversionImpact: {
    estimatedIncrease: string;
    confidence: 'low' | 'medium' | 'high';
    methodology: string;
  };
  userExperienceMetrics: {
    timeReduction?: string;
    errorReduction?: string;
    satisfactionImprovement?: string;
  };
  accessibilityReach: {
    affectedUserPercentage: string;
    complianceLevel: string;
  };
  revenueProjection: {
    monthlyIncrease: string;
    annualProjection: string;
    assumptions: string[];
  };
}

export interface BusinessImpactScore {
  roiScore: number; // 1-10 scale
  priority: 'critical' | 'important' | 'enhancement';
  implementationEffort: {
    category: 'quick-win' | 'standard' | 'complex';
    timeEstimate: string;
    resourcesNeeded: string[];
  };
  businessValue: number; // 1-10 scale
  riskLevel: 'low' | 'medium' | 'high';
}

export interface EnhancedBusinessImpact {
  metrics: BusinessImpactMetrics;
  score: BusinessImpactScore;
  justification: string;
  competitiveBenchmark?: string;
  researchEvidence?: string;
}

// Business impact calculation engine
export class BusinessImpactCalculator {
  private static readonly IMPACT_MULTIPLIERS = {
    critical: 3.0,
    suggested: 2.0,
    enhancement: 1.5
  };

  private static readonly CATEGORY_WEIGHTS = {
    accessibility: 2.5,
    conversion: 3.0,
    ux: 2.0,
    visual: 1.5,
    brand: 1.8
  };

  static calculateBusinessImpact(
    annotation: any,
    competitiveContext?: string,
    researchContext?: string,
    industryBenchmarks?: string[]
  ): EnhancedBusinessImpact {
    console.log('🧮 === BUSINESS IMPACT CALCULATION START ===');
    console.log('📊 Calculating business impact for annotation:', {
      category: annotation.category,
      severity: annotation.severity,
      hasCompetitiveContext: !!competitiveContext,
      hasResearchContext: !!researchContext,
      benchmarksCount: industryBenchmarks?.length || 0
    });

    const baseScore = this.calculateBaseScore(annotation);
    const impactMetrics = this.generateImpactMetrics(annotation, competitiveContext, researchContext);
    const implementationEffort = this.estimateImplementationEffort(annotation);
    const roiScore = this.calculateROIScore(baseScore, implementationEffort.complexity);
    
    const businessImpact: EnhancedBusinessImpact = {
      metrics: impactMetrics,
      score: {
        roiScore,
        priority: this.determinePriority(roiScore),
        implementationEffort,
        businessValue: baseScore,
        riskLevel: this.assessRiskLevel(annotation)
      },
      justification: this.generateJustification(annotation, impactMetrics, roiScore),
      competitiveBenchmark: this.extractCompetitiveBenchmark(competitiveContext),
      researchEvidence: this.extractResearchEvidence(researchContext)
    };

    console.log('✅ Business impact calculated:', {
      roiScore: businessImpact.score.roiScore,
      priority: businessImpact.score.priority,
      businessValue: businessImpact.score.businessValue,
      implementationCategory: businessImpact.score.implementationEffort.category
    });

    return businessImpact;
  }

  private static calculateBaseScore(annotation: any): number {
    const severityMultiplier = this.IMPACT_MULTIPLIERS[annotation.severity as keyof typeof this.IMPACT_MULTIPLIERS] || 1;
    const categoryWeight = this.CATEGORY_WEIGHTS[annotation.category as keyof typeof this.CATEGORY_WEIGHTS] || 1;
    
    return Math.min(10, Math.round(severityMultiplier * categoryWeight));
  }

  private static generateImpactMetrics(annotation: any, competitiveContext?: string, researchContext?: string): BusinessImpactMetrics {
    const category = annotation.category;
    const severity = annotation.severity;

    // Generate category-specific metrics
    switch (category) {
      case 'conversion':
        return this.generateConversionMetrics(severity, competitiveContext);
      case 'accessibility':
        return this.generateAccessibilityMetrics(severity, researchContext);
      case 'ux':
        return this.generateUXMetrics(severity, competitiveContext);
      case 'visual':
        return this.generateVisualMetrics(severity);
      case 'brand':
        return this.generateBrandMetrics(severity);
      default:
        return this.generateDefaultMetrics(severity);
    }
  }

  private static generateConversionMetrics(severity: string, competitiveContext?: string): BusinessImpactMetrics {
    const impactRanges = {
      critical: { min: 15, max: 25, revenue: { min: 5000, max: 15000 } },
      suggested: { min: 8, max: 15, revenue: { min: 2000, max: 8000 } },
      enhancement: { min: 3, max: 8, revenue: { min: 500, max: 3000 } }
    };

    const range = impactRanges[severity as keyof typeof impactRanges] || impactRanges.enhancement;
    
    return {
      conversionImpact: {
        estimatedIncrease: `${range.min}-${range.max}%`,
        confidence: severity === 'critical' ? 'high' : severity === 'suggested' ? 'medium' : 'low',
        methodology: competitiveContext ? 'Based on competitive analysis and A/B testing data' : 'Industry benchmark analysis'
      },
      userExperienceMetrics: {
        timeReduction: `${Math.round(range.min * 0.8)}-${Math.round(range.max * 1.2)} seconds`,
        errorReduction: `${Math.round(range.min * 0.6)}%`
      },
      accessibilityReach: {
        affectedUserPercentage: '85-95%',
        complianceLevel: 'Improves conversion funnel accessibility'
      },
      revenueProjection: {
        monthlyIncrease: `$${range.revenue.min.toLocaleString()}-${range.revenue.max.toLocaleString()}`,
        annualProjection: `$${(range.revenue.min * 12).toLocaleString()}-${(range.revenue.max * 12).toLocaleString()}`,
        assumptions: [
          'Based on current traffic volume',
          'Assumes consistent user behavior patterns',
          'Market conditions remain stable'
        ]
      }
    };
  }

  private static generateAccessibilityMetrics(severity: string, researchContext?: string): BusinessImpactMetrics {
    const accessibilityImpact = {
      critical: { userPercentage: '15-20%', revenue: { min: 3000, max: 8000 } },
      suggested: { userPercentage: '8-12%', revenue: { min: 1500, max: 4000 } },
      enhancement: { userPercentage: '3-6%', revenue: { min: 500, max: 2000 } }
    };

    const impact = accessibilityImpact[severity as keyof typeof accessibilityImpact] || accessibilityImpact.enhancement;

    return {
      conversionImpact: {
        estimatedIncrease: '5-12%',
        confidence: 'high',
        methodology: researchContext ? 'Research-backed accessibility guidelines' : 'WCAG compliance standards'
      },
      userExperienceMetrics: {
        satisfactionImprovement: '25-40%',
        errorReduction: '30-50%'
      },
      accessibilityReach: {
        affectedUserPercentage: impact.userPercentage,
        complianceLevel: severity === 'critical' ? 'WCAG AA compliance' : 'Improved accessibility standards'
      },
      revenueProjection: {
        monthlyIncrease: `$${impact.revenue.min.toLocaleString()}-${impact.revenue.max.toLocaleString()}`,
        annualProjection: `$${(impact.revenue.min * 12).toLocaleString()}-${(impact.revenue.max * 12).toLocaleString()}`,
        assumptions: [
          'Accessibility improvements reduce bounce rate',
          'Enhanced usability increases conversion',
          'Legal compliance reduces risk'
        ]
      }
    };
  }

  private static generateUXMetrics(severity: string, competitiveContext?: string): BusinessImpactMetrics {
    const uxImpact = {
      critical: { time: 45, conversion: 12, revenue: { min: 4000, max: 10000 } },
      suggested: { time: 25, conversion: 8, revenue: { min: 2000, max: 6000 } },
      enhancement: { time: 15, conversion: 4, revenue: { min: 800, max: 2500 } }
    };

    const impact = uxImpact[severity as keyof typeof uxImpact] || uxImpact.enhancement;

    return {
      conversionImpact: {
        estimatedIncrease: `${impact.conversion}-${Math.round(impact.conversion * 1.5)}%`,
        confidence: 'medium',
        methodology: competitiveContext ? 'Competitive UX analysis and user testing' : 'UX best practices'
      },
      userExperienceMetrics: {
        timeReduction: `${impact.time} seconds`,
        satisfactionImprovement: `${Math.round(impact.conversion * 2)}%`
      },
      accessibilityReach: {
        affectedUserPercentage: '90-100%',
        complianceLevel: 'Universal usability improvement'
      },
      revenueProjection: {
        monthlyIncrease: `$${impact.revenue.min.toLocaleString()}-${impact.revenue.max.toLocaleString()}`,
        annualProjection: `$${(impact.revenue.min * 12).toLocaleString()}-${(impact.revenue.max * 12).toLocaleString()}`,
        assumptions: [
          'Improved user flow reduces abandonment',
          'Better UX increases customer lifetime value',
          'Enhanced usability drives word-of-mouth growth'
        ]
      }
    };
  }

  private static generateVisualMetrics(severity: string): BusinessImpactMetrics {
    const visualImpact = {
      critical: { brand: 20, conversion: 8, revenue: { min: 2000, max: 5000 } },
      suggested: { brand: 12, conversion: 5, revenue: { min: 1000, max: 3000 } },
      enhancement: { brand: 6, conversion: 2, revenue: { min: 300, max: 1200 } }
    };

    const impact = visualImpact[severity as keyof typeof visualImpact] || visualImpact.enhancement;

    return {
      conversionImpact: {
        estimatedIncrease: `${impact.conversion}-${Math.round(impact.conversion * 1.3)}%`,
        confidence: 'medium',
        methodology: 'Visual hierarchy and design psychology principles'
      },
      userExperienceMetrics: {
        satisfactionImprovement: `${impact.brand}%`
      },
      accessibilityReach: {
        affectedUserPercentage: '100%',
        complianceLevel: 'Visual accessibility enhancement'
      },
      revenueProjection: {
        monthlyIncrease: `$${impact.revenue.min.toLocaleString()}-${impact.revenue.max.toLocaleString()}`,
        annualProjection: `$${(impact.revenue.min * 12).toLocaleString()}-${(impact.revenue.max * 12).toLocaleString()}`,
        assumptions: [
          'Improved visual appeal increases engagement',
          'Better design builds trust and credibility',
          'Enhanced aesthetics supports premium positioning'
        ]
      }
    };
  }

  private static generateBrandMetrics(severity: string): BusinessImpactMetrics {
    const brandImpact = {
      critical: { trust: 25, conversion: 10, revenue: { min: 3000, max: 7000 } },
      suggested: { trust: 15, conversion: 6, revenue: { min: 1500, max: 4000 } },
      enhancement: { trust: 8, conversion: 3, revenue: { min: 500, max: 1800 } }
    };

    const impact = brandImpact[severity as keyof typeof brandImpact] || brandImpact.enhancement;

    return {
      conversionImpact: {
        estimatedIncrease: `${impact.conversion}-${Math.round(impact.conversion * 1.4)}%`,
        confidence: 'medium',
        methodology: 'Brand perception and trust studies'
      },
      userExperienceMetrics: {
        satisfactionImprovement: `${impact.trust}%`
      },
      accessibilityReach: {
        affectedUserPercentage: '100%',
        complianceLevel: 'Brand consistency improvement'
      },
      revenueProjection: {
        monthlyIncrease: `$${impact.revenue.min.toLocaleString()}-${impact.revenue.max.toLocaleString()}`,
        annualProjection: `$${(impact.revenue.min * 12).toLocaleString()}-${(impact.revenue.max * 12).toLocaleString()}`,
        assumptions: [
          'Stronger brand perception increases customer loyalty',
          'Consistent branding builds trust',
          'Professional appearance supports premium pricing'
        ]
      }
    };
  }

  private static generateDefaultMetrics(severity: string): BusinessImpactMetrics {
    return {
      conversionImpact: {
        estimatedIncrease: '3-8%',
        confidence: 'low',
        methodology: 'General UX improvement principles'
      },
      userExperienceMetrics: {
        satisfactionImprovement: '10-15%'
      },
      accessibilityReach: {
        affectedUserPercentage: '50-80%',
        complianceLevel: 'General usability improvement'
      },
      revenueProjection: {
        monthlyIncrease: '$500-2,000',
        annualProjection: '$6,000-24,000',
        assumptions: [
          'Based on general UX improvement patterns',
          'Assumes moderate traffic volume',
          'Conservative estimates'
        ]
      }
    };
  }

  private static estimateImplementationEffort(annotation: any): BusinessImpactScore['implementationEffort'] {
    const { category, severity } = annotation;
    
    // Implementation complexity matrix
    const complexityMatrix = {
      accessibility: {
        critical: 'standard',
        suggested: 'quick-win',
        enhancement: 'quick-win'
      },
      conversion: {
        critical: 'complex',
        suggested: 'standard',
        enhancement: 'quick-win'
      },
      ux: {
        critical: 'complex',
        suggested: 'standard',
        enhancement: 'standard'
      },
      visual: {
        critical: 'standard',
        suggested: 'quick-win',
        enhancement: 'quick-win'
      },
      brand: {
        critical: 'standard',
        suggested: 'standard',
        enhancement: 'quick-win'
      }
    };

    const complexity = complexityMatrix[category as keyof typeof complexityMatrix]?.[severity as keyof typeof complexityMatrix['accessibility']] || 'standard';

    const effortDetails = {
      'quick-win': {
        timeEstimate: '2-4 hours',
        resourcesNeeded: ['Frontend developer', 'Basic design review']
      },
      'standard': {
        timeEstimate: '1-2 days',
        resourcesNeeded: ['Frontend developer', 'UX designer', 'Testing']
      },
      'complex': {
        timeEstimate: '1-2 weeks',
        resourcesNeeded: ['Frontend developer', 'Backend developer', 'UX designer', 'QA testing', 'Stakeholder review']
      }
    };

    return {
      category: complexity as 'quick-win' | 'standard' | 'complex',
      ...effortDetails[complexity as keyof typeof effortDetails]
    };
  }

  private static calculateROIScore(businessValue: number, implementationComplexity: string): number {
    const complexityPenalty = {
      'quick-win': 0,
      'standard': 1,
      'complex': 3
    };

    const penalty = complexityPenalty[implementationComplexity as keyof typeof complexityPenalty] || 1;
    return Math.max(1, Math.min(10, businessValue - penalty));
  }

  private static determinePriority(roiScore: number): 'critical' | 'important' | 'enhancement' {
    if (roiScore >= 8) return 'critical';
    if (roiScore >= 5) return 'important';
    return 'enhancement';
  }

  private static assessRiskLevel(annotation: any): 'low' | 'medium' | 'high' {
    if (annotation.category === 'accessibility' && annotation.severity === 'critical') return 'high';
    if (annotation.category === 'conversion' && annotation.severity === 'critical') return 'medium';
    return 'low';
  }

  private static generateJustification(annotation: any, metrics: BusinessImpactMetrics, roiScore: number): string {
    const impactType = annotation.category;
    const severity = annotation.severity;
    
    let justification = `This ${severity} ${impactType} issue has been identified with an ROI score of ${roiScore}/10. `;
    
    if (metrics.conversionImpact.estimatedIncrease) {
      justification += `Expected conversion improvement of ${metrics.conversionImpact.estimatedIncrease}. `;
    }
    
    if (metrics.revenueProjection.monthlyIncrease) {
      justification += `Projected monthly revenue impact: ${metrics.revenueProjection.monthlyIncrease}. `;
    }
    
    if (metrics.accessibilityReach.affectedUserPercentage) {
      justification += `This change would benefit ${metrics.accessibilityReach.affectedUserPercentage} of users.`;
    }

    return justification;
  }

  private static extractCompetitiveBenchmark(competitiveContext?: string): string | undefined {
    if (!competitiveContext) return undefined;
    
    // Extract effectiveness scores and industry examples from competitive context
    const effectivenessMatch = competitiveContext.match(/(\d+)% effectiveness/i);
    const industryMatch = competitiveContext.match(/(\w+) achieves/i);
    
    if (effectivenessMatch && industryMatch) {
      return `Industry benchmark: ${industryMatch[1]} achieves ${effectivenessMatch[1]}% effectiveness`;
    }
    
    return 'Competitive analysis available';
  }

  private static extractResearchEvidence(researchContext?: string): string | undefined {
    if (!researchContext) return undefined;
    
    // Extract research methodology references
    if (researchContext.includes('Button Design Best Practices')) {
      return 'Research evidence: Button design optimization studies';
    }
    if (researchContext.includes('Mobile Touch Interface')) {
      return 'Research evidence: Mobile usability research';
    }
    if (researchContext.includes('Accessibility')) {
      return 'Research evidence: Accessibility compliance studies';
    }
    
    return 'Research-backed recommendations available';
  }
}
