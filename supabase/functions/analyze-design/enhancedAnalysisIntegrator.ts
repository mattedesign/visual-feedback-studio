
export interface EnhancedAnnotation {
  id?: string;
  x: number;
  y: number;
  category: string;
  severity: string;
  feedback: string;
  implementationEffort: string;
  businessImpact: string;
  imageIndex?: number;
  enhancedBusinessImpact?: {
    score: {
      roiScore: number;
      implementationEffort: {
        category: string;
        timeEstimate: string;
      };
    };
    metrics: {
      revenueProjection: {
        monthlyIncrease: string;
      };
    };
  };
}

export interface EnhancedAnalysisResults {
  annotations: EnhancedAnnotation[];
  businessSummary: {
    totalPotentialRevenue: string;
    quickWinsCount: number;
    criticalIssuesCount: number;
    averageROIScore: number;
  };
  competitiveInsights?: {
    competitiveAdvantages?: string[];
  };
  researchInsights?: {
    sourcesUsed: number;
    evidenceStrength: string;
  };
}

interface AnalysisContext {
  hasRAGContext: boolean;
  ragCitations: string[];
  hasCompetitiveContext: boolean;
  competitivePatterns: any[];
}

class EnhancedAnalysisIntegrator {
  async enhanceAnnotations(
    baseAnnotations: any[],
    context: AnalysisContext
  ): Promise<EnhancedAnnotation[]> {
    console.log('📊 EnhancedAnalysisIntegrator.enhanceAnnotations - Starting enhancement', {
      baseAnnotationCount: baseAnnotations.length,
      hasRAGContext: context.hasRAGContext,
      ragCitationsCount: context.ragCitations.length
    });

    try {
      const enhancedAnnotations: EnhancedAnnotation[] = baseAnnotations.map((annotation, index) => {
        // Generate business impact metrics
        const roiScore = this.calculateROIScore(annotation);
        const implementationEffort = this.categorizeImplementationEffort(annotation);
        const revenueProjection = this.estimateRevenueImpact(annotation, roiScore);

        const enhanced: EnhancedAnnotation = {
          ...annotation,
          id: annotation.id || `annotation-${index}`,
          enhancedBusinessImpact: {
            score: {
              roiScore,
              implementationEffort
            },
            metrics: {
              revenueProjection: {
                monthlyIncrease: revenueProjection
              }
            }
          }
        };

        // Enhance feedback with research context if available
        if (context.hasRAGContext && context.ragCitations.length > 0) {
          enhanced.feedback += ` [Enhanced with research from: ${context.ragCitations.join(', ')}]`;
        }

        return enhanced;
      });

      console.log('✅ Annotation enhancement completed:', {
        enhancedCount: enhancedAnnotations.length,
        avgROIScore: this.calculateAverageROI(enhancedAnnotations)
      });

      return enhancedAnnotations;

    } catch (error) {
      console.error('❌ EnhancedAnalysisIntegrator.enhanceAnnotations - Error:', error);
      // Return base annotations if enhancement fails
      return baseAnnotations.map((annotation, index) => ({
        ...annotation,
        id: annotation.id || `annotation-${index}`
      }));
    }
  }

  private calculateROIScore(annotation: any): number {
    let score = 5; // Base score

    // Increase score based on business impact
    if (annotation.businessImpact === 'high') score += 3;
    else if (annotation.businessImpact === 'medium') score += 1;

    // Increase score based on severity
    if (annotation.severity === 'critical') score += 2;
    else if (annotation.severity === 'suggested') score += 1;

    // Decrease score based on implementation effort
    if (annotation.implementationEffort === 'high') score -= 2;
    else if (annotation.implementationEffort === 'medium') score -= 1;

    // Ensure score is within bounds
    return Math.max(1, Math.min(10, score));
  }

  private categorizeImplementationEffort(annotation: any): { category: string; timeEstimate: string } {
    const effort = annotation.implementationEffort || 'medium';
    
    switch (effort) {
      case 'low':
        return { category: 'quick-win', timeEstimate: '1-2 hours' };
      case 'high':
        return { category: 'complex', timeEstimate: '1-2 weeks' };
      default:
        return { category: 'standard', timeEstimate: '1-3 days' };
    }
  }

  private estimateRevenueImpact(annotation: any, roiScore: number): string {
    const baseImpact = roiScore * 100;
    
    if (annotation.category === 'conversion') {
      return `$${baseImpact * 2}-${baseImpact * 4}`;
    } else if (annotation.category === 'ux') {
      return `$${baseImpact}-${baseImpact * 3}`;
    } else {
      return `$${Math.floor(baseImpact * 0.5)}-${baseImpact * 2}`;
    }
  }

  private calculateAverageROI(annotations: EnhancedAnnotation[]): number {
    if (annotations.length === 0) return 0;
    
    const total = annotations.reduce((sum, annotation) => {
      return sum + (annotation.enhancedBusinessImpact?.score.roiScore || 0);
    }, 0);
    
    return Math.round(total / annotations.length * 10) / 10;
  }
}

export const enhancedAnalysisIntegrator = new EnhancedAnalysisIntegrator();
