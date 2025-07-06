import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('🤖 Goblin Claude Analyzer - Real Claude API integration');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, imageUrls, prompt, persona, systemPrompt } = await req.json();

    console.log('🧠 Processing Claude analysis:', {
      sessionId: sessionId?.substring(0, 8),
      persona,
      imageCount: imageUrls?.length,
      promptLength: prompt?.length
    });

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    // Build enhanced prompt based on persona
    const enhancedPrompt = buildPersonaPrompt(persona, prompt, imageUrls.length);

    console.log('🚀 Calling Claude Sonnet 4 for analysis...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        temperature: persona === 'clarity' ? 0.7 : 0.3, // Goblin gets more creative
        messages: [{
          role: 'user',
          content: enhancedPrompt
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text || '';
    
    console.log('✅ Claude analysis completed, processing response...');

    // Parse and structure the response
    let analysisData;
    try {
      // Try to extract JSON from Claude's response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: structure the raw text response
        analysisData = {
          analysis: content,
          recommendations: extractRecommendations(content),
          severity: assessSeverity(content, persona),
          goblinAttitude: persona === 'clarity' ? extractGoblinAttitude(content) : null
        };
      }
    } catch (parseError) {
      console.warn('Failed to parse structured response, using raw text');
      analysisData = {
        analysis: content,
        recommendations: [],
        severity: 'medium',
        goblinAttitude: persona === 'clarity' ? 'grumpy' : null
      };
    }

    return new Response(
      JSON.stringify({
        success: true,
        sessionId,
        persona,
        modelUsed: 'claude-sonnet-4-20250514',
        analysisData,
        rawResponse: content,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Claude analysis failed:', error);

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

function buildPersonaPrompt(persona: string, userGoal: string, imageCount: number): string {
  const baseContext = `
User's Goal: ${userGoal}
Number of screens analyzed: ${imageCount}
Analysis Mode: ${imageCount > 1 ? 'User Journey' : 'Single Screen'}
`;

  switch (persona) {
    case 'clarity':
      return `You are Clarity, a brutally honest UX goblin who's been trapped in design systems for centuries. You're sassy, direct, but ultimately helpful. You see what users ACTUALLY experience vs what designers THINK they're creating.

${baseContext}

Respond in character as Clarity the goblin. Be direct and sassy, but provide genuinely useful feedback. Structure your response as JSON:

{
  "analysis": "Your brutally honest analysis in goblin voice",
  "recommendations": ["Specific actionable fixes"],
  "gripeLevel": "low|medium|rage-cranked",
  "goblinWisdom": "One piece of hard-earned UX truth"
}

Remember: You're helpful but honest. Users need to hear the truth about their UX, even if it stings.`;

    case 'strategic':
      return `You are a senior UX strategist with 20 years of experience. Provide strategic, research-backed analysis focusing on business impact and user outcomes.

${baseContext}

Provide comprehensive strategic analysis in JSON format:

{
  "analysis": "Strategic assessment with business context",
  "recommendations": ["Strategic improvements with business rationale"],
  "priorities": ["High-impact changes to focus on first"],
  "metrics": ["Key metrics to track improvement"]
}`;

    case 'mirror':
      return `You are a reflective UX coach helping designers gain self-awareness about their work. Ask probing questions and guide discovery.

${baseContext}

Respond as a thoughtful coach in JSON format:

{
  "analysis": "Reflective questions and observations",
  "recommendations": ["Self-reflection prompts and gentle guidance"],
  "insights": ["Key realizations to explore"],
  "nextSteps": ["Ways to deepen understanding"]
}`;

    case 'mad':
      return `You are the Mad UX Scientist - you love wild experiments and unconventional approaches. Think outside the box!

${baseContext}

Respond with experimental enthusiasm in JSON format:

{
  "analysis": "Experimental analysis with wild ideas",
  "recommendations": ["Unconventional and creative solutions"],
  "experiments": ["A/B tests or unusual approaches to try"],
  "wildCard": "One completely unexpected suggestion"
}`;

    case 'executive':
    default:
      return `You are an executive-focused UX advisor. Focus on ROI, business metrics, and bottom-line impact.

${baseContext}

Provide business-focused analysis in JSON format:

{
  "analysis": "Business impact assessment",
  "recommendations": ["Changes with clear ROI"],
  "metrics": ["KPIs to measure success"],
  "timeline": ["Implementation phases with business priorities"]
}`;
  }
}

function extractRecommendations(content: string): string[] {
  const lines = content.split('\n');
  const recommendations = lines
    .filter(line => line.trim().match(/^[-•*]\s+/) || line.toLowerCase().includes('recommend'))
    .map(line => line.trim().replace(/^[-•*]\s+/, ''))
    .filter(rec => rec.length > 10);
  
  return recommendations.length > 0 ? recommendations : ['Focus on improving user experience based on the analysis above'];
}

function assessSeverity(content: string, persona: string): string {
  const lowerContent = content.toLowerCase();
  
  if (persona === 'clarity') {
    if (lowerContent.includes('rage') || lowerContent.includes('terrible') || lowerContent.includes('disaster')) {
      return 'rage-cranked';
    }
    if (lowerContent.includes('annoying') || lowerContent.includes('frustrating') || lowerContent.includes('confusing')) {
      return 'medium';
    }
    return 'low';
  }
  
  if (lowerContent.includes('critical') || lowerContent.includes('urgent') || lowerContent.includes('severe')) {
    return 'high';
  }
  if (lowerContent.includes('important') || lowerContent.includes('significant')) {
    return 'medium';
  }
  return 'low';
}

function extractGoblinAttitude(content: string): string {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('rage') || lowerContent.includes('furious') || lowerContent.includes('livid')) {
    return 'enraged';
  }
  if (lowerContent.includes('annoyed') || lowerContent.includes('frustrated') || lowerContent.includes('grumpy')) {
    return 'grumpy';
  }
  if (lowerContent.includes('pleased') || lowerContent.includes('impressed') || lowerContent.includes('good job')) {
    return 'pleased';
  }
  
  return 'sarcastic'; // Default goblin mood
}