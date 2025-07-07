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
  
  // Get mapped persona data with required UI fields
  const mappedPersonaData = getPersonaSpecificData(persona, analysisData.analysisData);
  
  // Build persona-specific feedback structure with mapped fields at top level
  const personaFeedback = {
    [persona]: {
      analysis,
      recommendations,
      // Include all mapped fields directly for UI access
      ...mappedPersonaData,
      persona_specific: mappedPersonaData
    }
  };
  
  console.log(`✅ Built persona feedback for ${persona}:`, {
    hasRequiredFields: !!(mappedPersonaData.biggestGripe && mappedPersonaData.whatMakesGoblinHappy && mappedPersonaData.goblinWisdom && mappedPersonaData.goblinPrediction),
    personaDataKeys: Object.keys(mappedPersonaData)
  });

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
  console.log(`🎭 Mapping persona data for: ${persona}`, { 
    hasAnalysisData: !!analysisData,
    availableKeys: analysisData ? Object.keys(analysisData) : []
  });

  // Extract base analysis content for fallbacks
  const baseAnalysis = analysisData?.analysis || analysisData?.rawResponse || "Analysis completed";
  const baseRecommendations = analysisData?.recommendations || [];

  switch (persona) {
    case 'clarity':
      const clarityData = {
        goblinWisdom: analysisData?.goblinWisdom || "Users don't care about your clever design - they just want to get stuff done!",
        attitude: analysisData?.goblinAttitude || 'grumpy',
        userRealityCheck: "What users actually experience vs. what you think they experience",
        // REQUIRED UI properties for Clarity chat
        biggestGripe: analysisData?.biggestGripe || "Your users are confused and you don't even realize it!",
        whatMakesGoblinHappy: analysisData?.whatMakesGoblinHappy || "Clear, obvious interfaces that don't make users think",
        goblinPrediction: analysisData?.goblinPrediction || "Fix the confusing parts and watch your conversion rates soar"
      };
      console.log('✅ Clarity persona data mapped:', clarityData);
      return clarityData;
      
    case 'strategic':
      const strategicData = {
        businessImpact: analysisData?.businessImpact || "Strategic improvements needed to align with business objectives",
        implementation: analysisData?.implementation || "Phased approach recommended for maximum impact",
        metrics: analysisData?.metrics || ["User satisfaction", "Task completion rate", "Business conversion"],
        // REQUIRED UI properties for Clarity chat
        biggestGripe: analysisData?.businessImpact || analysisData?.biggestGripe || "Your UX strategy isn't aligned with business goals - you're leaving money on the table",
        whatMakesGoblinHappy: analysisData?.implementation || analysisData?.whatMakesGoblinHappy || "Strategic UX improvements that drive measurable business results",
        goblinWisdom: analysisData?.goblinWisdom || "Every design decision should tie back to a business metric",
        goblinPrediction: analysisData?.goblinPrediction || "Align UX with business strategy and watch both user satisfaction and revenue grow"
      };
      console.log('✅ Strategic persona data mapped:', strategicData);
      return strategicData;
      
    case 'mirror':
      const mirrorData = {
        insights: analysisData?.insights || ["Consider the gap between intention and user perception"],
        reflection: analysisData?.reflection || "What assumptions might you be making about your users?",
        nextSteps: ["Observe real users interacting with your design", "Question your design assumptions"],
        // REQUIRED UI properties for Clarity chat
        biggestGripe: analysisData?.reflection || analysisData?.biggestGripe || "You're designing for yourself, not your users - step back and see what they actually see",
        whatMakesGoblinHappy: Array.isArray(analysisData?.insights) ? analysisData.insights.join(", ") : (analysisData?.insights || analysisData?.whatMakesGoblinHappy || "Deep user insights that challenge design assumptions"),
        goblinWisdom: analysisData?.goblinWisdom || "The most powerful design insights come from honest self-reflection",
        goblinPrediction: analysisData?.goblinPrediction || "Question your assumptions and you'll discover breakthrough UX improvements"
      };
      console.log('✅ Mirror persona data mapped:', mirrorData);
      return mirrorData;
      
    case 'mad':
      const madData = {
        experiments: analysisData?.experiments || ["A/B test unconventional approaches"],
        wildCard: analysisData?.wildCard || "What if we completely flipped the expected interaction pattern?",
        riskLevel: "experimental",
        // REQUIRED UI properties for Clarity chat - map from mad scientist specific fields
        biggestGripe: analysisData?.wildCard || analysisData?.biggestGripe || "Your interface is playing it way too safe - users can handle some creative chaos!",
        whatMakesGoblinHappy: Array.isArray(analysisData?.experiments) ? analysisData.experiments.join(", ") : (analysisData?.experiments || analysisData?.whatMakesGoblinHappy || "Experiments that break conventional UX rules and surprise users in delightful ways"),
        goblinWisdom: analysisData?.goblinWisdom || "Sometimes the most brilliant UX solutions come from completely ignoring what everyone else is doing",
        goblinPrediction: analysisData?.goblinPrediction || "If you embrace experimental approaches, you'll discover interaction patterns that set you apart from boring competitors"
      };
      console.log('✅ Mad scientist persona data mapped:', madData);
      return madData;
      
    case 'executive':
      const executiveData = {
        roi: analysisData?.roi || "UX improvements with measurable business impact",
        timeline: analysisData?.timeline || ["Phase 1: Quick wins", "Phase 2: Strategic improvements"],
        competitiveAdvantage: "Enhanced user experience drives competitive differentiation",
        // REQUIRED UI properties for Clarity chat
        biggestGripe: analysisData?.roi || analysisData?.biggestGripe || "Your UX investments aren't generating the ROI they should - time to focus on high-impact changes",
        whatMakesGoblinHappy: Array.isArray(analysisData?.timeline) ? analysisData.timeline.join(", ") : (analysisData?.timeline || analysisData?.whatMakesGoblinHappy || "Strategic UX roadmaps that deliver measurable business results"),
        goblinWisdom: analysisData?.goblinWisdom || "The best UX decisions are backed by data and drive clear business outcomes",
        goblinPrediction: analysisData?.goblinPrediction || "Focus on high-ROI UX improvements and you'll see both user satisfaction and business metrics improve dramatically"
      };
      console.log('✅ Executive persona data mapped:', executiveData);
      return executiveData;
      
    default:
      console.log('⚠️ Unknown persona, using fallback data');
      return {
        biggestGripe: "Your interface needs some goblin attention!",
        whatMakesGoblinHappy: "User-centered design that actually works",
        goblinWisdom: "Good UX speaks for itself",
        goblinPrediction: "Fix the user experience and everything else follows"
      };
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
  // Ensure we have enough annotations for all images - minimum 2 per image, max 8 total
  const minAnnotationsPerImage = 2;
  const maxTotalAnnotations = 8;
  const targetAnnotationCount = Math.min(imageCount * minAnnotationsPerImage, maxTotalAnnotations);
  
  // Take recommendations and repeat if needed to reach target count
  const availableRecs = recommendations.length > 0 ? recommendations : [`Improve user experience for ${persona} persona`];
  const annotationsToGenerate = [];
  
  for (let i = 0; i < targetAnnotationCount; i++) {
    const recIndex = i % availableRecs.length;
    annotationsToGenerate.push(availableRecs[recIndex]);
  }
  
  return annotationsToGenerate.map((rec, index) => {
    // Distribute annotations evenly across images first, then add extras
    const imageIndex = index % imageCount;
    
    // Create more varied positioning within each image
    const annotationsPerImage = Math.ceil(annotationsToGenerate.length / imageCount);
    const positionInImage = Math.floor(index / imageCount);
    
    // Generate diverse positions across the image
    const positions = [
      { x: 15, y: 15 }, { x: 85, y: 15 }, { x: 15, y: 85 }, { x: 85, y: 85 },
      { x: 50, y: 25 }, { x: 25, y: 50 }, { x: 75, y: 50 }, { x: 50, y: 75 }
    ];
    const position = positions[positionInImage % positions.length];
    
    return {
      id: `${persona}-rec-${index + 1}`,
      title: `${persona.charAt(0).toUpperCase() + persona.slice(1)} Recommendation ${index + 1}`,
      description: rec,
      feedback: rec, // Add feedback field for compatibility
      category: persona === 'clarity' ? 'goblin_wisdom' : 'improvement',
      x: position.x,
      y: position.y,
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