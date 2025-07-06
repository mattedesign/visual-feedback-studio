import { EnhancedAnalysisResults, EnhancedAnnotation } from './enhancedAnalysisIntegrator.ts';

export interface EnhancedAnalysisResponse {
  success: boolean;
  annotations: EnhancedAnnotation[];
  totalAnnotations: number;
  
  // Enhanced business impact fields
  businessImpact: {
    totalPotentialRevenue: string;
    quickWinsAvailable: number;
    criticalIssuesCount: number;
    averageROIScore: number;
    implementationRoadmap: {
      immediate: EnhancedAnnotation[];
      shortTerm: EnhancedAnnotation[];
      longTerm: EnhancedAnnotation[];
    };
  };
  
  // Existing fields
  modelUsed?: string;
  processingTime?: number;
  ragEnhanced?: boolean;
  knowledgeSourcesUsed?: number;
  researchCitations?: string[];
  competitiveEnhanced?: boolean;
  competitivePatternsUsed?: number;
  industryBenchmarks?: string[];
  
  // New insights fields
  insights?: {
    topRecommendation: string;
    quickestWin: string;
    highestImpact: string;
    competitiveAdvantage?: string;
    researchEvidence?: string;
  };
}

export const enhancedResponseFormatter = {
  formatEnhancedResponse: (
    enhancedResults: EnhancedAnalysisResults,
    metadata: {
      modelUsed?: string;
      processingTime?: number;
      ragEnhanced?: boolean;
      knowledgeSourcesUsed?: number;
      researchCitations?: string[];
      competitiveEnhanced?: boolean;
      competitivePatternsUsed?: number;
      industryBenchmarks?: string[];
    }
  ) => {
    console.log('📦 === ENHANCED RESPONSE FORMATTING START ===');
    console.log('📊 Formatting enhanced analysis response:', {
      annotationsCount: enhancedResults.annotations.length,
      businessSummaryPresent: !!enhancedResults.businessSummary,
      competitiveInsightsPresent: !!enhancedResults.competitiveInsights,
      researchInsightsPresent: !!enhancedResults.researchInsights
    });

    // Create implementation roadmap based on ROI scores and effort
    const implementationRoadmap = categorizeByImplementationTimeline(enhancedResults.annotations);
    
    // Generate key insights
    const insights = generateKeyInsights(enhancedResults);
    
    const enhancedResponse: EnhancedAnalysisResponse = {
      success: true,
      annotations: enhancedResults.annotations,
      totalAnnotations: enhancedResults.annotations.length,
      
      businessImpact: {
        totalPotentialRevenue: enhancedResults.businessSummary.totalPotentialRevenue,
        quickWinsAvailable: enhancedResults.businessSummary.quickWinsCount,
        criticalIssuesCount: enhancedResults.businessSummary.criticalIssuesCount,
        averageROIScore: enhancedResults.businessSummary.averageROIScore,
        implementationRoadmap
      },
      
      // Preserve existing metadata
      modelUsed: metadata.modelUsed,
      processingTime: metadata.processingTime,
      ragEnhanced: metadata.ragEnhanced,
      knowledgeSourcesUsed: metadata.knowledgeSourcesUsed,
      researchCitations: metadata.researchCitations,
      competitiveEnhanced: metadata.competitiveEnhanced,
      competitivePatternsUsed: metadata.competitivePatternsUsed,
      industryBenchmarks: metadata.industryBenchmarks,
      
      insights
    };

    console.log('✅ Enhanced response formatted:', {
      totalRevenue: enhancedResponse.businessImpact.totalPotentialRevenue,
      quickWins: enhancedResponse.businessImpact.quickWinsAvailable,
      topRecommendation: insights.topRecommendation,
      roadmapCategories: {
        immediate: implementationRoadmap.immediate.length,
        shortTerm: implementationRoadmap.shortTerm.length,
        longTerm: implementationRoadmap.longTerm.length
      }
    });

    const responseBody = {
      body: JSON.stringify(enhancedResponse),
      status: 200
    };

    console.log('📦 === ENHANCED RESPONSE FORMATTING COMPLETE ===');
    return responseBody;
  },

  formatErrorResponse: (error: Error) => {
    return {
      body: JSON.stringify({
        success: false,
        error: 'Enhanced analysis failed',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      status: 500
    };
  }
};

function categorizeByImplementationTimeline(annotations: EnhancedAnnotation[]) {
  const immediate: EnhancedAnnotation[] = [];
  const shortTerm: EnhancedAnnotation[] = [];
  const longTerm: EnhancedAnnotation[] = [];

  annotations.forEach(annotation => {
    const effort = annotation.enhancedBusinessImpact?.score.implementationEffort.category;
    const roiScore = annotation.enhancedBusinessImpact?.score.roiScore || 0;

    if (effort === 'quick-win' && roiScore >= 7) {
      immediate.push(annotation);
    } else if (effort === 'standard' || (effort === 'quick-win' && roiScore < 7)) {
      shortTerm.push(annotation);
    } else {
      longTerm.push(annotation);
    }
  });

  // Sort each category by ROI score (highest first)
  [immediate, shortTerm, longTerm].forEach(category => {
    category.sort((a, b) => (b.enhancedBusinessImpact?.score.roiScore || 0) - (a.enhancedBusinessImpact?.score.roiScore || 0));
  });

  return { immediate, shortTerm, longTerm };
}

function generateKeyInsights(results: EnhancedAnalysisResults) {
  const annotations = results.annotations;
  
  // Find top recommendation (highest ROI score)
  const topAnnotation = annotations.reduce((top, current) => {
    const topScore = top.enhancedBusinessImpact?.score.roiScore || 0;
    const currentScore = current.enhancedBusinessImpact?.score.roiScore || 0;
    return currentScore > topScore ? current : top;
  });

  // Find quickest win
  const quickestWin = annotations
    .filter(a => a.enhancedBusinessImpact?.score.implementationEffort.category === 'quick-win')
    .reduce((best, current) => {
      const bestScore = best?.enhancedBusinessImpact?.score.roiScore || 0;
      const currentScore = current.enhancedBusinessImpact?.score.roiScore || 0;
      return currentScore > bestScore ? current : best;
    }, null as EnhancedAnnotation | null);

  // Find highest business impact
  const highestImpact = annotations.reduce((highest, current) => {
    const highestRevenue = extractMaxRevenue(highest.enhancedBusinessImpact?.metrics.revenueProjection.monthlyIncrease || '');
    const currentRevenue = extractMaxRevenue(current.enhancedBusinessImpact?.metrics.revenueProjection.monthlyIncrease || '');
    return currentRevenue > highestRevenue ? current : highest;
  });

  return {
    topRecommendation: `${topAnnotation.category.toUpperCase()}: ${topAnnotation.feedback.substring(0, 100)}... (ROI: ${topAnnotation.enhancedBusinessImpact?.score.roiScore}/10)`,
    quickestWin: quickestWin ? 
      `${quickestWin.enhancedBusinessImpact?.score.implementationEffort.timeEstimate}: ${quickestWin.feedback.substring(0, 80)}...` : 
      'No quick wins identified',
    highestImpact: `Revenue impact: ${highestImpact.enhancedBusinessImpact?.metrics.revenueProjection.monthlyIncrease} - ${highestImpact.feedback.substring(0, 80)}...`,
    competitiveAdvantage: results.competitiveInsights?.competitiveAdvantages?.[0],
    researchEvidence: results.researchInsights ? 
      `${results.researchInsights.sourcesUsed} research sources consulted (${results.researchInsights.evidenceStrength} confidence)` : 
      undefined
  };
}

function extractMaxRevenue(revenueString: string): number {
  // Extract maximum revenue from strings like "$2,000-8,000"
  const matches = revenueString.match(/\$([0-9,]+)-([0-9,]+)/);
  if (matches && matches[2]) {
    return parseInt(matches[2].replace(/,/g, ''));
  }
  
  const singleMatch = revenueString.match(/\$([0-9,]+)/);
  if (singleMatch) {
    return parseInt(singleMatch[1].replace(/,/g, ''));
  }
  
  return 0;
}
