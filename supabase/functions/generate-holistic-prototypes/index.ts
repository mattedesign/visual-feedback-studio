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
  const code = await callClaude(prototypePrompt, anthropicKey);
  
  // Clean the code to ensure it's just the function
  let cleanedCode = code;
  
  // Remove any markdown code blocks if present
  if (code.includes('```')) {
    const match = code.match(/```(?:jsx?|javascript|tsx?)?\n?([\s\S]*?)\n?```/);
    if (match) {
      cleanedCode = match[1];
    }
  }
  
  // Ensure the code starts with function declaration
  if (!cleanedCode.trim().startsWith('function')) {
    console.error('Generated code does not start with function declaration:', cleanedCode.substring(0, 100));
    // Try to extract function if it's wrapped in other content
    const functionMatch = cleanedCode.match(/function\s+EnhancedDesign\s*\(\s*\)\s*{[\s\S]*}/);
    if (functionMatch) {
      cleanedCode = functionMatch[0];
    }
  }
  
  // Validate the component code
  try {
    // Basic validation - check if it's valid JavaScript
    new Function(cleanedCode);
  } catch (error) {
    console.error('Invalid component code generated:', error);
    throw new Error('Generated component code is invalid');
  }
  
  const { data: prototype, error } = await supabase
    .from('figmant_holistic_prototypes')
    .insert({
      analysis_id: analysisData.id,
      solution_type: solution.approach,
      title: solution.name,
      description: solution.description,
      component_code: cleanedCode,
      key_changes: solution.keyChanges,
      expected_impact: solution.expectedImpact,
      generation_metadata: {
        contextUsed: !!contextData,
        problemsSolved: (holisticAnalysis.identified_problems || []).map((p) => p.id || p.description),
        generatedAt: new Date().toISOString()
      }
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error inserting prototype:', error);
    throw error;
  }
    
  return prototype;
}

function buildPrototypePrompt(solution: any, analysisData: any, contextData: any, holisticAnalysis: any) {
  const extractedContent = extractContentFromAnalysis(analysisData);
  
  return `You are creating a COMPLETE React component that implements the ${solution.approach} solution approach.

PROBLEMS TO SOLVE:
${(holisticAnalysis.identified_problems || []).map((p) => `- ${p.description} (${p.severity})`).join('\n')}

SOLUTION: ${solution.name}
${solution.description}

KEY CHANGES:
${(solution.keyChanges || []).map((c) => `- ${c}`).join('\n')}

EXTRACTED CONTENT TO USE:
${JSON.stringify(extractedContent, null, 2)}

CRITICAL REACT COMPONENT RULES:
1. DO NOT include any import statements
2. DO NOT include export statements
3. Use function declaration syntax: function EnhancedDesign() { ... }
4. React and hooks (useState, useEffect, etc.) are already available globally
5. Use className instead of class for styling
6. Use only Tailwind CSS classes for styling
7. Ensure all JSX elements are properly closed
8. DO NOT use React.createElement directly
9. Return valid JSX from the component

Create a production-ready React component that:
1. Solves all identified problems using this approach
2. Incorporates all extracted content appropriately  
3. Includes all necessary states and interactions
4. Has proper error handling and loading states
5. Is fully accessible (ARIA labels, keyboard navigation)
6. Uses only Tailwind CSS classes
7. Includes helpful comments explaining design decisions

IMPORTANT: Generate ONLY the function body, starting exactly with:
function EnhancedDesign() {
  // Your component logic here
  return (
    <div>
      {/* Your JSX here */}
    </div>
  );
}

DO NOT include any other code outside the function declaration.`;
}

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
      model: 'claude-sonnet-4-20250514', // 🚀 UPGRADED: Latest Claude 4 Sonnet
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

function cleanAndValidateCode(code: string): string {
  console.log('🧹 Cleaning and validating generated code');
  
  try {
    // Basic syntax validation - check for common issues
    const issues = [];
    
    // Check for missing braces
    const openBraces = (code.match(/\{/g) || []).length;
    const closeBraces = (code.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      issues.push(`Mismatched braces: ${openBraces} open, ${closeBraces} close`);
    }
    
    // Check for missing parentheses
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      issues.push(`Mismatched parentheses: ${openParens} open, ${closeParens} close`);
    }
    
    // Check for basic function structure
    if (!code.includes('function EnhancedDesign')) {
      issues.push('Missing EnhancedDesign function');
    }
    
    // Check for valid JSX structure (now we expect JSX)
    if (!code.includes('<') || !code.includes('>')) {
      issues.push('Missing JSX elements');
    }
    
    // Check for import/export statements that shouldn't be there
    if (code.includes('import ') || code.includes('export ')) {
      issues.push('Contains forbidden import/export statements');
    }
    
    if (issues.length > 0) {
      console.error('🚨 Code validation failed:', issues);
      return generateSafeFallbackComponent();
    }
    
    console.log('✅ Code validation passed');
    return code;
    
  } catch (error) {
    console.error('🚨 Code validation error:', error);
    return generateSafeFallbackComponent();
  }
}

function generateSafeFallbackComponent(): string {
  return `function EnhancedDesign() {
  const [isActive, setIsActive] = useState(false);
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Enhanced Design</h1>
        <p className="text-gray-600 mb-6">This is a safe fallback component generated to avoid parsing errors.</p>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => setIsActive(!isActive)}
        >
          {isActive ? 'Active' : 'Click Me'}
        </button>
        {isActive && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            Interactive state is working!
          </div>
        )}
      </div>
    </div>
  );
}`;
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
