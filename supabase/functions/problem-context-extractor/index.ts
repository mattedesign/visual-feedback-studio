import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContextExtractionRequest {
  userStatement: string;
  extractionType: 'business_context';
}

interface ExtractedContext {
  urgency: 'low' | 'medium' | 'high' | 'critical';
  stakeholders: string[];
  timeConstraints: string[];
  businessGoals: string[];
  resourceConstraints: string[];
  emotionalIndicators: string[];
  businessModel?: string;
  industry?: string;
  competitiveThreats?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userStatement, extractionType }: ContextExtractionRequest = await req.json();
    
    if (!userStatement || extractionType !== 'business_context') {
      return new Response(
        JSON.stringify({ error: 'Invalid request parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      console.error('ANTHROPIC_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `
You are an expert business analyst. Extract business context from the following user statement about a UX/design problem.

User Statement: "${userStatement}"

Extract and categorize the following information from the statement:

1. URGENCY LEVEL (low/medium/high/critical) - based on time pressure, business impact, stakeholder involvement
2. STAKEHOLDERS - who is mentioned or implied (CEO, board, customers, development team, etc.)
3. TIME CONSTRAINTS - any deadlines, timeframes, or time-related pressure mentioned
4. BUSINESS GOALS - what business objectives are implied or stated
5. RESOURCE CONSTRAINTS - any budget, time, or capability limitations mentioned
6. EMOTIONAL INDICATORS - urgency words, frustration, excitement, pressure indicators
7. BUSINESS MODEL - if you can infer it (SaaS, e-commerce, enterprise, etc.)
8. INDUSTRY - if any industry context is provided or can be inferred
9. COMPETITIVE THREATS - any competitive pressure or market threats mentioned

Respond ONLY with a valid JSON object in this exact format:
{
  "urgency": "medium",
  "stakeholders": ["array", "of", "stakeholders"],
  "timeConstraints": ["array", "of", "time", "constraints"],
  "businessGoals": ["array", "of", "business", "goals"],
  "resourceConstraints": ["array", "of", "constraints"],
  "emotionalIndicators": ["array", "of", "emotional", "words"],
  "businessModel": "string or null",
  "industry": "string or null",
  "competitiveThreats": ["array", "of", "threats"]
}

Be specific and extract actual phrases/concepts from the user statement. If information is not present, use empty arrays or null values.
`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const anthropicData = await response.json();
    const aiResponse = anthropicData.content[0].text;
    
    // Parse AI response as JSON
    let extractedContext: ExtractedContext;
    try {
      extractedContext = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', aiResponse);
      // Fallback to basic context extraction
      extractedContext = {
        urgency: 'medium',
        stakeholders: [],
        timeConstraints: [],
        businessGoals: [],
        resourceConstraints: [],
        emotionalIndicators: []
      };
    }

    console.log('Context extraction completed:', {
      inputLength: userStatement.length,
      extractedUrgency: extractedContext.urgency,
      stakeholderCount: extractedContext.stakeholders.length
    });

    return new Response(
      JSON.stringify({ context: extractedContext }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in problem-context-extractor:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});