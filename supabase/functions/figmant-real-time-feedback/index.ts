import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RealTimeFeedbackRequest {
  sessionId: string;
  selectionData?: any;
  designTokens?: any;
  annotationRequest?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Create service role client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false
        }
      }
    );

    // Verify the user
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.error('🔐 Authentication failed:', userError);
      return new Response(JSON.stringify({ 
        code: 401,
        message: 'Invalid JWT'
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userId = userData.user.id;
    console.log('🔄 Real-time feedback request from user:', userId);

    // Parse request body
    const body: RealTimeFeedbackRequest = await req.json();
    
    if (!body.sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify session belongs to user
    const { data: sessionData, error: sessionError } = await supabase
      .from('figmant_analysis_sessions')
      .select('*')
      .eq('id', body.sessionId)
      .eq('user_id', userId)
      .single();

    if (sessionError || !sessionData) {
      return new Response(
        JSON.stringify({ error: 'Session not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let feedbackData = {};

    // Generate real-time feedback based on request type
    if (body.selectionData) {
      feedbackData = await generateSelectionFeedback(body.selectionData);
    }

    if (body.designTokens) {
      const tokenFeedback = await analyzeDesignTokens(body.designTokens);
      feedbackData = { ...feedbackData, ...tokenFeedback };
    }

    if (body.annotationRequest) {
      const annotations = await generateRealTimeAnnotations(body.annotationRequest);
      feedbackData = { ...feedbackData, annotations };
    }

    // Store real-time feedback in session metadata
    await supabase
      .from('figmant_analysis_sessions')
      .update({
        screen_detection_metadata: {
          ...sessionData.screen_detection_metadata,
          real_time_feedback: feedbackData,
          last_feedback_update: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', body.sessionId);

    console.log('✅ Real-time feedback generated for session:', body.sessionId);

    return new Response(
      JSON.stringify({
        success: true,
        sessionId: body.sessionId,
        feedback: feedbackData,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in figmant-real-time-feedback:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Generate feedback for selection changes
async function generateSelectionFeedback(selectionData: any): Promise<any> {
  const feedback = {
    selectionCount: selectionData.frames?.length || 0,
    suggestions: [],
    warnings: [],
    insights: []
  };

  if (feedback.selectionCount === 0) {
    feedback.suggestions.push('Select frames, components, or groups to analyze');
    return feedback;
  }

  if (feedback.selectionCount > 10) {
    feedback.warnings.push('Large selection may impact analysis performance');
  }

  // Analyze selection for real-time insights
  if (selectionData.frames) {
    const frameSizes = selectionData.frames.map(f => ({ width: f.width, height: f.height }));
    const uniqueSizes = new Set(frameSizes.map(s => `${s.width}x${s.height}`));
    
    if (uniqueSizes.size > 1) {
      feedback.insights.push(`${uniqueSizes.size} different screen sizes detected`);
    }

    // Check for mobile-first design
    const mobileFrames = frameSizes.filter(s => s.width <= 480).length;
    if (mobileFrames > 0) {
      feedback.insights.push('Mobile frames detected - mobile-first analysis recommended');
    }
  }

  return feedback;
}

// Analyze design tokens for real-time feedback
async function analyzeDesignTokens(designTokens: any): Promise<any> {
  const analysis = {
    tokenQuality: 'good',
    recommendations: [],
    violations: [],
    score: 85
  };

  // Analyze color palette
  if (designTokens.colors && designTokens.colors.length > 15) {
    analysis.violations.push('Color palette too large (>15 colors)');
    analysis.score -= 10;
  }

  // Analyze typography
  if (designTokens.typography && designTokens.typography.length > 8) {
    analysis.violations.push('Too many typography variants (>8)');
    analysis.score -= 10;
  }

  // Check for design system consistency
  if (designTokens.designSystemViolations && designTokens.designSystemViolations.length > 0) {
    analysis.violations.push(`${designTokens.designSystemViolations.length} design system violations found`);
    analysis.score -= (designTokens.designSystemViolations.length * 5);
  }

  // Generate recommendations
  if (designTokens.componentPatterns && designTokens.componentPatterns.buttonVariants) {
    const buttonCount = designTokens.componentPatterns.buttonVariants.length;
    if (buttonCount < 3) {
      analysis.recommendations.push('Consider adding more button variants for better consistency');
    }
  }

  // Set quality based on score
  if (analysis.score >= 80) analysis.tokenQuality = 'excellent';
  else if (analysis.score >= 60) analysis.tokenQuality = 'good';
  else if (analysis.score >= 40) analysis.tokenQuality = 'fair';
  else analysis.tokenQuality = 'poor';

  return analysis;
}

// Generate real-time annotations
async function generateRealTimeAnnotations(annotationRequest: any): Promise<any[]> {
  const annotations = [];

  // Generate contextual annotations based on selection
  if (annotationRequest.bounds) {
    annotations.push({
      id: crypto.randomUUID(),
      type: 'info',
      message: 'Selected element ready for analysis',
      position: {
        x: annotationRequest.bounds.x,
        y: annotationRequest.bounds.y
      },
      confidence: 0.9,
      timestamp: new Date().toISOString()
    });
  }

  // Add pattern-based annotations
  if (annotationRequest.patterns) {
    annotationRequest.patterns.forEach((pattern, index) => {
      annotations.push({
        id: crypto.randomUUID(),
        type: pattern.severity || 'warning',
        message: pattern.message || 'Pattern detected',
        position: pattern.position || { x: 0, y: 0 },
        confidence: pattern.confidence || 0.7,
        timestamp: new Date().toISOString()
      });
    });
  }

  return annotations;
}