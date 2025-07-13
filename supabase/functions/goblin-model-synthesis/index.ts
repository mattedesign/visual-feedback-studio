import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

// ============================================================================
// TYPES & CONFIGURATION
// ============================================================================

interface SynthesisRequest {
  sessionId: string;
  userId: string;
  persona: string;
  analysisData: any;
  goal: string;
  imageCount: number;
}

interface SynthesisResponse {
  success: boolean;
  sessionId: string;
  persona: string;
  personaFeedback: Record<string, any>;
  summary: string;
  priorityMatrix: PriorityMatrix;
  annotations: Annotation[];
  gripeLevel: string | null;
  maturityData?: any; // ✅ Optional maturity data
  metadata: {
    synthesisVersion: string;
    model: string;
    processedAt: string;
  };
}

interface PriorityMatrix {
  whatWorks: string[];
  whatHurts: string[];
  whatNext: string[];
}

interface Annotation {
  id: string;
  title: string;
  description: string;
  feedback: string;
  category: string;
  x: number;
  y: number;
  width: number;
  height: number;
  image_index: number;
  imageIndex: number;
  persona: string;
  priority: string;
}

interface PersonaData {
  biggestGripe: string;
  whatMakesGoblinHappy: string;
  goblinWisdom: string;
  goblinPrediction: string;
  [key: string]: any;
}

const SYNTHESIS_CONFIG = {
  version: '1.0',
  model: 'claude-sonnet-4-20250514',
  annotations: {
    minPerImage: 2,
    maxTotal: 8,
    positions: [
      { x: 15, y: 15 }, { x: 85, y: 15 }, { x: 15, y: 85 }, { x: 85, y: 85 },
      { x: 50, y: 25 }, { x: 25, y: 50 }, { x: 75, y: 50 }, { x: 50, y: 75 }
    ]
  },
  gripe: {
    levels: ['low', 'medium', 'rage-cranked'],
    triggers: {
      'rage-cranked': ['rage', 'terrible', 'disaster', 'awful'],
      'medium': ['annoying', 'frustrating', 'confusing', 'problem'],
      'low': []
    }
  }
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase client for maturity score calculations
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

console.log('🔬 Goblin Model Synthesis - Combining and structuring analysis results');

// ============================================================================
// MAIN HTTP HANDLER
// ============================================================================

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: SynthesisRequest = await req.json();
    
    console.log('🧪 Synthesizing results for:', {
      sessionId: requestData.sessionId?.substring(0, 8),
      persona: requestData.persona,
      hasAnalysisData: !!requestData.analysisData,
      imageCount: requestData.imageCount || 1
    });

    const synthesizedResults = await synthesizeResults(requestData);

    // ✅ MATURITY SCORE CALCULATION
    let maturityData = null;
    try {
      maturityData = await calculateMaturityScore(
        requestData.sessionId,
        requestData.userId,
        synthesizedResults
      );
      console.log('✅ Maturity score calculated:', maturityData?.overallScore);
    } catch (maturityError) {
      console.error('⚠️ Maturity score calculation failed:', maturityError);
      // Don't fail the entire request if maturity calculation fails
    }

    const response: SynthesisResponse = {
      success: true,
      sessionId: requestData.sessionId,
      persona: requestData.persona,
      personaFeedback: synthesizedResults.personaFeedback,
      summary: synthesizedResults.summary,
      priorityMatrix: synthesizedResults.priorityMatrix,
      annotations: synthesizedResults.annotations,
      gripeLevel: synthesizedResults.gripeLevel,
      maturityData: maturityData, // ✅ Include maturity data in response
      metadata: {
        synthesisVersion: SYNTHESIS_CONFIG.version,
        model: SYNTHESIS_CONFIG.model,
        processedAt: new Date().toISOString()
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Result synthesis failed:', error);
    return createErrorResponse(error);
  }
});

// ============================================================================
// CORE SYNTHESIS ORCHESTRATOR
// ============================================================================

async function synthesizeResults(request: SynthesisRequest) {
  const { persona, analysisData, goal, imageCount = 1 } = request;
  
  try {
    // Extract and validate core analysis content
    const extractedData = extractAnalysisData(analysisData);
    
    // Get persona-specific data mapping
    const personaDataMapper = new PersonaDataMapper();
    const mappedPersonaData = personaDataMapper.mapPersonaData(persona, extractedData.rawAnalysisData);
    
    // Build persona feedback structure
    const personaFeedback = buildPersonaFeedback(persona, extractedData, mappedPersonaData);
    
    // Generate all synthesis components
    const priorityMatrixBuilder = new PriorityMatrixBuilder();
    const priorityMatrix = priorityMatrixBuilder.build(extractedData.recommendations, persona, extractedData.analysis);
    
    const summaryGenerator = new SummaryGenerator();
    const summary = summaryGenerator.generate(persona, extractedData.analysis, extractedData.recommendations, goal);
    
    const annotationGenerator = new AnnotationGenerator();
    const annotations = annotationGenerator.generate(extractedData.recommendations, persona, imageCount);
    
    const gripeLevel = determineGripeLevel(persona, extractedData.analysis, extractedData.rawAnalysisData);
    
    console.log(`✅ Synthesis completed for ${persona}:`, {
      hasRequiredFields: validatePersonaData(mappedPersonaData),
      personaDataKeys: Object.keys(mappedPersonaData),
      componentsGenerated: { priorityMatrix: !!priorityMatrix, summary: !!summary, annotations: annotations.length }
    });
    
    return {
      personaFeedback,
      summary,
      priorityMatrix,
      annotations,
      gripeLevel
    };
    
  } catch (error) {
    console.error(`❌ Synthesis failed for persona ${persona}:`, error);
    throw new Error(`Synthesis failed: ${error.message}`);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function createErrorResponse(error: any): Response {
  return new Response(
    JSON.stringify({ 
      success: false,
      error: error.message || 'Unknown error occurred'
    }),
    { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

function extractAnalysisData(analysisData: any) {
  console.log('🔍 Extracting analysis data:', {
    hasAnalysisData: !!analysisData.analysisData,
    analysisDataKeys: analysisData.analysisData ? Object.keys(analysisData.analysisData) : [],
    hasRawResponse: !!analysisData.rawResponse
  });

  let extractedAnalysis = '';
  let extractedRecommendations = [];
  let extractedRawData = {};

  // Try to get structured data from analysisData first
  if (analysisData.analysisData && typeof analysisData.analysisData === 'object') {
    extractedAnalysis = analysisData.analysisData.analysis || '';
    extractedRecommendations = analysisData.analysisData.recommendations || [];
    extractedRawData = analysisData.analysisData;
    
    console.log('✅ Extracted from analysisData:', {
      hasAnalysis: !!extractedAnalysis,
      recommendationsCount: extractedRecommendations.length,
      recommendations: extractedRecommendations
    });
  }
  
  // If no recommendations found, try parsing rawResponse as JSON
  if (extractedRecommendations.length === 0 && analysisData.rawResponse) {
    try {
      // First try to extract JSON from markdown code blocks
      let jsonContent = analysisData.rawResponse;
      const jsonBlockMatch = jsonContent.match(/```json\s*\n?({[\s\S]*?})\s*\n?```/);
      if (jsonBlockMatch) {
        jsonContent = jsonBlockMatch[1];
      } else {
        // Try to find any JSON object in the response
        const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonContent = jsonMatch[0];
        }
      }
      
      if (jsonContent) {
        const parsed = JSON.parse(jsonContent);
        if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
          extractedRecommendations = parsed.recommendations;
          console.log('✅ Extracted recommendations from rawResponse JSON:', extractedRecommendations);
        }
        if (parsed.analysis && !extractedAnalysis) {
          extractedAnalysis = parsed.analysis;
        }
        // Merge parsed data
        extractedRawData = { ...extractedRawData, ...parsed };
      }
    } catch (error) {
      console.log('⚠️ Failed to parse rawResponse JSON:', error.message);
    }
  }
  
  // Try to extract from rawResponse as plain text if still no recommendations
  if (extractedRecommendations.length === 0 && analysisData.rawResponse) {
    try {
      // Look for recommendations in plain text format
      const responseText = analysisData.rawResponse.toLowerCase();
      if (responseText.includes('recommendation')) {
        // Extract lines that look like recommendations
        const lines = analysisData.rawResponse.split('\n');
        const recommendationLines = lines.filter(line => 
          line.trim().length > 20 && 
          (line.includes('recommend') || line.includes('improve') || line.includes('enhance') || 
           line.includes('implement') || line.includes('redesign') || line.includes('optimize'))
        );
        
        if (recommendationLines.length > 0) {
          extractedRecommendations = recommendationLines.map(line => line.trim()).slice(0, 5);
          console.log('✅ Extracted recommendations from plain text:', extractedRecommendations);
        }
      }
    } catch (error) {
      console.log('⚠️ Failed to extract recommendations from plain text:', error.message);
    }
  }
  
  // Final fallbacks
  if (!extractedAnalysis) {
    extractedAnalysis = analysisData.rawResponse || 'Analysis completed';
  }
  
  if (extractedRecommendations.length === 0) {
    console.log('🚨 No specific recommendations found in any format, using fallback');
    extractedRecommendations = ['Improve user experience clarity', 'Enhance interface usability'];
  } else {
    console.log('🎯 Using extracted specific recommendations:', extractedRecommendations);
  }

  const result = {
    analysis: extractedAnalysis,
    recommendations: extractedRecommendations,
    rawAnalysisData: extractedRawData
  };
  
  console.log('🎯 Final extracted data:', {
    analysisLength: result.analysis.length,
    recommendationsCount: result.recommendations.length,
    recommendations: result.recommendations
  });
  
  return result;
}

function buildPersonaFeedback(persona: string, extractedData: any, mappedPersonaData: PersonaData) {
  return {
    [persona]: {
      analysis: extractedData.analysis,
      recommendations: extractedData.recommendations,
      ...mappedPersonaData
    }
  };
}

function validatePersonaData(personaData: PersonaData): boolean {
  return !!(personaData.biggestGripe && personaData.whatMakesGoblinHappy && 
           personaData.goblinWisdom && personaData.goblinPrediction);
}

function determineGripeLevel(persona: string, analysis: string, analysisData: any): string | null {
  if (persona !== 'clarity') return null;
  
  if (analysisData?.gripeLevel) return analysisData.gripeLevel;
  
  const lowerAnalysis = analysis.toLowerCase();
  
  for (const [level, triggers] of Object.entries(SYNTHESIS_CONFIG.gripe.triggers)) {
    if (triggers.some(trigger => lowerAnalysis.includes(trigger))) {
      return level;
    }
  }
  
  return 'low';
}

// ============================================================================
// MODULAR PERSONA DATA MAPPER
// ============================================================================

class PersonaDataMapper {
  mapPersonaData(persona: string, analysisData: any): PersonaData {
    console.log(`🎭 Mapping persona data for: ${persona}`, { 
      hasAnalysisData: !!analysisData,
      availableKeys: analysisData ? Object.keys(analysisData) : []
    });

    const mapper = this.getPersonaMapper(persona);
    const mappedData = mapper(analysisData);
    
    console.log(`✅ ${persona} persona data mapped:`, mappedData);
    return mappedData;
  }

  private getPersonaMapper(persona: string) {
    const mappers = {
      clarity: this.mapClarityData.bind(this),
      strategic: this.mapStrategicData.bind(this),
      mirror: this.mapMirrorData.bind(this),
      mad: this.mapMadData.bind(this),
      exec: this.mapExecutiveData.bind(this)
    };

    return mappers[persona as keyof typeof mappers] || this.mapDefaultData.bind(this);
  }

  private mapClarityData(analysisData: any): PersonaData {
    return {
      goblinWisdom: analysisData?.goblinWisdom || "Users don't care about your clever design - they just want to get stuff done!",
      attitude: analysisData?.goblinAttitude || 'grumpy',
      userRealityCheck: "What users actually experience vs. what you think they experience",
      biggestGripe: analysisData?.biggestGripe || "Your users are confused and you don't even realize it!",
      whatMakesGoblinHappy: analysisData?.whatMakesGoblinHappy || "Clear, obvious interfaces that don't make users think",
      goblinPrediction: analysisData?.goblinPrediction || "Fix the confusing parts and watch your conversion rates soar"
    };
  }

  private mapStrategicData(analysisData: any): PersonaData {
    return {
      businessImpact: analysisData?.businessImpact || "Strategic improvements needed to align with business objectives",
      implementation: analysisData?.implementation || "Phased approach recommended for maximum impact",
      metrics: analysisData?.metrics || ["User satisfaction", "Task completion rate", "Business conversion"],
      biggestGripe: analysisData?.businessImpact || analysisData?.biggestGripe || "Your UX strategy isn't aligned with business goals - you're leaving money on the table",
      whatMakesGoblinHappy: analysisData?.implementation || analysisData?.whatMakesGoblinHappy || "Strategic UX improvements that drive measurable business results",
      goblinWisdom: analysisData?.goblinWisdom || "Every design decision should tie back to a business metric",
      goblinPrediction: analysisData?.goblinPrediction || "Align UX with business strategy and watch both user satisfaction and revenue grow"
    };
  }

  private mapMirrorData(analysisData: any): PersonaData {
    return {
      insights: analysisData?.insights || ["Consider the gap between intention and user perception"],
      reflection: analysisData?.reflection || "What assumptions might you be making about your users?",
      nextSteps: ["Observe real users interacting with your design", "Question your design assumptions"],
      biggestGripe: analysisData?.reflection || analysisData?.biggestGripe || "You're designing for yourself, not your users - step back and see what they actually see",
      whatMakesGoblinHappy: Array.isArray(analysisData?.insights) ? analysisData.insights.join(", ") : (analysisData?.insights || analysisData?.whatMakesGoblinHappy || "Deep user insights that challenge design assumptions"),
      goblinWisdom: analysisData?.goblinWisdom || "The most powerful design insights come from honest self-reflection",
      goblinPrediction: analysisData?.goblinPrediction || "Question your assumptions and you'll discover breakthrough UX improvements"
    };
  }

  private mapMadData(analysisData: any): PersonaData {
    return {
      experiments: analysisData?.experiments || ["A/B test unconventional approaches"],
      wildCard: analysisData?.wildCard || "What if we completely flipped the expected interaction pattern?",
      riskLevel: "experimental",
      biggestGripe: analysisData?.wildCard || analysisData?.biggestGripe || "Your interface is playing it way too safe - users can handle some creative chaos!",
      whatMakesGoblinHappy: Array.isArray(analysisData?.experiments) ? analysisData.experiments.join(", ") : (analysisData?.experiments || analysisData?.whatMakesGoblinHappy || "Experiments that break conventional UX rules and surprise users in delightful ways"),
      goblinWisdom: analysisData?.goblinWisdom || "Sometimes the most brilliant UX solutions come from completely ignoring what everyone else is doing",
      goblinPrediction: analysisData?.goblinPrediction || "If you embrace experimental approaches, you'll discover interaction patterns that set you apart from boring competitors"
    };
  }

  private mapExecutiveData(analysisData: any): PersonaData {
    return {
      roi: analysisData?.roi || "UX improvements with measurable business impact",
      timeline: analysisData?.timeline || ["Phase 1: Quick wins", "Phase 2: Strategic improvements"],
      competitiveAdvantage: "Enhanced user experience drives competitive differentiation",
      biggestGripe: analysisData?.roi || analysisData?.biggestGripe || "Your UX investments aren't generating the ROI they should - time to focus on high-impact changes",
      whatMakesGoblinHappy: Array.isArray(analysisData?.timeline) ? analysisData.timeline.join(", ") : (analysisData?.timeline || analysisData?.whatMakesGoblinHappy || "Strategic UX roadmaps that deliver measurable business results"),
      goblinWisdom: analysisData?.goblinWisdom || "The best UX decisions are backed by data and drive clear business outcomes",
      goblinPrediction: analysisData?.goblinPrediction || "Focus on high-ROI UX improvements and you'll see both user satisfaction and business metrics improve dramatically"
    };
  }

  private mapDefaultData(): PersonaData {
    console.log('⚠️ Unknown persona, using fallback data');
    return {
      biggestGripe: "Your interface needs some goblin attention!",
      whatMakesGoblinHappy: "User-centered design that actually works",
      goblinWisdom: "Good UX speaks for itself",
      goblinPrediction: "Fix the user experience and everything else follows"
    };
  }
}

// ============================================================================
// PRIORITY MATRIX BUILDER
// ============================================================================

class PriorityMatrixBuilder {
  build(recommendations: string[], persona: string, analysis: string): PriorityMatrix {
    const whatWorks = this.extractPositives(analysis);
    const whatHurts = this.extractNegatives(analysis, recommendations);
    const whatNext = this.prioritizeRecommendations(recommendations, persona);

    return {
      whatWorks: whatWorks.length > 0 ? whatWorks : ["Design foundation is in place"],
      whatHurts: whatHurts.length > 0 ? whatHurts : ["User experience optimization needed"],
      whatNext: whatNext.length > 0 ? whatNext : ["Implement user-centered improvements"]
    };
  }

  private extractPositives(analysis: string): string[] {
    const positiveKeywords = ['good', 'works', 'effective', 'clear', 'intuitive', 'helpful', 'strong'];
    const sentences = analysis.split(/[.!?]+/);
    
    return sentences
      .filter(sentence => 
        positiveKeywords.some(keyword => sentence.toLowerCase().includes(keyword)) &&
        !sentence.toLowerCase().includes('not') &&
        !sentence.toLowerCase().includes('but')
      )
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 10)
      .slice(0, 3);
  }

  private extractNegatives(analysis: string, recommendations: string[]): string[] {
    const negativeKeywords = ['confusing', 'unclear', 'difficult', 'frustrating', 'missing', 'broken', 'problem'];
    const sentences = analysis.split(/[.!?]+/);
    
    const analysisIssues = sentences
      .filter(sentence => 
        negativeKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
      )
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 10)
      .slice(0, 2);

    const recommendationIssues = recommendations
      .filter(rec => rec.toLowerCase().includes('fix') || rec.toLowerCase().includes('improve'))
      .slice(0, 2);

    return [...analysisIssues, ...recommendationIssues].slice(0, 3);
  }

  private prioritizeRecommendations(recommendations: string[], persona: string): string[] {
    if (recommendations.length === 0) {
      return this.getDefaultRecommendations(persona);
    }

    const prioritized = [...recommendations].sort((a, b) => {
      const scoreA = this.getRecommendationScore(a, persona);
      const scoreB = this.getRecommendationScore(b, persona);
      return scoreB - scoreA;
    });

    return prioritized.slice(0, 3);
  }

  private getRecommendationScore(recommendation: string, persona: string): number {
    const rec = recommendation.toLowerCase();
    let score = 0;

    if (rec.includes('user') || rec.includes('usability')) score += 3;
    if (rec.includes('clear') || rec.includes('simple')) score += 2;
    if (rec.includes('navigation') || rec.includes('menu')) score += 2;

    switch (persona) {
      case 'clarity':
        if (rec.includes('obvious') || rec.includes('confusing')) score += 3;
        break;
      case 'strategic':
        if (rec.includes('business') || rec.includes('conversion')) score += 3;
        break;
      case 'executive':
        if (rec.includes('roi') || rec.includes('metric')) score += 3;
        break;
    }

    return score;
  }

  private getDefaultRecommendations(persona: string): string[] {
    const defaults = {
      clarity: [
        "Make the interface more obvious for users",
        "Reduce cognitive load with clearer labeling",
        "Fix confusing navigation patterns"
      ],
      strategic: [
        "Align design with strategic business objectives",
        "Improve user flow for better conversion",
        "Implement research-backed UX patterns"
      ],
      executive: [
        "Focus on high-ROI UX improvements",
        "Prioritize changes that drive business metrics",
        "Implement competitive UX advantages"
      ]
    };

    return defaults[persona as keyof typeof defaults] || [
      "Improve overall user experience",
      "Enhance interface clarity",
      "Optimize user interaction patterns"
    ];
  }
}

// ============================================================================
// SUMMARY GENERATOR
// ============================================================================

class SummaryGenerator {
  generate(persona: string, analysis: string, recommendations: string[], goal: string): string {
    const personaName = persona.charAt(0).toUpperCase() + persona.slice(1);
    const recCount = recommendations.length;
    
    if (persona === 'clarity') {
      return `Clarity the goblin has examined your design with their usual grumpy honesty. ${recCount} specific improvements have been identified to bridge the gap between what you think users experience and what they actually encounter. The goblin's wisdom: focus on making things obvious rather than clever.`;
    }
    
    return `${personaName} analysis completed for your goal: "${goal}". ${recCount} strategic recommendations have been provided to enhance user experience and achieve your objectives. Focus on implementing high-impact changes that align with your specific goals.`;
  }
}

// ============================================================================
// ANNOTATION GENERATOR
// ============================================================================

class AnnotationGenerator {
  generate(recommendations: string[], persona: string, imageCount: number = 1): Annotation[] {
    const targetAnnotationCount = Math.min(
      imageCount * SYNTHESIS_CONFIG.annotations.minPerImage, 
      SYNTHESIS_CONFIG.annotations.maxTotal
    );
    
    const availableRecs = recommendations.length > 0 
      ? recommendations 
      : [`Improve user experience for ${persona} persona`];
    
    const annotationsToGenerate = this.expandRecommendations(availableRecs, targetAnnotationCount);
    
    return annotationsToGenerate.map((rec, index) => 
      this.createAnnotation(rec, index, persona, imageCount)
    );
  }

  private expandRecommendations(recommendations: string[], targetCount: number): string[] {
    const expanded = [];
    for (let i = 0; i < targetCount; i++) {
      const recIndex = i % recommendations.length;
      expanded.push(recommendations[recIndex]);
    }
    return expanded;
  }

  private createAnnotation(recommendation: string, index: number, persona: string, imageCount: number): Annotation {
    const imageIndex = index % imageCount;
    const positionInImage = Math.floor(index / imageCount);
    const position = SYNTHESIS_CONFIG.annotations.positions[positionInImage % SYNTHESIS_CONFIG.annotations.positions.length];

    // Enhanced recommendation analysis for problem + solution
    const enhancedFeedback = this.enhanceFeedbackWithSolution(recommendation, persona);

    // ✅ FIXED: Intelligent content analysis instead of hardcoded categories
    const { category, title } = this.analyzeRecommendationContext(recommendation, persona);

    return {
      id: `${persona}-annotation-${index + 1}`,
      title: title,
      description: enhancedFeedback.problem || recommendation,
      feedback: enhancedFeedback.solution || `Specific solution for ${persona} persona`,
      category: category,
      x: position.x,
      y: position.y,
      width: 8,
      height: 4,
      image_index: imageIndex,
      imageIndex: imageIndex,
      persona,
      priority: index < 2 ? 'high' : 'medium',
      problemStatement: enhancedFeedback.problem,
      solutionStatement: enhancedFeedback.solution
    };
  }

  // ✅ NEW: Intelligent content analysis method
  private analyzeRecommendationContext(recommendation: string, persona: string): { category: string, title: string } {
    const recLower = recommendation.toLowerCase();
    
    // Analyze content for actual interface elements mentioned
    if (recLower.includes('dashboard') || recLower.includes('metric') || recLower.includes('chart') || recLower.includes('data')) {
      return { category: 'data-visualization', title: 'Dashboard Optimization' };
    }
    
    if (recLower.includes('navigation') || recLower.includes('menu') || recLower.includes('sidebar')) {
      return { category: 'navigation', title: 'Navigation Enhancement' };
    }
    
    if (recLower.includes('hierarchy') || recLower.includes('visual') || recLower.includes('layout')) {
      return { category: 'visual-hierarchy', title: 'Visual Hierarchy Issue' };
    }
    
    if (recLower.includes('button') || recLower.includes('cta') || recLower.includes('action')) {
      return { category: 'interaction', title: 'Interaction Design' };
    }
    
    if (recLower.includes('content') || recLower.includes('text') || recLower.includes('readability')) {
      return { category: 'content', title: 'Content Strategy' };
    }
    
    // Fallback based on persona instead of random categories
    const personaTitles = {
      strategic: 'Strategic UX Issue',
      clarity: 'Clarity Enhancement',
      mirror: 'User Experience Reflection',
      mad: 'Experimental Opportunity',
      exec: 'Business Impact Issue'
    };
    
    return { 
      category: 'usability', 
      title: personaTitles[persona as keyof typeof personaTitles] || 'UX Enhancement' 
    };
  }

    const { category, title } = this.analyzeRecommendationContext(recommendation, persona);

    return {
      id: `${persona}-annotation-${index + 1}`,
      title: title,
      description: enhancedFeedback.problem || recommendation,
      feedback: enhancedFeedback.solution || `Specific solution for ${persona} persona`,
      category: category,
      x: position.x,
      y: position.y,
      width: 8,
      height: 4,
      image_index: imageIndex,
      imageIndex: imageIndex,
      persona,
      priority: index < 2 ? 'high' : 'medium',
      problemStatement: enhancedFeedback.problem,
      solutionStatement: enhancedFeedback.solution
    };
  }

  // Enhanced method to analyze problem and generate persona-specific solutions
  private enhanceFeedbackWithSolution(recommendation: string, persona: string) {
    // If recommendation already contains solution language, split it
    if (recommendation.includes(' - ') || recommendation.includes(': ')) {
      const parts = recommendation.split(/\s*[-:]\s*/);
      if (parts.length >= 2) {
        return {
          problem: parts[0].trim(),
          solution: this.generatePersonaSolution(parts.slice(1).join(' - ').trim(), persona)
        };
      }
    }

    // For single problem statements, generate persona-specific solution
    const problem = recommendation.trim();
    const solution = this.generatePersonaSolution(problem, persona);

    return {
      problem: problem,
      solution: solution
    };
  }

  // New method to generate truly persona-specific solutions based on problem analysis
  private generatePersonaSolution(problemText: string, persona: string) {
    const problemLower = problemText.toLowerCase();
    
    // Analyze the problem to understand what type of issue it is
    const problemType = this.analyzeProblemType(problemLower);
    
    // Generate solution based on persona and specific problem content
    switch (persona) {
      case 'clarity':
        return this.generateClaritySolution(problemText, problemType);
      case 'strategic':
        return this.generateStrategicSolution(problemText, problemType);
      case 'mirror':
        return this.generateMirrorSolution(problemText, problemType);
      case 'mad':
        return this.generateMadSolution(problemText, problemType);
      case 'exec':
        return this.generateExecutiveSolution(problemText, problemType);
      default:
        return this.generateDefaultSolution(problemText, problemType);
    }
  }

  private getClaritySolution(problem: string) {
    const problemLower = problem.toLowerCase();
    
    // ✅ FIXED: Context-aware Clarity solutions
    if (problemLower.includes('dashboard') || problemLower.includes('metric')) {
      return 'Make those numbers SCREAM what they mean! Big, bold metric cards with clear labels - no corporate jargon!';
    }
    
    if (problemLower.includes('navigation') || problemLower.includes('menu')) {
      return 'Scrap the fancy menu - users need BIG, OBVIOUS links that scream where they go!';
    }
    
    if (problemLower.includes('button') || problemLower.includes('action')) {
      return 'Make buttons IMPOSSIBLE to miss - bright colors, action words like "GET STARTED NOW!"';
    }
    
    if (problemLower.includes('data') || problemLower.includes('chart')) {
      return 'Charts should tell a story in 3 seconds flat - label everything, use colors that make sense!';
    }
    
    if (problemLower.includes('hierarchy') || problemLower.includes('layout')) {
      return 'Stop hiding important stuff! Big headings, clear sections, obvious flow from top to bottom!';
    }
    
    if (problemLower.includes('form') || problemLower.includes('input')) {
      return 'One damn field at a time! Clear labels, obvious errors, no clever BS';
    }
    
    // Clarity fallback
    return 'Make it so obvious a goblin could use it while angry - clear, simple, no thinking required!';
  }

  private getStrategicSolution(problem: string) {
    const problemLower = problem.toLowerCase();
    
    // ✅ FIXED: Context-aware solutions instead of generic templates
    if (problemLower.includes('dashboard') || problemLower.includes('metric') || problemLower.includes('chart')) {
      return 'Prioritize key metrics above fold - move high-impact data higher, add executive summary card for quick decisions';
    }
    
    if (problemLower.includes('navigation') || problemLower.includes('sidebar')) {
      return 'Redesign information architecture based on user task flow - group related functions, reduce navigation depth';
    }
    
    if (problemLower.includes('hierarchy') || problemLower.includes('visual')) {
      return 'Apply strategic visual hierarchy - emphasize primary actions, de-emphasize secondary functions, guide attention to conversion points';
    }
    
    if (problemLower.includes('data') || problemLower.includes('information')) {
      return 'Implement progressive disclosure - show summary first, detailed data on demand, optimize for executive decision-making';
    }
    
    // Context-aware fallback
    return 'Apply strategic UX principles based on business objectives and user research insights';
  }

  private getMirrorSolution(problem: string) {
    const solutions = {
      'user': 'Ask yourself: "What assumptions am I making about user behavior here?"',
      'navigation': 'Reflect deeply: "Would a first-time user understand this navigation instantly?"',
      'content': 'Question honestly: "Am I writing for my users or showing off my vocabulary?"',
      'design': 'Consider: "What would happen if I removed this entirely? Would users even notice?"',
      'form': 'Examine: "Am I asking for this data because I need it, or because I can?"',
      'button': 'Wonder: "Is this button where users expect to find it, or where I think it looks good?"',
      'layout': 'Challenge: "Does this layout serve my users\' mental model or my aesthetic preference?"',
      'flow': 'Ponder: "Am I designing this flow for how I think, or how my users actually behave?"',
      'default': 'Stop. Breathe. See this through your users\' eyes - what do they actually need vs. what you think they need?'
    };

    const problemLower = problem.toLowerCase();
    for (const [key, solution] of Object.entries(solutions)) {
      if (problemLower.includes(key)) return solution;
    }
    return solutions.default;
  }

  private getMadSolution(problem: string) {
    const solutions = {
      'navigation': 'Wild idea: Try floating action bubbles, gesture-based controls, or voice-activated navigation!',
      'form': 'Experiment time: Single-field conversational forms, or progressive web app with smart pre-filling!',
      'onboarding': 'Go crazy: Interactive story-based tutorials, gamified setup with rewards, or AI-powered personalization!',
      'layout': 'Break ALL rules: Asymmetrical layouts, scroll-jacking experiences, or immersive 3D interfaces!',
      'button': 'Test wild stuff: Animated morphing buttons, physics-based interactions, or gesture-controlled actions!',
      'search': 'Try something nuts: Visual search with drag-and-drop, AI-powered semantic search, or voice queries!',
      'mobile': 'Experimental approach: Haptic feedback patterns, tilting gestures, or AR overlay interfaces!',
      'content': 'Radical idea: Interactive storytelling, dynamic content that adapts to reading speed, or collaborative editing!',
      'default': 'Screw conventional wisdom! What if we completely flipped user expectations and created something they\'ve never seen before?'
    };

    const problemLower = problem.toLowerCase();
    for (const [key, solution] of Object.entries(solutions)) {
      if (problemLower.includes(key)) return solution;
    }
    return solutions.default;
  }

  private getExecutiveSolution(problem: string) {
    const solutions = {
      'conversion': 'ROI-focused: Implement conversion optimization targeting 15-25% revenue increase within Q1',
      'onboarding': 'Business impact: Reduce time-to-value from setup to first success - target 40% faster activation',
      'navigation': 'Efficiency play: Optimize user journey to reduce support tickets by 30% and increase task completion',
      'mobile': 'Market capture: Mobile-first responsive design to capture 70% mobile user base and increase engagement',
      'form': 'Lead generation: Streamline forms to reduce abandonment - every field costs 11% conversion rate',
      'search': 'User retention: Implement smart search to increase session duration and reduce bounce rate by 25%',
      'checkout': 'Revenue protection: Optimize checkout funnel - current industry standard is 30% cart abandonment',
      'performance': 'Competitive advantage: Page speed optimization - every 100ms delay costs 1% conversion',
      'default': 'Strategic focus: Prioritize highest-ROI UX improvements that deliver measurable business outcomes within 90 days'
    };

    const problemLower = problem.toLowerCase();
    for (const [key, solution] of Object.entries(solutions)) {
      if (problemLower.includes(key)) return solution;
    }
    return solutions.default;
  }

  // New problem type analyzer
  private analyzeProblemType(problemLower: string): string {
    const problemTypes = {
      'savings': ['savings', 'callout', 'value', 'proposition', 'price'],
      'navigation': ['navigation', 'menu', 'nav', 'header', 'link'],
      'button': ['button', 'cta', 'call-to-action', 'click'],
      'form': ['form', 'field', 'input', 'submit'],
      'content': ['content', 'text', 'copy', 'read'],
      'layout': ['layout', 'design', 'visual', 'structure'],
      'onboarding': ['onboarding', 'tutorial', 'setup', 'welcome'],
      'search': ['search', 'find', 'filter'],
      'mobile': ['mobile', 'responsive', 'tablet', 'touch'],
      'flow': ['flow', 'journey', 'process', 'step'],
      'checkout': ['checkout', 'purchase', 'buy', 'payment'],
      'performance': ['loading', 'speed', 'performance', 'slow']
    };

    for (const [type, keywords] of Object.entries(problemTypes)) {
      if (keywords.some(keyword => problemLower.includes(keyword))) {
        return type;
      }
    }
    return 'general';
  }

  // Enhanced persona-specific solution generators
  private generateClaritySolution(problemText: string, problemType: string): string {
    const problemLower = problemText.toLowerCase();
    
    // Analyze the specific problem context for Clarity's sassy solutions
    if (problemType === 'savings' || problemLower.includes('savings') || problemLower.includes('value')) {
      return 'Scream the savings! Put a BIG, BRIGHT banner above the fold that says "SAVE $X" - no hiding discounts in fine print!';
    }
    
    if (problemType === 'navigation') {
      return 'Stop playing hide-and-seek with navigation! Make it OBVIOUS where users can go - big buttons, clear labels, no mystery meat!';
    }
    
    if (problemType === 'button') {
      return 'Make buttons IMPOSSIBLE to ignore - bright colors, action words like "GET YOURS NOW!" - if users squint to find it, you failed!';
    }
    
    // Use original method as fallback but enhanced
    return this.getClaritySolution(problemText);
  }

  private generateStrategicSolution(problemText: string, problemType: string): string {
    const problemLower = problemText.toLowerCase();
    
    if (problemType === 'savings' || problemLower.includes('savings') || problemLower.includes('value')) {
      return 'Strategic value communication: A/B test prominent value callouts vs. subtle messaging - data shows 32% higher conversion with above-fold value props';
    }
    
    if (problemType === 'navigation') {
      return 'Implement data-driven navigation: analyze user journey heat maps to restructure IA based on actual user behavior patterns';
    }
    
    if (problemType === 'conversion') {
      return 'Optimize conversion funnel: implement progressive disclosure with exit-intent capture - reduce abandonment by 25%';
    }
    
    return this.getStrategicSolution(problemText);
  }

  private generateMirrorSolution(problemText: string, problemType: string): string {
    const problemLower = problemText.toLowerCase();
    
    if (problemType === 'savings' || problemLower.includes('savings') || problemLower.includes('value')) {
      return 'Ask yourself: "Am I communicating value the way customers think about it, or the way my business thinks about it?"';
    }
    
    if (problemType === 'navigation') {
      return 'Reflect: "Would someone who\'s never seen my site understand this navigation structure instantly, or am I relying on internal company logic?"';
    }
    
    if (problemType === 'content') {
      return 'Question deeply: "Am I writing this content to serve my users\' needs, or to sound impressive to my colleagues?"';
    }
    
    return this.getMirrorSolution(problemText);
  }

  private generateMadSolution(problemText: string, problemType: string): string {
    const problemLower = problemText.toLowerCase();
    
    if (problemType === 'savings' || problemLower.includes('savings') || problemLower.includes('value')) {
      return 'Go WILD: Animated savings counter that counts up in real-time, or AR overlay showing money flying into their pocket!';
    }
    
    if (problemType === 'navigation') {
      return 'Experimental madness: Try gesture-controlled navigation, voice commands, or floating action bubbles that follow scroll behavior!';
    }
    
    if (problemType === 'button') {
      return 'Break the rules: Morphing buttons that animate based on urgency, physics-based interactions, or buttons that grow when you hesitate!';
    }
    
    return this.getMadSolution(problemText);
  }

  private generateExecutiveSolution(problemText: string, problemType: string): string {
    const problemLower = problemText.toLowerCase();
    
    if (problemType === 'savings' || problemLower.includes('savings') || problemLower.includes('value')) {
      return 'ROI opportunity: Prominent value messaging drives 20-35% higher conversion rates - implement within 2 weeks for immediate revenue impact';
    }
    
    if (problemType === 'navigation') {
      return 'Business efficiency: Optimize navigation to reduce user friction - target 25% decrease in support tickets and 15% increase in task completion';
    }
    
    if (problemType === 'conversion') {
      return 'Revenue optimization: Strategic conversion improvements typically deliver 12-28% revenue increase - prioritize high-traffic pages first';
    }
    
    return this.getExecutiveSolution(problemText);
  }

  private generateDefaultSolution(problemText: string, problemType: string): string {
    return `Improve the ${problemType} experience based on user needs and business objectives`;
  }
}

// ============================================================================
// MATURITY SCORE CALCULATION SYSTEM
// ============================================================================

async function calculateMaturityScore(sessionId: string, userId: string, synthesizedResults: any) {
  console.log('🎯 Starting maturity score calculation for user:', userId.substring(0, 8));
  
  try {
    // Calculate dimension scores based on feedback patterns
    const dimensionScores = calculateDimensionScores(synthesizedResults);
    const overallScore = Object.values(dimensionScores).reduce((sum: number, score: number) => sum + score, 0);
    
    // Get previous score for comparison
    const { data: previousScores } = await supabaseClient
      .from('goblin_maturity_scores')
      .select('overall_score')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    const previousScore = previousScores?.[0]?.overall_score || null;

    // Calculate percentile
    const percentile = await calculatePercentile(userId, overallScore);

    // Determine maturity level
    const maturityLevel = getMaturityLevel(overallScore);

    // Calculate streak
    const streak = await calculateStreak(userId);

    // Save maturity score
    const { data: scoreData, error: scoreError } = await supabaseClient
      .from('goblin_maturity_scores')
      .insert({
        user_id: userId,
        session_id: sessionId,
        overall_score: overallScore,
        previous_score: previousScore,
        score_change: previousScore ? overallScore - previousScore : 0,
        usability_score: dimensionScores.usability,
        accessibility_score: dimensionScores.accessibility,
        performance_score: dimensionScores.performance,
        clarity_score: dimensionScores.clarity,
        delight_score: dimensionScores.delight,
        percentile_rank: percentile,
        maturity_level: maturityLevel.level,
        streak_days: streak
      })
      .select()
      .single();

    if (scoreError) {
      console.error('Error saving maturity score:', scoreError);
      throw scoreError;
    }

    // Generate improvement roadmap
    const roadmapItems = await generateRoadmap(userId, dimensionScores);

    // Save roadmap items
    if (roadmapItems.length > 0) {
      const { error: roadmapError } = await supabaseClient
        .from('goblin_roadmap_items')
        .insert(
          roadmapItems.map((item, index) => ({
            user_id: userId,
            priority: index + 1,
            dimension: item.dimension,
            title: item.title,
            description: item.description,
            estimated_impact: item.estimated_impact,
            difficulty: item.difficulty
          }))
        );
        
      if (roadmapError) {
        console.error('Error saving roadmap:', roadmapError);
      }
    }

    // Check for achievements
    const achievements = await checkAchievements(userId, overallScore, previousScore);

    // Save achievements
    if (achievements.length > 0) {
      const { error: achievementError } = await supabaseClient
        .from('goblin_achievements')
        .insert(
          achievements.map(achievement => ({
            user_id: userId,
            ...achievement
          }))
        );
        
      if (achievementError) {
        console.error('Error saving achievements:', achievementError);
      }
    }

    return {
      overallScore,
      previousScore,
      scoreChange: previousScore ? overallScore - previousScore : 0,
      percentileRank: percentile,
      maturityLevel,
      newAchievements: achievements,
      streakDays: streak,
      dimensionScores
    };

  } catch (error) {
    console.error('Error in maturity score calculation:', error);
    throw error;
  }
}

function calculateDimensionScores(synthesizedResults: any) {
  const feedback = synthesizedResults.personaFeedback;
  const gripeLevel = synthesizedResults.gripeLevel;
  
  // Base scores from gripe level
  const baseScore = gripeLevel === 'low' ? 15 : gripeLevel === 'medium' ? 10 : 5;
  
  return {
    usability: calculateUsabilityScore(feedback, baseScore),
    accessibility: calculateAccessibilityScore(feedback, baseScore),
    performance: calculatePerformanceScore(feedback, baseScore),
    clarity: calculateClarityScore(feedback, baseScore),
    delight: calculateDelightScore(feedback, baseScore)
  };
}

function calculateUsabilityScore(feedback: any, base: number): number {
  let score = base;
  const feedbackText = JSON.stringify(feedback).toLowerCase();
  
  if (feedbackText.includes('intuitive')) score += 2;
  if (feedbackText.includes('confusing')) score -= 3;
  if (feedbackText.includes('easy to use')) score += 3;
  if (feedbackText.includes('friction')) score -= 2;
  if (feedbackText.includes('clear navigation')) score += 2;
  if (feedbackText.includes('lost')) score -= 3;
  
  return Math.max(0, Math.min(20, score));
}

function calculateAccessibilityScore(feedback: any, base: number): number {
  let score = base;
  const feedbackText = JSON.stringify(feedback).toLowerCase();
  
  if (feedbackText.includes('contrast')) score -= 3;
  if (feedbackText.includes('accessible')) score += 3;
  if (feedbackText.includes('screen reader')) score += 2;
  if (feedbackText.includes('color blind')) score += 1;
  if (feedbackText.includes('touch target')) score -= 2;
  if (feedbackText.includes('keyboard')) score += 2;
  
  return Math.max(0, Math.min(20, score));
}

function calculatePerformanceScore(feedback: any, base: number): number {
  let score = base;
  const feedbackText = JSON.stringify(feedback).toLowerCase();
  
  if (feedbackText.includes('slow')) score -= 4;
  if (feedbackText.includes('loading')) score -= 2;
  if (feedbackText.includes('responsive')) score += 3;
  if (feedbackText.includes('snappy')) score += 3;
  if (feedbackText.includes('lag')) score -= 3;
  if (feedbackText.includes('instant')) score += 2;
  
  return Math.max(0, Math.min(20, score));
}

function calculateClarityScore(feedback: any, base: number): number {
  let score = base;
  
  // Clarity is the goblin's specialty!
  if (feedback.clarity?.biggestGripe?.includes('unclear')) score -= 4;
  if (feedback.clarity?.biggestGripe?.includes('obvious')) score += 3;
  if (feedback.clarity?.recommendations?.some((i: string) => i.includes('label'))) score -= 2;
  if (feedback.clarity?.whatMakesGoblinHappy?.includes('clear')) score += 3;
  
  return Math.max(0, Math.min(20, score));
}

function calculateDelightScore(feedback: any, base: number): number {
  let score = base;
  const feedbackText = JSON.stringify(feedback).toLowerCase();
  
  if (feedbackText.includes('delight')) score += 4;
  if (feedbackText.includes('boring')) score -= 3;
  if (feedbackText.includes('engaging')) score += 3;
  if (feedbackText.includes('fun')) score += 2;
  if (feedbackText.includes('personality')) score += 2;
  if (feedbackText.includes('generic')) score -= 2;
  
  return Math.max(0, Math.min(20, score));
}

function getMaturityLevel(score: number) {
  const levels = [
    { level: 'Novice', minScore: 0, badge: '🌱', description: 'Just starting your UX journey' },
    { level: 'Developing', minScore: 20, badge: '🌿', description: 'Building foundational skills' },
    { level: 'Competent', minScore: 40, badge: '🌳', description: 'Solid UX understanding' },
    { level: 'Advanced', minScore: 60, badge: '🎯', description: 'Sophisticated design thinking' },
    { level: 'Expert', minScore: 80, badge: '🏆', description: 'UX mastery achieved' }
  ];
  
  return levels
    .slice()
    .reverse()
    .find(level => score >= level.minScore) || levels[0];
}

async function calculatePercentile(userId: string, score: number): Promise<number> {
  const { data, error } = await supabaseClient
    .from('goblin_maturity_scores')
    .select('overall_score')
    .order('overall_score', { ascending: true });
    
  if (!data || error || data.length === 0) return 50; // Default to median
  
  const scores = data.map(d => d.overall_score);
  const position = scores.filter(s => s < score).length;
  
  return Math.round((position / scores.length) * 100);
}

async function generateRoadmap(userId: string, currentScores: any): Promise<any[]> {
  const roadmapItems = [];
  
  // Find weakest dimensions
  const dimensions = Object.entries(currentScores)
    .sort(([, a]: any, [, b]: any) => a - b)
    .slice(0, 3); // Focus on top 3 weakest areas
  
  for (const [dimension, score] of dimensions) {
    const improvements = getImprovementsForDimension(dimension, score);
    roadmapItems.push(...improvements);
  }
  
  // Sort by impact and difficulty
  return roadmapItems
    .sort((a, b) => {
      // Prioritize high impact, low difficulty
      const scoreA = a.estimated_impact / (a.difficulty === 'Quick Win' ? 1 : a.difficulty === 'Moderate' ? 2 : 3);
      const scoreB = b.estimated_impact / (b.difficulty === 'Quick Win' ? 1 : b.difficulty === 'Moderate' ? 2 : 3);
      return scoreB - scoreA;
    })
    .slice(0, 5); // Top 5 recommendations
}

function getImprovementsForDimension(dimension: string, currentScore: any): any[] {
  const improvements = {
    usability: [
      {
        title: 'Simplify primary navigation',
        description: 'Reduce cognitive load by limiting main nav to 5-7 items',
        estimated_impact: 3,
        difficulty: 'Moderate'
      },
      {
        title: 'Add clear CTAs above the fold',
        description: 'Users should immediately know what action to take',
        estimated_impact: 4,
        difficulty: 'Quick Win'
      }
    ],
    accessibility: [
      {
        title: 'Fix color contrast issues',
        description: 'Ensure all text meets WCAG AA standards (4.5:1 ratio)',
        estimated_impact: 5,
        difficulty: 'Quick Win'
      },
      {
        title: 'Add keyboard navigation',
        description: 'All interactive elements should be keyboard accessible',
        estimated_impact: 4,
        difficulty: 'Moderate'
      }
    ],
    performance: [
      {
        title: 'Implement skeleton loading states',
        description: 'Show users that content is loading with visual feedback',
        estimated_impact: 3,
        difficulty: 'Quick Win'
      },
      {
        title: 'Optimize image loading',
        description: 'Use lazy loading and responsive images',
        estimated_impact: 4,
        difficulty: 'Moderate'
      }
    ],
    clarity: [
      {
        title: 'Rewrite error messages',
        description: 'Make errors human-friendly and actionable',
        estimated_impact: 4,
        difficulty: 'Quick Win'
      },
      {
        title: 'Add contextual help text',
        description: 'Guide users with inline hints and tooltips',
        estimated_impact: 3,
        difficulty: 'Quick Win'
      }
    ],
    delight: [
      {
        title: 'Add micro-interactions',
        description: 'Small animations on hover and click for feedback',
        estimated_impact: 3,
        difficulty: 'Moderate'
      },
      {
        title: 'Implement success celebrations',
        description: 'Celebrate user achievements with delightful animations',
        estimated_impact: 2,
        difficulty: 'Quick Win'
      }
    ]
  };
  
  return improvements[dimension]?.map(item => ({
    ...item,
    dimension,
    priority: 0 // Will be set later
  })) || [];
}

async function checkAchievements(userId: string, newScore: number, previousScore: number): Promise<any[]> {
  const achievements = [];
  
  // First analysis
  if (!previousScore) {
    achievements.push({
      achievement_type: 'milestone',
      achievement_name: 'UX Journey Begins',
      achievement_description: 'Completed your first design analysis',
      badge_emoji: '🚀'
    });
  }
  
  // Score milestones
  const milestones = [25, 50, 75, 90];
  for (const milestone of milestones) {
    if (previousScore < milestone && newScore >= milestone) {
      achievements.push({
        achievement_type: 'score',
        achievement_name: `${milestone} Club`,
        achievement_description: `Achieved a maturity score of ${milestone}+`,
        badge_emoji: milestone >= 75 ? '🏆' : '⭐'
      });
    }
  }
  
  // Improvement achievements
  if (previousScore && newScore > previousScore + 10) {
    achievements.push({
      achievement_type: 'improvement',
      achievement_name: 'Rapid Learner',
      achievement_description: 'Improved your score by 10+ points',
      badge_emoji: '📈'
    });
  }
  
  return achievements;
}

async function calculateStreak(userId: string): Promise<number> {
  const { data } = await supabaseClient
    .from('goblin_maturity_scores')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);

  if (!data || data.length === 0) return 0;

  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i < data.length; i++) {
    const current = new Date(data[i].created_at);
    const previous = new Date(data[i - 1].created_at);
    
    current.setHours(0, 0, 0, 0);
    previous.setHours(0, 0, 0, 0);
    
    const dayDiff = (previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24);
    
    if (dayDiff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}