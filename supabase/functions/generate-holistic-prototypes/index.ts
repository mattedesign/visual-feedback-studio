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
      console.log('📊 Analysis data available:', {
        hasVisionData: !!analysisData.google_vision_summary,
        hasClaudeAnalysis: !!analysisData.claude_analysis,
        hasContext: !!contextData,
        contextType: contextData?.business_type || 'none',
        visionTextCount: analysisData.google_vision_summary?.vision_results?.text?.length || 0
      });
      
      const analysisPrompt = buildHolisticAnalysisPrompt(analysisData, contextData);
      console.log('📝 Prompt length:', analysisPrompt.length);
      console.log('📋 Prompt preview:', analysisPrompt.substring(0, 500) + '...');
      
      const analysisResponse = await callClaude(analysisPrompt, anthropicKey);
      
      console.log('📊 Analysis response structure:', {
        hasProblems: !!analysisResponse?.problems,
        hasSolutions: !!analysisResponse?.solutions,
        hasVisionInsights: !!analysisResponse?.visionInsights,
        problemsCount: analysisResponse?.problems?.length || 0,
        solutionsCount: analysisResponse?.solutions?.length || 0,
        responseType: typeof analysisResponse,
        responseKeys: analysisResponse ? Object.keys(analysisResponse) : []
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
      console.log('🔥 Starting prototype generation for type:', solutionType);
      const solution = (holisticAnalysis.solution_approaches || []).find(s => s.approach === solutionType);
      if (!solution) {
        console.error('❌ Solution type not found:', { solutionType, availableSolutions: (holisticAnalysis.solution_approaches || []).map(s => s.approach) });
        throw new Error(`Solution type '${solutionType}' not found in analysis`);
      }
      console.log('🎯 Found solution:', solution);
      
      try {
        const prototype = await generatePrototype(solution, analysisData, contextData, holisticAnalysis, supabase, anthropicKey);
        console.log('✅ Prototype generated successfully:', prototype?.id);
        
        return new Response(
          JSON.stringify({ success: true, prototype }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (prototypeError) {
        console.error('💥 Error in prototype generation:', prototypeError);
        console.error('💥 Prototype error stack:', prototypeError.stack);
        throw prototypeError;
      }
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
- Detected Text: ${JSON.stringify(visionData?.text || [])}
- Layout Structure: ${JSON.stringify(visionData?.layout || {})}
- Colors: ${JSON.stringify(visionData?.imageProperties?.dominantColors || [])}
- Detected Objects: ${JSON.stringify(visionData?.objects || [])}
- Safe Search: ${JSON.stringify(visionData?.safeSearch || {})}

EXISTING UX ANALYSIS:
${JSON.stringify(claudeInsights || {})}

TASK:
1. Identify 3-5 SPECIFIC UX PROBLEMS that prevent this design from achieving its goals
2. For each problem, provide:
   - id: A unique identifier (e.g., "problem-1", "problem-2")
   - description: What's wrong and why it matters
   - severity: "critical" | "high" | "medium" | "low"
   - impact: How it affects the primary business goal
   - principle: Which UX principle or user psychology it violates
   - location: Where in the design this occurs (if applicable)

3. Create 3 DIFFERENT SOLUTION APPROACHES:
   
   CONSERVATIVE (Quick Wins):
   - approach: "conservative"
   - name: "Quick UX Improvements"
   - description: Minimal changes for immediate impact
   - keyChanges: Array of 3-5 specific changes
   - expectedImpact: Measurable improvements expected
   - examples: Companies using similar approaches
   - implementationGuidance: Step-by-step guidance
   
   BALANCED (Best Practices):
   - approach: "balanced"
   - name: "Modern UX Redesign"
   - description: Apply current best practices
   - keyChanges: Array of 4-6 specific changes
   - expectedImpact: Significant improvements expected
   - examples: Companies using similar approaches
   - implementationGuidance: Step-by-step guidance
   
   INNOVATIVE (Cutting Edge):
   - approach: "innovative"
   - name: "Next-Gen Experience"
   - description: Bold, creative solutions
   - keyChanges: Array of 5-7 specific changes
   - expectedImpact: Transformative improvements expected
   - examples: Companies using similar approaches
   - implementationGuidance: Step-by-step guidance

Return ONLY valid JSON in this exact structure:
{
  "problems": [
    {
      "id": "string",
      "description": "string",
      "severity": "critical|high|medium|low",
      "impact": "string",
      "principle": "string",
      "location": "string (optional)"
    }
  ],
  "solutions": [
    {
      "approach": "conservative|balanced|innovative",
      "name": "string",
      "description": "string",
      "keyChanges": ["string"],
      "expectedImpact": "string",
      "examples": ["string"],
      "implementationGuidance": "string"
    }
  ],
  "visionInsights": {
    "dominantElements": ["string"],
    "colorPsychology": "string",
    "layoutEffectiveness": "string"
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
  console.log('🔄 Calling Claude for prototype generation...');
  const code = await callClaude(prototypePrompt, anthropicKey);
  console.log('📝 Raw Claude response received:', typeof code, code.substring(0, 200) + '...');
  
  // Clean the code to ensure it's just the function
  let cleanedCode = code;
  
  // Remove any markdown code blocks if present
  if (code.includes('```')) {
    const match = code.match(/```(?:jsx?|javascript|tsx?)?\n?([\s\S]*?)\n?```/);
    if (match) {
      cleanedCode = match[1];
      console.log('✂️ Extracted code from markdown blocks');
    }
  }
  
  // Ensure the code starts with function declaration
  if (!cleanedCode.trim().startsWith('function')) {
    console.error('⚠️ Generated code does not start with function declaration:', cleanedCode.substring(0, 100));
    // Try to extract function if it's wrapped in other content
    const functionMatch = cleanedCode.match(/function\s+EnhancedDesign\s*\(\s*\)\s*{[\s\S]*}/);
    if (functionMatch) {
      cleanedCode = functionMatch[0];
      console.log('✂️ Extracted function from wrapped content');
    } else {
      console.error('🚨 Could not find valid function in Claude response');
      console.error('📄 Full response preview:', code.substring(0, 500));
      cleanedCode = generateSafeFallbackComponent();
    }
  }
  
  console.log('🧹 Final cleaned code length:', cleanedCode.length);
  console.log('🔍 Code starts with:', cleanedCode.substring(0, 100));

  // Fix quote issues that could cause syntax errors
  cleanedCode = fixQuoteIssues(cleanedCode);

  // Only do basic validation now - don't use cleanAndValidateCode which is too strict
  if (!cleanedCode.includes('function EnhancedDesign')) {
    console.error('🚨 No EnhancedDesign function found, using fallback');
    cleanedCode = generateSafeFallbackComponent();
  } else if (!cleanedCode.includes('return') || !cleanedCode.includes('<')) {
    console.error('🚨 No JSX return found, using fallback');
    cleanedCode = generateSafeFallbackComponent();
  } else {
    console.log('✅ Basic validation passed - function and JSX detected');
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
10. CRITICAL: Always use DOUBLE QUOTES for strings containing apostrophes (e.g., "Let's go" not 'Let's go')
11. CRITICAL: Escape special characters properly in strings
12. Use consistent quote style: double quotes for strings, single quotes for JSX attributes when possible

QUOTE HANDLING EXAMPLES:
✅ CORRECT: const message = "Let's get started with this amazing feature";
❌ WRONG: const message = 'Let's get started with this amazing feature';
✅ CORRECT: const text = "Don't worry, it's working perfectly";
❌ WRONG: const text = 'Don't worry, it's working perfectly';
✅ CORRECT: <button onClick={() => setMessage("It's ready!")}>Click me</button>
❌ WRONG: <button onClick={() => setMessage('It's ready!')}>Click me</button>

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
      model: 'claude-3-5-sonnet-20241022', // Use the most reliable model for code generation
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

function fixQuoteIssues(code: string): string {
  console.log('🔧 Fixing quote issues in generated code...');
  
  try {
    // Fix common quote issues that cause syntax errors
    let fixedCode = code;
    
    // Find single-quoted strings that contain apostrophes
    // Pattern: 'text with apostrophe like don't or let's'
    const singleQuotePattern = /'([^']*[''][^']*)+'/g;
    
    fixedCode = fixedCode.replace(singleQuotePattern, (match) => {
      // Convert single quotes to double quotes for strings containing apostrophes
      const content = match.slice(1, -1); // Remove outer quotes
      console.log('🔄 Converting problematic quotes:', match, '→', `"${content}"`);
      return `"${content}"`;
    });
    
    // Also handle common cases directly
    const commonProblems = [
      { from: "'Let's", to: '"Let\'s' },
      { from: "'Don't", to: '"Don\'t' },
      { from: "'Won't", to: '"Won\'t' },
      { from: "'Can't", to: '"Can\'t' },
      { from: "'I'm", to: '"I\'m' },
      { from: "'We're", to: '"We\'re' },
      { from: "'You're", to: '"You\'re' },
      { from: "'It's", to: '"It\'s' },
      { from: "'That's", to: '"That\'s' },
      { from: "'Here's", to: '"Here\'s' },
      { from: "'There's", to: '"There\'s' },
    ];
    
    commonProblems.forEach(({ from, to }) => {
      if (fixedCode.includes(from)) {
        console.log('🔄 Fixing common quote issue:', from, '→', to);
        fixedCode = fixedCode.replace(new RegExp(from, 'g'), to);
      }
    });
    
    console.log('✅ Quote issues fixed');
    return fixedCode;
    
  } catch (error) {
    console.error('🚨 Error fixing quotes, returning original:', error);
    return code;
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
