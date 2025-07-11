import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ============================================================================
// TYPES & CONFIGURATION
// ============================================================================

interface SynthesisRequest {
  sessionId: string;
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

    const response: SynthesisResponse = {
      success: true,
      sessionId: requestData.sessionId,
      persona: requestData.persona,
      personaFeedback: synthesizedResults.personaFeedback,
      summary: synthesizedResults.summary,
      priorityMatrix: synthesizedResults.priorityMatrix,
      annotations: synthesizedResults.annotations,
      gripeLevel: synthesizedResults.gripeLevel,
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
    
    // Determine category and title from recommendation content or use fallback
    const categoryMapping = {
      navigation: ['navigation', 'menu', 'nav', 'header', 'sidebar'],
      conversion: ['button', 'cta', 'call-to-action', 'convert', 'sign up', 'buy', 'purchase'],
      readability: ['content', 'text', 'hierarchy', 'typography', 'font', 'read'],
      usability: ['flow', 'path', 'journey', 'user', 'ease', 'simple'],
      interaction: ['feedback', 'response', 'click', 'hover', 'interaction'],
      responsive: ['mobile', 'tablet', 'responsive', 'touch', 'device'],
      performance: ['loading', 'speed', 'performance', 'wait', 'fast'],
      validation: ['error', 'validation', 'form', 'mistake', 'prevent']
    };
    
    const fallbackTypes = [
      { title: 'Navigation Clarity', category: 'navigation' },
      { title: 'Call-to-Action', category: 'conversion' },
      { title: 'Content Hierarchy', category: 'readability' },
      { title: 'User Flow', category: 'usability' },
      { title: 'Visual Feedback', category: 'interaction' },
      { title: 'Mobile Experience', category: 'responsive' },
      { title: 'Loading States', category: 'performance' },
      { title: 'Error Prevention', category: 'validation' }
    ];
    
    // Try to determine category from recommendation content
    let detectedCategory = 'usability'; // default
    let detectedTitle = 'UX Improvement';
    
    const recLower = recommendation.toLowerCase();
    for (const [category, keywords] of Object.entries(categoryMapping)) {
      if (keywords.some(keyword => recLower.includes(keyword))) {
        detectedCategory = category;
        detectedTitle = fallbackTypes.find(type => type.category === category)?.title || 'UX Improvement';
        break;
      }
    }
    
    // If no category detected, use fallback rotation
    if (detectedCategory === 'usability' && !recLower.includes('user') && !recLower.includes('flow')) {
      const fallbackType = fallbackTypes[index % fallbackTypes.length];
      detectedCategory = fallbackType.category;
      detectedTitle = fallbackType.title;
    }
    
    return {
      id: `${persona}-annotation-${index + 1}`,
      title: detectedTitle,
      description: recommendation || `Improve user experience for ${persona} persona`,
      feedback: recommendation || `Improve user experience for ${persona} persona`,
      category: detectedCategory,
      x: position.x,
      y: position.y,
      width: 8,
      height: 4,
      image_index: imageIndex,
      imageIndex: imageIndex,
      persona,
      priority: index < 2 ? 'high' : 'medium'
    };
  }
}