import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const { analysisId, contextId, generateAll = false, solutionType }: RequestBody = await req.json();

    console.log(`Processing request: analysisId=${analysisId}, contextId=${contextId}, generateAll=${generateAll}, solutionType=${solutionType}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');

    if (!supabaseUrl || !supabaseKey || !anthropicKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch analysis data
    const { data: analysisData, error: analysisError } = await supabase
      .from('figmant_analysis_results')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (analysisError || !analysisData) {
      throw new Error(`Failed to fetch analysis data: ${analysisError?.message}`);
    }

    // Fetch context data if provided
    let contextData = null;
    if (contextId) {
      const { data: context, error: contextError } = await supabase
        .from('figmant_user_contexts')
        .select('*')
        .eq('id', contextId)
        .single();

      if (contextError) {
        console.warn(`Failed to fetch context data: ${contextError.message}`);
      } else {
        contextData = context;
      }
    }

    // Check if holistic analysis already exists
    const { data: existingAnalysis } = await supabase
      .from('figmant_holistic_analyses')
      .select('*')
      .eq('analysis_id', analysisId)
      .single();

    let holisticAnalysis = existingAnalysis;

    // Generate holistic analysis if it doesn't exist
    if (!holisticAnalysis) {
      console.log('Generating holistic analysis...');
      const analysisPrompt = buildHolisticAnalysisPrompt(analysisData, contextData);
      const analysisResponse = await callClaude(analysisPrompt, anthropicKey);
      
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
        throw new Error(`Failed to store holistic analysis: ${insertError.message}`);
      }
        
      holisticAnalysis = newAnalysis;
      console.log('Holistic analysis stored successfully');
    }

    // Generate prototypes
    if (generateAll) {
      console.log('Generating all prototypes...');
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
      console.log(`Generating ${solutionType} prototype...`);
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

    return new Response(
      JSON.stringify({ success: true, analysis: holisticAnalysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-holistic-prototypes:', error);
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
- Name and description
- Key changes to make
- Expected impact on metrics
- Real companies using similar approaches
- Implementation guidance

Return as JSON:
{
  "problems": [
    {
      "id": "unique_id",
      "description": "problem description",
      "severity": "high|medium|low",
      "businessImpact": "how it affects business goals",
      "uxPrinciple": "which UX principle is violated"
    }
  ],
  "solutions": [
    {
      "approach": "conservative|balanced|innovative",
      "name": "solution name",
      "description": "solution description",
      "keyChanges": ["change 1", "change 2"],
      "expectedImpact": {
        "metric": "improvement description"
      },
      "implementationGuidance": "specific implementation steps",
      "exampleCompanies": ["company1", "company2"]
    }
  ],
  "visionInsights": {
    "summary": "key insights from vision analysis"
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
    console.log(`Prototype for ${solution.approach} already exists`);
    return existing;
  }

  // Generate new prototype
  console.log(`Generating new ${solution.approach} prototype...`);
  const prototypePrompt = buildPrototypePrompt(solution, analysisData, contextData, holisticAnalysis);
  const code = await callClaude(prototypePrompt, anthropicKey);

  const { data: prototype, error: insertError } = await supabase
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
        problemsSolved: holisticAnalysis.identified_problems?.map(p => p.id) || [],
        generatedAt: new Date().toISOString()
      }
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to store prototype: ${insertError.message}`);
  }

  console.log(`${solution.approach} prototype generated and stored successfully`);
  return prototype;
}

function buildPrototypePrompt(solution: any, analysisData: any, contextData: any, holisticAnalysis: any) {
  const extractedContent = extractContentFromAnalysis(analysisData);
  
  return `You are creating a COMPLETE React component that implements the ${solution.approach} solution approach.

PROBLEMS TO SOLVE:
${holisticAnalysis.identified_problems?.map(p => `- ${p.description} (${p.severity})`).join('\\n') || 'No specific problems identified'}

SOLUTION: ${solution.name}
${solution.description}

KEY CHANGES:
${solution.keyChanges?.map(c => `- ${c}`).join('\\n') || 'No specific changes defined'}

EXTRACTED CONTENT TO USE:
${JSON.stringify(extractedContent, null, 2)}

IMPLEMENTATION GUIDANCE:
${solution.implementationGuidance || 'No specific guidance provided'}

Create a production-ready React component that:
1. Solves all identified problems using this approach
2. Incorporates all extracted content appropriately  
3. Includes all necessary states and interactions
4. Has proper error handling and loading states
5. Is fully accessible (ARIA labels, keyboard navigation)
6. Uses only Tailwind CSS classes
7. Includes helpful comments explaining design decisions

Start the component with a comment block listing the problems this solves.
Generate ONLY the React component code starting with: function EnhancedDesign() {`;
}

async function callClaude(prompt: string, apiKey: string) {
  console.log('Calling Claude API...');
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
  const buttonPatterns = ['Get Started', 'Sign Up', 'Learn More', 'Try', 'Start', 'Continue', 'Next'];
  return texts.filter(text => 
    buttonPatterns.some(pattern => text.toLowerCase().includes(pattern.toLowerCase()))
  );
}

function extractHeadings(texts: string[]) {
  return texts.filter(text => text.length > 5 && text.length < 100 && !text.includes('   '));
}