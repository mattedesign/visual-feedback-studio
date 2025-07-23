
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

    // Fetch analysis data first to get session_id
    const { data: analysisData } = await supabase
      .from('figmant_analysis_results')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (!analysisData) {
      throw new Error('Analysis not found');
    }

    // Fetch additional data including session images
    const [contextResult, sessionResult] = await Promise.all([
      contextId ? supabase.from('figmant_user_contexts').select('*').eq('id', contextId).single() : { data: null },
      supabase.from('figmant_analysis_sessions').select('*, images:figmant_session_images(*)').eq('id', analysisData.session_id).single()
    ]);

    const contextData = contextResult.data;
    const sessionData = sessionResult.data;

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
          generatePrototype(solution, analysisData, contextData, holisticAnalysis, sessionData, supabase, anthropicKey)
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
      
      const prototype = await generatePrototype(solution, analysisData, contextData, holisticAnalysis, sessionData, supabase, anthropicKey);
      
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

ORIGINAL DESIGN CONTENT ANALYSIS:
${visionData?.text ? `
Detected Text Elements: ${JSON.stringify(visionData.text.slice(0, 50))}
Key Interface Elements: ${identifyInterfaceElements(visionData.text)}
Brand Elements: ${identifyBrandElements(visionData.text)}
Navigation: ${identifyNavigation(visionData.text)}
Product/Content: ${identifyProductContent(visionData.text)}
Pricing/Metrics: ${identifyPricingMetrics(visionData.text)}
` : 'No text content detected'}

VISUAL LAYOUT ANALYSIS:
- Layout Type: ${determineLayoutType(visionData)}
- Color Palette: ${JSON.stringify(visionData?.imageProperties?.dominantColors || [])}
- Interface Pattern: ${identifyInterfacePattern(visionData?.text || [])}

EXISTING UX ANALYSIS:
${JSON.stringify(claudeInsights)}

TASK:
Based on the ACTUAL content and layout of the uploaded design, identify:

1. 3-5 SPECIFIC UX PROBLEMS that prevent this design from achieving its goals:
   - Focus on real issues visible in the uploaded design
   - Consider how the current layout/content affects user experience
   - Relate problems to the business context and goals

2. Create 3 DIFFERENT SOLUTION APPROACHES that PRESERVE the original content and branding:
   
   CONSERVATIVE (Quick Wins):
   - Keep the same content and basic layout structure
   - Fix usability issues without major changes
   - Improve visual hierarchy and clarity
   
   BALANCED (Best Practices):
   - Modernize the design while keeping core elements
   - Apply current UX patterns to the existing content
   - Enhance user flow and interaction design
   
   INNOVATIVE (Cutting Edge):
   - Reimagine the experience with the same content
   - Apply latest design trends and interaction patterns
   - Create delightful and engaging user experience

For each approach include:
- Name and description
- Key changes to make (while preserving original content)
- Expected impact on metrics
- Implementation guidance
- Which elements from the original to keep vs. enhance

Return as JSON:
{
  "problems": [
    {
      "id": "problem-1",
      "description": "Specific issue with current design",
      "severity": "high|medium|low",
      "businessImpact": "How this affects the business goal",
      "evidence": "What in the original design shows this problem"
    }
  ],
  "solutions": [
    {
      "approach": "conservative|balanced|innovative",
      "name": "Solution Name",
      "description": "Detailed description",
      "keyChanges": ["Specific change 1", "Specific change 2"],
      "expectedImpact": "Measurable impact prediction",
      "implementationGuidance": "Step-by-step guidance",
      "preserveElements": ["Original elements to keep"],
      "enhanceElements": ["Original elements to improve"]
    }
  ],
  "visionInsights": {
    "originalDesignType": "Type of interface detected",
    "keyContentElements": ["Main content elements found"],
    "brandingElements": ["Brand elements to preserve"]
  }
}`;
}

// Helper functions to analyze the vision data
function determineLayoutType(visionData: any) {
  const textCount = visionData?.text?.length || 0;
  if (textCount > 50) return 'complex-interface';
  if (textCount > 20) return 'standard-page';
  return 'simple-layout';
}

function identifyInterfaceElements(texts: string[]) {
  const interfaceKeywords = ['Cart', 'Checkout', 'Continue', 'Back', 'Menu', 'Search', 'Login', 'Sign up', 'Home'];
  return texts.filter(text => 
    interfaceKeywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()))
  ).slice(0, 10);
}

function identifyBrandElements(texts: string[]) {
  // Look for brand names, logos, company-specific terms
  const brandPatterns = /^[A-Z][a-zA-Z0-9\s&.]{2,20}$/;
  return texts.filter(text => 
    brandPatterns.test(text) && text.length < 30 && !text.includes('$')
  ).slice(0, 5);
}

function identifyNavigation(texts: string[]) {
  const navPatterns = ['Home', 'About', 'Contact', 'Products', 'Services', 'Shop', 'Account', 'Profile'];
  return texts.filter(text => 
    navPatterns.some(pattern => text.toLowerCase().includes(pattern.toLowerCase()))
  );
}

function identifyProductContent(texts: string[]) {
  // Look for product names, descriptions, features
  return texts.filter(text => 
    text.length > 10 && text.length < 100 && 
    !text.includes('$') && 
    !identifyBrandElements(texts).includes(text)
  ).slice(0, 10);
}

function identifyPricingMetrics(texts: string[]) {
  const pricePattern = /[\$€£¥]\d+\.?\d*/;
  const percentPattern = /\d+%/;
  const numberPattern = /\d+[KMB]?/;
  
  return texts.filter(text => 
    pricePattern.test(text) || percentPattern.test(text) || 
    (numberPattern.test(text) && text.length < 10)
  );
}

function identifyInterfacePattern(texts: string[]) {
  const allText = texts.join(' ').toLowerCase();
  
  if (allText.includes('cart') && allText.includes('checkout')) return 'ecommerce-cart';
  if (allText.includes('dashboard') || allText.includes('analytics')) return 'dashboard';
  if (allText.includes('login') || allText.includes('sign')) return 'authentication';
  if (allText.includes('profile') || allText.includes('account')) return 'user-profile';
  if (allText.includes('pricing') || allText.includes('plan')) return 'pricing-page';
  
  return 'general-interface';
}

async function generatePrototype(
  solution: any,
  analysisData: any,
  contextData: any,
  holisticAnalysis: any,
  sessionData: any,
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
  const prototypePrompt = buildPrototypePrompt(solution, analysisData, contextData, holisticAnalysis, sessionData);
  console.log('🔄 Calling Claude for prototype generation...');
  console.log('🔥 Calling Claude API with prompt length:', prototypePrompt.length);
  console.log('📊 Session data available:', {
    hasImages: !!sessionData?.images?.length,
    imageCount: sessionData?.images?.length || 0,
    firstImagePath: sessionData?.images?.[0]?.file_path
  });
  
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

function buildPrototypePrompt(solution: any, analysisData: any, contextData: any, holisticAnalysis: any, sessionData: any) {
  const extractedContent = extractContentFromAnalysis(analysisData);
  const visionData = analysisData.google_vision_summary?.vision_results;
  
  // Get all the actual text from the image
  const allDetectedText = visionData?.text || [];
  const brandElements = identifyBrandElements(allDetectedText);
  const interfaceElements = identifyInterfaceElements(allDetectedText);
  const pricingElements = identifyPricingMetrics(allDetectedText);
  const productElements = identifyProductContent(allDetectedText);
  
  // Get image information for better context
  const imageInfo = sessionData?.images?.[0] || {};
  const hasImageData = !!sessionData?.images?.length;
  
  return `Create a complete, working React component that recreates the detected checkout interface with ${solution.approach} improvements.

DETECTED CONTENT TO USE (from uploaded image):
${JSON.stringify({
    textElements: allDetectedText.slice(0, 15),
    brands: brandElements,
    prices: pricingElements,
    buttons: interfaceElements,
    products: productElements
  }, null, 2)}

BUSINESS REQUIREMENTS:
- Target: ${contextData?.target_audience || 'Users with $150k+ household income'}
- Goal: ${contextData?.primary_goal || 'Increase checkout conversion rates'}
- Challenges: ${contextData?.specific_challenges?.join(', ') || 'High bounce rate, poor conversion funnel'}

SOLUTION: ${solution.name} (${solution.approach} approach)
Key Changes: ${solution.keyChanges?.join(' • ') || 'Enhanced UX and visual hierarchy'}

CRITICAL REQUIREMENTS:
1. Generate ONLY valid React JSX code - no markdown, no explanations
2. Start with: function EnhancedDesign() {
3. Use the detected content above to populate ALL text, prices, and interface elements
4. Create a complete checkout page with header, main content, and footer
5. Use Tailwind CSS classes for ALL styling
6. Include React hooks (useState, useEffect) for interactivity
7. Make it responsive and accessible
8. NO export statements - just the function
9. Use proper JSX syntax with double quotes for attributes

EXAMPLE STRUCTURE:
function EnhancedDesign() {
  const [cartData, setCartData] = useState({
    items: [/* use detected product data */],
    total: /* use detected pricing */
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        {/* Use detected navigation elements */}
      </header>
      <main className="max-w-6xl mx-auto py-8 px-4">
        {/* Checkout content using detected text and pricing */}
      </main>
      <footer className="bg-gray-800 text-white">
        {/* Footer content */}
      </footer>
    </div>
  );
}

Generate the complete React component now with ALL detected content integrated:`;
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
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json();
  const content = data.content[0].text;
  console.log('📝 Raw Claude response received:', typeof content, content.substring(0, 200) + '...');
  console.log('📝 Claude response received:', { hasContent: !!content, contentLength: content.length });

    // Check if Claude is apologizing or explaining why it can't help
    if (content.toLowerCase().includes('apologize') || 
        content.toLowerCase().includes('cannot') || 
        content.toLowerCase().includes("don't see") ||
        content.toLowerCase().includes('unable to')) {
      console.error('❌ Claude cannot complete the request:', content);
      // Return a generic fallback component instead of failing
      return `function EnhancedDesign() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Prototype Generation Issue
          </h2>
          <p className="text-gray-600 mb-4">
            The AI needs the original image data to generate an accurate prototype. Please try uploading your image again.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}`;
    }

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
      const code = codeMatch[1];
      // Validate that the extracted code is actually React code
      if (!code.includes('function') || !code.includes('return')) {
        console.error('❌ Extracted code is not valid React component');
        throw new Error('Generated code is not a valid React component');
      }
      return code;
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
  const claudeAnalysis = analysis.claude_analysis;
  
  // Extract comprehensive visual structure
  const visualStructure = {
    pageType: determinePageType(visionData?.text || []),
    sections: identifyPageSections(visionData?.text || []),
    navigationElements: extractNavigationElements(visionData?.text || []),
    forms: extractFormElements(visionData?.text || []),
    ctaButtons: extractButtons(visionData?.text || []),
    images: visionData?.objects?.filter(obj => obj.name === 'image' || obj.name === 'picture') || [],
    interactive: extractInteractiveElements(visionData?.text || [])
  };
  
  // Extract all text content with context
  const content = {
    headings: extractHeadings(visionData?.text || []),
    bodyText: extractBodyText(visionData?.text || []),
    buttonLabels: extractButtons(visionData?.text || []),
    formLabels: extractFormLabels(visionData?.text || []),
    metrics: extractMetrics(visionData?.text || []),
    links: extractLinks(visionData?.text || []),
    allText: visionData?.text || []
  };
  
  // Extract visual styling information
  const visualStyle = {
    colorPalette: extractColorPalette(visionData?.imageProperties),
    typography: analyzeTypography(visionData?.text || []),
    spacing: analyzeSpacing(claudeAnalysis),
    branding: extractBrandingElements(visionData?.text || []),
    visualHierarchy: analyzeVisualHierarchy(visionData?.text || [])
  };
  
  // Extract layout structure
  const layout = {
    structure: determineLayoutStructure(visionData),
    gridSystem: analyzeGridSystem(claudeAnalysis),
    responsiveBreakpoints: determineBreakpoints(claudeAnalysis),
    contentFlow: analyzeContentFlow(visionData?.text || [])
  };
  
  return {
    visualStructure,
    content,
    visualStyle,
    layout,
    // Legacy fields for backward compatibility
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

// Comprehensive visual analysis functions
function determinePageType(texts: string[]) {
  const pageKeywords = {
    'landing': ['hero', 'features', 'pricing', 'testimonials', 'get started'],
    'ecommerce': ['cart', 'checkout', 'product', 'price', 'buy now', 'add to cart'],
    'dashboard': ['dashboard', 'analytics', 'metrics', 'overview', 'reports'],
    'onboarding': ['welcome', 'setup', 'getting started', 'step', 'progress'],
    'blog': ['article', 'blog', 'read more', 'published', 'author'],
    'contact': ['contact', 'message', 'email', 'phone', 'address'],
    'about': ['about', 'team', 'mission', 'story', 'company']
  };
  
  const allText = texts.join(' ').toLowerCase();
  let bestMatch = 'generic';
  let maxMatches = 0;
  
  for (const [type, keywords] of Object.entries(pageKeywords)) {
    const matches = keywords.filter(keyword => allText.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = type;
    }
  }
  
  return bestMatch;
}

function identifyPageSections(texts: string[]) {
  const sections = [];
  const sectionKeywords = {
    'header': ['navigation', 'nav', 'menu', 'logo', 'home', 'about', 'contact'],
    'hero': ['hero', 'banner', 'main heading', 'get started', 'sign up'],
    'features': ['features', 'benefits', 'why choose', 'what we offer'],
    'testimonials': ['testimonials', 'reviews', 'customers', 'feedback'],
    'pricing': ['pricing', 'plans', 'packages', 'cost', 'price'],
    'footer': ['footer', 'copyright', 'privacy', 'terms', 'social media']
  };
  
  const allText = texts.join(' ').toLowerCase();
  
  for (const [section, keywords] of Object.entries(sectionKeywords)) {
    const hasKeywords = keywords.some(keyword => allText.includes(keyword));
    if (hasKeywords) {
      sections.push(section);
    }
  }
  
  return sections;
}

function extractNavigationElements(texts: string[]) {
  const navPatterns = ['Home', 'About', 'Services', 'Contact', 'Blog', 'Products', 'Solutions', 'Pricing'];
  return texts.filter(text => 
    navPatterns.some(pattern => text.toLowerCase().includes(pattern.toLowerCase()))
  );
}

function extractFormElements(texts: string[]) {
  const formKeywords = ['email', 'password', 'name', 'phone', 'message', 'submit', 'register', 'login'];
  return texts.filter(text => 
    formKeywords.some(keyword => text.toLowerCase().includes(keyword))
  );
}

function extractInteractiveElements(texts: string[]) {
  const interactivePatterns = ['click', 'tap', 'select', 'choose', 'view', 'download', 'share'];
  return texts.filter(text => 
    interactivePatterns.some(pattern => text.toLowerCase().includes(pattern))
  );
}

function extractBodyText(texts: string[]) {
  return texts.filter(text => 
    text.length > 20 && 
    text.length < 500 && 
    !extractButtons(texts).includes(text) &&
    !extractHeadings(texts).includes(text)
  );
}

function extractFormLabels(texts: string[]) {
  const labelPatterns = /^(Name|Email|Phone|Message|Password|Username|Address|City|State|Country|Zip|Card Number)[:]*$/i;
  return texts.filter(text => labelPatterns.test(text.trim()));
}

function extractLinks(texts: string[]) {
  const linkPatterns = ['Learn More', 'Read More', 'View Details', 'See More', 'Explore', 'Discover'];
  return texts.filter(text => 
    linkPatterns.some(pattern => text.toLowerCase().includes(pattern.toLowerCase()))
  );
}

function extractColorPalette(imageProperties: any) {
  if (!imageProperties?.dominantColors) return [];
  
  return imageProperties.dominantColors.map((colorInfo: any) => ({
    color: colorInfo.color,
    score: colorInfo.score,
    pixelFraction: colorInfo.pixelFraction
  }));
}

function analyzeTypography(texts: string[]) {
  const headings = extractHeadings(texts);
  const bodyText = extractBodyText(texts);
  
  return {
    headingStyles: headings.map(h => ({
      text: h,
      estimatedSize: h.length < 30 ? 'large' : h.length < 50 ? 'medium' : 'small',
      hierarchy: headings.indexOf(h) + 1
    })),
    bodyTextStyle: {
      averageLength: bodyText.reduce((sum, text) => sum + text.length, 0) / bodyText.length || 0,
      tone: analyzeTextTone(bodyText.join(' '))
    }
  };
}

function analyzeTextTone(text: string) {
  const professional = ['enterprise', 'solution', 'professional', 'business'];
  const friendly = ['easy', 'simple', 'friendly', 'welcome', 'help'];
  const urgent = ['now', 'today', 'limited', 'hurry', 'don\'t miss'];
  
  const lowerText = text.toLowerCase();
  
  if (professional.some(word => lowerText.includes(word))) return 'professional';
  if (friendly.some(word => lowerText.includes(word))) return 'friendly';
  if (urgent.some(word => lowerText.includes(word))) return 'urgent';
  return 'neutral';
}

function analyzeSpacing(claudeAnalysis: any) {
  // Extract spacing insights from Claude's analysis if available
  const analysis = JSON.stringify(claudeAnalysis || {}).toLowerCase();
  
  return {
    density: analysis.includes('crowded') || analysis.includes('cramped') ? 'tight' : 
             analysis.includes('spacious') || analysis.includes('open') ? 'loose' : 'balanced',
    whitespace: analysis.includes('whitespace') || analysis.includes('breathing room') ? 'generous' : 'minimal'
  };
}

function extractBrandingElements(texts: string[]) {
  // Look for company names, taglines, and brand-specific terms
  const brandingPattern = /^[A-Z][a-zA-Z0-9\s&.,]{2,30}$/;
  const potentialBrands = texts.filter(text => 
    brandingPattern.test(text) && 
    !extractButtons(texts).includes(text) &&
    text.length < 50
  );
  
  return potentialBrands;
}

function analyzeVisualHierarchy(texts: string[]) {
  const headings = extractHeadings(texts);
  const buttons = extractButtons(texts);
  const bodyText = extractBodyText(texts);
  
  return {
    primaryElements: headings.slice(0, 2),
    secondaryElements: buttons,
    supportingElements: bodyText.slice(0, 3)
  };
}

function determineLayoutStructure(visionData: any) {
  const objects = visionData?.objects || [];
  const textCount = visionData?.text?.length || 0;
  
  return {
    complexity: textCount > 50 ? 'complex' : textCount > 20 ? 'moderate' : 'simple',
    objectCount: objects.length,
    estimatedColumns: textCount > 30 ? 'multi-column' : 'single-column'
  };
}

function analyzeGridSystem(claudeAnalysis: any) {
  const analysis = JSON.stringify(claudeAnalysis || {}).toLowerCase();
  
  return {
    type: analysis.includes('grid') ? 'grid-based' : 
          analysis.includes('flex') ? 'flexbox' : 'unknown',
    alignment: analysis.includes('center') ? 'center' : 
               analysis.includes('left') ? 'left' : 'unknown'
  };
}

function determineBreakpoints(claudeAnalysis: any) {
  return {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px'
  };
}

function analyzeContentFlow(texts: string[]) {
  const headings = extractHeadings(texts);
  const buttons = extractButtons(texts);
  
  return {
    pattern: headings.length > 3 ? 'hierarchical' : 'linear',
    ctaPlacement: buttons.length > 0 ? 'present' : 'missing',
    readingFlow: 'top-to-bottom'
  };
}
