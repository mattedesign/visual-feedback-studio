
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

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
    const { analysisId, contextId, generateAll = false, solutionType } = await req.json();
    console.log('🎯 Processing request:', { analysisId, contextId, generateAll, solutionType });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all necessary data
    const [analysisResult, contextResult] = await Promise.all([
      supabase.from('figmant_analysis_results').select('*').eq('id', analysisId).single(),
      contextId ? supabase.from('figmant_user_contexts').select('*').eq('id', contextId).single() : { data: null }
    ]);

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
      console.log('📊 Analysis data available:', {
        hasVisionData: !!analysisData.google_vision_summary,
        hasClaudeAnalysis: !!analysisData.claude_analysis,
        hasContext: !!contextData,
        contextType: contextData?.business_type,
        visionTextCount: analysisData.google_vision_summary?.vision_results?.text?.length || 0
      });
      
      console.log('📝 Prompt length:', analysisPrompt.length);
      console.log('📋 Prompt preview:', analysisPrompt.substring(0, 500) + '...');
      
      const analysisResponse = await callClaude(analysisPrompt, anthropicKey);
      console.log('📊 Analysis response structure:', {
        hasProblems: !!analysisResponse.problems,
        hasSolutions: !!analysisResponse.solutions,
        hasVisionInsights: !!analysisResponse.visionInsights,
        problemsCount: analysisResponse.problems?.length || 0,
        solutionsCount: analysisResponse.solutions?.length || 0,
        responseType: typeof analysisResponse,
        responseKeys: Object.keys(analysisResponse)
      });
      
      const { data: newAnalysis } = await supabase
        .from('figmant_holistic_analyses')
        .insert({
          analysis_id: analysisId,
          identified_problems: analysisResponse.problems,
          solution_approaches: analysisResponse.solutions,
          vision_insights: analysisResponse.visionInsights
        })
        .select()
        .single();
        
      holisticAnalysis = newAnalysis;
      console.log('✅ Created new holistic analysis:', holisticAnalysis.id);
    }

    // Generate prototypes
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
      console.log('🔥 Starting prototype generation for type:', solutionType);
      console.log('🎯 Found solution:', solution);
      
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
- Detected Text: ${JSON.stringify(visionData?.text || [])}
- Layout Structure: ${JSON.stringify(visionData?.layout || {})}
- Colors: ${JSON.stringify(visionData?.imageProperties?.dominantColors || [])}
- Detected Objects: ${JSON.stringify(visionData?.objects || [])}
- Safe Search: ${JSON.stringify(visionData?.safeSearch || {})}

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
  "problems": [...],
  "solutions": [...],
  "visionInsights": { ... }
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
  console.log('🔥 Calling Claude API with prompt length:', prototypePrompt.length);
  
  const code = await callClaude(prototypePrompt, anthropicKey);

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
        problemsSolved: holisticAnalysis.problems?.map(p => p.id) || [],
        generatedAt: new Date().toISOString()
      }
    })
    .select()
    .single();

  console.log('✅ Prototype generated successfully:', prototype.id);
  return prototype;
}

function buildPrototypePrompt(solution: any, analysisData: any, contextData: any, holisticAnalysis: any) {
  const extractedContent = extractContentFromAnalysis(analysisData);
  
  return `You are creating a COMPLETE React component that implements the ${solution.approach} solution approach.

PROBLEMS TO SOLVE:
${holisticAnalysis.problems?.map(p => `- ${p.description} (${p.severity})`).join('\n') || 'No specific problems identified'}

SOLUTION: ${solution.name}
${solution.description}

KEY CHANGES:
${solution.keyChanges?.map(c => `- ${c}`).join('\n') || 'No specific changes listed'}

EXTRACTED CONTENT TO USE:
${JSON.stringify(extractedContent, null, 2)}

IMPLEMENTATION GUIDANCE:
${JSON.stringify(solution.implementationGuidance || {})}

Create a production-ready React component that:
1. Solves all identified problems using this approach
2. Incorporates all extracted content appropriately  
3. Includes all necessary states and interactions
4. Has proper error handling and loading states
5. Is fully accessible (ARIA labels, keyboard navigation)
6. Uses only Tailwind CSS classes
7. Includes helpful comments explaining design decisions

CRITICAL CODE REQUIREMENTS:
- Use ONLY standard ASCII characters (no Unicode characters like em dashes, fancy quotes)
- Use regular minus signs (-) not em dashes (−)
- Use regular quotes (" and ') not curly quotes (" " ' ')
- Ensure all strings are properly terminated
- Use consistent quote style throughout (prefer double quotes for JSX attributes)

Start the component with a comment block listing the problems this solves.
Generate ONLY the React component code starting with: function EnhancedDesign() {

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
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json();
  const content = data.content[0].text;
  console.log('📝 Raw Claude response received:', typeof content, content.substring(0, 200) + '...');
  console.log('📝 Claude response received:', { hasContent: !!content, contentLength: content.length });

  // Try to parse as JSON for analysis, or return as string for code
  try {
    const parsed = JSON.parse(content);
    console.log('✅ Successfully parsed JSON response');
    return parsed;
  } catch {
    console.log('📄 Not JSON, checking for code blocks...');
    // Extract code from markdown if present
    const codeMatch = content.match(/```(?:jsx?|tsx?)?\n([\s\S]*?)\n```/);
    if (codeMatch) {
      console.log('✅ Found code block, extracting...');
      return codeMatch[1];
    }
    
    // Basic validation for React component
    if (content.includes('function EnhancedDesign') && content.includes('return')) {
      console.log('✅ Basic validation passed - function and JSX detected');
      
      // Comprehensive code sanitization
      console.log('🔧 Sanitizing generated code...');
      let cleanedCode = content;
      
      // Fix Unicode characters that break JSX
      cleanedCode = cleanedCode.replace(/−/g, '-'); // Em dash to minus
      cleanedCode = cleanedCode.replace(/–/g, '-'); // En dash to minus
      cleanedCode = cleanedCode.replace(/—/g, '-'); // Em dash to minus
      cleanedCode = cleanedCode.replace(/'/g, "'"); // Left single quote
      cleanedCode = cleanedCode.replace(/'/g, "'"); // Right single quote
      cleanedCode = cleanedCode.replace(/"/g, '"'); // Left double quote
      cleanedCode = cleanedCode.replace(/"/g, '"'); // Right double quote
      cleanedCode = cleanedCode.replace(/…/g, '...'); // Ellipsis to three dots
      
      // Fix malformed template literals and JSX expressions
      // Fix unterminated strings in className attributes
      cleanedCode = cleanedCode.replace(/className=\{`([^`]*?)'/g, (match, content) => {
        return `className={\`${content}"}`;
      });
      
      // Fix mixed quotes in template literals
      cleanedCode = cleanedCode.replace(/className=\{`([^`]*?)"([^`]*?)'/g, (match, start, end) => {
        return `className={\`${start}"${end}"}`;
      });
      
      // Convert all className single quotes to double quotes for consistency
      cleanedCode = cleanedCode.replace(/className='([^']*?)'/g, (match, className) => {
        return `className="${className}"`;
      });
      
      // Fix aria-label and other attributes with problematic quotes
      cleanedCode = cleanedCode.replace(/aria-label='([^']*?)'/g, (match, label) => {
        return `aria-label="${label}"`;
      });
      
      // Fix JSX text content with problematic quotes
      cleanedCode = cleanedCode.replace(/>\s*"([^"]*?)"\s*</g, (match, text) => {
        return `>"${text}"<`;
      });
      
      // Fix conditional expressions with mixed quotes
      cleanedCode = cleanedCode.replace(/\?\s*"([^"]*?)"\s*:\s*"([^"]*?)"/g, (match, trueVal, falseVal) => {
        return `? "${trueVal}" : "${falseVal}"`;
      });
      
      // Remove any remaining problematic characters
      cleanedCode = cleanedCode.replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&\(\)*+,\-.\/:;<=>?@\[\]^_`{|}~]/g, (char) => {
        const code = char.charCodeAt(0);
        // Only replace if it's a Unicode character that could cause issues
        if (code > 127 && code !== 8217 && code !== 8216 && code !== 8220 && code !== 8221) {
          console.log('🔄 Replacing problematic character:', char, 'with space');
          return ' ';
        }
        return char;
      });
      
      // Final validation - ensure no unterminated template literals
      const templateLiteralMatches = cleanedCode.match(/`[^`]*$/gm);
      if (templateLiteralMatches) {
        console.log('⚠️ Found unterminated template literals, fixing...');
        cleanedCode = cleanedCode.replace(/`([^`]*)$/gm, '`$1`');
      }
      
      console.log('✅ Code sanitization complete');
      console.log('🧹 Final cleaned code length:', cleanedCode.length);
      console.log('🔍 Code starts with:', cleanedCode.substring(0, 100));
      
      return cleanedCode;
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
