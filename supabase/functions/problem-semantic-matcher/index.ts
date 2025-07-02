import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProblemTemplate {
  id: string;
  statement: string;
  category: string;
  implied_context: any;
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

interface SemanticMatchRequest {
  userStatement: string;
  extractedContext: ExtractedContext;
  templates: ProblemTemplate[];
}

interface MatchResult {
  templateId: string;
  confidence: number;
  reasoning: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userStatement, extractedContext, templates }: SemanticMatchRequest = await req.json();
    
    if (!userStatement || !extractedContext || !templates || !Array.isArray(templates)) {
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
You are an expert in semantic matching and problem pattern recognition. Your task is to match a user's problem statement to the most similar problem templates.

USER STATEMENT:
"${userStatement}"

EXTRACTED CONTEXT:
- Urgency: ${extractedContext.urgency}
- Stakeholders: ${extractedContext.stakeholders.join(', ')}
- Time Constraints: ${extractedContext.timeConstraints.join(', ')}
- Business Goals: ${extractedContext.businessGoals.join(', ')}
- Resource Constraints: ${extractedContext.resourceConstraints.join(', ')}
- Emotional Indicators: ${extractedContext.emotionalIndicators.join(', ')}
- Business Model: ${extractedContext.businessModel || 'Not specified'}
- Industry: ${extractedContext.industry || 'Not specified'}

PROBLEM TEMPLATES TO MATCH AGAINST:
${templates.map((template, index) => `
${index + 1}. ID: ${template.id}
   Category: ${template.category}
   Statement: "${template.statement}"
   Context: ${JSON.stringify(template.implied_context)}
`).join('\n')}

For each template, analyze:
1. Semantic similarity of the problem statements
2. Context alignment (urgency, stakeholders, goals, constraints)
3. Business situation similarity
4. Problem pattern match

Rate each template with a confidence score from 0.0 to 1.0, where:
- 1.0 = Perfect match (same problem, context, and business situation)
- 0.8-0.9 = Very similar problem with aligned context
- 0.6-0.7 = Similar problem pattern with some context alignment
- 0.4-0.5 = Related problem but different context
- 0.0-0.3 = Little to no similarity

Respond ONLY with a valid JSON array of match results in this exact format:
[
  {
    "templateId": "template-id-1",
    "confidence": 0.85,
    "reasoning": "Brief explanation of why this matches and what factors contributed to the score"
  },
  {
    "templateId": "template-id-2", 
    "confidence": 0.42,
    "reasoning": "Brief explanation of similarity and differences"
  }
]

Include ALL templates in your response, even if confidence is very low. Order by confidence score (highest first).
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
        max_tokens: 2000,
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
    let matches: MatchResult[];
    try {
      matches = JSON.parse(aiResponse);
      
      // Validate the response structure
      if (!Array.isArray(matches)) {
        throw new Error('Response is not an array');
      }
      
      // Ensure all matches have required fields
      matches = matches.map(match => ({
        templateId: match.templateId || '',
        confidence: typeof match.confidence === 'number' ? match.confidence : 0,
        reasoning: match.reasoning || 'No reasoning provided'
      }));
      
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', aiResponse);
      // Fallback to simple keyword matching
      matches = templates.map(template => {
        const similarity = calculateSimpleMatch(userStatement, template.statement);
        return {
          templateId: template.id,
          confidence: similarity,
          reasoning: `Simple keyword similarity match (${(similarity * 100).toFixed(0)}%)`
        };
      }).sort((a, b) => b.confidence - a.confidence);
    }

    console.log('Semantic matching completed:', {
      inputLength: userStatement.length,
      templateCount: templates.length,
      bestMatch: matches[0]?.confidence || 0,
      totalMatches: matches.length
    });

    return new Response(
      JSON.stringify({ matches }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in problem-semantic-matcher:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Fallback simple matching function
function calculateSimpleMatch(userStatement: string, templateStatement: string): number {
  const userWords = userStatement.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const templateWords = templateStatement.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  const commonWords = userWords.filter(word => 
    templateWords.some(tWord => tWord.includes(word) || word.includes(tWord))
  );
  
  const similarity = commonWords.length / Math.max(userWords.length, templateWords.length);
  return Math.min(similarity, 0.9); // Cap at 0.9 for simple matching
}