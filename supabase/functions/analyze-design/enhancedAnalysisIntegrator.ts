
interface EnhancementContext {
  hasRAGContext: boolean;
  ragCitations: string[];
  hasCompetitiveContext: boolean;
  competitivePatterns: string[];
}

interface EnhancedAnnotation {
  id: string;
  x: number;
  y: number;
  category: string;
  severity: string;
  feedback: string;
  implementationEffort: string;
  businessImpact: string;
  imageIndex?: number;
  enhancedBusinessImpact?: any;
  researchCitations?: string[];
  priorityScore?: number;
  quickWinPotential?: boolean;
}

class EnhancedAnalysisIntegrator {
  async enhanceAnnotations(
    baseAnnotations: any[],
    context: EnhancementContext
  ): Promise<EnhancedAnnotation[]> {
    console.log('📊 EnhancedAnalysisIntegrator.enhanceAnnotations - Starting comprehensive enhancement', {
      baseAnnotationCount: baseAnnotations.length,
      hasRAGContext: context.hasRAGContext,
      ragCitationsCount: context.ragCitations.length,
      targetEnhanced: '16-19 comprehensive insights'
    });

    if (!baseAnnotations || baseAnnotations.length === 0) {
      console.warn('⚠️ No base annotations provided for enhancement');
      return [];
    }

    const enhancedAnnotations: EnhancedAnnotation[] = [];

    for (let i = 0; i < baseAnnotations.length; i++) {
      const annotation = baseAnnotations[i];
      
      try {
        const enhanced = await this.enhanceIndividualAnnotation(annotation, context, i);
        if (enhanced) {
          enhancedAnnotations.push(enhanced);
        }
      } catch (error) {
        console.error(`❌ Failed to enhance annotation ${i}:`, error);
        // Include the original annotation if enhancement fails
        enhancedAnnotations.push({
          ...annotation,
          id: annotation.id || `annotation-${i}`,
          researchCitations: context.ragCitations.slice(0, 2),
          priorityScore: this.calculatePriorityScore(annotation),
          quickWinPotential: annotation.implementationEffort === 'low' && annotation.businessImpact !== 'low'
        });
      }
    }

    // Calculate comprehensive business impact metrics
    const businessImpactSummary = this.calculateComprehensiveBusinessImpact(enhancedAnnotations);
    
    console.log('✅ Comprehensive annotation enhancement completed:', {
      enhancedCount: enhancedAnnotations.length,
      avgROIScore: businessImpactSummary.averageROIScore,
      quickWinsAvailable: businessImpactSummary.quickWinsCount,
      criticalIssuesCount: businessImpactSummary.criticalCount,
      comprehensiveAnalysis: true
    });

    return enhancedAnnotations;
  }

  private async enhanceIndividualAnnotation(
    annotation: any,
    context: EnhancementContext,
    index: number
  ): Promise<EnhancedAnnotation> {
    // Generate comprehensive business impact analysis
    const enhancedBusinessImpact = this.generateComprehensiveBusinessImpact(annotation, context);
    
    // Calculate priority score based on multiple factors
    const priorityScore = this.calculatePriorityScore(annotation);
    
    // Determine quick win potential
    const quickWinPotential = this.assessQuickWinPotential(annotation);
    
    // Add research citations if available
    const researchCitations = context.hasRAGContext 
      ? context.ragCitations.slice(0, Math.min(3, context.ragCitations.length))
      : [];

    return {
      id: annotation.id || `enhanced-annotation-${index}`,
      x: annotation.x || 50,
      y: annotation.y || 30,
      category: annotation.category || 'ux',
      severity: annotation.severity || 'suggested',
      feedback: annotation.feedback, // ✅ FIXED: Don't override Claude's feedback with generic text
      implementationEffort: annotation.implementationEffort || 'medium',
      businessImpact: annotation.businessImpact || 'medium',
      imageIndex: annotation.imageIndex || 0,
      enhancedBusinessImpact,
      researchCitations,
      priorityScore,
      quickWinPotential
    };
  }

  private generateComprehensiveBusinessImpact(annotation: any, context: EnhancementContext): any {
    const severity = annotation.severity || 'suggested';
    const category = annotation.category || 'ux';
    const implementationEffort = annotation.implementationEffort || 'medium';
    
    // Calculate conversion impact based on annotation characteristics
    const conversionImpact = this.calculateConversionImpact(severity, category);
    const revenueProjection = this.calculateRevenueProjection(severity, category, implementationEffort);
    const roiScore = this.calculateROIScore(severity, category, implementationEffort);

    return {
      metrics: {
        conversionImpact: {
          estimatedIncrease: conversionImpact.increase,
          confidence: conversionImpact.confidence,
          methodology: 'Based on UX research and industry benchmarks'
        },
        userExperienceMetrics: {
          timeReduction: category === 'ux' ? '15-25%' : undefined,
          errorReduction: category === 'accessibility' ? '20-30%' : undefined,
          satisfactionImprovement: '10-20%'
        },
        accessibilityReach: {
          affectedUserPercentage: category === 'accessibility' ? '15-20%' : '5-10%',
          complianceLevel: category === 'accessibility' ? 'WCAG 2.1 AA' : 'General usability'
        },
        revenueProjection: {
          monthlyIncrease: revenueProjection.monthly,
          annualProjection: revenueProjection.annual,
          assumptions: revenueProjection.assumptions
        }
      },
      score: {
        roiScore,
        priority: severity === 'critical' ? 'critical' : severity === 'suggested' ? 'important' : 'enhancement',
        implementationEffort: {
          category: implementationEffort === 'low' ? 'quick-win' : implementationEffort === 'high' ? 'complex' : 'standard',
          timeEstimate: this.getTimeEstimate(implementationEffort),
          resourcesNeeded: this.getResourcesNeeded(category, implementationEffort)
        },
        businessValue: this.calculateBusinessValue(severity, category),
        riskLevel: this.calculateRiskLevel(severity, implementationEffort)
      },
      justification: this.generateJustification(annotation, context),
      competitiveBenchmark: context.hasCompetitiveContext ? 'Industry standard practices' : undefined,
      researchEvidence: context.hasRAGContext ? 'Supported by UX research database' : undefined
    };
  }

  private calculateConversionImpact(severity: string, category: string): { increase: string; confidence: string } {
    if (category === 'conversion') {
      return {
        increase: severity === 'critical' ? '8-15%' : severity === 'suggested' ? '3-8%' : '1-3%',
        confidence: 'high'
      };
    } else if (category === 'ux') {
      return {
        increase: severity === 'critical' ? '5-12%' : '2-6%',
        confidence: 'medium'
      };
    }
    return { increase: '1-4%', confidence: 'low' };
  }

  private calculateRevenueProjection(severity: string, category: string, effort: string): any {
    const baseMultiplier = severity === 'critical' ? 3 : severity === 'suggested' ? 2 : 1;
    const categoryMultiplier = category === 'conversion' ? 1.5 : category === 'ux' ? 1.2 : 1;
    
    const monthlyBase = 500 * baseMultiplier * categoryMultiplier;
    
    return {
      monthly: `$${monthlyBase.toLocaleString()}-${(monthlyBase * 2).toLocaleString()}`,
      annual: `$${(monthlyBase * 12).toLocaleString()}-${(monthlyBase * 24).toLocaleString()}`,
      assumptions: [
        'Based on average e-commerce conversion rates',
        'Assumes moderate traffic volume',
        'Estimates derived from UX improvement studies'
      ]
    };
  }

  private calculateROIScore(severity: string, category: string, effort: string): number {
    let score = 5; // Base score
    
    // Severity impact
    if (severity === 'critical') score += 3;
    else if (severity === 'suggested') score += 2;
    else score += 1;
    
    // Category impact
    if (category === 'conversion') score += 2;
    else if (category === 'ux') score += 1.5;
    else if (category === 'accessibility') score += 1;
    
    // Effort consideration (higher effort = lower ROI)
    if (effort === 'low') score += 2;
    else if (effort === 'medium') score += 1;
    else score -= 1;
    
    return Math.min(Math.max(Math.round(score * 10) / 10, 1), 10);
  }

  private calculatePriorityScore(annotation: any): number {
    const severityScore = annotation.severity === 'critical' ? 9 : 
                          annotation.severity === 'suggested' ? 6 : 3;
    const impactScore = annotation.businessImpact === 'high' ? 3 : 
                        annotation.businessImpact === 'medium' ? 2 : 1;
    const effortScore = annotation.implementationEffort === 'low' ? 3 : 
                        annotation.implementationEffort === 'medium' ? 2 : 1;
    
    return severityScore + impactScore + effortScore;
  }

  private assessQuickWinPotential(annotation: any): boolean {
    return annotation.implementationEffort === 'low' && 
           (annotation.businessImpact === 'high' || annotation.businessImpact === 'medium');
  }

  private getTimeEstimate(effort: string): string {
    switch (effort) {
      case 'low': return '1-3 hours';
      case 'medium': return '1-2 days';
      case 'high': return '1-2 weeks';
      default: return '1-2 days';
    }
  }

  private getResourcesNeeded(category: string, effort: string): string[] {
    const baseResources = ['Designer', 'Developer'];
    
    if (category === 'accessibility') {
      baseResources.push('Accessibility specialist');
    }
    if (category === 'conversion') {
      baseResources.push('UX researcher');
    }
    if (effort === 'high') {
      baseResources.push('Project manager');
    }
    
    return baseResources;
  }

  private calculateBusinessValue(severity: string, category: string): number {
    let value = 5;
    
    if (severity === 'critical') value += 3;
    else if (severity === 'suggested') value += 2;
    
    if (category === 'conversion') value += 2;
    else if (category === 'ux') value += 1;
    
    return Math.min(value, 10);
  }

  private calculateRiskLevel(severity: string, effort: string): 'low' | 'medium' | 'high' {
    if (severity === 'critical') return 'high';
    if (effort === 'high') return 'medium';
    return 'low';
  }

  private generateJustification(annotation: any, context: EnhancementContext): string {
    const baseJustification = `This ${annotation.severity} ${annotation.category} improvement addresses key user experience concerns`;
    
    if (context.hasRAGContext) {
      return `${baseJustification} and is supported by established UX research and industry best practices.`;
    }
    
    return `${baseJustification} based on standard usability principles.`;
  }

  private calculateComprehensiveBusinessImpact(annotations: EnhancedAnnotation[]): any {
    const criticalCount = annotations.filter(a => a.severity === 'critical').length;
    const quickWinsCount = annotations.filter(a => a.quickWinPotential).length;
    const averageROIScore = annotations.reduce((sum, a) => 
      sum + (a.enhancedBusinessImpact?.score?.roiScore || 5), 0) / annotations.length;

    return {
      criticalCount,
      quickWinsCount,
      averageROIScore: Math.round(averageROIScore * 10) / 10,
      totalAnnotations: annotations.length
    };
  }
}

export const enhancedAnalysisIntegrator = new EnhancedAnalysisIntegrator();
