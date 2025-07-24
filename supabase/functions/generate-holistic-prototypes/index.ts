
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
      .order('created_at', { ascending: false })
      .limit(1);

    if (analysisError) {
      console.error('❌ Error checking for existing analysis:', analysisError);
      throw new Error(`Database error: ${analysisError.message}`);
    }

    let holisticAnalysis = existingAnalysis && existingAnalysis.length > 0 ? existingAnalysis[0] : null;

    if (existingAnalysis && existingAnalysis.length > 1) {
      console.warn(`⚠️ Found ${existingAnalysis.length} analyses for analysis_id ${analysisId}. Using most recent.`);
    }

    // Generate holistic analysis if it doesn't exist
    if (!holisticAnalysis) {
      console.log('🔍 No existing analysis found, generating new holistic analysis...');
      const analysisResponse = await generateHolisticAnalysis(analysisData, contextData, anthropicKey);
      
      console.log('💾 Storing holistic analysis in database with conflict handling...');
      const { data: newAnalysis, error: insertError } = await supabase
        .from('figmant_holistic_analyses')
        .upsert({
          analysis_id: analysisId,
          identified_problems: analysisResponse.problems,
          solution_approaches: analysisResponse.solutions,
          vision_insights: analysisResponse.visionInsights
        }, {
          onConflict: 'analysis_id',
          ignoreDuplicates: false
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

function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

function truncateText(text: string, maxTokens: number): string {
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) return text;
  
  // Try to truncate at sentence boundaries
  const truncated = text.substring(0, maxChars);
  const lastSentence = truncated.lastIndexOf('.');
  if (lastSentence > maxChars * 0.7) {
    return text.substring(0, lastSentence + 1) + ' [truncated]';
  }
  
  return truncated + '... [truncated]';
}

function optimizeVisionData(visionSummary: any): any {
  if (!visionSummary || typeof visionSummary !== 'object') {
    return { summary: 'No vision data available' };
  }

  // Extract only the most relevant vision data
  const optimized: any = {};
  
  // Get key text elements (limit to most important)
  if (visionSummary.vision_results?.text) {
    const texts = Array.isArray(visionSummary.vision_results.text) 
      ? visionSummary.vision_results.text 
      : [];
    optimized.keyTexts = texts
      .slice(0, 10) // Limit to first 10 text elements
      .filter((text: string) => text && text.length > 2)
      .map((text: string) => text.length > 100 ? text.substring(0, 100) + '...' : text);
  }

  // Get color information (simplified)
  if (visionSummary.vision_results?.imageProperties?.dominantColors) {
    optimized.dominantColors = visionSummary.vision_results.imageProperties.dominantColors
      .slice(0, 3) // Only top 3 colors
      .map((color: any) => ({
        color: color.color,
        score: color.score
      }));
  }

  // Get detected objects (limit and summarize)
  if (visionSummary.vision_results?.objects) {
    optimized.detectedObjects = visionSummary.vision_results.objects
      .slice(0, 5) // Only top 5 objects
      .map((obj: any) => obj.name);
  }

  // Screen type
  if (visionSummary.screen_type_detected) {
    optimized.screenType = visionSummary.screen_type_detected;
  }

  return optimized;
}

function optimizeClaudeAnalysis(claudeAnalysis: any): any {
  if (!claudeAnalysis || typeof claudeAnalysis !== 'object') {
    return { summary: 'No Claude analysis available' };
  }

  const optimized: any = {};

  // Extract key issues (limit and summarize)
  if (claudeAnalysis.issues) {
    optimized.keyIssues = Array.isArray(claudeAnalysis.issues)
      ? claudeAnalysis.issues.slice(0, 5).map((issue: any) => ({
          severity: issue.severity || 'medium',
          category: issue.category || 'general',
          description: issue.description ? truncateText(issue.description, 50) : 'Issue description not available'
        }))
      : [];
  }

  // Extract top recommendations
  if (claudeAnalysis.top_recommendations) {
    optimized.topRecommendations = Array.isArray(claudeAnalysis.top_recommendations)
      ? claudeAnalysis.top_recommendations.slice(0, 3).map((rec: any) => 
          typeof rec === 'string' ? truncateText(rec, 30) : truncateText(rec.description || '', 30)
        )
      : [];
  }

  // Overall score
  if (claudeAnalysis.overall_score) {
    optimized.overallScore = claudeAnalysis.overall_score;
  }

  // Screen information
  if (claudeAnalysis.screen_name) {
    optimized.screenName = claudeAnalysis.screen_name;
  }

  return optimized;
}

function buildHolisticAnalysisPrompt(analysisData: any, contextData: any): string {
  const claudeAnalysis = analysisData.claude_analysis || {};
  const visionSummary = analysisData.google_vision_summary || {};
  
  // Optimize data to reduce token usage
  const optimizedVision = optimizeVisionData(visionSummary);
  const optimizedClaude = optimizeClaudeAnalysis(claudeAnalysis);
  
  console.log('📝 Building analysis prompt with optimized data');
  console.log(`📊 Optimized Claude analysis keys: ${Object.keys(optimizedClaude).join(', ')}`);
  console.log(`👁️ Optimized vision data keys: ${Object.keys(optimizedVision).join(', ')}`);
  
  const prompt = `You are an expert UX strategist providing holistic design analysis.

BUSINESS CONTEXT:
${contextData ? `
- Business Type: ${contextData.business_type}
- Target Audience: ${contextData.target_audience}
- Primary Goal: ${contextData.primary_goal}
- Challenges: ${contextData.specific_challenges?.join(', ')}
- Design Type: ${contextData.design_type}
` : 'No specific context provided - use general UX principles'}

DESIGN ANALYSIS SUMMARY:
- Previous Issues: ${JSON.stringify(optimizedClaude.keyIssues || [])}
- Key Visual Elements: ${JSON.stringify(optimizedVision.keyTexts || [])}
- Dominant Colors: ${JSON.stringify(optimizedVision.dominantColors || [])}
- Screen Type: ${optimizedVision.screenType || analysisData.screen_type_detected || 'unknown'}
- Overall Score: ${optimizedClaude.overallScore || 'not available'}

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

  const tokenEstimate = estimateTokens(prompt);
  console.log(`📊 Prompt token estimate: ${tokenEstimate} tokens`);
  
  // Check if prompt might be too long and truncate if needed
  if (tokenEstimate > 180000) { // Leave buffer for response
    console.warn('⚠️ Prompt may be too long, applying additional truncation');
    // Further reduce the optimized data if needed
    return buildMinimalPrompt(contextData, optimizedClaude, optimizedVision);
  }
  
  return prompt;
}

function buildMinimalPrompt(contextData: any, optimizedClaude: any, optimizedVision: any): string {
  console.log('🔄 Building minimal prompt due to token limits');
  
  return `You are an expert UX strategist providing holistic design analysis.

CONTEXT: ${contextData?.business_type || 'General'} product seeking ${contextData?.primary_goal || 'UX improvements'}

CURRENT STATE:
- Screen: ${optimizedVision.screenType || 'unknown'}
- Issues: ${optimizedClaude.keyIssues?.length || 0} problems identified
- Score: ${optimizedClaude.overallScore || 'N/A'}

TASK: Provide UX analysis in JSON format:

{
  "problems": [
    {
      "id": "problem-1",
      "description": "Specific issue",
      "severity": "high|medium|low",
      "businessImpact": "Impact description"
    }
  ],
  "solutions": [
    {
      "approach": "conservative",
      "name": "Quick Wins",
      "description": "Low-risk improvements",
      "keyChanges": ["Change 1", "Change 2"],
      "expectedImpact": [{"metric": "usability", "improvement": "15%"}],
      "examples": ["Company 1"]
    },
    {
      "approach": "balanced",
      "name": "Modern UX",
      "description": "Balanced redesign",
      "keyChanges": ["Change 1", "Change 2"],
      "expectedImpact": [{"metric": "engagement", "improvement": "25%"}],
      "examples": ["Company 2"]
    },
    {
      "approach": "innovative",
      "name": "Advanced UX",
      "description": "Cutting-edge design",
      "keyChanges": ["Change 1", "Change 2"],
      "expectedImpact": [{"metric": "satisfaction", "improvement": "40%"}],
      "examples": ["Company 3"]
    }
  ],
  "visionInsights": {
    "summary": "Key observations"
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
  const tokenEstimate = estimateTokens(prompt);
  console.log(`🔥 Calling Claude API with prompt length: ${prompt.length} characters (~${tokenEstimate} tokens)`);
  
  // Check token limit before making API call
  if (tokenEstimate > 190000) { // Leave buffer for response
    console.error(`❌ Prompt too long: ${tokenEstimate} tokens exceeds safe limit`);
    throw new Error(`Prompt too long: ${tokenEstimate} tokens exceeds Claude's 200K limit`);
  }
  
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
        max_tokens: 8000, // Increased for better responses
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
      
      // Handle specific token limit errors
      if (errorData.includes('prompt is too long') || errorData.includes('token')) {
        throw new Error(`Token limit exceeded: ${errorData}`);
      }
      
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
    
    // Enhanced error handling for token limits
    if (error.message.includes('token') || error.message.includes('too long')) {
      console.error('💡 Suggestion: Try reducing vision data or using chunking approach');
    }
    
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
