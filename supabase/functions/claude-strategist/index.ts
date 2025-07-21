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
  const requestId = crypto.randomUUID().substring(0, 8);
  console.log(`📨 [${requestId}] Claude Strategist request received:`, {
    method: req.method,
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
    const requestData = await req.json();
    console.log(`📊 [${requestId}] Processing strategist input:`, {
      hasVisionSummary: !!requestData.visionSummary,
      ragMatches: requestData.ragMatches?.length || 0,
      enhancedMode: requestData.enhancedMode,
      orchestrationMode: requestData.orchestrationMode
    });

    // Get Claude API key
    const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!claudeApiKey) {
      throw new Error('Claude API key not configured');
    }

    // Build enhanced strategist prompt
    const strategistPrompt = buildEnhancedStrategistPrompt(requestData);
    
    // Call Claude API
    const claudeResult = await callClaudeAPI(
      strategistPrompt,
      requestData.model || 'claude-opus-4-20250514',
      claudeApiKey
    );

    if (!claudeResult.success) {
      throw new Error(claudeResult.error || 'Claude API call failed');
    }

    console.log(`✅ [${requestId}] Strategist analysis completed:`, {
      recommendationsCount: claudeResult.result?.expertRecommendations?.length || 0,
      confidence: claudeResult.result?.confidenceAssessment?.overallConfidence || 0
    });

    return new Response(JSON.stringify({
      success: true,
      result: claudeResult.result,
      processingTime: Date.now(),
      modelUsed: requestData.model || 'claude-opus-4-20250514'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`❌ [${requestId}] Strategist error:`, error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Strategist analysis failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function buildEnhancedStrategistPrompt(requestData: any): string {
  const visionContext = requestData.visionSummary ? `
VISION ANALYSIS CONTEXT:
- UI Elements Detected: ${requestData.visionSummary.structuralAnalysis?.totalElements || 0}
- Layout Density: ${requestData.visionSummary.structuralAnalysis?.layoutDensity || 'unknown'}
- Accessibility Score: ${requestData.visionSummary.accessibilityDetection?.overall || 'unknown'}
- Mobile Optimization: ${requestData.visionSummary.mobileOptimization?.responsiveScore || 'unknown'}%
- Visual Hierarchy Assessment: ${requestData.visionSummary.designSystemAssessment?.consistency || 'unknown'}
` : '';

  const ragContext = requestData.ragMatches?.length > 0 ? `
RAG KNOWLEDGE CONTEXT:
${requestData.ragMatches.slice(0, 5).map((match: any, index: number) => `
${index + 1}. ${match.title || 'Knowledge Entry'}
   Category: ${match.category || 'general'}
   Content: ${(match.content || '').substring(0, 200)}...
   Relevance: ${Math.round((match.similarity || 0) * 100)}%
`).join('')}
` : '';

  const competitorContext = requestData.competitorPatterns?.length > 0 ? `
COMPETITIVE PATTERNS:
${requestData.competitorPatterns.slice(0, 3).map((pattern: any, index: number) => `
${index + 1}. ${pattern.pattern_name || 'Pattern'}
   Industry: ${pattern.industry || 'general'}
   Effectiveness: ${pattern.effectiveness_score || 'unknown'}
   Description: ${(pattern.description || '').substring(0, 150)}...
`).join('')}
` : '';

  return `
You are a 20-year Principal UX Designer with deep expertise in SaaS, mobile-first, and enterprise systems.
You diagnose UX problems with surgical precision and recommend evidence-backed solutions with quantifiable business impact.

CRITICAL: You are analyzing a STATIC SCREENSHOT, not a live interactive interface.

ANALYSIS INPUT:
- Problem Statement: "${requestData.problemStatement || 'General UX Analysis'}"
- User Persona: ${requestData.userPersona || 'Not specified'}
- Business Goals: ${JSON.stringify(requestData.businessGoals || [])}
- Industry Context: ${requestData.industryContext || 'technology'}
- Design Pattern Type: ${requestData.designPatternType || 'general interface'}

${visionContext}
${ragContext}
${competitorContext}

BUSINESS CONTEXT:
- Business Model: ${requestData.businessContext?.businessModel || 'B2C'}
- Target Audience: ${requestData.businessContext?.targetAudience || 'general users'}
- Known Issues: ${JSON.stringify(requestData.knownIssues || {})}

STRATEGIC APPROACH:
1. DIAGNOSTIC THINKING: Identify root causes, not just symptoms
2. PATTERN RECOGNITION: Reference established UX principles (Fitts' Law, Miller's Rule, etc.)
3. BUSINESS IMPACT: Quantify improvements with specific metrics ("25-40% conversion increase")
4. IMPLEMENTATION REALITY: Consider technical constraints and team capabilities
5. VALIDATION FRAMEWORK: Provide testable hypotheses and success metrics

STATIC SCREENSHOT LIMITATIONS - DO NOT RECOMMEND:
- Focus states, hover effects, or any interactive behaviors
- Functionality testing (form validation, click responses, etc.)
- Performance optimizations that require live testing
- Accessibility features that require interaction (keyboard navigation, screen reader testing)
- Any recommendation that requires seeing the interface in action

EXPERT RECOMMENDATIONS SHOULD ONLY INCLUDE:
- Visual design improvements (typography, color, spacing, layout)
- Information architecture and content hierarchy issues
- Visual accessibility concerns (contrast, text size, visual clarity)
- Mobile-responsive design layout suggestions
- Content strategy and messaging improvements
- Visual design system consistency issues
- Address specific visual pain points identified in the vision analysis
- Leverage knowledge from RAG context for evidence-based visual solutions  
- Consider competitive visual patterns and industry best practices
- Balance quick visual wins (1-2 weeks) with strategic design improvements (2-3 months)
- Include implementation guidance for visual/layout changes only

OUTPUT FORMAT - Return ONLY valid JSON:
{
  "diagnosis": "Root cause analysis with specific vision and context insights...",
  "strategicRationale": "Strategic approach based on analysis context...", 
  "expertRecommendations": [
    {
      "title": "Specific, actionable recommendation title",
      "recommendation": "Detailed implementation guidance with context awareness",
      "confidence": 0.85,
      "expectedImpact": "Quantified business metrics and user experience improvements",
      "implementationEffort": "Low|Medium|High",
      "timeline": "Realistic time estimate",
      "reasoning": "UX principle and evidence-based justification",
      "source": "Research backing or best practice reference",
      "priority": 1,
      "category": "accessibility|navigation|conversion|mobile|visual-hierarchy",
      "businessValue": {
        "quantifiedImpact": "Specific metric improvement",
        "roiProjection": "Expected return on investment"
      },
      "skillsRequired": ["frontend", "design", "ux-research"],
      "uxPrinciplesApplied": ["principle1", "principle2"],
      "citations": ["source1", "source2"]
    }
  ],
  "abTestHypothesis": "Testable hypothesis for validation based on analysis",
  "successMetrics": ["specific metric 1", "specific metric 2", "specific metric 3"],
  "confidenceAssessment": {
    "overallConfidence": 0.85,
    "reasoning": "Evidence quality and context completeness assessment"
  },
  "businessImpactAssessment": {
    "roiProjection": "Expected ROI based on improvements",
    "implementationRoadmap": {
      "quickWins": ["immediate action 1", "immediate action 2"],
      "weekOneActions": ["first week priority 1", "first week priority 2"], 
      "strategicInitiatives": ["long-term improvement 1", "long-term improvement 2"]
    }
  }
}

CRITICAL: Respond with ONLY the JSON object, no additional text or markdown formatting.
`;
}

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