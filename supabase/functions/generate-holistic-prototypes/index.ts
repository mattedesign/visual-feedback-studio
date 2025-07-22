import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface RequestBody {
  analysisId: string;
  contextId?: string;
  generateAll?: boolean;
  solutionType?: 'conservative' | 'balanced' | 'innovative';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    const { analysisId, contextId, generateAll = false, solutionType }: RequestBody = await req.json();
    
    console.log('🎯 Processing request:', { analysisId, contextId, generateAll, solutionType });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

    if (!supabaseUrl || !supabaseKey || !anthropicKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all necessary data
    const [analysisResult, contextResult] = await Promise.all([
      supabase.from('figmant_analysis_results').select('*').eq('id', analysisId).single(),
      contextId ? supabase.from('figmant_user_contexts').select('*').eq('id', contextId).single() : { data: null }
    ]);

    if (analysisResult.error || !analysisResult.data) {
      throw new Error(`Failed to fetch analysis data: ${analysisResult.error?.message}`);
    }

    const analysisData = analysisResult.data;
    const contextData = contextResult.data;

    // Check if holistic analysis already exists
    const { data: existingAnalysis } = await supabase
      .from('figmant_holistic_analyses')
      .select('*')
      .eq('analysis_id', analysisId)
      .single();

    let holisticAnalysis = existingAnalysis;

    // Generate holistic analysis if it doesn't exist
    if (!holisticAnalysis) {
      console.log('🔍 No existing holistic analysis found, generating new one...');
      const analysisPrompt = buildHolisticAnalysisPrompt(analysisData, contextData);
      const analysisResponse = await callClaude(analysisPrompt, anthropicKey);
      
      console.log('📊 Analysis response structure:', {
        hasProblems: !!analysisResponse?.problems,
        hasSolutions: !!analysisResponse?.solutions,
        hasVisionInsights: !!analysisResponse?.visionInsights,
        problemsCount: analysisResponse?.problems?.length || 0,
        solutionsCount: analysisResponse?.solutions?.length || 0
      });

      if (!analysisResponse || typeof analysisResponse !== 'object') {
        console.error('🚨 Invalid analysis response - not an object:', analysisResponse);
        throw new Error('Claude did not return a valid response object');
      }

      // Ensure we have the required arrays, defaulting to empty arrays if missing
      if (!Array.isArray(analysisResponse.problems)) {
        console.warn('⚠️ Problems array missing, defaulting to empty array');
        analysisResponse.problems = [];
      }
      
      if (!Array.isArray(analysisResponse.solutions)) {
        console.warn('⚠️ Solutions array missing, defaulting to empty array');
        analysisResponse.solutions = [];
      }
      
      const { data: newAnalysis, error: insertError } = await supabase
        .from('figmant_holistic_analyses')
        .insert({
          analysis_id: analysisId,
          identified_problems: analysisResponse.problems || [],
          solution_approaches: analysisResponse.solutions || [],
          vision_insights: analysisResponse.visionInsights || {}
        })
        .select()
        .single();

      if (insertError) {
        console.error('🚨 Error inserting holistic analysis:', insertError);
        throw new Error(`Failed to save holistic analysis: ${insertError.message}`);
      }
        
      holisticAnalysis = newAnalysis;
      console.log('✅ Created new holistic analysis:', holisticAnalysis.id);
    }

    // Generate prototypes
    if (generateAll) {
      const results = await Promise.all(
        (holisticAnalysis.solution_approaches || []).map(solution => 
          generatePrototype(solution, analysisData, contextData, holisticAnalysis, supabase, anthropicKey)
        )
      );
      
      return new Response(
        JSON.stringify({ success: true, prototypes: results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (solutionType) {
      const solution = (holisticAnalysis.solution_approaches || []).find(s => s.approach === solutionType);
      if (!solution) {
        throw new Error(`Solution type '${solutionType}' not found in analysis`);
      }
      const prototype = await generatePrototype(solution, analysisData, contextData, holisticAnalysis, supabase, anthropicKey);
      
      return new Response(
        JSON.stringify({ success: true, prototype }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, analysis: holisticAnalysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildHolisticAnalysisPrompt(analysisData: any, contextData: any) {
  const visionData = analysisData.google_vision_summary?.vision_results;
  const claudeInsights = analysisData.claude_analysis;
  
  return `You are an expert UX mentor analyzing a design for a ${contextData?.business_type || 'digital'} product.

BUSINESS CONTEXT:
${contextData ? `
- Business Type: ${contextData.business_type}
- Target Audience: ${contextData.target_audience}
- Primary Goal: ${contextData.primary_goal}
- Specific Challenges: ${contextData.specific_challenges?.join(', ')}
- Current Metrics: ${JSON.stringify(contextData.current_metrics)}
` : 'No specific context provided - analyze based on common UX principles'}

VISION ANALYSIS DATA:
- Detected Text: ${JSON.stringify(visionData?.text)}
- Layout Structure: ${JSON.stringify(visionData?.layout)}
- Colors: ${JSON.stringify(visionData?.imageProperties?.dominantColors)}

EXISTING UX ANALYSIS:
${JSON.stringify(claudeInsights)}

TASK:
1. Identify 3-5 SPECIFIC UX PROBLEMS that prevent this design from achieving its goals
2. For each problem, explain:
   - What's wrong and why it matters
   - How it impacts the primary business goal
   - Which UX principle or user psychology it violates

3. Create 3 DIFFERENT SOLUTION APPROACHES:
   
   CONSERVATIVE (Molecular Fix):
   - Target ONE specific, high-impact problem only
   - Minimal changes that can be implemented fast  
   - Keep existing structure mostly intact
   - Focus on quick wins for a single component or interaction
   
   BALANCED (Strategic Improvements):
   - Address 2-3 related problems that work together
   - Apply modern UX patterns selectively
   - Make moderate structural improvements
   - Balance user needs with business constraints
   
   INNOVATIVE (Complete Holistic Redesign):
   - Address ALL identified problems in one comprehensive solution
   - Completely reimagine the entire screen/experience
   - Apply cutting-edge UX patterns and interactions
   - Create a best-in-class experience that sets new standards
   - Design the ideal version that solves every problem holistically

For each approach include:
- Name and description
- Key changes to make
- Expected impact on metrics
- Real companies using similar approaches
- Implementation guidance

Return as JSON with exactly this structure (no additional text before or after):
{
  "problems": [
    {
      "id": "p1",
      "title": "Problem Title",
      "description": "Problem description",
      "impact": "Impact statement",
      "businessImpact": "Business impact",
      "principle": "UX principle violated"
    }
  ],
  "solutions": [
    {
      "approach": "conservative",
      "name": "Quick Wins Solution",
      "description": "Solution description",
      "keyChanges": ["Change 1", "Change 2"],
      "expectedImpact": [{"metric": "conversion", "improvement": "+15%"}],
      "implementationGuidance": "Implementation steps"
    },
    {
      "approach": "balanced", 
      "name": "Best Practices Solution",
      "description": "Solution description",
      "keyChanges": ["Change 1", "Change 2"],
      "expectedImpact": [{"metric": "engagement", "improvement": "+25%"}],
      "implementationGuidance": "Implementation steps"
    },
    {
      "approach": "innovative",
      "name": "Cutting Edge Solution", 
      "description": "Solution description",
      "keyChanges": ["Change 1", "Change 2"],
      "expectedImpact": [{"metric": "retention", "improvement": "+40%"}],
      "implementationGuidance": "Implementation steps"
    }
  ],
  "visionInsights": {
    "keyTrends": ["trend1", "trend2"],
    "recommendedFocus": "focus recommendation"
  }
}`;
}

async function generatePrototype(
  solution: any,
  analysisData: any,
  contextData: any,
  holisticAnalysis: any,
  supabase: any,
  anthropicKey: string
) {
  // Check if prototype already exists
  const { data: existing } = await supabase
    .from('figmant_holistic_prototypes')
    .select('*')
    .eq('analysis_id', analysisData.id)
    .eq('solution_type', solution.approach)
    .single();

  if (existing) return existing;

  // Generate new prototype
        const prototypePrompt = buildPrototypePrompt(solution, analysisData, contextData, holisticAnalysis);
        const codeResponse = await callClaude(prototypePrompt, anthropicKey);
        
        // Handle both string responses and parsed JSON responses
        const code = typeof codeResponse === 'string' ? codeResponse : codeResponse.code || JSON.stringify(codeResponse, null, 2);

  const { data: prototype } = await supabase
    .from('figmant_holistic_prototypes')
    .insert({
      analysis_id: analysisData.id,
      solution_type: solution.approach,
      title: solution.name,
      description: solution.description,
      component_code: code,
      key_changes: solution.keyChanges,
      expected_impact: solution.expectedImpact,
      generation_metadata: {
        contextUsed: !!contextData,
        problemsSolved: (holisticAnalysis.identified_problems || []).map(p => p.id),
        generatedAt: new Date().toISOString()
      }
    })
    .select()
    .single();

  return prototype;
}

function buildPrototypePrompt(solution: any, analysisData: any, contextData: any, holisticAnalysis: any) {
  const extractedContent = extractContentFromAnalysis(analysisData);
  const problems = holisticAnalysis.identified_problems || [];
  
  // Create different prompts based on solution approach
  let approachGuidance = '';
  let scopeInstructions = '';
  
  if (solution.approach === 'conservative') {
    approachGuidance = `CONSERVATIVE APPROACH - Target ONE critical issue with minimal changes.
- Focus on the highest-impact problem only
- Keep existing layout and structure
- Make targeted improvements to specific elements
- Quick wins that can be implemented immediately`;
    
    scopeInstructions = `Create a targeted fix for the most critical issue while keeping the overall design intact.`;
    
  } else if (solution.approach === 'balanced') {
    approachGuidance = `BALANCED APPROACH - Address 2-3 key problems with strategic improvements.
- Improve information hierarchy and clarity
- Apply proven UX patterns selectively
- Enhance user flow and interactions
- Balance innovation with usability`;
    
    scopeInstructions = `Create an improved version that addresses multiple key issues with modern UX patterns.`;
    
  } else if (solution.approach === 'innovative') {
    approachGuidance = `INNOVATIVE APPROACH - Comprehensive redesign addressing ALL problems.
- Completely reimagine the user experience
- Apply cutting-edge design patterns
- Maximize engagement and usability
- Create a best-in-class solution`;
    
    scopeInstructions = `Create a bold, comprehensive redesign that solves all identified problems with innovative solutions.`;
  }
  
  return `You are creating a browser-compatible React component for ${solution.approach} improvements.

${approachGuidance}

PROBLEMS TO ADDRESS:
${problems.map((p: any, i: number) => `${i + 1}. ${p.title || p.description} - ${p.impact || 'Impact on user experience'}`).join('\n')}

SOLUTION DETAILS:
Name: ${solution.name}
Description: ${solution.description}
Key Changes: ${(solution.keyChanges || []).join(', ')}

AVAILABLE CONTENT:
- Text Elements: ${extractedContent.texts?.slice(0, 5).join(', ') || 'Dashboard, Analytics, Overview'}
- Button Labels: ${extractedContent.buttons?.join(', ') || 'Get Started, Learn More, View Details'}
- Key Headings: ${extractedContent.headings?.slice(0, 3).join(', ') || 'Main Dashboard, Statistics, Actions'}
- Color Palette: ${extractedContent.colors?.slice(0, 3).join(', ') || 'blue, gray, white'}

BUSINESS CONTEXT:
${contextData ? `Business: ${contextData.business_type} | Goal: ${contextData.primary_goal} | Audience: ${contextData.target_audience}` : 'General business application'}

${scopeInstructions}

CRITICAL REQUIREMENTS:
- NO import/export statements (browser execution only)
- Use React hooks from global React object
- Only standard HTML elements and Tailwind CSS
- Must be complete, functional, and realistic
- Include interactive states and sample data

Generate EXACTLY this format with NO markdown blocks:

function EnhancedDesign() {
  const { useState, useEffect } = React;
  
  // [Your component logic here based on the approach and problems to solve]
  
  return (
    // [Your JSX implementation addressing the specific problems]
  );
}`;

async function callClaude(prompt: string, apiKey: string) {
  console.log('🔥 Calling Claude API with prompt length:', prompt.length);
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('🚨 Claude API error:', response.status, errorText);
    throw new Error(`Claude API failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('📝 Claude response received:', { 
    hasContent: !!data.content?.[0]?.text,
    contentLength: data.content?.[0]?.text?.length || 0 
  });

  const content = data.content?.[0]?.text;
  if (!content) {
    console.error('🚨 No content in Claude response:', data);
    throw new Error('No content received from Claude API');
  }

  // First try to extract JSON from markdown if present
  const jsonMatch = content.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  const jsonContent = jsonMatch ? jsonMatch[1] : content;

  // Try to parse as JSON for analysis, or return as string for code
  try {
    const parsed = JSON.parse(jsonContent);
    console.log('✅ Successfully parsed JSON response');
    return parsed;
  } catch (parseError) {
    console.log('📄 Not JSON, checking for code blocks...');
    // Extract code from markdown if present
    const codeMatch = content.match(/```(?:jsx?|tsx?)?\n([\s\S]*?)\n```/);
    if (codeMatch) {
      console.log('✅ Extracted code from markdown');
      return codeMatch[1];
    }
    console.log('⚠️ Returning raw content:', content.substring(0, 200) + '...');
    return content;
  }
}

function extractContentFromAnalysis(analysis: any) {
  const visionData = analysis.google_vision_summary?.vision_results;
  
  return {
    texts: visionData?.text || [],
    metrics: extractMetrics(visionData?.text || []),
    colors: visionData?.imageProperties?.dominantColors?.map(c => c.color) || [],
    buttons: extractButtons(visionData?.text || []),
    headings: extractHeadings(visionData?.text || [])
  };
}

function extractMetrics(texts: string[]) {
  return texts
    .map(text => {
      const match = text.match(/(\d+(?:\.\d+)?[%$€£¥KMB]?)/);
      if (match) {
        return {
          value: match[1],
          label: text.replace(match[1], '').trim(),
          original: text
        };
      }
      return null;
    })
    .filter(Boolean);
}

function extractButtons(texts: string[]) {
  const buttonPatterns = ['Get Started', 'Sign Up', 'Learn More', 'Try', 'Start', 'Continue', 'Next'];
  return texts.filter(text => 
    buttonPatterns.some(pattern => text.toLowerCase().includes(pattern.toLowerCase()))
  );
}

function extractHeadings(texts: string[]) {
  return texts.filter(text => text.length > 5 && text.length < 100 && !text.includes('   '));
}