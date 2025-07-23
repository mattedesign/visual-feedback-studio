
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
      throw new Error('Analysis ID is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    
    if (!anthropicKey) {
      throw new Error('Anthropic API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch analysis data with enhanced error handling
    const [analysisResult, contextResult] = await Promise.all([
      supabase.from('figmant_analysis_results').select('*').eq('id', analysisId).single(),
      contextId ? supabase.from('figmant_user_contexts').select('*').eq('id', contextId).single() : { data: null }
    ]);

    if (analysisResult.error) {
      throw new Error(`Failed to fetch analysis: ${analysisResult.error.message}`);
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
      console.log('🔍 Generating holistic analysis...');
      const analysisResponse = await generateHolisticAnalysis(analysisData, contextData, anthropicKey);
      
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
        throw new Error(`Failed to store analysis: ${insertError.message}`);
      }
      
      holisticAnalysis = newAnalysis;
    }

    // Generate prototypes based on request type
    if (generateAll) {
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
      const solution = holisticAnalysis.solution_approaches.find(s => s.approach === solutionType);
      if (!solution) {
        throw new Error(`Solution type ${solutionType} not found`);
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
    console.error('❌ Holistic prototype generation failed:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateHolisticAnalysis(analysisData: any, contextData: any, anthropicKey: string) {
  const prompt = buildHolisticAnalysisPrompt(analysisData, contextData);
  
  try {
    const response = await callClaudeAPI(prompt, anthropicKey);
    return parseAnalysisResponse(response);
  } catch (error) {
    console.error('Analysis generation failed:', error);
    // Return fallback analysis
    return {
      problems: [
        {
          id: 'fallback-1',
          description: 'UX analysis could not be completed',
          severity: 'medium',
          businessImpact: 'Requires manual review'
        }
      ],
      solutions: [
        {
          approach: 'conservative',
          name: 'Basic UX Improvements',
          description: 'Apply standard UX patterns',
          keyChanges: ['Improve visual hierarchy', 'Enhance accessibility'],
          expectedImpact: [{ metric: 'usability', improvement: '20%' }]
        }
      ],
      visionInsights: {}
    };
  }
}

function buildHolisticAnalysisPrompt(analysisData: any, contextData: any): string {
  const claudeAnalysis = analysisData.claude_analysis || {};
  const visionSummary = analysisData.google_vision_summary || {};
  
  return `You are an expert UX strategist providing holistic design analysis.

BUSINESS CONTEXT:
${contextData ? `
- Business Type: ${contextData.business_type}
- Target Audience: ${contextData.target_audience}
- Primary Goal: ${contextData.primary_goal}
- Challenges: ${contextData.specific_challenges?.join(', ')}
` : 'No specific context provided'}

DESIGN ANALYSIS:
- Issues Found: ${JSON.stringify(claudeAnalysis.issues || [])}
- Vision Data: ${JSON.stringify(visionSummary)}

TASK: Analyze this design and provide:

1. IDENTIFIED PROBLEMS (3-5 specific issues):
   - Each with id, description, severity, businessImpact

2. SOLUTION APPROACHES (exactly 3):
   - conservative: Quick wins, minimal changes
   - balanced: Modern UX patterns, balanced effort
   - innovative: Cutting-edge solutions, high impact

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
    const prototypePrompt = buildEnhancedPrototypePrompt(solution, analysisData, contextData, holisticAnalysis);
    const code = await callClaudeAPI(prototypePrompt, anthropicKey);
    const sanitizedCode = sanitizeGeneratedCode(code);

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
      throw new Error(`Failed to store prototype: ${error.message}`);
    }

    console.log(`✅ Prototype generated successfully: ${prototype.id}`);
    return prototype;

  } catch (error) {
    console.error(`❌ Failed to generate ${solution.approach} prototype:`, error);
    
    // Return fallback prototype with basic structure
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
    console.log(`🔍 Code starts with: ${cleanCode.substring(0, 100)}`);
    
    return cleanCode;
    
  } catch (error) {
    console.error('❌ Code sanitization failed:', error);
    throw new Error(`Code sanitization failed: ${error.message}`);
  }
}

function generateFallbackComponent(solution: any): string {
  return `function EnhancedDesign() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ${solution.name}
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          ${solution.description}
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

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text || '';
  
  if (!content) {
    throw new Error('Empty response from Claude API');
  }
  
  console.log(`📝 Claude response received: { hasContent: ${!!content}, contentLength: ${content.length} }`);
  return content;
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
