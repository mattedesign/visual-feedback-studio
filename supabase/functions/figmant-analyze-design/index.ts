// supabase/functions/figmant-analyze-design/index.ts
// Enhanced Figmant analysis pipeline - Phase 1.4 Implementation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

// Enhanced types for Phase 1.4
interface AnalysisRequest {
  sessionId: string;
  metadata?: {
    screen_name: string;
    platform: string;
    screen_type?: string;
    user_goal?: string;
  };
  designTokens?: any;
}

interface VisionResponse {
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
  imageProperties: {
    dominantColors: string[];
    width: number;
    height: number;
  };
  webDetection: any;
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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('🎨 Figmant Enhanced Analysis Pipeline - Phase 1.4 Implementation');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body - support both old and new formats
    const requestData = await req.json();
    const sessionId = requestData.sessionId || requestData.session_id;
    const metadata = requestData.metadata;
    const designTokens = requestData.designTokens;

    // Validate inputs
    if (!sessionId) {
      throw new Error('Missing sessionId in request');
    }

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Starting enhanced analysis for session:', sessionId);

    // Get session and images
    const { data: session, error: sessionError } = await supabase
      .from('figmant_analysis_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error(`Session not found: ${sessionError?.message}`);
    }

    console.log('✅ Found session:', session.id);

    // Set up real-time progress updates
    const updateProgress = async (stage: string, message: string, progress: number) => {
      await supabase
        .channel(`figmant-analysis-${sessionId}`)
        .send({
          type: 'broadcast',
          event: 'progress',
          payload: { stage, message, progress }
        });
    };

    try {
      // Step 1: Get session images
      await updateProgress('upload', 'Processing uploaded images...', 10);
      
      const { data: images, error: imagesError } = await supabase
        .from('figmant_session_images')
        .select('*')
        .eq('session_id', sessionId)
        .order('upload_order', { ascending: true });

      if (imagesError || !images || images.length === 0) {
        throw new Error('No images found for analysis');
      }

      console.log(`✅ Found ${images.length} images to analyze`);

      // Step 2: Google Vision API processing
      await updateProgress('vision', 'Detecting UI elements with Google Vision...', 30);
      
      const googleVisionApiKey = Deno.env.get('GOOGLE_VISION_API_KEY');
      if (!googleVisionApiKey) {
        throw new Error('Google Vision API key not configured');
      }

      const visionResults = [];
      for (const image of images) {
        try {
          console.log(`🔍 Processing vision for: ${image.file_name}`);
          
          // Get image URL
          const { data: urlData } = supabase.storage
            .from('analysis-images')
            .getPublicUrl(image.file_path);

          // Enhanced Google Vision API call
          const visionResponse = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${googleVisionApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requests: [{
                image: { source: { imageUri: urlData.publicUrl } },
                features: [
                  { type: 'LABEL_DETECTION', maxResults: 20 },
                  { type: 'TEXT_DETECTION' },
                  { type: 'OBJECT_LOCALIZATION', maxResults: 20 },
                  { type: 'IMAGE_PROPERTIES' },
                  { type: 'WEB_DETECTION', maxResults: 10 }
                ]
              }]
            })
          });

          if (!visionResponse.ok) {
            throw new Error(`Vision API error: ${visionResponse.status}`);
          }

          const visionData = await visionResponse.json();
          const result = visionData.responses[0];

          if (result.error) {
            throw new Error(`Vision API error: ${result.error.message}`);
          }

          // Enrich vision data with contextual understanding
          const enrichedVision = enrichVisionData({
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
            imageProperties: {
              dominantColors: result.imagePropertiesAnnotation?.dominantColors?.colors?.map((c: any) => 
                `rgb(${Math.round(c.color.red || 0)}, ${Math.round(c.color.green || 0)}, ${Math.round(c.color.blue || 0)})`
              ).slice(0, 5) || [],
              width: 1920,
              height: 1080
            },
            webDetection: result.webDetection || null
          });

          visionResults.push({
            image_id: image.id,
            file_name: image.file_name,
            vision_data: result,
            enriched_vision: enrichedVision
          });

          // Update image with enhanced vision data
          await supabase
            .from('figmant_session_images')
            .update({ 
              google_vision_data: result,
              // Store enriched vision data in new columns when we have them
            })
            .eq('id', image.id);

        } catch (error) {
          console.error(`Error processing image ${image.file_name}:`, error);
          visionResults.push({
            image_id: image.id,
            file_name: image.file_name,
            vision_data: {},
            enriched_vision: null,
            error: error.message
          });
        }
      }

      console.log('✅ Enhanced vision processing complete');

      // Step 3: Screen type detection using enhanced metadata
      await updateProgress('analysis', 'Detecting screen type and analyzing patterns...', 50);
      
      // Auto-detect screen type from vision data
      const allLabels = visionResults.flatMap(r => r.enriched_vision?.labels || []);
      const allText = visionResults.flatMap(r => r.vision_data.textAnnotations?.map((t: any) => t.description) || []);
      const screenType = detectScreenType(allLabels, allText);
      
      console.log('🎯 Detected screen type:', screenType);

      // Step 4: Enhanced Claude analysis with confidence scoring
      await updateProgress('analysis', 'Generating AI-powered UX insights with confidence scoring...', 70);
      
      const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY');
      if (!claudeApiKey) {
        throw new Error('Claude API key not configured');
      }

      // Build enhanced prompt with pattern awareness
      const enhancedPrompt = buildEnhancedPrompt({
        session,
        visionResults,
        screenType,
        metadata: metadata || {
          screen_name: session.title,
          platform: 'Web',
          screen_type: screenType,
          user_goal: 'Improve user experience'
        },
        designTokens: designTokens || getDefaultDesignTokens()
      });

      // Prepare image content for Claude
      const imageContent = [];
      for (const image of images) {
        try {
          const { data: urlData } = supabase.storage
            .from('analysis-images')
            .getPublicUrl(image.file_path);
          
          const imageResponse = await fetch(urlData.publicUrl);
          if (!imageResponse.ok) continue;
          
          const imageBuffer = await imageResponse.arrayBuffer();
          const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
          
          imageContent.push({
            type: "image",
            source: {
              type: "base64",
              media_type: "image/png",
              data: base64Image
            }
          });
        } catch (error) {
          console.error(`Error loading image for Claude:`, error);
        }
      }

      // Step 4.1: Multi-Model Analysis with Fallback Strategy (Phase 2.1)
      const analysisResult = await executeMultiModelAnalysis({
        enhancedPrompt,
        imageContent,
        claudeApiKey,
        sessionMetadata: {
          screenType,
          visionResults,
          metadata: metadata || {}
        }
      });
      
      const analysisText = analysisResult.content;

      if (!analysisResult.content) {
        throw new Error('No analysis content received from multi-model pipeline');
      }

      // Step 5: Parse and validate enhanced analysis
      await updateProgress('insights', 'Processing insights and calculating business impact...', 90);
      
      let parsedAnalysis;
      try {
        // Enhanced JSON parsing with validation
        const jsonMatch = analysisResult.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedAnalysis = JSON.parse(jsonMatch[0]);
          
          // Validate analysis response structure
          if (!validateAnalysisResponse(parsedAnalysis)) {
            throw new Error('Invalid analysis response format');
          }
        } else {
          throw new Error('No valid JSON found in analysis response');
        }
      } catch (error) {
        console.error('Failed to parse analysis JSON, using fallback:', error);
        parsedAnalysis = {
          screen_id: `screen-${Date.now()}`,
          screen_name: session.title,
          overall_score: 75,
          issues: [],
          strengths: ['Analysis completed with basic processing'],
          top_recommendations: ['Detailed analysis requires valid JSON response'],
          raw_analysis: analysisResult.content,
          model_used: analysisResult.modelUsed,
          model_confidence: analysisResult.confidenceScore
        };
      }

      // Step 6: Save enhanced results with Phase 2.1 multi-model tracking
      const { data: resultData, error: resultError } = await supabase
        .from('figmant_analysis_results')
        .insert({
          session_id: sessionId,
          user_id: session.user_id,
          claude_analysis: parsedAnalysis,
          google_vision_summary: {
            total_images: images.length,
            vision_results: visionResults,
            screen_type_detected: screenType
          },
          processing_time_ms: Date.now() - new Date(session.created_at).getTime(),
          // Enhanced Phase 1.4 + 2.1 fields
          pattern_violations: parsedAnalysis.pattern_coverage?.violated || [],
          confidence_metadata: {
            avg_confidence: calculateAverageConfidence(parsedAnalysis.issues || []),
            high_confidence_count: (parsedAnalysis.issues || []).filter((i: any) => i.confidence >= 0.8).length,
            model_confidence: analysisResult.confidenceScore,
            model_used: analysisResult.modelUsed
          },
          screen_type_detected: screenType,
          enhanced_business_metrics: {
            quick_wins: (parsedAnalysis.issues || []).filter((i: any) => 
              i.implementation?.effort === 'minutes' && i.severity !== 'improvement'
            ).length,
            conversion_critical: (parsedAnalysis.issues || []).filter((i: any) => 
              i.impact_scope === 'conversion' || i.impact_scope === 'task-completion'
            ).length
          },
          ai_model_used: analysisResult.modelUsed
        })
        .select()
        .single();

      if (resultError) {
        throw new Error(`Failed to save results: ${resultError.message}`);
      }

      // Update session with enhanced metadata
      await supabase
        .from('figmant_analysis_sessions')
        .update({ 
          status: 'completed',
          screen_detection_metadata: {
            detected_type: screenType,
            confidence: 0.8, // TODO: Implement proper confidence calculation
            labels_analyzed: allLabels.length,
            text_elements: allText.length
          },
          pattern_tracking_enabled: true,
          confidence_threshold: 0.7
        })
        .eq('id', sessionId);

      // Step 7: Complete with real-time notification
      await updateProgress('complete', 'Enhanced analysis complete with confidence scoring!', 100);

      console.log('✅ Enhanced Figmant analysis completed successfully');

      return new Response(
        JSON.stringify({
          success: true,
          result_id: resultData.id,
          session_id: sessionId,
          summary: {
            total_issues: parsedAnalysis.issues?.length || 0,
            critical_issues: (parsedAnalysis.issues || []).filter((i: any) => i.severity === 'critical').length,
            high_confidence_issues: (parsedAnalysis.issues || []).filter((i: any) => i.confidence >= 0.8).length,
            quick_wins: (parsedAnalysis.issues || []).filter((i: any) => i.implementation?.effort === 'minutes').length,
            overall_score: parsedAnalysis.overall_score || 0,
            screen_type: screenType,
            pattern_violations: parsedAnalysis.pattern_coverage?.violated?.length || 0,
            model_used: analysisResult.modelUsed,
            model_confidence: analysisResult.confidenceScore
          },
          message: 'Enhanced analysis completed with Phase 2.1 multi-model integration'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      // Send error to real-time channel
      await updateProgress('error', error.message, 0);
      throw error;
    }

  } catch (error) {
    console.error('❌ Enhanced analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Enhanced analysis failed'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Enhanced helper functions for Phase 1.4

function enrichVisionData(visionResponse: VisionResponse): EnrichedVisionData {
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
    primaryColors: visionResponse.imageProperties.dominantColors.slice(0, 3),
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

  return enriched;
}

function detectScreenType(visionLabels: string[], textContent: string[]): string {
  const screenTypePatterns = {
    'checkout': ['cart', 'total', 'payment', 'shipping', 'checkout', 'order'],
    'dashboard': ['metrics', 'analytics', 'chart', 'graph', 'statistics', 'overview'],
    'form': ['input', 'field', 'submit', 'required', 'email', 'password', 'register'],
    'landing': ['hero', 'cta', 'features', 'pricing', 'testimonial', 'get started'],
    'profile': ['profile', 'avatar', 'settings', 'account', 'preferences', 'bio'],
    'feed': ['posts', 'timeline', 'updates', 'comments', 'likes', 'share']
  };

  const allText = [...visionLabels, ...textContent].map(t => t.toLowerCase());
  let bestMatch = 'generic';
  let maxScore = 0;

  Object.entries(screenTypePatterns).forEach(([type, keywords]) => {
    const score = keywords.reduce((acc, keyword) => {
      return acc + allText.filter(text => text.includes(keyword)).length;
    }, 0);
    
    if (score > maxScore) {
      maxScore = score;
      bestMatch = type;
    }
  });

  return maxScore > 0 ? bestMatch : 'generic';
}

function buildEnhancedPrompt(context: any): string {
  const { session, visionResults, screenType, metadata, designTokens } = context;
  
  return `You are an expert Senior Principal UX Designer analyzing user interfaces with deep knowledge of design systems, accessibility standards, and conversion optimization.

ANALYSIS CONTEXT:
- Screen: ${metadata.screen_name} (${screenType})
- Platform: ${metadata.platform}
- User Goal: ${metadata.user_goal}
- Detected Elements: ${JSON.stringify(visionResults.flatMap((r: any) => r.enriched_vision?.labels || []).slice(0, 10))}
- Layout Type: ${visionResults[0]?.enriched_vision?.layoutType || 'unknown'}
- Text Density: ${visionResults[0]?.enriched_vision?.textDensity || 'unknown'}

ENHANCED ANALYSIS INSTRUCTIONS:
1. Analyze systematically at all levels (molecular → component → layout → flow)
2. For each issue, assess your confidence level (0.0-1.0)
3. Categorize impact scope precisely
4. Reference specific design patterns when violated
5. Consider platform-specific constraints

CONFIDENCE SCORING GUIDELINES:
- 1.0: Objective violation (contrast ratio, touch target size)
- 0.8-0.9: Clear best practice violation with data
- 0.6-0.7: Strong recommendation based on patterns
- 0.4-0.5: Subjective improvement suggestion

PATTERN AWARENESS:
Check for violations of: Progressive disclosure, Mobile touch targets, F-Pattern scanning, 
Gestalt principles, Fitts's Law, Hick's Law, WCAG 2.1 AA compliance

Return ONLY valid JSON matching this exact structure:
{
  "screen_id": "${metadata.screen_id || 'screen-' + Date.now()}",
  "screen_name": "${metadata.screen_name}",
  "overall_score": <0-100 based on issues found>,
  "issues": [
    {
      "id": "issue-<sequential-number>",
      "level": "molecular" | "component" | "layout" | "flow",
      "severity": "critical" | "warning" | "improvement",
      "category": "accessibility" | "usability" | "visual" | "content" | "performance",
      "confidence": <0.0-1.0>,
      "impact_scope": "user-trust" | "task-completion" | "conversion" | "readability" | "performance" | "aesthetic",
      "element": {
        "type": "<element-type>",
        "location": { "x": <x>, "y": <y>, "width": <w>, "height": <h> }
      },
      "description": "<specific-issue>",
      "impact": "<user-impact>",
      "suggested_fix": "<concrete-solution>",
      "implementation": {
        "effort": "minutes" | "hours" | "days",
        "code_snippet": "<code-suggestion>",
        "design_guidance": "<visual-guidance>"
      },
      "violated_patterns": ["<pattern-1>"],
      "rationale": ["<why-this-matters>"],
      "metrics": {
        "affects_users": "<percentage>",
        "potential_improvement": "<measurable-outcome>"
      }
    }
  ],
  "strengths": ["<what-works-well>"],
  "top_recommendations": ["<priority-fix-1>", "<priority-fix-2>", "<priority-fix-3>"],
  "pattern_coverage": {
    "followed": ["<pattern-1>"],
    "violated": ["<pattern-2>"]
  }
}`;
}

function validateAnalysisResponse(response: any): boolean {
  const requiredFields = ['screen_id', 'screen_name', 'overall_score', 'issues', 'strengths', 'top_recommendations'];
  const hasRequiredFields = requiredFields.every(field => field in response);
  if (!hasRequiredFields) return false;
  
  if (!Array.isArray(response.issues)) return false;
  
  return response.issues.every((issue: any) => {
    const issueFields = ['id', 'level', 'severity', 'category', 'description', 'impact', 'suggested_fix'];
    const hasFields = issueFields.every(field => field in issue);
    const hasValidConfidence = !issue.confidence || (issue.confidence >= 0 && issue.confidence <= 1);
    return hasFields && hasValidConfidence;
  });
}

function calculateAverageConfidence(issues: any[]): number {
  if (!issues.length) return 0;
  const validConfidences = issues.filter(i => typeof i.confidence === 'number' && i.confidence >= 0 && i.confidence <= 1);
  if (!validConfidences.length) return 0.7; // Default confidence
  return validConfidences.reduce((sum, i) => sum + i.confidence, 0) / validConfidences.length;
}

function getDefaultDesignTokens(): any {
  return {
    colors: {
      primary: '#0F766E',
      secondary: '#14B8A6',
      error: '#EF4444',
      warning: '#F59E0B',
      success: '#10B981'
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      sizes: { base: '16px', lg: '18px', xl: '20px' }
    },
    spacing: { unit: 8, scale: [0, 4, 8, 12, 16, 20, 24, 32] }
  };
}

// Phase 2.1: Multi-Model Analysis Integration
async function executeMultiModelAnalysis(params: {
  enhancedPrompt: string;
  imageContent: any[];
  claudeApiKey: string;
  sessionMetadata: any;
}): Promise<{ content: string; modelUsed: string; confidenceScore: number }> {
  const { enhancedPrompt, imageContent, claudeApiKey, sessionMetadata } = params;
  
  // Model priority list with fallback strategy
  const modelFallbackChain = [
    { model: 'claude-opus-4-20250514', maxTokens: 4000, temperature: 0.2 },
    { model: 'claude-sonnet-4-20250514', maxTokens: 3500, temperature: 0.3 },
    { model: 'claude-3-5-sonnet-20241022', maxTokens: 3000, temperature: 0.3 }
  ];

  for (const modelConfig of modelFallbackChain) {
    try {
      console.log(`🤖 Attempting analysis with ${modelConfig.model}...`);
      
      const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: modelConfig.model,
          max_tokens: modelConfig.maxTokens,
          temperature: modelConfig.temperature,
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: enhancedPrompt },
              ...imageContent
            ]
          }]
        })
      });

      if (!claudeResponse.ok) {
        console.warn(`❌ ${modelConfig.model} failed with status ${claudeResponse.status}, trying next model...`);
        continue;
      }

      const claudeData = await claudeResponse.json();
      const analysisText = claudeData.content?.[0]?.text;

      if (!analysisText) {
        console.warn(`❌ ${modelConfig.model} returned empty content, trying next model...`);
        continue;
      }

      // Calculate confidence score based on model and response quality
      const confidenceScore = calculateModelConfidence(modelConfig.model, analysisText, sessionMetadata);
      
      console.log(`✅ Analysis successful with ${modelConfig.model} (confidence: ${confidenceScore})`);
      
      return {
        content: analysisText,
        modelUsed: modelConfig.model,
        confidenceScore
      };

    } catch (error) {
      console.warn(`❌ ${modelConfig.model} error:`, error.message);
      continue;
    }
  }

  throw new Error('All models failed - unable to complete analysis');
}

function calculateModelConfidence(model: string, content: string, metadata: any): number {
  let baseConfidence = 0.7;
  
  // Model-specific confidence adjustments
  if (model.includes('opus-4')) baseConfidence = 0.9;
  else if (model.includes('sonnet-4')) baseConfidence = 0.85;
  else if (model.includes('sonnet-3-5')) baseConfidence = 0.8;
  
  // Content quality adjustments
  if (content.length > 2000) baseConfidence += 0.05;
  if (content.includes('confidence')) baseConfidence += 0.03;
  if (content.includes('"issues"') && content.includes('"recommendations"')) baseConfidence += 0.05;
  
  // Screen type match adjustments
  if (metadata.screenType && content.toLowerCase().includes(metadata.screenType)) {
    baseConfidence += 0.02;
  }
  
  return Math.min(baseConfidence, 0.95);
}