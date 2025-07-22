import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PrototypeGenerationRequest {
  analysisId: string;
  maxPrototypes?: number;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🎨 Visual prototype generation started');
    
    // Parse request
    const { analysisId, maxPrototypes = 3 }: PrototypeGenerationRequest = await req.json();
    
    if (!analysisId) {
      throw new Error('Analysis ID is required');
    }
    
    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get analysis data
    console.log(`📊 Fetching analysis data for ID: ${analysisId}`);
    const { data: analysisData, error: analysisError } = await supabase
      .from('figmant_analysis_results')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (analysisError || !analysisData) {
      throw new Error(`Analysis not found: ${analysisError?.message}`);
    }

    // Get session images separately using the session_id
    const { data: sessionImages, error: imagesError } = await supabase
      .from('figmant_session_images')
      .select('google_vision_data, file_path')
      .eq('session_id', analysisData.session_id);
    
    if (imagesError) {
      console.warn('Failed to fetch session images:', imagesError);
    }
    
    // Check if prototypes already exist
    const { data: existingPrototypes } = await supabase
      .from('figmant_visual_prototypes')
      .select('id')
      .eq('analysis_id', analysisId);
    
    if (existingPrototypes && existingPrototypes.length > 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Prototypes already exist for this analysis',
          prototypeCount: existingPrototypes.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Mark prototype generation as started
    await supabase
      .from('figmant_analysis_results')
      .update({
        prototype_generation_status: 'in_progress',
        prototype_generation_started_at: new Date().toISOString()
      })
      .eq('id', analysisId);
    
    // Get analysis issues from Claude analysis data
    console.log('🔍 Analysis data structure:', Object.keys(analysisData));
    console.log('🔍 Claude analysis data:', analysisData.claude_analysis ? Object.keys(analysisData.claude_analysis) : 'No claude_analysis');
    
    const claudeAnalysis = analysisData.claude_analysis || {};
    console.log('🔍 Claude analysis structure:', Object.keys(claudeAnalysis));
    
    let issues = claudeAnalysis.issues || [];
    console.log('🔍 Issues found in claude_analysis:', issues.length);
    
    // Also check analysis_results table for molecular issues
    const { data: molecularAnalysis } = await supabase
      .from('analysis_results')
      .select('annotations')
      .eq('analysis_id', analysisData.session_id)
      .maybeSingle();
    
    if (molecularAnalysis?.annotations) {
      const molecularIssues = Array.isArray(molecularAnalysis.annotations) 
        ? molecularAnalysis.annotations 
        : [];
      console.log('🔍 Found molecular issues:', molecularIssues.length);
      issues = [...issues, ...molecularIssues];
    }
    
    console.log('🔍 Total issues after combining sources:', issues.length);
    
    if (issues.length === 0) {
      console.log('❌ No issues found in any structure');
      throw new Error('No issues found in analysis for prototype generation');
    }
    
    console.log(`🔍 Found ${issues.length} issues, selecting candidates...`);
    
    // Select prototype candidates (simplified for edge function)
    const prototypeCandidates = selectPrototypeCandidates(issues, maxPrototypes);
    
    if (prototypeCandidates.length === 0) {
      // Update status to completed with 0 prototypes
      await supabase
        .from('figmant_analysis_results')
        .update({
          prototype_generation_status: 'completed',
          prototype_generation_completed_at: new Date().toISOString(),
          prototype_count: 0
        })
        .eq('id', analysisId);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No suitable issues found for prototype generation',
          prototypeCount: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`✅ Selected ${prototypeCandidates.length} candidates for prototyping`);
    
    // Generate prototypes using Claude
    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }
    
    const visionData = sessionImages?.[0]?.google_vision_data || {};
    const imageUrl = sessionImages?.[0]?.file_path || '';
    
    // Generate prototypes for each candidate
    const prototypes = [];
    for (let i = 0; i < prototypeCandidates.length; i++) {
      const candidate = prototypeCandidates[i];
      
      try {
        console.log(`🎨 Generating prototype ${i + 1}/${prototypeCandidates.length} for issue: ${candidate.issue.id}`);
        
        const prototype = await generateSinglePrototype(candidate, {
          analysisId,
          visionData,
          imageUrl,
          anthropicApiKey
        });
        
        prototypes.push(prototype);
        
      } catch (error) {
        console.error(`❌ Failed to generate prototype for issue ${candidate.issue.id}:`, error);
        // Continue with other prototypes
      }
    }
    
    // Store prototypes in database
    if (prototypes.length > 0) {
      const prototypeRecords = prototypes.map(prototype => ({
        analysis_id: analysisId,
        issue_id: prototype.issueId,
        title: prototype.title,
        category: prototype.category,
        hotspot_x: prototype.hotspot.x,
        hotspot_y: prototype.hotspot.y,
        hotspot_width: prototype.hotspot.width,
        hotspot_height: prototype.hotspot.height,
        hotspot_type: prototype.hotspot.type,
        before_html: prototype.improvement.beforeCode.html,
        before_css: prototype.improvement.beforeCode.css,
        after_html: prototype.improvement.afterCode.html,
        after_css: prototype.improvement.afterCode.css,
        interactive_html: prototype.improvement.interactiveDemo.html,
        interactive_css: prototype.improvement.interactiveDemo.css,
        interactive_js: prototype.improvement.interactiveDemo.js,
        mobile_html: prototype.improvement.mobileResponsive.html,
        mobile_css: prototype.improvement.mobileResponsive.css,
        summary: prototype.explanation.summary,
        key_changes: prototype.explanation.keyChanges,
        business_impact: prototype.explanation.businessImpact,
        implementation_notes: prototype.explanation.implementationNotes
      }));
      
      const { error: insertError } = await supabase
        .from('figmant_visual_prototypes')
        .insert(prototypeRecords);
      
      if (insertError) {
        throw new Error(`Failed to store prototypes: ${insertError.message}`);
      }
    }
    
    // Update analysis status
    await supabase
      .from('figmant_analysis_results')
      .update({
        prototype_generation_status: 'completed',
        prototype_generation_completed_at: new Date().toISOString(),
        prototype_count: prototypes.length
      })
      .eq('id', analysisId);
    
    console.log(`🎉 Successfully generated and stored ${prototypes.length} prototypes`);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Generated ${prototypes.length} visual prototypes`,
        prototypeCount: prototypes.length,
        prototypes: prototypes.map(p => ({
          id: p.id,
          title: p.title,
          category: p.category,
          summary: p.explanation.summary
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('❌ Prototype generation failed:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper functions for prototype generation
function selectPrototypeCandidates(issues: any[], maxPrototypes: number) {
  return issues
    .filter(issue => {
      // Calculate impact score - lowered threshold and accept more severities
      let score = 0;
      if (issue.impact_scope === 'conversion') score += 0.4;
      if (issue.impact_scope === 'task-completion') score += 0.3;
      if (issue.impact_scope === 'usability') score += 0.2;
      
      // Accept more severity levels
      if (issue.severity === 'critical') score += 0.3;
      if (issue.severity === 'warning') score += 0.2;
      if (issue.severity === 'improvement') score += 0.15;
      if (issue.severity === 'suggestion') score += 0.1;
      
      score += (issue.confidence || 0.5) * 0.3;
      
      // Lower threshold from 0.7 to 0.3
      return score > 0.3;
    })
    .sort((a, b) => {
      const scoreA = calculateIssueScore(a);
      const scoreB = calculateIssueScore(b);
      return scoreB - scoreA;
    })
    .slice(0, maxPrototypes)
    .map(issue => ({
      issue,
      prototypeType: issue.level === 'layout' ? 'layout' : 'component',
      complexity: issue.severity === 'critical' ? 'comprehensive' : 'advanced',
      impactScore: calculateIssueScore(issue),
      visualScope: issue.level === 'layout' ? 'section' : 'single-element'
    }));
}

function calculateIssueScore(issue: any): number {
  let score = 0;
  if (issue.impact_scope === 'conversion') score += 0.4;
  if (issue.impact_scope === 'task-completion') score += 0.3;
  if (issue.impact_scope === 'usability') score += 0.2;
  
  // Accept more severity levels with updated scoring
  if (issue.severity === 'critical') score += 0.3;
  if (issue.severity === 'warning') score += 0.2;
  if (issue.severity === 'improvement') score += 0.15;
  if (issue.severity === 'suggestion') score += 0.1;
  
  score += (issue.confidence || 0.5) * 0.3;
  return score;
}

async function generateSinglePrototype(candidate: any, context: any) {
  const prompt = buildPrototypePrompt(candidate, context);
  
  // Call Claude API
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': context.anthropicApiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      temperature: 0.2,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  });
  
  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }
  
  const data = await response.json();
  const content = data.content[0]?.text || '';
  
  // Parse JSON from response
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch) {
    throw new Error('No JSON found in Claude response');
  }
  
  const parsed = JSON.parse(jsonMatch[1]);
  
  // Build prototype object
  return {
    id: `prototype-${context.analysisId}-${candidate.issue.id}`,
    analysisId: context.analysisId,
    issueId: candidate.issue.id,
    title: parsed.title,
    category: parsed.category || candidate.issue.category,
    hotspot: {
      x: candidate.issue.element?.location?.x || Math.floor(Math.random() * 300) + 50,
      y: candidate.issue.element?.location?.y || Math.floor(Math.random() * 200) + 50,
      width: candidate.issue.element?.location?.width || 200,
      height: candidate.issue.element?.location?.height || 50,
      type: 'pulse'
    },
    improvement: parsed.improvement,
    explanation: parsed.explanation,
    createdAt: new Date().toISOString()
  };
}

function buildPrototypePrompt(candidate: any, context: any): string {
  const { issue } = candidate;
  const dominantColors = context.visionData.imagePropertiesAnnotation?.dominantColors?.colors
    ?.slice(0, 3)
    .map((c: any) => `rgb(${Math.round(c.color.red * 255)}, ${Math.round(c.color.green * 255)}, ${Math.round(c.color.blue * 255)})`)
    || ['#2563eb', '#ffffff', '#f8fafc'];
  
  return `
# PROFESSIONAL UI PROTOTYPE GENERATION

You are a senior UX/UI designer creating a production-ready prototype that demonstrates a specific improvement.

## Issue Context
**Problem**: ${issue.description}
**Suggested Fix**: ${issue.suggested_fix || issue.impact}
**Severity**: ${issue.severity} (${issue.confidence}% confidence)
**Element Type**: ${issue.element?.type || 'general UI element'}
**Location**: ${issue.element?.location?.x || 0}px, ${issue.element?.location?.y || 0}px
**Size**: ${issue.element?.location?.width || 200}px × ${issue.element?.location?.height || 50}px

## Design Context
**Detected Colors**: ${dominantColors.join(', ')}
**Platform**: Web interface
**Style**: Modern, professional UI design

## CRITICAL REQUIREMENTS

### Visual Quality Standards
1. **Professional Aesthetics**: Use modern design principles (proper spacing, typography, shadows)
2. **High Contrast**: Ensure ALL text has sufficient contrast (dark text on light backgrounds, light text on dark backgrounds)
3. **Consistent Styling**: Use a cohesive color palette and spacing system
4. **Interactive States**: Include hover, focus, and active states for interactive elements
5. **Production Ready**: Generate clean, maintainable code that could be implemented immediately

### Technical Requirements
1. **Semantic HTML**: Use proper HTML5 elements and structure
2. **Modern CSS**: Use flexbox/grid, custom properties, and modern selectors
3. **Accessibility**: Include ARIA labels, focus indicators, and keyboard navigation
4. **Responsive Design**: Ensure mobile compatibility with proper breakpoints
5. **Performance**: Minimize CSS complexity and avoid unnecessary JavaScript

### Content Requirements
1. **Realistic Content**: Use meaningful text instead of Lorem ipsum when possible
2. **Clear Hierarchy**: Establish visual hierarchy through typography and spacing
3. **User-Focused Copy**: Write UI text that guides and helps users

## OUTPUT REQUIREMENTS

Generate a JSON response with a complete, working prototype that demonstrates the improvement.

**MANDATORY COLOR CONTRAST RULES:**
- Light backgrounds (#ffffff, #f8fafc, #e2e8f0): Use dark text (#1f2937, #374151, #0f172a)
- Dark backgrounds (#1f2937, #111827, #0f172a): Use light text (#ffffff, #f9fafb, #e5e7eb)
- Colored backgrounds: Ensure 4.5:1 contrast ratio minimum
- Interactive elements: Use clear hover/focus states with good contrast

\`\`\`json
{
  "title": "Clear, actionable improvement title (max 60 chars)",
  "category": "${issue.category}",
  "improvement": {
    "beforeCode": {
      "html": "<!-- Current problematic HTML structure -->",
      "css": "/* Current problematic styles that demonstrate the issue */"
    },
    "afterCode": {
      "html": "<!-- Improved HTML with semantic structure, proper accessibility, and clear content -->",
      "css": "/* Complete improved CSS with:\n   - High contrast colors (dark text on light bg or light text on dark bg)\n   - Professional spacing and typography\n   - Modern design elements (subtle shadows, rounded corners)\n   - Color palette: ${dominantColors.join(', ')}\n   - Smooth transitions and micro-interactions\n   - Responsive units (rem, em, %, vw/vh) */"
    },
    "interactiveDemo": {
      "html": "<!-- Interactive version with all states and feedback -->",
      "css": "/* Comprehensive interaction styles:\n   :hover - visible feedback on hover\n   :focus - clear focus indicators\n   :active - pressed/clicked state\n   :disabled - disabled state styling\n   Smooth transitions between all states */",
      "js": "/* Minimal, focused JavaScript for enhanced UX:\n  - Form validation feedback\n  - Progressive enhancement\n  - Accessibility helpers\n  - Performance optimized */"
    },
    "mobileResponsive": {
      "html": "<!-- Mobile-optimized structure with touch-friendly elements -->",
      "css": "/* Mobile-first responsive design:\n   @media (max-width: 768px) - tablet adjustments\n   @media (max-width: 480px) - mobile optimizations\n   Touch targets minimum 44px\n   Readable font sizes (16px+)\n   Optimized spacing and layout */"
    }
  },
  "explanation": {
    "summary": "Concise explanation of what was improved and the user benefit (1-2 sentences)",
    "keyChanges": [
      "Specific change 1 with measurable improvement",
      "Specific change 2 with technical detail", 
      "Specific change 3 with business/user impact"
    ],
    "businessImpact": "Quantified expected improvement (e.g., '25% better conversion', 'reduces task completion time by 30%')",
    "implementationNotes": [
      "Browser compatibility note (IE11+, modern browsers)",
      "Performance consideration or optimization",
      "Accessibility compliance note (WCAG 2.1 AA)",
      "Integration requirement or dependency"
    ]
  }
}
\`\`\`

**FINAL CHECKLIST:**
✅ High contrast text (readable on all backgrounds)
✅ Professional visual design with proper spacing
✅ Semantic HTML structure
✅ Modern, maintainable CSS
✅ Interactive states for all clickable elements
✅ Mobile-responsive design
✅ Accessibility features included
✅ Realistic, helpful content
✅ Clear improvement demonstration
✅ Production-ready code quality
`;
}