
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
  
  return `You are creating a COMPLETE, FULL-PAGE React component that recreates and enhances the uploaded design using the ${solution.approach} approach.

VISUAL DESIGN TO RECREATE:
${JSON.stringify(extractedContent.visualStructure, null, 2)}

EXACT CONTENT TO PRESERVE:
${JSON.stringify(extractedContent.content, null, 2)}

VISUAL STYLE TO MATCH:
${JSON.stringify(extractedContent.visualStyle, null, 2)}

LAYOUT STRUCTURE TO FOLLOW:
${JSON.stringify(extractedContent.layout, null, 2)}

PROBLEMS TO SOLVE WHILE PRESERVING DESIGN:
${holisticAnalysis.problems?.map(p => `- ${p.description} (${p.severity})`).join('\n') || 'No specific problems identified'}

SOLUTION: ${solution.name}
${solution.description}

KEY IMPROVEMENTS TO IMPLEMENT:
${solution.keyChanges?.map(c => `- ${c}`).join('\n') || 'No specific changes listed'}

BUSINESS CONTEXT:
- Business Type: ${contextData?.business_type || 'Unknown'}
- Primary Goal: ${contextData?.primary_goal || 'Unknown'}
- Target Audience: ${contextData?.target_audience || 'Unknown'}

CREATE A COMPLETE PAGE that:
1. RECREATES the exact visual layout and structure from the uploaded image
2. PRESERVES all text content, buttons, and visual elements exactly as shown
3. MATCHES the color scheme, typography, and spacing from the original
4. IMPLEMENTS the solution improvements without breaking the visual design
5. Creates a fully functional, interactive page (not just a component)
6. Includes proper React state management for all interactive elements
7. Uses responsive design that works on mobile and desktop
8. Follows accessibility best practices

VISUAL FIDELITY REQUIREMENTS:
- Match the exact color palette from the uploaded image
- Recreate the same typography hierarchy and font sizes
- Preserve the original layout structure and spacing
- Include all buttons, forms, images, and interactive elements
- Maintain the same visual style and branding

TECHNICAL REQUIREMENTS:
- Use ONLY Tailwind CSS classes for styling
- Include proper React hooks for state management
- Add smooth animations and micro-interactions
- Ensure full accessibility (ARIA labels, keyboard navigation)
- Handle loading states and error scenarios
- Use semantic HTML elements

Start with a detailed comment explaining what page you're recreating and what improvements you're making.
Generate a COMPLETE, FULL-PAGE React component starting with: function EnhancedDesign() {

The component should render an entire page/screen, not just a small component.`;
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
