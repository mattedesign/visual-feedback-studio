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
  console.log('📨 Strategist request received:', {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { systemPrompt, model = 'claude-sonnet-4-20250514' } = await req.json();

    if (!systemPrompt) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing systemPrompt'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🤖 Starting Claude strategist analysis:', {
      model,
      promptLength: systemPrompt.length
    });

    // Get Claude API key from environment
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      console.error('❌ ANTHROPIC_API_KEY not found');
      return new Response(JSON.stringify({
        success: false,
        error: 'Claude API key not configured'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Call Claude API
    const claudeResponse = await callClaudeAPI(systemPrompt, model, anthropicApiKey);

    if (!claudeResponse.success) {
      console.error('❌ Claude API failed:', claudeResponse.error);
      return new Response(JSON.stringify({
        success: false,
        error: claudeResponse.error
      }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Claude strategist analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      result: claudeResponse.result,
      model: model
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('💥 Strategist function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`,
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
      console.error('❌ Claude API error:', {
        status: response.status,
        statusText: response.statusText,
        response: responseText.substring(0, 500)
      });

      let errorMessage = 'Claude API error';
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch {
        errorMessage = responseText.substring(0, 200);
      }

      return {
        success: false,
        error: `Claude API failed (${response.status}): ${errorMessage}`
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