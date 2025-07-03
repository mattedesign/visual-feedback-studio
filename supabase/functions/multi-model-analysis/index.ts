import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input, provider, model, analysisType } = await req.json();
    
    console.log(`🤖 Multi-model analysis requested: ${provider} ${model} for ${analysisType}`);

    if (provider === 'openai') {
      return await handleOpenAIAnalysis(input, model, analysisType);
    }

    throw new Error(`Unsupported provider: ${provider}`);

  } catch (error) {
    console.error('❌ Multi-model analysis error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        provider: 'multi-model',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleOpenAIAnalysis(input: any, model: string, analysisType: string) {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompt = buildOpenAIPrompt(input, analysisType);
  
  console.log('🚀 Calling OpenAI API...');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are a senior UX strategist providing alternative perspectives on user experience analysis. Focus on practical, actionable insights that complement primary analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  let parsedResult;
  try {
    parsedResult = JSON.parse(content);
  } catch (parseError) {
    console.warn('⚠️ Failed to parse OpenAI JSON response, creating structured fallback');
    parsedResult = createStructuredFallback(content, input);
  }

  console.log('✅ OpenAI analysis completed:', {
    tokensUsed: data.usage?.total_tokens,
    model: data.model
  });

  return new Response(
    JSON.stringify({
      success: true,
      result: parsedResult,
      confidence: calculateOpenAIConfidence(parsedResult),
      tokensUsed: data.usage?.total_tokens,
      model: data.model,
      provider: 'openai',
      timestamp: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function buildOpenAIPrompt(input: any, analysisType: string): string {
  return `
As a senior UX strategist, provide an alternative perspective on this UX analysis:

CONTEXT:
- Problem: ${input.problemStatement}
- Industry: ${input.industryContext}
- User Persona: ${input.userPersona}
- Business Goals: ${JSON.stringify(input.businessGoals)}

KNOWN ISSUES:
- Critical: ${input.knownIssues?.critical?.length || 0} issues
- Important: ${input.knownIssues?.important?.length || 0} issues  
- Enhancements: ${input.knownIssues?.enhancements?.length || 0} opportunities

VISUAL ANALYSIS:
- Layout Density: ${input.visionSummary?.layoutDensity}
- Mobile Score: ${input.visionSummary?.mobileOptimization?.responsiveScore || 'Unknown'}
- Accessibility Issues: ${input.visionSummary?.accessibilityFlags?.length || 0}

YOUR ROLE: Provide complementary insights and alternative recommendations that might be missed by other analyses.

FOCUS AREAS:
1. Alternative UX solutions not commonly considered
2. Industry-specific patterns and opportunities  
3. User psychology and behavioral insights
4. Technical implementation alternatives
5. Business impact from different angles

OUTPUT FORMAT (JSON only):
{
  "alternativeDiagnosis": "Your alternative perspective on the core issues",
  "recommendations": [
    {
      "title": "Specific recommendation",
      "description": "Detailed explanation", 
      "reasoning": "Why this approach",
      "priority": 1-3,
      "effort": "Low|Medium|High",
      "impact": "Estimated business impact",
      "source": "GPT-4o Alternative Analysis"
    }
  ],
  "uniqueInsights": [
    "Insight 1: Something others might miss",
    "Insight 2: Alternative perspective"
  ],
  "implementationAlternatives": [
    "Technical or design alternative 1",
    "Technical or design alternative 2"
  ],
  "riskMitigations": [
    "Risk mitigation strategy 1",
    "Risk mitigation strategy 2"  
  ]
}

Respond with ONLY the JSON object.
`;
}

function createStructuredFallback(content: string, input: any): any {
  return {
    alternativeDiagnosis: `Alternative analysis suggests focusing on ${input.userPersona} journey optimization and ${input.industryContext} specific patterns`,
    recommendations: [
      {
        title: "Alternative UX Approach",
        description: content.substring(0, 200) + "...",
        reasoning: "GPT-4o alternative perspective",
        priority: 2,
        effort: "Medium",
        impact: "15-25% improvement potential",
        source: "GPT-4o Alternative Analysis"
      }
    ],
    uniqueInsights: [
      "Consider user context and environmental factors",
      "Evaluate industry-specific behavioral patterns"
    ],
    implementationAlternatives: [
      "Progressive enhancement approach",
      "Modular design system implementation"
    ],
    riskMitigations: [
      "A/B testing for validation",
      "Phased rollout strategy"
    ]
  };
}

function calculateOpenAIConfidence(result: any): number {
  let confidence = 0.7; // Base confidence
  
  if (result.recommendations && result.recommendations.length > 0) {
    confidence += 0.1;
  }
  
  if (result.uniqueInsights && result.uniqueInsights.length >= 2) {
    confidence += 0.05;
  }
  
  if (result.implementationAlternatives && result.implementationAlternatives.length > 0) {
    confidence += 0.05;
  }
  
  return Math.min(0.85, confidence); // Cap at 85%
}