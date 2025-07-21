import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnnotationRequest {
  sessionId: string;
  frameId: string;
  annotationType: 'issue' | 'suggestion' | 'insight' | 'pattern';
  position: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: any;
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
    console.log('📍 Annotation creation request from user:', userId);

    // Parse request body
    const body: AnnotationRequest = await req.json();
    
    if (!body.sessionId || !body.frameId || !body.message) {
      return new Response(
        JSON.stringify({ error: 'sessionId, frameId, and message are required' }),
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

    // Create annotation data
    const annotationData = {
      id: crypto.randomUUID(),
      type: body.annotationType,
      severity: body.severity,
      message: body.message,
      position: body.position,
      frameId: body.frameId,
      confidence: body.metadata?.confidence || 0.8,
      created_at: new Date().toISOString(),
      metadata: {
        ...body.metadata,
        created_by: 'figma_plugin',
        plugin_version: '4.1',
        auto_generated: false
      }
    };

    // Get existing results or create new one
    let { data: resultsData, error: resultsError } = await supabase
      .from('figmant_analysis_results')
      .select('*')
      .eq('session_id', body.sessionId)
      .single();

    if (resultsError && resultsError.code === 'PGRST116') {
      // Create new results record
      const { data: newResults, error: createError } = await supabase
        .from('figmant_analysis_results')
        .insert({
          session_id: body.sessionId,
          user_id: userId,
          claude_analysis: {},
          annotations: [annotationData],
          enhanced_business_metrics: {},
          processing_time_ms: 0,
          ai_model_used: 'figma_plugin_4.1'
        })
        .select()
        .single();

      if (createError) {
        throw new Error('Failed to create analysis results record');
      }
      resultsData = newResults;
    } else if (resultsError) {
      throw new Error('Failed to retrieve analysis results');
    } else {
      // Update existing results with new annotation
      const existingAnnotations = resultsData.annotations || [];
      const updatedAnnotations = [...existingAnnotations, annotationData];

      const { error: updateError } = await supabase
        .from('figmant_analysis_results')
        .update({
          annotations: updatedAnnotations,
          updated_at: new Date().toISOString()
        })
        .eq('id', resultsData.id);

      if (updateError) {
        throw new Error('Failed to update annotations');
      }
    }

    // Update session with annotation metadata
    const updatedMetadata = {
      ...sessionData.screen_detection_metadata,
      annotation_count: (sessionData.screen_detection_metadata?.annotation_count || 0) + 1,
      last_annotation: new Date().toISOString()
    };

    await supabase
      .from('figmant_analysis_sessions')
      .update({
        screen_detection_metadata: updatedMetadata,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.sessionId);

    console.log('✅ Annotation created for session:', body.sessionId);

    return new Response(
      JSON.stringify({
        success: true,
        sessionId: body.sessionId,
        annotation: annotationData,
        totalAnnotations: (sessionData.screen_detection_metadata?.annotation_count || 0) + 1
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in figmant-annotation-creator:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});