
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Authentication failed");

    const { sessionId } = await req.json();

    console.log("🧠 Starting Claude analysis for session:", sessionId);

    // Check analysis limit
    const canAnalyze = await supabaseClient.rpc('check_analysis_limit', { 
      p_user_id: userData.user.id 
    });

    if (!canAnalyze.data) {
      throw new Error("Analysis limit reached. Please upgrade your plan.");
    }

    // Get session and images
    const { data: session, error: sessionError } = await supabaseClient
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

    // Update session status
    await supabaseClient
      .from("figmant_analysis_sessions")
      .update({ status: 'processing' })
      .eq("id", sessionId);

    // Prepare analysis context
    const analysisContext = {
      industry: session.industry || "Not specified",
      designType: session.design_type || "UI/UX Design",
      businessGoals: session.business_goals || [],
      imageCount: session.figmant_session_images.length,
      visionData: session.figmant_session_images
        .filter(img => img.google_vision_data)
        .map(img => ({
          fileName: img.file_name,
          visionData: img.google_vision_data
        }))
    };

    // Generate expert-level analysis prompt
    const analysisPrompt = `You are a Senior Principal UX Designer with 15+ years of experience at top tech companies (Google, Apple, Microsoft, Airbnb). You're analyzing UI/UX designs with the following context:

ANALYSIS CONTEXT:
- Industry: ${analysisContext.industry}
- Design Type: ${analysisContext.designType}
- Business Goals: ${analysisContext.businessGoals.join(', ') || 'Not specified'}
- Number of Images: ${analysisContext.imageCount}

TECHNICAL AUDIT DATA:
${JSON.stringify(analysisContext.visionData, null, 2)}

Provide a comprehensive UX analysis in JSON format with the following structure:

{
  "executiveSummary": "2-3 sentence overview of the design quality and key insights",
  "overallScore": 85, // 0-100 score
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
  },
  "conversionOptimization": {
    "cro_score": 80,
    "opportunities": ["Specific CRO improvements"],
    "abTestSuggestions": ["A/B test ideas with expected impact"]
  },
  "implementationRoadmap": {
    "phase1": { "duration": "1-2 weeks", "items": ["Immediate fixes"] },
    "phase2": { "duration": "3-4 weeks", "items": ["Strategic improvements"] },
    "phase3": { "duration": "1-2 months", "items": ["Long-term enhancements"] }
  },
  "competitorBenchmarks": ["Industry-specific best practices and comparisons"],
  "metrics": {
    "timeToValue": "How quickly users can achieve their goals",
    "cognitiveLoad": "Mental effort required to use the interface",
    "taskCompletion": "Estimated task completion rate"
  }
}

Focus on:
1. Actionable insights over generic advice
2. Specific implementation steps with time estimates
3. Business impact quantification where possible
4. Mobile responsiveness and cross-platform considerations
5. Conversion optimization opportunities
6. Accessibility compliance (WCAG 2.1 AA minimum)

Be direct, specific, and solution-focused. Every recommendation should be immediately implementable.`;

    // Call Claude Sonnet 4 API with updated model
    console.log("🤖 Calling Claude Sonnet 4 API...");
    
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022", // Updated to working model
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
      claudeAnalysis = JSON.parse(analysisContent);
    } catch (parseError) {
      console.error("Failed to parse Claude response as JSON:", parseError);
      // Fallback: create structured response from text
      claudeAnalysis = {
        executiveSummary: "Analysis completed - see detailed findings below",
        overallScore: 75,
        criticalIssues: [],
        recommendations: [],
        rawAnalysis: analysisContent
      };
    }

    const processingTime = Date.now() - startTime;

    // Save analysis results
    const { data: analysisResult, error: resultError } = await supabaseClient
      .from("figmant_analysis_results")
      .insert({
        session_id: sessionId,
        user_id: userData.user.id,
        claude_analysis: claudeAnalysis,
        google_vision_summary: {
          totalImages: analysisContext.imageCount,
          processedImages: analysisContext.visionData.length
        },
        processing_time_ms: processingTime,
        ai_model_used: 'claude-3-5-sonnet-20241022'
      })
      .select()
      .single();

    if (resultError) {
      console.error("Failed to save analysis results:", resultError);
      throw new Error(`Failed to save results: ${resultError.message}`);
    }

    // Update session status and increment usage
    await Promise.all([
      supabaseClient
        .from("figmant_analysis_sessions")
        .update({ status: 'completed' })
        .eq("id", sessionId),
      
      supabaseClient.rpc('increment_analysis_usage', { 
        p_user_id: userData.user.id 
      }),

      supabaseClient
        .from("credit_usage")
        .insert({
          user_id: userData.user.id,
          session_id: sessionId,
          credits_consumed: 1,
          operation_type: 'ux_analysis'
        })
    ]);

    console.log(`✅ Analysis completed in ${processingTime}ms`);

    return new Response(JSON.stringify({ 
      success: true, 
      analysis: claudeAnalysis,
      processingTime,
      sessionId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Analysis error:", error);
    
    // Update session status to failed
    try {
      const { sessionId } = await req.json();
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      
      await supabaseClient
        .from("figmant_analysis_sessions")
        .update({ status: 'failed' })
        .eq("id", sessionId);
    } catch (updateError) {
      console.error("Failed to update session status:", updateError);
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
