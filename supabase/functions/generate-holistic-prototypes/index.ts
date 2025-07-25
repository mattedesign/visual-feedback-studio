import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

interface RequestBody {
  analysisId: string;
  contextId?: string;
  generateAll?: boolean;
  solutionType?: 'conservative' | 'balanced' | 'innovative';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { analysisId, contextId, generateAll = false, solutionType } = await req.json() as RequestBody;

    if (!analysisId) {
      throw new Error('analysisId is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!supabaseUrl || !supabaseKey || !anthropicKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Fetching analysis data and context...');

    // Fetch analysis data and context in parallel
    const [analysisResult, contextResult] = await Promise.all([
      supabase.from('figmant_analysis_results').select('*').eq('id', analysisId).single(),
      contextId ? supabase.from('figmant_user_contexts').select('*').eq('id', contextId).single() : { data: null, error: null }
    ]);

    if (analysisResult.error) {
      throw new Error(`Failed to fetch analysis: ${analysisResult.error.message}`);
    }

    const analysisData = analysisResult.data;
    const contextData = contextResult.data;

    console.log('✅ Data fetched successfully');

    // Check if holistic analysis already exists - use maybeSingle to avoid errors
    const { data: existingAnalysis, error: existingError } = await supabase
      .from('figmant_holistic_analyses')
      .select('*')
      .eq('analysis_id', analysisId)
      .maybeSingle();

    if (existingError) {
      console.error('Error checking existing analysis:', existingError);
    }

    let holisticAnalysis = existingAnalysis;

    // Generate holistic analysis if it doesn't exist
    if (!holisticAnalysis) {
      console.log('🧠 Generating holistic analysis...');
      const analysisPrompt = buildHolisticAnalysisPrompt(analysisData, contextData);
      const analysisResponse = await callClaude(analysisPrompt, anthropicKey);
      
      // Use upsert to handle potential race conditions
      const { data: newAnalysis, error: analysisError } = await supabase
        .from('figmant_holistic_analyses')
        .upsert({
          analysis_id: analysisId,
          identified_problems: analysisResponse.problems || [],
          solution_approaches: analysisResponse.solutions || [],
          vision_insights: analysisResponse.visionInsights || {}
        }, {
          onConflict: 'analysis_id',
          ignoreDuplicates: false
        })
        .select()
        .single();
        
      if (analysisError) {
        // Check if it's a duplicate key error, if so try to fetch existing
        if (analysisError.message.includes('duplicate key') || analysisError.message.includes('unique constraint')) {
          console.log('🔄 Holistic analysis already exists due to race condition, fetching...');
          const { data: existing } = await supabase
            .from('figmant_holistic_analyses')
            .select('*')
            .eq('analysis_id', analysisId)
            .single();
          holisticAnalysis = existing;
        } else {
          throw new Error(`Failed to save holistic analysis: ${analysisError.message}`);
        }
      } else {
        holisticAnalysis = newAnalysis;
        console.log('✅ Holistic analysis generated and saved');
      }
    }

    // Generate prototypes based on request type
    if (generateAll) {
      console.log('🚀 Generating all 3 prototypes...');
      const results = await Promise.all(
        holisticAnalysis.solution_approaches.map(solution => 
          generatePrototype(solution, analysisData, contextData, holisticAnalysis, supabase, anthropicKey)
        )
      );
      
      return new Response(
        JSON.stringify({ success: true, prototypes: results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (solutionType) {
      console.log(`🎯 Generating ${solutionType} prototype...`);
      const solution = holisticAnalysis.solution_approaches.find(s => s.approach === solutionType);
      if (!solution) {
        throw new Error(`Solution type ${solutionType} not found in analysis`);
      }
      
      const prototype = await generatePrototype(solution, analysisData, contextData, holisticAnalysis, supabase, anthropicKey);
      
      return new Response(
        JSON.stringify({ success: true, prototype }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return just the analysis if no prototype generation requested
    return new Response(
      JSON.stringify({ success: true, analysis: holisticAnalysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error:', error);
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
- Admired Companies: ${contextData.admired_companies?.join(', ')}
` : 'No specific context provided - analyze based on common UX principles'}

VISION ANALYSIS DATA:
- Detected Text: ${JSON.stringify(visionData?.text || [])}
- Layout Structure: ${JSON.stringify(visionData?.layout || {})}
- Colors: ${JSON.stringify(visionData?.imageProperties?.dominantColors || [])}

EXISTING UX ANALYSIS:
${JSON.stringify(claudeInsights)}

TASK:
1. Identify 3-5 SPECIFIC UX PROBLEMS that prevent this design from achieving its goals
2. For each problem, explain:
   - What's wrong and why it matters
   - How it impacts the primary business goal
   - Which UX principle or user psychology it violates

3. Create 3 DIFFERENT SOLUTION APPROACHES:
   
   CONSERVATIVE (Quick Wins):
   - Minimal changes that can be implemented fast
   - Focus on highest-impact, lowest-effort improvements
   - Keep existing structure mostly intact
   
   BALANCED (Best Practices):
   - Apply modern UX patterns and principles
   - Restructure as needed for clarity
   - Balance user needs with business goals
   
   INNOVATIVE (Cutting Edge):
   - Bold, creative solutions
   - Latest design trends and interactions
   - Maximize engagement and delight

For each approach include:
- approach: "conservative" | "balanced" | "innovative"
- name: Short descriptive name
- description: What this approach does
- keyChanges: Array of specific changes to make
- expectedImpact: Object with metric improvements
- implementationGuidance: Detailed steps
- realExamples: Companies using similar approaches

Return as JSON:
{
  "problems": [
    {
      "id": "string",
      "title": "string", 
      "description": "string",
      "severity": "high" | "medium" | "low",
      "businessImpact": "string",
      "uxPrinciple": "string"
    }
  ],
  "solutions": [
    {
      "approach": "conservative" | "balanced" | "innovative",
      "name": "string",
      "description": "string", 
      "keyChanges": ["string"],
      "expectedImpact": {
        "conversionRate": "string",
        "engagement": "string",
        "satisfaction": "string"
      },
      "implementationGuidance": {
        "steps": ["string"],
        "effort": "low" | "medium" | "high",
        "timeline": "string"
      },
      "realExamples": ["string"]
    }
  ],
  "visionInsights": {
    "layoutAnalysis": "string",
    "colorPsychology": "string",
    "textHierarchy": "string"
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

  if (existing) {
    console.log(`✅ Prototype already exists for ${solution.approach}`);
    return existing;
  }

  console.log(`🎨 Generating new ${solution.approach} prototype...`);

  // Generate new prototype code
  const prototypePrompt = buildPrototypePrompt(solution, analysisData, contextData, holisticAnalysis);
  const code = await callClaude(prototypePrompt, anthropicKey);

  const { data: prototype, error } = await supabase
    .from('figmant_holistic_prototypes')
    .insert({
      analysis_id: analysisData.id,
      solution_type: solution.approach,
      title: solution.name,
      description: solution.description,
      component_code: code,
      key_changes: solution.keyChanges || [],
      expected_impact: solution.expectedImpact || {},
      generation_metadata: {
        contextUsed: !!contextData,
        problemsSolved: holisticAnalysis.identified_problems.map(p => p.id),
        generatedAt: new Date().toISOString()
      }
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save prototype: ${error.message}`);
  }

  console.log(`✅ ${solution.approach} prototype generated and saved`);
  return prototype;
}

function buildPrototypePrompt(solution: any, analysisData: any, contextData: any, holisticAnalysis: any) {
  const extractedContent = extractContentFromAnalysis(analysisData);
  
  return `You are creating a COMPLETE React component that implements the ${solution.approach} solution approach.

PROBLEMS TO SOLVE:
${holisticAnalysis.identified_problems.map(p => `- ${p.description} (${p.severity})`).join('\\n')}

SOLUTION: ${solution.name}
${solution.description}

KEY CHANGES:
${solution.keyChanges?.map(c => `- ${c}`).join('\\n')}

EXTRACTED CONTENT TO USE:
${JSON.stringify(extractedContent, null, 2)}

IMPLEMENTATION GUIDANCE:
${JSON.stringify(solution.implementationGuidance)}

BUSINESS CONTEXT:
${contextData ? `
- Business Type: ${contextData.business_type}
- Primary Goal: ${contextData.primary_goal}
- Target Audience: ${contextData.target_audience}
- Brand Colors: ${contextData.brand_guidelines?.colors}
- Brand Tone: ${contextData.brand_guidelines?.tone}
` : 'No specific context - create a modern, accessible design'}

Create a production-ready React component that:
1. Solves all identified problems using this approach
2. Incorporates all extracted content appropriately  
3. Includes all necessary states and interactions
4. Has proper error handling and loading states
5. Is fully accessible (ARIA labels, keyboard navigation)
6. Uses only Tailwind CSS classes with semantic color tokens
7. Includes helpful comments explaining design decisions
8. Uses modern React patterns (hooks, functional components)
9. Is responsive and mobile-friendly
10. Reflects the business context and brand guidelines

Start the component with a comment block listing the problems this solves.
Generate ONLY the React component code starting with:

// Problems this prototype solves:
// - [list problems]

function EnhancedDesign() {`;
}

async function callClaude(prompt: string, apiKey: string) {
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
    throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  // Try to parse as JSON for analysis, or return as string for code
  try {
    return JSON.parse(content);
  } catch {
    // Extract code from markdown if present
    const codeMatch = content.match(/```(?:jsx?|tsx?)?\n([\s\S]*?)\n```/);
    return codeMatch ? codeMatch[1] : content;
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
  const buttonPatterns = ['Get Started', 'Sign Up', 'Learn More', 'Try', 'Start', 'Continue', 'Next', 'Submit', 'Buy', 'Purchase'];
  return texts.filter(text => 
    buttonPatterns.some(pattern => text.toLowerCase().includes(pattern.toLowerCase()))
  );
}

function extractHeadings(texts: string[]) {
  return texts.filter(text => text.length > 5 && text.length < 100 && !text.includes('   '));
}