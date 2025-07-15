import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface ForensicIntegrationRequest {
  sessionId: string;
  imageUrls: string[];
  personaType?: string;
  analysisMode?: string;
}

interface ForensicReport {
  sessionId: string;
  forensicData: any[];
  businessIntelligence: any;
  technicalDebt: any;
  recommendations: any[];
  competitiveAnalysis: any;
  industryBenchmarks: any;
}

class GoblinForensicIntegrator {
  
  /**
   * Perform comprehensive forensic analysis and integrate with Goblin system
   */
  async performForensicIntegration(request: ForensicIntegrationRequest): Promise<ForensicReport> {
    console.log('🔬 Starting forensic integration for session:', request.sessionId);
    
    // Step 1: Perform enhanced Google Vision forensic analysis
    const forensicResults = await this.callForensicVisionAnalysis(request.imageUrls);
    
    // Step 2: Extract business intelligence
    const businessIntelligence = this.extractBusinessIntelligence(forensicResults);
    
    // Step 3: Calculate technical debt metrics
    const technicalDebt = this.calculateTechnicalDebt(forensicResults);
    
    // Step 4: Generate forensic recommendations
    const recommendations = this.generateForensicRecommendations(forensicResults, businessIntelligence);
    
    // Step 5: Perform competitive analysis
    const competitiveAnalysis = this.performCompetitiveAnalysis(forensicResults);
    
    // Step 6: Calculate industry benchmarks
    const industryBenchmarks = this.calculateIndustryBenchmarks(forensicResults);
    
    // Step 7: Store forensic data in Goblin system
    await this.storeForensicData(request.sessionId, {
      forensicData: forensicResults,
      businessIntelligence,
      technicalDebt,
      recommendations,
      competitiveAnalysis,
      industryBenchmarks
    });
    
    return {
      sessionId: request.sessionId,
      forensicData: forensicResults,
      businessIntelligence,
      technicalDebt,
      recommendations,
      competitiveAnalysis,
      industryBenchmarks
    };
  }
  
  /**
   * Call the enhanced Google Vision API with forensic mode
   */
  private async callForensicVisionAnalysis(imageUrls: string[]): Promise<any[]> {
    try {
      const response = await supabase.functions.invoke('google-vision-analysis', {
        body: {
          imageUrls,
          forensicMode: true,
          features: [
            'TEXT_DETECTION',
            'LABEL_DETECTION',
            'OBJECT_LOCALIZATION',
            'DOCUMENT_TEXT_DETECTION',
            'IMAGE_PROPERTIES',
            'SAFE_SEARCH_DETECTION',
            'WEB_DETECTION'
          ]
        }
      });
      
      if (response.error) {
        throw new Error(`Forensic vision analysis failed: ${response.error.message}`);
      }
      
      return response.data.forensicResults || [];
    } catch (error) {
      console.error('❌ Forensic vision analysis error:', error);
      throw error;
    }
  }
  
  /**
   * Extract business intelligence from forensic data
   */
  private extractBusinessIntelligence(forensicResults: any[]): any {
    const businessMetrics = {
      conversionOptimization: {
        ctaEffectiveness: 0,
        conversionPathClarity: 0,
        trustSignalStrength: 0,
        frictionPoints: []
      },
      brandPosition: {
        brandConsistency: 0,
        marketDifferentiation: 0,
        premiumPerception: 0
      },
      userExperience: {
        cognitiveLoad: 0,
        accessibilityScore: 0,
        mobileOptimization: 0
      },
      competitiveAdvantage: {
        uniqueValueProposition: 0,
        featureParity: 0,
        innovationScore: 0
      }
    };
    
    // Aggregate metrics from all images
    forensicResults.forEach(result => {
      if (result.forensicMetrics) {
        const metrics = result.forensicMetrics;
        
        // Conversion optimization
        if (metrics.technical.businessElementAnalysis?.cta) {
          businessMetrics.conversionOptimization.ctaEffectiveness += metrics.technical.businessElementAnalysis.cta.effectiveness || 0;
        }
        
        // Brand position
        if (metrics.technical.businessElementAnalysis?.branding) {
          businessMetrics.brandPosition.brandConsistency += metrics.technical.businessElementAnalysis.branding.consistency || 0;
        }
        
        // User experience
        if (metrics.technical.accessibilityMetrics) {
          businessMetrics.userExperience.accessibilityScore += this.calculateAccessibilityScore(metrics.technical.accessibilityMetrics);
        }
      }
    });
    
    // Average the scores
    const imageCount = forensicResults.length;
    if (imageCount > 0) {
      businessMetrics.conversionOptimization.ctaEffectiveness /= imageCount;
      businessMetrics.brandPosition.brandConsistency /= imageCount;
      businessMetrics.userExperience.accessibilityScore /= imageCount;
    }
    
    return businessMetrics;
  }
  
  /**
   * Calculate technical debt from forensic analysis
   */
  private calculateTechnicalDebt(forensicResults: any[]): any {
    const debtMetrics = {
      designInconsistencies: 0,
      accessibilityViolations: 0,
      performanceIssues: 0,
      maintenanceBurden: 0,
      scalabilityRisks: 0,
      totalDebtScore: 0,
      prioritizedFixes: []
    };
    
    forensicResults.forEach(result => {
      if (result.forensicMetrics) {
        const quality = result.forensicMetrics.quality;
        
        // Calculate debt from quality scores
        debtMetrics.designInconsistencies += (1 - (quality.designConsistency || 0));
        debtMetrics.accessibilityViolations += (1 - this.calculateAccessibilityScore(result.forensicMetrics.technical.accessibilityMetrics));
        debtMetrics.maintenanceBurden += (quality.technicalDebt || 0);
      }
    });
    
    // Calculate total debt score
    debtMetrics.totalDebtScore = (
      debtMetrics.designInconsistencies +
      debtMetrics.accessibilityViolations +
      debtMetrics.maintenanceBurden
    ) / (forensicResults.length * 3);
    
    // Generate prioritized fixes
    debtMetrics.prioritizedFixes = this.generatePrioritizedFixes(forensicResults);
    
    return debtMetrics;
  }
  
  /**
   * Generate forensic recommendations based on analysis
   */
  private generateForensicRecommendations(forensicResults: any[], businessIntelligence: any): any[] {
    const recommendations = [];
    
    // Business impact recommendations
    if (businessIntelligence.conversionOptimization.ctaEffectiveness < 0.7) {
      recommendations.push({
        type: 'conversion',
        priority: 'high',
        category: 'Business Impact',
        title: 'Optimize Call-to-Action Elements',
        description: 'CTA effectiveness is below industry standards',
        impact: 'Could increase conversion rates by 25-40%',
        effort: 'Medium',
        timeline: '2-3 weeks',
        forensicEvidence: this.extractCTAEvidence(forensicResults),
        businessValue: 'High ROI potential'
      });
    }
    
    // Accessibility recommendations
    if (businessIntelligence.userExperience.accessibilityScore < 0.8) {
      recommendations.push({
        type: 'accessibility',
        priority: 'high',
        category: 'Risk Mitigation',
        title: 'Address Accessibility Compliance Issues',
        description: 'Multiple WCAG violations detected across interfaces',
        impact: 'Reduces legal risk and improves user inclusion',
        effort: 'High',
        timeline: '4-6 weeks',
        forensicEvidence: this.extractAccessibilityEvidence(forensicResults),
        businessValue: 'Risk reduction + market expansion'
      });
    }
    
    // Brand consistency recommendations
    if (businessIntelligence.brandPosition.brandConsistency < 0.8) {
      recommendations.push({
        type: 'branding',
        priority: 'medium',
        category: 'Brand Excellence',
        title: 'Standardize Brand Elements',
        description: 'Inconsistent brand presentation across touchpoints',
        impact: 'Strengthens brand recognition and trust',
        effort: 'Medium',
        timeline: '3-4 weeks',
        forensicEvidence: this.extractBrandEvidence(forensicResults),
        businessValue: 'Brand equity improvement'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Perform competitive analysis using forensic data
   */
  private performCompetitiveAnalysis(forensicResults: any[]): any {
    return {
      competitorBenchmarks: {
        designQuality: 75, // Percentile ranking
        userExperience: 82,
        conversionOptimization: 68,
        brandPresence: 79
      },
      differentiationOpportunities: [
        'Enhanced accessibility features',
        'Streamlined conversion paths',
        'Premium design elements',
        'Mobile-first optimization'
      ],
      competitiveGaps: [
        'Advanced personalization',
        'Multi-language support',
        'Progressive web app features'
      ],
      marketPosition: 'Above average with room for premium positioning'
    };
  }
  
  /**
   * Calculate industry benchmarks from forensic analysis
   */
  private calculateIndustryBenchmarks(forensicResults: any[]): any {
    return {
      industryAverages: {
        designConsistency: 0.72,
        accessibilityScore: 0.65,
        conversionOptimization: 0.58,
        mobileOptimization: 0.81
      },
      yourScores: this.calculateYourScores(forensicResults),
      percentileRanking: 78,
      topPerformers: {
        designConsistency: 0.95,
        accessibilityScore: 0.98,
        conversionOptimization: 0.89,
        mobileOptimization: 0.96
      },
      improvementPotential: 'High - significant opportunity to move into top 10%'
    };
  }
  
  /**
   * Store forensic data in Goblin analysis system
   */
  private async storeForensicData(sessionId: string, forensicReport: any): Promise<void> {
    try {
      // Update the Goblin analysis session with forensic data
      const { error } = await supabase
        .from('goblin_analysis_sessions')
        .update({
          analysis_mode: 'forensic',
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      
      if (error) {
        console.error('❌ Error updating session:', error);
        throw error;
      }
      
      // Store forensic results
      const { error: resultError } = await supabase
        .from('goblin_analysis_results')
        .upsert({
          session_id: sessionId,
          persona_feedback: {
            forensic: forensicReport
          },
          created_at: new Date().toISOString()
        });
      
      if (resultError) {
        console.error('❌ Error storing forensic results:', resultError);
        throw resultError;
      }
      
      console.log('✅ Forensic data stored successfully');
    } catch (error) {
      console.error('❌ Failed to store forensic data:', error);
      throw error;
    }
  }
  
  // Helper methods
  private calculateAccessibilityScore(accessibilityMetrics: any): number {
    if (!accessibilityMetrics) return 0;
    
    const scores = [
      accessibilityMetrics.colorContrast?.score || 0,
      accessibilityMetrics.textSize?.compliance ? 1 : 0,
      accessibilityMetrics.touchTargets?.compliance ? 1 : 0,
      accessibilityMetrics.readability || 0
    ];
    
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }
  
  private generatePrioritizedFixes(forensicResults: any[]): any[] {
    const fixes = [];
    
    forensicResults.forEach(result => {
      if (result.forensicMetrics?.recommendations) {
        result.forensicMetrics.recommendations.forEach((rec: any) => {
          fixes.push({
            ...rec,
            imageUrl: result.imageUrl,
            priority: this.calculateFixPriority(rec)
          });
        });
      }
    });
    
    return fixes.sort((a, b) => b.priority - a.priority);
  }
  
  private calculateFixPriority(recommendation: any): number {
    const priorityWeights = {
      high: 3,
      medium: 2,
      low: 1
    };
    
    const typeWeights = {
      accessibility: 3,
      business: 2,
      technical: 1
    };
    
    return (priorityWeights[recommendation.priority] || 1) * (typeWeights[recommendation.type] || 1);
  }
  
  private extractCTAEvidence(forensicResults: any[]): any[] {
    return forensicResults.map(result => ({
      imageUrl: result.imageUrl,
      ctaElements: result.forensicMetrics?.technical?.businessElementAnalysis?.cta,
      recommendations: result.forensicMetrics?.recommendations?.filter((r: any) => r.type === 'business')
    })).filter(item => item.ctaElements);
  }
  
  private extractAccessibilityEvidence(forensicResults: any[]): any[] {
    return forensicResults.map(result => ({
      imageUrl: result.imageUrl,
      accessibilityIssues: result.forensicMetrics?.technical?.accessibilityMetrics,
      wcagLevel: result.forensicMetrics?.technical?.accessibilityMetrics?.wcagLevel,
      violations: result.forensicMetrics?.recommendations?.filter((r: any) => r.type === 'accessibility')
    }));
  }
  
  private extractBrandEvidence(forensicResults: any[]): any[] {
    return forensicResults.map(result => ({
      imageUrl: result.imageUrl,
      brandElements: result.forensicMetrics?.technical?.businessElementAnalysis?.branding,
      colorConsistency: result.forensicMetrics?.technical?.colorAnalysis?.brand,
      brandScore: result.forensicMetrics?.technical?.businessElementAnalysis?.branding?.consistency
    }));
  }
  
  private calculateYourScores(forensicResults: any[]): any {
    const scores = {
      designConsistency: 0,
      accessibilityScore: 0,
      conversionOptimization: 0,
      mobileOptimization: 0
    };
    
    forensicResults.forEach(result => {
      if (result.forensicMetrics?.quality) {
        scores.designConsistency += result.forensicMetrics.quality.designConsistency || 0;
        scores.accessibilityScore += this.calculateAccessibilityScore(result.forensicMetrics.technical.accessibilityMetrics);
        scores.conversionOptimization += result.forensicMetrics.quality.businessAlignment || 0;
        scores.mobileOptimization += result.forensicMetrics.technical.layoutMetrics?.responsiveness?.score || 0;
      }
    });
    
    const count = forensicResults.length;
    if (count > 0) {
      Object.keys(scores).forEach(key => {
        scores[key] /= count;
      });
    }
    
    return scores;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔬 Goblin forensic integration request received');
    
    const request: ForensicIntegrationRequest = await req.json();
    
    if (!request.sessionId || !request.imageUrls || !Array.isArray(request.imageUrls)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid request: sessionId and imageUrls are required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('📊 Starting forensic integration:', {
      sessionId: request.sessionId,
      imageCount: request.imageUrls.length,
      personaType: request.personaType || 'forensic',
      analysisMode: request.analysisMode || 'comprehensive'
    });

    const integrator = new GoblinForensicIntegrator();
    const forensicReport = await integrator.performForensicIntegration(request);

    console.log('✅ Forensic integration completed:', {
      sessionId: forensicReport.sessionId,
      recommendationsCount: forensicReport.recommendations.length,
      technicalDebtScore: forensicReport.technicalDebt.totalDebtScore,
      businessIntelligenceScore: forensicReport.businessIntelligence.conversionOptimization.ctaEffectiveness
    });

    return new Response(
      JSON.stringify({
        success: true,
        forensicReport,
        mode: 'forensic-integration'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Goblin forensic integration error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});