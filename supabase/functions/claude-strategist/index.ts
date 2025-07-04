import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StrategistOutput {
  diagnosis: string;
  strategicRationale: string;
  expertRecommendations: ExpertRecommendation[];
  abTestHypothesis: string;
  successMetrics: string[];
  confidenceAssessment: {
    overallConfidence: number;
    reasoning: string;
  };
}

interface ExpertRecommendation {
  title: string;
  recommendation: string;
  confidence: number;
  expectedImpact: string;
  implementationEffort: 'Low' | 'Medium' | 'High';
  timeline: string;
  reasoning: string;
  source: string;
}

console.log('🎭 Claude UX Strategist Function - Starting up');

serve(async (req) => {
  console.log('📨 Strategist request received - DISABLED:', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Return disabled message for all requests
  return new Response(JSON.stringify({
    success: false,
    error: 'Claude Strategist functionality has been disabled',
    message: 'This endpoint is no longer active. Analysis will complete without strategist consultation.'
  }), {
    status: 200, // Use 200 to avoid breaking existing flows
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});

function buildStrategistPrompt(userChallenge: string, traditionalAnnotations: any[]): string {
  return `
You are a 20-year Principal UX Designer with experience in SaaS, mobile-first, and enterprise systems.
Your role is to identify UX frictions, diagnose problems, and recommend pattern-backed solutions with measurable business impact.

INPUTS:
- User Challenge: "${userChallenge}"
- Current Analysis: ${JSON.stringify(traditionalAnnotations.slice(0, 8))}

USER EXPECTATION: They want to feel like they're consulting with a 20-year veteran, not getting AI-generated observations.

YOUR STRATEGIST MINDSET:
- Think diagnostically: identify root causes, not symptoms
- Reference specific UX principles (Fitts' Law, progressive disclosure, etc.)
- Quantify business impact wherever possible ("25-40% improvement")
- Consider user emotional state and constraints
- Provide testable hypotheses for validation
- Balance quick wins vs. strategic improvements

ANTI-PATTERN DETECTION:
- "cta_hidden" → "CTA below fold violates Fitts' Law, reduces mobile conversion"
- "layout_density: high" → "Cognitive overload triggers attention tunneling"
- "form_fields: >8" → "Progressive disclosure needed for mobile completion"

OUTPUT FORMAT:
Return ONLY valid JSON matching this exact structure:
{
  "diagnosis": "Root cause analysis of the UX challenges...",
  "strategicRationale": "Strategic approach explanation...",
  "expertRecommendations": [
    {
      "title": "Specific recommendation title",
      "recommendation": "Detailed actionable recommendation",
      "confidence": 0.85,
      "expectedImpact": "Quantified business impact",
      "implementationEffort": "Low|Medium|High",
      "timeline": "Time estimate",
      "reasoning": "UX principle-based reasoning",
      "source": "Research backing"
    }
  ],
  "abTestHypothesis": "Testable hypothesis for validation",
  "successMetrics": ["metric1", "metric2", "metric3"],
  "confidenceAssessment": {
    "overallConfidence": 0.78,
    "reasoning": "Confidence reasoning"
  }
}

IMPORTANT: Respond with ONLY the JSON object, no additional text or explanation.
`;
}

async function callClaudeAPI(
  systemPrompt: string,
  model: string,
  apiKey: string
): Promise<{ success: boolean; result?: StrategistOutput; error?: string }> {
  try {
    console.log('🚀 Calling Claude API:', {
      model,
      promptLength: systemPrompt.length,
      hasApiKey: !!apiKey
    });

    const requestPayload = {
      model: model,
      max_tokens: 4000,
      temperature: 0.2, // Low temperature for consistent strategic analysis
      system: "You are a 20-year Principal UX Designer expert. Always respond with valid JSON containing strategic UX analysis.",
      messages: [
        {
          role: 'user',
          content: systemPrompt
        }
      ]
    };

    console.log('🔧 Request payload details:', {
      model,
      maxTokens: requestPayload.max_tokens,
      messageCount: requestPayload.messages.length,
      systemLength: requestPayload.system.length,
      contentLength: systemPrompt.length
    });

    // Enhanced API key debugging (copied from working analyze-design function)
    const originalLength = apiKey.length;
    const cleanApiKey = apiKey.trim().replace(/[\r\n\t]/g, '');
    const preview = cleanApiKey.substring(0, 15);
    const hasWhitespace = apiKey !== cleanApiKey || /\s/.test(apiKey);
    const hasSpecialChars = /[\r\n\t\f\v]/.test(apiKey);
    const startsCorrectly = cleanApiKey.startsWith('sk-ant-');
    
    console.log('🔍 DETAILED CLAUDE API KEY DEBUG:');
    console.log('=================================');
    console.log(`   Original length: ${originalLength}`);
    console.log(`   Clean length: ${cleanApiKey.length}`);
    console.log(`   Preview: "${preview}..."`);
    console.log(`   Starts with 'sk-ant-': ${startsCorrectly ? '✅' : '❌'}`);
    console.log(`   Has whitespace: ${hasWhitespace ? '⚠️  YES' : '✅ NO'}`);
    console.log(`   Has special chars: ${hasSpecialChars ? '⚠️  YES' : '✅ NO'}`);
    
    if (!startsCorrectly) {
      console.error(`   ❌ INVALID FORMAT - key should start with 'sk-ant-' but starts with '${cleanApiKey.substring(0, 8)}'`);
      return {
        success: false,
        error: 'Invalid Claude API key format. Must start with "sk-ant-"'
      };
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanApiKey}`,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestPayload)
    });

    console.log('📡 Claude API response:', {
      status: response.status,
      statusText: response.statusText
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('❌ Claude API error details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        responseLength: responseText.length,
        responsePreview: responseText.substring(0, 1000)
      });

      let errorMessage = 'Claude API error';
      let errorType = 'unknown';
      
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
        errorType = errorData.error?.type || errorData.type || 'unknown';
        
        console.error('❌ Parsed error data:', {
          type: errorType,
          message: errorMessage,
          fullError: errorData
        });
      } catch (parseError) {
        console.error('❌ Failed to parse error response:', parseError);
        errorMessage = responseText.substring(0, 200);
      }

      return {
        success: false,
        error: `Claude API failed (${response.status}): ${errorType} - ${errorMessage}`
      };
    }

    // Parse Claude response
    let claudeData;
    try {
      claudeData = JSON.parse(responseText);
    } catch (error) {
      console.error('❌ Failed to parse Claude response:', error);
      return {
        success: false,
        error: 'Invalid JSON response from Claude'
      };
    }

    if (!claudeData.content || !claudeData.content[0]?.text) {
      console.error('❌ Invalid Claude response structure');
      return {
        success: false,
        error: 'Invalid response structure from Claude'
      };
    }

    const responseContent = claudeData.content[0].text;
    console.log('📝 Claude response content length:', responseContent.length);

    // Parse the strategist analysis JSON
    let strategistOutput: StrategistOutput;
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      strategistOutput = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      if (!strategistOutput.diagnosis || !strategistOutput.expertRecommendations) {
        throw new Error('Missing required fields in strategist output');
      }

    } catch (error) {
      console.error('❌ Failed to parse strategist JSON:', error);
      console.error('❌ Raw response:', responseContent.substring(0, 500));
      
      return {
        success: false,
        error: 'Failed to parse strategist analysis from Claude response'
      };
    }

    console.log('✅ Strategist analysis parsed successfully:', {
      recommendationsCount: strategistOutput.expertRecommendations?.length || 0,
      confidence: strategistOutput.confidenceAssessment?.overallConfidence || 0
    });

    return {
      success: true,
      result: strategistOutput
    };

  } catch (error) {
    console.error('❌ Claude API call failed:', error);
    return {
      success: false,
      error: error.message || 'Claude API call failed'
    };
  }
}