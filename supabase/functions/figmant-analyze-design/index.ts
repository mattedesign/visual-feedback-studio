import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

console.log('🎨 Figmant Analysis Pipeline - Comprehensive UX Analysis v3.1');

serve(async (req) => {
  console.log('🔴 DEBUG_FIGMANT: Function entry point reached');
  console.log('🔴 DEBUG_FIGMANT: Request method:', req.method);

  if (req.method === "OPTIONS") {
    console.log('🔴 DEBUG_FIGMANT: Returning CORS response');
    return new Response(null, { headers: corsHeaders });
  }

  let requestBody: any;
  let sessionId: string;
  const startTime = Date.now();

  try {
    console.log('🔴 DEBUG_FIGMANT: Starting analysis pipeline');

    // Environment validation
    const requiredEnvVars = {
      SUPABASE_URL: Deno.env.get('SUPABASE_URL'),
      SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      ANTHROPIC_API_KEY: Deno.env.get('ANTHROPIC_API_KEY'),
      GOOGLE_VISION_API_KEY: Deno.env.get('GOOGLE_VISION_API_KEY')
    };

    console.log('🔴 DEBUG_FIGMANT: Environment check:', {
      hasSupabaseUrl: !!requiredEnvVars.SUPABASE_URL,
      hasServiceKey: !!requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY,
      hasAnthropicKey: !!requiredEnvVars.ANTHROPIC_API_KEY,
      hasGoogleVisionKey: !!requiredEnvVars.GOOGLE_VISION_API_KEY,
      timestamp: new Date().toISOString()
    });

    for (const [key, value] of Object.entries(requiredEnvVars)) {
      if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }

    // Parse request body
    try {
      requestBody = await req.json();
      sessionId = requestBody.sessionId;
      console.log('📥 Received request:', {
        sessionId: sessionId?.substring(0, 8),
        timestamp: new Date().toISOString()
      });
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request body - must be valid JSON',
          details: parseError.message,
          stage: 'request_parsing'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!sessionId) {
      console.error('❌ Missing sessionId in request');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'sessionId is required',
          stage: 'validation'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      requiredEnvVars.SUPABASE_URL!,
      requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY!,
      {
        db: { schema: 'public' },
        global: {
          headers: { 'x-client-info': 'figmant-analyzer@3.1' }
        }
      }
    );

    console.log('🔗 Testing database connection...');
    const { error: connectionTest } = await supabase
      .from('figmant_analysis_sessions')
      .select('id')
      .limit(1);

    if (connectionTest) {
      throw new Error(`Database connection failed: ${connectionTest.message}`);
    }

    // Get session with authentication check
    console.log('📋 Fetching session details...');
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("Authentication failed");
    }

    const { data: session, error: sessionError } = await supabase
      .from("figmant_analysis_sessions")
      .select(`
        *,
        figmant_session_images (*)
      `)
      .eq("id", sessionId)
      .eq("user_id", userData.user.id)
      .single();

    if (sessionError || !session) {
      throw new Error("Session not found or access denied");
    }

    if (!session.figmant_session_images?.length) {
      throw new Error("No images found for analysis");
    }

    console.log(`✅ Found session with ${session.figmant_session_images.length} images`);

    // Check analysis limit
    const { data: canAnalyze, error: limitError } = await supabase.rpc('check_analysis_limit', {
      p_user_id: userData.user.id
    });

    if (limitError) {
      console.error("Error checking analysis limit:", limitError);
      throw new Error("Failed to check analysis limit");
    }

    if (!canAnalyze) {
      throw new Error("Analysis limit reached. Please upgrade your plan.");
    }

    // Update session status to processing
    await supabase
      .from("figmant_analysis_sessions")
      .update({ status: 'processing' })
      .eq("id", sessionId);

    console.log(`📊 Processing ${session.figmant_session_images.length} images with Google Vision...`);

    // Process images with Google Vision API
    const visionResults = [];
    for (const image of session.figmant_session_images) {
      console.log(`🔍 Analyzing image: ${image.file_name}`);

      try {
        // Get public URL for the image
        const { data: urlData } = supabase.storage
          .from('analysis-images')
          .getPublicUrl(image.file_path);

        // Call Google Vision API
        const visionResponse = await fetch(
          `https://vision.googleapis.com/v1/images:annotate?key=${requiredEnvVars.GOOGLE_VISION_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requests: [{
                image: { source: { imageUri: urlData.publicUrl } },
                features: [
                  { type: 'TEXT_DETECTION', maxResults: 50 },
                  { type: 'LABEL_DETECTION', maxResults: 20 },
                  { type: 'IMAGE_PROPERTIES' },
                  { type: 'OBJECT_LOCALIZATION', maxResults: 20 },
                  { type: 'WEB_DETECTION', maxResults: 10 }
                ]
              }]
            })
          }
        );

        if (visionResponse.ok) {
          const visionData = await visionResponse.json();
          const analysisData = visionData.responses?.[0] || {};

          // Update image with Google Vision data
          await supabase
            .from("figmant_session_images")
            .update({ google_vision_data: analysisData })
            .eq("id", image.id);

          visionResults.push({
            fileName: image.file_name,
            visionData: analysisData
          });

          console.log(`✅ Vision analysis completed for ${image.file_name}`);
        } else {
          console.warn(`⚠️ Vision analysis failed for ${image.file_name}: ${visionResponse.status}`);
          visionResults.push({
            fileName: image.file_name,
            visionData: {},
            error: `Vision API error: ${visionResponse.status}`
          });
        }
      } catch (visionError) {
        console.error(`❌ Vision processing error for ${image.file_name}:`, visionError);
        visionResults.push({
          fileName: image.file_name,
          visionData: {},
          error: visionError.message
        });
      }
    }

    // Prepare comprehensive analysis context
    const analysisContext = {
      industry: session.industry || "Not specified",
      designType: session.design_type || "UI/UX Design",
      businessGoals: session.business_goals || [],
      imageCount: session.figmant_session_images.length,
      visionData: visionResults
    };

    console.log('🤖 Calling Claude Sonnet 4 for comprehensive analysis...');

    // Generate expert-level analysis prompt
    const analysisPrompt = `You are a Senior Principal UX Designer with 15+ years of experience at top tech companies (Google, Apple, Microsoft, Airbnb). You're analyzing UI/UX designs with the following context:

ANALYSIS CONTEXT:
- Industry: ${analysisContext.industry}
- Design Type: ${analysisContext.designType}
- Business Goals: ${analysisContext.businessGoals.join(', ') || 'Not specified'}
- Number of Images: ${analysisContext.imageCount}

TECHNICAL VISION DATA:
${JSON.stringify(analysisContext.visionData, null, 2)}

Provide a comprehensive UX analysis in JSON format with this structure:

{
  "executiveSummary": "2-3 sentence overview of the design quality and key insights",
  "overallScore": 85,
  "criticalIssues": [
    {
      "severity": "critical|high|medium|low",
      "category": "Accessibility|Visual Hierarchy|Conversion|Performance|Usability",
      "issue": "Specific problem description",
      "impact": "How this affects users and business metrics",
      "solution": "Exact implementation steps to fix",
      "implementationTime": "2 hours|1 day|3 days|1 week",
      "priority": 1
    }
  ],
  "recommendations": [
    {
      "category": "Quick Wins|Strategic|Long-term",
      "title": "Clear, actionable recommendation title",
      "description": "Detailed implementation guidance",
      "expectedImpact": "Measurable business/UX improvement",
      "effort": "Low|Medium|High",
      "timeline": "1 week|2 weeks|1 month"
    }
  ],
  "accessibilityAudit": {
    "score": 75,
    "wcagCompliance": "AA|AAA|Non-compliant",
    "issues": ["List of specific WCAG violations"],
    "improvements": ["Specific accessibility enhancements"]
  }
}

Focus on actionable insights with specific implementation steps and business impact.`;

    // Call Claude Sonnet 4 API
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": requiredEnvVars.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: analysisPrompt
        }],
        temperature: 0.3
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error("Claude API error:", errorText);
      throw new Error(`Claude API failed: ${claudeResponse.status} ${errorText}`);
    }

    const claudeResult = await claudeResponse.json();
    const analysisContent = claudeResult.content[0].text;

    // Parse Claude's JSON response
    let claudeAnalysis;
    try {
      const jsonMatch = analysisContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        claudeAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        claudeAnalysis = {
          executiveSummary: "Analysis completed - see detailed findings below",
          overallScore: 75,
          criticalIssues: [],
          recommendations: [],
          rawAnalysis: analysisContent
        };
      }
    } catch (parseError) {
      console.error("Failed to parse Claude response as JSON:", parseError);
      claudeAnalysis = {
        executiveSummary: "Analysis completed - see detailed findings below",
        overallScore: 75,
        criticalIssues: [],
        recommendations: [],
        rawAnalysis: analysisContent
      };
    }

    const processingTime = Date.now() - startTime;

    console.log('💾 Saving analysis results...');

    // Save analysis results
    const { data: analysisResult, error: resultError } = await supabase
      .from("figmant_analysis_results")
      .insert({
        session_id: sessionId,
        user_id: userData.user.id,
        claude_analysis: claudeAnalysis,
        google_vision_summary: {
          totalImages: analysisContext.imageCount,
          processedImages: visionResults.length,
          visionResults: visionResults
        },
        processing_time_ms: processingTime,
        ai_model_used: 'claude-sonnet-4-20250514'
      })
      .select()
      .single();

    if (resultError) {
      console.error("Failed to save analysis results:", resultError);
      throw new Error(`Failed to save results: ${resultError.message}`);
    }

    // Update session status and increment usage
    await Promise.all([
      supabase
        .from("figmant_analysis_sessions")
        .update({ status: 'completed' })
        .eq("id", sessionId),

      supabase.rpc('increment_analysis_usage', {
        p_user_id: userData.user.id
      }),

      supabase
        .from("credit_usage")
        .insert({
          user_id: userData.user.id,
          session_id: sessionId,
          credits_consumed: 1,
          operation_type: 'ux_analysis'
        })
    ]);

    console.log(`✅ Analysis completed successfully in ${processingTime}ms`);

    return new Response(JSON.stringify({
      success: true,
      analysis: claudeAnalysis,
      processingTime,
      sessionId,
      resultId: analysisResult.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Analysis error:", error);

    // Update session status to failed if we have sessionId
    if (sessionId) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        await supabase
          .from("figmant_analysis_sessions")
          .update({ status: 'failed' })
          .eq("id", sessionId);
      } catch (updateError) {
        console.error("Failed to update session status:", updateError);
      }
    }

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stage: 'analysis_pipeline'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});