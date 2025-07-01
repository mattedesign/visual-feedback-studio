
import { useState, useEffect } from 'react';

interface BusinessMetrics {
  impactScore: number;
  revenueEstimate: {
    annual: number;
    confidence: number;
  };
  implementationTimeline: {
    total: number;
    quickWins: number;
    majorProjects: number;
  };
  competitivePosition: {
    score: number;
    text: string;
  };
  prioritizedRecommendations: {
    quickWins: Array<{
      title: string;
      impact: string;
      timeline: string;
    }>;
    majorProjects: Array<{
      title: string;
      roi: string;
      timeline: string;
    }>;
  };
}

// Dynamic calculation functions
const calculateBusinessImpactScore = (analysisResults: any) => {
  const annotations = analysisResults?.annotations || [];
  const totalIssues = annotations.length;
  
  if (totalIssues === 0) return 95; // Perfect score if no issues
  
  const criticalIssues = annotations.filter((a: any) => 
    a.severity === 'critical' || a.severity === 'high'
  ).length;
  
  const suggestedIssues = annotations.filter((a: any) => 
    a.severity === 'suggested' || a.severity === 'medium'
  ).length;
  
  // Calculate score based on issues found
  let baseScore = 100;
  baseScore -= (criticalIssues * 15); // -15 for each critical issue
  baseScore -= (suggestedIssues * 8); // -8 for each suggested issue
  baseScore -= ((totalIssues - criticalIssues - suggestedIssues) * 3); // -3 for each minor issue
  
  // Factor in research backing
  const researchSources = analysisResults?.enhancedContext?.knowledgeSourcesUsed || 
                          analysisResults?.knowledge_sources_used || 0;
  const researchBonus = Math.min(10, researchSources * 0.5); // Up to +10 for research
  
  return Math.max(25, Math.min(100, Math.round(baseScore + researchBonus)));
};

const calculateRevenuePotential = (impactScore: number, annotations: any[]) => {
  const conversionIssues = annotations.filter((a: any) => {
    const text = (a.feedback || a.text || a.description || '').toLowerCase();
    return text.includes('conversion') || 
           text.includes('cta') || 
           text.includes('button') ||
           text.includes('checkout') ||
           text.includes('purchase') ||
           text.includes('form');
  }).length;
  
  const accessibilityIssues = annotations.filter((a: any) => {
    const text = (a.feedback || a.text || a.description || '').toLowerCase();
    return text.includes('accessibility') || 
           text.includes('contrast') || 
           text.includes('readable') ||
           text.includes('wcag');
  }).length;
  
  const uxIssues = annotations.filter((a: any) => {
    const text = (a.feedback || a.text || a.description || '').toLowerCase();
    return text.includes('navigation') || 
           text.includes('usability') || 
           text.includes('user experience') ||
           text.includes('confusing');
  }).length;
  
  // Base revenue calculation - higher impact for lower scores
  const opportunityGap = 100 - impactScore;
  const baseRevenue = opportunityGap * 1500; // $1.5K per point below 100
  
  // Bonuses for specific issue types
  const conversionBonus = conversionIssues * 12000; // $12K per conversion issue
  const accessibilityBonus = accessibilityIssues * 8000; // $8K per accessibility issue
  const uxBonus = uxIssues * 6000; // $6K per UX issue
  
  const totalRevenue = baseRevenue + conversionBonus + accessibilityBonus + uxBonus;
  
  // Round to nearest $1K, minimum $5K
  return Math.max(5000, Math.round(totalRevenue / 1000) * 1000);
};

const calculateTimeline = (annotations: any[]) => {
  if (annotations.length === 0) return { total: 1, quickWins: 1, majorProjects: 0 };
  
  const quickFixes = annotations.filter((a: any) => {
    const text = (a.feedback || a.text || a.description || '').toLowerCase();
    const isQuickFix = a.severity === 'enhancement' || 
                      a.severity === 'low' || 
                      text.includes('color') ||
                      text.includes('spacing') ||
                      text.includes('font') ||
                      text.includes('copy') ||
                      text.includes('text');
    return isQuickFix;
  }).length;
  
  const complexFixes = annotations.filter((a: any) => {
    const text = (a.feedback || a.text || a.description || '').toLowerCase();
    const isComplex = a.severity === 'critical' || 
                     a.severity === 'high' ||
                     text.includes('redesign') ||
                     text.includes('architecture') ||
                     text.includes('rebuild') ||
                     text.includes('restructure');
    return isComplex;
  }).length;
  
  const quickWinWeeks = Math.ceil(quickFixes * 0.3); // 0.3 weeks per quick fix
  const majorProjectWeeks = Math.ceil(complexFixes * 1.5); // 1.5 weeks per complex fix
  const totalWeeks = quickWinWeeks + majorProjectWeeks;
  
  return {
    total: Math.max(1, Math.min(16, totalWeeks)), // Between 1-16 weeks
    quickWins: Math.max(1, quickWinWeeks || 1),
    majorProjects: Math.max(0, majorProjectWeeks)
  };
};

const calculateCompetitivePosition = (impactScore: number) => {
  if (impactScore >= 90) return { score: 9, text: "Market Leader" };
  if (impactScore >= 80) return { score: 8, text: "Above Average" };
  if (impactScore >= 70) return { score: 7, text: "Above Average" };
  if (impactScore >= 60) return { score: 6, text: "Average" };
  if (impactScore >= 50) return { score: 5, text: "Below Average" };
  if (impactScore >= 40) return { score: 4, text: "Below Average" };
  return { score: 3, text: "Needs Improvement" };
};

const generatePrioritizedRecommendations = (annotations: any[], impactScore: number) => {
  // Quick wins - low severity or easy fixes
  const quickWinAnnotations = annotations.filter((a: any) => {
    const text = (a.feedback || a.text || a.description || '').toLowerCase();
    return a.severity === 'enhancement' || 
           a.severity === 'low' ||
           text.includes('color') ||
           text.includes('spacing') ||
           text.includes('font');
  }).slice(0, 4);
  
  const quickWins = quickWinAnnotations.map((a: any, index: number) => ({
    title: a.feedback?.substring(0, 50) || `Quick Fix ${index + 1}`,
    impact: a.severity === 'enhancement' ? 'Medium' : 'High',
    timeline: '1-2 weeks'
  }));
  
  // Major projects - high severity or complex fixes
  const majorProjectAnnotations = annotations.filter((a: any) => {
    const text = (a.feedback || a.text || a.description || '').toLowerCase();
    return a.severity === 'critical' || 
           a.severity === 'high' ||
           text.includes('redesign') ||
           text.includes('navigation') ||
           text.includes('conversion');
  }).slice(0, 3);
  
  const majorProjects = majorProjectAnnotations.map((a: any, index: number) => ({
    title: a.feedback?.substring(0, 50) || `Major Project ${index + 1}`,
    roi: a.severity === 'critical' ? '300%+' : '200%+',
    timeline: a.severity === 'critical' ? '4-6 weeks' : '2-4 weeks'
  }));
  
  // Fill with defaults if not enough annotations
  while (quickWins.length < 3) {
    quickWins.push({
      title: 'Design Enhancement Opportunity',
      impact: 'Medium',
      timeline: '1-2 weeks'
    });
  }
  
  while (majorProjects.length < 2) {
    majorProjects.push({
      title: 'Strategic Improvement Project',
      roi: '150%+',
      timeline: '3-4 weeks'
    });
  }
  
  return { quickWins, majorProjects };
};

export function useBusinessMetrics(analysisData: any) {
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [enhanced, setEnhanced] = useState<any>(null);
  const [original, setOriginal] = useState<any>(null);

  useEffect(() => {
    if (analysisData) {
      console.log('🧮 Calculating dynamic business metrics from:', {
        annotations: analysisData.annotations?.length || 0,
        researchSources: analysisData.enhancedContext?.knowledgeSourcesUsed || analysisData.knowledge_sources_used || 0
      });
      
      // Calculate dynamic metrics based on actual analysis data
      const impactScore = calculateBusinessImpactScore(analysisData);
      const revenueAnnual = calculateRevenuePotential(impactScore, analysisData?.annotations || []);
      const timeline = calculateTimeline(analysisData?.annotations || []);
      const competitivePos = calculateCompetitivePosition(impactScore);
      const recommendations = generatePrioritizedRecommendations(analysisData?.annotations || [], impactScore);
      
      // Calculate confidence based on research backing and annotation quality
      const researchSources = analysisData?.enhancedContext?.knowledgeSourcesUsed || 
                             analysisData?.knowledge_sources_used || 0;
      const confidence = Math.min(95, 60 + (researchSources * 1.5) + (impactScore * 0.3));
      
      const metrics: BusinessMetrics = {
        impactScore,
        revenueEstimate: {
          annual: revenueAnnual,
          confidence: Math.round(confidence)
        },
        implementationTimeline: timeline,
        competitivePosition: competitivePos,
        prioritizedRecommendations: recommendations
      };

      console.log('✅ Dynamic metrics calculated:', {
        impactScore,
        revenueAnnual: `$${(revenueAnnual / 1000).toFixed(0)}K`,
        timeline: `${timeline.total} weeks`,
        competitiveScore: competitivePos.score,
        confidence: `${confidence.toFixed(0)}%`
      });

      setBusinessMetrics(metrics);
      setEnhanced(analysisData);
      setOriginal({
        siteName: analysisData.title || "Design Analysis",
        analysisContext: "Professional UX Analysis",
        enhancedContext: {
          knowledgeSourcesUsed: researchSources
        },
        annotations: analysisData.annotations || []
      });
    }
  }, [analysisData]);

  return {
    businessMetrics,
    enhanced,
    original
  };
}
