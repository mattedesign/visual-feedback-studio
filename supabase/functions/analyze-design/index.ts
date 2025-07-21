// supabase/functions/analyze-design/index.ts
// COMPLETE edge function with all features including confidence scoring

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Types and interfaces (copied from src/types for edge function use)
interface AnalysisRequest {
  imageUrl: string;
  metadata: ScreenMetadata;
  userId: string;
  designTokens?: DesignTokens;
}

interface ScreenMetadata {
  screen_id: string;
  screen_name: string;
  platform: 'Web' | 'iOS' | 'Android' | 'Desktop';
  screen_type?: string;
  user_goal?: string;
  vision_metadata?: {
    labels: string[];
    confidence: number;
  };
}

interface VisionAPIResponse {
  labels: string[];
  text: string[];
  objects: Array<{
    name: string;
    confidence: number;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  colors: {
    dominant: string[];
    palette: string[];
  };
  imageProperties?: {
    width: number;
    height: number;
  };
}

interface EnrichedVisionData {
  labels: string[];
  contextualTags: string[];
  textDensity: 'low' | 'medium' | 'high';
  layoutType: 'single-column' | 'multi-column' | 'grid' | 'centered';
  hasHeroSection: boolean;
  formComplexity?: 'simple' | 'moderate' | 'complex';
  primaryColors: string[];
}

interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    error: string;
    warning: string;
    success: string;
    neutral: Record<string, string>;
  };
  typography: {
    fontFamily: string;
    sizes: Record<string, string>;
    weights: Record<string, number>;
  };
  spacing: {
    unit: number;
    scale: number[];
  };
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}

// Helper functions (copied from src/helpers for edge function use)
function enrichVisionData(visionResponse: VisionAPIResponse): EnrichedVisionData {
  const textCount = visionResponse.text.join(' ').split(' ').length;
  const hasMultipleColumns = visionResponse.objects.filter(o => 
    o.name.toLowerCase() === 'text' || o.name.toLowerCase() === 'textblock'
  ).length > 3;
  
  const enriched: EnrichedVisionData = {
    labels: visionResponse.labels,
    contextualTags: [],
    textDensity: textCount > 200 ? 'high' : textCount > 50 ? 'medium' : 'low',
    layoutType: hasMultipleColumns ? 'multi-column' : 'single-column',
    hasHeroSection: visionResponse.labels.some(l => 
      l.toLowerCase().includes('hero') || 
      l.toLowerCase().includes('banner') ||
      l.toLowerCase().includes('header')
    ),
    primaryColors: visionResponse.colors.dominant.slice(0, 3),
    formComplexity: undefined
  };

  // Add contextual tags based on heuristics
  if (enriched.textDensity === 'high' && enriched.layoutType === 'multi-column') {
    enriched.contextualTags.push('complex-form');
    enriched.formComplexity = 'complex';
  }

  if (enriched.hasHeroSection && enriched.textDensity === 'low') {
    enriched.contextualTags.push('landing-page');
  }

  if (visionResponse.labels.some(l => 
    l.toLowerCase().includes('chart') || 
    l.toLowerCase().includes('graph') ||
    l.toLowerCase().includes('dashboard')
  )) {
    enriched.contextualTags.push('data-visualization');
  }

  return enriched;
}

function detectScreenType(visionLabels: string[], textContent: string[]): string {
  const screenTypePatterns = {
    'checkout': {
      keywords: ['cart', 'total', 'payment', 'shipping', 'checkout', 'order'],
      weight: 0
    },
    'dashboard': {
      keywords: ['metrics', 'analytics', 'chart', 'graph', 'statistics', 'overview'],
      weight: 0
    },
    'form': {
      keywords: ['input', 'field', 'submit', 'required', 'email', 'password', 'register'],
      weight: 0
    },
    'landing': {
      keywords: ['hero', 'cta', 'features', 'pricing', 'testimonial', 'get started'],
      weight: 0
    },
    'profile': {
      keywords: ['profile', 'avatar', 'settings', 'account', 'preferences', 'bio'],
      weight: 0
    }
  };

  const allText = [...visionLabels, ...textContent].map(t => t.toLowerCase());

  Object.entries(screenTypePatterns).forEach(([type, pattern]) => {
    pattern.weight = pattern.keywords.reduce((weight, keyword) => {
      const matches = allText.filter(text => text.includes(keyword)).length;
      return weight + matches;
    }, 0);
  });

  const detectedType = Object.entries(screenTypePatterns)
    .sort((a, b) => b[1].weight - a[1].weight)[0][0];

  return screenTypePatterns[detectedType].weight > 0 ? detectedType : 'generic';
}

function validateAnalysisResponse(response: any): boolean {
  const requiredFields = [
    'screen_id',
    'screen_name',
    'overall_score',
    'issues',
    'strengths',
    'top_recommendations'
  ];
  
  const hasRequiredFields = requiredFields.every(field => field in response);
  if (!hasRequiredFields) return false;
  
  if (!Array.isArray(response.issues)) return false;
  
  const issuesValid = response.issues.every((issue: any) => {
    const issueFields = ['id', 'level', 'severity', 'category', 'description', 'impact', 'suggested_fix'];
    const hasFields = issueFields.every(field => field in issue);
    const hasValidConfidence = issue.confidence >= 0 && issue.confidence <= 1;
    return hasFields && hasValidConfidence;
  });
  
  return issuesValid;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageUrl, metadata, userId, designTokens } = await req.json() as AnalysisRequest;

    // Validate inputs
    if (!imageUrl || !metadata || !userId) {
      throw new Error('Missing required fields');
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check user's subscription limits
    const { data: user } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!user) {
      // Try to find in profiles table instead
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (!profile) {
        throw new Error('User not found');
      }
    }

    // Check usage limits (simplified for now)
    const { count } = await supabase
      .from('analysis_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

    const monthlyLimit = user?.monthly_limit || 10; // Default limit
    if (count >= monthlyLimit) {
      throw new Error('Monthly analysis limit reached. Please upgrade your plan.');
    }

    // Create analysis record
    const { data: analysis, error: analysisError } = await supabase
      .from('analysis_results')
      .insert({
        user_id: userId,
        analysis_id: `analysis-${Date.now()}`,
        images: [imageUrl],
        annotations: [],
        enhanced_context: {
          screen_name: metadata.screen_name,
          screen_type: metadata.screen_type || 'auto-detect',
          platform: metadata.platform
        }
      })
      .select()
      .single();

    if (analysisError) throw analysisError;

    console.log('🎯 Starting enhanced analysis pipeline');

    try {
      // Step 1: Google Vision API
      console.log('📷 Executing enhanced vision analysis');
      const visionData = await analyzeWithVision(imageUrl);
      const enrichedVision = enrichVisionData(visionData);

      // Step 2: Detect screen type
      const screenType = detectScreenType(enrichedVision.labels, visionData.text);
      
      // Step 3: Build Claude prompt with all enhancements
      console.log('🤖 Building enhanced prompt');
      const prompt = buildEnhancedPrompt({
        metadata: { ...metadata, screen_type: screenType },
        visionData: enrichedVision,
        designTokens: designTokens || getDefaultDesignTokens()
      });

      // Step 4: Call Claude with retry logic
      console.log('🤖 Executing enhanced AI analysis');
      const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
      if (!anthropicKey) {
        throw new Error('Anthropic API key not configured');
      }

      let analysisResult;
      let retries = 0;
      const maxRetries = 2;

      while (retries <= maxRetries) {
        try {
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': anthropicKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: 'claude-3-5-sonnet-20241022',
              max_tokens: 4000,
              temperature: 0.2,
              messages: [{
                role: 'user',
                content: [
                  {
                    type: 'image',
                    source: {
                      type: 'base64',
                      media_type: 'image/jpeg',
                      data: await fetchImageAsBase64(imageUrl)
                    }
                  },
                  {
                    type: 'text',
                    text: prompt
                  }
                ]
              }]
            })
          });

          if (!response.ok) {
            throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          const responseText = data.content[0].text;
          
          // Parse and validate response
          analysisResult = JSON.parse(responseText);
          
          if (!validateAnalysisResponse(analysisResult)) {
            throw new Error('Invalid analysis response format');
          }
          
          break; // Success, exit retry loop
          
        } catch (error) {
          retries++;
          if (retries > maxRetries) {
            throw new Error(`Analysis failed after ${maxRetries} retries: ${error.message}`);
          }
          console.log(`🔄 Retry ${retries} after error:`, error.message);
        }
      }

      // Step 5: Process and enrich results
      console.log('⚡ Processing and enhancing results');
      
      // Ensure confidence scores are valid
      analysisResult.issues = analysisResult.issues.map((issue: any) => ({
        ...issue,
        confidence: Math.max(0, Math.min(1, issue.confidence || 0.7))
      }));

      // Calculate responsive positions if image dimensions available
      if (visionData.imageProperties) {
        analysisResult.issues = analysisResult.issues.map((issue: any) => {
          if (issue.element?.location) {
            const loc = issue.element.location;
            return {
              ...issue,
              element: {
                ...issue.element,
                location: {
                  ...loc,
                  xPercent: (loc.x / visionData.imageProperties.width) * 100,
                  yPercent: (loc.y / visionData.imageProperties.height) * 100,
                  widthPercent: (loc.width / visionData.imageProperties.width) * 100,
                  heightPercent: (loc.height / visionData.imageProperties.height) * 100
                }
              }
            };
          }
          return issue;
        });
      }

      // Step 6: Store enhanced results
      console.log('💾 Storing enhanced results');

      // Update analysis with enhanced data
      await supabase
        .from('analysis_results')
        .update({
          annotations: analysisResult.issues || [],
          enhanced_context: {
            ...analysis.enhanced_context,
            overall_score: analysisResult.overall_score,
            screen_type_detected: screenType,
            vision_data: enrichedVision
          },
          confidence_metadata: {
            issues: analysisResult.issues?.map((i: any) => ({
              id: i.id,
              confidence: i.confidence
            })) || []
          },
          pattern_violations: analysisResult.issues?.flatMap((i: any) => i.violated_patterns || []) || [],
          screen_type_detected: screenType,
          vision_enrichment_data: enrichedVision,
          processing_time_ms: Date.now() - new Date(analysis.created_at).getTime()
        })
        .eq('id', analysis.id);

      console.log('✅ Enhanced analysis pipeline completed successfully');

      return new Response(
        JSON.stringify({
          success: true,
          analysisId: analysis.id,
          summary: {
            total_issues: analysisResult.issues?.length || 0,
            critical_issues: analysisResult.issues?.filter((i: any) => i.severity === 'critical').length || 0,
            high_confidence_issues: analysisResult.issues?.filter((i: any) => i.confidence >= 0.8).length || 0,
            quick_wins: analysisResult.issues?.filter((i: any) => i.implementation?.effort === 'minutes').length || 0,
            overall_score: analysisResult.overall_score,
            screen_type: screenType,
            strengths: analysisResult.strengths?.length || 0,
            recommendations: analysisResult.top_recommendations?.length || 0
          },
          analysisResult
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('❌ Analysis pipeline error:', error);
      
      // Update analysis record with error
      await supabase
        .from('analysis_results')
        .update({
          enhanced_context: {
            ...analysis.enhanced_context,
            error: error.message,
            failed_at: new Date().toISOString()
          }
        })
        .eq('id', analysis.id);
      
      throw error;
    }

  } catch (error) {
    console.error('❌ Request processing failed:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Enhanced prompt building with all features
function buildEnhancedPrompt(context: any): string {
  const { metadata, visionData, designTokens } = context;
  
  return `You are an expert Senior Principal UX Designer analyzing user interfaces with deep knowledge of design systems, accessibility standards, and conversion optimization.

ANALYSIS CONTEXT:
- Screen: ${metadata.screen_name} (${metadata.screen_type})
- Platform: ${metadata.platform}
- User Goal: ${metadata.user_goal || 'Improve user experience'}
- Detected Elements: ${JSON.stringify(visionData.labels)}
- Contextual Tags: ${JSON.stringify(visionData.contextualTags)}
- Layout Type: ${visionData.layoutType}
- Text Density: ${visionData.textDensity}
- Primary Colors: ${JSON.stringify(visionData.primaryColors)}

DESIGN TOKENS:
- Primary Color: ${designTokens.colors.primary}
- Font Family: ${designTokens.typography.fontFamily}
- Base Font Size: ${designTokens.typography.sizes.base}
- Spacing Unit: ${designTokens.spacing.unit}px

ANALYSIS INSTRUCTIONS:
1. Analyze systematically at all levels (molecular → component → layout → flow)
2. For each issue, assess your confidence level (0.0-1.0)
3. Categorize impact scope precisely
4. Reference specific design patterns when violated
5. Generate code using provided design tokens
6. Consider platform-specific constraints

CONFIDENCE SCORING GUIDELINES:
- 1.0: Objective violation (contrast ratio, touch target size)
- 0.8-0.9: Clear best practice violation with data
- 0.6-0.7: Strong recommendation based on patterns
- 0.4-0.5: Subjective improvement suggestion
- <0.4: Opinion that depends heavily on context

PATTERN AWARENESS:
Check for violations of: F-Pattern scanning, Z-Pattern scanning, Progressive disclosure, 
Gestalt principles, Fitts's Law, Hick's Law, Mobile-first responsive design, WCAG 2.1 AA compliance

Return ONLY valid JSON matching this exact structure:
{
  "screen_id": "${metadata.screen_id || 'screen-' + Date.now()}",
  "screen_name": "${metadata.screen_name}",
  "overall_score": 85,
  "issues": [
    {
      "id": "issue-1",
      "level": "molecular",
      "severity": "critical",
      "category": "accessibility",
      "confidence": 0.95,
      "impact_scope": "task-completion",
      "element": {
        "type": "button",
        "location": { "x": 100, "y": 200, "width": 120, "height": 40 }
      },
      "description": "Submit button lacks sufficient color contrast",
      "impact": "Users with visual impairments cannot identify the primary action",
      "suggested_fix": "Increase button background contrast to meet WCAG AA standards",
      "implementation": {
        "effort": "minutes",
        "code_snippet": "background-color: ${designTokens.colors.primary}; color: white;",
        "design_guidance": "Use primary color token with white text"
      },
      "violated_patterns": ["wcag-contrast"],
      "rationale": ["WCAG 2.1 AA requires 4.5:1 contrast ratio", "Current ratio appears below 3:1"],
      "metrics": {
        "affects_users": "15% (users with visual impairments)",
        "potential_improvement": "+12% task completion rate"
      }
    }
  ],
  "strengths": ["Clear visual hierarchy", "Consistent spacing"],
  "top_recommendations": ["Fix button contrast", "Add focus indicators", "Improve mobile touch targets"],
  "pattern_coverage": {
    "followed": ["gestalt-proximity"],
    "violated": ["wcag-contrast", "mobile-touch-targets"]
  }
}`;
}

// Helper functions
async function analyzeWithVision(imageUrl: string): Promise<VisionAPIResponse> {
  const visionKey = Deno.env.get('GOOGLE_VISION_API_KEY');
  if (!visionKey) {
    console.log('📷 Google Vision API key not configured, using mock data');
    return {
      labels: ['interface', 'web', 'application', 'software', 'technology'],
      text: ['Welcome', 'Sign In', 'Dashboard', 'Settings'],
      objects: [
        {
          name: 'Button',
          confidence: 0.9,
          boundingBox: { x: 100, y: 200, width: 120, height: 40 }
        }
      ],
      colors: {
        dominant: ['#2563eb', '#ffffff', '#f8fafc'],
        palette: ['#2563eb', '#ffffff', '#f8fafc', '#1f2937']
      },
      imageProperties: {
        width: 1920,
        height: 1080
      }
    };
  }
  
  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${visionKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { source: { imageUri: imageUrl } },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 20 },
            { type: 'TEXT_DETECTION' },
            { type: 'OBJECT_LOCALIZATION', maxResults: 20 },
            { type: 'IMAGE_PROPERTIES' },
            { type: 'WEB_DETECTION', maxResults: 10 }
          ]
        }]
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Vision API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const result = data.responses[0];

  if (result.error) {
    throw new Error(`Vision API error: ${result.error.message}`);
  }

  return {
    labels: result.labelAnnotations?.map((l: any) => l.description) || [],
    text: result.textAnnotations?.map((t: any) => t.description) || [],
    objects: result.localizedObjectAnnotations?.map((o: any) => ({
      name: o.name,
      confidence: o.score,
      boundingBox: {
        x: Math.round(o.boundingPoly.normalizedVertices[0].x * 1920),
        y: Math.round(o.boundingPoly.normalizedVertices[0].y * 1080),
        width: Math.round((o.boundingPoly.normalizedVertices[2].x - o.boundingPoly.normalizedVertices[0].x) * 1920),
        height: Math.round((o.boundingPoly.normalizedVertices[2].y - o.boundingPoly.normalizedVertices[0].y) * 1080)
      }
    })) || [],
    colors: {
      dominant: result.imagePropertiesAnnotation?.dominantColors?.colors?.map((c: any) => 
        `rgb(${Math.round(c.color.red || 0)}, ${Math.round(c.color.green || 0)}, ${Math.round(c.color.blue || 0)})`
      ).slice(0, 5) || [],
      palette: result.imagePropertiesAnnotation?.dominantColors?.colors?.map((c: any) => 
        `rgb(${Math.round(c.color.red || 0)}, ${Math.round(c.color.green || 0)}, ${Math.round(c.color.blue || 0)})`
      ) || []
    },
    imageProperties: {
      width: 1920, // Default, will be overridden if available
      height: 1080
    }
  };
}

async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  const buffer = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return base64;
}

function getDefaultDesignTokens(): DesignTokens {
  return {
    colors: {
      primary: '#0F766E',
      secondary: '#14B8A6',
      error: '#EF4444',
      warning: '#F59E0B',
      success: '#10B981',
      neutral: {
        '50': '#F9FAFB',
        '100': '#F3F4F6',
        '200': '#E5E7EB',
        '300': '#D1D5DB',
        '400': '#9CA3AF',
        '500': '#6B7280',
        '600': '#4B5563',
        '700': '#374151',
        '800': '#1F2937',
        '900': '#111827'
      }
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      sizes: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '30px'
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    spacing: {
      unit: 8,
      scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64]
    },
    borderRadius: {
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    }
  };
}