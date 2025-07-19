import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { sessionId, title, industry, designType, businessGoals } = await req.json();

    console.log("Creating analysis session:", { sessionId, title, industry, designType });

    // Create new analysis session
    const { data: session, error: sessionError } = await supabaseClient
      .from("figmant_analysis_sessions")
      .insert({
        id: sessionId,
        user_id: userData.user.id,
        title: title || "New UX Analysis",
        industry,
        design_type: designType,
        business_goals: businessGoals || [],
        status: 'draft'
      })
      .select()
      .single();

    if (sessionError) {
      console.error("Session creation error:", sessionError);
      throw new Error(`Failed to create session: ${sessionError.message}`);
    }

    console.log("✅ Analysis session created:", session.id);

    return new Response(JSON.stringify({ 
      success: true, 
      session: {
        id: session.id,
        title: session.title,
        status: session.status,
        industry: session.industry,
        design_type: session.design_type,
        business_goals: session.business_goals
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Create session error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});