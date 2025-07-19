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

    console.log("🔍 Checking subscription for user:", userData.user.id);

    // Get or create subscriber record
    let { data: subscriber, error: subscriberError } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("user_id", userData.user.id)
      .single();

    if (subscriberError && subscriberError.code === 'PGRST116') {
      // Create new subscriber record
      const { data: newSubscriber, error: createError } = await supabaseClient
        .from("subscribers")
        .insert({
          user_id: userData.user.id,
          email: userData.user.email!,
          subscription_tier: 'trial',
          subscribed: false,
          analyses_used: 0,
          analyses_limit: 3
        })
        .select()
        .single();

      if (createError) {
        console.error("Failed to create subscriber:", createError);
        throw new Error("Failed to create subscriber record");
      }

      subscriber = newSubscriber;
      console.log("✅ Created new trial subscriber");
    }

    if (!subscriber) {
      throw new Error("Failed to retrieve subscriber data");
    }

    console.log("📊 Subscription status:", {
      tier: subscriber.subscription_tier,
      subscribed: subscriber.subscribed,
      used: subscriber.analyses_used,
      limit: subscriber.analyses_limit
    });

    return new Response(JSON.stringify({ 
      success: true,
      subscription: {
        tier: subscriber.subscription_tier,
        subscribed: subscriber.subscribed,
        analysesUsed: subscriber.analyses_used,
        analysesLimit: subscriber.analyses_limit,
        subscriptionEnd: subscriber.subscription_end,
        canAnalyze: subscriber.analyses_used < subscriber.analyses_limit
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Check subscription error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});