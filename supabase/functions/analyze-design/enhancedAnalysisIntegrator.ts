
import { BusinessImpactCalculator, EnhancedBusinessImpact } from './businessImpactCalculator.ts';
import { CompetitiveIntelligence } from './competitiveIntelligence.ts';

export interface EnhancedAnnotation {
  id: string;
  x: number;
  y: number;
  category: 'ux' | 'visual' | 'accessibility' | 'conversion' | 'brand';
  severity: 'critical' | 'suggested' | 'enhancement';
  feedback: string;
  implementationEffort: 'low' | 'medium' | 'high';
  businessImpact: 'low' | 'medium' | 'high';
  imageIndex?: number;
  
  // Enhanced fields
  enhancedBusinessImpact?: EnhancedBusinessImpact;
  researchCitations?: string[];
  competitiveBenchmarks?: string[];
  priorityScore?: number;
  quickWinPotential?: boolean;
}

export interface EnhancedAnalysisResults {
  annotations: EnhancedAnnotation[];
  businessSummary: {
    totalPotentialRevenue: string;
    quickWinsCount: number;
    criticalIssuesCount: number;
    averageROIScore: number;
    implementationPriorities: {
      critical: EnhancedAnnotation[];
      important: EnhancedAnnotation[];
      enhancement: EnhancedAnnotation[];
    };
  };
  competitiveInsights?: {
    patternsAnalyzed: number;
    benchmarksUsed: string[];
    competitiveAdvantages: string[];
  };
  researchInsights?: {
    sourcesUsed: number;
    citations: string[];
    evidenceStrength: 'low' | 'medium' | 'high';
  };
}

export class EnhancedAnalysisIntegrator {
  static integrateBusinessImpact(
    rawAnnotations: any[],
    ragContext?: { researchCitations: string[]; enhancedPrompt: string },
    competitiveResults?: CompetitiveIntelligence
  ): EnhancedAnalysisResults {
    console.log('🔗 === ENHANCED ANALYSIS INTEGRATION START ===');
    console.log('📊 Integration Configuration:', {
      annotationsCount: rawAnnotations.length,
      hasRAGContext: !!ragContext,
      hasCompetitiveContext: !!competitiveResults,
      ragCitationsCount: ragContext?.researchCitations?.length || 0,
      competitivePatternsCount: competitiveResults?.totalPatterns || 0
    });

    const enhancedAnnotations: EnhancedAnnotation[] = rawAnnotations.map((annotation, index) => {
      console.log(`🔍 Processing annotation ${index + 1}/${rawAnnotations.length}:`, {
        category: annotation.category,
        severity: annotation.severity,
        x: annotation.x,
        y: annotation.y
      });

      // Calculate business impact for this annotation
      const businessImpact = BusinessImpactCalculator.calculateBusinessImpact(
        annotation,
        competitiveResults?.competitiveContext,
        ragContext?.enhancedPrompt,
        competitiveResults?.industryBenchmarks
      );

      // Determine if this is a quick win
      const quickWinPotential = businessImpact.score.roiScore >= 7 && 
                               businessImpact.score.implementationEffort.category === 'quick-win';

      const enhancedAnnotation: EnhancedAnnotation = {
        ...annotation,
        enhancedBusinessImpact: businessImpact,
        researchCitations: ragContext?.researchCitations || [],
        competitiveBenchmarks: competitiveResults?.industryBenchmarks || [],
        priorityScore: businessImpact.score.roiScore,
        quickWinPotential,
      };

      console.log(`✅ Enhanced annotation ${index + 1}:`, {
        roiScore: businessImpact.score.roiScore,
        priority: businessImpact.score.priority,
        quickWin: quickWinPotential,
        revenueImpact: businessImpact.metrics.revenueProjection.monthlyIncrease
      });

      return enhancedAnnotation;
    });

    // Generate business summary
    const businessSummary = this.generateBusinessSummary(enhancedAnnotations);
    
    // Generate insights summaries
    const competitiveInsights = this.generateCompetitiveInsights(competitiveResults);
    const researchInsights = this.generateResearchInsights(ragContext);

    const results: EnhancedAnalysisResults = {
      annotations: enhancedAnnotations,
      businessSummary,
      competitiveInsights,
      researchInsights
    };

    console.log('🎯 === ENHANCED ANALYSIS INTEGRATION COMPLETE ===');
    console.log('📈 Business Summary:', {
      totalRevenuePotential: businessSummary.totalPotentialRevenue,
      quickWins: businessSummary.quickWinsCount,
      criticalIssues: businessSummary.criticalIssuesCount,
      averageROI: businessSummary.averageROIScore
    });

    return results;
  }

  private static generateBusinessSummary(annotations: EnhancedAnnotation[]) {
    console.log('📊 Generating business summary for', annotations.length, 'annotations');

    // Calculate total potential revenue (using minimum estimates for conservative approach)
    let totalMonthlyRevenue = 0;
    annotations.forEach(annotation => {
      if (annotation.enhancedBusinessImpact?.metrics.revenueProjection.monthlyIncrease) {
        const revenueString = annotation.enhancedBusinessImpact.metrics.revenueProjection.monthlyIncrease;
        const minRevenue = this.extractMinRevenue(revenueString);
        totalMonthlyRevenue += minRevenue;
      }
    });

    // Categorize annotations by priority
    const prioritized = {
      critical: annotations.filter(a => a.enhancedBusinessImpact?.score.priority === 'critical'),
      important: annotations.filter(a => a.enhancedBusinessImpact?.score.priority === 'important'),
      enhancement: annotations.filter(a => a.enhancedBusinessImpact?.score.priority === 'enhancement')
    };

    // Count quick wins
    const quickWinsCount = annotations.filter(a => a.quickWinPotential).length;
    const criticalIssuesCount = prioritized.critical.length;

    // Calculate average ROI score
    const totalROI = annotations.reduce((sum, a) => sum + (a.enhancedBusinessImpact?.score.roiScore || 0), 0);
    const averageROIScore = Math.round((totalROI / annotations.length) * 10) / 10;

    const summary = {
      totalPotentialRevenue: `$${totalMonthlyRevenue.toLocaleString()}/month ($${(totalMonthlyRevenue * 12).toLocaleString()}/year)`,
      quickWinsCount,
      criticalIssuesCount,
      averageROIScore,
      implementationPriorities: prioritized
    };

    console.log('📈 Business summary generated:', {
      monthlyRevenue: totalMonthlyRevenue,
      quickWins: quickWinsCount,
      critical: criticalIssuesCount,
      avgROI: averageROIScore
    });

    return summary;
  }

  private static extractMinRevenue(revenueString: string): number {
    // Extract minimum revenue from strings like "$2,000-8,000"
    const match = revenueString.match(/\$([0-9,]+)/);
    if (match) {
      return parseInt(match[1].replace(/,/g, ''));
    }
    return 0;
  }

  private static generateCompetitiveInsights(competitiveResults?: CompetitiveIntelligence) {
    if (!competitiveResults || competitiveResults.totalPatterns === 0) {
      return undefined;
    }

    // Extract competitive advantages from patterns
    const competitiveAdvantages = competitiveResults.relevantPatterns
      .filter(pattern => pattern.effectiveness_score && pattern.effectiveness_score > 70)
      .map(pattern => `${pattern.industry}: ${pattern.pattern_name} (${pattern.effectiveness_score}% effective)`)
      .slice(0, 3);

    return {
      patternsAnalyzed: competitiveResults.totalPatterns,
      benchmarksUsed: competitiveResults.industryBenchmarks,
      competitiveAdvantages
    };
  }

  private static generateResearchInsights(ragContext?: { researchCitations: string[]; enhancedPrompt: string }) {
    if (!ragContext || !ragContext.researchCitations.length) {
      return undefined;
    }

    // Determine evidence strength based on number and quality of citations
    let evidenceStrength: 'low' | 'medium' | 'high' = 'low';
    if (ragContext.researchCitations.length >= 5) {
      evidenceStrength = 'high';
    } else if (ragContext.researchCitations.length >= 3) {
      evidenceStrength = 'medium';
    }

    return {
      sourcesUsed: ragContext.researchCitations.length,
      citations: ragContext.researchCitations,
      evidenceStrength
    };
  }
}
