
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Request {
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
    console.log('🎯 Starting holistic prototype generation');
    
    const { analysisId, contextId, generateAll = false, solutionType } = await req.json();
    
    if (!analysisId) {
      console.error('❌ Missing analysisId in request');
      throw new Error('Analysis ID is required');
    }

    console.log(`📋 Request details: analysisId=${analysisId}, contextId=${contextId}, generateAll=${generateAll}, solutionType=${solutionType}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!anthropicKey) {
      console.error('❌ Anthropic API key not configured');
      throw new Error('Anthropic API key not configured');
    }

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase configuration missing');
      throw new Error('Supabase configuration missing');
    }

    console.log('✅ All environment variables configured');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch analysis data with enhanced error handling
    console.log('📊 Fetching analysis and context data...');
    const [analysisResult, contextResult] = await Promise.all([
      supabase.from('figmant_analysis_results').select('*').eq('id', analysisId).single(),
      contextId ? supabase.from('figmant_user_contexts').select('*').eq('id', contextId).single() : { data: null }
    ]);

    if (analysisResult.error) {
      console.error('❌ Failed to fetch analysis:', analysisResult.error);
      throw new Error(`Failed to fetch analysis: ${analysisResult.error.message}`);
    }

    console.log('✅ Analysis data fetched successfully');
    console.log(`📊 Analysis data summary: session_id=${analysisResult.data?.session_id}, claude_analysis exists=${!!analysisResult.data?.claude_analysis}`);

    const analysisData = analysisResult.data;
    const contextData = contextResult.data;

    if (contextData) {
      console.log(`✅ Context data fetched: business_type=${contextData.business_type}, primary_goal=${contextData.primary_goal}`);
    } else {
      console.log('ℹ️ No context data provided');
    }

    // Check if holistic analysis already exists
    console.log('🔍 Checking for existing holistic analysis...');
    const { data: existingAnalysis, error: analysisError } = await supabase
      .from('figmant_holistic_analyses')
      .select('*')
      .eq('analysis_id', analysisId)
      .single();

    if (analysisError && analysisError.code !== 'PGRST116') {
      console.error('❌ Error checking for existing analysis:', analysisError);
      throw new Error(`Database error: ${analysisError.message}`);
    }

    let holisticAnalysis = existingAnalysis;

    // Generate holistic analysis if it doesn't exist
    if (!holisticAnalysis) {
      console.log('🔍 No existing analysis found, generating new holistic analysis...');
      const analysisResponse = await generateHolisticAnalysis(analysisData, contextData, anthropicKey);
      
      console.log('💾 Storing holistic analysis in database...');
      const { data: newAnalysis, error: insertError } = await supabase
        .from('figmant_holistic_analyses')
        .insert({
          analysis_id: analysisId,
          identified_problems: analysisResponse.problems,
          solution_approaches: analysisResponse.solutions,
          vision_insights: analysisResponse.visionInsights
        })
        .select()
        .single();
        
      if (insertError) {
        console.error('❌ Failed to store analysis:', insertError);
        throw new Error(`Failed to store analysis: ${insertError.message}`);
      }
      
      console.log('✅ Holistic analysis stored successfully');
      holisticAnalysis = newAnalysis;
    } else {
      console.log('✅ Found existing holistic analysis');
    }

    console.log(`📊 Analysis summary: ${holisticAnalysis.identified_problems?.length || 0} problems, ${holisticAnalysis.solution_approaches?.length || 0} solutions`);

    // Generate prototypes based on request type
    if (generateAll) {
      console.log('🎨 Generating all prototypes...');
      const results = await Promise.all(
        holisticAnalysis.solution_approaches.map(solution => 
          generatePrototype(solution, analysisData, contextData, holisticAnalysis, supabase, anthropicKey)
        )
      );
      
      console.log(`✅ Generated ${results.length} prototypes successfully`);
      return new Response(
        JSON.stringify({ success: true, prototypes: results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (solutionType) {
      console.log(`🎨 Generating ${solutionType} prototype...`);
      const solution = holisticAnalysis.solution_approaches.find(s => s.approach === solutionType);
      if (!solution) {
        console.error(`❌ Solution type ${solutionType} not found in approaches`);
        throw new Error(`Solution type ${solutionType} not found`);
      }
      
      const prototype = await generatePrototype(solution, analysisData, contextData, holisticAnalysis, supabase, anthropicKey);
      
      console.log('✅ Single prototype generated successfully');
      return new Response(
        JSON.stringify({ success: true, prototype }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Returning holistic analysis only');
    return new Response(
      JSON.stringify({ success: true, analysis: holisticAnalysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Holistic prototype generation failed:', error);
    console.error('❌ Error stack:', error.stack);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateHolisticAnalysis(analysisData: any, contextData: any, anthropicKey: string) {
  console.log('🔍 Building holistic analysis prompt...');
  const prompt = buildHolisticAnalysisPrompt(analysisData, contextData);
  console.log(`📝 Prompt built: ${prompt.length} characters`);
  
  try {
    console.log('🔥 Making Claude API call for analysis...');
    const response = await callClaudeAPI(prompt, anthropicKey);
    console.log('📊 Parsing analysis response...');
    const parsed = parseAnalysisResponse(response);
    console.log('✅ Analysis generated successfully');
    console.log(`📊 Parsed analysis: ${parsed.problems?.length || 0} problems, ${parsed.solutions?.length || 0} solutions`);
    return parsed;
  } catch (error) {
    console.error('❌ Analysis generation failed:', error);
    // Return fallback analysis
    console.log('🔄 Using fallback analysis structure');
    return {
      problems: [
        {
          id: 'fallback-1',
          description: 'UX analysis could not be completed - manual review needed',
          severity: 'medium',
          businessImpact: 'Requires manual review to identify specific issues'
        }
      ],
      solutions: [
        {
          approach: 'conservative',
          name: 'Basic UX Improvements',
          description: 'Apply standard UX patterns and best practices',
          keyChanges: ['Improve visual hierarchy', 'Enhance accessibility', 'Optimize navigation'],
          expectedImpact: [{ metric: 'usability', improvement: '20%' }]
        },
        {
          approach: 'balanced',
          name: 'Modern UX Redesign',
          description: 'Implement contemporary design patterns with user-centered approach',
          keyChanges: ['Responsive design', 'Consistent typography', 'Accessible components'],
          expectedImpact: [{ metric: 'engagement', improvement: '30%' }]
        },
        {
          approach: 'innovative',
          name: 'Advanced User Experience',
          description: 'Cutting-edge design with focus on user delight',
          keyChanges: ['Interactive elements', 'Micro-animations', 'Progressive enhancement'],
          expectedImpact: [{ metric: 'satisfaction', improvement: '45%' }]
        }
      ],
      visionInsights: {
        summary: 'Fallback analysis - specific insights require successful API processing'
      }
    };
  }
}

function buildHolisticAnalysisPrompt(analysisData: any, contextData: any): string {
  const claudeAnalysis = analysisData.claude_analysis || {};
  const visionSummary = analysisData.google_vision_summary || {};
  
  console.log('📝 Building analysis prompt with context data');
  console.log(`📊 Claude analysis keys: ${Object.keys(claudeAnalysis).join(', ')}`);
  console.log(`👁️ Vision summary keys: ${Object.keys(visionSummary).join(', ')}`);
  
  return `You are an expert UX strategist providing holistic design analysis.

BUSINESS CONTEXT:
${contextData ? `
- Business Type: ${contextData.business_type}
- Target Audience: ${contextData.target_audience}
- Primary Goal: ${contextData.primary_goal}
- Challenges: ${contextData.specific_challenges?.join(', ')}
- Design Type: ${contextData.design_type}
` : 'No specific context provided - use general UX principles'}

DESIGN ANALYSIS:
- Issues Found: ${JSON.stringify(claudeAnalysis.issues || [])}
- Vision Data: ${JSON.stringify(visionSummary)}
- Screen Type: ${analysisData.screen_type_detected || 'unknown'}

TASK: Analyze this design and provide:

1. IDENTIFIED PROBLEMS (3-5 specific issues):
   - Each with id, description, severity (high/medium/low), businessImpact

2. SOLUTION APPROACHES (exactly 3):
   - conservative: Quick wins, minimal changes, low risk
   - balanced: Modern UX patterns, balanced effort and impact
   - innovative: Cutting-edge solutions, high impact potential

3. VISION INSIGHTS: Key observations from visual analysis

CRITICAL: Return ONLY valid JSON in this exact format:
{
  "problems": [
    {
      "id": "problem-1",
      "description": "Specific UX issue description",
      "severity": "high|medium|low",
      "businessImpact": "How this affects business goals"
    }
  ],
  "solutions": [
    {
      "approach": "conservative",
      "name": "Solution Name",
      "description": "What this approach does",
      "keyChanges": ["Change 1", "Change 2"],
      "expectedImpact": [{"metric": "conversion", "improvement": "15%"}],
      "examples": ["Company 1", "Company 2"]
    }
  ],
  "visionInsights": {
    "summary": "Key visual insights"
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
  console.log(`🎨 Generating ${solution.approach} prototype`);
  
  // Check if prototype already exists
  console.log('🔍 Checking for existing prototype...');
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

  try {
    console.log('🔧 Building prototype prompt...');
    const prototypePrompt = buildEnhancedPrototypePrompt(solution, analysisData, contextData, holisticAnalysis);
    console.log(`📝 Prototype prompt built: ${prototypePrompt.length} characters`);
    
    console.log('🔥 Making Claude API call for prototype generation...');
    const code = await callClaudeAPI(prototypePrompt, anthropicKey);
    console.log(`📝 Received code response: ${code.length} characters`);
    
    console.log('🧹 Sanitizing generated code...');
    const sanitizedCode = sanitizeGeneratedCode(code);
    console.log(`✅ Code sanitized: ${sanitizedCode.length} characters`);

    console.log('💾 Storing prototype in database...');
    const { data: prototype, error } = await supabase
      .from('figmant_holistic_prototypes')
      .insert({
        analysis_id: analysisData.id,
        solution_type: solution.approach,
        title: solution.name,
        description: solution.description,
        component_code: sanitizedCode,
        key_changes: solution.keyChanges,
        expected_impact: solution.expectedImpact,
        generation_metadata: {
          contextUsed: !!contextData,
          problemsSolved: holisticAnalysis.problems?.map(p => p.id) || [],
          generatedAt: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ Failed to store prototype:`, error);
      throw new Error(`Failed to store prototype: ${error.message}`);
    }

    console.log(`✅ Prototype generated successfully: ${prototype.id}`);
    return prototype;

  } catch (error) {
    console.error(`❌ Failed to generate ${solution.approach} prototype:`, error);
    
    // Return fallback prototype with basic structure
    console.log('🔄 Generating fallback prototype...');
    const fallbackCode = generateFallbackComponent(solution);
    
    const { data: prototype } = await supabase
      .from('figmant_holistic_prototypes')
      .insert({
        analysis_id: analysisData.id,
        solution_type: solution.approach,
        title: `${solution.name} (Fallback)`,
        description: solution.description,
        component_code: fallbackCode,
        key_changes: solution.keyChanges || [],
        expected_impact: solution.expectedImpact || {},
        generation_metadata: {
          fallback: true,
          error: error.message,
          generatedAt: new Date().toISOString()
        }
      })
      .select()
      .single();

    console.log(`✅ Fallback prototype created: ${prototype?.id}`);
    return prototype;
  }
}

function buildEnhancedPrototypePrompt(solution: any, analysisData: any, contextData: any, holisticAnalysis: any): string {
  return `You are a senior React developer creating a production-ready component.

SOLUTION: ${solution.name}
APPROACH: ${solution.approach}
DESCRIPTION: ${solution.description}

PROBLEMS TO SOLVE:
${holisticAnalysis.problems?.map(p => `- ${p.description}`).join('\n') || 'General UX improvements'}

KEY CHANGES TO IMPLEMENT:
${solution.keyChanges?.map(c => `- ${c}`).join('\n') || 'Standard improvements'}

CRITICAL REQUIREMENTS:
1. Generate ONLY React component code - no explanations
2. Use function syntax: function EnhancedDesign() { ... }
3. Use React hooks (useState, useEffect) as needed
4. Use Tailwind CSS classes for styling
5. Make it responsive and accessible
6. Include realistic content and interactions
7. NO import statements - they're handled by runtime
8. Must be syntactically correct JSX

EXAMPLE STRUCTURE:
function EnhancedDesign() {
  const [state, setState] = useState(defaultValue);
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Enhanced Design</h1>
      {/* Your enhanced component here */}
    </div>
  );
}

Generate the complete component now:`;
}

function sanitizeGeneratedCode(code: string): string {
  console.log('🧹 Sanitizing generated code...');
  
  try {
    // Remove markdown code blocks
    let cleanCode = code.replace(/```(?:jsx?|tsx?)?\n?/g, '').replace(/```\n?$/g, '').trim();
    
    // Remove any leading/trailing explanatory text
    const functionMatch = cleanCode.match(/(function\s+\w+.*?\{[\s\S]*\})\s*$/);
    if (functionMatch) {
      cleanCode = functionMatch[1];
    }
    
    // Basic JSX syntax validation
    if (!cleanCode.includes('function') || !cleanCode.includes('return')) {
      throw new Error('Invalid component structure');
    }
    
    // Normalize whitespace and line endings
    cleanCode = cleanCode.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Fix common JSX issues
    cleanCode = cleanCode.replace(/class=/g, 'className=');
    cleanCode = cleanCode.replace(/for=/g, 'htmlFor=');
    
    // Remove potentially problematic Unicode characters
    cleanCode = cleanCode.replace(/[""'']/g, '"').replace(/[–—]/g, '-');
    
    console.log(`✅ Code sanitization complete`);
    console.log(`🔍 Code starts with: ${cleanCode.substring(0, 100)}...`);
    
    return cleanCode;
    
  } catch (error) {
    console.error('❌ Code sanitization failed:', error);
    throw new Error(`Code sanitization failed: ${error.message}`);
  }
}

function generateFallbackComponent(solution: any): string {
  console.log(`🔄 Generating fallback component for ${solution.approach}`);
  return `function EnhancedDesign() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ${solution.name || 'Enhanced Design'}
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          ${solution.description || 'Improved user experience design'}
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">
            Key Improvements
          </h2>
          <ul className="text-left text-blue-800 space-y-2">
            ${solution.keyChanges?.map(change => `<li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              ${change}
            </li>`).join('\n            ') || '<li>Standard UX improvements applied</li>'}
          </ul>
        </div>
        {isLoaded && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">
              Component loaded successfully. This is a fallback implementation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}`;
}

async function callClaudeAPI(prompt: string, apiKey: string): Promise<string> {
  console.log(`🔥 Calling Claude API with prompt length: ${prompt.length}`);
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    console.log(`🌐 Claude API responded with status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ Claude API error: ${response.status} - ${errorData}`);
      throw new Error(`Claude API error: ${response.status} - ${errorData}`);
    }

    console.log('📦 Parsing Claude API response...');
    const data = await response.json();
    const content = data.content[0]?.text || '';
    
    if (!content) {
      console.error('❌ Empty response from Claude API');
      throw new Error('Empty response from Claude API');
    }
    
    console.log(`📝 Claude response received: { hasContent: ${!!content}, contentLength: ${content.length} }`);
    return content;
  } catch (error) {
    console.error('❌ Claude API call failed:', error);
    throw error;
  }
}

function parseAnalysisResponse(content: string): any {
  try {
    // Try direct JSON parsing first
    const parsed = JSON.parse(content);
    console.log('✅ Direct JSON parse successful');
    return parsed;
  } catch {
    console.log('📄 Not JSON, checking for code blocks...');
    
    // Look for JSON in code blocks
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        console.log('✅ Found and parsed JSON from code block');
        return parsed;
      } catch (jsonError) {
        console.log('❌ Failed to parse JSON from code block:', jsonError.message);
      }
    }
    
    // Fallback analysis structure
    console.log('⚠️ Using fallback analysis structure');
    return {
      problems: [
        {
          id: 'parse-fallback-1',
          description: 'Analysis parsing failed - manual review needed',
          severity: 'medium',
          businessImpact: 'Unable to provide specific recommendations'
        }
      ],
      solutions: [
        {
          approach: 'conservative',
          name: 'Standard UX Improvements',
          description: 'Apply common UX best practices',
          keyChanges: ['Improve visual hierarchy', 'Enhance readability', 'Add clear navigation'],
          expectedImpact: [{ metric: 'usability', improvement: '15%' }],
          examples: ['Modern websites', 'Best practices']
        },
        {
          approach: 'balanced',
          name: 'Modern UX Redesign',
          description: 'Comprehensive design system implementation',
          keyChanges: ['Responsive design', 'Consistent typography', 'Accessible components'],
          expectedImpact: [{ metric: 'engagement', improvement: '25%' }],
          examples: ['Design systems', 'UI libraries']
        },
        {
          approach: 'innovative',
          name: 'Advanced User Experience',
          description: 'Cutting-edge interaction patterns',
          keyChanges: ['Interactive elements', 'Micro-animations', 'Progressive enhancement'],
          expectedImpact: [{ metric: 'satisfaction', improvement: '40%' }],
          examples: ['Leading apps', 'Award-winning sites']
        }
      ],
      visionInsights: {
        summary: 'Analysis parsing encountered issues - using standard recommendations'
      }
    };
  }
}
