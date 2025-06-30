
import { BusinessImpactCalculator, BusinessMetrics } from './businessImpactCalculator';

export interface EnhancedAnalysisData {
  original: any;
  businessMetrics: BusinessMetrics;
  enhanced: boolean;
}

export class AnalysisTransformer {
  private calculator = new BusinessImpactCalculator();

  enhanceAnalysisData(analysisData: any): EnhancedAnalysisData {
    if (!analysisData) {
      return {
        original: null,
        businessMetrics: this.calculator.calculateBusinessMetrics([]),
        enhanced: false
      };
    }

    const businessMetrics = this.calculator.calculateBusinessMetrics(
      analysisData.annotations || []
    );

    return {
      original: analysisData,
      businessMetrics,
      enhanced: true
    };
  }

  getExecutiveSummary(enhancedData: EnhancedAnalysisData): string {
    if (!enhancedData.enhanced) {
      return 'No analysis data available for executive summary.';
    }

    const { businessMetrics } = enhancedData;
    const annotationCount = enhancedData.original?.annotations?.length || 0;
    const criticalIssues = enhancedData.original?.annotations?.filter(
      (a: any) => a?.severity === 'critical'
    ).length || 0;

    return `
Analysis identified ${annotationCount} improvement opportunities with a business impact score of ${businessMetrics.impactScore}/100. 
${criticalIssues > 0 ? `${criticalIssues} critical issues require immediate attention.` : 'No critical issues found.'} 
Estimated annual revenue impact: $${businessMetrics.revenueEstimate.annual.toLocaleString()} 
(${businessMetrics.revenueEstimate.confidence}% confidence). 
Implementation timeline: ${businessMetrics.implementationTimeline.total} weeks total, 
with ${businessMetrics.prioritizedRecommendations.quickWins.length} quick wins achievable in 1-2 weeks.
    `.trim();
  }

  getKeyInsights(enhancedData: EnhancedAnalysisData): {
    topRecommendation: string;
    quickestWin: string;
    highestImpact: string;
  } {
    if (!enhancedData.enhanced) {
      return {
        topRecommendation: 'No recommendations available',
        quickestWin: 'No quick wins identified',
        highestImpact: 'No high-impact opportunities found'
      };
    }

    const { businessMetrics } = enhancedData;
    const annotations = enhancedData.original?.annotations || [];

    const criticalAnnotations = annotations.filter((a: any) => a?.severity === 'critical');
    const topRecommendation = criticalAnnotations.length > 0 
      ? criticalAnnotations[0]?.feedback || criticalAnnotations[0]?.title || 'Address critical usability issues'
      : businessMetrics.prioritizedRecommendations.quickWins[0]?.title || 'Focus on identified improvements';

    const quickestWin = businessMetrics.prioritizedRecommendations.quickWins[0]?.title || 'No quick wins available';
    
    const highestImpact = criticalAnnotations.length > 0
      ? `Fix critical issue: ${criticalAnnotations[0]?.feedback?.substring(0, 50) || 'Critical usability problem'}...`
      : businessMetrics.prioritizedRecommendations.majorProjects[0]?.title || 'Focus on suggested improvements';

    return {
      topRecommendation: topRecommendation.length > 80 ? topRecommendation.substring(0, 80) + '...' : topRecommendation,
      quickestWin: quickestWin.length > 80 ? quickestWin.substring(0, 80) + '...' : quickestWin,
      highestImpact: highestImpact.length > 80 ? highestImpact.substring(0, 80) + '...' : highestImpact
    };
  }
}
