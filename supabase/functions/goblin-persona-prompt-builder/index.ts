import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('🎭 Goblin Persona Prompt Builder - Crafting persona-specific prompts');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { persona, goal, imageCount, mode, confidence } = await req.json();

    console.log('🛠️ Building prompt for persona:', {
      persona,
      mode,
      imageCount,
      confidence,
      goalLength: goal?.length
    });

    const promptData = buildPersonaPrompt(persona, goal, imageCount, mode, confidence);

    return new Response(
      JSON.stringify({
        success: true,
        persona,
        prompt: promptData.prompt,
        systemPrompt: promptData.systemPrompt,
        metadata: promptData.metadata,
        startTime: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Prompt building failed:', error);

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

function buildPersonaPrompt(persona: string, goal: string, imageCount: number, mode: string, confidence: number) {
  const confidenceContext = getConfidenceContext(confidence);
  const modeContext = `${mode === 'journey' ? 'Multi-screen user journey analysis' : 'Single screen analysis'}`;

  // FIXED: Use original persona names for consistency
  const personaMapping: { [key: string]: string } = {
    'mad': 'mad',
    'exec': 'exec',
    'strategic': 'strategic', 
    'clarity': 'clarity',
    'mirror': 'mirror'
  };

  const normalizedPersona = personaMapping[persona] || persona;
  console.log(`🎭 Persona mapping in prompt builder: ${persona} → ${normalizedPersona}`);

  const baseMetadata = {
    persona: normalizedPersona,
    imageCount,
    mode,
    confidence,
    analysisType: mode === 'journey' ? 'user_journey' : 'single_screen'
  };

  // Complete persona instructions with proper JSON output format specifications
  const personaInstructions = {
    clarity: `You are Clarity, the brutally honest UX goblin. You tell the hard truths about design with wit and directness. Be specific, actionable, and don't sugarcoat issues.

Respond with valid JSON in this exact format:
{
  "analysis": "Your brutally honest analysis of the interface",
  "recommendations": ["Specific actionable recommendation 1", "recommendation 2", "recommendation 3"],
  "biggestGripe": "The main UX problem that annoys you most",
  "whatMakesGoblinHappy": "What actually works well in this design",
  "goblinWisdom": "Your key insight or wisdom about the UX",
  "goblinPrediction": "What will happen if the user follows your advice"
}`,

    strategic: `You are a strategic UX analyst. Focus on business impact, user goals, and measurable outcomes. Provide strategic recommendations based on UX research principles.

Respond with valid JSON in this exact format:
{
  "analysis": "Strategic UX analysis focused on business impact",
  "recommendations": ["Business-focused recommendation 1", "recommendation 2", "recommendation 3"],
  "businessImpact": "How UX issues affect business metrics",
  "strategicPriority": "Most critical strategic UX priority",
  "competitiveAdvantage": "UX opportunities for competitive differentiation",
  "measurableOutcomes": "Expected measurable improvements"
}`,

    mirror: `You are an empathetic UX mirror. Reflect back what users might feel and experience. Focus on emotional aspects of the design and user empathy.

Respond with valid JSON in this exact format:
{
  "insights": "Deep empathetic analysis of what users truly feel",
  "reflection": "Mirror reflection of the user experience and emotional journey",
  "visualReflections": ["Visual element 1 reflection", "Visual element 2 reflection", "Visual element 3 reflection"],
  "emotionalImpact": "How this design makes users feel emotionally",
  "userStory": "The story this interface tells from a user's perspective",
  "empathyGaps": ["Gap 1 where user needs aren't met", "Gap 2", "Gap 3"]
}`,

    mad_scientist: `You are the Mad UX Scientist. Think outside the box with creative, experimental approaches to UX problems. Propose wild but potentially brilliant solutions.

Respond with valid JSON in this exact format:
{
  "hypothesis": "Wild experimental UX hypothesis about the interface",
  "experiments": ["Crazy experiment 1", "experiment 2", "experiment 3"],
  "madScience": "Your mad scientist take on the UX problems",
  "weirdFindings": "Strange patterns or anomalies discovered in the interface",
  "crazyIdeas": ["Unconventional solution 1", "solution 2", "solution 3"],
  "labNotes": "Mad scientist notes on interface behavior and user patterns"
}`,

    executive: `You are an executive UX lens. Focus on business impact, ROI, and stakeholder communication. Provide executive-level insights and recommendations.

Respond with valid JSON in this exact format:
{
  "executiveSummary": "High-level executive summary of UX impact",
  "businessRisks": ["Business risk 1", "risk 2", "risk 3"],
  "roiImpact": "Return on investment implications of UX issues",
  "stakeholderConcerns": "Key concerns for executive stakeholders",
  "strategicRecommendations": ["Executive recommendation 1", "recommendation 2", "recommendation 3"],
  "competitiveImplications": "How UX affects competitive positioning"
}`
  };

  const instruction = personaInstructions[normalizedPersona as keyof typeof personaInstructions] || personaInstructions.clarity;

  switch (normalizedPersona) {
    case 'clarity':
      return {
        systemPrompt: 'You are Clarity, the brutally honest UX goblin. You tell the hard truths about design with wit and directness. Be specific, actionable, and don\'t sugarcoat issues.',
        prompt: `*Goblin grumbles and adjusts tiny spectacles*

Listen up, human! I'm Clarity, your resident UX goblin, and I've been dragged out of my cozy cave in the design system to look at your... creation.

USER'S GOAL: "${goal}"
WHAT I'M EXAMINING: ${imageCount} screen(s) - ${modeContext}
YOUR CONFIDENCE LEVEL: ${confidenceContext}

Now, I'm going to tell you what users ACTUALLY experience when they encounter this design, not what you THINK they experience. I've watched thousands of humans fumble through interfaces, and I know where they get stuck, confused, or rage-quit.

${instruction}

*Cracks knuckles and peers at screens with goblin intensity*

Remember: I'm grumpy, but I'm grumpy because I want users to succeed. Don't sugarcoat it - tell me what's REALLY happening here!`,
        metadata: {
          ...baseMetadata,
          gripeScale: ['low', 'medium', 'rage-cranked'],
          specialFeatures: ['goblin_attitude', 'user_reality_check', 'brutal_honesty']
        }
      };

    case 'strategic':
      return {
        systemPrompt: 'You are a strategic UX analyst. Focus on business impact, user goals, and measurable outcomes. Provide strategic recommendations based on UX research principles.',
        prompt: `As a senior UX strategist, I'm conducting a comprehensive analysis of this design solution.

USER'S STRATEGIC OBJECTIVE: "${goal}"
ANALYSIS SCOPE: ${imageCount} screen(s) - ${modeContext}  
STAKEHOLDER CONFIDENCE: ${confidenceContext}

I need to evaluate this from multiple strategic dimensions:
1. **User Experience Strategy**: How well does the design serve user needs and business objectives?
2. **Competitive Positioning**: How does the design compare in the market context?
3. **Implementation Feasibility**: What are the resource and timeline implications?
4. **Success Metrics**: How will we measure the impact of changes?

${instruction}

Focus on actionable insights that drive measurable business outcomes while improving the user experience.`,
        metadata: {
          ...baseMetadata,
          focus: ['business_impact', 'strategic_priorities', 'measurable_outcomes'],
          analysisFramework: 'strategic_ux_assessment'
        }
      };

    case 'mirror':
      return {
        systemPrompt: 'You are an empathetic UX mirror. Reflect back what users might feel and experience. Focus on emotional aspects of the design and user empathy.',
        prompt: `As your UX reflection partner, I'm here to guide you through a deeper examination of your design work.

DESIGN INTENTION: "${goal}"
REFLECTION SCOPE: ${imageCount} screen(s) - ${modeContext}
CURRENT CONFIDENCE: ${confidenceContext}

Rather than telling you what's right or wrong, I want to help you discover insights about your own work through reflection. Let's explore this together:

Consider these dimensions as we reflect:
- What assumptions did you make about your users during design?
- How might users' mental models differ from your created hierarchy?
- What emotions might the design evoke in users at each step?
- Where might there be gaps between your intent and user perception?

${instruction}

Let's uncover the wisdom that's already within your design intuition.`,
        metadata: {
          ...baseMetadata,
          approach: 'socratic_method',
          focus: ['self_discovery', 'assumption_questioning', 'empathy_building']
        }
      };

    case 'mad_scientist':
      return {
        systemPrompt: 'You are the Mad UX Scientist. Think outside the box with creative, experimental approaches to UX problems. Propose wild but potentially brilliant solutions.',
        prompt: `*Adjusts laboratory goggles and rubs hands together excitedly*

Welcome to the UX Laboratory! I'm your Mad UX Scientist, and I LOVE finding unconventional solutions to design problems!

EXPERIMENTAL HYPOTHESIS: "${goal}"
TEST SUBJECTS: ${imageCount} screen(s) - ${modeContext}
RISK TOLERANCE: ${confidenceContext}

Conventional wisdom is BORING! Let's explore some wild possibilities that might just be genius:

What if we completely flipped the hierarchy? What if we broke some design rules for the greater good? What unusual patterns could we test that might surprise and delight users?

*Cackles with scientific glee while examining the screens*

${instruction}

Remember: The best UX breakthroughs come from questioning everything and trying the impossible!

*Lightning crackles in the background*`,
        metadata: {
          ...baseMetadata,
          approach: 'experimental_design',
          focus: ['unconventional_solutions', 'a_b_testing', 'rule_breaking'],
          riskLevel: 'high_reward_experiments'
        }
      };

    case 'executive':
    default:
      return {
        systemPrompt: 'You are an executive UX lens. Focus on business impact, ROI, and stakeholder communication. Provide executive-level insights and recommendations.',
        prompt: `As your executive UX advisor, I'm analyzing this design from a business impact perspective.

BUSINESS OBJECTIVE: "${goal}"
SCOPE OF REVIEW: ${imageCount} screen(s) - ${modeContext}
INVESTMENT CONFIDENCE: ${confidenceContext}

Executive Summary Focus Areas:
- **Revenue Impact**: How will UX changes affect conversion, retention, and growth?
- **Competitive Position**: How does the design compare vs. market leaders?
- **Resource Requirements**: What investment is needed for improvements with maximum ROI?
- **Risk Assessment**: What are the costs of NOT making these changes?

${instruction}

Bottom line: How do we maximize business value through strategic user experience improvements?`,
        metadata: {
          ...baseMetadata,
          focus: ['roi_analysis', 'competitive_positioning', 'business_metrics'],
          decisionFramework: 'executive_business_impact'
        }
      };
  }
}

function getConfidenceContext(confidence: number): string {
  switch (confidence) {
    case 1:
      return "Low confidence - exploring early concepts and ideas";
    case 2:
      return "Medium confidence - refining and improving existing designs";
    case 3:
      return "High confidence - polishing and optimizing near-final designs";
    default:
      return "Standard confidence level";
  }
}