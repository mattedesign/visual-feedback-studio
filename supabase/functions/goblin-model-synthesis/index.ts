import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('🔬 Goblin Model Synthesis - Combining and structuring analysis results');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, persona, analysisData, goal, imageCount } = await req.json();

    console.log('🧪 Synthesizing results for:', {
      sessionId: sessionId?.substring(0, 8),
      persona,
      hasAnalysisData: !!analysisData,
      imageCount: imageCount || 1
    });

    const synthesizedResults = synthesizeResults(persona, analysisData, goal, imageCount || 1);

    return new Response(
      JSON.stringify({
        success: true,
        sessionId,
        persona,
        personaFeedback: synthesizedResults.personaFeedback,
        summary: synthesizedResults.summary,
        priorityMatrix: synthesizedResults.priorityMatrix,
        annotations: synthesizedResults.annotations,
        gripeLevel: synthesizedResults.gripeLevel,
        metadata: {
          synthesisVersion: '1.0',
          model: 'claude-sonnet-4-20250514',
          processedAt: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Result synthesis failed:', error);

    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function synthesizeResults(persona: string, analysisData: any, goal: string, imageCount: number = 1) {
  // Extract core analysis content
  const analysis = analysisData.analysisData?.analysis || analysisData.rawResponse || 'Analysis completed';
  const recommendations = analysisData.analysisData?.recommendations || [];
  
  // Build persona-specific feedback structure
  const personaFeedback = {
    [persona]: {
      analysis,
      recommendations,
      persona_specific: getPersonaSpecificData(persona, analysisData.analysisData)
    }
  };

  // Create priority matrix
  const priorityMatrix = createPriorityMatrix(recommendations, persona, analysis);

  // Generate summary
  const summary = generateSummary(persona, analysis, recommendations, goal);

  // Create annotations for UI overlay with image associations
  const annotations = generateAnnotations(recommendations, persona, imageCount);

  // Determine gripe level for Clarity goblin
  const gripeLevel = persona === 'clarity' 
    ? analysisData.analysisData?.gripeLevel || determineGripeLevel(analysis)
    : null;

  return {
    personaFeedback,
    summary,
    priorityMatrix,
    annotations,
    gripeLevel
  };
}

function getPersonaSpecificData(persona: string, analysisData: any) {
  switch (persona) {
    case 'clarity':
      return {
        goblinWisdom: analysisData?.goblinWisdom || "Users don't care about your clever design - they just want to get stuff done!",
        attitude: analysisData?.goblinAttitude || 'grumpy',
        userRealityCheck: "What users actually experience vs. what you think they experience"
      };
      
    case 'strategic':
      return {
        businessImpact: analysisData?.businessImpact || "Strategic improvements needed to align with business objectives",
        implementation: analysisData?.implementation || "Phased approach recommended for maximum impact",
        metrics: analysisData?.metrics || ["User satisfaction", "Task completion rate", "Business conversion"]
      };
      
    case 'mirror':
      return {
        insights: analysisData?.insights || ["Consider the gap between intention and user perception"],
        reflection: analysisData?.reflection || "What assumptions might you be making about your users?",
        nextSteps: ["Observe real users interacting with your design", "Question your design assumptions"]
      };
      
    case 'mad':
      return {
        experiments: analysisData?.experiments || ["A/B test unconventional approaches"],
        wildCard: analysisData?.wildCard || "What if we completely flipped the expected interaction pattern?",
        riskLevel: "experimental"
      };
      
    case 'executive':
      return {
        roi: analysisData?.roi || "UX improvements with measurable business impact",
        timeline: analysisData?.timeline || ["Phase 1: Quick wins", "Phase 2: Strategic improvements"],
        competitiveAdvantage: "Enhanced user experience drives competitive differentiation"
      };
      
    default:
      return {};
  }
}

function createPriorityMatrix(recommendations: string[], persona: string, analysis: string) {
  // Analyze recommendations to categorize them
  const whatWorks = extractPositives(analysis);
  const whatHurts = extractNegatives(analysis, recommendations);
  const whatNext = prioritizeRecommendations(recommendations, persona);

  return {
    whatWorks: whatWorks.length > 0 ? whatWorks : ["Design foundation is in place"],
    whatHurts: whatHurts.length > 0 ? whatHurts : ["User experience optimization needed"],
    whatNext: whatNext.length > 0 ? whatNext : ["Implement user-centered improvements"]
  };
}

function extractPositives(analysis: string): string[] {
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

function extractNegatives(analysis: string, recommendations: string[]): string[] {
  const negativeKeywords = ['confusing', 'unclear', 'difficult', 'frustrating', 'missing', 'broken', 'problem'];
  const sentences = analysis.split(/[.!?]+/);
  
  const analysisIssues = sentences
    .filter(sentence => 
      negativeKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
    )
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 10)
    .slice(0, 2);

  // Also extract issues implied by recommendations
  const recommendationIssues = recommendations
    .filter(rec => rec.toLowerCase().includes('fix') || rec.toLowerCase().includes('improve'))
    .slice(0, 2);

  return [...analysisIssues, ...recommendationIssues].slice(0, 3);
}

function prioritizeRecommendations(recommendations: string[], persona: string): string[] {
  if (recommendations.length === 0) {
    return getDefaultRecommendations(persona);
  }

  // Sort recommendations by priority based on persona
  const prioritized = [...recommendations].sort((a, b) => {
    const scoreA = getRecommendationScore(a, persona);
    const scoreB = getRecommendationScore(b, persona);
    return scoreB - scoreA;
  });

  return prioritized.slice(0, 3);
}

function getRecommendationScore(recommendation: string, persona: string): number {
  const rec = recommendation.toLowerCase();
  let score = 0;

  // Base scoring
  if (rec.includes('user') || rec.includes('usability')) score += 3;
  if (rec.includes('clear') || rec.includes('simple')) score += 2;
  if (rec.includes('navigation') || rec.includes('menu')) score += 2;

  // Persona-specific scoring
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

function getDefaultRecommendations(persona: string): string[] {
  switch (persona) {
    case 'clarity':
      return [
        "Make the interface more obvious for users",
        "Reduce cognitive load with clearer labeling",
        "Fix confusing navigation patterns"
      ];
    case 'strategic':
      return [
        "Align design with strategic business objectives",
        "Improve user flow for better conversion",
        "Implement research-backed UX patterns"
      ];
    case 'executive':
      return [
        "Focus on high-ROI UX improvements",
        "Prioritize changes that drive business metrics",
        "Implement competitive UX advantages"
      ];
    default:
      return [
        "Improve overall user experience",
        "Enhance interface clarity",
        "Optimize user interaction patterns"
      ];
  }
}

function generateSummary(persona: string, analysis: string, recommendations: string[], goal: string): string {
  const personaName = persona.charAt(0).toUpperCase() + persona.slice(1);
  const recCount = recommendations.length;
  
  if (persona === 'clarity') {
    return `Clarity the goblin has examined your design with their usual grumpy honesty. ${recCount} specific improvements have been identified to bridge the gap between what you think users experience and what they actually encounter. The goblin's wisdom: focus on making things obvious rather than clever.`;
  }
  
  return `${personaName} analysis completed for your goal: "${goal}". ${recCount} strategic recommendations have been provided to enhance user experience and achieve your objectives. Focus on implementing high-impact changes that align with your specific goals.`;
}

function generateAnnotations(recommendations: string[], persona: string, imageCount: number = 1): any[] {
  return recommendations.slice(0, 5).map((rec, index) => {
    // Assign each annotation to a specific image (cycling through available images)
    const imageIndex = index % imageCount;
    
    return {
      id: `${persona}-rec-${index + 1}`,
      title: `${persona.charAt(0).toUpperCase() + persona.slice(1)} Recommendation ${index + 1}`,
      description: rec,
      feedback: rec, // Add feedback field for compatibility
      category: persona === 'clarity' ? 'goblin_wisdom' : 'improvement',
      x: 20 + (index * 15) % 80, // Distribute across screen
      y: 20 + (index * 20) % 60,
      width: 8, // Add default width
      height: 4, // Add default height
      image_index: imageIndex, // ✅ NEW: Associate with specific image
      imageIndex: imageIndex, // ✅ NEW: Alternative field for compatibility
      persona,
      priority: index < 2 ? 'high' : 'medium'
    };
  });
}

function determineGripeLevel(analysis: string): string {
  const lowerAnalysis = analysis.toLowerCase();
  
  if (lowerAnalysis.includes('rage') || lowerAnalysis.includes('terrible') || 
      lowerAnalysis.includes('disaster') || lowerAnalysis.includes('awful')) {
    return 'rage-cranked';
  }
  
  if (lowerAnalysis.includes('annoying') || lowerAnalysis.includes('frustrating') || 
      lowerAnalysis.includes('confusing') || lowerAnalysis.includes('problem')) {
    return 'medium';
  }
  
  return 'low';
}