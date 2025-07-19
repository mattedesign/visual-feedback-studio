import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

console.log('🎨 Figmant Analysis Pipeline - Starting...');

serve(async (req) => {
  console.log('🔴 DEBUG_FIGMANT: Function called');

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔴 DEBUG_FIGMANT: Processing request...');
    
    const requiredEnvVars = {
      SUPABASE_URL: Deno.env.get('SUPABASE_URL'),
      SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      ANTHROPIC_API_KEY: Deno.env.get('ANTHROPIC_API_KEY'),
      GOOGLE_VISION_API_KEY: Deno.env.get('GOOGLE_VISION_API_KEY')
    };

    console.log('🔴 Environment check:', {
      hasSupabaseUrl: !!requiredEnvVars.SUPABASE_URL,
      hasServiceKey: !!requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY,
      hasAnthropicKey: !!requiredEnvVars.ANTHROPIC_API_KEY,
      hasGoogleVisionKey: !!requiredEnvVars.GOOGLE_VISION_API_KEY
    });

    // Check for missing environment variables
    const missingVars = Object.entries(requiredEnvVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      console.error('❌ Missing environment variables:', missingVars);
      return new Response(JSON.stringify({
        success: false,
        error: `Missing environment variables: ${missingVars.join(', ')}`,
        stage: 'environment_validation'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const requestBody = await req.json();
    const sessionId = requestBody.sessionId;

    if (!sessionId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'sessionId is required',
        stage: 'validation'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🔴 Processing session:', sessionId.substring(0, 8));

    // Initialize Supabase
    const supabase = createClient(
      requiredEnvVars.SUPABASE_URL!,
      requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Test basic functionality
    console.log('🔗 Testing database connection...');
    const { error: testError } = await supabase
      .from('figmant_analysis_sessions')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Database test failed:', testError);
      return new Response(JSON.stringify({
        success: false,
        error: `Database connection failed: ${testError.message}`,
        stage: 'database_test'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Basic tests passed');

    // Return a success response for now
    return new Response(JSON.stringify({
      success: true,
      message: 'Function is working, but analysis pipeline is not yet implemented',
      sessionId: sessionId,
      stage: 'basic_test'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stage: 'general_error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});