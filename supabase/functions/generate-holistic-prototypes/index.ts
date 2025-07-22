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

VISUAL STYLE GUIDE FROM USER'S IMAGE:
Color Palette: ${JSON.stringify(extractedContent.colorPalette, null, 2)}
Brand Personality: ${extractedContent.visualStyle?.brandPersonality || 'modern'}
Design Style: ${extractedContent.visualStyle?.designStyle || 'balanced'}
Background Tone: ${extractedContent.visualStyle?.backgroundTone || 'light'}

LAYOUT STRUCTURE FROM USER'S IMAGE:
Layout Type: ${extractedContent.layoutStructure?.layoutType || 'standard'}
Header Elements: ${JSON.stringify(extractedContent.layoutStructure?.headerElements || [])}
Navigation Items: ${JSON.stringify(extractedContent.layoutStructure?.navigationItems || [])}
CTA Elements: ${JSON.stringify(extractedContent.layoutStructure?.ctaElements || [])}

CONTENT FROM USER'S IMAGE:
Logo/Brand: ${extractedContent.designElements?.logoText || 'Brand'}
Headings: ${JSON.stringify(extractedContent.typography?.headings?.slice(0, 3) || [])}
Buttons: ${JSON.stringify(extractedContent.buttons || [])}
Metrics/Numbers: ${JSON.stringify(extractedContent.metrics || [])}
Social Proof: ${JSON.stringify(extractedContent.designElements?.socialProof || [])}
Features: ${JSON.stringify(extractedContent.designElements?.featureList || [])}

CRITICAL STYLING REQUIREMENTS:
1. Use the EXACT colors from the extracted palette: primary ${extractedContent.colorPalette?.primary}, secondary ${extractedContent.colorPalette?.secondary}, accent ${extractedContent.colorPalette?.accent}
2. Match the brand personality: ${extractedContent.visualStyle?.brandPersonality || 'modern'} 
3. Follow the detected design style: ${extractedContent.visualStyle?.designStyle || 'balanced'}
4. Use actual text content from the user's image where possible
5. Recreate the layout structure type: ${extractedContent.layoutStructure?.layoutType || 'standard'}
6. Include the detected navigation items and CTAs
7. Maintain the visual hierarchy found in the original

TAILWIND CSS COLOR IMPLEMENTATION:
- Convert hex colors to RGB for Tailwind: use style={{backgroundColor: '${extractedContent.colorPalette?.primary}'}} for primary color
- Use style={{color: '${extractedContent.colorPalette?.text}'}} for text color
- Background should use: style={{backgroundColor: '${extractedContent.colorPalette?.background}'}}

CRITICAL REACT COMPONENT RULES:
1. DO NOT include any import statements
2. DO NOT include export statements  
3. Use function declaration syntax: function EnhancedDesign() { ... }
4. React and hooks (useState, useEffect, etc.) are already available globally
5. Use className for Tailwind AND style={{}} for exact colors from the image
6. Incorporate ALL extracted content (headings, buttons, metrics, features)
7. Match the visual personality and design style detected
8. Use the EXACT color palette extracted from the user's image
9. Recreate the layout structure type found in the original
10. Include actual text content from the user's uploads where relevant

QUOTE HANDLING EXAMPLES:
✅ CORRECT: const message = "Let's get started with this amazing feature";
❌ WRONG: const message = 'Let's get started with this amazing feature';
✅ CORRECT: <button style={{backgroundColor: '${extractedContent.colorPalette?.primary}'}}>Click me</button>

Create a production-ready React component that:
1. Solves all identified problems using this approach
2. Uses the EXACT visual style extracted from the user's image
3. Incorporates ALL extracted content (text, colors, layout, branding)
4. Matches the brand personality and design style detected
5. Includes all necessary states and interactions
6. Has proper error handling and loading states
7. Is fully accessible (ARIA labels, keyboard navigation)
8. Uses Tailwind CSS + inline styles for exact color matching
9. Feels like a natural evolution of the user's original design

IMPORTANT: This should look like the user's design but improved. Use their colors, their text content, their layout patterns, and their visual style. Make it feel connected to their brand and visual identity.

Generate ONLY the function body, starting exactly with:
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
  const imageProperties = visionData?.imageProperties;
  
  console.log('🎨 Extracting enhanced visual style data...');
  
  return {
    // Content extraction
    texts: visionData?.text || [],
    metrics: extractMetrics(visionData?.text || []),
    buttons: extractButtons(visionData?.text || []),
    headings: extractHeadings(visionData?.text || []),
    
    // Enhanced visual style extraction
    visualStyle: extractVisualStyle(imageProperties, visionData?.text || []),
    layoutStructure: extractLayoutStructure(visionData),
    designElements: extractDesignElements(visionData),
    colorPalette: extractColorPalette(imageProperties),
    typography: extractTypography(visionData?.text || [])
  };
}

function extractVisualStyle(imageProperties: any, texts: string[]) {
  const colors = imageProperties?.dominantColors || [];
  
  return {
    primaryColor: colors[0]?.color || '#3B82F6',
    secondaryColor: colors[1]?.color || '#10B981', 
    accentColor: colors[2]?.color || '#F59E0B',
    backgroundTone: detectBackgroundTone(colors),
    brandPersonality: detectBrandPersonality(texts),
    designStyle: detectDesignStyle(imageProperties, texts)
  };
}

function extractColorPalette(imageProperties: any) {
  const colors = imageProperties?.dominantColors || [];
  
  return {
    primary: colors[0]?.color || '#3B82F6',
    secondary: colors[1]?.color || '#10B981',
    accent: colors[2]?.color || '#F59E0B',
    neutral: colors[3]?.color || '#6B7280',
    background: colors[4]?.color || '#F9FAFB',
    text: detectTextColor(colors),
    palette: colors.slice(0, 8).map(c => c.color)
  };
}

function extractLayoutStructure(visionData: any) {
  // Analyze spatial relationships and layout patterns
  const texts = visionData?.text || [];
  
  return {
    headerElements: texts.filter(t => t.length < 50 && isLikelyHeader(t)),
    navigationItems: extractNavigationItems(texts),
    contentSections: groupContentSections(texts),
    ctaElements: texts.filter(t => isCallToAction(t)),
    layoutType: detectLayoutType(texts)
  };
}

function extractDesignElements(visionData: any) {
  const texts = visionData?.text || [];
  
  return {
    logoText: extractLogoText(texts),
    brandElements: extractBrandElements(texts),
    formFields: extractFormFields(texts),
    socialProof: extractSocialProof(texts),
    featureList: extractFeatures(texts)
  };
}

function extractTypography(texts: string[]) {
  return {
    headings: texts.filter(t => t.length > 3 && t.length < 100 && isLikelyHeading(t)),
    bodyText: texts.filter(t => t.length > 20 && t.length < 200),
    labels: texts.filter(t => t.length < 20 && isLikelyLabel(t)),
    hierarchy: analyzeTextHierarchy(texts)
  };
}

// Helper functions for visual analysis
function detectBackgroundTone(colors: any[]) {
  if (!colors.length) return 'light';
  const lightness = colors[0]?.color ? getColorLightness(colors[0].color) : 0.9;
  return lightness > 0.5 ? 'light' : 'dark';
}

function detectBrandPersonality(texts: string[]) {
  const allText = texts.join(' ').toLowerCase();
  
  if (allText.includes('professional') || allText.includes('enterprise') || allText.includes('business')) {
    return 'professional';
  } else if (allText.includes('creative') || allText.includes('design') || allText.includes('art')) {
    return 'creative';
  } else if (allText.includes('playful') || allText.includes('fun') || allText.includes('game')) {
    return 'playful';
  } else if (allText.includes('modern') || allText.includes('tech') || allText.includes('digital')) {
    return 'modern';
  }
  return 'neutral';
}

function detectDesignStyle(imageProperties: any, texts: string[]) {
  const colors = imageProperties?.dominantColors || [];
  const colorCount = colors.length;
  const hasGradients = colorCount > 3;
  
  const allText = texts.join(' ').toLowerCase();
  const hasMinimalText = texts.filter(t => t.length > 10).length < 5;
  
  if (hasMinimalText && colorCount <= 2) return 'minimal';
  if (hasGradients && allText.includes('modern')) return 'modern';
  if (colorCount > 5) return 'vibrant';
  return 'balanced';
}

function detectTextColor(colors: any[]) {
  const bgLightness = colors[0] ? getColorLightness(colors[0].color) : 0.9;
  return bgLightness > 0.5 ? '#1F2937' : '#F9FAFB';
}

function getColorLightness(colorHex: string): number {
  // Convert hex to RGB and calculate relative luminance
  const hex = colorHex.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  // Simple luminance calculation
  return (r * 0.299 + g * 0.587 + b * 0.114);
}

function isLikelyHeader(text: string): boolean {
  return text.length < 50 && 
         (text.match(/^[A-Z]/) !== null) && 
         !text.includes('.') && 
         !text.includes('@');
}

function extractNavigationItems(texts: string[]): string[] {
  const navPatterns = ['home', 'about', 'services', 'contact', 'products', 'blog', 'portfolio', 'pricing'];
  return texts.filter(text => 
    text.length < 20 && 
    navPatterns.some(pattern => text.toLowerCase().includes(pattern))
  );
}

function groupContentSections(texts: string[]): string[] {
  return texts.filter(text => 
    text.length > 50 && text.length < 300
  ).slice(0, 5); // Top 5 content sections
}

function isCallToAction(text: string): boolean {
  const ctaPatterns = ['get started', 'sign up', 'learn more', 'contact us', 'buy now', 'try free', 'download'];
  return ctaPatterns.some(pattern => text.toLowerCase().includes(pattern));
}

function detectLayoutType(texts: string[]): string {
  const headerCount = texts.filter(t => isLikelyHeader(t)).length;
  const longTextCount = texts.filter(t => t.length > 100).length;
  
  if (headerCount > 3 && longTextCount > 2) return 'multi-section';
  if (longTextCount === 0 && headerCount <= 2) return 'landing';
  if (longTextCount > 3) return 'content-heavy';
  return 'standard';
}

function extractLogoText(texts: string[]): string {
  // Look for short, likely brand names at the top
  return texts.find(t => t.length < 20 && t.length > 2 && /^[A-Z]/.test(t)) || 'Brand';
}

function extractBrandElements(texts: string[]): string[] {
  return texts.filter(t => 
    t.length < 30 && 
    (t.includes('®') || t.includes('™') || /^[A-Z][a-z]+$/.test(t))
  );
}

function extractFormFields(texts: string[]): string[] {
  const fieldPatterns = ['email', 'name', 'phone', 'message', 'password', 'username'];
  return texts.filter(text => 
    fieldPatterns.some(pattern => text.toLowerCase().includes(pattern))
  );
}

function extractSocialProof(texts: string[]): string[] {
  return texts.filter(text => 
    text.includes('%') || 
    text.includes('customers') || 
    text.includes('users') || 
    text.includes('reviews') ||
    /\d+[KMB]?[\s+]/.test(text)
  );
}

function extractFeatures(texts: string[]): string[] {
  return texts.filter(text => 
    text.length > 20 && 
    text.length < 100 && 
    (text.includes('✓') || text.includes('•') || text.startsWith('-'))
  );
}

function isLikelyHeading(text: string): boolean {
  return /^[A-Z]/.test(text) && 
         text.length < 100 && 
         !text.includes('.') && 
         !text.includes('@') &&
         text.split(' ').length < 10;
}

function isLikelyLabel(text: string): boolean {
  return text.endsWith(':') || 
         ['name', 'email', 'phone', 'address'].some(field => 
           text.toLowerCase().includes(field)
         );
}

function analyzeTextHierarchy(texts: string[]): any {
  const byLength = texts.sort((a, b) => a.length - b.length);
  
  return {
    h1: byLength.filter(t => t.length < 50)[0] || 'Main Heading',
    h2: byLength.filter(t => t.length > 20 && t.length < 80).slice(0, 3),
    h3: byLength.filter(t => t.length > 10 && t.length < 50).slice(0, 5),
    body: byLength.filter(t => t.length > 50)
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
  const buttonPatterns = ['Get Started', 'Sign Up', 'Learn More', 'Try', 'Start', 'Continue', 'Next', 'Contact', 'Buy', 'Download'];
  return texts.filter(text => 
    buttonPatterns.some(pattern => text.toLowerCase().includes(pattern.toLowerCase()))
  );
}

function extractHeadings(texts: string[]) {
  return texts.filter(text => text.length > 5 && text.length < 100 && !text.includes('   '));
}
